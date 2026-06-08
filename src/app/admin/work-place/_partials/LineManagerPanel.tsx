"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import dayjs from "dayjs";
import { useFormik } from "formik";
import Image from "next/image"
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect, useMemo } from "react";
import InputField from "@/components/Form/InputField";
import TextareaField from "@/components/Form/TextareaField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import RadioField from "@/components/Form/RadioField";
import { useSelector } from "react-redux";
import { emptySelector } from "@/config/config";
import { selectUserToken } from "@/store/slices/authSlice";
import { serverRequest } from "@/services/getServerSideRender";
import { RootState } from "@/store/store";
import { FETCH_UNITS, FETCH_DEPARTMENTS, FETCH_SECTIONS, FETCH_LINEMANAGER, FETCH_USER } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";

const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

interface SectionInterface {
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab?: React.Dispatch<React.SetStateAction<number>>;
}

type FormValues = {
  id?: string;
  unitid: string;
  unitname?: string;
  departmentid: string;
  departmentname?: string;
  sectionid?: string;
  sectionname: string;
  linemanagerName?: string;
  linemanagerEmail?: string;
  jsplid?: string;
  sectionhead: string;
  status?: string;
};

interface DepartmentDetailType {
  unitid: string;              
  departmentid: string;
  departmentname: string;
  hod: string;
  hodEmail?: string;
  status?: string;
}

interface LineManagerDetailType {
  unitid: string;              
  departmentid: number;
  sectionid: string;
  sectionhead: string; 
  linemanagerName: string;
  id: number;
  sectionname: string;
  rowIndex: number;
  linemanagerEmail: string;
  jsplid: string;
  status: string;
  createdat: string;
  createdby: string;
  updatedat: string;
  updatedby: string;
  landscapeId: number;
}

// Interface for user data fetched for Line Manager candidates
interface UserDetailType {
  jsplid: string;
  empName: string;
  empEmail: string;
  unitid: string;
  departmentid: string;
  sectionid: string;
  empId: string;
}

