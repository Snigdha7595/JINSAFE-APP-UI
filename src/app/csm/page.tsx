"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import { useFormik } from "formik";
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect } from "react";
import InputField from "@/components/Form/InputField";
import Select from "react-select";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { serverRequest } from "@/services/getServerSideRender";
import { useSelector, useDispatch } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { clearObjectId, setObjectId } from "@/store/slices/csmSlice";
import { useRouter } from "next/navigation";
import { emptySelector } from "@/config/config";
import {
  FETCH_UNITS,
  FETCH_DEPARTMENTS,
  FETCH_SECTIONS,
  FETCH_LINEMANAGER,
  FETCH_CSFA,
  BUCKET_URL,
  DOWNLOAD_FILE
} from "@/config/apiConfig";
import { ToastContainer, toast } from "react-toastify";


const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

type FormValues = {
  csfaNo: string;
  fromDate: string;
  toDate: string;
  createdBy: string;
  workOrdNo: string;
  contractorId: string;
  status: Array<string>;
 };

const ContractorFieldAudit = () => {
  const router = useRouter()
  const dispatch = useDispatch();
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  // // ⏳ while redux loads
  if (!user) return null;
  // 🚫 CFSA authorization check
  if (user?.cfsaTrainedStatus !== "YES") {
    return (
      <div
        style={{
          height: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <h2 style={{ color: "#c62828" }}>🚫 You are not authorized</h2>
        <p>CFSA training is mandatory to access this module.</p>
      </div>
    );
  }
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [deletableCSFA, setDeletableCSFA] = useState<string>('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [drafts, setDrafts] = useState([]);
  const [publishedCSFAList, setPublishedCSFAList] = useState([])

  const handleEditClick = (draft: any) => {
    dispatch(setObjectId(draft?.objectId));
    router.push(APP_URL.CSM_CFA_NEW);
  };
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [visitedUnit, setVisitedUnit] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [visitedDepartment, setVisitedDepartment] = useState("");
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [visitedSections, setVisitedSections] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState(["Completed", "WIP"]);
  const [csfaDetailByCsfaNo, setCSFADetailByCsfaNo] = useState<any>({});
  const [isPublishedViewOpen, setIsPublishedViewnOpen] = useState(false);
  const [isViewActionOpen, setIsViewActionOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [actionsForView, setActionsForView] = useState([]);
  const [imagesForView, setImagesForView] = useState([]);
  const [filterValues, setFilterValues] = useState({
    csfaNo: null,
    fromDate: null,
    toDate: null,
    createdBy: user?.createdBy || null,
    workOrdNo: null,
    contractorId: null,
    status: ["Completed", "WIP"],
  });
 const statusFilterOptions = [
  { value: "Open", label: "Open" },
  { value: "WIP", label: "WIP" },
  { value: "Done", label: "Done" },
  { value: "Completed", label: "Completed" }
  ];
  const fetchDraftCSFAList = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_CSFA +"/get-drafts/" + user?.createdBy,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.data?.length > 0) {
        setDrafts(response?.data)
      }
      else { setDrafts([]) }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const removeDraftCSFA = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_CSFA+ `/remove-draft/${user?.createdBy}/${deletableCSFA}`,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
      if (response?.success) {
        fetchDraftCSFAList()
        setDrafts(drafts.filter(item => item.objectId !== deletableCSFA));
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setIsDeleteModalOpen(false)
      setDeletableCSFA('')
    }

  };

   const fetchPublishedCSFAList = async (filterValues) => {
    setPublishedCSFAList([]);
    try {
      const response = await serverRequest(
        filterValues,
        FETCH_CSFA+ "/get-csfas",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response?.csfas?.length > 0) {
        setPublishedCSFAList(response?.csfas)
      }
      else{
        setPublishedCSFAList([])
      }
    } catch (error) {
      console.error("Error fetching Published CSFAs:", error);
    }
  };
 
  const handleObservationView = async (row) => {
    setActionsForView(row?.actionTakens);
    setImagesForView(row?.images);
    setIsViewActionOpen(true);
  };
  const getPaginatedCSFAData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return publishedCSFAList.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(publishedCSFAList.length / newSize));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  useEffect(() => {
    setTotalPages(Math.ceil(publishedCSFAList.length / pageSize));
    // Reset to first page if current page exceeds total pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, publishedCSFAList.length, currentPage, totalPages]);

  const fetchCSFABycsfaNo = async (csfaNo) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_CSFA + `/get-csfa/${csfaNo}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
     if (response?.success === true) {
         setCSFADetailByCsfaNo(response);
         setIsPublishedViewnOpen(true);
      }
    } catch (error) {
      console.error("Error fetching Action of CSFAs:", error);
    }
  };

  // const fetchUnits = async () => {
  //   try {
  //     const response = await serverRequest(
  //       {},
  //       FETCH_UNITS + `/get-units`,
  //       CONSTANTS.REQUEST_GET,
  //       true,
  //       true,
  //       token
  //     );
  //     if (response.length > 0) {
  //        const options = response.map((value) => ({
  //         value: value?.unitid,
  //         label: value?.unitname,
  //       }));
  //       setUnitOptions(options);
  //      } else {
  //       setUnitOptions(emptySelector);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };
  // const fetchDepartments = async (unitId) => {
  //   try {
  //     setDepartmentOptions(emptySelector);
  //     setSectionOptions(emptySelector);
  //     const response = await serverRequest(
  //       {},
  //       FETCH_DEPARTMENTS + `/get-departments/${unitId}/`,
  //       CONSTANTS.REQUEST_GET,
  //       true,
  //       true,
  //       token
  //     );
  //     if (response.length > 0) {
  //       const options = response.map((value) => ({
  //         value: value?.departmentid,
  //         label: value?.departmentname,
  //       }));
  //       setDepartmentOptions(options);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };
  // const fetchSections = async (departmentId) => {
  //   try {
  //     const response = await serverRequest(
  //       {},
  //       FETCH_SECTIONS + `/get-sections/${departmentId}/`,
  //       CONSTANTS.REQUEST_GET,
  //       true,
  //       true,
  //       token
  //     );
  //     if (response.length > 0) {
  //       const options = response.map((value) => ({
  //         value: value?.sectionid,
  //         label: value?.sectionname,
  //       }));
  //       setSectionOptions(options);
  //      }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };
  const downloadFile = async (fileId) => {
    const payload = fileId;
    try {
        const response = await serverRequest(
            payload,
            DOWNLOAD_FILE,
            CONSTANTS.REQUEST_POST,
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
  useEffect(() => {
    fetchDraftCSFAList();
    fetchPublishedCSFAList(filterValues);
    //     fetchUnits();
  }, [])
  
  const allStatus = ["Open", "WIP", "Completed"];

  const formik = useFormik<FormValues>({
    initialValues: {
    csfaNo: null,
    fromDate: null,
    toDate: null,
    createdBy: user?.createdBy || null,
    workOrdNo: null,
    contractorId: null,
    status: [],
    },
    onSubmit: async (values: FormValues) => {
     
      const submitValues = {
      ...values,
       status:
        Array.isArray(values.status) && values.status.length > 0
          ? values.status
          : allStatus,
      };
     
      if (submitValues.fromDate && submitValues.toDate) {
        const from = new Date(submitValues.fromDate);
        const to = new Date(submitValues.toDate);

        if (to < from) {
          toast.error("To Date must be greater than From Date");
          return;
        }
      }
      await fetchPublishedCSFAList(values);
      setIsFilterOpen(false);
    },
  });
  const resetFilterModal = () => {
    formik.setFieldValue("csfaNo", null);
    formik.setFieldValue("workOrdNo", null);
    formik.setFieldValue("contractorId", null);
    formik.setFieldValue("fromDate", null);
    formik.setFieldValue("toDate", null);
    setFromDate(null);
    setToDate(null);
  };
//   const downloadFileFromLink = async (sono) => {
//     try {
//         const response = await serverRequest(
//             {},
//             FETCH_SO + `/generate-pdf/`+ `${sono}`,
//             CONSTANTS.REQUEST_GET,
//             true,
//             true,
//             token,
//             false,   
//             true,  
//            "blob"   // responseType — tell it to treat response as a Blob
//         );
//         let blob;
//         if (response instanceof Response) {
//             blob = await response.blob();
//         } else {
//             blob = response; // already a Blob
//         }
//         const url = window.URL.createObjectURL(blob);
//         console.log("url",url);
//         window.open(url, "_blank");
//         setTimeout(() => {
//             window.URL.revokeObjectURL(url);
//         }, 1000);
//     } catch (error) {
//         console.error("Open failed:", error);
//         toast.error("File open failed. Please try again.");
//     }
//   };
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
                          <th>CSFA ID</th>
                          <th>Unit</th>
                          <th>Department</th>
                          <th>Section</th>
                          <th>Audit Date</th>
                          <th>Duration</th>
                          <th>Area Owner</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drafts?.map((draft: any, index: number) => (
                          <tr key={draft?.objectId || index}>
                            <td>{draft?.objectId}</td>
                            <td>{draft?.visitedUnitName}</td>
                            <td>{draft?.visitedDepartmentName}</td>
                            <td>{draft?.visitedSectionName}</td>
                            <td>{draft?.auditDate}</td>
                            <td>{draft?.auditDuration}</td>
                            <td>{draft?.areaOwner}</td>
                            <td>{draft?.status}</td>
                            <td>
                              <div className="d-flex justify-content-around">
                                <button
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
                                <button
                                  className="tableBtn"
                                  style={{ border: "0px" }}
                                  onClick={() => {
                                    setIsDeleteModalOpen(true);
                                    setDeletableCSFA(draft?.objectId);
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

        {/* Block 1 */}
        <div className="admin-boxContainer d2 mb-0">
          <div className="adminFilters align-items-center">
            <h4>View Contractor Safety Field Audit</h4>
            <div className="adminFilters__list">
                <button type="button"
                  className="adminFilters__btn"
                  onClick={() => setIsFilterOpen(true)}
                  >
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
                onClick={() => fetchPublishedCSFAList(filterValues)}
                >
                Refresh
                <img
                  width="20"
                  height="20"
                  alt="Refresh"
                  src="/images/svg/refresh-icon.svg"
                  className="white-icon"
                />
              </button>
              <Link href={APP_URL.CSM_CFA_NEW}>
                <button className="iconBtn green w100">
                  <span>Add New CSFA</span>
                  <img
                    width="20"
                    height="20"
                    alt="Button1"
                    src="/images/svg/icons/Add.svg"
                    className="white-icon"
                  />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Block 3 */}
        <div className="pb-4">
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>CFA NO.</th>
                        <th>Audit Date</th>
                        <th>Unit</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Contractor Name</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                       {getPaginatedCSFAData() && getPaginatedCSFAData().length > 0 ? (
                        getPaginatedCSFAData().map((csfa: any) => (
                          <tr key={csfa?.id}>
                            <td>{csfa?.csfaNo}</td>
                            <td>{csfa?.auditDate}</td>
                            <td>{csfa?.visitedUnitName}</td>
                            <td>{csfa?.visitedDepartmentName}</td>
                            <td>{csfa?.visitedSectionName}</td>
                            <td>{csfa?.contractorName}</td>
                            <td>{csfa?.status}</td>
                            <td>
                             <div style={{ display: "flex", gap: "1px", alignItems: "center" , justifyContent: "center"}}>
                                <button
                                  className="tableBtn"
                                  type="button"
                                  onClick={() => {
                                  fetchCSFABycsfaNo(csfa?.csfaNo);   
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
                                {/* <button className="tableBtn mx-auto d-block" type="button"
                                  onClick={() => {downloadFileFromLink(csfa?.csfaNo);}}
                                >
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
                              </button> */}
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
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, publishedCSFAList.length)} of {publishedCSFAList.length} records
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
      // modalSizeClassName="modal-lg"
      >
      <div className="filters custom-modal">
        <div className="row g-3">
          <div className="form_grider d1 row g-2">
            <div className="row py-2 form_grider d1">
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
                maxDate={new Date()}
                dateFormat="YYYY-MM-dd"
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
                maxDate={new Date()}
                dateFormat="YYYY-MM-dd"
               />
              </div>
               <div className="col-md-2">
                <InputField
                  label="CsfaNo No."
                  type="text"
                  name="csfaNo"
                  placeholder="Enter CsfaNo No"
                  value={formik.values.csfaNo || null}
                  onChange={(e) => formik.setFieldValue("csfaNo", e.target.value)}
                  onBlur={formik.handleBlur}
                  touched={formik.touched.csfaNo}
                />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Work Order No."
                    type="text"
                    name="workOrdNo"
                    placeholder="Enter WO No"
                    value={formik.values.workOrdNo || null}
                    onChange={(e) => formik.setFieldValue("workOrdNo", e.target.value)}
                    onBlur={formik.handleBlur}
                    touched={formik.touched.workOrdNo}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    label="Contractor Code"
                    type="text"
                    name="contractorId"
                    placeholder="Enter Contractor Code"
                    value={formik.values.contractorId || null}
                    onChange={(e) => formik.setFieldValue("contractorId", e.target.value)}
                    onBlur={formik.handleBlur}
                    touched={formik.touched.contractorId}
                  />
                </div>
                <div className="col-md-3">
                <label className="form-label">Status</label>
                <Select
                    isMulti
                    name="status"
                    options={statusFilterOptions}
                    value={
                    formik.values.status?.length
                        ? statusFilterOptions.filter((opt) =>
                            formik.values.status.includes(opt.value)
                        )
                        : []
                    }
                    onChange={(selectedOptions) => {
                    formik.setFieldValue(
                        "status",
                        selectedOptions?.map((opt) => opt.value) || []
                    );
                    }}
                    onBlur={() => formik.setFieldTouched("status", true)} 
                    classNamePrefix="select"
                    placeholder="All"
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
                      fetchPublishedCSFAList(filterValues);
                      }}>Reset</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
    <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={()=>setIsDeleteModalOpen(false)}
        modalSizeClassName="modal-lg"
        title="Are you sure to remove this Draft SO?"
      >
        <div className="m-3">
          <h4>This Draft once removed can not be retrived.</h4>
          <div className="d-flex justify-content-center gap-2">
            <button className="iconBtn bg-secondary d-flex align-items-center gap-2" 
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
            <button
              className="iconBtn bg-danger d-flex align-items-center gap-2"
              onClick={() => {
                removeDraftCSFA();
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
        title={`Preview CSFA Form ( CSFA No. - ${csfaDetailByCsfaNo?.csfa?.csfaNo} )`}>
        <div
          className="modal-scrollable-content px-2 py-3"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
        <div className="c-accordion" key="0">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Contractor Details</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-md-3">              
              <InputField
                type="text"
                label="Unit"
                name="unitPreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.visitedUnitName || ""}
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
                value={csfaDetailByCsfaNo?.csfa?.visitedDepartmentName || ""}
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
                name="sectionPreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.visitedSectionName || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
              <div className="col-md-3">
              <InputField
                type="text"
                label="Zone"
                name="zoneNamePreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.zoneName || ""}
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
                value={csfaDetailByCsfaNo?.csfa?.hod || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* SI Date */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Audit Date"
                name="auditDatePreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.auditDate || ""}
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
                name="auditDurationPreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.auditDuration || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            <div className="col-md-3">
              <InputField
                type="text"
                label="Exact Location"
                name="exactLocationPreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.exactLocation || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
             <div className="col-md-3">
              <InputField
                type="text"
                label="Area Owner"
                name="areaOwnerPreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.areaOwner || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
             <div className="col-md-3">
              <InputField
                type="text"
                label="Number of People Working"
                name="noOfPeopleWorkingPreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.noOfPeopleWorking || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            <div className="col-md-3">
              <InputField
                type="text"
                label="Work Order No"
                name="workOrderNoPreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.workOrderNo || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
             <div className="col-md-3">
              <InputField
                type="text"
                label="Audit Description"
                name="auditDescPreview"
                placeholder=""
                value={csfaDetailByCsfaNo?.csfa?.auditDesc || ""}
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
                        <th>Observation Description</th>
                        <th>Observation Location</th>
                        <th>Responsible Supervisor</th>
                        <th>No. of Violations</th>
                        <th>Severity</th>
                        <th>Violations Severity</th>
                        <th>Indicators</th>
                        <th style={{ width: 120 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csfaDetailByCsfaNo?.csfaObservations?.length > 0 ? (
                        csfaDetailByCsfaNo?.csfaObservations.map((row, index) => (
                          <tr key={index}>
                            <td>{row?.observationDescription || "-"}</td>
                            <td>{row?.observationLocation || "-"}</td>
                            <td>{row?.contractorSupervisiorName || "-"}</td>
                            <td>{row?.noOfViolations || "0"}</td>
                            <td>{row?.severity || "-"}</td>
                            <td>{row?.violationsSeverityProduct || "0"}</td>
                            <td>{row?.indicators || "-"}</td>
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
                          <td colSpan={8} className="text-center">
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
                      <td className="text-start">{row?.correctiveAction}</td>
                      <td className="text-start">{row?.sectionHead}</td>
                      <td className="text-start">{row?.assignedLineManagerName ?? ""}</td>
                      <td className="text-start">{row?.targetDate}</td>
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
                  <th style={{ width: "50%" }}>File Name</th>
                </tr>
              </thead>
              <tbody>
                {imagesForView?.length > 0 ? (
                  imagesForView?.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td className="text-start">                        
                        {row?.fileId ? (
                          <>
                            <a href="#" onClick={(e) => {e.preventDefault(); downloadFile(row?.fileId);}}>
                              <img
                                src={`${BUCKET_URL}/${row?.fileId}`}
                                alt="File"
                                width="50"
                                height="35"
                              />
                              </a>
                          </>
                        ) : (
                          "-"
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

export default ProtectedRoute(ContractorFieldAudit);
