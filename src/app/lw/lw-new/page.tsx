"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHead from "@/components/Elements/PageHead";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import CustomModal from "@/components/Layouts/CustomModal";
import { use, useEffect, useRef, useState } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import UnitInteraction from "./_partials/UnitInteraction";
import Observations from "./_partials/Observations";
import { emptySelector } from "@/config/config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { serverRequest } from "@/services/getServerSideRender";
import {
  FETCH_UNITS,
  FETCH_OBSERVATION_TYPE,
  FETCH_OBSERVATION_CATEGORY,
  FETCH_RISK_POTENTIAL,
  FETCH_LW,
  FETCH_LINEMANAGER,
  FETCH_DETAILS_FROM_MAIL,
  UPLOAD_FILE,
  DELETE_FILE,
  BUCKET_URL,
  DOWNLOAD_FILE
} from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import { SelectOptions } from "@/components/interfaces";
import { clearObjectId, clearScheduleId, setObjectId, setScheduleId } from "@/store/slices/lwSlice";

interface HigherRole {
  [key: string]: any;
}
interface DepartmentData {
  createdAt: string;
  departmentid: number;
  departmentname: string;
  hod: string;
  hodEmail: string;
  jsplid: string;
  lwUpdatedAt: string;
  monthlyScheduleCfsa: number;
  monthlyScheduleLw: number;
  monthlyScheduleSi: number;
  rowIndex: number;
  siUpdatedAt: string;
  status: "active" | "inactive";
  statusImage: string;
  unitid: number;
  updatedAt: string;
  weeklyScheduleLw: number;
  weeklyScheduleSi: number;
}

const masterPayloadSchema = {
  objectId: null,
  siNo: "",
  unit: "",
  unitDisplay: "",
  department: "",
  departmentDisplay: "",
  sections: "",
  sectionDisplay: "",
  locations: "",
  nameObserver: "",
  siDate: "",
  starttime: "",
  endtime: "",
  duration: "",
  createdat: "",
  createdby: "",
  updatedat: "",
  updatedby: "",
  status: "",
  generalComment: "",
  hod: "",
  flag: "",
  idd: 0,
  modulename: "LW",
  employetype: "Internal",
  rowIndex: 0,
  scheduleStatus: "",
  scheduleId: 0,
  noOfCoobserver: "",
  userUnit: "",
  userDepartment: "",
  userSection: "",
  os: "Windows",
  accordionIndex: 0,
  observations: [],
  noPeopleObserved: "",
};

