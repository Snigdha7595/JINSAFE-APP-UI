"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import dayjs from "dayjs";
import { useFormik } from "formik";
import Image from "next/image";
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect } from "react";
import InputField from "@/components/Form/InputField";
import TextareaField from "@/components/Form/TextareaField";
import SelectField from "@/components/Form/SelectFields";
import CreatableSelectField from "@/components/Form/CreatableSelectField";
import AsyncCreatableSelect from "react-select/async-creatable";
import EmployeeEmailField from "@/components/Form/EmployeeEmailField";
import { useEmployeeEmailSearch } from "@/hooks/useEmployeeEmailSearch";
import debounce from "lodash.debounce";
import DatePickerField from "@/components/Form/DatePickerField";
import RadioField from "@/components/Form/RadioField";
import { useSelector } from "react-redux";
import { emptySelector } from "@/config/config";
import { selectUserToken } from "@/store/slices/authSlice";
import { serverRequest } from "@/services/getServerSideRender";
import { RootState } from "@/store/store";
import {
  FETCH_UNITS,
  FETCH_DEPARTMENTS,
  FETCH_DSO,
  FETCH_SAFETY_INCHARGE,
  FETCH_USER,
} from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";

const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

interface DepartmentInterface {
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab?: React.Dispatch<React.SetStateAction<number>>;
}

type FormValues = {
  id?: string;
  unitid: string;
  unitname?: string;
  departmentid?: string;
  departmentname: string;
  hod?: string;
  hodEmail?: string;
  jsplid?: string;
  jsplid_hod?: string;
  dsoEmail?: string;
  jsplid_dso?: string;
  empName?: string;
  deptUserAllEmail?: string;
  safetyInchargeEmail?: string;
  jsplid_si?: string;
  monthlyScheduleSi?: string;
  monthlyScheduleLw?: string;
  status?: string;
  updatedby?: string;
  rowIndex?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};
interface DepartmentDetailType {
  unitid: string;
  departmentid: string;
  departmentname: string;
  hod: string;
  rowIndex?: number;
  hodEmail?: string;
  jsplid?: string;
  monthlyScheduleSi?: string;
  monthlyScheduleLw?: string;
  weeklyScheduleSi?: string;
  weeklyScheduleLw?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  status?: string;
  monthlyScheduleCfsa?: string;
  deptUserAllEmail?: string;
}
// Interface for user data fetched for DSO candidates
interface UserDetailType {
  jsplid: string;
  empName: string;
  empEmail: string;
  unitid: string;
  departmentid: string;
  sectionid: string;
  empId: string;
}

interface DsoType {
  id: string;
  unitid?: string;
  departmentid?: string;
  departmentname?: string;
  dsoEmail?: string;
  jsplid?: string;
}

interface SafetyInchargeType {
  id: string;
  unitid: string;
  departmentid: string;
  departmentname: string;
  dsoEmail?: string;
  safetyInchargeEmail: string;
  jsplid?: string;
}
interface DepartmentMappingDetailType {
  department: DepartmentDetailType;
  dso: DsoType;
  safetyIncharge: SafetyInchargeType;
  }
interface UserResponse {
  jsplid: string;
  empEmail: string;
  empName: string;
}

