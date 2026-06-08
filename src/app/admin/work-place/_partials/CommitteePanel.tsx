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
import DatePickerField from "@/components/Form/DatePickerField";
import EmployeeEmailField from "@/components/Form/EmployeeEmailField";
import RadioField from "@/components/Form/RadioField";
import { useSelector } from "react-redux";
import { emptySelector } from "@/config/config";
import { selectUserToken } from "@/store/slices/authSlice";
import { serverRequest } from "@/services/getServerSideRender";
import { RootState } from "@/store/store";
import { FETCH_UNITS, FETCH_COMMITTEES } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";

const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

interface CommitteeInterface {
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab? : React.Dispatch<React.SetStateAction<number>>;
}

type FormValues = {
  committeId?: number;
  committeName: string;
  unitid: string;
  validUpto: string;
  createdby?: string;
  createdat?: string;
  updatedby?: string;
  updatedat?: string;
  rowIndex?: number;
  status: string;
 };
interface CommitteeDetailType {
  committeId: number;
  committeName: string;
  unitid: string;  
  validUpto: string;
  createdat: string;
  updatedat: string;
  rowIndex: number;
  status: string;
}
const CommitteePanel = ({
  currentStatus,
  setCurrentStatus,
  }: CommitteeInterface) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [committeeList, setCommitteeList] = useState([]);
  const [committeeMemberList, setCommitteeMemberList] = useState([]);
  const [committeeDetail, setCommitteeDetail] = useState<CommitteeDetailType | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [committeeId, setCommitteeId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isUserMapEditOpen, setIsUserMapEditOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const statusOptions = [
  { value: "active", label: "active" },
  { value: "inactive", label: "inactive" },
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
       } else {
        setUnitOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
  const fetchCommitteeMembers = async (id: number) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_COMMITTEES + `/get-committee-members/${id}/all`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        setCommitteeMemberList(response);
        setIsUserMapEditOpen(true);
       } else {
        setCommitteeMemberList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
    return userRoles?.filter((r) => r.userRole === targetRole)
                      .map(({ unitId, departmentId }) => ({ unitId, departmentId }));
  };
  const checkWorkspacePermission = (unitId: string, departmentId?: string, removableRole?: string) => {
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

 const topRole = getTopRole(user?.userRoles); // "Super Admin"

 const checkToOpenSaveModal = async(payload: FormValues, unitId: string, departmentId?: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
       setIsAddModalOpen(true);
       saveCommittee(payload);
    } else {
      toast.warning("You are not authorized to add the Committee.");
    }
  };
  const checkToOpenEditModal = async(payload: FormValues, unitId: string, departmentId?: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
       setIsEditModalOpen(true);
       updateCommittee(payload);
    } else {
      toast.warning("You are not authorized to modify the Committee.");
    }
  };
  const checkToAddUserMapModal = async(unitId: string, departmentId: string, committeId: number, userId: string, validTill: string) => {
   if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
       saveCommitteeMember(committeId, userId, validTill);       
    } else {
      toast.warning("You are not authorized to modify the Committee.");
    }
  };
  const checkToInactiveCommitteeMember = async(unitId: string, departmentId: string, id: number, committeId: number) => {
   if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
       inactiveCommitteeMember(id, committeId);       
    } else {
      toast.warning("You are not authorized to modify the Committee.");
    }
  };
 const filteredCommittees = committeeList.filter((val: any) =>
  val?.committeName?.toLowerCase().includes(searchText.toLowerCase())
  );
 const getPaginatedCommitteeData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCommittees.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(committeeList.length / newSize));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  useEffect(() => {
    setTotalPages(Math.ceil(filteredCommittees.length / pageSize));
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, filteredCommittees.length, currentPage, totalPages]);

  const fetchCommittee = async (id: string) => {
    setCommitteeDetail(null);
    try {
        if (unitOptions.length === 0) {
        await fetchUnits();
        }
      const response = await serverRequest(
        {},
        FETCH_COMMITTEES + `/get-committee/${id}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        setCommitteeDetail(response);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // useEffect(() => {
  //   if (committeeDetail && unitOptions.length > 0) {
  //     const selectedUnit = unitOptions.find(
  //       (u) => String(u.value) === String(committeeDetail?.unitid)
  //     );
  //     setIsEditModalOpen(true);
  //   }
  // }, [committeeDetail, unitOptions]);

 const saveCommittee = async (payload: FormValues) => {
    try {
      const response = await serverRequest(
        payload,
        FETCH_COMMITTEES,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response) {
        toast.success("Committee added successfully");
        setIsAddModalOpen(false);
        fetchCommittees(addformik.values.unitid);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateCommittee = async (payload: FormValues) => {
    if (!committeeDetail) return;
    const statusForPayload = payload.status === "active" ? "active" : "inactive";
    const updatePayload = {
    ...committeeDetail,
      committeName: payload.committeName,
      validUpto: payload.validUpto,
      status: statusForPayload
    };
    try {
      const response = await serverRequest(
        payload,
        FETCH_COMMITTEES + `/${committeeDetail?.committeId}`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );
      if (response?.success === true) {
        if(response?.message != null)
        {
          toast.success(response?.message);
        }
        else
        {
          toast.success("Committee successfully updated.");
        }
        setIsEditModalOpen(false);
        fetchCommittees(addformik.values.unitid);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const saveCommitteeMember = async (committeId: number, userId: string, validtill: string) => {
   
     let payload = {
      committeId: committeId,
      userId: userId,
      validtill: validtill,
      createdat: dayjs().toISOString(), //dayjs().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      updatedat: dayjs().toISOString(),
      status: "active",
      createdby: user?.createdBy,
      updatedby: user?.createdBy
    };
    try {
      const response = await serverRequest(
        payload,
        FETCH_COMMITTEES + `/add-committee-member`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response) {
        toast.success("Committee member added successfully");
        fetchCommitteeMembers(committeId);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // Inactive Committee Member
  const inactiveCommitteeMember = async (id: number, committeId: number) => {   
    const payload = {
      id: id,
      status: "inactive",
      updatedby: user?.createdBy
    }; 
    try {
      const response = await serverRequest(
        payload,
        FETCH_COMMITTEES + `/update-member-status/${id}`,
        CONSTANTS.REQUEST_PATCH,
        true,
        true,
        token
      );
      if (response?.success) { 
        toast.success(response?.message);
        fetchCommitteeMembers(committeId);
      } else {
        toast.error(response?.message || "Failed to update Line Manager.");
      }
    } catch (error) {
      console.error("Error updating Line Manager:", error);
      toast.error("An error occurred during update.");
    }
  };
  const getCommitteeValidationSchema = (mode: "add" | "edit", currentName?: string) =>
  Yup.object({
    committeName: Yup.string()
      .required("Committe name is required")
      .min(2, "Must be at least 2 characters")
      .test("unique", "Committe name already exists", function (value) {
        if (!value) return true;
        const name = value.toLowerCase().trim();
        if (mode === "edit" && name === currentName?.toLowerCase().trim()) {
          return true; 
        }
        return !committeeList.some((z) => z.committeName.toLowerCase().trim() === name);
      }),
    validUpto: Yup.date().required("Valid upto is required"),
  });
  // Add Committee formik
  const addformik = useFormik<FormValues>({
    initialValues: {
    committeName: "",
    unitid: "",
    validUpto: dayjs().format("YYYY-MM-DD"),
    createdby: user?.createdBy,
    // createdat: dayjs().format("YYYY-MM-DD"),
    updatedby: user?.createdBy,
    // updatedat: dayjs().format("YYYY-MM-DD"),
    status: "active"
    },
    validationSchema: getCommitteeValidationSchema("add"),
    enableReinitialize: true,
    onSubmit: (values) => {
      checkToOpenSaveModal(values, values.unitid);
      // saveCommittee(values);
      addformik.setFieldValue("committeName", "");
      addformik.setFieldValue("unitid", "");
      addformik.setFieldValue("validUpto", dayjs().format("YYYY-MM-DD"));
    },
    });
     // Edit Committee formik
    const editformik = useFormik<FormValues>({
    initialValues: {
      committeId: committeeDetail?.committeId || 0,
      committeName: committeeDetail?.committeName || "",
      unitid: committeeDetail?.unitid || "",
      rowIndex: committeeDetail?.rowIndex || 0,
      status: committeeDetail?.status || "active",
      validUpto: committeeDetail?.validUpto || null,
      updatedby: user?.createdBy,
    },
    validationSchema: getCommitteeValidationSchema("edit", committeeDetail?.committeName),
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (!committeeDetail) return;
      try {
        await checkToOpenEditModal(values, values.unitid, "");
        // await updateCommittee(values);
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
             <div className="w100 mb-3">Unit :</div>
             <div className="col-md-3">
                <SelectField
                    value={
                      addformik.values.unitid
                        ? unitOptions.find((u) => String(u.value) === String(addformik.values.unitid))
                        : null
                    }
                    name="unitid"
                    placeholder="Select Unit"
                    options={unitOptions}
                    onChange={(option: any) => {
                      if (option) {
                        addformik.setFieldValue("unitid", option.value);
                        fetchCommittees(option.value);
                      } else {
                        addformik.setFieldValue("unitid", "");
                        setCommitteeList([]);
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
                placeholder="Search Committee..."
                errors={""}
                touched={""}
                onBlur={() => {}}
                onChange={(e: any) => setSearchText(e.target.value)}
              />
              </div>
              <button
                className="iconBtn green w100 mb-3" type="button"
                onClick={() => {
                    if (topRole !== "Super Admin" && topRole !== "Site Admin") {
                      toast.warning("You are not authorized to add new committee!");
                      return; 
                    } 
                    if (addformik.values.unitid) {
                      setIsAddModalOpen(true);
                    } else {
                      toast.error("Please select Unit first!");
                    }
                  }}
              >
                <span>Add Committee</span>
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
             <div className="w100 mb-0">Selected Unit :<b>{unitOptions.find((u) => String(u.value) === String(addformik.values.unitid))?.label}</b></div>
             </div>
          </div>
        </div>
        {/* Block 2 */}
       
        <div className="pb-4">
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Serial No</th>
                        <th>Committe Name</th>
                        <th>Valid Upto</th>
                        <th>Updated On</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(getPaginatedCommitteeData() && getPaginatedCommitteeData().length > 0) ? (
                        getPaginatedCommitteeData().map((comm: any, index: number) => (
                          <tr key={comm?.committeId}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{comm?.committeName}</td>
                            <td>{comm?.validUpto}</td>
                            <td>{dayjs(comm?.updatedat).format("DD-MM-YYYY")}</td>
                            <td>
                            {comm?.status && (
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
                                  comm?.status === "active"
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
                                  onClick={() => {fetchCommittee(comm?.committeId);setIsEditModalOpen(true);}}
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
                                 <button className="tableBtn" type="button"
                                  onClick={() => {
                                    setUserId("");
                                    setEmail(""); 
                                    fetchCommittee(comm?.committeId);
                                    setIsUserMapEditOpen(true);
                                    fetchCommitteeMembers(comm?.committeId);}}
                                  >
                                  <span>
                                    <img
                                      width="15"
                                      height="15"
                                      alt="icon"
                                      style={{
                                      filter:
                                          "invert(32%) sepia(83%) saturate(3000%) hue-rotate(200deg) brightness(95%) contrast(95%)",
                                      }}
                                      src="/images/svg/icons/Organization.svg"
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
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredCommittees.length)} of {filteredCommittees.length} records
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
                        <button type="button"
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
    {/* Add Committee */}
     <CustomModal
        isOpen={isAddModalOpen}
        onClose={()=>setIsAddModalOpen(false)}
        modalSizeClassName="modal-lg"
        title="Add Committee"
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
                value={unitOptions.find((u) => String(u.value) === String(addformik.values.unitid))
                       ?.label || "" }
                onChange={addformik.handleChange}
                onBlur={addformik.handleBlur}
                disabled={true}
              />
          </div>
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Committee:</label>
          </div>
          <div className="col-md-9">
            <InputField
              type="text"
              name="committeName"
              placeholder="Committee Name"
              value={addformik.values.committeName}
              errors={addformik.errors.committeName}
              touched={addformik.touched.committeName}
              onBlur={addformik.handleBlur}
              onChange={addformik.handleChange}
            />
          </div>
        </div>
         <div className="row form_grider d1">
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Valid Upto:</label>
          </div>
          <div className="col-md-9">
            <DatePickerField
              name="validUpto"
              placeholder="Choose Date"
              value={addformik.values.validUpto ? dayjs(addformik.values.validUpto).toDate() : null}
              onChange={(date: Date | null) => {
                addformik.setFieldValue("validUpto", date ? dayjs(date).format("YYYY-MM-DD") : "");
              }}
              dateFormat="YYYY-MM-dd"
              errors={addformik.errors.validUpto}
              touched={addformik.touched.validUpto}
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
      {/* Edit Unit */}
       <CustomModal
        isOpen={isEditModalOpen}
        onClose={()=>setIsEditModalOpen(false)}
         modalSizeClassName="modal-md"
        title="Edit Committe"
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
                name="unitid"
                placeholder=""
                value={ unitOptions.find((u) => String(u.value) === String(editformik.values.unitid))
                        ?.label || "" }
                disabled={true}
                onChange={editformik.handleChange}
                onBlur={editformik.handleBlur}
              />
          </div>
           <div className="col-md-2 py-2">
            <label className="form-label mb-1">Committee:</label>
          </div>
          <div className="col-md-9">
            <InputField
              type="text"
              name="committeName"
              placeholder="Committee Name"
              value={editformik.values.committeName}
              onBlur={editformik.handleBlur}
              onChange={editformik.handleChange}
              errors={editformik.errors.committeName}
              touched={editformik.touched.committeName}
            />
          </div>
           <div className="col-md-2 py-2">
            <label className="form-label mb-1">Valid Upto:</label>
          </div>
          <div className="col-md-9">
              <DatePickerField
              name="validUpto"
              placeholder="Choose Date"
              value={editformik.values.validUpto ? dayjs(editformik.values.validUpto).toDate() : null}
              onChange={(date: Date | null) => {
                editformik.setFieldValue("validUpto", date ? dayjs(date).format("YYYY-MM-DD") : "");
              }}
              dateFormat="YYYY-MM-dd"
              errors={editformik.errors.validUpto}
              touched={editformik.touched.validUpto}
            />
          </div>
         </div>
         <div className="row form_grider d1">
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Status:</label>
          </div>
          <div className="col-md-9">
            <SelectField
              value={statusOptions.find(opt => opt.value === editformik.values.status)}
              name="status"
              placeholder="Status"
              options={statusOptions}
              onChange={(option) => editformik.setFieldValue("status", option?.value)}
              onBlur={editformik.handleBlur}
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
    {/* User Role Modal*/}
     <CustomModal isOpen={isUserMapEditOpen} onClose={() => {setIsUserMapEditOpen(false)}}
         title='Manage Committee Details'>
      <div
          className="modal-scrollable-content px-2 py-3"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
        <div className="c-accordion">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Committee Details</div>
          </div>
          <div className="row py-1 form_grider d1">
            <div className="col-md-3 py-2">
             <InputField
              type="text"
              name="committeName"
              placeholder="Committee Name"
              value={committeeDetail?.committeName || ""}
              onChange={() => {}}
              onBlur={() => { }}
              errors={""}
              touched={""}
              disabled={true}
            />
            </div>
            <div className="col-md-4 py-0">
            <EmployeeEmailField
              token={token}
              value={email || ""}
              onChange={(email, val) => {
                setUserId(val?.jsplid);
                setEmail(email);
              }}
            />
            </div>
            <div className="col-md-3 py-2">
                <button className="iconBtn green v2 d-flex align-items-center gap-2"
                 type="button"
                  onClick={() => {checkToAddUserMapModal(committeeDetail?.unitid, "", committeeDetail?.committeId, userId, committeeDetail?.validUpto)}}
                  >
                  <img
                    width={20}
                    height={20}
                    alt="Add"
                    src="/images/svg/icons/Add.svg"
                    className="white-icon"
                  />
                  <span>Add Member</span>
                </button>
              </div>
           </div>
          {/* Tables */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
            }}
          >
            {/* Table */}
            <div style={{width: "100%", overflowY: "auto", borderRadius: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#c5cddaff" }}>
                  <tr>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Committe Name</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Unit</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>User Name</th>                    
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>User Email</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>User Department</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Status</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Inactive</th>
                  </tr>
                </thead>
                <tbody>
                  {committeeMemberList?.length > 0 ? (
                    committeeMemberList
                    .filter((val) => val.status === "active") 
                    .map((val, index) => (
                    <tr key={index}>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{val?.committeName}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{val?.unitName}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{val?.empName}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{val?.empEmail}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{val?.departmentName}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>
                        {val?.status && (
                            <div
                              style={{display: "flex", gap: "8px",alignItems: "center",justifyContent: "center" }}>
                              <img
                                width="30"
                                height="30"
                                alt="status icon"
                                src={
                                  val?.status === "active"
                                    ? "/images/svg/icons/GreenCircle.svg"
                                    : "/images/svg/icons/RedCircle.svg"
                                }
                              />
                            </div>
                          )}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                        <button type="button"
                          onClick={() => checkToInactiveCommitteeMember(val?.unitId, val?.departmentId, val?.id, val?.committeId)}
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
                          Inactive
                        </button>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#777" }}>
                        No Committee Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
   </CustomModal>
     <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
   </div>
  </>
  );
};

export default CommitteePanel;