const mergeWithSchema = (schema: any, data: any) => {
  const result: any = {};
  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(data || {}, key)) {
      result[key] = data[key] !== undefined ? data[key] : schema[key];
    } else {
      result[key] = schema[key];
    }
  }
  return result;
};
const LwNew = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const objectId = useSelector((state: RootState) => state.lw.objectId);
  const scheduleId = useSelector((state: RootState) => state.lw.scheduleId);
    
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const token = useSelector(selectUserToken);
  const [currentStatus, setCurrentStatus] = useState<number>(0);
  const [openSection, setOpenSection] = useState<number>(0);
  const [unitData, setUnitData] = useState<{
  unit: string;
  unitDisplay: string;
  department: string;
  departmentDisplay: string;
  sections: string;
  sectionDisplay: string;
  hod: string;
  nameObserver: string;
  siDate: string;
  starttime: string;
  endtime: string;
  duration: string;
  createdBy: string;
}>({
  unit: "",
  unitDisplay: "",
  department: "",
  departmentDisplay: "",
  sections: "",
  sectionDisplay: "",
  hod: "",
  nameObserver: "",
  siDate: "",
  starttime: "",
  endtime: "",
  duration: "",
  createdBy: "",
});
  // const [coObserverData, setCoObserverData] = useState(null);
  const [observationData, setObservationData] = useState([]);
  const [lwData, setLWData] = useState(null);
  const [unitOptions, setUnitOptions] = useState<SelectOptions[]>(emptySelector);
  //   //const [unit, setUnit] = useState([]);
  //   const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  //   const [departments, setDepartments] = useState([]);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector);
  const [lineManagers, setLineManagers] = useState([]);
  // const [sectionOptions, setSectionOptions] = useState(emptySelector);
  // const [sections, setSections] = useState([]);
  const [typeOfObservationsOptions, setTypeOfObservationsOptions] =
    useState(emptySelector);
  // const [typeOfObservations, setTypeOfObservations] = useState([]);
  const [observationCategoriesOptions, setObservationCategoriesOptions] =
    useState(emptySelector);
  // const [observationCategories, setObservationCategories] = useState([]);
  const [riskPotentialOptions, setRiskPotentialOptions] =
    useState(emptySelector);
  const [riskPotentialList, setRiskPotentialList] = useState([]);
  const createCaseObjectIdRef = useRef<string | null>(null);
  const accordionTitles = [
    "Unit And LW Details",
    "Observations",
  ];
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchExistingLWData = async (id: string, scheduleId: string) => {
    try {
      const response = await serverRequest(
        {},
        `${FETCH_LW}/get-draft/${user?.createdBy}/${id ?? " "}/${scheduleId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        setLWData(response);
        setCurrentStatus(response?.accordionIndex ?? 0);
        setOpenSection(response?.accordionIndex ?? 0);
      }
    } catch (error) {
      console.error("Error fetching existing LW data:", error);
    }
  };
  const fetchLWSchedule = async (scheduledId: string) => {
    try {
      const response = await serverRequest(
        {},
        `${FETCH_LW}/Schedule/${scheduleId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        if(!response?.scheduleid) {
          return;
        }
        setLWData({
          unit: response?.unit,
          unitDisplay: "",
          department: response?.departments,
          departmentDisplay: "",
          sections: response?.sections,
          sectionDisplay: "",
          scheduleId: response?.scheduleid,
        });
        console.log("Called Schedule");
      }
    } catch (error) {
      console.error("Error fetching existing LW data:", error);
    }
  };

  useEffect(() => {
    if (objectId || scheduleId) {
      if(!objectId && scheduleId) {
        fetchLWSchedule(scheduleId);
      }
      fetchExistingLWData(objectId ?? " ", scheduleId ?? "");
    } else {
      setLWData(mergeWithSchema(masterPayloadSchema, {}));
    }
  }, []); // objectId
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) {
        router.push(window.location.href);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  const saveDraftLW = async () => {
    if (isPublishing || isSavingDraft) return; // Prevent conflict with publish or ongoing draft save
    if (!lwData?.unit || !lwData?.department || !lwData?.sections || !lwData?.siDate) return;
    setIsSavingDraft(true);
    const fullPayload = mergeWithSchema(masterPayloadSchema, lwData);
    // redux store > ref
    if (objectId) {
      fullPayload.objectId = objectId.trim();
    } else if (createCaseObjectIdRef.current) {
      fullPayload.objectId = createCaseObjectIdRef.current;
    }
    if(scheduleId && scheduleId > 0) {
      fullPayload.scheduleId = scheduleId;
    }
    fullPayload.createdBy = user?.createdBy;
    fullPayload.updatedBy = user?.createdBy;

    try {
      const response = await serverRequest(
        fullPayload,
        FETCH_LW + "/save-lw",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.objectId && (!objectId || objectId.trim() === "") && !createCaseObjectIdRef.current) {
        createCaseObjectIdRef.current = response.objectId;
        dispatch(setObjectId(response.objectId));
        // console.log("SaveDraft ObjectId--", response.objectId);
        // Also update local lwData
        // setLWData((prev: any) => ({
        //   ...prev,
        //   objectId: response.objectId,
        // }));
      }
    } catch (error) {
      console.error("Error saving LW:", error);
    }
    finally
    {
      setIsSavingDraft(false);
    }
  };
  const removeDraftLW = async (draftId: string) => {
    try {
      await serverRequest(
        {},
        FETCH_LW + `/remove-draft/${user?.createdBy}/${draftId}`,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
    } catch (error) {
      console.error("Error removing LW:", error);
    }
  };
  const publishLW = async () => {
    if (isSavingDraft || isPublishing) return; // prevent double click
    setIsPublishing(true);
    const fullPayload = mergeWithSchema(masterPayloadSchema, lwData);
    if (objectId) {fullPayload.objectId = objectId;}
    else if (createCaseObjectIdRef.current) {fullPayload.objectId = createCaseObjectIdRef.current;}

    fullPayload.createdBy = user?.createdBy;
    fullPayload.updatedBy = user?.createdBy;
    try {
      const response = await serverRequest(
        fullPayload,
        FETCH_LW + "/save-lw/publish",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response?.id) {
        toast.success("LW published successfully");     
         // clear local state and redirect   
        dispatch(clearObjectId());
        setTimeout(() => {
          router.push(APP_URL.SAFETY_LW);
        }, 3000);
        return;
      } else {
        toast.error(response?.message || "Publish failed");
        setIsPublishing(false); // re-enable only on failure
      }
    } catch (error) {
      console.error("Error saving LW:", error);
      setIsPublishing(false);
    }
  };
  useEffect(() => {
    if (user?.empUnit) {
      // Only set these if we're creating a new PIR
      setUnitOptions([
        { label: user?.unitDisplay || "", value: user?.empUnit || "" },
      ]);
      // setUnitData({
      //   unit: user?.empUnit,
      //   unitDisplay: user?.unitDisplay,
      //   department: user?.empDepartment,
      //   departmentDisplay: user?.departmentDisplay,
      //   sections: user?.empSection,
      //   sectionDisplay: user?.sectionDisplay,
      //   createdBy: user?.createdBy,
      //   nameObserver: user?.empName,
      // });
      setUnitData((prev) => ({
        ...prev,
        unit: user?.empUnit || "",
        unitDisplay: user?.unitDisplay || "",
        department: user?.empDepartment || "",
        departmentDisplay: user?.departmentDisplay || "",
        sections: user?.empSection || "",
        sectionDisplay: user?.sectionDisplay || "",
        createdBy: user?.createdBy || "",
        nameObserver: user?.empName || "",
      }));
      setLWData((prev) => ({
        ...prev,
        unit: user?.empUnit,
        unitDisplay: user?.unitDisplay,
        department: user?.empDepartment,
        departmentDisplay: user?.departmentDisplay,
        sections: user?.empSection,
        sectionDisplay: user?.sectionDisplay,
        createdBy: user?.createdBy,
        nameObserver: user?.empName,
      }));
      //   if (user?.empUnit) {
      //     fetchDepartments(user?.empUnit, "");
      //   }
    }
  }, [user]);

  useEffect(() => {
    fetchUnits();
    fetchTypeOfObservations();
    fetchObservationCategory();
    fetchRiskPotential();
  }, []);

  useEffect(() => {
    if(lwData?.unit && lwData?.department && lwData?.sections && lwData?.siDate)
      saveDraftLW();
  }, [lwData]);

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
        const options = response.map((data: any) => ({
          value: data?.unitid,
          label: data?.unitname,
        }));
        setUnitOptions(options);
        //setUnit(response);
      } else {
        setUnitOptions(emptySelector);
        //setUnit([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchTypeOfObservations = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_OBSERVATION_TYPE + "/GetObservationTypes",
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.id,
          label: data?.observation,
        }));
        setTypeOfObservationsOptions(options);
      } else {
        setTypeOfObservationsOptions([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchObservationCategory = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_OBSERVATION_CATEGORY + "/GetObservationCategories",
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.id,
          label: data?.observationCategory,
        }));
        setObservationCategoriesOptions(options);
      } else {
        setObservationCategoriesOptions([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };  
  const fetchRiskPotential = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_RISK_POTENTIAL + "/get-risks",
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.id,
          label: data?.riskpotential,
        }));
        setRiskPotentialOptions(options);
        setRiskPotentialList(response);
      } else {
        setRiskPotentialOptions([]);
        setRiskPotentialList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const toggleSection = (index: number) => {
    if (index > currentStatus) return; // block if index > currentStatus
    setOpenSection((prev) => (prev === index ? -1 : index));
  };
  const handlePreview = () => {
    if(lwData?.observations && lwData?.observations?.length > 0) {
      setIsPreviewActive(true);
    }
  };

  const [isViewActionOpen, setIsViewActionOpen] = useState(false);
  const [actionsForView, setActionsForView] = useState([]);
  const [imagesForView, setImagesForView] = useState([]);

  const handleObservationView = async (row) => {
    setActionsForView(row.actionsTaken);
    setImagesForView(row.lwImages); //Check to change
    setIsViewActionOpen(true);
  };
   const downloadFile = async (fileId) => {
    const payload = fileId;
    try {
        const response = await serverRequest(
            payload,
            DOWNLOAD_FILE,
            CONSTANTS.REQUEST_POST,
            true,
            true,
            token,
            false,   
            true,  
           "blob"   // responseType — tell it to treat response as a Blob
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
    <>
      <div className="container-fluid">
        <div className="admin-boxContainer d3">
          <div className="adminAction">
            <Link href={APP_URL.SAFETY_LW} className="adminAction__title">
              <span className="icon">
                <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage LW
            </Link>
          </div>
        </div>
        {accordionTitles.map((title, index) => {
          return (
            <div className="c-accordion" key={index}>
              <div className="c-accordion__head">
                <div className="c-accordion__head--title">{title}</div>
                <button
                  type="button"
                  onClick={() => toggleSection(index)}
                  className="c-accordion__head--btn"
                  disabled={index > currentStatus} // disable button if locked
                  aria-disabled={index > currentStatus}
                >
                  {openSection === index ? (
                    <Image
                      width={20}
                      height={20}
                      alt="icon"
                      src="/images/svg/up-arrow.svg"
                      className="img-fluid u-image"
                    />
                  ) : (
                    <Image
                      width={20}
                      height={20}
                      alt="icon"
                      src="/images/svg/down-arrow.svg"
                      className="img-fluid u-image"
                    />
                  )}
                </button>
              </div>
              {openSection === index && (
                <>
                  {index === 0 && (
                    <UnitInteraction
                      unitData={unitData}
                      setUnitData={setUnitData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      unitOptions={unitOptions}
                      lwData={lwData}
                      setLWData={setLWData}
                    />
                  )}
                  {index === 1 && (
                    <>
                      <Observations
                        observationData={observationData}
                        setObservationData={setObservationData}
                        currentStatus={currentStatus}
                        setCurrentStatus={setCurrentStatus}
                        setOpenSection={setOpenSection}
                        typeOfObservationsOptions={typeOfObservationsOptions}
                        observationCategoriesOptions={observationCategoriesOptions}
                        riskPotentialOptions={riskPotentialOptions}
                        riskPotentialList={riskPotentialList}
                        lwData={lwData}
                        setLWData={setLWData}
                        setIsPreviewActive={setIsPreviewActive}
                      />
                      {/* <div className="actionWrapper ">
                        <button
                          className="iconBtn orange v2"
                          onClick={handlePreview}
                          type="button"
                        >
                          <span>Preview</span>
                          <Image
                            width={15}
                            height="15"
                            alt="icon"
                            className="img-fluid u-image"
                            src="/images/svg/eye-white.svg"
                          />
                        </button>
                      </div> */}
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <CustomModal isOpen={isPreviewActive} onClose={() => {setIsPreviewActive(false)}} title="Preview LW Form">
        <div className="c-accordion" key="0">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Unit & Interaction</div>
          </div>
          <div className="row py-2 form_grider d1 px-3">
            <div className="col-md-3">              
              <InputField
                type="text"
                label="Unit"
                name="UnitPreview"
                placeholder=""
                value={lwData?.unitDisplay || ""}
                disabled={true} 
                onBlur={() => {}}
                onChange={() => {}}
                />
            </div>
            {/* Department */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Department"
                name="DepartmentPreview"
                placeholder=""
                value={lwData?.departmentDisplay || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Visited Section */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Visited Section"
                name="VisitedSectionPreview"
                placeholder=""
                value={lwData?.sectionDisplay || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* HOD Name */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="HOD Name"
                name="HODNamePreview"
                placeholder=""
                value={lwData?.hod || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* LW Date */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="LWDate"
                name="LWDatePreview"
                placeholder=""
                value={lwData?.siDate || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Start Time */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Start Time"
                name="StartTimePreview"
                placeholder=""
                value={lwData?.starttime || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* End Time */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="End Time"
                name="EndTimePreview"
                placeholder=""
                value={lwData?.endtime || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Duration */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Duration"
                name="DurationPreview"
                placeholder=""
                value={lwData?.duration || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Name of Observer */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Name of Observer"
                name="NameofObserverPreview"
                value={lwData?.nameObserver || ""}
                disabled={true}
                placeholder=""
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
        <div className="c-accordion" key="2">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Observations</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Details of Observation</th>
                        <th>Type of Observation</th>
                        <th>Observation Category</th>
                        <th>Observation Subcategory</th>
                        <th>Observation SubSubcategory</th>
                        <th>Risk Potential</th>
                        <th>Exact Location</th>
                        <th style={{ width: 120 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lwData?.observations?.length > 0 ? (
                        lwData?.observations.map((row, index) => (
                          <tr key={index}>
                            <td>{row.observationDetail}</td>
                            <td>{row?.observationTypeDisplay}</td>
                            <td>{row?.observationCategoryDisplay}</td>
                            <td>{row?.observationSubcategoryDisplay}</td>
                            <td>
                            {Array.isArray(row?.observationSubsubcategory)
                            ? row?.observationSubsubcategory.map(x => x.label || x.value).join(", ")
                            : row?.observationSubsubcategory || ""}
                            </td>
                            <td>{row.riskPotentialsDisplay}</td>
                            <td>{row.exactLocation}</td>
                            <td>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                      handleObservationView(row);
                                  }}
                                  className="tableBtn">
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
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center">
                            No Observation added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
        <div className="actionWrapper px-3">
          <button
            className="iconBtn orange v2"
            onClick={() => {setIsPreviewActive(false)}}
            type="button"
          >
            <span>Edit LW Form</span>
            <Image
              width={15}
              height="15"
              alt="icon"
              className="img-fluid u-image"
              src="/images/svg/edit-icon.svg"
            />
          </button>
          <button
            className="iconBtn green v2"
            onClick={publishLW}
            type="button"
            disabled={isPublishing} // disable while submitting
          >
            <span>{isPublishing ? "Publishing..." : "Submit LW"}</span>
            <Image
              width={15}
              height={15}
              alt="icon"
              className="img-fluid u-image"
              src="/images/svg/plane_icon.svg"
              style={{transform: "rotate(135deg)"}}
            />
          </button>
        </div>
      </CustomModal>
      <CustomModal isOpen={isViewActionOpen} onClose={() => setIsViewActionOpen(false)}
        title="View Actions & File Attachments">
        <div className="filters w-60 px-2 py-2 scrollable-container">
          <div className="row g-3 px-3">
            <div className="admin-table d3 table-responsive mt-3">
              <div className="fw-bold">View Actions</div>
              <table className="table border">
                <thead>
                  <tr>
                    <th style={{ width: "20px" }}>#</th>
                    <th style={{ width: "50%" }}>Corrective Action</th>
                    <th>Section Head</th>
                    <th>Assign to Line Manager</th>
                    <th>Target Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {actionsForView?.length > 0 ? (
                    actionsForView.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="text-start">{row?.actiontaken}</td>
                        <td className="text-start">{row?.sectionhead}</td>
                        <td className="text-start">{row?.linemanagerName ?? ""}</td>
                        <td className="text-start">{row?.targetdate}</td>
                        <td className="text-start">{row?.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No actions defined for this observation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="admin-table d3 table-responsive mt-3">
              <div className="fw-bold">File Attachments</div>
              <table className="table border">
                <thead>
                  <tr>
                    <th style={{ width: "20px" }}>#</th>
                    <th style={{ width: "50%" }}>Before File Name</th>
                    <th style={{ width: "50%" }}>After File Name</th>
                  </tr>
                </thead>
                <tbody>
                  {imagesForView?.length > 0 ? (
                    imagesForView.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="text-start">
                          {row?.beforefileid ? (
                            <>
                             <a href="#" onClick={(e) => {e.preventDefault(); downloadFile(row?.beforefileid);}}>
                               <img
                                src={`${BUCKET_URL}/${row?.beforefileid}`}
                                alt="File"
                                width="50"
                                height="35"
                              />
                              </a>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-start">
                          {row?.afterfileid ? (
                            <>
                               <a href="#" onClick={(e) => {e.preventDefault(); downloadFile(row?.afterfileid);}}>
                                <img
                                src={`${BUCKET_URL}/${row?.afterfileid}`}
                                alt="File"
                                width="50"
                                height="35"
                              />
                            </a>
                            </>
                          ) : (
                            ""
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No file attached for this observation. 
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CustomModal>
      <ToastContainer position="top-right" autoClose={2000} 
                      hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default ProtectedRoute(LwNew);
