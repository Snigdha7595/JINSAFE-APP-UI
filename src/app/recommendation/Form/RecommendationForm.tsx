"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import CurrencyInputWithUnit from "@/components/Form/CurrencyInputWithUnit";
import { SelectOptions } from "@/components/interfaces";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { selectUserToken } from "@/store/slices/authSlice";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { APP_URL } from "@/config/constant";
import {
  FETCH_UNITS,
  FETCH_DEPARTMENTS,
  RECOMMENDATION_TRACKER,
  RECOMMENDATION_TRACKER_MASTER,
  UPLOAD_FILE,
  BUCKET_URL,
  DOWNLOAD_FILE
} from "@/config/apiConfig";

// ========== TYPES ==========
export interface RecommendationFormValues {
  objectId?: string;
  source: string;
  equipmentId: string;
  equipmentType: string;
  equipmentDescription: string;
  departmentId: string;
  departmentName: string;
  unitId: string;
  unitName: string;
  repairOrReplacement: string;
  recommendationDescription: string;
  recommendationType: string;
  initialConsequence: string;
  initialLikelihood: string;
  initialRiskScore: string;
  injuryPotential: string;
  assetRepairOrReplacementCost: string;
  costOfProductionLossPerDay: string;
  riskImpactMin: string;
  riskImpactMedium: string;
  riskImpactMax: string;
  finalConsequence: string;
  finalLikelihood: string;
  finalRiskScore: string;
  estimatedImplementationCostInInr: string;
  benefitOfImplementationInInr: string;
  shutdownRequirement: string;
  dateOfRecommendation: Date | null;
  recommendationImplementationTargetDate: Date | null;
  recommendationImplementationActualDate: Date | null;
  recommendationBenefitAnalysisTargetDate: Date | null;
  ageOfRecommendation: string;
  noOfOverdueDays: string;
  recommendationInitiatedByName: string;
  recommendationInitiatedById: string;
  recommendationInitiatedByEmail: string;
  responsiblePersonForRecommendationClosureName: string;
  responsiblePersonForRecommendationClosureId: string;
  responsiblePersonForRecommendationClosureEmail: string;
  recommendationDiscussedWithHOD: string;
  dateOfDiscussionWithHOD: Date | null;
  recommendationStatus: string;
  // Review‑only fields
  reasonForRejection?: string;
  remarks?: string;
  edRejectApprovalDecision?: string;
  edRemarks?: string;
  evidenceFileId?: string;
  evidenceFileName?: string;
}

interface UserData {
  sub: string;
  name: string;
  email: string;
  jsplid: string;
  empUnit: string;
  empDepartment: string;
  departmentDisplay: string;
  departmentHod: string;
}

