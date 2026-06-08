"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
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
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { emptySelector } from "@/config/config";
import { FETCH_UNITS, FETCH_DEPARTMENTS, FETCH_SECTIONS,
   FETCH_USER, FETCH_DESIGNATION, FETCH_LINEMANAGER,
   FETCH_COMMITTEES} from "@/config/apiConfig";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";
import { FaInfo, FaPen, FaBinoculars, FaMap, FaUserFriends, FaUser } from "react-icons/fa";
// import LineManagerPanel from "../work-place/_partials/LineManagerPanel";
import LineManagerHandler from "./_partials/LineManagerHandler";
// import CommitteeHandler from "./_partials/CommitteeHandler";

dayjs.extend(utc);
const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

type FormValues = {
  unitId: string;
  departmentId: string;
  sectionId: string;
  jsplid: string;              
  empId: string;
  empEmail: string;
  empName: string; 
  empCode: string;
  empMobile: string;
  empType: string;
  empDesignation: string;
  empUnit: string;
  empDepartment: string;
  empSection: string;
  empArea?: string;
  siTrainedStatus: string;
  siTrainingUntill?: string;
  imTrainedStatus: string;
  cfsaTrainedStatus: string;
  empActiveStatus: string;
  rowIndex?: number;
  userProfile?: string;
  empStatus?: string;
  createdAt?: string;
  lastUpdatedOn?: string;
  companyName?: string;
  flag?: string;
  empGender?: string;
 };

 interface UserDetailType {
  jsplid: string;              
  empId: string;
  empEmail: string;
  unitId?: string;
  departmentId?: string;
  sectionId?: string;
  empName: string; 
  empMobile: string;
  empType: string;
  empDesignation: string;
  empUnit: string;
  empDepartment: string;
  empSection: string;
  empActiveStatus: string;
  empArea: string;
  siTrainedStatus: string;
  siTrainingUntill: string;
  createdAt: string;
  lastUpdatedOn: string;
  companyName: string;
  rowIndex: number;
  userProfile: string;
  empStatus: string;
  imTrainedStatus: string;
  cfsaTrainedStatus: string;
  cgid: string;
  flag: string;
  empGender: string;
}
interface RoleType {
  id: number;
  jsplId: string;
  unitId: string;
  userRole: string;
  rowIndex: number;
  actionStatus?: string;
  notificationCount: number;
  updatedat?: string;
  updatedby?: string;
  manageSiCreate?: string;
  manageSiView?: string;
  manageSiEdit?: string;
  siReportView?: string;
  manageSoCreate?: string;
  manageSoView?: string;
  manageSoEdit?: string;
  soReportView?: string;
  manageLwCreate?: string;
  manageLwView?: string;
  manageLwEdit?: string;
  lwReportView?: string;
  bulkuploadTrainingCreate?: string;
  bulkuploadRoleCreate?: string;
  reportView?: string;
  annoucementView?: string;
  annoucementCreate?: string;
  annoucementEdit?: string;
  wpmEdit?: string;
  wpmView?: string;
  wpmCreate?: string;
  dmEdit?: string;
  dmView?: string;
  dmCreate?: string;
  lwScheduleView?: string;
  lwScheduleEdit?: string;
  siScheduleView?: string;
  siScheduleEdit?: string;
  roleCreate?: string;
  roleView?: string;
  roleEdit?: string;
  guestEdit?: string;
  guestCreate?: string;
  guestView?: string;
  employeeView?: string;
  employeeEdit?: string;
  pirView?: string;
  pirCreate?: string;
  safetyAlertView?: string;
  safetyAlertCreate?: string;
  investigationTeamView?: string;
  investigationTeamCreate?: string;
  investigationReportView?: string;
  investigationReportCreate?: string;
  lessonLearntView?: string;
  lessonLearntCreate?: string;
  departmentId?: string;
  sectionid?: string;
  unitName?: string;
  departmentName?: string;
  sectionName?: string;
}