const LinemanagerPanel = ({
  currentStatus,
  setCurrentStatus,
}: SectionInterface) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [unitList, setUnitList] = useState([]);
  const [unitDetail, setUnitDetail] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [departmentList, setDepartmentList] = useState([]);
  // const [departmentDetail, setDepartmentDetail] = useState<DepartmentDetailType | null>(null);
  // const [sectionList, setSectionList] = useState([]);
  // const [sectionDetail, setSectionDetail] = useState<SectionDetailType | null>(null);
  // surjya start
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [sectionList, setSectionList] = useState([]);

  const [lineManagerList, setLineManagerList] = useState([]);
  const [lineManagerDetail, setLineManagerDetail] = useState<LineManagerDetailType | null>(null);

  // New state for Line Manager Candidates (from User/Search API)
  const [candidateOptions, setCandidateOptions] = useState(emptySelector);
  const [candidateList, setCandidateList] = useState<UserDetailType[]>([]);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetailType | null>(null);
  const [status, setStatus] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const sectionHeadOptions = [
    { value: "YES", label: "YES" },
    { value: "NO", label: "NO" },
  ];

  //Role Based Access
  const getTopRole = (userRoles) => {
      const priority = ["Super Admin", "Site Admin", "Department Admin"];
      // Find the first role in priority order that exists in userRoles
      for (const role of priority) {
        const found = (userRoles ?? []).find((r) => r.userRole === role);
        if (found) return found?.userRole;
      }
      return ""; // No matching role found
  };
  const getUnitDeptByRole = (userRoles, targetRole) => {
    return userRoles?.filter((r) => r.userRole === targetRole)
                      .map(({ unitId, departmentId }) => ({ unitId, departmentId }));
  };
  const checkWorkspacePermission = (unitId: string, departmentId: string, removableRole?: string) => {
    let userRoles = user?.userRoles;
    // Get the top roles that need to find out.
    let role = getTopRole(userRoles);
    // Get the workspace list like UnitId, DepartmentId that need to find out.
    let workspaceAllowed = getUnitDeptByRole(userRoles, role);

    if(role == "Super Admin") {
      return true; // Always allowed
    }
    else if(role == "Site Admin") {
      if (removableRole === "Super Admin") return false;
      // Allowed if user's unitId exists in workspaceAllowed
      return workspaceAllowed.some((w) => String(w.unitId) === String(unitId));
    }
    else if(role == "Department Admin")
    {
      let notRemovableRoles = ["Super Admin", "Site Admin", "HOD Safety", "Unit Head"];
      if (notRemovableRoles.includes(removableRole)) return false;
      // Allowed if both unitId & departmentId match an entry
      return workspaceAllowed.some(
        (w) =>
          String(w.unitId) === String(unitId) &&
          String(w.departmentId) === String(departmentId)
      );
    }    
    return false;
  };

  const checkToOpenSaveModal = async(payload: FormValues, unitId: string, departmentId: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
       setIsAddModalOpen(true);
       saveLineManager(payload);
    } else {
      toast.warning("You are not authorized to add the Line Manager.");
    }
  };
  const checkToOpenEditModal = async(payload: FormValues, unitId: string, departmentId: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
       setIsEditModalOpen(true);
       updateLineManager(payload);
    } else {
      toast.warning("You are not authorized to modify the Line Manager.");
    }
  };
  const getLineManagerValidationSchema = (mode: "add" | "edit") =>
    Yup.object({
      unitid: Yup.string().required("Unit is required"),
      departmentid: Yup.string().required("Department is required"),
      sectionid: Yup.string().required("Section is required"),
      linemanagerEmail: mode === "add" ? Yup.string().required("Line Manager Email is required") : Yup.string(),
      status: Yup.string().required("Status is required"),
      sectionhead: Yup.string().required("Section Head status is required"),
    });

  // Add Line Manager formik
  const addformik = useFormik<FormValues>({
    initialValues: {
      unitid: "",
      departmentid: "",
      sectionid: "",
      sectionname: "",
      linemanagerName: "",
      linemanagerEmail: "",
      jsplid: "",
      sectionhead: "NO",
      status: "Active"
    },
    validationSchema: getLineManagerValidationSchema("add"),
    enableReinitialize: true,
    onSubmit: (values) => {
      checkToOpenSaveModal(values, values.unitid, values.departmentid);
    },
  });

  const selectedSectionName = useMemo(() => {
    const selectedSec = sectionList.find((s: any) => String(s.id) === addformik.values.sectionid);
    return selectedSec?.sectionname || '';
  }, [addformik.values.sectionid, sectionList]);

  useEffect(() => {
    fetchUnits();
  }, []);

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
        setUnitList(response);
      } else {
        setUnitOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDepartments = async (unitid: string) => {
    setDepartmentList([]);
    setDepartmentOptions(emptySelector);
    setSectionList([]);
    setSectionOptions(emptySelector);
    try {
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${unitid}`,
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
        setDepartmentList(response);
      } else {
        setDepartmentList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchSections = async (deptId: string) => {
    setSectionList([]);
    setSectionOptions(emptySelector);
    try {
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/get-sections/${deptId}/all`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response && response.length > 0) {
        const options = response.map((value) => ({
          value: value?.sectionid,
          label: value?.sectionname,
        }));
        setSectionOptions(options);
        setSectionList(response);
      } else {
        setSectionList([]);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  // --- API Function for Line Manager Candidates ---

  const fetchLineManagerCandidates = async (unitId: string, departmentId: string) => {
    setCandidateOptions(emptySelector);
    setCandidateList([]);
    setSelectedUserDetail(null);

    const searchPayload = {
      jsplId: null,
      empCode: null,
      empEmail: null,
      unitId: unitId,
      departmentId: departmentId,
      sectionId: null,
      empActiveStatus: "TRUE"
    };

    try {
      const response = await serverRequest(
        searchPayload,
        FETCH_USER + `/Search`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.users && response.users.length > 0) {
        const options = response.users.map((user: UserDetailType) => ({
          value: user.empEmail,
          label: `${user.empName} (${user.empEmail})`,
        }));
        setCandidateOptions(options);
        setCandidateList(response.users);
      }
    } catch (error) {
      console.error("Error fetching candidate users:", error);
    }
  };

   // MODIFIED: Logic to dynamically construct the URL
  const fetchLineManagers = async (deptId: string, secId: string = '') => {
    setLineManagerList([]);
    
    let apiUrl = `${FETCH_LINEMANAGER}/get-line-managers/${deptId}/all`;

    if (secId && secId.trim() !== '') {
      apiUrl += `/${secId}`;
    }

    try {
      const response = await serverRequest(
        {},
        apiUrl,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        setLineManagerList(response);
      } else {
        setLineManagerList([]);
      }
    } catch (error) {
      console.error("Error fetching line managers:", error);
      // Optionally clear list on error, but keep it if error is user-related
    }
  };
  // NEW: Save Line Manager (Add)
  const saveLineManager = async (payload: FormValues) => {

    //const selectedSectionOption = sectionList.find((s: any) => String(s.value) === payload.sectionid);
    const selectedCandidate = candidateList.find(c => c.empEmail === payload.linemanagerEmail);

    if (!payload.linemanagerEmail) {
      toast.error("Line Manager Email must be selected.");
      return;
    }

    if (!payload.sectionname) {
      toast.error("Selected section details are missing. Please re-select the Section.");
      return;
    }
    if (!selectedCandidate) {
      toast.error("Selected Line Manager details are not available. Please select an email from the dropdown.");
      return;
    }

    const sectionHeadForPayload = payload.sectionhead === "YES" ? "TRUE" : "FALSE";
    const sectionNameForPayload = payload.sectionname;
    // const statusForPayload = payload.status === "active" ? "active" : "inactive";

    const ISO_NO_Z_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';

    let addPayload = {
      unitid: String(payload.unitid),
      departmentid: Number(payload.departmentid),
      sectionid: String(payload.sectionid),
      sectionhead: sectionHeadForPayload,
      linemanagerName: selectedCandidate.empName,
      sectionname: sectionNameForPayload,
      linemanagerEmail: payload.linemanagerEmail,
      jsplid: selectedCandidate.jsplid,
      status: 'active',
      createdat: dayjs().format(ISO_NO_Z_FORMAT),
      createdby: user?.jsplid,
      updatedat: dayjs().format(ISO_NO_Z_FORMAT),
      updatedby: user?.jsplid,
      landscapeId: 0,
    }

    try {
      const response = await serverRequest(
        addPayload,
        FETCH_LINEMANAGER,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response && response.id) {
        toast.success("Line Manager added successfully");
        setIsAddModalOpen(false);
        // addformik.resetForm();
        fetchLineManagers(payload.departmentid, payload.sectionid);
      } else {
        toast.error(response?.message || "Failed to add Line Manager.");
      }
    } catch (error) {
      console.error("Error saving Line Manager:", error);
    }
  };

  // Update Line Manager (Edit)
  const updateLineManager = async (payload: FormValues) => {

    const sectionHeadForPayload = payload.sectionhead === "YES" ? "TRUE" : "FALSE";
    const statusForPayload = payload.status === "active" ? "active" : "inactive";
    
    const updatePayload = {
    ...lineManagerDetail,
      sectionhead: sectionHeadForPayload,
      status: statusForPayload
    };
       
    try {
      const response = await serverRequest(
        updatePayload,
        FETCH_LINEMANAGER + `/${payload.id}`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );
       // Relying on API convention, assume success if no explicit failure message
      if (response) { 
        toast.success("Line Manager updated successfully");
        setIsEditModalOpen(false);
        // Refresh list with current filters
        fetchLineManagers(payload.departmentid, payload.sectionid);
        // setTimeout(() => {
        //   // fetchLineManagers(addformik.values.departmentid, addformik.values.sectionid);
        //   fetchLineManagers(payload.departmentid, payload.sectionid);
        // }, 300);
       
      } else {
        toast.error(response?.message || "Failed to update Line Manager.");
      }
    } catch (error) {
      console.error("Error updating Line Manager:", error);
      toast.error("An error occurred during update.");
    }
  };

  // Fetch single Line Manager
  const fetchLineManager = async (id: number) => {
    setLineManagerDetail(null);
    try {
      const response = await serverRequest({},
      FETCH_LINEMANAGER + `/${id}`,
      CONSTANTS.REQUEST_GET,
      true,
      true,
      token);
      if (response) {
        setLineManagerDetail(response);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching single Line Manager:", error);
    }
  };

  // --- Pagination & Table Logic ---
  const getPaginatedLineManagerData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredLineManagers.slice(startIndex, endIndex);
  };
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(filteredLineManagers.length / newSize));
    setCurrentPage(1);
  };
  const filteredLineManagers = lineManagerList.filter((lm: any) =>{
  const search = (searchText || "").toLowerCase();
  const email = (lm?.linemanagerEmail || "").toLowerCase();
  const name = (lm?.linemanagerName || "").toLowerCase();
  return (
    email.includes(search) ||
    name.includes(search)
  );
  });

  useEffect(() => {
    setTotalPages(Math.ceil(filteredLineManagers.length / pageSize));
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, filteredLineManagers.length, currentPage, totalPages]);

  // Effect to handle dependent data fetching on filter change
  useEffect(() => {
    // Reset secondary data when unit changes
    if (addformik.values.unitid) {
      // Fetch departments is already triggered in onChange handler
      fetchDepartments(addformik.values.unitid);
      addformik.setFieldValue("departmentid", "");
      addformik.setFieldValue("sectionid", "");
      addformik.setFieldValue("linemanagerEmail", "");
    }
  }, [addformik.values.unitid]);

  // MODIFIED useEffect for Department ID: Fetch list without Section filter
  useEffect(() => {
    // Reset tertiary data when department changes
    if (addformik.values.departmentid) {
      fetchSections(addformik.values.departmentid);
      fetchLineManagerCandidates(addformik.values.unitid, addformik.values.departmentid);
      addformik.setFieldValue("sectionid", "");
      addformik.setFieldValue("linemanagerEmail", "");
      setCandidateOptions(emptySelector);
      setCandidateList([]);
      setSelectedUserDetail(null);
      
      // 💡 ACTION: Fetch line managers based on Department only
      fetchLineManagers(addformik.values.departmentid);
    } else {
      setLineManagerList([]); // Clear list if no department is selected
    }
  }, [addformik.values.departmentid]);

   // MODIFIED useEffect for Section ID: Fetch list with Section filter
  useEffect(() => {
    const { departmentid, sectionid } = addformik.values;
    if (departmentid) {
      fetchLineManagers(departmentid, sectionid);
    }
  }, [addformik.values.sectionid]);

  useEffect(() => {
    // Update dependent fields when a candidate is selected
    if (addformik.values.linemanagerEmail && candidateList.length > 0) {
      const selected = candidateList.find(c => c.empEmail === addformik.values.linemanagerEmail);
      if (selected) {
        setSelectedUserDetail(selected);
        addformik.setFieldValue("linemanagerName", selected.empName);
        addformik.setFieldValue("jsplid", selected.jsplid);
      } else {
        setSelectedUserDetail(null);
        addformik.setFieldValue("linemanagerName", "");
        addformik.setFieldValue("jsplid", "");
      }
    } else {
      setSelectedUserDetail(null);
      addformik.setFieldValue("linemanagerName", "");
      addformik.setFieldValue("jsplid", "");
    }
  }, [addformik.values.linemanagerEmail, candidateList]);


  // Edit Line Management formik
  const editformik = useFormik<FormValues>({
    initialValues: {
      unitid: lineManagerDetail?.unitid || "",
      departmentid: String(lineManagerDetail?.departmentid) || "",
      sectionid: lineManagerDetail?.sectionid || "",
      sectionname: lineManagerDetail?.sectionname || "",
      id: String(lineManagerDetail?.id) || "",
      linemanagerName: lineManagerDetail?.linemanagerName || "",
      linemanagerEmail: lineManagerDetail?.linemanagerEmail || "",
      jsplid: lineManagerDetail?.jsplid || "",
      sectionhead: lineManagerDetail?.sectionhead === "TRUE" ? "YES" : "NO",
      status: lineManagerDetail?.status === "active" ? "active" : "inactive",
    },
    validationSchema: getLineManagerValidationSchema("edit"),
    enableReinitialize: true,
    // validateOnChange: true,
    // validateOnBlur: true,
    onSubmit: async (values) => {
      if (!lineManagerDetail) return;
      try {
        checkToOpenEditModal(values, values.unitid, values.departmentid);
      } catch (err) {
        console.error("Update failed", err);
      }
    },
  });

  return (
    <>
      <div className="container-fluid">
        {/* Block 1: Filters and Add Button */}
        <div className="adminFilters__list p-0">
          <div className="row form_grider d1">
            <div className="col-12 d-flex gap-2 justify-content-end align-items-center">

              {/* Unit Filter */}
              <div className="col-md-3">
                <SelectField
                  label="Unit"
                  placeholder="Select Unit"
                  value={
                    addformik.values.unitid
                      ? unitOptions.find((u) => String(u.value) === String(addformik.values.unitid))
                      : null
                  }
                  name="unitid"
                  options={unitOptions}
                  onChange={(option: any) => {
                    if (option) {
                      addformik.setFieldValue("unitid", option.value);
                      addformik.setFieldValue("departmentid", "");
                    } else {
                      addformik.setFieldValue("unitid", "");
                      addformik.setFieldValue("departmentid", "");
                      addformik.setFieldValue("sectionid", "");
                      setDepartmentList([]);
                      setSectionList([]);
                    }
                  }}
                  errors={addformik.errors.unitid}
                  touched={addformik.touched.unitid}
                />
              </div>

              {/* Department Filter */}
              <div className="col-md-3">
                <SelectField
                  label="Department"
                  placeholder="Select Department"
                  value={
                    addformik.values.departmentid
                      ? departmentOptions.find((u) => String(u.value) === String(addformik.values.departmentid))
                      : null
                  }
                  name="departmentid"
                  options={departmentOptions}
                  onChange={(option: any) => {
                    if (option) {
                      addformik.setFieldValue("departmentid", option.value);
                      addformik.setFieldValue("sectionid", "");
                      addformik.setFieldValue("linemanagerEmail", "");
                      fetchLineManagers(option.value, "");
                    } else {
                      addformik.setFieldValue("departmentid", "");
                      addformik.setFieldValue("sectionid", "");
                      addformik.setFieldValue("linemanagerEmail", "");
                      setLineManagerList([]);
                      setSectionOptions(emptySelector);
                      setCandidateOptions(emptySelector);
                    }
                  }}
                  errors={addformik.errors.departmentid}
                  touched={addformik.touched.departmentid}
                />
              </div>

              {/* Section Filter (New) */}
              <div className="col-md-3">
                <SelectField
                  label="Section"
                  placeholder="Select Section"
                  value={
                    addformik.values.sectionid
                      ? sectionOptions.find((u) => String(u.value) === String(addformik.values.sectionid))
                      : null
                  }
                  name="sectionid"
                  options={sectionOptions}
                  onChange={(option: any) => {
                    if (option) {
                      addformik.setFieldValue("sectionid", option.value);
                      addformik.setFieldValue("sectionname", option.label);
                    } else {
                      addformik.setFieldValue("sectionid", "");
                      addformik.setFieldValue("sectionname", "");
                    }
                  }}
                  errors={addformik.errors.sectionid}
                  touched={addformik.touched.sectionid}
                />
              </div>

              {/* Search Bar (Kept the original search logic on name) */}
              <div className="col-md-2">
                <InputField
                  type="text"
                  label="Search by Name/Email"
                  value={searchText}
                  name="search"
                  placeholder="Search Line Manager..."
                  errors={""}
                  touched={""}
                  onBlur={() => { }}
                  onChange={(e: any) => setSearchText(e.target.value)}
                />
              </div>
            </div>
            {/* Row 2: Selected Info and Add Button */}
            <div className="row form_grider d1">
              <div className="col-md-8 d-flex justify-content-start align-items-center gap-5">
                <div className="w100 mb-0">Selected Unit :<b>{unitOptions.find((u) => String(u.value) === String(addformik.values.unitid))?.label}</b></div>
                <div className="w100 mb-0">Selected Department :<b>{departmentOptions.find((u) => String(u.value) === String(addformik.values.departmentid))?.label}</b></div>
                <div className="w100 mb-0">Selected Section :<b>{sectionOptions.find((u) => String(u.value) === String(addformik.values.sectionid))?.label}</b></div>
              </div>
              <div className="col-md-4 d-flex justify-content-end align-items-center">
                <button
                  className="iconBtn green w100 mb-3" type="button"
                  onClick={() => {
                    if (!addformik.values.unitid) {
                      toast.error("Please select Unit!");
                    } else if (!addformik.values.departmentid) {
                      toast.error("Please select Department!");
                    } else if (!addformik.values.sectionid) {
                      toast.error("Please select Section!");
                    } else {
                      // Call candidate API before opening the modal (already handled by useEffect, but good to ensure data)
                      // fetchLineManagerCandidates(addformik.values.unitid, addformik.values.departmentid);
                      addformik.setFieldValue("linemanagerEmail", "");
                      addformik.setFieldValue("linemanagerName", "");
                      addformik.setFieldValue("jsplid", "");
                      setIsAddModalOpen(true);
                    }
                  }}
                >
                  <span>Add Linemanager</span>
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
        </div>
        {/* Block 3: Table Display */}
        <div className="pb-4">
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Serial No</th>
                        <th>LineManager Email</th>
                        <th>LineManager Name</th>
                        <th>Section</th>
                        <th>Section Head</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(getPaginatedLineManagerData() && getPaginatedLineManagerData().length > 0) ? (
                        getPaginatedLineManagerData().map((lm: any, index: number) => (
                          <tr key={lm?.id}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{lm?.linemanagerEmail}</td>
                            <td>{lm?.linemanagerName}</td>
                            <td>{lm?.sectionname}</td>
                            <td>{lm?.sectionhead}</td>
                            <td>
                              {lm?.status && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <img
                                    width="30"
                                    height="30"
                                    alt="status icon"
                                    src={
                                      lm?.status === "active"
                                        ? "/images/svg/icons/GreenCircle.svg"
                                        : "/images/svg/icons/RedCircle.svg"
                                    }
                                  />
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "center" }}>
                                <button className="tableBtn" type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    fetchLineManager(lm?.id);
                                  }}
                                >
                                  <span>
                                    <img
                                      width="15"
                                      height="15"
                                      alt="icon"
                                      src="/images/svg/edit-icon-blue.svg"
                                    />
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center">
                            No data found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Start/End */}
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
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredLineManagers.length)} of {filteredLineManagers.length} records
                    </span>
                  </div>
                  <nav className="pagination_wrapper">
                    <ul className="pagination">
                      <li className="page-item">
                        <button type="button"
                          className="page-link actionBtns"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <img
                            width="15" height="15" alt="icon" src="/images/svg/arrow-left-small.svg" className="img-flui u-image"
                          />
                        </button>
                      </li>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (currentPage > 3 && totalPages > 5) {
                          pageNum = currentPage - 2 + i;
                          if (pageNum > totalPages) { return null; }
                        }
                        return (
                          <li className="page-item" key={pageNum}>
                            <button type="button"
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
                          <button type="button"
                            className={`page-link ${currentPage === totalPages ? 'active' : ''}`}
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </li>
                      )}
                      <li className="page-item">
                        <button
                          className="page-link actionBtns" type="button"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <img
                            width="15" height="15" alt="icon" src="/images/svg/arrow-right-small.svg" className="img-flui u-image"
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

        {/* ADD LINE MANAGER MODAL */}
        <CustomModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            // addformik.resetForm();
            // setCandidateOptions(emptySelector);
            // setCandidateList([]);
            // setSelectedUserDetail(null);
          }}
          modalSizeClassName="modal-lg"
          title="Add Line Manager"
        >
          <form onSubmit={addformik.handleSubmit}>
           <div className="filters px-3 py-2" style={{ maxWidth: "750px", margin: "0 auto" }}>
              <div className="row form_grider d1">
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Unit:</label> </div>
                <div className="col-md-9">
                  <InputField type="text" name="unitname" placeholder="" disabled={true}
                    value={unitOptions.find((u) => String(u.value) === String(addformik.values.unitid))?.label || ""}
                    onChange={() => { }}
                    onBlur={() => { }}
                    errors={""}
                    touched={""}
                  />
                </div>
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Department:</label> </div>
                <div className="col-md-9">
                  <InputField type="text" name="departmentname" placeholder="" disabled={true}
                    value={departmentOptions.find((u) => String(u.value) === String(addformik.values.departmentid))?.label || ""}
                    onChange={() => { }}
                    onBlur={() => { }}
                    errors={""}
                    touched={""}
                  />
                </div>
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Section:</label> </div>
                <div className="col-md-9">
                  {/* Display Section Name from selected sectionId */}
                  <InputField type="text" name="sectionname" placeholder="" disabled={true}
                    value={sectionOptions.find((u) => String(u.value) === String(addformik.values.sectionid))?.label || ""}
                    onChange={() => { }}
                    onBlur={() => { }}
                    errors={""}
                    touched={""}
                  />
                </div>
              </div>

              {/* Row 2: Line Manager Email (Dropdown) */}
              <div className="row form_grider d1">
                <div className="col-md-2 py-2"> <label className="form-label mb-1">LM Email:</label> </div>
                <div className="col-md-9">
                  <SelectField
                    // label="Line Manager Email"
                    value={candidateOptions.find(opt => opt.value === addformik.values.linemanagerEmail)}
                    name="linemanagerEmail"
                    placeholder="Select Email"
                    options={candidateOptions}
                    onChange={(option) => addformik.setFieldValue("linemanagerEmail", option?.value)}
                    onBlur={addformik.handleBlur}
                    errors={addformik.errors.linemanagerEmail}
                    touched={addformik.touched.linemanagerEmail}
                  />
                </div>
              </div>

              {/* Row 3: LM Name (Read-only from selected email) */}
              <div className="row form_grider d1">
                <div className="col-md-2 py-2"> <label className="form-label mb-1">LM Name:</label> </div>
                <div className="col-md-9">
                  <InputField type="text" name="linemanagerName" placeholder="Choose Emailid first" disabled={true}
                    value={addformik.values.linemanagerName}
                    onChange={() => { }}
                    onBlur={() => { }}
                    errors={""}
                    touched={""}
                  />
                </div>
              </div>

              {/* Row 4: JSPL ID (Read-only from selected email) */}
              <div className="row form_grider d1" style={{ display: "none" }}>
                <div className="col-md-2 py-2"> <label className="form-label mb-1">JSPL ID:</label> </div>
                <div className="col-md-9">
                  <InputField type="text" name="jsplid" placeholder="" disabled={true}
                    value={addformik.values.jsplid}
                    onChange={() => { }}
                    onBlur={() => { }}
                    errors={""}
                    touched={""}
                  />
                </div>
              </div>

              {/* Row 5: Section Head & Status (Editable) */}
              <div className="row form_grider d1">
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Section Head:</label> </div>
                <div className="col-md-9">
                  <SelectField
                    value={sectionHeadOptions.find(opt => opt.value === addformik.values.sectionhead)}
                    name="sectionhead"
                    placeholder="Section Head"
                    options={sectionHeadOptions}
                    onChange={(option) => addformik.setFieldValue("sectionhead", option?.value)}
                    onBlur={addformik.handleBlur}
                    errors={addformik.errors.sectionhead}
                    touched={addformik.touched.sectionhead}
                  />
                </div>
                {/* <div className="col-md-2 py-2"> <label className="form-label mb-1">Status:</label> </div>
                <div className="col-md-9">
                  <SelectField
                    value={statusOptions.find(opt => opt.value.toLowerCase() === addformik.values.status.toLowerCase())}
                    name="status"
                    placeholder="Select Status"
                    options={statusOptions}
                    onChange={(option) => addformik.setFieldValue("status", option?.value)}
                    onBlur={addformik.handleBlur}
                    errors={addformik.errors.status}
                    touched={addformik.touched.status}
                  />
                </div> */}
              </div>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <button className="iconBtn bg-danger d-flex align-items-center gap-2 px-3 py-2"
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    // addformik.resetForm();
                    // setCandidateOptions(emptySelector);
                    // setCandidateList([]);
                    // setSelectedUserDetail(null);
                  }}
                >
                  <img
                    width="18" height="18" alt="Cancel" src="/images/svg/icons/Cancle.svg" className="white-icon" />
                  Cancel
                </button>
                <button className="iconBtn bg-success d-flex align-items-center gap-2 px-3 py-2"
                  type="submit"
                  // disabled={!addformik.isValid || addformik.isSubmitting}
                >
                  <img
                    width="18" height="18" alt="Add" src="/images/svg/icons/Save.svg" className="white-icon" />
                  Save
                </button>
              </div>
            </div>
          </form>
        </CustomModal>

        {/* EDIT LINE MANAGER MODAL */}
        <CustomModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          modalSizeClassName="modal-md"
          title="Edit Line Manager"
        >
          <form onSubmit={editformik.handleSubmit}>
            <div className="filters px-3 py-2" style={{ maxWidth: "750px", margin: "0 auto" }}>
              <div className="row form_grider d1">
                {/* Unit (Read-only) */}
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Unit:</label> </div>
                <div className="col-md-9">
                  <InputField
                    type="text" name="unitname" placeholder="" disabled={true}
                    value={unitOptions.find((u) => String(u.value) === String(editformik.values.unitid))?.label || ""}
                    onChange={() => { }}
                    onBlur={() => { }}
                    errors={""}
                    touched={""}
                  />
                </div>
                {/* Department (Read-only) */}
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Department:</label> </div>
                <div className="col-md-9">
                  <InputField
                    type="text" name="departmentname" placeholder="" disabled={true}
                    value={departmentOptions.find((u) => String(u.value) === String(editformik.values.departmentid))?.label || ""}
                    onChange={() => { }}
                    onBlur={() => { }}
                    errors={""}
                    touched={""}
                  />
                </div>
                {/* Section (Read-only) */}
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Section:</label> </div>
                <div className="col-md-9">
                  <InputField
                    type="text" name="sectionname" placeholder="Section Name" disabled={true}
                    value={editformik.values.sectionname}
                    onChange={() => { }}
                    onBlur={() => { }}
                    errors={""}
                    touched={""}
                  />
                </div>
              </div>
              <div className="row form_grider d1">
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Email:</label> </div>
                <div className="col-md-9">
                  <InputField
                    type="text" name="linemanagerEmail" placeholder="" disabled={true}
                    value={editformik.values.linemanagerEmail}
                    onChange={() => { }}
                    onBlur={() => { }}
                    errors={""}
                    touched={""}
                  />
                </div>
              </div>
              <div className="row form_grider d1">
                {/* Section Head (Editable - YES/NO) */}
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Section Head:</label> </div>
                <div className="col-md-9">
                  <SelectField
                    value={sectionHeadOptions.find(opt => opt.value === editformik.values.sectionhead)}
                    name="sectionhead"
                    placeholder="Section Head"
                    options={sectionHeadOptions}
                    onChange={(option) => editformik.setFieldValue("sectionhead", option?.value)}
                    onBlur={editformik.handleBlur}
                    errors={editformik.errors.sectionhead}
                    touched={editformik.touched.sectionhead}
                  />
                </div>
                {/* Status (Editable) */}
                <div className="col-md-2 py-2"> <label className="form-label mb-1">Status:</label> </div>
                <div className="col-md-9">
                  <SelectField
                    value={statusOptions.find(opt => opt.value.toLowerCase() === editformik.values.status.toLowerCase())}
                    name="status"
                    placeholder="Select Status"
                    options={statusOptions}
                    onChange={(option) => editformik.setFieldValue("status", option?.value)}
                    onBlur={editformik.handleBlur}
                    errors={editformik.errors.status}
                    touched={editformik.touched.status}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button className="iconBtn bg-danger d-flex align-items-center gap-2 px-3 py-2"
                  type="button" onClick={() => setIsEditModalOpen(false)}>
                  <img
                    width="18" height="18" alt="Cancel" src="/images/svg/icons/Cancle.svg" className="white-icon" />
                  Cancel
                </button>
                <button className="iconBtn bg-success d-flex align-items-center gap-2 px-3 py-2"
                  type="submit"
                  disabled={!editformik.isValid || editformik.isSubmitting}
                >
                  <img
                    width="18" height="18" alt="Update" src="/images/svg/icons/Save.svg" className="white-icon" />
                  Update
                </button>
              </div>
            </div>
          </form>
        </CustomModal>

        <ToastContainer position="top-right" autoClose={3000}
          hideProgressBar={false} closeOnClick pauseOnHover />
      </div>
    </>
  );
};

export default LinemanagerPanel;