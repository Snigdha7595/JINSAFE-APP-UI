"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import { SelectOptions } from "@/components/interfaces";
import { APPIMAGES, emptySelector } from "@/config/config";
import { serverRequest } from "@/services/getServerSideRender";
import {
  DOWNLOAD_FILE,
  FETCH_DEPARTMENTS,
  FETCH_UNITS,
  RECOMMENDATION_HISTORY,
  RECOMMENDATION_TRACKER,
} from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { toast, ToastContainer } from "react-toastify";
import {
  RECOMMENDATION_FORM,
  RECOMMENDATION_REVIEW_HOD,
  RECOMMENDATION_REVIEW_ED,
  APP_URL,
} from "@/config/constant";
import { number } from "yup";
import RecommendationForm from "./Form/RecommendationForm";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UserRole {
  unitId: string;
  departmentId: number;
  userRole: string;
}

interface UserData {
  jsplid: string;
  sub: string;
  name: string;
  email: string;
  empUnit: string;
  empDepartment: string;
  userRoles: UserRole[];
  [key: string]: any;
}

interface DraftRecommendation {
  objectId: string;
  id: string;
  recommendationDescription: string;
  recommendationType: string;
  createdDate: string;
  source: string;
  plantName: string;
  locationName: string;
  [key: string]: any;
}