const EmployeeManage = () => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState(null);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [userList, setUserList] = useState([]);
  const [userDetail, setUserDetail] = useState<UserDetailType | null>(null);
  const [roleList, setRoleList] = useState<RoleType[]>([]);  
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [userUnitOptions, setUserUnitOptions] = useState(emptySelector);
  const [userDepartmentOptions, setUserDepartmentOptions] = useState(emptySelector);
  const [userSectionOptions, setUserSectionOptions] = useState(emptySelector);
  const [designationOptions, setDesignationOptions] = useState(emptySelector);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  //Deactivation Modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRoleEditOpen, setIsRoleEditOpen] = useState(false);
  const [isCommitteeEditOpen, setIsCommitteeEditOpen] = useState(false);
  const [committeeList, setCommitteeList] = useState([]);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<any>(null);
  const [taskWithUser, setTaskWithUser] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [deactivationReason, setDeactivationReason] = useState("");
  const [deactivationErrors, setDeactivationErrors] = useState({
    taskWithUser: "",
    transferTo: ""
  });
  const [selectedRole, setSelectedRole] = useState("");
  const [roleUnit, setRoleUnit] = useState("");
  const [roleDepartment, setRoleDepartment] = useState("");
  
  const siTrainedOptions = [
    { value: "YES", label: "YES" },
    { value: "NO", label: "NO" },
  ];
  const imTrainedOptions = [
    { value: "YES", label: "YES" },
    { value: "NO", label: "NO" },
  ];
  const cfsaTrainedOptions = [
    { value: "YES", label: "YES" },
    { value: "NO", label: "NO" },
  ];
  const roleOptions = [
    { value: "Site Admin", label: "Site Admin", allowedByDepartmentAdmin: false },
    { value: "Department Admin", label: "Department Admin" },
    { value: "Super Admin", label: "Super Admin", allowedBySiteAdmin: false, allowedByDepartmentAdmin: false },
    { value: "HOD Safety", label: "HOD Safety", allowedByDepartmentAdmin: false },
  ];
//Role based variables
// const {
//   isUnitDisabled,
//   isDeptDisabled,
//   isSectionDisabled,
//   unitId,
//   departmentId,
//   shouldPreloadDepartments,
// } = useRolePermissions(user?.userRoles || []);

  useEffect(() => {
    fetchUnits();
    fetchUsers(null, null, null);
    fetchUserUnits();
    fetchDesignation();
  }, [])

  // ✅ Fetch departments when unit changes
  // useEffect(() => {
  // if (unitId && shouldPreloadDepartments) {
  //   fetchDepartments(unitId);
  // }
  // }, [unitId, shouldPreloadDepartments]);
 
 // ✅ Sync unitId and departmentId into Formik
