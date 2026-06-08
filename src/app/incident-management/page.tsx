"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
// import PageHead from "@/components/Elements/PageHead";
// import SelectField from "@/components/Form/SelectFields";
// import InputField from "@/components/Form/InputField";
import Link from "next/link";
import Image from "next/image"
import { useFormik } from "formik";
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import Select from "react-select";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { FETCH_UNITS, FETCH_DEPARTMENTS, FETCH_SECTIONS, SAVE_DRAFT_PIR } from "@/config/apiConfig";
import { serverRequest } from "@/services/getServerSideRender";
import { useSelector, useDispatch } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { clearObjectId, setObjectId, setPirId } from "@/store/slices/pirSlice";
import { useRouter } from "next/navigation";
import { emptySelector } from "@/config/config";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";
import { SelectOptions } from "@/components/interfaces";

interface HigherRole {    
    [key: string]: any;
}
interface UserData {
    aud: string;
    cfsaTrainedStatus: "YES" | "NO";
    companyName: string;
    createdBy: string;
    departmentDisplay: string;
    departmentHod: string;
    designationDisplay: string;
    email: string;
    empActiveStatus: "TRUE" | "FALSE";
    empArea: string;
    empDepartment: string;
    empDesignation: string;
    empEmail: string;
    empId: string;
    empMobile: string;
    empName: string;
    empSection: string;
    empUnit: string;
    unitId: string; 
    exp: number;
    higher_role: HigherRole[];
    iat: number;
    imTrainedStatus: "Yes" | "No";
    iss: string;
    jsplid: string;
    loginType: string;
    name: string;
    nbf: number;
    picture: string;
    role: string[];
    roleCode: string;
    sectionDisplay: string;
    siTrainedStatus: "YES" | "NO";
    siTrainingUntill: string;
    sub: string;
    updatedBy: string;
    unitDisplay: string;
}
 const statusOptions = [
  { value: "Open", label: "Open" },
  { value: "Completed", label: "Completed" }
 ];
 
const options = [{label: "", value: ""}]

const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

type FormValues = {
  pirId: string;
  fromDate: string;
  toDate: string;
  createdBy: string;
  pendingAt: string;
  unit: string;
  department: string;
  incidentClassifications: Array<string>;
  incidentCategories: Array<string>;
  tiers: Array<string>;
  hipocase: string;
  status: Array<string>;
  orderByColumn: string;
  orderByDirection: string;
  isCreatedByChecked?: boolean;
  isPendingAtChecked?: boolean;
 };