interface OptionType {
  label: string;
  value: string;
  empName?: string;
  jsplid?: string;
}
const DepartmentPanel = ({
  currentStatus,
  setCurrentStatus,
}: DepartmentInterface) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [unitList, setUnitList] = useState([]);
  const [unitDetail, setUnitDetail] = useState("");
  const [unit, setUnit] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [departmentList, setDepartmentList] = useState([]);
  const [departmentMappingDetail, setDepartmentMappingDetail] =
    useState<DepartmentMappingDetailType | null>(null);
  const [candidateOptions, setCandidateOptions] = useState(emptySelector);
  const [candidateList, setCandidateList] = useState<UserDetailType[]>([]);
  const [selectedUserDetail, setSelectedUserDetail] =
    useState<UserDetailType | null>(null);
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
  const [buttonAction, setButtonAction] = useState<"DEPT_UPDATE" | "DSO_UPDATE" | "SI_UPDATE" | null>(null);
  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setUnitOptions(emptySelector);
      const response = await serverRequest(
        {},
        FETCH_UNITS + `/get-units/all`,
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
    setDepartmentOptions([]);
    setDepartmentList([]);
    try {
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${unitid}/all`,
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

  const filteredDepartments = departmentList.filter((dept: any) =>
    dept?.departmentname?.toLowerCase().includes(searchText.toLowerCase())
  );
  const getPaginatedDepartmentData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDepartments.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(departmentList.length / newSize));
    setCurrentPage(1); // Reset to first page when page size changes
  };

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
    return userRoles
      ?.filter((r) => r.userRole === targetRole)
      .map(({ unitId, departmentId }) => ({ unitId, departmentId }));
  };
  const checkWorkspacePermission = (
    unitId: string,
    departmentId: string,
    removableRole?: string
  ) => {
    let userRoles = user?.userRoles;
    // Get the top roles that need to find out.
    let role = getTopRole(userRoles);
    // Get the workspace list like UnitId, DepartmentId that need to find out.
    let workspaceAllowed = getUnitDeptByRole(userRoles, role);

    if (role == "Super Admin") {
      return true; // Always allowed
    } else if (role == "Site Admin") {
      if (removableRole === "Super Admin") return false;
      // Allowed if user's unitId exists in workspaceAllowed
      return workspaceAllowed.some((w) => String(w.unitId) === String(unitId));
    } else if (role == "Department Admin") {
      let notRemovableRoles = [
        "Super Admin",
        "Site Admin",
        "HOD Safety",
        "Unit Head",
      ];
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

  const topRole = getTopRole(user?.userRoles); // "Super Admin"

  const checkToOpenEditModal = async (
    payload: FormValues,
    unitId: string,
    departmentId: string
  ) => {
    if (checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
      setIsEditModalOpen(true);
      updateDepartment(payload);
    } else {
      toast.warning("You are not authorized to modify the department.");
    }
  };
  const checkToDSOEditModal = async (
    unitId: string,
    departmentId: string,
    departmentname: string,
    dsoEmail: string,
    jsplid: string
  ) => {
    if (checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
      setIsEditModalOpen(true);
      saveDSO(unitId, departmentId, departmentname, dsoEmail, jsplid);
    } else {
      toast.warning("You are not authorized to modify the DSO.");
    }
  };
  const checkToSIEditModal = async (
    unitId: string,
    departmentId: string,
    departmentname: string,
    safetyInchargeEmail: string,
    jsplid: string
  ) => {
    if (checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
      setIsEditModalOpen(true);
      saveSafetyIncharge(
        unitId,
        departmentId,
        departmentname,
        safetyInchargeEmail,
        jsplid
      );
    } else {
      toast.warning("You are not authorized to modify the Safety Incharge.");
    }
  };
  useEffect(() => {
    setTotalPages(Math.ceil(filteredDepartments.length / pageSize));
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, filteredDepartments.length, currentPage, totalPages]);

  const fetchDepartmentMapping = async (unitId: string, departmentId: string) => {
    setDepartmentMappingDetail(null);
    try {
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/${unitId}/${departmentId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        console.log("Dept.Mapping Details-", response);
        setDepartmentMappingDetail(response);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 
  // useEffect(() => {
  //   if (departmentDetail && unitOptions.length > 0) {
  //     const selectedUnit = unitOptions.find(
  //       (u) => String(u.value) === String(departmentDetail?.unitid)
  //     );
  //     setIsEditModalOpen(true);
  //   }
  // }, [departmentDetail, unitOptions]);

  const saveDepartment = async (payload: FormValues) => {
    try {
      const response = await serverRequest(
        payload,
        FETCH_DEPARTMENTS,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response) {
        toast.success("Department added successfully");
        setIsAddModalOpen(false);
        fetchDepartments(addformik.values.unitid);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateDepartment = async (payload: FormValues) => {
    if (!departmentMappingDetail?.department) return;
    const statusForPayload =
      payload.status === "active" ? "active" : "inactive";
    const ISO_NO_Z_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSS";
    const updatePayload = {
      ...departmentMappingDetail?.department,
      hod: payload.hod,
      hodEmail: payload.hodEmail,
      jsplid: payload.jsplid_hod,
      monthlyScheduleSi: payload.monthlyScheduleSi,
      monthlyScheduleLw: payload.monthlyScheduleLw,
      deptUserAllEmail: payload.deptUserAllEmail,
      status: statusForPayload,
      updatedBy: user?.createdBy,
    };
    try {
      const response = await serverRequest(
        updatePayload,
        FETCH_DEPARTMENTS + `/${departmentMappingDetail?.department?.departmentid}`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );
      if (response) {
        toast.success("Department updated successfully");
        // setIsEditModalOpen(false);
        fetchDepartments(addformik.values.unitid);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  const saveDSO = async (
    unitid: string,
    departmentid: string,
    departmentname: string,
    dsoEmail: string,
    jsplid: string
  ) => {
    let payload = {
      unitid: unitid,
      departmentid: departmentid,
      departmentname: departmentname,
      dsoEmail: dsoEmail,
      jsplid: jsplid,
      updatedBy: user?.createdBy,
    };
    try {
      const response = await serverRequest(
        payload,
        FETCH_DSO,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response) {
        toast.success("DSO successfully updated.");
        // setIsEditModalOpen(false);
        // setDSODetail(null);
        fetchDepartments(addformik.values.unitid);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 
  const saveSafetyIncharge = async (
    unitid: string,
    departmentid: string,
    departmentname: string,
    safetyInchargeEmail: string,
    jsplid: string
  ) => {
    let payload = {
      unitid: unitid,
      departmentid: departmentid,
      departmentname: departmentname,
      safetyInchargeEmail: safetyInchargeEmail,
      jsplid: jsplid,
      updatedBy: user?.createdBy,
    };
    try {
      const response = await serverRequest(
        payload,
        FETCH_SAFETY_INCHARGE,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response) {
        toast.success("Safety Incharge successfully updated.");
        // setIsEditModalOpen(false);
        // setIsEditSIModalOpen(false);
        // setSafetyInchargeDetail(null);
        fetchDepartments(addformik.values.unitid);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const getDepartmentValidationSchema = (
    mode: "add" | "edit",
    currentName?: string
  ) =>
    Yup.object({
      hod: Yup.string().required("HOD name is required"),
      hodEmail: Yup.string()
        .email("Invalid email format")
        .required("HOD Email is required"),
      departmentname: Yup.string()
        .required("Department name is required")
        .min(2, "Must be at least 2 characters")
        .test("unique", "Department name already exists", function (value) {
          if (!value) return true;
          const name = value.toLowerCase().trim();
          if (mode === "edit" && name === currentName?.toLowerCase().trim()) {
            return true;
          }
          return !departmentList.some(
            (d) => d.departmentname.toLowerCase().trim() === name
          );
        }),
      deptUserAllEmail: Yup.string().email("Invalid email format"),
    });
  // Add Department formik
  const addformik = useFormik<FormValues>({
    initialValues: {
      unitid: "",
      departmentname: "",
      hod: "",
      hodEmail: "",
      status: "active",
      updatedby: user?.createdBy || "Admin",
    },
    validationSchema: getDepartmentValidationSchema("add"),
    enableReinitialize: true,
    onSubmit: (values) => {
      saveDepartment(values);
      addformik.setFieldValue("departmentname", "");
      addformik.setFieldValue("hod", "");
      addformik.setFieldValue("hodEmail", "");
    },
  });

  // Edit Department formik
  const editformik = useFormik<FormValues>({
    initialValues: {
      unitid: departmentMappingDetail?.department?.unitid || "",
      departmentid: departmentMappingDetail?.department?.departmentid || "",
      departmentname: departmentMappingDetail?.department?.departmentname || "",
      hod: departmentMappingDetail?.department?.hod || "",
      hodEmail: departmentMappingDetail?.department?.hodEmail || "",
      jsplid: departmentMappingDetail?.department?.jsplid || "",
      monthlyScheduleSi: departmentMappingDetail?.department?.monthlyScheduleSi || "",
      monthlyScheduleLw: departmentMappingDetail?.department?.monthlyScheduleLw || "",
      deptUserAllEmail: departmentMappingDetail?.department?.deptUserAllEmail || "",
      status: departmentMappingDetail?.department?.status || "Active",
      dsoEmail: departmentMappingDetail?.dso?.dsoEmail || "",
      jsplid_dso: departmentMappingDetail?.dso?.jsplid || "",
      safetyInchargeEmail: departmentMappingDetail?.safetyIncharge?.safetyInchargeEmail || "",
      jsplid_si: departmentMappingDetail?.safetyIncharge?.jsplid || "",
      updatedby: user?.createdBy || "Admin",
    },
    // validationSchema: getDepartmentValidationSchema("edit", departmentDetail?.departmentname),
    enableReinitialize: true,
    validateOnChange: true, // ✅ validate while typing
    validateOnBlur: true, // ✅ validate on blur
    onSubmit: async (values) => {
      if (buttonAction === "DEPT_UPDATE") {
         await checkToOpenEditModal(
          values,
          departmentMappingDetail?.department?.unitid,
          departmentMappingDetail?.department?.departmentid
        );
      }
      if (buttonAction === "DSO_UPDATE") {
         await checkToDSOEditModal(
            departmentMappingDetail?.department?.unitid,
            departmentMappingDetail?.department?.departmentid,
            departmentMappingDetail?.department?.departmentname,
            values.dsoEmail,
            values.jsplid_dso
          );
      }
      if (buttonAction === "SI_UPDATE") {
         await checkToSIEditModal(
            departmentMappingDetail?.department?.unitid,
            departmentMappingDetail?.department?.departmentid,
            departmentMappingDetail?.department?.departmentname,
            values.safetyInchargeEmail,
            values.jsplid_si
          );
      }
    },
  });
  
  const fetchUserOptions = async (
    inputValue: string,
    token: string
  ): Promise<OptionType[]> => {
    if (!inputValue || inputValue.length < 3) return [];

    const searchPayload = {
      jsplId: null,
      empCode: null,
      empEmail: inputValue,
      unitId: null,
      departmentId: null,
      sectionId: null,
      empActiveStatus: "TRUE",
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

      if (Array.isArray(response?.users) && response.users.length > 0) {
        return response.users.map((user: UserResponse) => ({
          label: user.empEmail,
          value: user.empEmail,
          empName: user.empName,
          jsplid: user.jsplid,
        }));
      } else return [];
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Error fetching users");
      return [];
    }
  };

  return (
    <>
      <div className="container-fluid">
        {/* Block 1 */}
        <div className="adminFilters__list p-0">
          <div className="row form_grider d1">
            <div className="col-12 d-flex gap-2 justify-content-end align-items-center">
              <div className="w100 mb-3">Unit :</div>
              <div className="col-md-3">
                <SelectField
                  placeholder="Select Unit"
                  value={
                    addformik.values.unitid
                      ? unitOptions.find(
                          (u) =>
                            String(u.value) === String(addformik.values.unitid)
                        )
                      : null
                  }
                  name="unitid"
                  options={unitOptions}
                  onChange={(option: any) => {
                    if (option) {
                      addformik.setFieldValue("unitid", option.value);
                      fetchDepartments(option.value);
                    } else {
                      addformik.setFieldValue("unitid", "");
                      setDepartmentList([]);
                    }
                  }}
                />
              </div>
              <div className="w100 mb-3">Search by :</div>
              <div className="col-md-3">
                <InputField
                  type="text"
                  label=""
                  value={searchText}
                  name="search"
                  placeholder="Search Department..."
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={(e: any) => setSearchText(e.target.value)}
                />
              </div>
              <button
                className="iconBtn green w100 mb-3"
                type="button"
                onClick={() => {
                  if (topRole !== "Super Admin") {
                    toast.warning(
                      "You are not authorized to add new department!"
                    );
                    return;
                  }
                  if (addformik.values.unitid) {
                    setIsAddModalOpen(true);
                  } else {
                    toast.error("Please select Unit first!");
                  }
                }}
              >
                <span>Add Department</span>
                <img
                  width="20"
                  height="20"
                  alt="Button1"
                  src="/images/svg/icons/Add.svg"
                  className="white-icon"
                />
              </button>
            </div>
            <div className="col-12 d-flex justify-content-start align-items-center">
              <div className="w100 mb-0">
                Selected Unit :
                <b>
                  {
                    unitOptions.find(
                      (u) => String(u.value) === String(addformik.values.unitid)
                    )?.label
                  }
                </b>
              </div>
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
                        <th>Serial No</th>
                        <th>Department Name</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedDepartmentData() &&
                      getPaginatedDepartmentData().length > 0 ? (
                        getPaginatedDepartmentData().map(
                          (dept: any, index: number) => (
                            <tr key={dept?.departmentid}>
                              <td>
                                {(currentPage - 1) * pageSize + index + 1}
                              </td>
                              <td>{dept?.departmentname}</td>
                              <td>
                                {dept?.status && (
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
                                        dept?.status === "active"
                                          ? "/images/svg/icons/GreenCircle.svg"
                                          : "/images/svg/icons/RedCircle.svg"
                                      }
                                    />
                                  </div>
                                )}
                              </td>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "5px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <button
                                    className="tableBtn"
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      fetchDepartmentMapping(dept?.unitid, dept?.departmentid);
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
                                  {/* <button className="tableBtn" type="button"
                                  onClick={() => {setIsEditModalOpen(true);}}
                                  >
                                  <span>
                                    <img
                                      width={18}
                                      height={18}
                                      alt="icon"
                                      className="img-fluid u-image"
                                      src="/images/svg/icons/play.svg"
                                    />
                                  </span>
                                </button>  */}
                                </div>
                              </td>
                            </tr>
                          )
                        )
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
                        <option
                          key={size}
                          value={size}
                          className="recordsWrapper__item"
                        >
                          {size} Records
                        </option>
                      ))}
                    </select>
                    <span className="recordsWrapper__value">
                      {(currentPage - 1) * pageSize + 1}-
                      {Math.min(
                        currentPage * pageSize,
                        filteredDepartments.length
                      )}{" "}
                      of {filteredDepartments.length} records
                    </span>
                  </div>
                  <nav className="pagination_wrapper">
                    <ul className="pagination">
                      <li className="page-item">
                        <button
                          type="button"
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
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
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
                                type="button"
                                className={`page-link ${
                                  currentPage === pageNum ? "active" : ""
                                }`}
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        }
                      )}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <li className="page-item">
                          <button
                            type="button"
                            className={`page-link ${
                              currentPage === totalPages ? "active" : ""
                            }`}
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
        {/* Add Department */}
        <CustomModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          modalSizeClassName="modal-md"
          title="Add Department"
        >
          <form onSubmit={addformik.handleSubmit}>
            <div className="filters">
              <div className="row form_grider d1">
                <div className="col-md-2 py-2">
                  <label className="form-label mb-1">Unit:</label>
                </div>
                <div className="col-md-9">
                  <InputField
                    type="text"
                    name="unitid"
                    placeholder=""
                    value={
                      unitOptions.find(
                        (u) =>
                          String(u.value) === String(addformik.values.unitid)
                      )?.label || ""
                    }
                    onChange={addformik.handleChange}
                    onBlur={addformik.handleBlur}
                    disabled={true}
                  />
                </div>
                <div className="col-md-2 py-2">
                  <label className="form-label mb-1">Department:</label>
                </div>
                <div className="col-md-9">
                  <InputField
                    type="text"
                    name="departmentname"
                    placeholder="Department Name"
                    value={addformik.values.departmentname}
                    errors={addformik.errors.departmentname}
                    touched={addformik.touched.departmentname}
                    onBlur={addformik.handleBlur}
                    onChange={addformik.handleChange}
                  />
                </div>
              </div>
              <div className="row form_grider d1">
                <div className="col-md-2 py-2">
                  <label className="form-label mb-1">HOD Name:</label>
                </div>
                <div className="col-md-9">
                  <InputField
                    type="text"
                    name="hod"
                    placeholder="HOD Name"
                    value={addformik.values.hod}
                    errors={addformik.errors.hod}
                    touched={addformik.touched.hod}
                    onBlur={addformik.handleBlur}
                    onChange={addformik.handleChange}
                  />
                </div>
                <div className="col-md-2 py-2">
                  <label className="form-label mb-1">HOD Email:</label>
                </div>
                <div className="col-md-9">
                  <InputField
                    type="text"
                    name="hodEmail"
                    placeholder="HOD Email"
                    value={addformik.values.hodEmail}
                    errors={addformik.errors.hodEmail}
                    touched={addformik.touched.hodEmail}
                    onBlur={addformik.handleBlur}
                    onChange={addformik.handleChange}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  className="iconBtn bg-danger d-flex align-items-center gap-2 px-3 py-2"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <img
                    width="18"
                    height="18"
                    alt="Cancel"
                    src="/images/svg/icons/Cancle.svg"
                    className="white-icon"
                  />
                  Cancel
                </button>
                <button
                  className="iconBtn bg-success d-flex align-items-center gap-2 px-3 py-2"
                  type="submit"
                >
                  <img
                    width="18"
                    height="18"
                    alt="Add"
                    src="/images/svg/icons/Add.svg"
                    className="white-icon"
                  />
                  Add
                </button>
              </div>
            </div>
          </form>
        </CustomModal>
        {/* Edit Department */}
        <CustomModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          modalSizeClassName="modal-xl"
          title="Edit Department & DSO/Safety Incharge Mapping"
        >
          <form onSubmit={editformik.handleSubmit}>
            <div
              className="filters px-3 py-2"
              style={{ minWidth: "800px", margin: "0 auto" }}
            >
				 <div className="row form_grider d1">
					<div className="col-md-6">
						<label className="form-label mb-1">Unit:</label>
						<InputField
							type="text"
							name="unitid"
							placeholder=""
							value={
							unitOptions.find(
								(u) =>
								String(u.value) === String(editformik.values.unitid)
							)?.label || ""
							}
							disabled={true}
							onChange={editformik.handleChange}
							onBlur={editformik.handleBlur}
						/>
					</div>
					<div className="col-md-6">
						<label className="form-label mb-1">Department:</label>
						<InputField
							type="text"
							name="departmentname"
							placeholder="Department Name"
							value={editformik.values.departmentname}
							onBlur={editformik.handleBlur}
							onChange={editformik.handleChange} // important for validation
							errors={editformik.errors.departmentname}
							touched={editformik.touched.departmentname}
							disabled={true}
						/>
					</div>
				</div>
				<div className="row form_grider d1">
					<div className="col-md-6">
						<div className="px-2 py-2" style={{"border": "1px solid #050505ff"}}>
							<label className="form-label mb-0">HOD Email:</label>
							<EmployeeEmailField
								token={token}
								value={editformik.values.hodEmail || ""}
								onChange={(email, val) => {
								editformik.setFieldValue("hodEmail", email);
								editformik.setFieldValue("hod", val?.empName || "");
								editformik.setFieldValue("jsplid_hod", val?.jsplid || "");
								}}
							/>
							{/* <div style={{ display: "none" }}>
								<label className="form-label b-1">HOD Name:</label>
								<InputField
									type="text"
									name="hod"
									placeholder="HOD Name"
									disabled={true}
									value={editformik.values.hod}
									onChange={(e) => editformik.setFieldValue("hod", e.target.value)}
									onBlur={() => {}}
									errors={""}
									touched={""}
								/>
								<InputField
									type="text"
									name="jsplid"
									placeholder=""
									disabled={true}
									value={editformik.values.jsplid}
									onChange={(e) => editformik.setFieldValue("jsplid", e.target.value)}
									onBlur={() => {}}
									errors={""}
									touched={""}							
									/>
							</div> */}
							<label className="form-label">Group Mailid:</label>
							<InputField
								type="email"
								name="deptUserAllEmail"
								placeholder="example@domain.com"
								value={editformik.values.deptUserAllEmail || ""}
								errors={editformik.errors.deptUserAllEmail}
								touched={editformik.touched.deptUserAllEmail}
								onBlur={editformik.handleBlur}
								onChange={editformik.handleChange}
								maxLength={50}
							/>
              <div className="d-flex justify-content-end gap-3 mt-3">                
              <label className="form-label">Monthly Schedule SI:</label>
							<InputField
								type="number"
								name="monthlyScheduleSi"
								placeholder="0"
								value={editformik.values.monthlyScheduleSi || ""}
								errors={editformik.errors.monthlyScheduleSi}
								touched={editformik.touched.monthlyScheduleSi}
								onBlur={editformik.handleBlur}
								onChange={editformik.handleChange}
							/>
              <label className="form-label">Monthly Schedule LW:</label>
							<InputField
								type="number"
								name="monthlyScheduleLw"
								placeholder="0"
								value={editformik.values.monthlyScheduleLw || ""}
								errors={editformik.errors.monthlyScheduleLw}
								touched={editformik.touched.monthlyScheduleLw}
								onBlur={editformik.handleBlur}
								onChange={editformik.handleChange}
							/>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-1">  
              <div className="d-flex flex-column me-3">
							<label className="form-label mb-0">Status:</label>
							<SelectField
								value={statusOptions.find(
								(opt) =>
									opt.value.toLowerCase() ===
									editformik.values.status.toLowerCase()
								)}
								name="status"
								placeholder="Select Status"
								options={statusOptions}
								onChange={(option) =>
								editformik.setFieldValue("status", option?.value)
								}
								onBlur={editformik.handleBlur}
								errors={editformik.errors.status}
								touched={editformik.touched.status}
							/>
              </div>
              <div className="d-flex gap-3">
              <button
									className="iconBtn bg-danger"
									type="button"
									onClick={() => setIsEditModalOpen(false)}
									>
									<img
										width="18"
										height="18"
										alt="Cancel"
										src="/images/svg/icons/Cancle.svg"
										className="white-icon"
									/>
									Cancel
								</button>
								<button
									className="iconBtn bg-success"
									type="submit" onClick={() => setButtonAction("DEPT_UPDATE")}>
									<img
										width="18"
										height="18"
										alt="Add"
										src="/images/svg/icons/Save.svg"
										className="white-icon"
									/>
									Update
								</button>
               </div>
              </div>
						</div>
					</div>
					<div className="col-md-6">
						<div className="my-1 px-2 py-2" style={{"border": "1px solid #050505ff"}}>
							<label className="form-label mb-0">DSO Email:</label>
							<EmployeeEmailField
								token={token}
								value={editformik.values.dsoEmail || ""}
								onChange={(email, val) => {
								editformik.setFieldValue("dsoEmail", email);
								editformik.setFieldValue("empName",val?.empName || "");
								editformik.setFieldValue("jsplid_dso", val?.jsplid || "");
								}}
							/>
							<div style={{ display: "none" }}>
								<label className="form-label mb-1">DSO Name:</label>
								<InputField
									type="text"
									name="empName"
									placeholder=""
									disabled={true}
									value={editformik.values.empName}
									onChange={(e) =>
									editformik.setFieldValue("empName", e.target.value)
									}
									onBlur={() => {}}
									errors={""}
									touched={""}
								/>
								<label className="form-label mb-1">DSO Jspl Id:</label>
								<InputField
									type="text"
									name="jsplid"
									placeholder=""
									disabled={true}
									value={editformik.values.jsplid}
									onChange={(e) =>
									editformik.setFieldValue("jsplid", e.target.value)
									}
									onBlur={() => {}}
									errors={""}
									touched={""}
								/>
							</div>
							<div className="d-flex justify-content-end gap-3 mt-3">
								<button
									className="iconBtn bg-success d-flex align-items-center gap-2 px-3 py-2"
									type="submit" onClick={() => setButtonAction("DSO_UPDATE")}>
									<img
										width="18"
										height="18"
										alt="Cancel"
										src="/images/svg/icons/Save.svg"
										className="white-icon"
									/>
									DSO Update
								</button>
							</div>
						</div>						
						<div className="px-2 py-2 mt-3" style={{"border": "1px solid #050505ff"}}>
							<label className="form-label mb-0">Safety Incharge Email:</label>
							<EmployeeEmailField
								token={token}
								value={editformik.values.safetyInchargeEmail || ""}
								onChange={(email, val) => {
								editformik.setFieldValue("safetyInchargeEmail", email);
								editformik.setFieldValue("empName", val?.empName || "");
								editformik.setFieldValue("jsplid_si", val?.jsplid || "");
								}}
							/>
							<div style={{ display: "none" }}>
								<label className="form-label">Safety Incharge Name:</label>
								<InputField
									type="text"
									name="empName"
									placeholder=""
									disabled={true}
									value={editformik.values.empName}
									onChange={(e) =>
									editformik.setFieldValue("empName", e.target.value)
									}
									onBlur={() => {}}
									errors={""}
									touched={""}
								/>
								<label className="form-label mb-1">Safety Incharge Jspl Id:</label>
								<InputField
									type="text"
									name="jsplid"
									placeholder=""
									disabled={true}
									value={editformik.values.jsplid}
									onChange={(e) =>
									editformik.setFieldValue("jsplid", e.target.value)
									}
									onBlur={() => {}}
									errors={""}
									touched={""}
								/>
							</div>
							<div className="d-flex justify-content-end gap-3 mt-3">
								<button
									className="iconBtn bg-success d-flex align-items-center gap-2 px-3 py-2"
									type="submit" onClick={() => setButtonAction("SI_UPDATE")}>
									<img
										width="18"
										height="18"
										alt="Add"
										src="/images/svg/icons/Save.svg"
										className="white-icon"
									/>
									Safety Incharge Update
								</button>
							</div>
						</div>
					</div>
				 </div>
				<div className="d-flex justify-content-center gap-3 mt-3">
			 </div>
      </div>
    </form>
        </CustomModal>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
      </div>
    </>
  );
};

export default DepartmentPanel;
