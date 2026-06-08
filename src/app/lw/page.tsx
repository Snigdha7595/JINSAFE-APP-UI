"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image"
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { serverRequest } from "@/services/getServerSideRender";
import { emptySelector } from "@/config/config";
import { useSelector, useDispatch } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { clearObjectId, clearScheduleId, setObjectId, setScheduleId } from "@/store/slices/lwSlice";
import { useRouter } from "next/navigation";
import {
  FETCH_UNITS,
  FETCH_DEPARTMENTS,
  FETCH_SECTIONS,
  FETCH_LINEMANAGER,
  FETCH_LW,
  BUCKET_URL,
} from "@/config/apiConfig";
import { ToastContainer, toast } from "react-toastify";
import { useFormik } from "formik";

type FormValues = {
  siNo: string;
  fromDate: string;
  toDate: string;
  createdBy: string;
  userUnit: string;
  userDepartment: string;
  userSections: string;
  visitedUnit: string;
  visitedDepartment: string;
  visitedSections: string;
  status: Array<string>;
 };
 const monthOptions = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];
const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

const lw_dashboard = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter()
  const dispatch = useDispatch();
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [deletableLW, setDeletableLW] = useState<string>('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [drafts, setDrafts] = useState([]);
  const [publishedLWList, setPublishedLWList] = useState([])

  const handleEditClick = (draft: any) => {
    dispatch(setObjectId(draft.objectId));
     dispatch(setScheduleId(""));
    router.push(APP_URL.SAFETY_LW_NEW)
  };
  const handleLWNew = () => {
    dispatch(setObjectId(""));
    dispatch(setScheduleId(""));
    router.push(APP_URL.SAFETY_LW_NEW);
  };
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const currentYear = String(new Date().getFullYear());
  const yearOptions = Array.from({ length: 3 }, (_, index) => {
    const year = Number(currentYear) - index;
    return { label: `${year}`, value: `${year}` };
  });
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [lwCompliance, setLWCompliance] = useState<any>({});
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [visitedUnit, setVisitedUnit] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [visitedDepartment, setVisitedDepartment] = useState("");
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [visitedSections, setVisitedSections] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // const [status, setStatus] = useState(["Completed", "WIP"]);
  const [lwDetailBySiNo, setLwDetailBySiNo] = useState<any>({});
  const [isPublishedViewOpen, setIsPublishedViewnOpen] = useState(false);
  const [isViewActionOpen, setIsViewActionOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [actionsForView, setActionsForView] = useState([]);
  const [imagesForView, setImagesForView] = useState([]);
  const [filterValues, setFilterValues] = useState({
    siNo: null,
    fromDate: null,
    toDate: null,
    createdBy: user.createdBy,
    userUnit: null,
    userDepartment: null,
    userSections: null,
    visitedUnit: null,
    visitedDepartment: null,
    visitedSections: null,
    status: ["Completed", "WIP", "Done"],
  });
  
  useEffect(() => {
    fetchLWCompliance(user?.createdBy, year, month);
  }, [user?.createdBy, year, month]);

  const fetchDraftLWList = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_LW +"/get-drafts/" + user?.createdBy,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
         setDrafts(response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const removeDraftLW = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_LW+ `/remove-draft/${user?.createdBy}/${deletableLW}`,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
      if (response?.success) {
        fetchDraftLWList();
        // setDrafts(...drafts.filter(item => item.objectId !== deletableLW));
        setDrafts(drafts.filter(item => item.objectId !== deletableLW));
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setIsDeleteModalOpen(false)
      setDeletableLW('')
    }

  };

   const fetchPublishedLWList = async (filterValues) => {
    setPublishedLWList([]);
    try {
      const response = await serverRequest(
        filterValues,
        FETCH_LW+ "/get-lws",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response?.sos?.length > 0) {
        setPublishedLWList(response?.sos)
      }
    } catch (error) {
      console.error("Error fetching Published LWs:", error);
    }
  };
  const handleObservationView = async (row) => {
    setActionsForView(row?.actionsTaken);
    setImagesForView(row?.lwImages);
    setIsViewActionOpen(true);
  };
  const getPaginatedLWData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return publishedLWList.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(publishedLWList.length / newSize));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  useEffect(() => {
    setTotalPages(Math.ceil(publishedLWList.length / pageSize));
    // Reset to first page if current page exceeds total pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, publishedLWList.length, currentPage, totalPages]);

  const fetchLWBySiNo = async (id) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_LW+ `/${id}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
     if (response?.header) {
         setLwDetailBySiNo(response);
         setIsPublishedViewnOpen(true);
      }
    } catch (error) {
      console.error("Error fetching Action of LWs:", error);
    }
  };
  useEffect(() => {
    fetchUnits();
    fetchDraftLWList();
    fetchPublishedLWList(filterValues);
  }, [])

  const fetchLWCompliance = async (id, year, month) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_LW + `/get-lw-individual-compliance/${id}/${year}/${month}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.complianceCurrentMonth != null) {
        // console.log("response", response);
        setLWCompliance(response);
      } else {
        setLWCompliance({});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchUnits = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_UNITS + `/get-units`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
         const options = response.map((value) => ({
          value: value?.unitid,
          label: value?.unitname,
        }));
        setUnitOptions(options);
       } else {
        setUnitOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchDepartments = async (unitId) => {
    try {
      setDepartmentOptions(emptySelector);
      setSectionOptions(emptySelector);
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${unitId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((value) => ({
          value: value?.departmentid,
          label: value?.departmentname,
        }));
        setDepartmentOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchSections = async (departmentId) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/get-sections/${departmentId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((value) => ({
          value: value?.sectionid,
          label: value?.sectionname,
        }));
        setSectionOptions(options);
       }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const formik = useFormik<FormValues>({
    initialValues: {
    siNo: null,
    fromDate: null,
    toDate: null,
    createdBy: user?.createdBy || null,
    userUnit: null,
    userDepartment: null,
    userSections: null,
    visitedUnit: null,
    visitedDepartment: null,
    visitedSections: null,
    status: ["Completed", "WIP"],
    },
    onSubmit: async (values: FormValues) => {
      if (values?.fromDate && values?.toDate) 
      {
        const from = new Date(values.fromDate);
        const to = new Date(values.toDate);

        if (to < from) {
          toast.error("To Date must be greater than From Date");
          return;
        }
      }
      await fetchPublishedLWList(values);
      setIsFilterOpen(false);
    },
  });
  const resetFilterModal = () => {
    setVisitedUnit(null);
    setVisitedDepartment(null);
    setVisitedSections(null);
    formik.setFieldValue("visitedUnit", null);
    formik.setFieldValue("visitedDepartment", null);
    formik.setFieldValue("visitedSections", null);
    formik.setFieldValue("fromDate", null);
    formik.setFieldValue("toDate", null);
    setFromDate(null);
    setToDate(null);
  };

  const downloadFileFromLink = async (lwno) => {
    try {
        const response = await serverRequest(
            {},
            FETCH_LW + `/generate-pdf/`+ `${lwno}`,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            token,
            false,   
            true,  
           "blob"   // responseType — tell it to treat response as a Blob
        );
        let blob;
        if (response instanceof Response) {
            blob = await response.blob();
        } else {
            blob = response; // already a Blob
        }
        const url = window.URL.createObjectURL(blob);
        console.log("url",url);
        window.open(url, "_blank");
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 1000);
    } catch (error) {
        console.error("Open failed:", error);
        toast.error("File open failed. Please try again.");
    }
  };
  return (
    <>
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="container-fluid">
        <div className="admin-boxContainer d3 ">
          <div className="adminAction">
            <Link href={APP_URL.DASHBOARD} className="adminAction__title">
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

       {/* Block 1 */}
       {lwCompliance?.complianceCurrentMonth != null && (
        <>
        <div className="admin-boxContainer d2 mb-0" style={{ overflow: "visible", position: "relative", zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="m-0">LW Compliance</h4>
            <div className="d-flex align-items-center gap-2 ms-auto">
              {/* <button type="button"
                className="iconBtn orange d-flex align-items-center gap-1 px-1 py-1.5"
                style={{ marginTop: "-15px" }}
              >
                <span>My Action</span>
                <img
                  width="10"
                  height="10"
                  alt="icon"
                  src="/images/svg/icons/Add.svg"
                  className="img-fluid u-image"
                />
              </button> */}
             {/* <button
                className="iconBtn orange d-flex align-items-center gap-1 px-1 py-1.5"
                style={{ marginTop: "-15px" }}
              >
                <span>View Graph</span>
                <img
                  width="10"
                  height="10"
                  alt="icon"
                  src="/images/svg/bar-chart-2.svg"
                  className="img-fluid u-image"
                />
              </button> */}
              <div
                className="adminFilters__list">
                <SelectField
                  name="month"
                  placeholder="Choose Month"
                  options={monthOptions}
                  value={monthOptions.find((opt) => opt.value === month)}
                  onChange={(option) => setMonth(option.value)}
                />
              </div>
              <div className="adminFilters__list">
                <SelectField
                  // label="Select Year"
                  name="year"
                  placeholder="Choose Year"
                  options={yearOptions}
                  value={yearOptions.find((opt) => opt.value === year)}
                  onChange={(option) => setYear(option.value)}
                />
              </div>
            </div>
          </div>

          <hr className="d-block my-4 border border-dark w-100" />

          <div className="d-flex align-items-center gap-3">
            <span className="fw-semibold">Status:</span>
            <div className="d-flex align-items-center gap-2">
              <span>Week 1</span>
              <span
                className={`badge fs-6 px-2 py-1 ${
                  (lwCompliance?.complianceCurrentMonth?.week1Actual ?? 0) >
                    0 &&
                  (lwCompliance?.complianceCurrentMonth?.week1Actual ?? 0) >=
                    (lwCompliance?.complianceCurrentMonth?.week1Planned ?? 0)
                    ? "bg-success"
                    : "bg-danger"
                }`}
              >
                {lwCompliance?.complianceCurrentMonth?.week1Actual ?? 0}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span>Week 2</span>
              <span
                className={`badge fs-6 px-2 py-1 ${
                  (lwCompliance?.complianceCurrentMonth?.week2Actual ?? 0) >
                    0 &&
                  (lwCompliance?.complianceCurrentMonth?.week2Actual ?? 0) >=
                    (lwCompliance?.complianceCurrentMonth?.week2Planned ?? 0)
                    ? "bg-success"
                    : "bg-danger"
                }`}
              >
                {lwCompliance?.complianceCurrentMonth?.week2Actual ?? 0}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span>Week 3</span>
              <span
                className={`badge fs-6 px-2 py-1 ${
                  (lwCompliance?.complianceCurrentMonth?.week3Actual ?? 0) >
                    0 &&
                  (lwCompliance?.complianceCurrentMonth?.week3Actual ?? 0) >=
                    (lwCompliance?.complianceCurrentMonth?.week3Planned ?? 0)
                    ? "bg-success"
                    : "bg-danger"
                }`}
              >
                {lwCompliance?.complianceCurrentMonth?.week3Actual ?? 0}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span>Week 4</span>
              <span
                className={`badge fs-6 px-2 py-1 ${
                  (lwCompliance?.complianceCurrentMonth?.week4Actual ?? 0) >
                    0 &&
                  (lwCompliance?.complianceCurrentMonth?.week4Actual ?? 0) >=
                    (lwCompliance?.complianceCurrentMonth?.week4Planned ?? 0)
                    ? "bg-success"
                    : "bg-danger"
                }`}
              >
                {lwCompliance?.complianceCurrentMonth?.week4Actual ?? 0}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span>Month</span>
              <span
                className={`badge fs-6 px-2 py-1 ${
                  (lwCompliance?.complianceCurrentMonth?.monthActual ?? 0) >
                    0 &&
                  (lwCompliance?.complianceCurrentMonth?.monthActual ?? 0) >=
                    (lwCompliance?.complianceCurrentMonth?.monthPlanned ?? 0)
                    ? "bg-success"
                    : "bg-danger"
                }`}
              >
                {lwCompliance?.complianceCurrentMonth?.monthActual ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Table Block */}
        <div className="pb-4">
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Month</th>
                        <th>LW Planned</th>
                        <th>LW Completed</th>
                        <th>Percentage Completion</th>
                        <th>Compiled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(lwCompliance?.complianceCurrentMonth == null && lwCompliance?.compliancePreviousMonth == null) && (
                        <tr>
                          <td colSpan={6} className="text-center">
                            No records found
                          </td>
                        </tr>
                      )}
                      {(lwCompliance?.complianceCurrentMonth != null && lwCompliance?.complianceCurrentMonth?.monthPlanned>0) && (
                        <tr>
                          <td>{1}</td>
                          <td>{lwCompliance?.complianceCurrentMonth?.month}</td>
                          <td>
                            {lwCompliance?.complianceCurrentMonth?.monthPlanned}
                          </td>
                          <td>
                            {lwCompliance?.complianceCurrentMonth?.monthActual}
                          </td>
                          <td>
                            {lwCompliance?.complianceCurrentMonth?.monthPlanned
                              ? (
                                  (lwCompliance?.complianceCurrentMonth
                                    ?.monthActual /
                                    lwCompliance?.complianceCurrentMonth
                                      ?.monthPlanned) *
                                  100
                                ).toFixed(2) + "%"
                              : ""}
                          </td>
                         <td
                            className={
                              lwCompliance?.complianceCurrentMonth?.monthPlanned &&
                              lwCompliance?.complianceCurrentMonth?.monthActual &&
                              (lwCompliance.complianceCurrentMonth.monthActual /
                                lwCompliance.complianceCurrentMonth.monthPlanned) *
                                100 >= 100
                                ? "bg-success text-white"
                                : "bg-danger text-white"
                            }
                          >
                            {lwCompliance?.complianceCurrentMonth?.monthPlanned &&
                            lwCompliance?.complianceCurrentMonth?.monthActual
                              ? (lwCompliance.complianceCurrentMonth.monthActual /
                                  lwCompliance.complianceCurrentMonth.monthPlanned) *
                                  100 >= 100
                                ? "Yes"
                                : "No"
                              : "No"}
                          </td>
                        </tr>
                      )}
                      {(lwCompliance?.compliancePreviousMonth != null && lwCompliance?.compliancePreviousMonth?.monthPlanned>0) && (
                        <tr>
                          <td>{2}</td>
                          <td>
                            {lwCompliance?.compliancePreviousMonth?.month}
                          </td>
                          <td>
                            {
                              lwCompliance?.compliancePreviousMonth
                                ?.monthPlanned
                            }
                          </td>
                          <td>
                            {lwCompliance?.compliancePreviousMonth?.monthActual}
                          </td>
                          <td>
                            {lwCompliance?.compliancePreviousMonth?.monthPlanned
                              ? (
                                  (lwCompliance?.compliancePreviousMonth
                                    ?.monthActual /
                                    lwCompliance?.compliancePreviousMonth
                                      ?.monthPlanned) *
                                  100
                                ).toFixed(2) + "%"
                              : ""}
                          </td>
                          <td
                          className={
                            lwCompliance?.compliancePreviousMonth?.monthPlanned &&
                            lwCompliance?.compliancePreviousMonth?.monthActual &&
                            (lwCompliance.compliancePreviousMonth.monthActual /
                              lwCompliance.compliancePreviousMonth.monthPlanned) *
                              100 >= 100
                              ? "bg-success text-white"
                              : "bg-danger text-white"
                          }
                        >
                          {lwCompliance?.compliancePreviousMonth?.monthPlanned &&
                          lwCompliance?.compliancePreviousMonth?.monthActual
                            ? (lwCompliance.compliancePreviousMonth.monthActual /
                                lwCompliance.compliancePreviousMonth.monthPlanned) *
                                100 >= 100
                              ? "Yes"
                              : "No"
                            : "No"}
                        </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
       )}
        {/* Draft */}
        {drafts?.length > 0 && (
          <div className="pb-4">
            <div className="admin-boxContainer d1">
              <div
                className="adminAction mb-3"
                style={{ backgroundColor: "#446181", height: "40px" }}
              >
                <div className="text-white ps-2 font-weight-bold py-2">
                  Draft: {drafts?.length}
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="admin-table d3 table-responsive noHover">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>LW ID</th>
                          <th>Unit</th>
                          <th>Department</th>
                          <th>Section</th>
                          <th>LW Date</th>
                          <th>Name of Observer</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drafts?.map((draft: any, index: number) => (
                          <tr key={draft?.objectId || index}>
                            <td>{draft?.objectId}</td>
                            <td>{draft?.unitDisplay}</td>
                            <td>{draft?.departmentDisplay}</td>
                            <td>{draft?.sectionDisplay}</td>
                            <td>{draft?.siDate}</td>
                            <td>{draft?.nameObserver}</td>
                            <td>{draft?.status}</td>
                            <td>
                              <div className="d-flex justify-content-around">
                                <button type="button"
                                  className="tableBtn"
                                  onClick={() => handleEditClick(draft)}
                                >
                                  <span className="u-icon">
                                    <Image
                                      width={15}
                                      height={15}
                                      src="/images/svg/edit-icon-blue.svg"
                                      alt="edit"
                                    />
                                  </span>
                                </button>
                                <button type="button"
                                  className="tableBtn"
                                  style={{ border: "0px" }}
                                  onClick={() => {
                                    setIsDeleteModalOpen(true);
                                    setDeletableLW(draft?.objectId);
                                  }}
                                >
                                  <span className="u-icon">
                                    <Image
                                      width={15}
                                      height={15}
                                      alt="icon"
                                      src="/images/svg/delete-icon.svg"
                                      className="img-fluid u-image"
                                    />
                                  </span>
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
            </div>
          </div>
        )}
         {/* View Schedule */}
        <div className="d-flex flex-row justify-content-end gap-1 p-0 align-items-end">
          {/* <Link href="/si/si-org-schedule-plan">
            <button className="iconBtn green w100">
              <span>View Organization Schedule Plan</span>
              <img
                width="15"
                height="15"
                alt="icon"
                src="/images/svg/icons/organization.svg"
                className="img-fluid u-image"
              />
            </button>
          </Link> */}
          <Link href={APP_URL.SAFETY_LW_SCHEDULE}>
            <button className="iconBtn green w100" type="button">
              <span>Make Your Schedule</span>
              <img
                width="15"
                height="15"
                alt="icon"
                src="/images/svg/calendar.svg"
                className="img-fluid u-image white-icon"
              />
            </button>
          </Link>
        </div>
        {/* Block 1 */}
        <div className="admin-boxContainer d2 mb-0">
          <div className="adminFilters align-items-center">
            <h4>View LW Observation</h4>
            <div className="adminFilters__list">
               <button type="button"
                  className="adminFilters__btn"
                  onClick={() => setIsFilterOpen(true)}>
                  <img
                    width="15"
                    height="15"
                    alt="icon"
                    src="/images/svg/filter-icon.svg"
                    className="img-fluid u-image"
                  />
                </button>
                <button type="button"
                className="iconBtn orange"
                onClick={() => fetchPublishedLWList(filterValues)}>
                Refresh
                <img
                  width="20"
                  height="20"
                  alt="Refresh"
                  src="/images/svg/refresh-icon.svg"
                  className="white-icon"
                />
              </button>
               <button type="button" className="iconBtn green w100" onClick={handleLWNew}>
                  <span>Add New LW</span>
                  <img
                    width="20"
                    height="20"
                    alt="Button1"
                    src="/images/svg/icons/Add.svg"
                    className="white-icon"
                  />
                </button>
              </div>
          </div>
        </div>

        {/* Table 3 */}
        <div className="pb-4">
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>LW ID</th>
                        <th>LW Date</th>
                        <th>Unit</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Name of Observer</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                       {getPaginatedLWData() && getPaginatedLWData().length > 0 ? (
                        getPaginatedLWData().map((lw: any) => (
                          <tr key={lw?.id}>
                            <td>{lw?.siNo}</td>
                            <td>{lw?.siDate}</td>
                            <td>{lw?.unit}</td>
                            <td>{lw?.department}</td>
                            <td>{lw?.sections}</td>
                            <td>{lw?.nameObserver}</td>
                            <td>{lw?.status}</td>
                            <td>
                               <div style={{ display: "flex", gap: "1px", alignItems: "center" , justifyContent: "center"}}>
                                <button
                                  className="tableBtn"
                                  type="button"
                                  onClick={() => {
                                  fetchLWBySiNo(lw?.siNo);
                                 }}
                                >
                                  <span>
                                    <img
                                      width="15"
                                      height="15"
                                      alt="icon"
                                      style={{
                                        filter:
                                          "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                      }}
                                      src="/images/svg/icons/View.svg"
                                    />
                                  </span>
                                </button> 
                                  <button className="tableBtn mx-auto d-block" type="button"
                                    onClick={() => {downloadFileFromLink(lw?.siNo);}}>
                                    <span className="u-icon">
                                      <Image
                                        width={15}
                                        height={15}
                                        alt="icon"
                                        style={{
                                        filter:
                                          "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                        }}
                                        src="/images/svg/pdf-icon.svg"
                                        className="img-fluid u-image"
                                      />
                                    </span>
                                 </button>
                             </div>
                             </td>
                          </tr>
                        ))
                      ) : (
                            <tr>
                              <td colSpan={8} className="text-center">
                                No data found
                              </td>
                            </tr>
                          )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Start */}
                 <div className="pagination_container">
                  <div className="recordsWrapper">
                    <select
                      name="pageSize"
                      id="pageSize"
                      className="recordsWrapper__list"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size} className="recordsWrapper__item">
                          {size} Records
                        </option>
                      ))}
                    </select>
                    <span className="recordsWrapper__value">
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, publishedLWList.length)} of {publishedLWList.length} records
                    </span>
                  </div>
                  <nav className="pagination_wrapper">
                    <ul className="pagination">
                      <li className="page-item">
                        <button
                          className="page-link actionBtns"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <img
                            width="15"
                            height="15"
                            alt="icon"
                            src="/images/svg/arrow-left-small.svg"
                            className="img-flui u-image"
                          />
                        </button>
                      </li>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show first 5 pages or less if total pages is less than 5
                        let pageNum = i + 1;
                        if (currentPage > 3 && totalPages > 5) {
                          // If we're past page 3, show current page in middle
                          pageNum = currentPage - 2 + i;
                          if (pageNum > totalPages) {
                            return null;
                          }
                        }
                        return (
                          <li className="page-item" key={pageNum}>
                            <button
                              className={`page-link ${currentPage === pageNum ? 'active' : ''}`}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <li className="page-item">
                          <button
                            className={`page-link ${currentPage === totalPages ? 'active' : ''}`}
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </li>
                      )}
                      <li className="page-item">
                        <button
                          className="page-link actionBtns"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <img
                            width="15"
                            height="15"
                            alt="icon"
                            src="/images/svg/arrow-right-small.svg"
                            className="img-flui u-image"
                          />
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
                {/* Pagination End */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Filter */}
      <CustomModal
      isOpen={isFilterOpen}
      onClose={() => setIsFilterOpen(false)}
      title="Filter"
      >
      <div className="filters custom-modal">
        {" "}
        <div className="row g-3">
          {" "}
         {/* Modal Body START */}
          <div className="form_grider d1 row g-2">
                <div className="col-md-4">
                 <SelectField
                  label="Unit"
                  value={visitedUnit}
                  name="visitedUnit"
                  placeholder="Select Unit"
                  options={unitOptions}
                  onChange={(value) => {
                    setVisitedUnit(value);
                    formik.setFieldValue("visitedUnit", value?.value);
                    fetchDepartments(value?.value);
                  }}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="col-md-4">
               <SelectField
                  label="Department"
                  value={visitedDepartment}
                  name="visitedDepartment"
                  placeholder="Select Departments"
                  options={departmentOptions}
                  onChange={(value) => {
                    setVisitedDepartment(value);
                    formik.setFieldValue("visitedDepartment", value?.value);
                    fetchSections(value?.value);
                  }}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="col-md-4">
                <SelectField
                  label="Section"
                  value={visitedSections}
                  name="visitedSections"
                  placeholder="Select Section"
                  options={sectionOptions}
                  onChange={(value) => {
                    setVisitedSections(value);
                    formik.setFieldValue("visitedSections", value?.value);
                  }}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="col-md-2">
                <DatePickerField
                label="From Date"
                name="fromDate"
                placeholder="Select Date"
                errors={formik.errors.fromDate}
                    touched={formik.touched.fromDate}
                    value={
                      formik.values.fromDate
                        ? new Date(formik.values.fromDate)
                        : null
                    }
                     onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        formik.setFieldValue(
                          "fromDate",
                          `${year}-${month}-${day}`
                        );
                      } else {
                        formik.setFieldValue("fromDate", "");
                      }
                    }}
                // minDate={new Date()}
                maxDate={new Date()}
                dateFormat="YYYY-MM-dd"
                // errors={errors.scheduledate}
                // touched={touched.scheduledate}
               />
              </div>
               <div className="col-md-2">
                <DatePickerField
                label="To Date"
                name="toDate"
                placeholder="Select Date"
                errors={formik.errors.toDate}
                    touched={formik.touched.toDate}
                    value={
                      formik.values.toDate
                        ? new Date(formik.values.toDate)
                        : null
                    }
                     onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        formik.setFieldValue(
                          "toDate",
                          `${year}-${month}-${day}`
                        );
                      } else {
                        formik.setFieldValue("toDate", "");
                      }
                    }}
                // minDate={new Date()}
                maxDate={new Date()}
                dateFormat="YYYY-MM-dd"
                // errors={errors.scheduledate}
                // touched={touched.scheduledate}
               />
              </div>
            </div>
              <div className="row">
                <div className="col-12">
                  <div className="btnWrapper">
                    <button className="btnNoicon green" type="submit"
                     onClick={() => {
                        formik.handleSubmit();
                      }}>
                      Apply
                      </button>
                    <button className="btnNoicon red" type="button"
                     onClick={() => {
                      resetFilterModal();
                      fetchPublishedLWList(filterValues);
                      }}>Reset</button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </CustomModal>
      {/* del */}
       <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={()=>setIsDeleteModalOpen(false)}
        modalSizeClassName="modal-lg"
        title="Are you sure to remove this Draft LW?"
      >
        <div className="m-3">
          <h4>This Draft once removed can not be retrived.</h4>
          <div className="d-flex justify-content-center gap-2">
            <button className="iconBtn bg-secondary d-flex align-items-center gap-2" type="button"
             onClick={()=>setIsDeleteModalOpen(false)}>
               <img
                width="20"
                height="20"
                alt="Cancel"
                src="/images/svg/icons/Cancle.svg"
                className="white-icon"
              />
              Cancel
            </button>
            <button type="button"
              className="iconBtn bg-danger d-flex align-items-center gap-2"
              onClick={() => {
                removeDraftLW();
              }}
            >
              <img
                width="20"
                height="20"
                alt="Delete"
                src="/images/svg/icons/Delete.svg"
                className="white-icon"
              />
              Delete
            </button>
          </div>
        </div>
      </CustomModal>
        <CustomModal isOpen={isPublishedViewOpen} onClose={() => {setIsPublishedViewnOpen(false)}}
         title={`Preview LW Form ( LW No. - ${lwDetailBySiNo?.header?.siNo} )`}>
      <div
          className="modal-scrollable-content px-2 py-3"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
        <div className="c-accordion" key="0">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Unit & Interaction</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-md-3">
              <InputField
                type="text"
                label="Unit"
                name="unitPreview"
                placeholder=""
                value={lwDetailBySiNo?.header?.unit || ""}
                disabled={true} 
                onBlur={() => {}}
                onChange={() => {}}
                />
            </div>
            {/* Department */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Department"
                name="departmentPreview"
                placeholder=""
                value={lwDetailBySiNo?.header?.department || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Visited Section */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Visited Section"
                name="sectionsPreview"
                placeholder=""
                value={lwDetailBySiNo?.header?.sections || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* HOD Name */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="HOD Name"
                name="hodPreview"
                placeholder=""
                value={lwDetailBySiNo?.header?.hod || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* SI Date */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="LW Date"
                name="LWDatePreview"
                placeholder=""
                value={lwDetailBySiNo?.header?.siDate || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Start Time */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Start Time"
                name="starttimePreview"
                placeholder=""
                value={lwDetailBySiNo?.header?.starttime || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* End Time */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="End Time"
                name="endtimePreview"
                placeholder=""
                value={lwDetailBySiNo?.header?.endtime || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Duration */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Duration"
                name="durationPreview"
                placeholder=""
                value={lwDetailBySiNo?.header?.duration || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Name of Observer */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Name of Observer"
                name="nameObserverPreview"
                placeholder=""
                value={lwDetailBySiNo?.header?.nameObserver || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
        <div className="c-accordion" key="2">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Observations</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Details of Observation</th>
                        <th>Type of Observation</th>
                        <th>Observation Category</th>
                        <th>Observation Subcategory</th>
                        <th>Observation SubSubcategory</th>
                        <th>Risk Potential</th>
                        <th>Exact Location</th>
                        <th style={{ width: 120 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lwDetailBySiNo?.observations?.length > 0 ? (
                        lwDetailBySiNo?.observations.map((row, index) => (
                          <tr key={index}>
                            <td>{row?.observationDetail}</td>
                            <td>{row?.observationType}</td>
                            <td>{row?.observationCategory}</td>
                            <td>{row?.observationSubcategory}</td>
                            <td>
                            {Array.isArray(row?.observationSubsubcategory)
                            ? row?.observationSubsubcategory.map(x => x.label || x.value).join(", ")
                            : row?.observationSubsubcategory || ""}
                            </td>
                            <td>{row?.riskPotentials}</td>
                            <td>{row?.exactLocation}</td>
                            <td>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                      handleObservationView(row);
                                  }}
                                  className="tableBtn">
                                  <span>
                                    <img
                                      width="15"
                                      height="15"
                                      alt="icon"
                                      src="/images/svg/eyeicon.svg"
                                      className="img-fluid u-image"
                                    />
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center">
                            No Observation added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
      </div>
   </CustomModal>
      <CustomModal isOpen={isViewActionOpen} onClose={() => setIsViewActionOpen(false)}
        title="View Actions & File Attachments">
        <div className="filters w-60 px-2 py-2 scrollable-container">
          <div className="row g-3 px-3">
            <div className="admin-table d3 table-responsive mt-3">
              <div className="fw-bold">View Actions</div>
              <table className="table border">
                <thead>
                  <tr>
                    <th style={{ width: "20px" }}>#</th>
                    <th style={{ width: "50%" }}>Corrective Action</th>
                    <th>Section Head</th>
                    <th>Assign to Line Manager</th>
                    <th>Target Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {actionsForView?.length > 0 ? (
                    actionsForView?.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="text-start">{row?.actiontaken}</td>
                        <td className="text-start">{row?.sectionhead}</td>
                        <td className="text-start">{row?.assignLinemanager ?? ""}</td>
                        <td className="text-start">{row?.targetdate}</td>
                        <td className="text-start">{row?.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No actions defined for this observation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="admin-table d3 table-responsive mt-3">
              <div className="fw-bold">File Attachments</div>
              <table className="table border">
                <thead>
                  <tr>
                    <th style={{ width: "20px" }}>#</th>
                    <th style={{ width: "50%" }}>Before File Name</th>
                    <th style={{ width: "50%" }}>After File Name</th>
                  </tr>
                </thead>
                <tbody>
                  {imagesForView?.length > 0 ? (
                    imagesForView?.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="text-start">
                          {row?.beforefileid ? (
                            <>
                              <a
                                href={`${BUCKET_URL}/${row?.beforefileid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {row?.beforefilename}
                              </a>{" "}
                              <img
                                style={{
                                  filter:
                                    "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                }}
                                src="/images/svg/icons/Image.svg"
                                alt="File"
                                width="20"
                                height="20"
                              />
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-start">
                          {row?.afterfileid ? (
                            <>
                              <a
                                href={`${BUCKET_URL}/${row?.afterfileid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {row?.afterfilename}
                              </a>{" "}
                              <img
                                style={{
                                  filter:
                                    "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                }}
                                src="/images/svg/icons/Image.svg"
                                alt="File"
                                width="20"
                                height="20"
                              />
                            </>
                          ) : (
                            ""
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No file attached for this observation. 
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CustomModal>
      </form>
      <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default ProtectedRoute(lw_dashboard);
