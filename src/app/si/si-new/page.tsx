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
import CoObservers from "./_partials/CoObservers";
import Observations from "./_partials/Observations";
import SixStepsProcess from "./_partials/SixStepsProcess";
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
  FETCH_SI,
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
import { clearObjectId, clearScheduleId, setObjectId, setScheduleId } from "@/store/slices/siSlice";

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
  modulename: "SI",
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
  coObservers: [],
  observations: [],
  steps: [],
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
const SiNew = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const objectId = useSelector((state: RootState) => state.si.objectId);
  const scheduleId = useSelector((state: RootState) => state.si.scheduleId);
  //console.log("scheduleId-",scheduleId);
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
  scheduleId: string;
  noOfCoobserver: string;
  noPeopleObserved: string;
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
  scheduleId: "",
  noOfCoobserver: "",
  noPeopleObserved: "",
});
  const [coObserverData, setCoObserverData] = useState(null);
  const [observationData, setObservationData] = useState([]);
  const [sixStepsProcessData, setSixStepsProcessData] = useState(null);
  const [siData, setSIData] = useState(null);
  // const [siSubmitData, setSISubmitData] = useState(null);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  //   //const [unit, setUnit] = useState([]);
  //   const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  //   const [departments, setDepartments] = useState([]);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector);
  const [lineManagers, setLineManagers] = useState([]);
  // const [sectionOptions, setSectionOptions] = useState(emptySelector);
  // const [sections, setSections] = useState([]);
  const [typeOfObservationsOptions, setTypeOfObservationsOptions] =
    useState(emptySelector);
  const [typeOfObservations, setTypeOfObservations] = useState([]);
  const [observationCategoriesOptions, setObservationCategoriesOptions] =
    useState(emptySelector);
  const [observationCategories, setObservationCategories] = useState([]);
  const [observationSubCategoriesOptions, setObservationSubCategoriesOptions] =
    useState(emptySelector);
  const [observationSubCategories, setObservationSubCategories] = useState([]);
  const [riskPotentialOptions, setRiskPotentialOptions] =
    useState(emptySelector);
  const [riskPotentialList, setRiskPotentialList] = useState([]);
  const createCaseObjectIdRef = useRef<string | null>(null);
  const accordionTitles = [
    "Unit And Interaction",
    "Co-Observers",
    "Observations",
    "Safety Interaction Process Six Steps Process",
  ];
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchExistingSIData = async (id: string, scheduleId: string) => {
    try {
      const response = await serverRequest(
        {},
        `${FETCH_SI}/get-draft/${user?.createdBy}/${id ?? " "}/${scheduleId ?? ""}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        if(!response?.objectId) {
          return;
        }
        setSIData(response);
        setCurrentStatus(response?.accordionIndex ?? 0);
        setOpenSection(response?.accordionIndex ?? 0);
      }
    } catch (error) {
      console.error("Error fetching existing SI data:", error);
    }
  };

  const fetchSISchedule = async (scheduleId: string) => {
    try {
      const response = await serverRequest(
        {},
        `${FETCH_SI}/Schedule/${scheduleId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        if(!response?.scheduleid) {
          return;
        }
        setSIData((prev: any) => ({
          ...prev,
          unit: response?.unit,
          unitDisplay: "",
          department: response?.departments,
          departmentDisplay: "",
          sections: response?.sections,
          sectionDisplay: "",
          scheduleId: response?.scheduleid,
        }));
        //console.log("Called Schedule");
      }
    } catch (error) {
      console.error("Error fetching existing SI data:", error);
    }
  }

  useEffect(() => {
    if (objectId || scheduleId) {
      if(!objectId && scheduleId) {
        fetchSISchedule(scheduleId);
      }
      fetchExistingSIData(objectId ?? " ", scheduleId ?? "");
    } else {
      setSIData(mergeWithSchema(masterPayloadSchema, {}));
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

  const saveDraftSI = async () => {
    if (isPublishing || isSavingDraft) return; // Prevent conflict with publish or ongoing draft save
    if (!siData?.unit || !siData?.department || !siData?.sections || !siData?.siDate) return;
    setIsSavingDraft(true);

    const fullPayload = mergeWithSchema(masterPayloadSchema, siData);
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
        FETCH_SI + "/save-si",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      
      if (response?.objectId && !objectId && !createCaseObjectIdRef.current) {//|| objectId.trim() === ""
        createCaseObjectIdRef.current = response.objectId;
        dispatch(setObjectId(response.objectId));
        //console.log("SaveDraft ObjectId--", response.objectId);
        // Also update local siData
        // setSIData((prev: any) => ({
        //   ...prev,
        //   objectId: response.objectId,
        // }));
      }
    } catch (error) {
      console.error("Error saving SI:", error);
    }
    finally {
      setIsSavingDraft(false);
    }
  };
  const removeDraftSI = async (draftId: string) => {
    try {
      await serverRequest(
        {},
        FETCH_SI + `/remove-draft/${user?.createdBy}/${draftId}`,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
    } catch (error) {
      console.error("Error saving SI:", error);
    }
  };
  const publishSI = async () => {
    if (isSavingDraft || isPublishing) return; // prevent double click
    setIsPublishing(true);
    const fullPayload = mergeWithSchema(masterPayloadSchema, siData);
    if (objectId) {fullPayload.objectId = objectId;}
    else if (createCaseObjectIdRef.current) {fullPayload.objectId = createCaseObjectIdRef.current;}

    fullPayload.createdBy = user?.createdBy;
    fullPayload.updatedBy = user?.createdBy;
    try {
      const response = await serverRequest(
        fullPayload,
        FETCH_SI + "/save-si/publish",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response?.id) {
        toast.success("SI published successfully");
        // clear local state and redirect
        dispatch(clearObjectId());
        setTimeout(() => {
          router.push(APP_URL.SAFETY_SI);
        }, 3000);
        return;
      } else {
        toast.error(response?.message || "Publish failed");
        setIsPublishing(false);
      }
    } catch (error) {
      console.error("Error saving SI:", error);
      setIsPublishing(false);
    }
  };
  useEffect(() => {
    if (user?.empUnit) {
      // Only set these if we're creating a new PIR
      setUnitOptions([
        { label: user?.unitDisplay || "", value: user?.empUnit || "" },
      ]);
      setUnitData({
        unit: user?.empUnit,
        unitDisplay: user?.unitDisplay,
        department: user?.empDepartment,
        departmentDisplay: user?.departmentDisplay,
        sections: user?.empSection,
        sectionDisplay: user?.sectionDisplay,
        createdBy: user?.createdBy,
        nameObserver: user?.empName,
        scheduleId: scheduleId,
        hod: "",
        siDate: "",
        starttime: "",
        endtime: "",
        duration: "",
        noOfCoobserver: "",
        noPeopleObserved: "",
      });
      setSIData((prev) => ({
        ...prev,
        unit: user?.empUnit,
        unitDisplay: user?.unitDisplay,
        department: user?.empDepartment,
        departmentDisplay: user?.departmentDisplay,
        sections: user?.empSection,
        sectionDisplay: user?.sectionDisplay,
        createdBy: user?.createdBy,
        nameObserver: user?.empName,
        scheduleId: scheduleId,
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
    if(siData?.unit && siData?.department && siData?.sections && siData?.siDate)
      saveDraftSI();
  }, [siData]);

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
        setTypeOfObservations(response);
      } else {
        setTypeOfObservationsOptions([]);
        setTypeOfObservations([]);
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
      if (response.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.id,
          label: data?.observationCategory,
        }));
        setObservationCategoriesOptions(options);
        setObservationCategories(response);
      } else {
        setObservationCategoriesOptions([]);
        setObservationCategories([]);
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
      if (response.length > 0) {
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
    if(siData?.observations && siData?.observations?.length > 0 && siData?.steps && siData?.steps?.length > 0) {
      setIsPreviewActive(true);
    }
  };

  const [isViewActionOpen, setIsViewActionOpen] = useState(false);
  const [actionsForView, setActionsForView] = useState([]);
  const [imagesForView, setImagesForView] = useState([]);

  const handleObservationView = async (row) => {
    setActionsForView(row.actionsTaken);
    setImagesForView(row.siImages);
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
            <Link href={APP_URL.SAFETY_SI} className="adminAction__title">
              <span className="icon">
                <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage SI
            </Link>
          </div>
        </div>

        {/* <div className="admin-boxContainer d2">
          <div className="adminFilters align-items-center">
            <h4>New Safety Interaction</h4>
            <div className="row form_grider d1"></div>
          </div>
        </div>
        <div className="admin-boxContainer d1 nobackground">
          <MultiAccordionSiNewForm />
        </div> */}
        {accordionTitles.map((title, index) => {
          if (title === "Co-Observers" && siData?.noOfCoobserver === "0")
            return null;
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
                      siData={siData}
                      setSIData={setSIData}
                    />
                  )}
                  {index === 1 && !!siData?.noOfCoobserver && !isNaN(Number(siData.noOfCoobserver)) && Number(siData?.noOfCoobserver) > 0 && (
                    <CoObservers
                      coObserverData={coObserverData}
                      setCoObserverData={setCoObserverData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      siData={siData}
                      setSIData={setSIData}
                    />
                  )}
                  {index === 2 && (
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
                      siData={siData}
                      setSIData={setSIData}
                    />
                  )}
                  {index === 3 && (
                    <>
                    <SixStepsProcess
                      sixStepsProcessData={sixStepsProcessData}
                      setSixStepsProcessData={setSixStepsProcessData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      siData={siData}
                      setSIData={setSIData}
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
      <CustomModal isOpen={isPreviewActive} onClose={() => {setIsPreviewActive(false)}} title="Preview SI Form">
      <div
          className="modal-scrollable-content px-2 py-3"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
        <div className="c-accordion" key="0">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Unit & Interaction</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-md-3">
              <InputField
                type="text"
                label="Unit"
                name="unitPreview"
                placeholder=""
                value={siData?.unitDisplay || ""}
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
                name="departmentPreview"
                placeholder=""
                value={siData?.departmentDisplay || ""}
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
                name="sectionPreview"
                placeholder=""
                value={siData?.sectionDisplay || ""}
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
                name="hodPreview"
                placeholder=""
                value={siData?.hod || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* SI Date */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="SI Date"
                name="siDatePreview"
                placeholder=""
                value={siData?.siDate || ""}
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
                name="startTimePreview"
                placeholder=""
                value={siData?.starttime || ""}
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
                name="endtimePreview"
                placeholder=""
                value={siData?.endtime || ""}
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
                name="durationPreview"
                placeholder=""
                value={siData?.duration || ""}
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
                name="nameObserverPreview"
                placeholder=""
                value={siData?.nameObserver || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* No of Co-Observer */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="No of Co-Observer"
                name="noOfCoobserverPreview"
                placeholder=""
                value={siData?.noOfCoobserver || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* No. of People Interacted During SI */}
            <div className="col-md-3">              
              <InputField
                type="text"
                label="No. of People Interacted During SI"
                name="noPeopleObservedPreview"
                placeholder=""
                value={siData?.noPeopleObserved || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
        <div className="c-accordion" key="1">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Co-Observers</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-12">
              <div className="admin-table d3 table-responsive noHover">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Email</th>
                      <th>Name of Employee</th>
                      <th>Mobile Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siData?.coObservers?.length > 0 ? (
                      siData.coObservers.map((row, index) => (
                        <tr key={index}>
                          <td>{row?.types}</td>
                          <td>{row?.email}</td>
                          <td>{row?.name}</td>
                          <td>{row?.mobile}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center">
                          No co-observers added.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                      {siData?.observations?.length > 0 ? (
                        siData?.observations.map((row, index) => (
                          <tr key={index}>
                            <td>{row?.observationDetail}</td>
                            <td>{row?.observationTypeDisplay}</td>
                            <td>{row?.observationCategoryDisplay}</td>
                            <td>{row?.observationSubcategoryDisplay}</td>
                            <td>
                            {Array.isArray(row?.observationSubsubcategory)
                            ? row?.observationSubsubcategory.map(x => x.label || x.value).join(", ")
                            : row?.observationSubsubcategory || ""}
                            </td>
                            <td>{row?.riskPotentialsDisplay}</td>
                            <td>{row?.exactLocation}</td>
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
                          <td colSpan={7} className="text-center">
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
        <div className="c-accordion" key="3">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Six Steps Process</div>
          </div>
          <div className="d-flex justify-content-center my-4 ">
            <div className="step-buttons d-flex flex-wrap gap-2 justify-content-center">
              {siData?.steps?.sort((a, b) => a.steps - b.steps).map((step) => (
                <button
                  type="button"
                  key={step.steps}
                  className={`step-btn px-4 py-2 rounded fw-bold
                    ${step.status === "Pending" ? "active-step" : ""}
                    ${step.status === "Done" ? "completed-step" : ""}
                    ${step.status === "Skip" ? "skipped-step" : ""}`}
                >
                  {step.steps}
                </button>
              ))}
            </div>
          </div>
          <style jsx>{`
            .step-btn {
              font-size: 1.1rem;
              min-width: 50px;
              height: 50px;
              border-radius: 50%;
              border: 3px solid #f47920;
              color: #f47920;
              background-color: white;
              font-weight: bold;
              transition: all 0.3s ease;
            }

            .step-btn.active-step:hover {
              background-color: #636466;
              color: white;
            }

            .active-step {
              background-color: #ffffff;
              color: #636466;
              border: 3px solid #636466;
              box-shadow: none;
            }

            .completed-step {
              background-color: #28a745;
              color: white;
              border: 3px solid #28a745;
            }

            .skipped-step {
              background-color: #f47920;
              color: white;
              border: 3px solid #f47920;
            }

            @media (max-width: 576px) {
              .step-btn {
                min-width: 40px;
                font-size: 1rem;
                height: 45px;
              }
            }
          `}</style>          
          <div className="d-flex justify-content-center mt-3">
            <p className="fw-bold">All 6 steps acknowledged.</p>
          </div>
        </div>
        <div className="row py-2 form_grider d1">
          <div className="col-md-12">
            <InputField
                type="text"
                label="General Comment"
                name="generalCommentPreview"
                placeholder=""
                value={siData?.generalComment || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
        </div>
        <div className="actionWrapper ">
          <button
            className="iconBtn orange v2"
            onClick={() => {setIsPreviewActive(false)}}
            type="button"
          >
            <span>Edit SI Form</span>
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
            onClick={publishSI}
            type="button"
            disabled={isPublishing} // disable while submitting
          >
            <span>{isPublishing ? "Publishing..." : "Submit SI"}</span>
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
                        <td className="text-start">{row?.linemanagerName}</td>
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

export default ProtectedRoute(SiNew);
