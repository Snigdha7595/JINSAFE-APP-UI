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
import RadioField from "@/components/Form/RadioField";
import { useSelector } from "react-redux";
import { emptySelector } from "@/config/config";
import { selectUserToken } from "@/store/slices/authSlice";
import { serverRequest } from "@/services/getServerSideRender";
import { RootState } from "@/store/store";
import { FETCH_UNITS, FETCH_ZONES } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";

const PAGE_SIZE_OPTIONS = [10, 25, 75, 100];
const DEFAULT_PAGE_SIZE = 10;

interface ZoneInterface {
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab? : React.Dispatch<React.SetStateAction<number>>;
}

type FormValues = {
  zoneId?: string;
  zoneName: string;
  unitId: string;
  unitname?: string;
  status: string;
  updatedby: string;
 };
interface ZoneDetailType {
  zoneId: string;
  zoneName: string;
  unitId: string;  
  status?: string;
}
const ZonePanel = ({
  currentStatus,
  setCurrentStatus,
  }: ZoneInterface) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [unitList, setUnitList] = useState([]);
  const [unitDetail, setUnitDetail] = useState("");
  const [zoneList, setZoneList] = useState([]);
  const [zoneDetail, setZoneDetail] = useState<ZoneDetailType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
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
        setUnitList(response);
       } else {
        setUnitOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchZones = async (unitid: string) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_ZONES + `/get-zones/${unitid}/all`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        setZoneList(response);
       } else {
        setZoneList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

 const filteredZones = zoneList.filter((zone: any) =>
  zone?.zoneName?.toLowerCase().includes(searchText.toLowerCase())
  );
 const getPaginatedZoneData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredZones.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setTotalPages(Math.ceil(zoneList.length / newSize));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  useEffect(() => {
    setTotalPages(Math.ceil(filteredZones.length / pageSize));
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pageSize, filteredZones.length, currentPage, totalPages]);

  const fetchZone = async (id: string) => {
    setZoneDetail(null);
    try {
        if (unitOptions.length === 0) {
        await fetchUnits();
        }
      const response = await serverRequest(
        {},
        FETCH_ZONES + `/${id}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        setZoneDetail(response);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (zoneDetail && unitOptions.length > 0) {
      const selectedUnit = unitOptions.find(
        (u) => String(u.value) === String(zoneDetail?.unitId)
      );
      setIsEditModalOpen(true);
    }
  }, [zoneDetail, unitOptions]);

 const saveZone = async (payload: FormValues) => {
    try {
      const response = await serverRequest(
        payload,
        FETCH_ZONES,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response) {
        toast.success("Zone added successfully");
        setIsAddModalOpen(false);
        fetchZones(addformik.values.unitId);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateZone = async (zoneId: string, zoneName: string, unitId: string, status: string) => {
    let payload = 
    {
      zoneId: zoneId,
      zoneName: zoneName,
      unitId: unitId,
      status: status,
      updatedby: user?.createdBy,
    }
    try {
      const response = await serverRequest(
        payload,
        FETCH_ZONES + `/${zoneId}`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );
      if (response?.success === true) {
        toast.success("Zone updated successfully");
        setIsEditModalOpen(false);
        fetchZones(addformik.values.unitId);
       } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 
  const getZoneValidationSchema = (mode: "add" | "edit", currentName?: string) =>
  Yup.object({
    zoneName: Yup.string()
      .required("Zone name is required")
      .min(2, "Must be at least 2 characters")
      .test("unique", "Zone name already exists", function (value) {
        if (!value) return true;
        const name = value.toLowerCase().trim();
        if (mode === "edit" && name === currentName?.toLowerCase().trim()) {
          return true; 
        }
        return !zoneList.some((z) => z.zoneName.toLowerCase().trim() === name);
      }),
  });
  // Add zone formik
  const addformik = useFormik<FormValues>({
    initialValues: {
    zoneName: "",
    unitId: "",
    status: "active",
    updatedby: user?.createdBy,
    },
    validationSchema: getZoneValidationSchema("add"),
    enableReinitialize: true,
    onSubmit: (values) => {
      saveZone(values);
      addformik.setFieldValue("zoneName", "");
    },
    });
     // Edit zone formik
    const editformik = useFormik<FormValues>({
    initialValues: {
      zoneName: zoneDetail?.zoneName || "",
      unitId: zoneDetail?.unitId || "",
      status: zoneDetail?.status || "active",
      updatedby: user?.createdBy,
    },
    validationSchema: getZoneValidationSchema("edit", zoneDetail?.zoneName),
    enableReinitialize: true,  // re-populate when zoneDetail changes
    validateOnChange: true, // ✅ validate while typing
    validateOnBlur: true,   // ✅ validate on blur
    onSubmit: async (values) => {
      if (!zoneDetail) return;
      try {
        await updateZone(
          zoneDetail?.zoneId,   // ID stays from zoneDetail
          values.zoneName,     // new zoneName from form
          values.unitId,       // take from form (not old detail)
          values.status        // take from form
        );
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
                      addformik.values.unitId
                        ? unitOptions.find((u) => String(u.value) === String(addformik.values.unitId))
                        : null
                    }
                    name="unitId"
                    placeholder="Select Unit"
                    options={unitOptions}
                    onChange={(option: any) => {
                      if (option) {
                        addformik.setFieldValue("unitId", option.value);
                        fetchZones(option.value);
                      } else {
                        addformik.setFieldValue("unitId", "");
                        setZoneList([]);
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
                placeholder="Search Zone..."
                errors={""}
                touched={""}
                onBlur={() => {}}
                onChange={(e: any) => setSearchText(e.target.value)}
              />
              </div>
             
              {/* <button
                className="iconBtn green w100 mb-3" type="button"
                onClick={() => {
                        if (addformik.values.unitId) {
                          setIsAddModalOpen(true);
                        } else {
                          toast.error("Please select Unit first!");
                        }
                      }}
              >
                <span>Add Zone</span>
                <img
                  width="20"
                  height="20"
                  alt="Button1"
                  src="/images/svg/icons/Add.svg"
                  className="white-icon"
                />
              </button> */}
            </div>
             <div className="col-12 d-flex justify-content-start align-items-center">
             <div className="w100 mb-0">Selected Unit :<b>{unitOptions.find((u) => String(u.value) === String(addformik.values.unitId))?.label}</b></div>
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
                        <th>Zone Name</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(getPaginatedZoneData() && getPaginatedZoneData().length > 0) ? (
                        getPaginatedZoneData().map((zone: any, index: number) => (
                          <tr key={zone?.zoneId}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{zone?.zoneName}</td>
                            <td>
                            {zone?.status && (
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
                                  zone?.status === "active"
                                    ? "/images/svg/icons/GreenCircle.svg"
                                    : "/images/svg/icons/RedCircle.svg"
                                }
                              />
                            </div>
                          )}
                              </td>
                            <td>
                              <div style={{ display: "flex", gap: "5px", alignItems: "center" , justifyContent: "center"}}>
                                <button className="tableBtn" type="button" disabled={true}
                                  onClick={() => {fetchZone(zone?.zoneId);}}
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
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredZones.length)} of {filteredZones.length} records
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
    {/* Add Unit */}
     <CustomModal
        isOpen={isAddModalOpen}
        onClose={()=>setIsAddModalOpen(false)}
        modalSizeClassName="modal-lg"
        title="Add Zone"
      >
      <form onSubmit={addformik.handleSubmit}>
       <div className="filters">
        <div className="row form_grider d1">
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Unit:</label>
          </div>
          <div className="col-md-10">
              <InputField
                type="text"
                name="unitname"
                placeholder=""
                value={unitOptions.find((u) => String(u.value) === String(addformik.values.unitId))
                       ?.label || "" }
                disabled={true}
                onChange={addformik.handleChange}
                onBlur={addformik.handleBlur}
              />
          </div>
        </div>
        <div className="row form_grider d1">
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Zone:</label>
          </div>
          <div className="col-md-10">
              <InputField
                type="text"
                name="zoneName"
                placeholder="Zone Name"
                value={addformik.values.zoneName}
                errors={addformik.errors.zoneName}
                touched={addformik.touched.zoneName}
                onBlur={addformik.handleBlur}
                onChange={addformik.handleChange}
              />
          </div>
        </div>
        <div className="d-flex justify-content-center gap-3 mt-3">
          {/* Cancel */}
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
          {/* Add */}
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
        modalSizeClassName="modal-lg"
        title="Edit Zone"
      >
      <form onSubmit={editformik.handleSubmit}>
       <div className="filters">
        <div className="row form_grider d1">
          <div className="col-md-2 py-2">
            <label className="form-label mb-1">Unit:</label>
          </div>
          <div className="col-md-9">
              <InputField
                type="text"
                name="unitname"
                placeholder=""
                value={ unitOptions.find((u) => String(u.value) === String(editformik.values.unitId))
                        ?.label || "" }
                disabled={true}
                onChange={editformik.handleChange}
                onBlur={editformik.handleBlur}
              />
          </div>
          </div>
          <div className="row form_grider d1">
           <div className="col-md-2 py-2">
            <label className="form-label mb-1">Zone:</label>
          </div>
          <div className="col-md-9">
              <InputField
                type="text"
                name="zoneName"
                placeholder="Zone Name"
                value={editformik.values.zoneName}
                onBlur={editformik.handleBlur}  // important for touched
                onChange={editformik.handleChange} // important for validation
                errors={editformik.errors.zoneName}
                touched={editformik.touched.zoneName}
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
     <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
   </div>
  </>
  );
};

export default ZonePanel;
