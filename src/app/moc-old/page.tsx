"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import CustomModal from "@/components/Layouts/CustomModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { RootState } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { FETCH_UNITS,FETCH_DEPARTMENTS,FETCH_SECTIONS,FETCH_ALL_DRAFT_APPLICATION, FETCH_ALL_MOCS, REMOVE_DRAFT_MOC } from "@/config/apiConfig";
import { FormValues, Mocs } from "@/types/moc";
import dayjs from "dayjs";
import Image from "next/image";
import { clearObjectId, setObjectId } from "@/store/slices/mocSlice";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import { serverRequest } from "@/services/getServerSideRender";
import { emptySelector } from "@/config/config";
import { ToastContainer, toast } from "react-toastify";

interface filterMoc {
  fromDate: string,
  toDate: string,
  mocAfNo: string | null,
  unitId: string | null,
  departmentId: string | null,
  createdBy: string,
  pendingAt: string | null,
  orderByColumn: string | null,
  orderByDirection: string | null
}
const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

const User = () => {
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const token = useSelector(selectUserToken);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [unitId, setUnitId] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [departmentId, setDepartmentId] = useState(null);
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [sectionId, setSectionId] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fetchedDraft, setfetchedDraft] = useState<FormValues[]>([]);
  // const [fetchedMoc, setfetchedMoc] = useState<Mocs>();
  const [fetchedMoc, setfetchedMoc] = useState<Mocs>({
  filter: {} as filterMoc,
  mocs: []
  });
  const [deletableMoc, setDeletableMoc] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [pendingInfo, setPendingInfo] = useState<any | null>(null);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDraftMocList = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_ALL_DRAFT_APPLICATION + `/${user?.jsplid}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        setfetchedDraft(response);
      }
    } catch (error) {
      console.error("Error fetching draft MOCs:", error);
    }
  };

  const removeDraftMoc = async () => {
    try {
      const response = await serverRequest(
        {},
        `${REMOVE_DRAFT_MOC}/${user?.jsplid}/${deletableMoc}`,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
      if (response?.success) {
        setfetchedDraft(fetchedDraft.filter(item => item.objectId !== deletableMoc));
        console.log("MOC draft deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting MOC draft:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setDeletableMoc('');
    }
  };

  const handleEditClick = (objectId: string) => {
    dispatch(setObjectId(objectId));
    router.push(APP_URL.CREATE_MOC);
  };

  const handleCreateMoc = () => {
    dispatch(clearObjectId());
    router.push(APP_URL.CREATE_MOC);
  };

  const fetchMocList = async ({fromDate = null, toDate = null, unitId = null, departmentId = null} = {}) => {
    try {
      const filterValues = {
        fromDate,
        toDate,
        mocAfNo: null,
        unitId: unitId?.value ?? null,
        departmentId: departmentId?.value ?? null,
        createdBy: user?.createdBy ?? null,
        pendingAt: null,
        orderByColumn: null,
        orderByDirection: null
      };
      if(fromDate != null && toDate != null)
        {
        if(toDate < fromDate) 
          {
            toast.error("To Date must be greater than From Date");
            return;
          }
        }
     
      const response = await serverRequest(
        filterValues,
        FETCH_ALL_MOCS,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.mocs?.length > 0) {
        setfetchedMoc(response);
      } else {
        setfetchedMoc({ filter: {} as filterMoc, mocs: [] });
      }
    } catch (error) {
      console.error("Error fetching MOCs:", error);
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchMocList();
  }, [])

  useEffect(() => {
    if (user?.createdBy && token) {
      fetchDraftMocList();
      dispatch(clearObjectId());
    }
  }, [token, user?.jsplid, dispatch]);

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

  const getPaginatedMocData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return fetchedMoc?.mocs?.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(fetchedMoc?.mocs?.length / newSize));
    setCurrentPage(1);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(fetchedMoc?.mocs?.length / pageSize));
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, fetchedMoc?.mocs?.length, currentPage, totalPages]);

  const resetFilterModal = () => {
    // Reset all filter fields
    setUnitId(null);
    setDepartmentId(null);
    setSectionId(null);
    setFromDate(null);
    setToDate(null);
    // Reset dependent dropdowns
    setDepartmentOptions(emptySelector);
    setSectionOptions(emptySelector);
  };

  return (
    <>
      <div className="container-fluid">
        <div className="admin-boxContainer d3">
          <div className="adminAction">
            <Link href="./" className="adminAction__title">
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
        {fetchedDraft?.length > 0 && <div className="d2">
          <div className="pb-4">
            <div className="admin-boxContainer d1 ">
              <div className="adminAction mb-3" style={{ backgroundColor: "#446181", height: "40px" }}>
                <div className="text-white ps-2 font-weight-bold py-2">
                  Drafts: {fetchedDraft?.length}
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="admin-table d3 table-responsive noHover">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ minWidth: "90px" }}>Unit</th>
                          <th style={{ minWidth: "90px" }}>ID</th>
                          <th>Date</th>
                          <th style={{ minWidth: "90px" }}>
                            Department / Section
                          </th>
                          <th>Status</th>
                          <th>Type of Expenditure</th>
                          <th>Type of Change</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchedDraft?.map((item) => (
                          <tr key={item?.objectId}>
                            <td>
                              {item?.unitName}
                            </td>
                            <td>
                              {item?.objectId}
                            </td>
                            <td>
                              {dayjs(item?.createdDate).format("DD/MM/YYYY")}
                            </td>
                            <td>
                              {item?.departmentName}
                              <br />
                              {"/ "+item?.sectionName}
                            </td>
                            <td>{item?.mocAfStatus}</td>
                            <td>{item?.typeOfExpenditure} ({item?.amount} {item?.currency})</td>
                            <td>{item?.typeOfChange}</td>
                            <td>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}>
                                <button className="tableBtn" type="button" onClick={() => handleEditClick(item?.objectId as string)}>
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
                                    setDeletableMoc(item?.objectId as string);
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
        </div>}
        <div className="admin-boxContainer d2">
          <div className="adminFilters d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <button
                className="adminFilters__btn"
                onClick={() => setIsFilterOpen(true)}
              >
                <img
                  width="15"
                  height="15"
                  alt="Filter"
                  src="/images/svg/filter-icon.svg"
                  className="img-fluid u-image"
                />
              </button>
              <button
                type="button"
                className="iconBtn orange"
                 onClick={() => {
                      resetFilterModal();
                      fetchMocList();
                      setIsFilterOpen(false);
                    }}>
                Refresh
                <img
                  width="25"
                  height="25"
                  alt="Refresh"
                  src="/images/svg/refresh-icon.svg"
                  className="img-fluid u-image"
                />
              </button>
            </div>
            <div>
              <button className="iconBtn green" onClick={handleCreateMoc}>
                <span>Create MOC</span>
                <img
                  width="15"
                  height="15"
                  alt="Edit"
                  src="/images/svg/edit-icon.svg"
                  className="img-fluid u-image"
                />
              </button>
            </div>

          </div>
        </div>

        {/* {fetchedMoc?.mocs?.length && <div className="pb-4"> */}
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: "90px" }}>Date</th>
                        <th style={{ minWidth: "90px" }}>Moc AF No.</th>
                        <th style={{ minWidth: "90px" }}>Unit</th>
                        <th style={{ minWidth: "90px" }}>Department</th>
                        <th style={{ minWidth: "90px" }}>Section</th>
                        <th style={{ minWidth: "120px" }}>Status</th>
                        <th>Type of Expenditure</th>
                        <th>Type of Change</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedMocData() && getPaginatedMocData().length > 0 ? (
                        getPaginatedMocData().map((item: any) => (
                        <tr key={item?.mocAfNo}>
                          <td>
                            {dayjs(item?.createdDate).format("DD/MM/YYYY")}
                          </td>
                          <td>
                            <span style={{ color: "#005A8C", fontWeight: 600 }}>{item?.mocAfNo} </span>
                          </td>
                            <td>
                            {item?.unitName}
                            </td>
                          <td>
                            {item?.departmentName}
                          </td>
                           <td>
                            {item?.sectionName}
                          </td>
                          <td>
                            <strong className="text-success">{item?.mocAfStatus ?? ""}</strong>
                            <br />
                            {!(["Reverted", "Rejected", "Approved"].includes(item?.mocAfStatus ?? "")) && (
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPendingInfo({
                                    mocAfPrimaryPendingFor: item?.mocAfPrimaryPendingFor,
                                    mocAfPrimaryPendingAtMail: item?.mocAfPrimaryPendingAtMail,
                                    mocAfPrimaryPendingAtName: item?.mocAfPrimaryPendingAtName,
                                  });
                                  setIsPendingModalOpen(true);
                                }}
                                style={{ color: "#007bff", cursor: "pointer" }}
                              >
                                ({item?.mocAfPrimaryPendingFor})
                              </a>
                            )}
                          </td>
                          {/* <td>-</td> */}
                          <td>{item?.typeOfExpenditure} ({item?.amount} {item?.currency})</td>
                          <td
                            className={
                              item?.typeOfChange === "Temporary"
                                ? "text-warning fw-bold"
                                : item?.typeOfChange === "Permanent"
                                  ? "text-success fw-bold"
                                  : ""
                            }
                          >
                            {item?.typeOfChange}
                          </td>
                          <td>
                            <Link href={APP_URL.HOD_DETAIL_VIEW} onClick={() => sessionStorage.setItem('mocAfNo', item?.mocAfNo as string)}>
                              <button className="tableBtn orange">
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
                            </Link>
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
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, fetchedMoc?.mocs?.length)} of {fetchedMoc?.mocs?.length} records
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
        {/* </div>} */}
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
                  value={unitId}
                  name="unitId"
                  placeholder="Select Unit"
                  options={unitOptions}
                  onChange={(value) => {
                    setUnitId(value);
                    fetchDepartments(value?.value);
                  }}
                  // onBlur={formik.handleBlur}
                />
              </div>
              <div className="col-md-4">
               <SelectField
                  label="Department"
                  value={departmentId}
                  name="Department"
                  placeholder="Select Department"
                  options={departmentOptions}
                  onChange={(value) => {
                    setDepartmentId(value);
                  }}
                />
              </div>
              <div className="col-md-2">
                <DatePickerField
                label="From Date"
                name="fromDate"
                placeholder="Select Date"
                // errors={formik.errors.fromDate}
                // touched={formik.touched.fromDate}
                value={fromDate ? new Date(fromDate): null }
                  onChange={(date: Date | null) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(date.getDate()).padStart(2, "0");
                    setFromDate(`${year}-${month}-${day}`);
                  } else {
                    setFromDate(null);
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
                // errors={formik.errors.toDate}
                // touched={formik.touched.toDate}
                value={toDate ? new Date(toDate) : null}
                  onChange={(date: Date | null) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(date.getDate()).padStart(2, "0");
                    setToDate(`${year}-${month}-${day}`);
                  } else {
                    setToDate(null);
                  }
                }}
                maxDate={new Date()}
                dateFormat="YYYY-MM-dd"
               />
              </div>
            </div>
              <div className="row">
                <div className="col-12">
                  <div className="btnWrapper">
                    <button className="btnNoicon green" type="button"
                     onClick={() => {
                        fetchMocList({fromDate: fromDate, toDate: toDate, unitId: { value: unitId?.value }, departmentId: { value: departmentId?.value }});
                        setIsFilterOpen(false)
                      }}>
                      Apply
                      </button>
                    <button className="btnNoicon red" type="button"
                     onClick={() => {
                      resetFilterModal();
                      fetchMocList();
                      }}>Reset</button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </CustomModal>
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        modalSizeClassName="modal-lg"
        title="Are you sure to remove this Draft MOC?"
      >
        <div className="m-3">
          <h4>This Draft once removed can not be retrieved.</h4>
          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="iconBtn bg-secondary d-flex align-items-center gap-2"
              onClick={() => setIsDeleteModalOpen(false)}
            >
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
              type="button"
              className="iconBtn bg-danger d-flex align-items-center gap-2"
              onClick={removeDraftMoc}
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
      <CustomModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        modalSizeClassName="modal-md"
        title="Pending Information"
      >
        {pendingInfo && (
          <div className="p-3">
            {pendingInfo.mocAfPrimaryPendingFor === "Checklists In Review" ? (
              <p className="text-danger fw-bold">
                Please go through the checklist page to check the responsible person detail.
              </p>
            ) : (
              <>
                <p>
                  <strong>Pending at Name:</strong>{" "}
                  {pendingInfo.mocAfPrimaryPendingAtName}
                </p>
                <p>
                  <strong>Pending at Email:</strong>{" "}
                  {pendingInfo.mocAfPrimaryPendingAtMail}
                </p>
              </>
            )}
          </div>
        )}
      </CustomModal>
       <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default ProtectedRoute(User);