interface DepartmentData {
  departmentid: string | number;
  departmentname: string;
  [key: string]: any;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "-";
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "-";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${d}-${m}-${date.getFullYear()}`;
  } catch {
    return "-";
  }
};

const formatIndianCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 10_000_000) return `${sign}₹ ${(abs / 10_000_000).toFixed(2)} Cr`;
  if (abs >= 100_000) return `${sign}₹ ${(abs / 100_000).toFixed(2)} Lac`;
  if (abs >= 1_000) return `${sign}₹ ${(abs / 1_000).toFixed(2)} K`;
  return `${sign}₹ ${abs.toLocaleString("en-IN")}`;
};

const formatCrores = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "-";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return "-";
  if(num<10000000){
    return `₹ ${num.toLocaleString("en-IN")}`;
  }else{
    const res = num/100000000;
    return `₹ ${res.toFixed(2)} Cr`;
  }
};

// Add this helper function after your existing helpers
const getStatusBadge = (status: string) => {
  const statusConfigs: Record<string, { label: string; }> = {
    "Open": {
      label: "Pending for HOD review",
    
    },
    "Request Rejection": {
      label: "Pending for ED review",
     
    },
    "Close": {
      label: "Closed by HOD ",
   
    },
    "Rejected": {
      label: "Rejected by ED",
    
    }
  };
  
  const config = statusConfigs[status] || {
    label: status,
    color: "#000",
    bgColor: "#e9ecef"
  };
  
  return (
    <span>
      {config.label}
    </span>
  );
};

// Add these helper functions after your existing helpers

const getHistoryStatusConfig = (status: string, edDecision?: string, hasLaterStatus?: boolean) => {
  const configs: Record<string, { label: string; }> = {
    "Draft": {
      label: "Draft Created",
    },
    "Open": {
      // If there's a later status (Rejection Requested, Close, Rejected), it means HOD has reviewed it
      label: hasLaterStatus ? "Reviewed by HOD" : "Pending for HOD review",
    },
    "Rejection Requested": {
      label:  hasLaterStatus ? "Reviewed by ED" : "Pending for ED review",
    },
    "Rejected": {
      label: edDecision === "YES" ? "Rejection Approved by ED" : "Rejected by ED",
    },
    "Close": {
      label: "Closed by HOD",
    }
  };
  
  return configs[status] || { label: status };
};

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return "-";
  }
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const statusOptions: SelectOptions[] = [
  { value: "Open", label: "Open" },
  { value: "Closed", label: "Closed" },
  { value: "Rejection Requested", label: "Rejection Requested" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

const RecommendationTracker = () => {
  const router = useRouter();
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: UserData },
  );

  // ── Data state ──
  const [fetchedRecommendations, setFetchedRecommendations] = useState<any[]>([]);
  const [draftRecommendations, setDraftRecommendations] = useState<DraftRecommendation[]>([]);
  const [reviewRecommendations, setReviewRecommendations] = useState<any[]>([]);
  const [reviewByEdRecommendations, setReviewByEdRecommendations] = useState<any[]>([]);

  // ── Filter state ──
  const [unitOptions, setUnitOptions] = useState<SelectOptions[]>(emptySelector);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOptions[]>(emptySelector);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Delete modal ──
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "draft" | "recommendation";
    item: any;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── History modal ──
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | number | null>(null);

  // ── Form inline state ──
  const [formMode, setFormMode] = useState<"create" | "edit-draft" | "review-hod" | "review-ed" | "view" | null>(null);
  const [formObjectId, setFormObjectId] = useState<string | null>(null);
  const [formRecommendationId, setFormRecommendationId] = useState<string | null>(null);

  // ─── HOD role helpers ───────────────────────────────────────────────────────

  const getHodRoles = useCallback((): UserRole[] => {
    if (!user?.userRoles?.length) return [];
    return user.userRoles.filter((r) => r.userRole === "HOD");
  }, [user]);

  const isHOD = useCallback((): boolean => getHodRoles().length > 0, [getHodRoles]);

  const getEdRoles = useCallback((): UserRole[] => {
    if (!user?.userRoles?.length) return [];
    return user.userRoles.filter((r) => r.userRole === "Employee");
  }, [user]);

  const isED = useCallback((): boolean => getEdRoles().length > 0, [getEdRoles]);

  // ─── API calls ──────────────────────────────────────────────────────────────

  const fetchAllRecommendations = async (overridePayload?: any) => {
    try {
      const payload = overridePayload ?? { createdById: user.jsplid };
      const res = await serverRequest(
        payload,
        RECOMMENDATION_TRACKER + '/get-recommendationtracker',
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token,
      );
      setFetchedRecommendations(res?.data ?? []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setFetchedRecommendations([]);
    }
  };

  const fetchHodReviewRecommendations = useCallback(async () => {
    const hodRoles = getHodRoles();
    if (!hodRoles.length) {
      setReviewRecommendations([]);
      return;
    }
    try {
      const requests = hodRoles.map((role) =>
        serverRequest(
          {
            unitId: parseInt(role.unitId),
            departmentId: role.departmentId,
            recommendationStatus: ["Open", "Published"],
            createdById: null,
          },
          RECOMMENDATION_TRACKER + '/get-recommendationtracker',
          CONSTANTS.REQUEST_POST,
          true,
          true,
          token,
        ),
      );
      const responses = await Promise.allSettled(requests);
      const allRecs: any[] = [];
      responses.forEach((res) => {
        if (res.status === "fulfilled" && res.value?.data?.length) {
          allRecs.push(...res.value.data);
        }
      });
      const seen = new Set<string | number>();
      const unique = allRecs.filter((rec) => {
        if (seen.has(rec.id)) return false;
        seen.add(rec.id);
        return true;
      });
      const filtered = unique.filter(
        (rec) => rec.responsiblePersonForRecommendationClosureId === user.jsplid,
      );
      setReviewRecommendations(filtered);
    } catch (err) {
      console.error("Error fetching HOD review recommendations:", err);
      setReviewRecommendations([]);
    }
  }, [getHodRoles, token, user?.jsplid]);

  const fetchEdReviewRecommendations = useCallback(async () => {
    const edRoles = getEdRoles();
    if (!edRoles.length) {
      setReviewByEdRecommendations([]);
      return;
    }
    try {
      const requests = edRoles.map((role) =>
        serverRequest(
          {
            unitId: parseInt(role.unitId),
            departmentId: role.departmentId,
            recommendationStatus: ["Rejection Requested"],
            createdById: null,
          },
          RECOMMENDATION_TRACKER + '/get-recommendationtracker',
          CONSTANTS.REQUEST_POST,
          true,
          true,
          token,
        ),
      );
      const responses = await Promise.allSettled(requests);
      const allRecs: any[] = [];
      responses.forEach((res) => {
        if (res.status === "fulfilled" && res.value?.data?.length) {
          allRecs.push(...res.value.data);
        }
      });
      const seen = new Set<string | number>();
      const unique = allRecs.filter((rec) => {
        if (seen.has(rec.id)) return false;
        seen.add(rec.id);
        return true;
      });
      setReviewByEdRecommendations(unique);
    } catch (err) {
      console.error("Error fetching ED review recommendations:", err);
      setReviewByEdRecommendations([]);
    }
  }, [getEdRoles, token]);

  const fetchDrafts = async () => {
  try {
    const res = await serverRequest(
      {},
      `${RECOMMENDATION_TRACKER}/get-drafts/${user.sub}`,
      CONSTANTS.REQUEST_GET,
      true,
      true,
      token,
    );

    let draftData: DraftRecommendation[] = [];

    if (Array.isArray(res)) {
      draftData = res;
    } else if (Array.isArray(res?.data)) {
      draftData = res.data;
    }

    const onlyDrafts = draftData.filter(
      (item) => item.recommendationStatus === "Draft"
    );

    setDraftRecommendations(onlyDrafts);

  } catch (err) {
    console.error("Error fetching drafts:", err);
    setDraftRecommendations([]);
  }
};

  const fetchUnits = async () => {
    try {
      const res = await serverRequest(
        {},
        `${FETCH_UNITS}/get-units`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token,
      );
      if (res?.length) {
        setUnitOptions(
          res.map((u: any) => ({ value: u.unitid, label: u.unitname })),
        );
      }
    } catch (err) {
      console.error("Error fetching units:", err);
    }
  };

  const fetchDepartments = async (unitId: string | number) => {
    try {
      setDepartmentOptions(emptySelector);
      const res = await serverRequest(
        {},
        `${FETCH_DEPARTMENTS}/get-departments/${unitId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token,
      );
      if (res?.length) {
        setDepartmentOptions(
          res.map((d: DepartmentData) => ({
            value: d.departmentid,
            label: d.departmentname,
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchRecommendationHistory = async (recommendationId: string | number) => {
    setIsLoadingHistory(true);
      setSelectedRecommendationId(recommendationId);   // <-- Add this line
    try {
      const res = await serverRequest(
        {},
        `${RECOMMENDATION_HISTORY}/${recommendationId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token,
      );
      setHistoryData(res?.data ?? (Array.isArray(res) ? res : []));
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error("Error fetching recommendation history:", err);
      toast.error("Failed to fetch history data");
      setHistoryData([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ─── Delete handlers ────────────────────────────────────────────────────────

  const openDeleteModal = (type: "draft" | "recommendation", item: any) => {
    setDeleteTarget({ type, item });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "draft") {
        await serverRequest(
          { id: deleteTarget.item.objectId },
          `${RECOMMENDATION_TRACKER}/delete-draft/${user.sub}/${deleteTarget.item.objectId}`,
          CONSTANTS.REQUEST_DELETE,
          true,
          true,
          token,
        );
        toast.success("Draft deleted successfully");
        fetchDrafts();
      } else {
        await serverRequest(
          {
            id: deleteTarget.item.id,
            updatedById: user.sub,
            updatedByName: user.name,
            updatedByEmail: user.email,
          },
          `${RECOMMENDATION_TRACKER}/delete-recommendation/${deleteTarget.item.id}`,
          CONSTANTS.REQUEST_DELETE,
          true,
          true,
          token,
        );
        toast.success("Recommendation deleted successfully");
        fetchAllRecommendations();
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };
  const handleDownloadEvidence = async () => {
     
      const payload = historyData.find((h) => h.id)?.evidenceFilePath;
        
      try {
        const blob = await serverRequest(
          payload,
              DOWNLOAD_FILE,
              CONSTANTS.REQUEST_POST,
               true,
               true,
               token,
              false,   
              true,  
             "blob"  
        );
         const url = window.URL.createObjectURL(blob);
      // Open in a new tab
      const newWindow = window.open(url, "_blank");
      // Revoke the blob URL after a short delay to allow the tab to open
      if (newWindow) {
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } else {
        // If popup blocked, fallback to download via anchor
        const a = document.createElement("a");
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.info("Download started. Check your downloads folder.");
      }
      } catch {
        toast.error("Failed to download evidence");
      }
    };

  // ─── Filter apply ───────────────────────────────────────────────────────────

  const applyFilters = () => {
    fetchAllRecommendations({
      fromDate: fromDate || null,
      toDate: toDate || null,
      departmentId: selectedDepartment ? parseInt(selectedDepartment as string) : null,
      unitId: selectedUnit ? parseInt(selectedUnit) : null,
      recommendationStatus: selectedStatus ? [selectedStatus] : [],
      createdById: user.jsplid,
    });
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setSelectedUnit("");
    setSelectedDepartment("");
    setSelectedStatus("");
    setFromDate("");
    setToDate("");
    setIsFilterOpen(false);
    fetchAllRecommendations();
  };

  // ─── Close form and refresh data ────────────────────────────────────────────
  const closeForm = () => {
    setFormMode(null);
    setFormObjectId(null);
    setFormRecommendationId(null);
    // Refresh all relevant data
    fetchAllRecommendations();
    fetchDrafts();
    fetchHodReviewRecommendations();
    fetchEdReviewRecommendations();
  };

  // ─── Init ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;
    fetchUnits();
    fetchAllRecommendations();
    fetchDrafts();
    fetchHodReviewRecommendations();
    fetchEdReviewRecommendations();
  }, [token]);

  // ─── Pagination ─────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(fetchedRecommendations.length / pageSize);
  const paginated = fetchedRecommendations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // If a form is active, render it instead of the dashboard content
  if (formMode) {
    return (
      <div className="container-fluid">
        <RecommendationForm
          mode={formMode}
          objectId={formObjectId}
          recommendationId={formRecommendationId}
        />
        <ToastContainer />
      </div>
    );
  }

  // Otherwise render the dashboard
  return (
    <>
      <div className="container-fluid">
        {/* Header */}
        <div className="admin-boxContainer d3">
          <div className="adminAction">
            <Link href={APP_URL.RECOMMENDATION_DASHBOARD} className="adminAction__title">
              <span className="icon">
                <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Dashboard
            </Link>
          </div>
        </div>

        {/* ── Draft Recommendations ── */}
        {draftRecommendations.length > 0 && (
          <div className="d2 pb-4">
            <div className="admin-boxContainer d1">
              <div
                className="adminAction mb-3"
                style={{ backgroundColor: "#446181", height: "40px" }}
              >
                <div className="text-white ps-2 font-weight-bold py-2">
                  Draft Recommendations: {draftRecommendations.length}
                </div>
              </div>
              <div className="admin-table d3 table-responsive noHover">
                <table className="table">
                  <thead>
                    <tr>
                      <th>S no</th>
                      <th>Object Id</th>
                      <th>Date</th>
                      <th>Source / Plant / Location</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftRecommendations.map((item, idx) => (
                      <tr key={item.objectId}>
                        <td>{idx + 1}</td>
                        <td className="small">{item.objectId}</td>
                        <td className="small">{formatDate(item.createdDate)}</td>
                        <td className="small">
                          {item.source} / {item.unitName} / {item.departmentName}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="tableBtn"
                              type="button"
                              title="Edit draft"
                              onClick={() => {
                                setFormMode("edit-draft");
                                setFormObjectId(item.objectId);
                              }}
                            >
                              <Image
                                width={15}
                                height={15}
                                src="/images/svg/edit-icon-blue.svg"
                                alt="edit"
                              />
                            </button>
                            <button
                              className="tableBtn"
                              type="button"
                              title="Delete draft"
                              onClick={() => openDeleteModal("draft", item)}
                            >
                              <Image
                                width={15}
                                height={15}
                                src="/images/svg/delete-icon.svg"
                                alt="delete"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── HOD Review Recommendations ── */}
        {isHOD() && reviewRecommendations.length > 0 && (
          <div className="d2 pb-4">
            <div className="admin-boxContainer d1">
              <div
                className="adminAction mb-3"
                style={{ backgroundColor: "#446181", height: "40px" }}
              >
                <div className="text-white ps-2 font-weight-bold py-2">
                  Pending HOD Review: {reviewRecommendations.length}
                </div>
              </div>
              <div className="admin-table d3 table-responsive noHover">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="small">S no</th>
                      <th className="small">Recommendation ID</th>
                      <th className="small">Description</th>
                      <th className="small">Type</th>
                      <th className="small">Date</th>
                      <th className="small">Dept / Unit</th>
                      <th className="small">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewRecommendations.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="small">{idx + 1}</td>
                        <td className="small" style={{ color: "#005A8C", fontWeight: 600 }}>
                          REC-{item.recommendationNo}
                        </td>
                        <td className="small">
                          {item.recommendationDescription}
                        </td>
                        <td className="small">{item.recommendationType}</td>
                        <td className="small">{formatDate(item.createdDate)}</td>
                        <td className="small">
                          {item.departmentName || "-"} / {item.unitName || "-"}
                        </td>
                        <td>
                          <button
                            className="tableBtn"
                            type="button"
                            title="Review"
                            onClick={() => {
                              setFormMode("review-hod");
                              setFormRecommendationId(item.id.toString());
                            }}
                          >
                            <Image
                              width={15}
                              height={15}
                              src="/images/svg/eyeicon.svg"
                              alt="view"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ED Review Recommendations ── */}
        {isED() && reviewByEdRecommendations.length > 0 && (
          <div className="d2 pb-4">
            <div className="admin-boxContainer d1">
              <div
                className="adminAction mb-3"
                style={{ backgroundColor: "#446181", height: "40px" }}
              >
                <div className="text-white ps-2 font-weight-bold py-2">
                  Pending ED Review: {reviewByEdRecommendations.length}
                </div>
              </div>
              <div className="admin-table d3 table-responsive noHover">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="small">S no</th>
                      <th className="small">Recommendation ID</th>
                      <th className="small">Description</th>
                      <th className="small">Type</th>
                      <th className="small">Date</th>
                      <th className="small">Dept / Unit</th>
                      <th className="small">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewByEdRecommendations.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="small">{idx + 1}</td>
                        <td className="small" style={{ color: "#005A8C", fontWeight: 600 }}>
                          REC-{item.recommendationNo}
                        </td>
                        <td className="small">
                          {item.recommendationDescription}
                        </td>
                        <td className="small">{item.recommendationType}</td>
                        <td className="small">{formatDate(item.createdDate)}</td>
                        <td className="small">
                          {item.departmentName || "-"} / {item.unitName || "-"}
                        </td>
                        <td>
                          <button
                            className="tableBtn"
                            type="button"
                            title="Review"
                            onClick={() => {
                              setFormMode("review-ed");
                              setFormRecommendationId(item.id.toString());
                            }}
                          >
                            <Image
                              width={15}
                              height={15}
                              src="/images/svg/eyeicon.svg"
                              alt="view"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Recommendations Table ── */}
        <div className="admin-boxContainer d2">
          <div className="adminFilters d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <button
                className="adminFilters__btn"
                onClick={() => setIsFilterOpen(true)}
              >
                <img
                  width="15"
                  height="15"
                  alt="Filter"
                  src="/images/svg/filter-icon.svg"
                  className="img-fluid u-image"
                />
              </button>
              <button
                type="button"
                className="iconBtn orange"
                onClick={resetFilters}
              >
                Refresh
                <img
                  width="25"
                  height="25"
                  alt="Refresh"
                  src="/images/svg/refresh-icon.svg"
                  className="img-fluid u-image"
                />
              </button>
            </div>
            <button
              className="iconBtn green"
              onClick={() => setFormMode("create")}
            >
              <span>Create Recommendation</span>
              <img
                width="15"
                height="15"
                alt="Edit"
                src="/images/svg/edit-icon.svg"
                className="img-fluid u-image"
              />
            </button>
          </div>
        </div>

        <div className="admin-boxContainer d1">
          <div className="admin-table d3 table-responsive noHover">
            <table className="table">
              <thead>
                <tr>
                  <th className="small">S no</th>
                  <th className="small">Date</th>
                  <th className="small" style={{ minWidth: 150 }}>
                    Recommendation ID
                  </th>
                  <th className="small" style={{ minWidth: 120 }}>Current Status</th>
                  <th className="small">Type</th>
                  <th className="small">Source</th>
                  <th className="small">Dept</th>
                  <th className="small" style={{ minWidth: 200 }}>
                    Equipment
                  </th>
                  <th className="small" style={{ minWidth: 340 }}>
                    Description
                  </th>
                  <th className="small">Repair / Replace</th>
                  <th className="small" style={{ minWidth: 200 }}>
                    Score (Initial)
                  </th>
                  <th className="small">Injury Potential</th>
                  <th className="small">Asset Cost</th>
                  <th className="small">Prod Loss / Day</th>
                  <th className="small" style={{ minWidth: 200 }}>
                    Risk Impact (Min / Med / Max)
                  </th>
                  <th className="small" style={{ minWidth: 200 }}>
                    Score (Final)
                  </th>
                  <th className="small">Benefits</th>
                  <th className="small">Est. Cost</th>
                  <th className="small">Shutdown</th>
                  <th className="small">Target Date</th>
                  <th className="small">Actual Impl. Date</th>
                  <th className="small">Age (days)</th>
                  <th className="small">Benefit Analysis Date</th>
                  <th className="small">Overdue Days</th>
                  <th className="small">Initiated By</th>
                  <th className="small">HOD Discussion</th>
                  <th className="small">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="small">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="small">{formatDate(item.dateOfRecommendation)}</td>
                      <td className="small">
                        <span style={{ color: "#005A8C", fontWeight: 600 }}>
                          REC-{item.recommendationNo}
                        </span>
                      </td>
                     <td className="small">{getStatusBadge(item.recommendationStatus)}</td>
                      <td className="small">{item.recommendationType}</td>
                      <td className="small">{item.source}</td>
                      <td className="small">{item.departmentName}</td>
                      <td className="small">
                        <b>Id: </b>{item.equipmentId}<br />
                        <b>Type: </b>{item.equipmentType}<br />
                        <b>Desc: </b>{item.equipmentDescription || "-"}
                      </td>
                      <td className="small">{item.recommendationDescription}</td>
                      <td className="small">{item.repairOrReplacement}</td>
                      <td className="small">
                        <b>Consequence: </b>{item.initialConsequence}<br />
                        <b>Likelihood: </b>{item.initialLikelihood}<br />
                        <b>Risk Score: </b>{item.initialRiskScore}
                      </td>
                      <td className="small">{item.injuryPotential}</td>
                      <td className="small">{formatIndianCurrency(item.assetRepairOrReplacementCost)}</td>
                      <td className="small">{formatIndianCurrency(item.costOfProductionLossPerDay)}</td>
                      <td className="small">
                        <b>Min: </b>{formatCrores(item.riskImpactMin)}<br />
                        <b>Med: </b>{formatCrores(item.riskImpactMedium)}<br />
                        <b>Max: </b>{formatCrores(item.riskImpactMax)}
                      </td>
                      <td className="small">
                        <b>Consequence: </b>{item.finalConsequence}<br />
                        <b>Likelihood: </b>{item.finalLikelihood}<br />
                        <b>Risk Score: </b>{item.finalRiskScore}
                      </td>
                      <td className="small">{formatIndianCurrency(item.benefitOfImplementationInInr)}</td>
                      <td className="small">{formatIndianCurrency(item.estimatedImplementationCostInInr)}</td>
                      <td className="small">{item.shutdownRequirement}</td>
                      <td className="small">{formatDate(item.recommendationImplementationTargetDate)}</td>
                      <td className="small">{formatDate(item.recommendationImplementationActualDate)}</td>
                      <td className="small">{item.ageOfRecommendation}</td>
                      <td className="small">{formatDate(item.recommendationBenefitAnalysisTargetDate)}</td>
                      <td className="small">{item.noOfOverdueDays}</td>
                      <td className="small">{item.createdByName}</td>
                      <td className="small">{formatDate(item.dateOfDiscussionWithHOD)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="tableBtn"
                            type="button"
                            title="View History"
                            onClick={() => fetchRecommendationHistory(item.id)}
                          >
                            <img
                              width="15"
                              height="15"
                              alt="history"
                              src="/images/svg/historyicon.svg"
                              className="img-fluid u-image"
                            />
                          </button>


                          <button
                            className="tableBtn"
                            type="button"
                            title="View"
                            onClick={() => {
                              setFormMode("view");
                              setFormRecommendationId(item.id.toString());
                            }}
                          >
                            <Image
                              width={15}
                              height={15}
                              src="/images/svg/eyeicon.svg"
                              alt="view"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={27} className="text-center">
                      No recommendations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {fetchedRecommendations.length > 0 && (
            <div className="pagination_container">
              <div className="recordsWrapper">
                <select
                  className="recordsWrapper__list"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s} Records
                    </option>
                  ))}
                </select>
                <span className="recordsWrapper__value">
                  {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, fetchedRecommendations.length)}{" "}
                  of {fetchedRecommendations.length}
                </span>
              </div>
              <nav className="pagination_wrapper">
                <ul className="pagination">
                  <li className="page-item">
                    <button
                      className="page-link actionBtns"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <Image src="/images/svg/arrow-left-small.svg" width={15} height={15} alt="prev" />
                    </button>
                  </li>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage > 3 && totalPages > 5 ? currentPage - 2 + i : i + 1;
                    if (page > totalPages) return null;
                    return (
                      <li key={page} className="page-item">
                        <button
                          className={`page-link ${currentPage === page ? "active" : ""}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <li className="page-item disabled"><span className="page-link">…</span></li>
                      <li className="page-item">
                        <button
                          className={`page-link ${currentPage === totalPages ? "active" : ""}`}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </li>
                    </>
                  )}
                  <li className="page-item">
                    <button
                      className="page-link actionBtns"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <Image src="/images/svg/arrow-right-small.svg" width={15} height={15} alt="next" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>

        <ToastContainer />
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: "white", width: "500px" }}>
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setIsDeleteModalOpen(false)} />
              </div>
              <div className="modal-body text-center py-3">
                <p className="mb-1">
                  Are you sure you want to delete this{" "}
                  <strong>{deleteTarget.type === "draft" ? "draft" : "recommendation"}</strong>?
                </p>
                <p className="text-muted small">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Deleting…
                    </>
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter Modal ── */}
      {isFilterOpen && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ width: "500px" }}>
              <div className="modal-header">
                <h5 className="modal-title">Filter Recommendations</h5>
                <button type="button" className="btn-close" onClick={() => setIsFilterOpen(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <SelectField
                      label="Unit"
                      name="unit"
                      placeholder="Select Unit"
                      options={unitOptions}
                      value={unitOptions.find((o) => o.value == selectedUnit) || null}
                      onChange={(opt: SelectOptions) => {
                        setSelectedUnit(opt.value);
                        setSelectedDepartment("");
                        fetchDepartments(opt.value);
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <SelectField
                      label="Department"
                      name="department"
                      placeholder="Select Department"
                      options={departmentOptions}
                      value={departmentOptions.find((o) => o.value == selectedDepartment) || null}
                      onChange={(opt: SelectOptions) => setSelectedDepartment(opt.value)}
                    />
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <SelectField
                      label="Status"
                      name="status"
                      placeholder="Status"
                      options={statusOptions}
                      value={statusOptions.find((o) => o.value === selectedStatus) || null}
                      onChange={(opt: SelectOptions) => setSelectedStatus(opt.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">From Date</label>
                    <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">To Date</label>
                    <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary"             style={{width: "120px"}}
 onClick={resetFilters}>Reset</button>
                <button className="btn btn-primary"             style={{width: "120px"}}
 onClick={applyFilters}>Apply Filters</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── History Modal ── */}
      {/* ── Enhanced History Modal with Timeline ── */}
{isHistoryModalOpen && (
  <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
    <div className="modal-dialog modal-xl modal-dialog-centered">
      <div className="modal-content" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div className="modal-header">
          <div>
            <h5 className="modal-title">
              Recommendation History Timeline
            </h5>
            <small>
              REC-{selectedRecommendationId}
            </small>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setIsHistoryModalOpen(false);
              setHistoryData([]);
              setSelectedRecommendationId(null);
            }}
          />
        </div>
        <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto", padding: "20px" }}>
          {isLoadingHistory ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Fetching history...</p>
            </div>
          ) : historyData.length > 0 ? (
            <div className="timeline-container">
              {/* Sort history by date descending (newest first) */}
              {[...historyData].sort((a, b) => 
                new Date(b.logCreatedDate || b.createdDate).getTime() - new Date(a.logCreatedDate || a.createdDate).getTime()
              ).map((history, idx, array) => {
                const status = history.recommendationStatus;
                
                const hasLaterStatus = array.slice(0, idx).some(item => 
    item.recommendationStatus === "Rejection Requested" || 
    item.recommendationStatus === "Close" || 
    item.recommendationStatus === "Rejected"
  );
                const statusConfig = getHistoryStatusConfig(status, history.edRejectApprovalDecision, hasLaterStatus);
                const changedDate = history.logCreatedDate || history.updatedDate || history.createdDate;
                const changedBy = history.updatedByName || history.createdByName || history.rejectRequestedByName || "-";
                const remarks = history.remarks || history.reasonForRejectionRequest || "-";
                
                // Get additional details based on status
                let additionalDetails = null;
                if (status === "Rejected" && history.edRejectApprovalDecision === "YES") {
                  additionalDetails = (
                    <div  style={{  fontSize: "12px" }}>
                     <strong>Responsible Person:</strong> {history.rejectedByName || history.updatedByName || "-"}<br></br>
                      <strong>Decision:</strong> Approved Rejection Request<br />
                      {history.edRemarks && <><strong>💬 ED Remarks:</strong> {history.edRemarks}<br /></>}
                    </div>
                  );
                } else if (status === "Rejected" && history.edRejectApprovalDecision === "NO") {
                  additionalDetails = (
                    <div style={{ fontSize: "12px" }}>
                      <strong>ED Decision:</strong> Rejected the Request<br />
                      {history.edRemarks && <><strong>💬 ED Remarks:</strong> {history.edRemarks}<br /></>}
                      <strong>Rejected By:</strong> {history.rejectedByName || history.updatedByName || "-"}
                    </div>
                  );
                } else if (status === "Rejection Requested") {
                  additionalDetails = (
                    <div className="small">
                      <strong>Responsible Person:</strong> ED<br />
                      
                    </div>
                  );
                } else if (status === "Close") {
                  additionalDetails = (
                    <div className="mt-2 p-2" style={{  fontSize: "12px" }}>
                      <strong>Responsible Person:</strong> {history.updatedByName || "-"}<br />
                      {history.evidenceFileName && <><strong>Evidence: </strong> 
                      <a
            onClick={handleDownloadEvidence}
            style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}
          >
             {history.evidenceFileName}
          </a>~
                      <br /></>}
                    </div>
                  );
                }else if (status === "Open") {
                  additionalDetails = (
                    <div className="small">
                                            <strong>Responsible Person:</strong> {history.responsiblePersonForRecommendationClosureName || "-"}<br />
                     
                    </div>
                  );
                }

                
                return (
  <div key={idx} className="timeline-item" style={{ 
    display: "flex", 
    marginBottom: "20px",
    position: "relative",
    paddingLeft: "30px"
  }}>
    {/* Timeline line and dot - Green if reviewed, Grey if pending */}
    <div style={{
      position: "absolute",
      left: "8px",
      top: "0",
      bottom: "0",
      width: "2px",
      backgroundColor: hasLaterStatus ? "#28a745" : "#dee2e6"
    }}>
      <div style={{
        position: "absolute",
        top: "10px",
        left: "-6px",
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        backgroundColor: hasLaterStatus ? "#28a745" : "white",
        border: `2px solid ${hasLaterStatus ? "#28a745" : "#dee2e6"}`,
        boxShadow: "0 0 0 2px white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {hasLaterStatus && (
          <span style={{
            position: "absolute",
            fontSize: "8px",
            color: "white",
            fontWeight: "bold"
          }}>✓</span>
        )}
      </div>
    </div>
    
    {/* Timeline content */}
    <div style={{ flex: 1, marginLeft: "20px" }}>
      <div style={{
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "10px",
        backgroundColor: hasLaterStatus ? "#f0fff4" : "white",
        border: `1px solid ${hasLaterStatus ? "#28a745" : "#dee2e6"}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <strong style={{ fontSize: "14px", color: hasLaterStatus ? "#28a745" : "#333" }}>
              {statusConfig.label}
            </strong>
            {hasLaterStatus && (
              <span style={{ 
                marginLeft: "8px", 
                fontSize: "11px", 
                backgroundColor: "#28a745", 
                color: "white", 
                padding: "2px 6px", 
                borderRadius: "12px" 
              }}>
                Completed
              </span>
            )}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <span>{formatDateTime(changedDate)}</span>
          </div>
        </div>
        
        <div style={{ fontSize: "13px", marginTop: "8px" }}>
          {additionalDetails}
        </div>
      </div>
    </div>
  </div>
);
              })}
              
              {/* Summary Card */}
              <div style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#e9ecef",
                borderRadius: "8px",
                border: "1px solid #dee2e6"
              }}>
                <strong>Summary</strong><br />
                <div style={{ fontSize: "13px", marginTop: "8px" }}>
                  <div>• Created on: {formatDateTime(historyData[historyData.length - 1]?.createdDate)}</div>
                                    <div>• Created By: {historyData[historyData.length - 1]?.createdByName || "-"}</div>

                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No history records found for this recommendation.</p>
            </div>
          )}
        </div>
        <div className="modal-footer">

          <button
            className="btn btn-secondary"
            style={{width: "120px"}}
            onClick={() => {
              setIsHistoryModalOpen(false);
              setHistoryData([]);
              setSelectedRecommendationId(null);
              
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default RecommendationTracker;