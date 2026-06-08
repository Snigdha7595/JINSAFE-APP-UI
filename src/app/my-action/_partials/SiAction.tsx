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
import Select from "react-select";
import SelectField from "@/components/Form/SelectFields";
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
  FETCH_SECTIONS,
  FETCH_LINEMANAGER,
  FETCH_SI,
} from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { ToastContainer, toast } from "react-toastify";

interface SiActionInterface {
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
}

type FormValues = {
  unit: string;
  departments: string;
  sections: string;
  sectionHead: string;
  actionId: string;
  status: string;
  actionTakenByUser: string;
  actionMedia: string;
  actionMediaType: string;
  assignLinemanager?: string;
 };

const SiAction = ({
  currentStatus,
  setCurrentStatus,
  }: SiActionInterface) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [isReassignActionOpen, setIsReassignActionOpen] = useState<boolean>(false);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector);

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filterValues, setFilterValues] = useState({
    siNo: null,
    fromDate: null,
    toDate: null,
    assignedTo: user.createdBy,
    userUnit: null,
    userDepartment: null,
    userSections: null,
    visitedUnit: null,
    visitedDepartment: null,
    visitedSections: null,
    status: ["Open", "WIP", "Done"],
  });
  const [siActionList, setSiActionList] = useState([]);
  const [siActionById, setSiActionById] = useState<any>({});
  const statusFilterOptions = [
  { value: "Open", label: "Open" },
  { value: "WIP", label: "WIP" },
  { value: "Done", label: "Done" },
  { value: "Completed", label: "Completed" }
  ];
  const statusOptions = [
  { value: "WIP", label: "WIP" },
  { value: "Completed", label: "Completed" },
  ];
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [isActionOpen, setIsActionOpen] = useState<boolean>(false);
  const [actionId, setActionId] = useState("");

   const fetchSIActionList = async (filterValues) => {
    setSiActionList([]);
    try {
      const response = await serverRequest(
        filterValues,
        FETCH_SI+ "/get-si-actions",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response?.actions?.length > 0) {
        setSiActionList(response?.actions)
      }
    } catch (error) {
      console.error("Error fetching Action of SIs:", error);
    }
  };
  useEffect(() => {fetchSIActionList(filterValues);}, []);

  const fetchSIAction = async (id) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_SI+ `/get-si-action/${id}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
     if (response?.header) {
         setSiActionById(response);
         setIsActionOpen(true);
      }
    } catch (error) {
      console.error("Error fetching Action of SIs:", error);
    }
  };
  const updateSIAction = async (id, payload) => {
    try {
      const response = await serverRequest(
        payload,
        FETCH_SI+ `/update-si-action/${id}/`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );
      if (response?.success == true) {
         toast.success(response?.message);
         window.location.reload();
      }
    } catch (error) {
      console.error("Error during updating SI action.:", error);
    }
  };

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
  
 const fetchLineManagers = async (deptId: string, secId: string = '') => {
    setLineManagerOptions(emptySelector);
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
       if (response.length > 0) {
         const options = response.map((value) => ({
          value: value?.jsplid,
          label: value?.linemanagerName,
        }));
        setLineManagerOptions(options);
      } else {
        setLineManagerOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching line managers:", error);
    }
  };

 const reassignSIAction = async (id, payload) => {
    try {
      const response = await serverRequest(
        payload,
        FETCH_SI+ `/reassign-si-action/${id}/`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );
      if (response?.success == true) {
        if(response?.message != null)
         {
          toast.success(response?.message);
         }
         else
         {
          toast.success("Action reassigned successfully.");
         }
         window.location.reload();
      }
    } catch (error) {
      console.error("Error during Reassign SI action.:", error);
    }
  };
  const formik = useFormik<FormValues>({
    initialValues: {
    unit: "",
    departments: "",
    sections: "",
    sectionHead: "",
    assignLinemanager: "",
    actionId: actionId,
    status: "",
    actionTakenByUser: "",
    actionMedia: "",
    actionMediaType: "",
    },
    onSubmit: (values) => {
      console.log("Submit Value-", JSON.stringify(values));
      let payload = {
        actionId: actionId,
        status: values.status,
        actionTakenByUser: values.actionTakenByUser,
        actionMedia: null,
        actionMediaType: null,
        Updatedby: user?.createdBy
      }
      updateSIAction(actionId, payload);
      setIsActionOpen(false);
      formik.resetForm();
    },
  });
  const downloadFileFromLink = async (sino) => {
    try {
        const response = await serverRequest(
            {},
            FETCH_SI + `/generate-pdf/`+ `${sino}`,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            token,
            false,   
            true,  
           "blob"
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
  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
     <div className="container-fluid">
              
        {/* Block 1 */}
       <div className="d-flex justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2 ms-auto">
                <button type="button" className="iconBtn grey mb-2"
                 onClick={() => setIsFilterOpen(true)}
                >
                  <span>Filter</span>
                  <img
                    width="20"
                    height="20"
                    alt="Filter"
                    src="/images/svg/icons/Filter.svg"
                    className="white-icon"
                  />
                </button>
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
                        <th>SI NO</th>
                        <th>Assign Line Manager</th>
                        <th>Target Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(siActionList &&
                        siActionList.length > 0) ? (
                        siActionList.map((si: any) => (
                          <tr key={si.id}>
                            <td>{si?.siNo}</td>
                            <td>{si?.assignLinemanager}</td>
                            <td>{si?.targetdate}</td>
                            <td>{si?.status}</td>
                            <td>
                             {(si?.status === "Open" ||
                                si?.status === "WIP" ||
                                si?.status === "Done" ||
                                si?.status === "Completed") && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {/* PDF Button - shown for all allowed statuses */}
                                  <button
                                    className="tableBtn"
                                    type="button"
                                    onClick={() => downloadFileFromLink(si?.siNo)}
                                  >
                                    <span className="u-icon">
                                      <Image
                                        width={15}
                                        height={15}
                                        alt="icon"
                                        src="/images/svg/pdf-icon.svg"
                                        className="img-fluid u-image"
                                        style={{
                                          filter:
                                            "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                        }}
                                      />
                                    </span>
                                  </button>
                                  {si?.status !== "Completed" && (
                                    <>
                                      <button
                                        className="tableBtn"
                                        type="button"
                                        onClick={() => {
                                          setActionId(si?.actionId);
                                          fetchSIAction(si?.actionId);
                                        }}
                                      >
                                        <span>
                                          <img
                                            width="15"
                                            height="15"
                                            alt="icon"
                                            src="/images/svg/icons/Next.svg"
                                            style={{
                                              filter:
                                                "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                            }}
                                          />
                                        </span>
                                      </button>
                                      <button
                                        type="button"
                                        className="tableBtn"
                                        onClick={() => {
                                          setActionId(si?.actionId);
                                          setIsReassignActionOpen(true);
                                        }}
                                      >
                                        <span>
                                          <img
                                            width="15"
                                            height="15"
                                            alt="icon"
                                            src="/images/svg/userIcon.svg"
                                            className="img-fluid u-image"
                                          />
                                        </span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
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
                
              </div>
            </div>
          </div>
        </div>
    </div>
 <CustomModal
  isOpen={isActionOpen}
  onClose={() => setIsActionOpen(false)}
  title={`Update Action ( SI No. - ${siActionById?.header?.siNo} )`}
  >
  <div
    className="modal-scrollable-content px-2 py-3"
    style={{ maxHeight: '70vh', overflowY: 'auto' }}
  >
  <div className="filters">
    <div className="row g-3">
    {/* Unit Interaction Body START */}
   <div className="c-accordion d1 row py-1">
    <div className="c-accordion__head">
      <div className="c-accordion__head--title">Unit And Interaction</div>
      </div>
      </div>
      <div className="form_grider d1 row">
      <div className="col-md-2">
          <InputField
            type="text"
            label="Unit"
            name="UnitPreview"
            placeholder=""
            value={siActionById?.header?.unit}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
        <div className="col-md-2">
          <InputField
            type="text"
            label="Department"
            name="DepartmentPreview"
            placeholder=""
            value={siActionById?.header?.department}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
        <div className="col-md-2">
          <InputField
            type="text"
            label="Section"
            name="SectionPreview"
            placeholder=""
            onBlur={() => {}}
            onChange={() => {}}
            value={siActionById?.header?.sections}
            disabled={true}
            />
        </div>
        <div className="col-md-2">
          <InputField
            type="text"
            label="SI Date"
            name="SIDatePreview"
            placeholder=""
            value={siActionById?.header?.siDate}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
        <div className="col-md-2">
          <InputField
            type="text"
            name="NameObserverPreview"
            placeholder=""
            label="Name of Observer"
            value={siActionById?.header?.nameObserver}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
        <div className="col-md-2">
          <InputField
            type="text"
            name="Status"
            placeholder=""
            label="Status"
            value={siActionById?.header?.status}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
    </div>
      {/* Block Unit Interaction END */}
      {/* Observation Body START */}
   <div className="c-accordion d1 row py-1">
    <div className="c-accordion__head">
      <div className="c-accordion__head--title">Observation</div>
      </div>
      </div>
      <div className="form_grider d1 row">
         <div className="col-md-6">
          <InputField
            type="text"
            name="ObservationDetailPreview"
            placeholder=""
            label="Observation Detail"
            value={siActionById?.observation?.observationDetail}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
        <div className="col-md-3">
          <InputField
            type="text"
            name="ExactLocationPreview"
            placeholder=""
            label="Exact Location"
            value={siActionById?.observation?.exactLocation}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
       <div className="col-md-3">
          <InputField
            type="text"
            name="RiskPotentialPreview"
            placeholder=""
            label="Risk Potential"
            value={siActionById?.observation?.riskPotentials}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
      <div className="col-md-3">
          <InputField
            type="text"
            name="ObservationPreview"
            placeholder=""
            label="Type"
            value={siActionById?.observation?.observationType}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>       
        <div className="col-md-3">
          <InputField
            type="text"
            name="CategoryPreview"
            placeholder=""
            label="Category"
            value={siActionById?.observation?.observationCategory}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
        <div className="col-md-3">
          <InputField
            type="text"
            name="SubCategoryPreview"
            placeholder=""
            label="Sub-Category"
            value={siActionById?.observation?.observationSubcategory}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>
        <div className="col-md-3">
          <InputField
            type="text"
            name="SubCategoryPreview"
            placeholder=""
            label="Sub-SubCategory"
            value={siActionById?.observation?.observationSubsubcategory}
            disabled={true}
            onBlur={() => {}}
            onChange={() => {}}
            />
        </div>       
      </div>
     
      {/* Block Observation END */}
        {/* Observation Body START */}
   <div className="c-accordion d1 row py-1">
      <div className="c-accordion__head">
        <div className="c-accordion__head--title">Update Action</div>
      </div>
   </div>
      <div className="form_grider d1 row">
          <div className="col-md-3">
            <SelectField
              label="Status"
              value={statusOptions.find(opt => opt.value === formik.values.status)}
              name="status"
              placeholder="Select Status"
              options={statusOptions}
              onChange={(option) => formik.setFieldValue("status", option?.value)}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="col-md-9">
            <InputField
              type="text"
              label="Action Taken"
              value={formik.values.actionTakenByUser}
              name="actionTakenByUser"
              placeholder="Remark"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              errors={formik.errors.actionTakenByUser}
              touched={formik.touched.actionTakenByUser}
            />
        </div>
      </div>
      
      {/* Footer */}
      <div className="col-12">
        <div className="d-flex flex-wrap justify-content-end gap-0 pt-3 border-top mt-2">
          <button
            type="button"
            className="iconBtn green w100 gap-2"
            onClick={() => {
              if (
                !formik.values.status ||
                !formik.values.actionTakenByUser
              ) {
                toast.error("Please fill all required fields!");
                return;
              }
              formik.handleSubmit();
            }}
          >
            <img
              width="20"
              height="20"
              alt="Save"
              src="/images/svg/icons/Save.svg"
              className="white-icon"
            />
            <span>Submit</span>
          </button>

          <button
            className="iconBtn grey d-flex align-items-center gap-2"
            onClick={() => setIsActionOpen(false)}
          >
            <img
              width="20"
              height="20"
              alt="Cancel"
              src="/images/svg/icons/Cancle.svg"
              className="white-icon"
            />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</CustomModal>
 <CustomModal
      isOpen={isReassignActionOpen}
      onClose={() => setIsReassignActionOpen(false)}
      title="Reassign Action"
    >
      <div className="filters px-2 py-3">
        {" "}
        {/* consistent padding all around */}
        <div className="row g-3">
          {" "}
          <div className="col-12">
            
          </div>
          {/* Modal Body START */}
          <div className="form_grider d1 row g-2">
              <div className="col-md-3">
                 <SelectField
                  label="Unit"
                  value={
                    formik.values.unit
                      ? unitOptions.find((u) => String(u.value) === String(formik.values.unit))
                      : null
                  }
                  name="unit"
                  placeholder="Select Unit"
                  options={unitOptions}
                  onChange={(value) => {
                    formik.setFieldValue("unit", value?.value);
                    formik.setFieldValue("departments", null);
                    formik.setFieldValue("sections", null);
                    formik.setFieldValue("assignLinemanager", null);
                    fetchDepartments(value?.value);
                  }}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="col-md-3">
               <SelectField
                  label="Department"
                  value={
                    formik.values.departments
                      ? departmentOptions.find((u) => String(u.value) === String(formik.values.departments))
                      : null
                  }
                  name="departments"
                  placeholder="Select Departments"
                  options={departmentOptions}
                  onChange={(value) => {
                    formik.setFieldValue("departments", value?.value);
                    formik.setFieldValue("sections", null);
                    formik.setFieldValue("assignLinemanager", null);
                    fetchSections(value?.value);
                  }}
                />
              </div>
              <div className="col-md-3">
                <SelectField
                  label="Section"
                  value={
                    formik.values.sections
                      ? sectionOptions.find((u) => String(u.value) === String(formik.values.sections))
                      : null
                  }
                  name="sections"
                  placeholder="Select Section"
                  options={sectionOptions}
                  onChange={(value) => {
                    formik.setFieldValue("sections", value?.value);
                    formik.setFieldValue("assignLinemanager", null);
                    fetchLineManagers(
                      formik.values.departments,
                      value?.value
                    );
                  }}
                />
              </div>
              <div className="col-md-3">
              <SelectField
                  label="Line Manager"
                  value={
                    formik.values.assignLinemanager
                      ? lineManagerOptions.find((u) => String(u.value) === String(formik.values.assignLinemanager))
                      : null
                  }
                  name="assignLinemanager"
                  placeholder="Select LineManager"
                  options={lineManagerOptions}
                  onChange={(value) => {
                    formik.setFieldValue("assignLinemanager", value?.value);
                  }}
               />
              </div>
            </div>
            {/* Modal Body END */}
            {/* Footer */}
            <div className="col-12">
              <div className="d-flex flex-wrap justify-content-end gap-0 pt-3 border-top mt-2">
                <Link href="#">
                  <button type="button" className="iconBtn green w100 gap-2"
                  onClick={() => {
                  if (!formik.values.unit && !formik.values.departments && !formik.values.sections && !formik.values.assignLinemanager) {
                    toast.error("Please fill all required fields!");
                    return;
                  }
                   let payload = { 
                    actionId: actionId,
                    departments: formik.values.departments,
                    sections: formik.values.sections,
                    assignLinemanager: formik.values.assignLinemanager,
                    Updatedby: user?.createdBy
                  }
                   reassignSIAction(actionId, payload);                  
                  }}
                  >
                    <img
                      width="20"
                      height="20"
                      alt="Save"
                      src="/images/svg/icons/Save.svg"
                      className="white-icon"
                    />
                    <span>Submit</span>
                  </button>
                </Link>

                <Link href="#">
                  <button
                    className="iconBtn grey d-flex align-items-center gap-2"
                    onClick={() => setIsReassignActionOpen(false)}
                  >
                    <img
                      width="20"
                      height="20"
                      alt="Cancel"
                      src="/images/svg/icons/Cancle.svg"
                      className="white-icon"
                    />
                    <span>Cancel</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
</CustomModal>
<CustomModal
    isOpen={isFilterOpen}
    onClose={() => setIsFilterOpen(false)}
    title="Filter"
    >
    <>
        <form className="space-y-4">
        <div className="filters">
        <div className="row py-2 form_grider d1">
            <div className="col-md-3">
            <SelectField
                label="Unit"
                value={formik.values.userUnit ? unitOptions.find((u) => String(u.value) === String(formik.values.userUnit))
                    : null
                }
                name="userUnit"
                placeholder="All"
                options={unitOptions}
                onChange={(value) => {
                formik.setFieldValue("userUnit", value?.value);
                formik.setFieldValue("userDepartment", null);
                formik.setFieldValue("userSections", null);
                fetchDepartments(value?.value);
                }}
            />
            </div>
            <div className="col-md-3">
             <SelectField
                label="Department"
                value={
                    formik.values.userDepartment
                    ? departmentOptions.find((u) => String(u.value) === String(formik.values.userDepartment))
                    : null
                }
                name="userDepartment"
                placeholder="All"
                options={departmentOptions}
                onChange={(value) => {
                formik.setFieldValue("userDepartment", value?.value);
                formik.setFieldValue("userSections", null);
                fetchSections(value?.value);
                }}
                onBlur={formik.handleBlur}
             />
            </div>
             <div className="col-md-3">
             <SelectField
                label="Section"
                value={
                    formik.values.userSections
                    ? sectionOptions.find((u) => String(u.value) === String(formik.values.userSections))
                    : null
                }
                name="userSections"
                placeholder="All"
                options={sectionOptions}
                onChange={(value) => {
                formik.setFieldValue("userSections", value?.value);
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
                    formik.setFieldValue("fromDate", null);
                    }
                }}
            maxDate={new Date()}
            dateFormat="yyyy-MM-dd"
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
                    formik.setFieldValue("toDate", null);
                    }
                }}
            maxDate={new Date()}
            dateFormat="yyyy-MM-dd"
            />
            </div>
                <div className="col-md-3">
                <label className="form-label">Status</label>
                <Select
                isMulti
                name="statusFilter"
                options={statusFilterOptions}
                value={
                formik.values.statusFilter?.length
                    ? statusFilterOptions.filter((opt) =>
                        formik.values.statusFilter.includes(opt.value)
                    )
                    : []
                }
                onChange={(selectedOptions) => {
                formik.setFieldValue(
                    "statusFilter",
                    selectedOptions?.map((opt) => opt.value) || []
                );
                }}
                onBlur={() => formik.setFieldTouched("statusFilter", true)} 
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
                label="SI No."
                type="text"
                name="siNo"
                placeholder="Enter SI Number"
                value={formik.values.siNo || null}
                onChange={(e) => formik.setFieldValue("siNo", e.target.value)}
                onBlur={formik.handleBlur}
                touched={formik.touched.siNo}
              />
            </div>
            </div>
            <div className="d-flex gap-2 mt-3 justify-content-center">
            <button
                className="iconBtn green v2"
                type="button"
                 onClick={() => {
                    if (formik.values.fromDate && formik.values.toDate) 
                      {
                        const from = new Date(formik.values.fromDate);
                        const to = new Date(formik.values.toDate);
                        if (to < from) {
                          toast.error("To Date must be greater than From Date");
                          return;
                        }
                      }
                    let payloadFilter = { 
                    siNo: formik.values.siNo || null,  
                    fromDate: formik.values.fromDate || null,
                    toDate: formik.values.toDate || null,
                    assignedTo: user.createdBy,
                    visitedUnit: null,
                    visitedDepartment: null,
                    visitedSections: null,
                    userUnit: formik.values.userUnit || null,
                    userDepartment:formik.values.userDepartment || null,
                    userSections: formik.values.userSections || null,
                    status: Array.isArray(formik.values.statusFilter) &&
                    formik.values.statusFilter.length > 0
                      ? formik.values.statusFilter
                      : ["Open", "WIP", "Done", "Completed"],
                  }
                   fetchSIActionList(payloadFilter); 
                   setIsFilterOpen(false);                  
                  }}
            >
            <span>Apply</span>
            </button>
            <button
                className="iconBtn red v2"
                type="button" onClick={() => { formik.resetForm(); fetchSIActionList(filterValues);}}>
                <span>Reset</span>
            </button>
            </div>
        </div>
        </form>
    </>
</CustomModal>
       <ToastContainer position="top-right" autoClose={2000} 
                      hideProgressBar={false} closeOnClick pauseOnHover />
    </form>
  );
};

export default SiAction;
