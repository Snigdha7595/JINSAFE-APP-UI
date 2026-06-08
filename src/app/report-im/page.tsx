"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import { useFormik } from "formik";
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import Select from "react-select";
import DatePickerField from "@/components/Form/DatePickerField";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { serverRequest } from "@/services/getServerSideRender";
import { useSelector, useDispatch } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { clearObjectId, setObjectId } from "@/store/slices/soSlice";
import { useRouter } from "next/navigation";
import { emptySelector } from "@/config/config";
import {
  FETCH_UNITS,
  FETCH_DEPARTMENTS,
  FETCH_SECTIONS,
  FETCH_LINEMANAGER,
  FETCH_SO,
  BUCKET_URL,
  DOWNLOAD_FILE,
  FETCH_REPORT_IM
} from "@/config/apiConfig";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";

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
  // modules: Array<string>;
  reportType?: string;
 };

const IMReport = () => {
  // const router = useRouter()
  // const dispatch = useDispatch();
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [visitedUnit, setVisitedUnit] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [visitedDepartment, setVisitedDepartment] = useState("");
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [visitedSections, setVisitedSections] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [actionsForView, setActionsForView] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [filterValues, setFilterValues] = useState({
    pirId: null,
    fromDate: null,
    toDate: null,
    createdBy: null, //user?.createdBy || null,
    pendingAt: null, //user?.createdBy || null,
    unit: null,
    department: null,
    incidentClassifications: null,
    incidentCategories: null,
    tiers: null,
    hipocase: null,
    status: null,
    orderByColumn: "IncidentDate",
    orderByDirection: "desc"
  });
 const statusOptions = [
  { value: "Open", label: "Open" },
  { value: "Completed", label: "Completed" }
 ];
 const reportTypeOptions = [
  { value: "PIR", label: "PIR" },
  // { value: "Safety Alert", label: "Safety Alert" },
  // { value: "Investigation Report", label: "Investigation Report" },
  // { value: "Lession Learnt", label: "Lession Learnt" },
 ];
 const classificationOptions = [
  { value: "Near Miss Case", label: "Near Miss Case" },
  { value: "Restricted Workday Cases", label: "Restricted Workday Cases" },
  { value: "First-Aid Cases", label: "First-Aid Cases" }
 ];
 const categoryOptions = [
  { value: "Falling object", label: "Falling object" },
  { value: "Manual tasks tools", label: "Manual tasks tools" }
 ];
 const tierOptions = [
  { value: "Tier 1", label: "Tier 1" },
  { value: "Tier 2", label: "Tier 2" },
  { value: "Tier 3", label: "Tier 3" }
 ];
 const hypoOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
 ];

   const exportReportPIR = async (filterValues) => {
    try {
      setIsDownloading(true);
      const response = await serverRequest(
        filterValues,
        FETCH_REPORT_IM+ "/export-report-pirs",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token,
        false,   
        true,  
        "blob" 
      );
      if (response) {
      // If response is already a Blob, use it directly
      const blob = response instanceof Blob ? response : new Blob([response], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Use .csv extension if server returns CSV
      link.setAttribute(
        "download",
        `Report_PIR_${new Date().toISOString().slice(0, 10)}.csv`
      );

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

        toast.success("Report exported successfully!");
      } else {
        toast.error("No report received from server!");
      }
    } catch (error) {
      console.error("Error fetching Report:", error);
      toast.error("Failed to export report!");
    } finally {
      setIsDownloading(false);
    }
  };
 
  useEffect(() => {
    fetchUnits();
  }, [])

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
  const validationSchema = Yup.object({
    fromDate: Yup.date().required("From Date is required"),
    toDate: Yup.date().required("To Date is required")
  });
  const formik = useFormik<FormValues>({
    initialValues: {
    pirId: null,
    fromDate: null,
    toDate: null,
    createdBy: null, //user?.createdBy || "", 
    pendingAt: null, //user?.createdBy || "",
    unit: null,
    department: null,
    incidentClassifications: null,
    incidentCategories: null,
    tiers: null,
    hipocase: null,
    status: [],
    // modules: [],
    orderByColumn: "IncidentDate",
    orderByDirection: "desc"
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log("Submit Value-", JSON.stringify(values));
      let payload = {
        pirId: null, //values.pirId,
        fromDate: values.fromDate,
        toDate: values.toDate,
        createdBy: null, //user?.createdBy,
        pendingAt: null, //user?.createdBy,
        unit: values.unit,
        department: values.department,
        incidentClassifications: null, 
        incidentCategories: null, 
        tiers: null, 
        hipocase: null, 
        status: values.status, 
        // modules: null, 
        orderByColumn: "IncidentDate",
        orderByDirection: "desc"
      }
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

        if (diffInDays > 180) {
          toast.error("Date range should not exceed 180 days");
          return;
        }
      }
      if (values?.reportType === "PIR") {
           await exportReportPIR(payload);
      }
      // else if (values?.reportType === "Safety Alert") {
      //   // await exportReportObservation(payload);
      // }
      // else if (values?.reportType === "Investigation Report") {
      //   // await exportReportHeader(payload);
      // }
      // else if (values?.reportType === "Lession Learnt") {
      //   // await exportReportHeader(payload);
      // }
      else {
        toast.warn("Please select Report type to export.");
      }  
    },
  });

  return (
    <>
     <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="container-fluid">
        <div className="admin-boxContainer d3 ">
          <div className="adminAction">
            <Link href={APP_URL.REPORT_DASHBOARD} className="adminAction__title">
              <span className="icon">
                <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage Report
            </Link>
          </div>
        </div>
        {/* Block 1 */}
        <div className="c-accordion" key="0">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title"> Incident Management Report
                {/* Filter {' '}
                 <img
                    width="25"
                    height="25"
                    alt="icon"
                    src="/images/svg/filter-icon.svg"
                    className="img-fluid u-image"
                  /> */}
            </div>
           </div>
               <div className="row py-2 form_grider d1">
                {/* <div className="col-md-3">
                  <SelectField
                    label="View Type"
                    value={
                      formik.values.viewType
                        ? reportTypeOptions.find((u) => String(u.value) === String(formik.values.reportType))
                        : null}
                    name="reportType"
                    placeholder="Select Report Type"
                    options={reportTypeOptions}
                    onChange={(value) => {
                    formik.setFieldValue("reportType", value?.value);
                  }}
                  />
                </div> */}
                <div className="col-md-3">
                <SelectField
                    label="Unit"
                    value={formik.values.unit ? unitOptions.find((u) => String(u.value) === String(formik.values.unit))
                        : null
                    }
                    name="unit"
                    placeholder="All Units"
                    options={unitOptions}
                    onChange={(option: any) => {
                      if (option) {
                        formik.setFieldValue("unit", option.value);
                        fetchDepartments(option.value);
                      } else {
                        formik.setFieldValue("unitId", "");
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
                  placeholder="All Departments"
                  options={departmentOptions}
                  onChange={(value) => {
                    formik.setFieldValue("department", value?.value);
                    fetchSections(value?.value);
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
                  <SelectField
                    label="Report Type"
                    value={
                      formik.values.reportType
                        ? reportTypeOptions.find((u) => String(u.value) === String(formik.values.reportType))
                        : null}
                    name="reportType"
                    placeholder="Select Report Type"
                    options={reportTypeOptions}
                    onChange={(value) => {
                    formik.setFieldValue("reportType", value?.value);
                  }}
                  />
                </div>
                 <div className="col-md-3">
                 <label className="form-label">Status</label>
                 <Select
                  isMulti
                  name="status"
                  options={statusOptions}
                  value={
                    formik.values.status && formik.values.status.length > 0
                      ? statusOptions.filter(opt => formik.values.status.includes(opt.value))
                      : null
                  }
                  onChange={(selectedOptions) => {
                    formik.setFieldValue(
                      "status",
                      selectedOptions && selectedOptions.length > 0
                        ? selectedOptions.map(opt => opt.value)
                        : null
                    );
                  }}
                  classNamePrefix="select"
                  placeholder="All Status"
                  
                />
                </div>
                 {/* <div className="col-md-3">
                   <InputField
                    label="PIR No."
                    type="text"
                    name="pirId"
                    placeholder="Enter PIR Number"
                    value={formik.values.pirId || null}
                    onChange={(e) => formik.setFieldValue("pirId", e.target.value)}
                    onBlur={formik.handleBlur}
                    touched={formik.touched.pirId}
                  />
                 </div> */}
              </div>
              <div className="d-flex gap-2 mt-3">
              <button
                className="iconBtn green v2"
                type="submit"
                disabled={isDownloading}
              >
                <span>{isDownloading ? "Exporting..." : "Export Report"}</span>
              </button>

              <button
                className="iconBtn grey v2"
                type="button" 
                onClick={() => formik.resetForm()}
              >
                <span>Reset</span>
              </button>
              </div>
          </div>
      </div>
    </form>
    <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default IMReport;