// ========== HELPERS ==========
const formatDateToISO = (date: Date | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const getPeopleValue = (consequence: string): number => {
  switch (parseFloat(consequence)) {
    case 5:
      return 20_000_000;
    case 4:
      return 10_000_000;
    case 3:
      return 2_500_000;
    case 2:
      return 50_000;
    case 1:
      return 5_000;
    default:
      return 0;
  }
};

const transformToApiPayload = (
  values: RecommendationFormValues,
  userId: string,
  userName: string,
  userEmail: string,
  draftObjectId?: string | null,
): any => {
  const payload: any = {
    source: values.source,
    equipmentId: parseInt(values.equipmentId) || 0,
    equipmentType: values.equipmentType,
    equipmentDescription: values.equipmentDescription,
    departmentId: values.departmentId,
    departmentName: values.departmentName,
    unitId: values.unitId,
    unitName: values.unitName,
    repairOrReplacement:
      values.repairOrReplacement === "Yes" ? "Repaired" : "Replaced",
    recommendationDescription: values.recommendationDescription,
    recommendationType: values.recommendationType,
    initialConsequence: parseInt(values.initialConsequence) || 0,
    initialLikelihood: parseInt(values.initialLikelihood) || 0,
    initialRiskScore: parseInt(values.initialRiskScore) || 0,
    injuryPotential: values.injuryPotential,
    assetRepairOrReplacementCost:
      parseFloat(values.assetRepairOrReplacementCost) || 0,
    costOfProductionLossPerDay:
      parseFloat(values.costOfProductionLossPerDay) || 0,
    riskImpactMin: parseFloat(values.riskImpactMin) || 0,
    riskImpactMedium: parseFloat(values.riskImpactMedium) || 0,
    riskImpactMax: parseFloat(values.riskImpactMax) || 0,
    finalConsequence: parseInt(values.finalConsequence) || 0,
    finalLikelihood: parseInt(values.finalLikelihood) || 0,
    finalRiskScore: parseInt(values.finalRiskScore) || 0,
    benefitOfImplementationInInr:
      parseFloat(values.benefitOfImplementationInInr) || 0,
    estimatedImplementationCostInInr:
      parseFloat(values.estimatedImplementationCostInInr) || 0,
    shutdownRequirement: values.shutdownRequirement,
    dateOfRecommendation: formatDateToISO(values.dateOfRecommendation),
    recommendationImplementationTargetDate: formatDateToISO(
      values.recommendationImplementationTargetDate,
    ),
    recommendationImplementationActualDate: formatDateToISO(
      values.recommendationImplementationActualDate,
    ),
    recommendationBenefitAnalysisTargetDate: formatDateToISO(
      values.recommendationBenefitAnalysisTargetDate,
    ),
    ageOfRecommendation: parseInt(values.ageOfRecommendation) || 0,
    noOfOverdueDays: parseInt(values.noOfOverdueDays) || 0,
    recommendationInitiatedByName: userName,
    recommendationInitiatedById: userId,
    recommendationInitiatedByEmail: userEmail,
    responsiblePersonForRecommendationClosureName:
      values.responsiblePersonForRecommendationClosureName,
    responsiblePersonForRecommendationClosureId:
      values.responsiblePersonForRecommendationClosureId,
    responsiblePersonForRecommendationClosureEmail:
      values.responsiblePersonForRecommendationClosureEmail,
    recommendationDiscussedWithHOD: values.recommendationDiscussedWithHOD,
    dateOfDiscussionWithHOD: formatDateToISO(values.dateOfDiscussionWithHOD),
    recommendationStatus: values.recommendationStatus,
    createdById: userId,
    createdByName: userName,
    createdByEmail: userEmail,
  };
  if (draftObjectId) payload.objectId = draftObjectId;
  return payload;
};

// Sections definition (same as original)
const sections = [
  {
    title: "1. Basic Identification & Location Details",
    fields: [
      "source",
      "unitName",
      "departmentName",
      "equipmentId",
      "equipmentType",
      "equipmentDescription",
    ],
    requiredFields: [
      "source",
      "unitName",
      "departmentName",
      "equipmentId",
      "equipmentType",
    ],
  },
  {
    title: "2. Issue / Requirement Details",
    fields: [
      "recommendationDescription",
      "recommendationType",
      "repairOrReplacement",
    ],
    requiredFields: [
      "recommendationDescription",
      "recommendationType",
      "repairOrReplacement",
    ],
  },
  {
    title: "3. Risk Assessment (Before Implementation)",
    fields: [
      "initialConsequence",
      "initialLikelihood",
      "initialRiskScore",
      "injuryPotential",
    ],
    requiredFields: [
      "initialConsequence",
      "initialLikelihood",
      "injuryPotential",
    ],
  },
  {
    title: "4. Financial Impact & Loss Estimation",
    fields: [
      "assetRepairOrReplacementCost",
      "costOfProductionLossPerDay",
      "riskImpactMin",
      "riskImpactMedium",
      "riskImpactMax",
    ],
    requiredFields: [],
  },
  {
    title: "5. Post-Implementation Risk",
    fields: ["finalConsequence", "finalLikelihood", "finalRiskScore"],
    requiredFields: [],
  },
  {
    title: "6. Recommendation Cost-Benefit Analysis",
    fields: [
      "benefitOfImplementationInInr",
      "estimatedImplementationCostInInr",
      "shutdownRequirement",
    ],
    requiredFields: [],
  },
  {
    title: "7. Timeline & Dates",
    fields: [
      "dateOfRecommendation",
      "recommendationImplementationTargetDate",
      "recommendationImplementationActualDate",
      "ageOfRecommendation",
      "recommendationBenefitAnalysisTargetDate",
      "noOfOverdueDays",
    ],
    requiredFields: [],
  },
  {
    title: "8. Responsibility & Approval",
    fields: [
      "recommendationInitiatedByName",
      "recommendationDiscussedWithHOD",
      "dateOfDiscussionWithHOD",
      "responsiblePersonForRecommendationClosureName",
    ],
    requiredFields: [
      "recommendationDiscussedWithHOD",
      "dateOfDiscussionWithHOD",
    ],
  },
];

// Review extra sections (injected conditionally)
const hodReviewSection = {
  title: "9. Status & Decision (HOD)",
  fields: [
    "recommendationStatus",
    "reasonForRejection",
    "remarks",
    "fileUpload",
  ],
  requiredFields: [],
};
const edReviewSection = {
  title: "10. Status & Decision (ED)",
  fields: ["edRejectApprovalDecision", "edRemarks"],
  requiredFields: [],
};

// ========== MAIN COMPONENT ==========
interface RecommendationFormProps {
  mode: "create" | "edit-draft" | "review-hod" | "review-ed" | "view";
  objectId?: string | null; // for edit-draft (draft objectId)
  recommendationId?: string | null; // for review (published recommendation ID)
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({
  mode,
  objectId,
  recommendationId,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftObjectId, setDraftObjectId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] =
    useState<RecommendationFormValues | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set(),
  );
  const [currentSection, setCurrentSection] = useState(0);
  const [userUnit, setUserUnit] = useState<{
    unitId: string;
    unitName: string;
  } | null>(null);
  const [departmentMaster, setDepartmentMaster] = useState<any[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  // Masters
  const [sourceMaster, setSourceMaster] = useState<SelectOptions[]>([]);
  const [recommendationTypeMaster, setRecommendationTypeMaster] = useState<
    SelectOptions[]
  >([]);
  const [injuryPotentialMaster, setInjuryPotentialMaster] = useState<
    SelectOptions[]
  >([]);
  const [statusOptions] = useState<SelectOptions[]>([
    { value: "Close", label: "Close Recommendation" },
    { value: "Rejection Requested", label: "Request a Rejection to ED" },
  ]);
  const [edDecisionOptions] = useState<SelectOptions[]>([
    { value: "YES", label: "Approve Request" },
    { value: "NO", label: "Reject Request" },
  ]);

  const { user } = useSelector(
    (state: RootState) => state.auth as { user: UserData },
  );
  const token = useSelector(selectUserToken);
  const publishBtnRef = useRef<HTMLButtonElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Helper to map API data to form values
  const mapApiDataToFormValues = useCallback(
    (data: any): RecommendationFormValues => ({
      source: data.source || "",
      unitId: userUnit?.unitId || data.unitId || "",
      unitName: userUnit?.unitName || data.unitName || "",
      departmentId: data.departmentId?.toString() || "",
      departmentName: data.departmentName || "",
      equipmentId: data.equipmentId?.toString() || "",
      equipmentType: data.equipmentType || "",
      equipmentDescription: data.equipmentDescription || "",
      repairOrReplacement:
        data.repairOrReplacement === "Repaired"
          ? "Yes"
          : data.repairOrReplacement === "Replaced"
            ? "No"
            : "",
      recommendationDescription: data.recommendationDescription || "",
      recommendationType: data.recommendationType || "",
      initialConsequence: data.initialConsequence?.toString() || "",
      initialLikelihood: data.initialLikelihood?.toString() || "",
      initialRiskScore: data.initialRiskScore?.toString() || "",
      injuryPotential: data.injuryPotential || "",
      assetRepairOrReplacementCost:
        data.assetRepairOrReplacementCost?.toString() || "",
      costOfProductionLossPerDay:
        data.costOfProductionLossPerDay?.toString() || "",
      riskImpactMin: data.riskImpactMin?.toString() || "",
      riskImpactMedium: data.riskImpactMedium?.toString() || "",
      riskImpactMax: data.riskImpactMax?.toString() || "",
      finalConsequence: data.finalConsequence?.toString() || "",
      finalLikelihood: data.finalLikelihood?.toString() || "",
      finalRiskScore: data.finalRiskScore?.toString() || "",
      benefitOfImplementationInInr:
        data.benefitOfImplementationInInr?.toString() || "",
      estimatedImplementationCostInInr:
        data.estimatedImplementationCostInInr?.toString() || "",
      shutdownRequirement: data.shutdownRequirement || "",
      dateOfRecommendation: data.dateOfRecommendation
        ? new Date(data.dateOfRecommendation)
        : null,
      recommendationImplementationTargetDate:
        data.recommendationImplementationTargetDate
          ? new Date(data.recommendationImplementationTargetDate)
          : null,
      recommendationImplementationActualDate:
        data.recommendationImplementationActualDate
          ? new Date(data.recommendationImplementationActualDate)
          : null,
      recommendationBenefitAnalysisTargetDate:
        data.recommendationBenefitAnalysisTargetDate
          ? new Date(data.recommendationBenefitAnalysisTargetDate)
          : null,
      ageOfRecommendation: data.ageOfRecommendation?.toString() || "",
      noOfOverdueDays: data.noOfOverdueDays?.toString() || "",
      recommendationInitiatedByName:
        data.recommendationInitiatedByName || user?.name || "",
      recommendationInitiatedById:
        data.recommendationInitiatedById || user?.jsplid || "",
      recommendationInitiatedByEmail:
        data.recommendationInitiatedByEmail || user?.email || "",
      recommendationDiscussedWithHOD: data.recommendationDiscussedWithHOD || "",
      dateOfDiscussionWithHOD: data.dateOfDiscussionWithHOD
        ? new Date(data.dateOfDiscussionWithHOD)
        : null,
      responsiblePersonForRecommendationClosureName:
        data.responsiblePersonForRecommendationClosureName || "",
      responsiblePersonForRecommendationClosureId:
        data.responsiblePersonForRecommendationClosureId || "",
      responsiblePersonForRecommendationClosureEmail:
        data.responsiblePersonForRecommendationClosureEmail || "",
      recommendationStatus: data.recommendationStatus || "",
      reasonForRejection: data.reasonForRejectionRequest || "",
      remarks: data.remarks || "",
    edRejectApprovalDecision: data.edRejectApprovalDecision || "",
      edRemarks: data.edRemarks || "",
      evidenceFileId: data.evidenceFilePath || "",
      evidenceFileName: data.evidenceFileName || "",
    }),
    [user, userUnit],
  );

  // Load masters
  useEffect(() => {
    const fetchMaster = (url: string, setter: (data: any) => void) => {
      serverRequest({}, url, CONSTANTS.REQUEST_GET, true, true, token).then(
        (res) => {
          if (res)
            setter(res.map((i: any) => ({ label: i.name, value: i.name })));
        },
      );
    };
    fetchMaster(
      RECOMMENDATION_TRACKER_MASTER + "/SourceMaster/get-sources",
      setSourceMaster,
    );
    fetchMaster(
      RECOMMENDATION_TRACKER_MASTER +
        "/RecommendationTypeMaster/get-recommendation-types",
      setRecommendationTypeMaster,
    );
    fetchMaster(
      RECOMMENDATION_TRACKER_MASTER +
        "/InjuryPotentialMaster/get-injury-potentials",
      setInjuryPotentialMaster,
    );
  }, [token]);

  // Fetch user's unit
  useEffect(() => {
    if (!user?.empUnit) return;
    serverRequest(
      {},
      `${FETCH_UNITS}/${user.empUnit}`,
      CONSTANTS.REQUEST_GET,
      true,
      true,
      token,
    )
      .then((res) => {
        if (res)
          setUserUnit({
            unitId: res.unitid?.toString() || "",
            unitName: res.unitname || "",
          });
      })
      .catch(() => toast.error("Failed to fetch unit"));
  }, [user, token]);

  // Fetch departments when unit changes
  useEffect(() => {
    if (!userUnit?.unitId) return;
    setIsLoadingDepartments(true);
    serverRequest(
      {},
      `${FETCH_DEPARTMENTS}/get-departments/${userUnit.unitId}`,
      CONSTANTS.REQUEST_GET,
      true,
      true,
      token,
    )
      .then((res) => {
        if (Array.isArray(res)) {
          setDepartmentMaster(
            res.map((i: any) => ({
              label: i.departmentname,
              value: i.departmentid?.toString(),
              departmentName: i.departmentname,
              departmentId: i.departmentid?.toString(),
              hod: i.hod || "",
              hodId: i.jsplid || "",
              hodEmail: i.hodEmail || "",
            })),
          );
        }
      })
      .finally(() => setIsLoadingDepartments(false));
  }, [userUnit, token]);

  // Load data for draft edit or review
  useEffect(() => {
    if (mode === "edit-draft" && objectId) {
      serverRequest(
        {},
        `${RECOMMENDATION_TRACKER}/get-draft/${user.sub}/${objectId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token,
      )
        .then((res) => {
          if (res) {
            const data = res.data || res;
            setDraftObjectId(objectId);
            setInitialFormData(mapApiDataToFormValues(data));
            // Auto-complete all sections for draft mode
            setCompletedSections(new Set(sections.map((_, i) => i)));
          }
        })
        .catch(() => toast.error("Failed to load draft"));
    } else if (
      (mode === "review-hod" || mode === "review-ed") &&
      recommendationId
    ) {
      serverRequest(
        {},
        `${RECOMMENDATION_TRACKER}/get-recommendationtracker/${recommendationId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token,
      )
        .then((res) => {
          if (res) {
            const data = res.data || res;
            setInitialFormData(mapApiDataToFormValues(data));
          }
        })
        .catch(() => toast.error("Failed to load recommendation"));
    }else if (
      (mode === "view") &&
      recommendationId
    ) {
      serverRequest(
        {},
        `${RECOMMENDATION_TRACKER}/get-recommendationtracker/${recommendationId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token,
      )
        .then((res) => {
          if (res) {
            const data = res.data || res;
            setInitialFormData(mapApiDataToFormValues(data));
          }
        })
        .catch(() => toast.error("Failed to load recommendation"));
    }
    else if (mode === "create") {
      // Build empty form with user defaults
      const empty = mapApiDataToFormValues({});
      empty.unitId = userUnit?.unitId || "";
      empty.unitName = userUnit?.unitName || "";
      empty.departmentId = user?.empDepartment || "";
      empty.departmentName = user?.departmentDisplay || "";
      empty.responsiblePersonForRecommendationClosureName =
        user?.departmentHod || "";
      setInitialFormData(empty);
      setCompletedSections(new Set());
    }
  }, [
    mode,
    objectId,
    recommendationId,
    user,
    userUnit,
    token,
    mapApiDataToFormValues,
  ]);

  // Section locking logic (only for create mode)
  const isSectionUnlocked = (idx: number) => {
    if (mode !== "create") return true;
    if (idx === 0) return true;
    return completedSections.has(idx - 1);
  };
  const isSectionValid = (
    sectionIdx: number,
    values: RecommendationFormValues,
  ) => {
    const required = sections[sectionIdx].requiredFields;
    if (required.length === 0) return true;
    return required.every((field) => {
      const val = values[field as keyof RecommendationFormValues];
      return (
        val !== null &&
        val !== undefined &&
        (typeof val !== "string" || val.trim() !== "")
      );
    });
  };

  // Save draft (create mode)
  const saveDraft = async (values: RecommendationFormValues) => {
    if (mode !== "create") return;
    const payload = transformToApiPayload(
      values,
      user.sub,
      user.name,
      user.email,
      draftObjectId,
    );
    const response = await serverRequest(
      payload,
      RECOMMENDATION_TRACKER + "/save-recommendationtracker",
      CONSTANTS.REQUEST_POST,
      true,
      true,
      token,
    );
    if (response?.objectId && !draftObjectId)
      setDraftObjectId(response.objectId);
    return response;
  };

  // Publish (final submit for create or edit-draft)
  const handlePublish = async (values: RecommendationFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = transformToApiPayload(
        values,
        user.sub,
        user.name,
        user.email,
        draftObjectId,
      );
      payload.recommendationStatus = "Open";
      const response = await serverRequest(
        payload,
        RECOMMENDATION_TRACKER + "/save-recommendationtracker/publish",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token,
      );
      if (response) {
        toast.success("Recommendation published successfully!");
        setTimeout(() => router.push(APP_URL.RECOMMENDATION_DASHBOARD), 1000);
      } else {
        toast.error("Failed to publish");
        setIsSubmitting(false);
        if (publishBtnRef.current) publishBtnRef.current.disabled = false;
      }
    } catch {
      toast.error("Failed to publish");
      setIsSubmitting(false);
      if (publishBtnRef.current) publishBtnRef.current.disabled = false;
    }
  };

  const handleDownloadEvidence = async () => {
    if (!initialFormData?.evidenceFileId) {
      toast.error("No evidence file attached");
      return;
    }
    const payload = initialFormData.evidenceFileId;
      
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

  // Review actions (HOD)
  const handleRequestRejection = async (values: RecommendationFormValues) => {
    if (values.recommendationStatus !== "Rejection Requested") {
      toast.error("Select 'Rejection Requested' status");
      return;
    }
      setIsReviewSubmitting(true); // ← add this

    try {
      const res = await serverRequest(
        {
          Id: recommendationId,
          recommendationStatus: values.recommendationStatus,
          reasonForRejectionRequest: values.reasonForRejection,
          remarks: values.remarks,
          rejectRequestedById: user.jsplid,
          rejectRequestedByName: user.name,
          rejectRequestedByEmail: user.email,
          updatedById: user.jsplid,
          updatedByEmail: user.email,
          updatedByName: user.name,
          noOfOverdueDays: parseInt(values.noOfOverdueDays),
        },
        `${RECOMMENDATION_TRACKER}/request-rejection/${recommendationId}`,
        CONSTANTS.REQUEST_PATCH,
        true,
        true,
        token,
      );
      if (res) {
        toast.success("Rejection requested successfully");
        setTimeout(() => {
          router.push(APP_URL.RECOMMENDATION_DASHBOARD);
        }, 1000);
      }
    } catch {
      toast.error("Failed");
    }
  };

  const handleClose = async (values: RecommendationFormValues) => {
    if (values.recommendationStatus !== "Close") {
      toast.error("Select 'Close' status");
      return;
    }
    if (
      !uploadedFile ||
      !values.remarks?.trim() ||
      !values.reasonForRejection?.trim()
    ) {
      toast.error("Please fill mandatory fields");
      return;
    }
      setIsReviewSubmitting(true); // ← add this

    let evidenceFileId = "",
      evidenceFileName = "";
    if (uploadedFile) {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      const uploadRes = await serverRequest(
        formData,
        UPLOAD_FILE,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token,
        true,
        false
      );
      if (uploadRes?.success && uploadRes?.objectId) {
        evidenceFileId = uploadRes.objectId;
        evidenceFileName = uploadedFileName;
      } else {
        toast.error("File upload failed");
        return;
      }
    }
    try {
      const res = await serverRequest(
        {
          Id: recommendationId,
          recommendationStatus: "Close",
          evidenceFileName,
          evidenceFilePath: evidenceFileId,
          remarks: values.remarks,
          updatedById: user.jsplid,
          updatedByName: user.name,
          updatedByEmail: user.email,
          noOfOverdueDays: parseInt(values.noOfOverdueDays),
        },
        `${RECOMMENDATION_TRACKER}/close/${recommendationId}`,
        CONSTANTS.REQUEST_PATCH,
        true,
        true,
        token,
      );
      if (res) {
        toast.success("Recommendation closed successfully");
        setTimeout(() => {
          router.push(APP_URL.RECOMMENDATION_DASHBOARD);
        }, 1000);
      }
    } catch {
      toast.error("Failed to close");
    }
  };

  // Review actions (ED)
  const handleEdDecision = async (
    values: RecommendationFormValues,
    decision: "YES" | "NO",
  ) => {
    if (!values.edRejectApprovalDecision?.trim() || !values.edRemarks?.trim()) {
      toast.error("Please fill mandatory fields");
      return;
    }
    setIsReviewSubmitting(true); // disable button

    try {
      const res = await serverRequest(
        {
          Id: recommendationId,
          edRejectApprovalDecision: decision,
          edRemarks: values.edRemarks,
          rejectRequestedById: user.jsplid,
          rejectRequestedByName: user.name,
          rejectRequestedByEmail: user.email,
          updatedById: user.jsplid,
          updatedByEmail: user.email,
          updatedByName: user.name,
          noOfOverdueDays: parseInt(values.noOfOverdueDays),
        },
        `${RECOMMENDATION_TRACKER}/ed-rejection-decision/${recommendationId}`,
        CONSTANTS.REQUEST_PATCH,
        true,
        true,
        token,
      );
      if (res) {
        toast.success(
          `Rejection ${decision === "YES" ? "approved" : "rejected"} successfully`,
        );
        setTimeout(() => {
          router.push(APP_URL.RECOMMENDATION_DASHBOARD);
        }, 1000);
      }
    } catch {
      toast.error("Failed");
    }
  };

  // File upload helpers
 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Revoke previous preview URL to avoid memory leaks
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);

    setUploadedFile(file);
    setUploadedFileName(file.name);
    // Create a preview URL only for image files
    if (file.type.startsWith("image/")) {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl(null); // non‑image files show only name
    }
  } else {
    clearUploadedFile();
  }
};

const clearUploadedFile = () => {
  if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
  setUploadedFile(null);
  setUploadedFileName("");
  setFilePreviewUrl(null);
  const input = document.getElementById("fileUpload") as HTMLInputElement;
  if (input) input.value = "";
};

useEffect(() => {
  return () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
  };
}, [filePreviewUrl]);


  if (!initialFormData) return <div>Loading...</div>;

  const isReview = mode === "review-hod" || mode === "review-ed";
  const isEd = mode === "review-ed";
  const isView = mode === "view";

  


const today = new Date();
today.setHours(0, 0, 0, 0);

// Date of Recommendation: 3 months back to today
const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(today.getMonth() - 1);
threeMonthsAgo.setHours(0, 0, 0, 0);

// For dateOfDiscussionWithHOD: max today, min 1 year ago
const aYearAgo = new Date();
aYearAgo.setFullYear(today.getFullYear() - 1);
aYearAgo.setHours(0, 0, 0, 0);


  return (
    <Formik
      initialValues={initialFormData}
      enableReinitialize
      onSubmit={() => {}}
    >
      {({
        values,
        setFieldValue,
        handleChange,
        handleBlur,
        touched,
        errors,
        validateForm,
      }) => {
        // Auto-calculations (same as original)
        

        const allSectionsDone = completedSections.size === sections.length;
        const allRequiredFilled = sections.every((s, idx) =>
          isSectionValid(idx, values),
        );
        const canPublish =
          mode === "create" &&
          allSectionsDone &&
          allRequiredFilled &&
          values.recommendationDiscussedWithHOD === "Yes";
        const canPublishDraft = mode === "edit-draft" && allRequiredFilled; // no HOD check for draft edit

        useEffect(() => {
          const c = parseFloat(values.initialConsequence);
          const l = parseFloat(values.initialLikelihood);
          if (!isNaN(c) && !isNaN(l) && c >= 1 && c <= 5 && l >= 1 && l <= 5)
            setFieldValue("initialRiskScore", (c * l).toString());
          else setFieldValue("initialRiskScore", "");
        }, [values.initialConsequence, values.initialLikelihood]);
        useEffect(() => {
          const c = parseFloat(values.finalConsequence);
          const l = parseFloat(values.finalLikelihood);
          if (!isNaN(c) && !isNaN(l) && c >= 1 && c <= 5 && l >= 1 && l <= 5)
            setFieldValue("finalRiskScore", (c * l).toString());
          else setFieldValue("finalRiskScore", "");
        }, [values.finalConsequence, values.finalLikelihood]);
        useEffect(() => {
          const people = getPeopleValue(values.initialConsequence);
          const q = parseFloat(values.assetRepairOrReplacementCost) || 0;
          const r = parseFloat(values.costOfProductionLossPerDay) || 0;
          const CR = 10_000_000;
          const minVal = people + q + r;
          const medVal = people + q + 7 * r;
          const maxVal = people + q + 30 * r;
          setFieldValue("riskImpactMin", (minVal / CR).toFixed(4));
          setFieldValue("riskImpactMedium", (medVal / CR).toFixed(4));
          setFieldValue("riskImpactMax", (maxVal / CR).toFixed(4));
          setFieldValue("benefitOfImplementationInInr", minVal.toFixed(2));
        }, [
          values.initialConsequence,
          values.assetRepairOrReplacementCost,
          values.costOfProductionLossPerDay,
        ]);

       useEffect(() => {
  if (values.dateOfRecommendation) {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const recDate = new Date(values.dateOfRecommendation);
    recDate.setHours(0, 0, 0, 0);
    
    // Age = difference from recommendation date to today
    const diffTime = todayDate.getTime() - recDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setFieldValue("ageOfRecommendation", diffDays > 0 ? diffDays.toString() : "0");
  } else {
    setFieldValue("ageOfRecommendation", "");
  }
}, [values.dateOfRecommendation]);


       useEffect(() => {
  if (values.recommendationImplementationActualDate) {
    const benefitDate = new Date(values.recommendationImplementationActualDate);
    benefitDate.setFullYear(benefitDate.getFullYear() + 1);
    setFieldValue("recommendationBenefitAnalysisTargetDate", benefitDate);
  } else {
    setFieldValue("recommendationBenefitAnalysisTargetDate", null);
  }
}, [values.recommendationImplementationActualDate]);


      // 1. Update the noOfOverdueDays calculation effect:

useEffect(() => {
  if (values.recommendationImplementationTargetDate && values.recommendationImplementationActualDate) {
    const target = new Date(values.recommendationImplementationTargetDate);
    target.setHours(0, 0, 0, 0);
    const actual = new Date(values.recommendationImplementationActualDate);
    actual.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = actual.getTime() - target.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Only show positive values for overdue days (completed early = 0 overdue)
    setFieldValue("noOfOverdueDays", diffDays > 0 ? diffDays.toString() : "0");
  } else {
    setFieldValue("noOfOverdueDays", "");
  }
}, [values.recommendationImplementationTargetDate, values.recommendationImplementationActualDate]);


        useEffect(() => {
          if (!values.departmentId || !departmentMaster.length) return;

          const selectedDept = departmentMaster.find(
            (dept) => dept.value === values.departmentId,
          );

          if (selectedDept) {
            setFieldValue(
              "responsiblePersonForRecommendationClosureName",
              selectedDept.hod || "",
            );

            setFieldValue(
              "responsiblePersonForRecommendationClosureId",
              selectedDept.hodId || "",
            );

            setFieldValue(
              "responsiblePersonForRecommendationClosureEmail",
              selectedDept.hodEmail || "",
            );
          }
        }, [values.departmentId, departmentMaster]);

        // Render a single field (simplified – you can copy the full renderField from original)
        const renderField = (fieldName: string) => {
          const commonProps = {
            values,
            handleChange,
            handleBlur,
            setFieldValue,
            touched,
            errors,
          };
          switch (fieldName) {
            case "source":
              return (
                <div className="col-md-3" key="source">
                  <SelectField
                    key="source"
                    label="Source *"
                    name="source"
                    value={
                      sourceMaster.find((o) => o.value === values.source) ||
                      null
                    }
                    options={sourceMaster}
                    onChange={(opt: any) => setFieldValue("source", opt.value)}
                    placeholder="Select Source"
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "unitName":
              return (
                <div className="col-md-3" key="unitName">
                  <InputField
                    type="text"
                    onChange={() => {}}
                    placeholder="Unit Name"
                    key="unitName"
                    label="Unit Name *"
                    name="unitName"
                    value={userUnit?.unitName || ""}
                    disabled
                    touched={touched.unitName}
                    errors={errors.unitName}
                  />
                </div>
              );
            case "departmentName":
              return (
                <div className="col-md-3" key="departmentName">
                  <SelectField
                    key="departmentName"
                    label="Department *"
                    name="departmentName"
                    value={
                      departmentMaster.find(
                        (d) => d.value === values.departmentId,
                      ) || null
                    }
                    options={departmentMaster}
                    onChange={(opt: any) => {
                      setFieldValue("departmentId", opt.value);
                      setFieldValue("departmentName", opt.label);
                      setFieldValue(
                        "responsiblePersonForRecommendationClosureName",
                        opt.hod,
                      );
                      setFieldValue(
                        "responsiblePersonForRecommendationClosureId",
                        opt.hodId,
                      );
                      setFieldValue(
                        "responsiblePersonForRecommendationClosureEmail",
                        opt.hodEmail,
                      );
                    }}
                    placeholder="Select Department"
                    disabled
                  />
                </div>
              );
            case "equipmentId":
              return (
                <div className="col-md-3" key="equipmentId">
                  <InputField
                    placeholder="Equipment Id"
                    type="text"
                    key="equipmentId"
                    label="Equipment ID *"
                    name="equipmentId"
                    value={values.equipmentId}
                    onChange={handleChange}
                    touched={touched.equipmentId}
                    errors={errors.equipmentId}
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "equipmentType":
              return (
                <div className="col-md-3" key="equipmentType">
                  <SelectField
                    placeholder="Equipment Type"
                    key="equipmentType"
                    label="Equipment Type *"
                    name="equipmentType"
                    value={{
                      value: values.equipmentType,
                      label: values.equipmentType,
                    }}
                    options={[
                      { value: "Type1", label: "Type1" },
                      { value: "Type2", label: "Type2" },
                      { value: "Type3", label: "Type3" },
                    ]}
                    onChange={(opt: any) =>
                      setFieldValue("equipmentType", opt.value)
                    }
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "equipmentDescription":
              return (
                <div className="col-md-9" key="equipmentDescription">
                  <InputField
                    placeholder="Equipment Description"
                    type="text"
                    key="equipmentDescription"
                    label="Equipment Description"
                    name="equipmentDescription"
                    value={values.equipmentDescription}
                    onChange={handleChange}
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "repairOrReplacement":
              return (
                <div className="col-md-3" key="repairOrReplacement">
                  <SelectField
                    placeholder="Repair/Replacement"
                    key="repairOrReplacement"
                    label="Repair/Replacement Required *"
                    name="repairOrReplacement"
                    value={{
                      value: values.repairOrReplacement,
                      label: values.repairOrReplacement,
                    }}
                    options={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" },
                    ]}
                    onChange={(opt: any) =>
                      setFieldValue("repairOrReplacement", opt.value)
                    }
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "recommendationDescription":
              return (
                <InputField
                  type="text"
                  placeholder="Recommendation Description"
                  key="recommendationDescription"
                  label="Recommendation Description *"
                  name="recommendationDescription"
                  value={values.recommendationDescription}
                  onChange={handleChange}
                    disabled={isReview || isView}
                />
              );
            case "recommendationType":
              return (
                <div className="col-md-4" key="recommendationType">
                  <SelectField
                    key="recommendationType"
                    placeholder="Recommendation Type"
                    label="Recommendation Type *"
                    name="recommendationType"
                    value={
                      recommendationTypeMaster.find(
                        (o) => o.value === values.recommendationType,
                      ) || null
                    }
                    options={recommendationTypeMaster}
                    onChange={(opt: any) =>
                      setFieldValue("recommendationType", opt.value)
                    }
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "initialConsequence":
              return (
                <div className="col-md-3" key="initialConsequence">
                  <InputField
                    placeholder="Intial Consequence"
                    key="initialConsequence"
                    label="Initial Consequence (1-5) *"
                    type="number"
                    name="initialConsequence"
                    value={values.initialConsequence}
                    onChange={(e: any) => {
                      const value = e.target.value;

                      if (
                        value === "" ||
                        (Number(value) >= 1 && Number(value) <= 5)
                      ) {
                        setFieldValue("initialConsequence", value);
                      }
                    }}
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "initialLikelihood":
              return (
                <div className="col-md-3" key="initialLikelihood">
                  <InputField
                    placeholder="Initial Likelihood"
                    key="initialLikelihood"
                    label="Initial Likelihood (1-5) *"
                    type="number"
                    name="initialLikelihood"
                    value={values.initialLikelihood}
                    onChange={(e: any) => {
                      const value = e.target.value;

                      if (
                        value === "" ||
                        (Number(value) >= 1 && Number(value) <= 5)
                      ) {
                        setFieldValue("initialLikelihood", value);
                      }
                    }}
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "initialRiskScore":
              return (
                <div className="col-md-3" key="initialRiskScore">
                  <InputField
                    placeholder="Initial Risk Score"
                    type="number"
                    onChange={() => {}}
                    key="initialRiskScore"
                    label="Initial Risk Score"
                    name="initialRiskScore"
                    value={values.initialRiskScore}
                    disabled
                  />
                </div>
              );
            case "injuryPotential":
              return (
                <div className="col-md-3" key="injuryPotential">
                  <SelectField
                    placeholder="Select Injury Potential"
                    key="injuryPotential"
                    label="Injury Potential *"
                    name="injuryPotential"
                    value={
                      injuryPotentialMaster.find(
                        (o) => o.value === values.injuryPotential,
                      ) || null
                    }
                    options={injuryPotentialMaster}
                    onChange={(opt: any) =>
                      setFieldValue("injuryPotential", opt.value)
                    }
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "assetRepairOrReplacementCost":
              return (
                <div className="col-md-3" key="assetRepairOrReplacementCost">
                  <CurrencyInputWithUnit
                    key="assetRepairOrReplacementCost"
                    label="Asset Repair/Replacement Cost (₹)"
                    name="assetRepairOrReplacementCost"
                    value={values.assetRepairOrReplacementCost}
                    onChange={(val) =>
                      setFieldValue("assetRepairOrReplacementCost", val)
                    }
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "costOfProductionLossPerDay":
              return (
                <div className="col-md-3" key="costOfProductionLossPerDay">
                  <CurrencyInputWithUnit
                    key="costOfProductionLossPerDay"
                    label="Cost of Production Loss per Day (₹)"
                    name="costOfProductionLossPerDay"
                    value={values.costOfProductionLossPerDay}
                    onChange={(val) =>
                      setFieldValue("costOfProductionLossPerDay", val)
                    }
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "riskImpactMin":
              return (
                <div className="col-md-2" key="riskImpactMin">
                  <InputField
                    placeholder="Risk Impact Min"
                    type="number"
                    onChange={() => {}}
                    key="riskImpactMin"
                    label="Risk Impact Min (Cr)"
                    name="riskImpactMin"
                    value={values.riskImpactMin}
                    disabled
                  />
                </div>
              );
            case "riskImpactMedium":
              return (
                <div className="col-md-2" key="riskImpactMedium">
                  <InputField
                    placeholder="Risk Impact Medium"
                    type="number"
                    onChange={() => {}}
                    key="riskImpactMedium"
                    label="Risk Impact Medium (Cr)"
                    name="riskImpactMedium"
                    value={values.riskImpactMedium}
                    disabled
                  />
                </div>
              );

            case "riskImpactMax":
              return (
                <div className="col-md-2" key="riskImpactMax">
                  <InputField
                    placeholder="Risk Impact Max"
                    type="number"
                    onChange={() => {}}
                    key="riskImpactMax"
                    label="Risk Impact Max (Cr)"
                    name="riskImpactMax"
                    value={values.riskImpactMax}
                    disabled
                  />
                </div>
              );

            case "finalConsequence":
              return (
                <div className="col-md-3" key="finalConsequence">
                  <InputField
                    placeholder="Final Consequence (1-5)"
                    key="finalConsequence"
                    label="Final Consequence (1-5)"
                    type="number"
                    name="finalConsequence"
                    value={values.finalConsequence}
                    onChange={(e: any) => {
                      const value = e.target.value;

                      if (
                        value === "" ||
                        (Number(value) >= 1 && Number(value) <= 5)
                      ) {
                        setFieldValue("finalConsequence", value);
                      }
                    }}
                    disabled={isReview || isView}
                  />
                </div>
              );

            case "finalLikelihood":
              return (
                <div className="col-md-3" key="finalLikelihood">
                  <InputField
                    placeholder="Final Likelihood (1-5)"
                    key="finalLikelihood"
                    label="Final Likelihood (1-5)"
                    type="number"
                    name="finalLikelihood"
                    value={values.finalLikelihood}
                    onChange={(e: any) => {
                      const value = e.target.value;

                      if (
                        value === "" ||
                        (Number(value) >= 1 && Number(value) <= 5)
                      ) {
                        setFieldValue("finalLikelihood", value);
                      }
                    }}
                    disabled={isReview || isView}
                  />
                </div>
              );

            case "finalRiskScore":
              return (
                <div className="col-md-3" key="finalRiskScore">
                  <InputField
                    placeholder="Final Risk Score"
                    type="number"
                    onChange={() => {}}
                    key="finalRiskScore"
                    label="Final Risk Score"
                    name="finalRiskScore"
                    value={values.finalRiskScore}
                    disabled
                  />
                </div>
              );

            case "benefitOfImplementationInInr":
              return (
                <div className="col-md-3" key="benefitOfImplementationInInr">
                  <InputField
                    placeholder="Benefit of Implementation in INR"
                    type="number"
                    onChange={() => {}}
                    key="benefitOfImplementationInInr"
                    label="Benefit of Implementation (₹)"
                    name="benefitOfImplementationInInr"
                    value={values.benefitOfImplementationInInr}
                    disabled
                  />
                </div>
              );

            case "estimatedImplementationCostInInr":
              return (
                <div
                  className="col-md-4"
                  key="estimatedImplementationCostInInr"
                >
                  <CurrencyInputWithUnit
                    placeholder="Estimated Cost"
                    key="estimatedImplementationCostInInr"
                    label="Estimated Cost for Implementation (₹)"
                    name="estimatedImplementationCostInInr"
                    value={values.estimatedImplementationCostInInr}
                    onChange={(val) =>
                      setFieldValue("estimatedImplementationCostInInr", val)
                    }
                    disabled={isReview || isView}
                  />
                </div>
              );

            case "shutdownRequirement":
              return (
                <div className="col-md-3" key="shutdownRequirement">
                  <SelectField
                    placeholder="SelectShutdown Requirement"
                    key="shutdownRequirement"
                    label="Shutdown Requirement"
                    name="shutdownRequirement"
                    value={{
                      value: values.shutdownRequirement,
                      label: values.shutdownRequirement,
                    }}
                    options={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" },
                    ]}
                    onChange={(opt: any) =>
                      setFieldValue("shutdownRequirement", opt.value)
                    }
                    disabled={isReview || isView}
                  />
                </div>
              );

            case "dateOfRecommendation":
              return (
                <div className="col-md-3" key="dateOfRecommendation">
                  <DatePickerField
                    placeholder="Date of Recommendation"
                    key="dateOfRecommendation"
                    label="Date of Recommendation *"
                    name="dateOfRecommendation"
                    value={values.dateOfRecommendation}
                    onChange={(d) => {
          setFieldValue("dateOfRecommendation", d);
          // Reset target date if it becomes invalid
          if (values.recommendationImplementationTargetDate && d) {
            const maxTargetDate = new Date(d);
            maxTargetDate.setFullYear(d.getFullYear() + 1);
            if (values.recommendationImplementationTargetDate > maxTargetDate) {
              setFieldValue("recommendationImplementationTargetDate", null);
            }
          }
        }}
                    disabled={isReview || isView}
                   minDate={threeMonthsAgo}
        maxDate={today}
                  />
                </div>
              );
            case "recommendationImplementationTargetDate":
  // Calculate min and max based on dateOfRecommendation
  let minTargetDate = null;
  let maxTargetDate = null;
  if (values.dateOfRecommendation) {
    minTargetDate = new Date(values.dateOfRecommendation);
    maxTargetDate = new Date(values.dateOfRecommendation);
    maxTargetDate.setFullYear(maxTargetDate.getFullYear() + 1);
  }
  
  return (
    <div
      className="col-md-3"
      key="recommendationImplementationTargetDate"
    >
      <DatePickerField
        placeholder="Target Implementation Date"
        key="recommendationImplementationTargetDate"
        label="Target Implementation Date"
        name="recommendationImplementationTargetDate"
        value={values.recommendationImplementationTargetDate}
        onChange={(d) => {
          setFieldValue("recommendationImplementationTargetDate", d);
          // Reset actual date if it becomes invalid
          if (values.recommendationImplementationActualDate && d && 
              values.recommendationImplementationActualDate < d) {
            setFieldValue("recommendationImplementationActualDate", null);
          }
        }}
        disabled={isReview || isView}
        minDate={minTargetDate} // Can't be before recommendation date
        maxDate={maxTargetDate} // Can't be more than 1 year after recommendation date
      
      />
    </div>
  );
           case "recommendationImplementationActualDate":
  // Calculate min based on dateOfRecommendation (can't be before recommendation date)
  let minActualDate = null;
  if (values.dateOfRecommendation) {
    minActualDate = new Date(values.dateOfRecommendation);
  }
  
  return (
    <div
      className="col-md-3"
      key="recommendationImplementationActualDate"
    >
      <DatePickerField
        placeholder="Actual Implementation Date"
        key="recommendationImplementationActualDate"
        label="Actual Implementation Date"
        name="recommendationImplementationActualDate"
        value={values.recommendationImplementationActualDate}
        onChange={(d) => {
          setFieldValue("recommendationImplementationActualDate", d);
          // No need to validate against target date anymore
        }}
        disabled={isReview || isView}
        minDate={minActualDate} // Can't be before recommendation date
        maxDate={null} // No max limit - can be any date in future or past
      />
    </div>
  );
            case "ageOfRecommendation":
              return (
                <div className="col-md-3" key="ageOfRecommendation">
                  <InputField
                    placeholder="Age of Recommendation (Days)"
                    onChange={() => {}}
                    type="number"
                    key="ageOfRecommendation"
                    label="Age of Recommendation (Days)"
                    name="ageOfRecommendation"
                    value={values.ageOfRecommendation}
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "recommendationBenefitAnalysisTargetDate":
              return (
                <div
                  className="col-md-3"
                  key="recommendationBenefitAnalysisTargetDate"
                >
                  <DatePickerField
                    placeholder="Benefit Analysis Target Date"
                    onChange={() => {}}
                    key="recommendationBenefitAnalysisTargetDate"
                    label="Benefit Analysis Target Date"
                    name="recommendationBenefitAnalysisTargetDate"
                    value={values.recommendationBenefitAnalysisTargetDate}
                    disabled
                   
                  />
                </div>
              );
            case "noOfOverdueDays":
              return (
                <div className="col-md-3" key="noOfOverdueDays">
                  <InputField
                    placeholder="Number of Overdue Days"
                    type="number"
                    onChange={() => {}}
                    key="noOfOverdueDays"
                    label="Overdue Days"
                    name="noOfOverdueDays"
                    value={values.noOfOverdueDays}
                    disabled
                  />
                </div>
              );
            case "recommendationInitiatedByName":
              return (
                <div className="col-md-3" key="recommendationInitiatedByName">
                  <InputField
                    placeholder="Initiated By"
                    type="text"
                    onChange={() => {}}
                    key="recommendationInitiatedByName"
                    label="Initiated By"
                    name="recommendationInitiatedByName"
                    value={values.recommendationInitiatedByName}
                    disabled
                  />
                </div>
              );
            case "recommendationDiscussedWithHOD":
              return (
                <div className="col-md-3" key="recommendationDiscussedWithHOD">
                  <SelectField
                    placeholder="Discussed with HOD"
                    key="recommendationDiscussedWithHOD"
                    label="Discussed With HOD *"
                    name="recommendationDiscussedWithHOD"
                    value={{
                      value: values.recommendationDiscussedWithHOD,
                      label: values.recommendationDiscussedWithHOD,
                    }}
                    options={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" },
                    ]}
                    onChange={(opt: any) =>
                      setFieldValue("recommendationDiscussedWithHOD", opt.value)
                    }
                    disabled={isReview || isView}
                  />
                </div>
              );
            case "dateOfDiscussionWithHOD":
  return (
    <div className="col-md-3" key="dateOfDiscussionWithHOD">
      <DatePickerField
        placeholder="Date of Discussion with HOD"
        key="dateOfDiscussionWithHOD"
        label="Date of Discussion with HOD *"
        name="dateOfDiscussionWithHOD"
        value={values.dateOfDiscussionWithHOD}
        onChange={(d) => setFieldValue("dateOfDiscussionWithHOD", d)}
        disabled={isReview || isView}
        minDate={aYearAgo}
        maxDate={today} // Cannot be future date
      />
    </div>
  );
            case "responsiblePersonForRecommendationClosureName":
              return (
                <div
                  className="col-md-3"
                  key="responsiblePersonForRecommendationClosureName"
                >
                  <InputField
                    placeholder="Responsible Person for Closure"
                    type="text"
                    onChange={() => {}}
                    key="responsiblePersonForRecommendationClosureName"
                    label="Responsible Person (HOD)"
                    name="responsiblePersonForRecommendationClosureName"
                    value={values.responsiblePersonForRecommendationClosureName}
                    disabled
                  />
                </div>
              );
            // Review‑only fields
            case "recommendationStatus":
  if (!isReview) return null;
      
  return ( 
    <div className="col-md-4" key="recommendationStatus">
     
      <SelectField
        placeholder="Select Decision"
        key="status"
        label="Select a Decision for this Recommendation *"
        name="recommendationStatus"
        value={statusOptions.find((o) => o.value === values.recommendationStatus) || null}
        options={statusOptions}
        onChange={(opt: any) => setFieldValue("recommendationStatus", opt.value)}
        disabled={isEd || isView}
      />
    </div>
  );

           case "reasonForRejection":
  if (!isReview && !isView) return null;
  return (
    <div className="col-md-4" key="reason">
      <InputField
        placeholder="Enter Reason"
        type="text"
        key="reason"
        label="Specific Reason for Requesting Rejection or Closing *"
        name="reasonForRejection"
        value={values.reasonForRejection}
        onChange={handleChange}
        disabled={isEd || isView}
      />
    </div>
  );

          case "remarks":
  if (!isReview && !isView) return null;
  return (
    <div className="col-md-4" key="remarks">
      <InputField
        placeholder="Remarks"
        type="text"
        key="remarks"
        label="Remarks *"
        name="remarks"
        value={values.remarks}
        onChange={handleChange}
        disabled={isEd || isView}
      />
    </div>
  );

           case "fileUpload":
  // Only show when HOD review mode and status is "Close"
  if (mode !== "review-hod" && mode !== "view") return null;
if (values.recommendationStatus !== "Close") return null;
if (mode !== "review-hod" && mode !== "view") return null;
if (values.recommendationStatus !== "Close") return null;

if (isView) {
  // Show existing file if any
  const hasFile = values.evidenceFileId && values.evidenceFileName;
  return (
    <div className="col-md-4" key="fileUpload">
      <label>Evidence File</label>
      {hasFile ? (
        <div>
          <a
            onClick={handleDownloadEvidence}
            style={{ textDecoration: "underline", color: "blue", cursor: "pointer" }}
          >
            {values.evidenceFileName}
          </a>
        </div>
      ) : (
        <span>No file uploaded</span>
      )}
    </div>
  );
}
// ... existing upload logic for review-hod mode

  return (
    <div className="col-md-4" key="fileUpload">
      <label>Upload Evidence (mandatory, in case of closing)</label>
      <input
        type="file"
        id="fileUpload"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="form-control"
      />
      {/* Preview area */}
      
      {uploadedFile && (
        <div className="mt-2">
          {filePreviewUrl ? (
            <img
              src={filePreviewUrl}
              alt="Preview"
              style={{ maxWidth: "120px", maxHeight: "90px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          ) : (
            <span className="badge bg-secondary">{uploadedFileName}</span>
          )}
          
        </div>
      )}
    </div>
  );

           case "edRejectApprovalDecision":
  if (!isEd && !isView) return null;
  return (
    <div className="col-md-4" key="eddecision">
      <SelectField
        placeholder="Select Decision"
        key="edDecision"
        label="Select a Decision for Rejection Request *"
        name="edRejectApprovalDecision"
        value={edDecisionOptions.find((o) => o.value === values.edRejectApprovalDecision) || null}
        options={edDecisionOptions}
        onChange={(opt: any) => setFieldValue("edRejectApprovalDecision", opt.value)}
        disabled={isView}
      />
    </div>
  );

           case "edRemarks":
  if (!isEd && !isView) return null;
  return (
    <div className="col-md-8" key="edremarks">
      <InputField
        placeholder="Remarks"
        type="text"
        key="edRemarks"
        label="Remarks *"
        name="edRemarks"
        value={values.edRemarks}
        onChange={handleChange}
        disabled={isView}
      />
    </div>
  );

            default:
              return null;
          }
        };

        const handleSaveSection = async (idx: number) => {
          if (mode !== "create") return;
          const requiredEmpty = sections[idx].requiredFields.some((field) => {
            const val = values[field as keyof RecommendationFormValues];
            return (
              val === null ||
              val === undefined ||
              (typeof val === "string" && val.trim() === "")
            );
          });
          if (requiredEmpty) {
            await validateForm();
            toast.error(
              `Please fill all required fields in ${sections[idx].title}`,
            );
            return;
          }
          await saveDraft(values);
          setCompletedSections((prev) => new Set(prev).add(idx));
          if (idx < sections.length - 1) setCurrentSection(idx + 1);
          else setCurrentSection(-1);
          toast.success(`Section ${idx + 1} saved`);
        };

// Add this helper function to determine status message and styling
const getStatusBannerInfo = () => {
  if (mode !== "view") return null;
  
  const status = values.recommendationStatus;
  
  switch(status) {
    case "Open":
      return {
        message: "Pending HOD Review",
       };
    case "Request Rejection":
      return {
        message: "Pending ED Review",
       
      };
    case "Close":
      return {
        message: "Closed by HOD",
       
      };
    case "Rejected":
      return {
        message: "Rejected by ED",
      
      };
    default:
      return null;
  }
};

// Add this banner JSX right after the adminAction div
const statusBanner = getStatusBannerInfo();

// Then in your return statement, add this right after the adminAction div:


const status = values.recommendationStatus;

const getViewSections = () => {
  if (mode !== "view") return null;
  
  // Show only main sections for Open status
  if (status === "Open") {
    return sections;
  }

  if (status === "Rejected") {
    return [...sections, hodReviewSection, edReviewSection];
  }

  if (status === "Request Rejection") {
    return [...sections, hodReviewSection];
  }

  if (status === "Close") {
    return [...sections, hodReviewSection];
  }
  
  // Default return - important! Return sections array as fallback
  return sections;
};

const allSections = (() => {
  switch(mode) {
    case "create":
    case "edit-draft":
      return sections;
    case "review-hod":
      return [...sections, hodReviewSection];
    case "review-ed":
      return [...sections, hodReviewSection, edReviewSection];
    case "view":
      return getViewSections() || sections; // Fallback to sections if null
    default:
      return sections;
  }
})();

        return (
         <Form className="recommendation-form">
    <div className="admin-boxContainer d3">
      <div className="adminAction">
        <a className="adminAction__title" href="/recommendation">
          <span className="icon">
            <img
              width="15"
              height="15"
              alt="back"
              src="/images/svg/arrow-left-grey.svg"
            />
          </span>
          {mode === "create"
            ? "Create Recommendation"
            : mode === "edit-draft"
              ? "Complete & Publish Draft"
              : mode === "review-hod"
                ? "Review by HOD"
                : mode === "review-ed"
                  ? "Review by ED"
                  : "View Recommendation"
          }
        </a>
      </div>
      
      {/* Add Status Banner for View Mode */}
      {mode === "view" && values.recommendationStatus && (
        <div className="d-flex justify-content-center text-danger" style={{ fontWeight: "bold" }}>

          <div>
            {getStatusBannerInfo()?.message || values.recommendationStatus}
          </div>
          {/* Optional: Add additional info based on status */}
         
        </div>
      )}
    </div>
    
            <div className="c-accordion__wrapper">
              {allSections.map((section, idx) => {
                const unlocked = isReview ? true : isSectionUnlocked(idx);
                const isOpen = isReview || isView ? true : currentSection === idx;
                const canToggle = !isReview && unlocked;

                return (
                  <div
                    key={idx}
                    className={`c-accordion ${!unlocked ? "c-accordion--locked" : ""}`}
                  >
                    <div
                      className="c-accordion__head"
                      onClick={() =>
                        canToggle && setCurrentSection(isOpen ? -1 : idx)
                      }
                      style={{ cursor: canToggle ? "pointer" : "default" }}
                    >
                      <div className="c-accordion__head--title">
                        {section.title}
                      </div>
                      <button
                        type="button"
                        className="c-accordion__head--btn"
                        disabled={!canToggle}
                      >
                        <img
                          height={20}
                          width={20}
                          alt="toggle"
                          src={
                            isOpen
                              ? "/images/svg/up-arrow.svg"
                              : "/images/svg/down-arrow.svg"
                          }
                        />
                      </button>
                    </div>
                    {isOpen && unlocked && (
                      <div className="c-accordion__body">
                        <div className="filters">
                          <div className="row form_grider d1">
                            {section.fields.map((f) => renderField(f))}
                          </div>
                        </div>
                        {mode === "create" && !isReview && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              padding: "12px 0",
                            }}
                          >
                            <button
                              type="button"
                              className="iconBtn green"
                              onClick={() => handleSaveSection(idx)}
                            >
                              Save & Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="actionWrapper mt-4">
              {mode === "create" && (
                <button
                  ref={publishBtnRef}
                  type="button"
                  className="iconBtn green v2"
                  disabled={isSubmitting || !canPublish}
                  onClick={() => handlePublish(values)}
                >
                  Publish
                </button>
              )}
              {mode === "edit-draft" && (
                <button
                  ref={publishBtnRef}
                  type="button"
                  className="iconBtn green v2"
                  disabled={isSubmitting || !canPublishDraft}
                  onClick={() => handlePublish(values)}
                >
                  Publish
                </button>
              )}
              {mode === "review-hod" && (
                <>
                  <button
                    type="button"
                    className="iconBtn green v2"
                    disabled={isReviewSubmitting} // ← add this line
                    onClick={() => {
                      if (
                        values.recommendationStatus === "Rejection Requested"
                      ) {
                        handleRequestRejection(values);
                      } else if (values.recommendationStatus === "Close") {
                        handleClose(values);
                      } else {
                        toast.error(
                          "Please select a valid Recommendation Status",
                        );
                      }
                    }}
                  >
                    Submit
                  </button>
                </>
              )}
              {mode === "review-ed" && (
                <>
                  <button
                    type="button"
                    className="iconBtn green v2"
                        disabled={isReviewSubmitting}   // ← add this line
                    onClick={() => {
                      if (values.edRejectApprovalDecision === "YES") {
                        handleEdDecision(values, "YES");
                      } else if (values.edRejectApprovalDecision === "NO") {
                        handleEdDecision(values, "NO");
                      } else {
                        toast.error("Please select a decision");
                      }
                    }}
                  >
                    Submit
                  </button>
                </>
              )}
            </div>
            <ToastContainer />
          </Form>
        );
      }}
    </Formik>
  );
};

export default RecommendationForm;