// useEffect(() => {
//   if (unitId && !formik.values.unitId) {
//     formik.setFieldValue("unitId", unitId);
//   }
//   if (departmentId && !formik.values.departmentId) {
//     formik.setFieldValue("departmentId", departmentId);
//   }
// }, [unitId, departmentId]);

  // useEffect(() => {
  //   if (departmentId) {
  //     fetchSections(departmentId); // make sure this populates section
  //     }
  // }, [departmentId]);

  useEffect(() => {
    fetchUserDepartments(userDetail?.empUnit);
  }, [userDetail?.empUnit ])

  useEffect(() => {
    fetchUserSections(userDetail?.empDepartment);
  }, [userDetail?.empDepartment])
 
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
    //console.log(role);
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
  const checkToOpenUserEditModal = async(jsplId: string, unitId: string, departmentId: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
      setIsEditOpen(true);
      fetchUser(jsplId);
    } else {
      toast.warning("You are not authorized to modify the user.");
    }
  };
  const checkToOpenRoleEditModal = async(jsplId: string, unitId: string, departmentId: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
      setRoleUnit("");
      setRoleDepartment("");
      setSelectedRole("")
      setIsRoleEditOpen(true);
      fetchRoles(jsplId);      
    } else {
      toast.warning("You are not authorized to modify the user.");
    }
  };

  const checkToOpenCommitteeEditModal = async(unitId: string) => {
    setIsCommitteeEditOpen(true);
    fetchCommittees(unitId)
};

  // ✅ Filter options dynamically based on current user role
  const getFilteredRoleOptions = (currentRole: string) => {
    const currentRoles = ["Super Admin", "Site Admin", "Department Admin"];;
    if(currentRoles.includes(currentRole)) {
      if (currentRole === "Super Admin") {
        return roleOptions; // can see all
      }

      if (currentRole === "Site Admin") {
        return roleOptions.filter(
          (r) => r.allowedBySiteAdmin !== false // exclude roles disallowed for Site Admin
        );
      }

      if (currentRole === "Department Admin") {
        return roleOptions.filter(
          (r) => r.allowedByDepartmentAdmin !== false // exclude roles disallowed for Dept Admin
        );
      }

      // For others — can only assign their own role
      return roleOptions.filter((r) => r.value === currentRole);
    };
    return [];
  };

  const filteredRoleOptions = getFilteredRoleOptions(getTopRole(user?.userRoles));
  
  const topRole = getTopRole(user?.userRoles); // "Super Admin"

  const checkToAddUserRole = async(jsplId: string, role: string, unitId: string, departmentId: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
      if((role == "Site Admin" || role == "HOD Safety") && unitId == "") {
        toast.warning("Unit mapping is mandatory for Site Admin and HOD Safety role.");
        return false;
      }
      else if(role == "Department Admin" && (unitId == "" || departmentId == ""))
      {
        toast.warning("Unit and Department mapping is mandatory for Department Admin role.");
        return false;
      }
       updateRole(jsplId, role, unitId, departmentId);
    } else {
      toast.warning("You are not authorized to assign role against the specific workspace.");
    }
  };
  const checkToDeleteUserRole = async(jsplId: string, removableRole: string, rowIndex: number, unitId: string, departmentId: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "", removableRole)) {
      deleteRole(jsplId, rowIndex);
    } else {
      toast.warning("You don't have enough permission to remove this role.");
    }
  };
  // const checkToInactiveLineManager = async(id: number, name: string, unitId: string, departmentId: string) => {
  //   if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
  //     updateLineManager(id, name, "inactive");
  //   } else {
  //     toast.warning("You don't have enough permission to remove this role.");
  //   }
  // };
  // Role Based Access
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
    setDepartmentOptions(emptySelector);
    setSectionOptions(emptySelector);
    try {
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
      } else {
        setDepartmentOptions(emptySelector);
        setSectionOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchSections = async (deptId: string) => {
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
       } else {
        setSectionOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchUsers = async (unitId: string, departmentId: string, sectionId: string) => {
    setUserList([]);
    const searchPayload = {
      jsplid: null,
      empCode: null,
      empEmail: null,
      unitId: unitId,
      departmentId: departmentId,
      sectionId: sectionId,
      siTrainedStatus: null,
      imTrainedStatus: null,
      cfsaTrainedStatus: null,
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
        setUserList(response?.users);
      }
    } catch (error) {
      console.error("Error fetching candidate users:", error);
    }
  };
  const fetchUser = async (jsplid: string) => {
    setUserDetail(null);
    try {
      const response = await serverRequest(
        {},
        FETCH_USER + `/${jsplid}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );

      if (response) {
        setUserDetail(response);
      }
      } catch (error) {
        console.error("Error fetching candidate users:", error);
      }
  };
  const fetchUserUnits = async () => {
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
        setUserUnitOptions(options);
       } else {
        setUserUnitOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchUserDepartments = async (unitId) => {
    setUserDepartmentOptions(emptySelector);
    setUserSectionOptions(emptySelector);
    try {
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
       setUserDepartmentOptions(options);
      } else {
        setUserDepartmentOptions(emptySelector);
        setUserSectionOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchUserSections = async (deptId: string) => {
    setUserSectionOptions(emptySelector);
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
       setUserSectionOptions(options);
       } else {
        setUserSectionOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchDesignation = async () => {
    setDesignationOptions(emptySelector);
    try {
      const response = await serverRequest(
        {},
        FETCH_DESIGNATION,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response && response.length > 0) {
        const options = response.map((value) => ({
          value: value?.id,
          label: value?.designationName,
        }));
       setDesignationOptions(options);
       } else {
        setDesignationOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchRoles = async (jsplid: string) => {
    setRoleList([]);
    try {
      const response = await serverRequest(
        {},
        FETCH_USER + `/Role/${jsplid}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response && response.length > 0) {
       setRoleList(response);
       } else {
        setRoleList([]);
      }
      } catch (error) {
        console.error("Error fetching candidate users:", error);
      }
  };
//   const fetchLineManagers = async (jsplid: string) => {
//     setLineManagerList(null);    
//     try {
//       const response = await serverRequest(
//         {},
//         FETCH_LINEMANAGER + `/get-line-manager-mapping/${jsplid}`,
//         CONSTANTS.REQUEST_GET,
//         true,
//         true,
//         token
//       );
//       if (response && response.length >0) {
//         setLineManagerList(response);
//       } else {
//         setLineManagerList(null);
//       }
//     } catch (error) {
//       console.error("Error fetching line managers:", error);
//     }
//   };

  const fetchCommittees = async (unitid: string) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_COMMITTEES + `/get-committees/${unitid}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        setCommitteeList(response);
        } else {
        setCommitteeList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

 // Update User
const updateUser = async (payload: FormValues) => {
  const updatePayload = {
  ...userDetail,
    empDepartment: payload.empDepartment,
    empSection: payload.empSection,
    siTrainedStatus: payload.siTrainedStatus,
    imTrainedStatus: payload.imTrainedStatus,
    cfsaTrainedStatus: payload.cfsaTrainedStatus,
    lastUpdatedOn: dayjs().utc().format("YYYY-MM-DDTHH:mm:ss.SSS000[Z]"),
  };
  try {
    const response = await serverRequest(
      updatePayload,
      FETCH_USER + `/${payload.jsplid}`,
      CONSTANTS.REQUEST_PUT,
      true,
      true,
      token
    );
      if (response) { 
        toast.success("Employee details updated successfully");
        setIsEditOpen(false);
        fetchUsers(null, null, null);
      } else {
        toast.error(response?.message || "Failed to update User.");
      }
    } catch (error) {
      console.error("Error updating Line Manager:", error);
    }
  };
 // Update User
const updateRole = async (jsplId: string, userRole: string,unitid: string, departmentid: string) => {
  const payload: any = { jsplId, userRole };

  switch (userRole) {
    case "Site Admin":
    case "HOD Safety":
      payload.unitid = unitid;
      break;
    case "Department Admin":
      payload.unitid = unitid;
      payload.departmentid = departmentid;
      break;
    default:
      // keep base fields
      break;
  }
  try {
    const response = await serverRequest(
      payload,
      FETCH_USER + `/Role`,
      CONSTANTS.REQUEST_POST,
      true,
      true,
      token
    );
      if (response) { 
        toast.success("Role added successfully");
        fetchRoles(jsplId);
      } else {
        toast.error(response?.message || "Failed to update Role.");
      }
     } catch (error) {
       console.error("Error updating Role:", error);
    }
  };
// Delete Role
const deleteRole = async (jsplId: string, rowIndex: number) => {
  try {
    const response = await serverRequest(
      {},
      FETCH_USER + `/Role/${jsplId}/${rowIndex}`,
      CONSTANTS.REQUEST_DELETE,
      true,
      true,
      token
    );
       if (response) { 
         toast.success("Role deleted successfully");
         fetchRoles(jsplId);
       } else {
         toast.error(response?.message || "Failed to update Role.");
       }
     } catch (error) {
       console.error("Error updating Role:", error);
     }
   };
  // --- Pagination & Table Logic ---
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(filteredUsers.length / newSize));
    setCurrentPage(1);
  };
 const filteredUsers = userList.filter((user: any) => {
  const search = (searchText || "").toLowerCase();
  const email = (user?.empEmail || "").toLowerCase();
  const code = (user?.empId || "").toLowerCase();
  const name = (user?.empName || "").toLowerCase();

  return (
    email.includes(search) ||
    code.includes(search) ||
    name.includes(search)
  );
 });

  useEffect(() => {
    setTotalPages(Math.ceil(filteredUsers.length / pageSize));
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, filteredUsers.length, currentPage, totalPages]);

  const validationSchema = Yup.object({
    unitid: Yup.string().required("Unit is required")
  });
  const formik = useFormik<FormValues>({
    initialValues: {
    jsplid: null,
    empCode: null,
    empEmail: null,
    unitId: userDetail?.unitId || null,
    departmentId: userDetail?.departmentId || null,
    sectionId: null,
    siTrainedStatus: null,
    imTrainedStatus: null,
    cfsaTrainedStatus: null,
    empActiveStatus: "TRUE",
    empId: null,
    empName: null,
    empMobile: null,
    empType: null,
    empDesignation: null,
    empUnit: null,
    empDepartment: null,
    empSection: null,
    },
    // validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log("Submit Value-", JSON.stringify(values));
    },
  });

  // ✅ Auto-select department if there’s only one option
// useEffect(() => {
//   if (
//     !isDeptDisabled && // Department is editable
//     formik.values.unitId && // Unit is selected
//     departmentOptions.length === 1 && // Only one department available
//     !formik.values.departmentId // Department not already selected
//   ) {
//     const singleDept = departmentOptions[0];
//     formik.setFieldValue("departmentId", singleDept.value);
//     fetchUsers(formik.values.unitId, singleDept.value, null);
//   }
// }, [departmentOptions, isDeptDisabled, formik.values.unitId]);

// fetch users based on selection
useEffect(() => {
  const { unitId, departmentId, sectionId } = formik.values;
  if (unitId || departmentId || sectionId) {
    fetchUsers(unitId || null, departmentId || null, sectionId || null);
  }
}, [formik.values.unitId, formik.values.departmentId, formik.values.sectionId]);

 const editformik = useFormik<FormValues>({
    initialValues: {
    jsplid: userDetail?.jsplid || "",
    empId: userDetail?.empId || "",
    empName: userDetail?.empName || "",
    empMobile: userDetail?.empMobile || "",
    empType: userDetail?.empType || "",
    empDesignation: userDetail?.empDesignation || "",
    empUnit: userDetail?.empUnit || "",
    empDepartment: userDetail?.empDepartment || "",
    empSection: userDetail?.empSection || "",
    empEmail: userDetail?.empEmail || "",
    empActiveStatus: userDetail?.empActiveStatus || "",
    siTrainedStatus: userDetail?.siTrainedStatus || "",
    siTrainingUntill: userDetail?.siTrainingUntill || "",
    imTrainedStatus: userDetail?.imTrainedStatus || "",
    cfsaTrainedStatus: userDetail?.cfsaTrainedStatus || "",
    rowIndex: userDetail?.rowIndex || null,
    userProfile: userDetail?.userProfile || "",
    empStatus: userDetail?.empStatus || "",
    empArea: userDetail?.empArea || "",
    createdAt: userDetail?.createdAt || "",
    lastUpdatedOn: userDetail?.lastUpdatedOn || "",
    companyName: userDetail?.companyName || "",
    flag: userDetail?.flag || "",
    empGender: userDetail?.empGender || "",
    unitId: userDetail?.unitId || "",
    departmentId: userDetail?.departmentId || "",
    sectionId: userDetail?.sectionId || "",
    empCode: "",
    },
    // validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
    if (!userDetail) return;
    try {
      await updateUser(values);
    } catch (err) {
      console.error("Update failed", err);
    }
  },
  });
  return (
    <>
     <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="container-fluid">
        <div className="admin-boxContainer d3 ">
          <div className="adminAction">
            <Link href={APP_URL.ADMIN_DASHBOARD} className="adminAction__title">
              <span className="icon">
                <Image
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage User
            </Link>
          </div>
        </div>
        <div className="c-accordion__head">
        <div className="c-accordion__head--title"> Employee Manage
        </div>
        </div>
        <div className="adminFilters__list p-0 m-2">
          <div className="row form_grider d1">
            <div className="col-12 d-flex gap-2 justify-content-end align-items-center">
             <div className="col-md-2">
                  <SelectField
                    label="Unit"
                    placeholder="Select Unit"
                    value={
                      formik.values.unitId
                        ? unitOptions.find((u) => String(u.value) === String(formik.values.unitId))
                        : null
                    }
                    name="unitId"
                    options={unitOptions}
                    onChange={(option: any) => {
                      if (option) {
                        formik.setFieldValue("unitId", option.value);
                        formik.setFieldValue("departmentId", "");
                        formik.setFieldValue("sectionId", "");
                        fetchDepartments(option.value);
                        fetchUsers(option.value, null, null);
                      } else {
                        formik.setFieldValue("unitId", "");
                        formik.setFieldValue("departmentId", "");
                        formik.setFieldValue("sectionId", "");
                      }
                    }}
                    // disabled={isUnitDisabled}
                  />
               </div>
               <div className="col-md-3">
                  <SelectField
                    label="Department"
                    placeholder="Select Department"
                    value={
                      formik.values.departmentId
                        ? departmentOptions.find((u) => String(u.value) === String(formik.values.departmentId))
                        : null
                    }
                    name="departmentId"
                    options={departmentOptions}
                    onChange={(option: any) => {
                      if (option) {
                        formik.setFieldValue("departmentId", option.value);
                        formik.setFieldValue("sectionId", "");
                        fetchSections(option.value);
                        fetchUsers(formik.values.unitId, option.value, null);
                      } else {
                        formik.setFieldValue("departmentId", "");
                        formik.setFieldValue("sectionId", "");
                      }
                    }}
                    // disabled={isDeptDisabled}
                  />
              </div>
               <div className="col-md-3">
                  <SelectField
                    label="Section"
                    placeholder="Select Section"
                    value={
                      formik.values.sectionId
                        ? sectionOptions.find((u) => String(u.value) === String(formik.values.sectionId))
                        : null
                    }
                    name="sectionId"
                    options={sectionOptions}
                    onChange={(option: any) => {
                      if (option) {
                        formik.setFieldValue("sectionId", option.value);
                        fetchUsers(formik.values.unitId, formik.values.departmentId, option.value);
                      } else {
                        formik.setFieldValue("sectionId", "");
                      }
                    }}
                    errors={formik.errors.sectionId}
                    touched={formik.touched.sectionId}
                  />
              </div>
              <div className="col-md-3">
                <InputField
                    type="text"
                    label="Search by"
                    value={searchText}
                    name="search"
                    placeholder="Email/Emp. Code/Name.."
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={(e: any) => setSearchText(e.target.value)}
                />
              </div>
              <div style={{ alignItems: "center", display: "flex", gap: "5px" }}>
                <Image
                  width="30"
                  height="30"
                  alt="icon"
                  src="/images/svg/icons/Search.svg"
                  style={{
                    cursor: "pointer",
                    filter:
                      "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                  }}
                  className="img-fluid u-image"
                />
              </div>
            </div>
             {/* <div className="col-12 d-flex justify-content-start align-items-center gap-5">
             <div className="w100 mb-0">Selected Unit :<b>{unitOptions.find((u) => String(u.value) === String(formik.values.unitId))?.label}</b></div>
             <div className="w100 mb-0">Selected Department :<b>{departmentOptions.find((u) => String(u.value) === String(formik.values.departmentId))?.label}</b></div>
             <div className="w100 mb-0">Selected Section :<b>{sectionOptions.find((u) => String(u.value) === String(formik.values.sectionId))?.label}</b></div>
             </div> */}
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
                        <th>Emp. Code</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Unit</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Status</th>
                        <th>LastUpdateOn</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(getPaginatedData() && getPaginatedData().length > 0) ? (
                        getPaginatedData().map((user: any, index: number) => (
                          <tr key={user?.empId}>
                            {/* <td>{(currentPage - 1) * pageSize + index + 1}</td> */}
                            <td>{user?.empId}</td>
                            <td>{user?.empName}</td>
                            <td>{user?.empEmail}</td>
                            <td>{user?.empUnit}</td>
                            <td>{user?.empDepartment}</td>
                            <td>{user?.empSection}</td>
                            <td>
                               {/* <label className="switch">
                                <input type="checkbox" checked={user?.empActiveStatus} 
                                  onChange={() => {toggleActive(user?.jsplid);fetchUser(user?.jsplid);}} 
                                  />
                                <span className="slider round"></span>
                              </label> */}
                               {user?.empActiveStatus && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Image
                                    width="30"
                                    height="30"
                                    alt="status icon"
                                    src={
                                      user?.empActiveStatus === "TRUE"
                                        ? "/images/svg/icons/GreenCircle.svg"
                                        : "/images/svg/icons/RedCircle.svg"
                                    }
                                  />
                                </div>
                              )}
                            </td>
                            <td>{dayjs(user?.lastUpdatedOn).format("DD-MM-YYYY")}</td>
                            <td>
                             <div style={{ padding: "8px", display: "flex", justifyContent: "center",alignItems: "center", gap: "10px" }}>
                                {/* <FaInfo style={{ cursor: "pointer", color: "#F0801E", height: "15px", width: "15px"}} /> */}
                                <FaPen title="Edit Employee" style={{ cursor: "pointer", color: "#F0801E", height: "15px", width: "15px" }}
                                 onClick ={() => {
                                    checkToOpenUserEditModal(user?.jsplid, user?.empUnitId, user?.empDepartmentId);                                  
                                  }}/>
                                <FaMap title="Role Mapping" style={{ cursor: "pointer", color: "#F0801E", height: "15px", width: "15px" }}
                                 onClick ={() => {
                                    setUserDetails(user);
                                    checkToOpenRoleEditModal(user?.jsplid, user?.empUnitId, user?.empDepartmentId);                                    
                                    // dispatch(setResponsiblePersonId(incident?.responsiblePersonJsplid))                               
                                  }}/>
                                {/* <FaUserFriends title="Committee Mapping" style={{ cursor: "pointer", color: "#F0801E", height: "15px", width: "15px" }}
                                 onClick ={() => {
                                    setUserDetails(user)
                                    checkToOpenCommitteeEditModal(user?.empUnitId);
                                  }}
                                  /> */}
                             </div>
                            </td>
                            {/* <td>
                              <div style={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "center" }}>
                                <button className="tableBtn" type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    fetchUser(user?.jsplid);
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
                            </td> */}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="text-center">
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
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} records
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
                          <Image
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
                          <Image
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
       {/* Deactivate Modal Start */} 
      {showDeactivateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '500px', maxWidth: '90%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ backgroundColor: '#446181', color: '#fff', padding: '12px 16px', fontSize: '16px'}}>
              Deactivate Employee
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{display: 'block', marginBottom: '10px', fontSize: '14px', color: '#555'}}>
                  <b>Name: </b>{userDetail?.empName}
                </label>
                <label style={{display: 'block', marginBottom: '15px', fontSize: '14px', color: '#555'}}>
                  <b>Email: </b>{userDetail?.empEmail}
                </label>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                  Task With User <span style={{ color: 'red' }}>*</span>
                </label>
                <input type="text" value={taskWithUser} onChange={(e) => { setTaskWithUser(e.target.value); if (deactivationErrors.taskWithUser) { setDeactivationErrors({...deactivationErrors, taskWithUser: ""}); } }} style={{ width: '100%', padding: '8px 12px', border: deactivationErrors.taskWithUser ? '1px solid red' : '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} />
                {deactivationErrors.taskWithUser && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                    {deactivationErrors.taskWithUser}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                  Transfer to <span style={{ color: 'red' }}>*</span>
                </label>
                <select value={transferTo} onChange={(e) => { setTransferTo(e.target.value); if (deactivationErrors.transferTo) { setDeactivationErrors({...deactivationErrors, transferTo: ""}); } }} style={{ width: '100%', padding: '8px 12px', border: deactivationErrors.transferTo ? '1px solid red' : '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}>
                  <option value="">Select</option>
                  {/* {userList.filter(emp => emp.jsplid !== deactivatingEmployee?.jsplid).map(emp => (
                    <option key={emp.jsplid} value={emp.jsplid}>{emp.name} ({emp.id})</option>
                  ))} */}
                </select>
                {deactivationErrors.transferTo && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                    {deactivationErrors.transferTo}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>
                  Reason For Deactivation
                </label>
                <textarea value={deactivationReason} onChange={(e) => setDeactivationReason(e.target.value)} rows={4} style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                Note: All tasks assigned to this employee will be transferred to the selected employee. This action cannot be undone.
              </div>
            </div>
            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px', borderTop: '1px solid #eee', gap: '10px' }}>
              <button onClick={() => setShowDeactivateModal(false)} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                Cancel
              </button>
              <button style={{ backgroundColor: '#F0801E', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Deactivate Modal End */} 
    </div>
   </form>
      {/* Edit Employee Modal Start */}  
    <CustomModal isOpen={isEditOpen} onClose={() => {setIsEditOpen(false)}}
         title='Update Employee Details'>
     <form onSubmit={editformik.handleSubmit}>
      <div
          className="modal-scrollable-content px-2 py-3"
          style={{ maxHeight: '100vh', overflowY: 'auto' }}
        >
        <div className="c-accordion" key="0">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">User Details</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-md-3">
              <InputField
                type="text"
                label="Employee Code"
                name="empId"
                placeholder=""
                value={editformik.values.empId || ""}
                onBlur={editformik.handleBlur}
                onChange={editformik.handleChange}
                errors={editformik.errors.empId}
                touched={editformik.touched.empId}
                disabled={true}
              />
            </div>
            <div className="col-md-3">
              <InputField
                type="text"
                label="Name"
                name="empName"
                placeholder="Department Name"
                value={editformik.values.empName || ""}
                onBlur={editformik.handleBlur}
                onChange={editformik.handleChange}
                errors={editformik.errors.empName}
                touched={editformik.touched.empName}
                disabled={true}
              />
            </div>
            <div className="col-md-3">
              <InputField
                type="text"
                label="Email"
                name="empEmail"
                placeholder=""
                value={editformik.values.empEmail || ""}
                onBlur={editformik.handleBlur}
                onChange={editformik.handleChange}
                errors={editformik.errors.empEmail}
                touched={editformik.touched.empEmail}
                disabled={true}
              />
            </div>
            <div className="col-md-3">
              <InputField
                type="text"
                label="Mobile"
                name="empMobile"
                placeholder=""
                value={editformik.values.empMobile || ""}
                onBlur={editformik.handleBlur}
                onChange={editformik.handleChange}
                errors={editformik.errors.empMobile}
                touched={editformik.touched.empMobile}
                disabled={true}
              />
            </div>            
            <div className="col-md-3">
              <SelectField
                label="User Designation"
                value={designationOptions.find((option) => option.value == editformik.values.empDesignation) || ""}
                name="empDesignation"
                placeholder=""
                options={designationOptions}
                onChange={(option: any) => {
                  if (option) {
                    editformik.setFieldValue("empDesignation", option.value);
                  } else {
                    editformik.setFieldValue("empDesignation", "");
                  }
                }}
                errors={editformik.errors.empDesignation}
                touched={editformik.touched.empDesignation}
                disabled={true}
              />
            </div>
            <div className="col-md-3">
              <SelectField
                label="User Unit"
                value={userUnitOptions.find((option) => option.value == editformik.values.empUnit) || ""}
                name="empUnit"
                placeholder="Choose Unit"
                options={userUnitOptions}
                onChange={(option: any) => {
                  if (option) {
                    editformik.setFieldValue("empUnit", option.value);
                    fetchUserDepartments(option.value);
                  } else {
                    editformik.setFieldValue("empUnit", "");
                  }
                }}
                errors={editformik.errors.empUnit}
                touched={editformik.touched.empUnit}
                disabled={true}
              />
            </div>
            <div className="col-md-3">
              <SelectField
                label="User Department"
                value={userDepartmentOptions.find((option) => option.value == editformik.values.empDepartment) || ""}
                name="empDepartment"
                placeholder="Choose Department"
                options={userDepartmentOptions}
                onChange={(option: any) => {
                  if (option) {
                    editformik.setFieldValue("empDepartment", option.value);
                    fetchUserSections(option.value);
                  } else {
                    editformik.setFieldValue("empDepartment", "");
                  }
                }}
                errors={editformik.errors.empDepartment}
                touched={editformik.touched.empDepartment}
                disabled={topRole !== "Super Admin"}
              />
            </div>
            <div className="col-md-3">
              <SelectField
                label="User Section"
                value={userSectionOptions.find((option) => option.value == editformik.values.empSection) || ""}
                name="empSection"
                placeholder="Choose Section"
                options={userSectionOptions}
                onChange={(option: any) => {
                  if (option) {
                    editformik.setFieldValue("empSection", option.value);
                  } else {
                    editformik.setFieldValue("empSection", "");
                  }
                }}
                errors={editformik.errors.empDepartment}
                touched={editformik.touched.empDepartment}
              />
            </div>
          </div>
        </div>
        {/* SI Training Details Start*/}
        <div className="c-accordion" key="2">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Training Details</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-md-3">
              <SelectField
                label="SI Trained"
                placeholder="Select Status"
                value={siTrainedOptions.find(opt => opt.value === editformik.values.siTrainedStatus)}
                name="siTrainedStatus"
                options={siTrainedOptions}
                onChange={(option) => editformik.setFieldValue("siTrainedStatus", option?.value)}
                onBlur={editformik.handleBlur}
                errors={editformik.errors.siTrainedStatus}
                touched={editformik.touched.siTrainedStatus}
              />
            </div>
            <div className="col-md-3">
              <SelectField
                label="IM Trained"
                placeholder="Select Status"
                value={imTrainedOptions.find(opt => opt.value === editformik.values.imTrainedStatus)}
                name="imTrainedStatus"
                options={imTrainedOptions}
                onChange={(option) => editformik.setFieldValue("imTrainedStatus", option?.value)}
                onBlur={editformik.handleBlur}
                errors={editformik.errors.imTrainedStatus}
                touched={editformik.touched.imTrainedStatus}
              />
             </div>
             <div className="col-md-3">
              <SelectField
                label="CFSA Trained"
                placeholder="Select Status"
                value={cfsaTrainedOptions.find(opt => opt.value === editformik.values.cfsaTrainedStatus)}
                name="cfsaTrainedStatus"
                options={cfsaTrainedOptions}
                onChange={(option) => editformik.setFieldValue("cfsaTrainedStatus", option?.value)}
                onBlur={editformik.handleBlur}
                errors={editformik.errors.cfsaTrainedStatus}
                touched={editformik.touched.cfsaTrainedStatus}
              />
             </div>
            </div>
           </div>  
           <div className="actionWrapper">
          <button
            className="iconBtn red v2" type="button" onClick={() => setIsEditOpen(false)}>
            <Image
              width={15}
              height="15"
              alt="Cancel"
              src="/images/svg/icons/Cancle.svg"
            />
            <span>Cancel</span>
          </button>
          <button className="iconBtn green v2" type="button" onClick={() => editformik.handleSubmit()}>
            <Image
              width={15}
              height={15}
              alt="icon"
              className="img-fluid u-image"
              src="/images/svg/icons/Save.svg"
            />
            <span>Update</span>
          </button>
        </div> 
      </div>
    </form>
   </CustomModal>           
    {/* User Role Modal*/}
     <CustomModal isOpen={isRoleEditOpen} onClose={() => {setIsRoleEditOpen(false)}}
         title='User Role Details'>
      <div
          className="modal-scrollable-content px-2 py-3"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
        <div className="c-accordion" key="1">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">User Roles</div>
          </div>
          {/* <div className="row">
            <div className="col-md-12"> */}
                <div className="row form_grider d1">
            <div className="col-md-3">
             <SelectField
                label="Role"
                value={filteredRoleOptions.find((option) => option.value === selectedRole) || ""}
                name="selectedRole"
                placeholder="Select Role"
                options={filteredRoleOptions}
                onChange={(option: any) => {
                  if (option) {
                    setSelectedRole(option.value);
                  } else {
                    setSelectedRole("");
                  }
                }}
              />
            </div>
             <div className="col-md-3">
              <SelectField
                    label="Unit"
                    placeholder="Select Unit"
                    value={unitOptions.find((option) => option.value === roleUnit) || ""}
                    name="roleUnit"
                    options={unitOptions}
                    onChange={(option: any) => {
                      if (option) {
                        fetchDepartments(option.value);
                        setRoleUnit(option.value);
                      } else {
                        setRoleUnit("");
                      }
                    }}
                  />
            </div>
             <div className="col-md-3">
             <SelectField
                    label="Department"
                    placeholder="Select Department"
                    value={departmentOptions.find((option) => option.value === roleDepartment) || ""}
                    name="roleDepartment"
                    options={departmentOptions}
                    onChange={(option: any) => {
                      if (option) {
                        setRoleDepartment(option.value);
                      } else {
                        setRoleDepartment("");
                      }
                    }}
                  />
            </div>
            <div className="col-md-3 d-flex align-items-center"
                style={{ gap: "5px", marginTop: "10px"}} >
                <button className="iconBtn green v2 d-flex align-items-center gap-2"
                 type="button" onClick={() => {checkToAddUserRole(userDetails?.jsplid, selectedRole, roleUnit, roleDepartment)}}>
                  <Image
                    width={20}
                    height={20}
                    alt="Add"
                    src="/images/svg/icons/Add.svg"
                    className="white-icon"
                  />
                  <span>Add</span>
                </button>
              </div>
           </div>           
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{overflowY: "auto", borderRadius: "4px" }}> 
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#c5cddaff" }}>
                  <tr>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>User Unit</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>User Dept.</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>User Role</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {roleList?.length > 0 ? (
                    roleList.map((role, index) => (
                    <tr key={index}>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{role?.unitName}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{role?.departmentName}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{role?.userRole}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                        <button type="button"
                          onClick={() => checkToDeleteUserRole(role?.jsplId, role?.userRole, role?.id, role?.unitId, role?.departmentId)}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "#777" }}>
                        No Roles Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
            {/* </div>
          </div> */}
        </div>
        <div className="c-accordion" key="2">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Line Manager Mapping</div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="mt-1">
                <LineManagerHandler
                  userDetails={userDetails}
                  checkWorkspacePermission={checkWorkspacePermission}                 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
   </CustomModal>
       
    <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    {/* ==================== STYLES ==================== */}
      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute; 
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #2097F1;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }
      `}</style> 
    </>
  );
};

export default EmployeeManage;