const User = () => {
  const router = useRouter()
  const dispatch = useDispatch();
  const token = useSelector(selectUserToken);
  const { user } = useSelector((state: RootState) => state.auth as { user: UserData });
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [deletablePir, setDeletablePir] = useState<string>('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [drafts, setDrafts] = useState([]);
  const [publishedPirList, setPublishedPirList] = useState([])
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [visitedUnit, setVisitedUnit] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [visitedDepartment, setVisitedDepartment] = useState("");
  const [sectionOptions, setSectionOptions] = useState<SelectOptions[] | null>(emptySelector);
  const [visitedSections, setVisitedSections] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [filterValues, setFilterValues] = useState({
    pirId: null,
    fromDate: null,
    toDate: null,
    createdBy: user?.createdBy || null,
    pendingAt: user?.createdBy || null,
    unit: null,
    department: null,
    incidentClassifications: null, //["Near Miss Case", "Restricted Workday Cases", "First-Aid Cases"],
    incidentCategories: null, //["Falling object", "Manual tasks tools"],
    tiers: null, //["Tier 1", "Tier 2", "Tier 3"],
    hipocase: null,
    status:  [], //["Open", "Completed"],
    orderByColumn: "IncidentDate",
    orderByDirection: "desc"
  }); 
  const handleEditClick = (draft: any) => {
    dispatch(setObjectId(draft.objectId));
    router.push(APP_URL.PIR)
  };

  const fetchDraftPirList = async () => {
    try {
      const response = await serverRequest(
        {},
        SAVE_DRAFT_PIR + `/get-drafts/${user?.createdBy}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        setDrafts(response)
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteDraftPIR = async () => {
    try {
      const response = await serverRequest(
        {},
        SAVE_DRAFT_PIR+ `/remove-draft/${user?.createdBy}/${deletablePir}`,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
      if (response.success) {
        fetchDraftPirList()
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      setIsDeleteModalOpen(false)
      setDeletablePir('')
    }

  };

  const fetchPublishedPirList = async (filterValues) => {
    // console.log("filterValues",JSON.stringify(filterValues));
    try {
      const response = await serverRequest(
        filterValues,
        SAVE_DRAFT_PIR + `/get-pirs`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response?.pirs?.length > 0) {
        setPublishedPirList(response.pirs)
        setTotalPages(Math.ceil(response.pirs.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching Published PIRs:", error);
    }
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return publishedPirList.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(publishedPirList.length / newSize));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  useEffect(() => {
    fetchUnits();
    fetchDraftPirList();
    fetchPublishedPirList(filterValues);
  }, [])

  useEffect(() => {
    setTotalPages(Math.ceil(publishedPirList.length / pageSize));
    // Reset to first page if current page exceeds total pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, publishedPirList.length, currentPage, totalPages]);

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
  
  // const validationSchema = Yup.object({
  //   fromDate: Yup.date().required("From Date is required"),
  //   toDate: Yup.date().required("To Date is required"),
  //   status: Yup.array()
  //   .of(Yup.string())
  //   .min(1, "Status is required")
  //   .required("Status is required")
  // });
  const formik = useFormik<FormValues>({
    initialValues: {
    pirId: null,
    fromDate: null,
    toDate: null,
    createdBy: user?.createdBy || "", 
    pendingAt: user?.createdBy || "",
    unit: null,
    department: null,
    incidentClassifications: [],
    incidentCategories: [],
    tiers: [],
    hipocase: null,
    status: [],
    orderByColumn: "IncidentDate",
    orderByDirection: "desc",
    isCreatedByChecked: true, // ✅ checkbox for createdBy
    isPendingAtChecked: true, // ✅ checkbox for pendingAt
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log("Submit Value-", JSON.stringify(values));

      // ✅ dynamically assign based on checkboxes
    const createdByValue = values.isCreatedByChecked ? user?.createdBy : null;
    const pendingAtValue = values.isPendingAtChecked ? user?.createdBy : null;
    // ✅ date validation
    if (values?.fromDate && values?.toDate) 
    {
      const from = new Date(values.fromDate);
      const to = new Date(values.toDate);
      if (to < from) {
        toast.error("To Date must be greater than From Date");
        return;
      }
      // Check if duration exceeds 30 days
      const diffInTime = to.getTime() - from.getTime(); // difference in milliseconds
      const diffInDays = diffInTime / (1000 * 60 * 60 * 24); // convert to days

      if (diffInDays > 60) {
        toast.error("Date range should not exceed 60 days");
        return;
      }
    }
    // ✅ final payload
    const payload = {
        pirId: values.pirId === "" ? null : values.pirId,
        fromDate: values.fromDate === "" ? null : values.fromDate,
        toDate: values.toDate === "" ? null : values.toDate,
        createdBy: createdByValue,
        pendingAt: pendingAtValue,
        unit: values.unit,
        department: values.department,
        incidentClassifications: null,
        incidentCategories : null,
        tiers : null,
        hipocase : null,
        status: values.status,
        orderByColumn: "IncidentDate",
        orderByDirection: "desc",
      };

      await fetchPublishedPirList(payload);
      setIsOpen(false);
      // formik.resetForm();
    },
  });
  return (
    <>
       <div className="container-fluid">
        {drafts.length > 0 && (
          <div className="pb-4">
            <div className="admin-boxContainer d3">
              <div
                className="adminAction mb-3"
                style={{ backgroundColor: "#446181", height: "40px" }}
              >
                <div className="text-white ps-2 font-weight-bold">
                  Draft: {drafts.length}
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="admin-table d3 table-responsive noHover">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Incident ID</th>
                          <th>Unit</th>
                          <th>Department</th>
                          <th>Section</th>
                          <th>Date of Incident</th>
                          <th>Incident Description</th>
                          <th>Incident Classification</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drafts.map((draft: any, index: number) => (
                          <tr key={draft.objectId || index}>
                            <td>{draft.objectId}</td>
                            <td>{draft.unitName}</td>
                            <td>{draft.departmentName}</td>
                            <td>{draft.sectionName}</td>
                            <td>{draft.incidentDate}</td>
                            <td title={draft.remark} style={{cursor: 'pointer'}}>
                              {(() => {
                                const maxLength = 35;
                                const remark = draft.remark || "";

                                if (remark.length <= maxLength) return remark;

                                // Find last space before cutoff
                                const truncated = remark.substring(0, maxLength);
                                const lastSpace = truncated.lastIndexOf(" ");

                                return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + " ...";
                              })()}
                            </td>
                            <td>{draft.incidentClassification}</td>
                            <td>{draft.status}</td>
                            <td>
                              <div className="d-flex justify-content-around">
                                <button
                                  className="tableBtn"
                                  type="button"
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
                                  type="button"
                                  style={{ border: "0px" }}
                                  onClick={() => {
                                    setIsDeleteModalOpen(true);
                                    setDeletablePir(draft.objectId);
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
        <div className="admin-boxContainer d3">
          <div className="adminAction">
            <Link href={APP_URL.DASHBOARD} className="adminAction__title">
              <span className="icon">
                <Image
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Dashboard
            </Link>
            <Link href={APP_URL.PIR}>
              <button className="iconBtn green" type="button" onClick={() => dispatch(clearObjectId())}>
                <span>Create PIR</span>
                <Image
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/edit-icon.svg"
                  className="img-fluid u-image"
                />
              </button>
            </Link>
          </div>
        </div>
        <div className="admin-boxContainer d2">
          <div className="adminFilters">
            <button
              className="adminFilters__btn"
              type="button"
              onClick={() => setIsOpen(true)}
            >
              <Image
                width="15"
                height="15"
                alt="icon"
                src="/images/svg/filter-icon.svg"
                className="img-fluid u-image"
              />
            </button>
          </div>
        </div>
        <div className="pb-4">
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Incident ID</th>
                        <th>Unit</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Date of Incident</th>
                        <th>incident Description</th>
                        <th>Incident Classification</th>
                        <th>No. of Injured</th>
                        <th>Status</th>
                        <th>Pending Action</th>
                        <th>View Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData().map((pir: any) => (
                          <tr key={pir.id}>
                            <td>{pir.pirId}</td>
                            <td>{pir.unitName}</td>
                            <td>{pir.departmentName}</td>
                            <td>{pir.sectionName}</td>
                            <td>{pir.incidentDate}</td>
                            <td title={pir.remark} style={{cursor: 'pointer'}}>
                              {(() => {
                                  const maxLength = 35;
                                  const remark = pir.remark || "";

                                  if (remark.length <= maxLength) return remark;

                                  // Find last space before cutoff
                                  const truncated = remark.substring(0, maxLength);
                                  const lastSpace = truncated.lastIndexOf(" ");

                                  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + " ...";
                                })()}
                              </td>
                            <td>{pir.incidentClassification}</td>
                            <td>{pir.personInjured}</td>
                            <td>{pir.status}</td>
                            <td>{pir.pendingAction}</td>
                            <td>
                              <Link href={`${APP_URL.INCIDENT_MANAGEMENT}/incident-details`}>
                                <button type="button" className="tableBtn" onClick={() => {
                                  dispatch(setPirId(pir.pirId))
                                }}>
                                  View
                                  <span className="u-icon">
                                    <Image
                                      width={20}
                                      height={20}
                                      alt="icon"
                                      src="/images/svg/eyeicon.svg"
                                      className="img-fluid u-image"
                                    />
                                  </span>
                                  {/* <CustomModal
                                    isOpen={isOpen}
                                    onClose={() => setIsOpen(false)}
                                    title="Details"
                                  >
                                    <>test</>
                                  </CustomModal> */}
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
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
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, publishedPirList.length)} of {publishedPirList.length} records
                    </span>
                  </div>
                  <nav className="pagination_wrapper">
                    <ul className="pagination">
                      <li className="page-item">
                        <button
                          className="page-link actionBtns"
                          type="button"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <Image
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
                              type="button"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <li className="page-item disabled">
                          <button type="button" className="page-link">...</button>
                        </li>
                      )}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <li className="page-item">
                          <button
                            type="button"
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
                          type="button"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <Image
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter"
      >
        <>
         <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="filters">
           <div className="row py-2 form_grider d1">
                <div className="col-md-3">
                <SelectField
                    label="Unit"
                    value={formik.values.unit ? unitOptions.find((u) => String(u.value) === String(formik.values.unit))
                        : null
                    }
                    name="unit"
                    placeholder="All"
                    options={unitOptions}
                    onChange={(option: any) => {
                      if (option) {
                        formik.setFieldValue("unit", option.value);
                        fetchDepartments(option.value);
                      } else {
                        formik.setFieldValue("unit", "");
                      }
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <SelectField
                  label="Department"
                  value={
                      formik.values.department
                        ? departmentOptions.find((u) => String(u.value) === String(formik.values.department))
                        : null
                    }
                  name="department"
                  placeholder="All"
                  options={departmentOptions}
                  onChange={(value) => {
                    formik.setFieldValue("department", value?.value);
                  }}
                  onBlur={formik.handleBlur}
                />
                </div>
                <div className="col-md-3">
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
                <div className="col-md-3">
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
                 <div className="col-md-3">
                 <label className="form-label">Status</label>
                <Select
                  isMulti
                  name="status"
                  options={statusOptions}
                  value={
                    formik.values.status?.length
                      ? statusOptions.filter((opt) =>
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

                {/* ✅ show error */}
                {formik.touched.status && formik.errors.status ? (
                  <div style={{ color: "red", marginTop: 4 }}>
                    {formik.errors.status}
                  </div>
                ) : null}

                </div>
               <div className="col-md-3">
              <InputField
                label="PIR No."
                type="text"
                name="pirId"
                placeholder="Enter IM Number"
                value={formik.values.pirId || null}
                onChange={(e) => formik.setFieldValue("pirId", e.target.value)} // ✅ use e.target.value
                onBlur={formik.handleBlur}
                touched={formik.touched.pirId}
              />
                </div>
             <div className="col-md-3 mt-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isCreatedByChecked"
                  id="isCreatedByChecked"
                  checked={formik.values.isCreatedByChecked}
                  onChange={(e) => formik.setFieldValue("isCreatedByChecked", e.target.checked)}
                  style={{
                    border: "1px solid #0c0c0cff",
                    transform: "scale(1.4)",
                    marginRight: "4px",
                  }}
                />
                <label className="form-check-label" htmlFor="isCreatedByChecked">
                  Created By Me
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isPendingAtChecked"
                  id="isPendingAtChecked"
                  checked={formik.values.isPendingAtChecked}
                  onChange={(e) => formik.setFieldValue("isPendingAtChecked", e.target.checked)}
                  style={{
                    border: "1px solid #0c0c0cff",
                    transform: "scale(1.4)",
                    marginRight: "4px",
                  }}
                />
                <label className="form-check-label" htmlFor="isPendingAtChecked">
                  Pending At Me
                </label>
              </div>
            </div>
             </div>
              <div className="d-flex gap-2 mt-3 justify-content-center">
                <button
                  className="iconBtn green v2"
                  type="submit"><span>Apply</span>
                </button>
                <button
                  className="iconBtn red v2"
                  type="button" onClick={() => { formik.resetForm(); fetchPublishedPirList(filterValues);}}>
                  <span>Reset</span>
                </button>
              </div>
          </div>
          </form>
        </>
      </CustomModal>
      {/* del */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={()=>setIsDeleteModalOpen(false)}
        modalSizeClassName="modal-lg"
        title="Are you sure you want to delete this Draft PIR?"
      >
        <div className="m-5">
          <h2>This PIR Draft once deleted can not be used in future.</h2>
          <div className="d-flex">
            <button type="button" className="mx-2" onClick={()=>setIsDeleteModalOpen(false)}>Cancel</button>
            <button
              className="mx-2"
              type="button"
              onClick={() => {
                deleteDraftPIR();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </CustomModal>
       <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default ProtectedRoute(User);