"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import dayjs from "dayjs";
import { useFormik } from "formik";
import Image from "next/image"
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect } from "react";
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
import { FETCH_UNITS, FETCH_DEPARTMENTS, FETCH_SECTIONS } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";

const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

interface SectionInterface {
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab? : React.Dispatch<React.SetStateAction<number>>;
}

type FormValues = {
  id?: string;
  unitid: string;
  unitname?: string;
  departmentid: string;
  departmentname?: string;
  sectionid?: string;
  sectionname: string;
  status?: string;
 };

interface DepartmentDetailType {
  unitid: string;              // Matches API response
  departmentid: string;
  departmentname: string;
  hod: string;
  hodEmail?: string;
  status?: string;
}
interface SectionDetailType {
  unitid: string;
  departmentid: string;
  sectionid: string;
  id: string;
  rowIndex?: number;
  sectionname?: string;
  status?: string;
}

const SectionPanel = ({
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
  const [departmentDetail, setDepartmentDetail] = useState<DepartmentDetailType | null>(null);
  const [sectionList, setSectionList] = useState([]);
  const [sectionDetail, setSectionDetail] = useState<SectionDetailType | null>(null);
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

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setUnitOptions(emptySelector);
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

 const filteredSections = sectionList.filter((sec: any) =>
  sec?.sectionname?.toLowerCase().includes(searchText.toLowerCase())
  );
 const getPaginatedSectionData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSections.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(sectionList.length / newSize));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  useEffect(() => {
    setTotalPages(Math.ceil(filteredSections.length / pageSize));
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, filteredSections.length, currentPage, totalPages]);

  const fetchSections = async (deptId: string) => {
    setSectionList([]);
    try {
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/get-sections/${deptId}/all`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        setSectionList(response);
       } else {
        setSectionList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  const fetchSection = async (id: string) => {
    setSectionDetail(null);
    try {
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/${id}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        setSectionDetail(response);
        setIsEditModalOpen(true);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
  if (departmentDetail && unitOptions.length > 0) {
    const selectedUnit = unitOptions.find(
      (u) => String(u.value) === String(departmentDetail?.unitid)
    );
    setIsEditModalOpen(true);
  }
 }, [departmentDetail, unitOptions]);

  useEffect(() => {
  if (sectionDetail && unitOptions.length > 0) {
    const selectedUnit = unitOptions.find(
      (u) => String(u.value) === String(sectionDetail?.unitid)
    );
    const selectedDepartment = departmentOptions.find(
      (d) => String(d.value) === String(sectionDetail?.departmentid)
    );
    setIsEditModalOpen(true);
  }
 }, [sectionDetail, unitOptions, departmentOptions]);
 
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
       saveSection(payload);
    } else {
      toast.warning("You are not authorized to add the Section.");
    }
  };
  const checkToOpenEditModal = async(payload: FormValues, unitId: string, departmentId: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
       setIsEditModalOpen(true);
       updateSection(payload);
    } else {
      toast.warning("You are not authorized to modify the Section.");
    }
  };
  const saveSection = async (payload: FormValues) => {
    try {
      const response = await serverRequest(
        payload,
        FETCH_SECTIONS,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response) {
        toast.success("Section added successfully");
        setIsAddModalOpen(false);
        fetchSections(addformik.values.departmentid);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 
  const updateSection = async (payload: FormValues) => {
    if (!sectionDetail) return;
    const statusForPayload = payload.status === "active" ? "active" : "inactive";
    const updatePayload = {
    ...sectionDetail,
      sectionname: payload.sectionname,
      status: statusForPayload
    };
   
    try {
      const response = await serverRequest(
        updatePayload,
        FETCH_SECTIONS + `/${sectionDetail?.id}`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );
      if (response?.success === true) {
        toast.success("Section updated successfully");
        setIsEditModalOpen(false);
        fetchSections(addformik.values.departmentid);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
const getSectionValidationSchema = (mode: "add" | "edit", currentName?: string) =>
  Yup.object({
    sectionname: Yup.string()
      .required("Section name is required")
      .min(2, "Must be at least 2 characters")
      .test("unique", "Section name already exists", function (value) {
        if (!value) return true;
        const name = value.toLowerCase().trim();
        if (mode === "edit" && name === currentName?.toLowerCase().trim()) {
          return true; 
        }
        return !sectionList.some((d) => d.sectionname.toLowerCase().trim() === name);
      }),
  });
 // Add Section formik
const addformik = useFormik<FormValues>({
  initialValues: {
    unitid: "",
    departmentid: "",
    sectionid: null,
    sectionname: "",
    status: "active"
  },
  validationSchema: getSectionValidationSchema("add"),
  enableReinitialize: true,
  onSubmit: (values) => {
    // saveSection(values);
    checkToOpenSaveModal(values, values.unitid, values.departmentid);
    addformik.setFieldValue("sectionname", "");
  },
});

// Edit Section formik
  const editformik = useFormik<FormValues>({
    initialValues: {
      unitid: sectionDetail?.unitid || "",
      departmentid: sectionDetail?.departmentid || "",
      id: sectionDetail?.id || "",
      sectionname: sectionDetail?.sectionname || "",
      status: sectionDetail?.status || "active"
    },
    validationSchema: getSectionValidationSchema("edit", sectionDetail?.sectionname),
    enableReinitialize: true,
    validateOnChange: true, // ✅ validate while typing
    validateOnBlur: true,   // ✅ validate on blur
    onSubmit: async (values) => {
      if (!sectionDetail) return;
      try {
        // await updateSection(values);
        await checkToOpenEditModal(values, sectionDetail?.unitid, sectionDetail?.departmentid);
      } catch (err) {
        console.error("Update failed", err);
      }
    },
  });
 
  return (
    <>
     <div className="container-fluid">
        {/* Block 1 */}
      <div className="adminFilters__list p-0">
          <div className="row form_grider d1">
            <div className="col-12 d-flex gap-2 justify-content-end align-items-center">
             {/* <div className="w100 mb-3">Unit :</div> */}
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
                        fetchDepartments(option.value);
                      } else {
                        addformik.setFieldValue("unitid", "");
                        setDepartmentList([]);
                      }
                    }}
                  />
               </div>
               {/* <div className="w100 mb-3">Department :</div> */}
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
                        fetchSections(option.value);
                      } else {
                        addformik.setFieldValue("departmentid", "");
                        setSectionList([]);
                      }
                    }}
                  />
              </div>
              {/* <div className="w100 mb-3">Search by :</div> */}
              <div className="col-md-3">
              <InputField
                type="text"
                label="Search by"
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
                className="iconBtn green w100 mb-6" type="button"
                onClick={() => {
                   if (!addformik.values.unitid) {
                        toast.error("Please select Unit!");
                      } else if (!addformik.values.departmentid) {
                        toast.error("Please select Department!");
                      } else {
                        setIsAddModalOpen(true);
                      }
                  }}
                >
                <span>Add Section</span>
                <img
                  width="20"
                  height="20"
                  alt="Button1"
                  src="/images/svg/icons/Add.svg"
                  className="white-icon"
                />
              </button>
            </div>
             <div className="col-12 d-flex justify-content-start align-items-center gap-5">
             <div className="w100 mb-0">Selected Unit :<b>{unitOptions.find((u) => String(u.value) === String(addformik.values.unitid))?.label}</b></div>
              <div className="w100 mb-0">Selected Department :<b>{departmentOptions.find((u) => String(u.value) === String(addformik.values.departmentid))?.label}</b></div>
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
                        <th>Unit</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(getPaginatedSectionData() && getPaginatedSectionData().length > 0) ? (
                        getPaginatedSectionData().map((sec: any, index: number) => (
                          <tr key={sec?.sectionid}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>
                              {unitOptions.find((u) => String(u.value) === String(sec?.unitid))?.label}
                            </td>
                            <td>
                              {departmentOptions.find((u) => String(u.value) === String(sec?.departmentid))?.label}
                            </td>
                            <td>{sec?.sectionname}</td>
                            <td>
                            {sec?.status && (
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
                                  sec?.status === "active"
                                    ? "/images/svg/icons/GreenCircle.svg"
                                    : "/images/svg/icons/RedCircle.svg"
                                }
                              />
                            </div>
                          )}
                              </td>
                            <td>
                              <div style={{ display: "flex", gap: "5px", alignItems: "center" , justifyContent: "center"}}>
                                <button className="tableBtn" type="button"
                                  onClick={(e) => {
                                  e.preventDefault();
                                  fetchSection(sec?.id);}}
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
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredSections.length)} of {filteredSections.length} records
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
        onClose={()=>setIsAddModalOpen(false)}
        modalSizeClassName="modal-md"
        title="Add Section"
      >
      <form onSubmit={addformik.handleSubmit}>
        <div className="filters px-3 py-2" style={{ maxWidth: "750px", margin: "0 auto" }}>
        <div className="row form_grider d1">
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Unit:</label>
          </div>
          <div className="col-md-9">
             <InputField
                type="text"
                name="unitname"
                placeholder=""
                value={unitOptions.find((u) => String(u.value) === String(addformik.values.unitid))
                       ?.label || "" }
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
                placeholder=""
                value={departmentOptions.find((u) => String(u.value) === String(addformik.values.departmentid))
                       ?.label || "" }
                onChange={addformik.handleChange}
                onBlur={addformik.handleBlur}
                disabled={true}
              />
          </div>
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Section:</label>
          </div>
          <div className="col-md-9">
            <InputField
              type="text"
              name="sectionname"
              placeholder="Section Name"
              value={addformik.values.sectionname}
              errors={addformik.errors.sectionname}
              touched={addformik.touched.sectionname}
              onBlur={addformik.handleBlur}
              onChange={addformik.handleChange}
            />
          </div>
        </div>
        <div className="d-flex justify-content-center gap-3 mt-3">
          <button className="iconBtn bg-danger d-flex align-items-center gap-2 px-3 py-2"
           type="button" onClick={() => setIsAddModalOpen(false)}>
            <img
              width="18"
              height="18"
              alt="Cancel"
              src="/images/svg/icons/Cancle.svg"
              className="white-icon"
            />
            Cancel
          </button>
          <button className="iconBtn bg-success d-flex align-items-center gap-2 px-3 py-2"
            type="submit">
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
      {/* Edit Section */}
       <CustomModal
        isOpen={isEditModalOpen}
        onClose={()=>setIsEditModalOpen(false)}
        modalSizeClassName="modal-md"
        title="Edit Section"
      >
      <form onSubmit={editformik.handleSubmit}>
        <div className="filters px-3 py-2" style={{ maxWidth: "750px", margin: "0 auto" }}>
        <div className="row form_grider d1">
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Unit:</label>
          </div>
          <div className="col-md-9">
              <InputField
                type="text"
                name="unitname"
                placeholder=""
                value={ unitOptions.find((u) => String(u.value) === String(editformik.values.unitid))
                        ?.label || "" }
                disabled={true}
                onChange={editformik.handleChange}
                onBlur={editformik.handleBlur}
              />
          </div>
           <div className="col-md-2 py-2">
            <label className="form-label mb-1">Department:</label>
          </div>
          <div className="col-md-9">
             <InputField
                type="text"
                name="departmentname"
                placeholder=""
                value={departmentOptions.find((u) => String(u.value) === String(editformik.values.departmentid))
                       ?.label || "" }
                onChange={editformik.handleChange}
                onBlur={editformik.handleBlur}
                disabled={true}
              />
          </div>
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Section:</label>
          </div>
          <div className="col-md-9">
            <InputField
              type="text"
              name="sectionname"
              placeholder="Section Name"
              value={editformik.values.sectionname}
              errors={editformik.errors.sectionname}
              touched={editformik.touched.sectionname}
              onBlur={editformik.handleBlur}
              onChange={editformik.handleChange}
            />
          </div>
        </div>
         <div className="row form_grider d1">
           <div className="col-md-2 py-2">
            <label className="form-label mb-1">Status:</label>
          </div>
          <div className="col-md-9">
            <SelectField
              value={statusOptions.find(opt => opt.value.toLowerCase() === editformik.values.status.toLowerCase())}
              name="status"
              placeholder="Status"
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
              width="18"
              height="18"
              alt="Cancel"
              src="/images/svg/icons/Cancle.svg"
              className="white-icon"
            />
            Cancel
          </button>
          <button className="iconBtn bg-success d-flex align-items-center gap-2 px-3 py-2"
            type="submit">
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
      </form>
      </CustomModal>
     <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  </>
  );
};

export default SectionPanel;
