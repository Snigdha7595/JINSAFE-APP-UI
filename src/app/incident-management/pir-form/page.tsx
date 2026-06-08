"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UnitDetails from "./_partials/UnitDetails";
import Image from "next/image";
import PreliminaryClassification from "./_partials/PreliminaryClassification";
import IncidentDetails from "./_partials/IncidentDetails";
import DetailsOfInjury from "./_partials/DetailsOfInjury";
import Immediate from "./_partials/Immediate";
import PirSubmit from "./_partials/PirSubmit";
import { emptySelector } from "@/config/config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { serverRequest } from "@/services/getServerSideRender";
import {
  FETCH_DEPARTMENTS,
  FETCH_RISK_POTENTIAL,
  GET_ALL_BODY_PARTS,
  GET_NATURE_OF_INJURIES,
  GET_PRELIMINARY_CLASSIFICATION,
  SAVE_DRAFT_PIR,
} from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import { SelectOptions } from "@/components/interfaces";
import { clearObjectId, setPirId } from "@/store/slices/pirSlice";
import CustomModal from "@/components/Layouts/CustomModal";
import { ToastContainer, toast } from "react-toastify";

interface UnitDataInterface {
  unitId: string;
  departmentId: string;
  sectionId: string;
  exactLocation: string;
  incidentDate: string;
  incidentTime: string;
  departmentHod: string;
  lineManager: string;
}

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
interface UserData {
  aud: string;
  cfsaTrainedStatus: "YES" | "NO";
  companyName: string;
  createdBy: string;
  departmentDisplay: string;
  departmentHod: string;
  designationDisplay: string;
  email: string;
  empActiveStatus: "TRUE" | "FALSE";
  empArea: string;
  empDepartment: string;
  empDesignation: string;
  empEmail: string;
  empId: string;
  empMobile: string;
  empName: string;
  empSection: string;
  empUnit: string;
  unitId: string;
  exp: number;
  higher_role: HigherRole[];
  iat: number;
  imTrainedStatus: "Yes" | "No";
  iss: string;
  jsplid: string;
  loginType: string;
  name: string;
  nbf: number;
  picture: string;
  role: string[];
  roleCode: string;
  sectionDisplay: string;
  siTrainedStatus: "YES" | "NO";
  siTrainingUntill: string;
  sub: string;
  updatedBy: string;
  unitDisplay: string;
}

const masterPayloadSchema = {
  objectId: null,
  pirId: null,
  unitId: "",
  unitName: "",
  departmentId: "",
  departmentName: "",
  sectionId: "",
  sectionName: "",
  exactLocation: "",
  incidentDate: "",
  incidentTime: "",
  lineManager: "",
  sectionHead: "",
  departmentHod: "",
  incidentClassification: "",
  incidentCategory: "",
  personInjured: "",
  tier: null,
  remark: "",
  createdAt: "",
  createdBy: "",
  updatedAt: "",
  updatedBy: "",
  designationId: "",
  designationName: "",
  createdByUserRole: "",
  injuryHappened: "",
  whatHappened: "",
  preliminaryFindings: "",
  hipoCase: "",
  accordionIndex: 0,
  images: [],
  injuries: [],
  immediateActions: [],
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

const PirForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const objectId = useSelector((state: RootState) => state.pir.objectId);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: UserData }
  );
  const token = useSelector(selectUserToken);
  const [currentStatus, setCurrentStatus] = useState<number>(0);  
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [openSection, setOpenSection] = useState<number>(0);
  const [openPreviewModal, setOpenPreviewModal] = useState<boolean>(false)
  const [unitData, setUnitData] = useState({ unitId: "" });
  const [preliminaryData, setPreliminaryData] = useState(null);
  const [incidentData, setIncidentData] = useState([{}]);
  const [injuryData, setInjuryData] = useState(null);
  const [immediateData, setImmediateData] = useState(null);
  const [pirData, setPirData] = useState(null);
  const [pirSubmitData, setPirSubmitData] = useState(null);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [departments, setDepartments] = useState<any>(null);
  const createCaseObjectIdRef = useRef<string | null>(null);
  const [injuredJobTypeOptions, setInjuredJobTypeOptions] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [incidentList, setIncidentList] = useState<any>([])
  const [injuryNatureOptions, setInjuryNatureOptions] = useState<
    SelectOptions[] | null
  >(null);
  const [bodyPartOptions, setBodyPartOptions] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [prelimClassificOptions, setPrelimClassificOptions] =
    useState<SelectOptions[]>(emptySelector);

  const accordionTitles = [
    "Unit Details",
    "Preliminary Classification",
    "Incident Details",
    "Details of Injury",
    "Immediate Actions",
    "PIR Submitted by",
  ];
  const fetchExistingPirData = async (id: string) => {
    try {
      const response = await serverRequest(
        {},
        `${SAVE_DRAFT_PIR}/get-draft/${user?.createdBy}/${id}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        setPirData(response);
        setCurrentStatus(response?.accordionIndex ?? 0)
        setOpenSection(response?.accordionIndex ?? 0)
      }
    } catch (error) {
      console.error("Error fetching existing PIR data:", error);
    }
  };
  useEffect(() => {
    if (objectId) {
      fetchExistingPirData(objectId);
    } else {
      setPirData(mergeWithSchema(masterPayloadSchema, {}));
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

  const saveDraftPir = async () => {
    if (isPublishing || isSavingDraft) return; // Prevent conflict with publish or ongoing draft save
    setIsSavingDraft(true);
    const fullPayload = mergeWithSchema(masterPayloadSchema, pirData);
    // redux store > ref
    if (objectId) {
      fullPayload.objectId = objectId;
    } else if (createCaseObjectIdRef.current) {
      fullPayload.objectId = createCaseObjectIdRef.current;
    }

    try {
      const response = await serverRequest(
        fullPayload,
        SAVE_DRAFT_PIR + `/save-pir`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.objectId && !objectId && !createCaseObjectIdRef.current) {
        createCaseObjectIdRef.current = response.objectId;

        // Also update local pirData
        setPirData((prev: any) => ({
          ...prev,
          objectId: response.objectId,
        }));
      }
    } catch (error) {
      console.error("Error saving PIR:", error);
    }
    finally {
      setIsSavingDraft(false);
    }
  };

  const publishPir = async () => {
    if (isPublishing || isSavingDraft) return; // stop if any save is in progress
    setIsPublishing(true);
    setIsSavingDraft(true);
    try {
      const response = await serverRequest(
        pirData,
        SAVE_DRAFT_PIR + "/save-pir/publish",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.pirId) {
        toast.success("PIR published Successfully");
        dispatch(clearObjectId());
        setTimeout(() => {
          dispatch(setPirId(response?.pirId))
          router.push(APP_URL.INCIDENT_DETAIL);
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving PIR:", error);
      setIsPublishing(false);
    } finally {
      // setIsPublishing(false);
      // setIsSavingDraft(false);
    }
  };

  useEffect(() => {
    if (user?.empUnit) {
      // Only set these if we're creating a new PIR
      setUnitOptions([
        { label: user?.unitDisplay || "", value: user?.empUnit || "" },
      ]);
      setUnitData({ unitId: user?.empUnit });
      setPirData((prev) => ({
        ...prev,
        unitId: user?.empUnit,
        unitName: user?.unitDisplay,
        designationId: user?.empDesignation,
        createdBy: user?.createdBy,
        updatedBy: user?.updatedBy,
        designationName: user?.designationDisplay,
        createdByUserRole: user.roleCode,
      }));

      if (user?.empUnit) {
        fetchDepartments(user?.empUnit);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchRiskPotential();
    fetchPreliminaryClassification();
    fetchBodyPartsDetail();
    fetchNatureOfInjuries();
  }, []);

  useEffect(() => {
    saveDraftPir();
  }, [pirData]);

  const fetchDepartments = async (id: string | number) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${id}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((dept: DepartmentData) => ({
          value: dept?.departmentid,
          label: dept?.departmentname,
        }));
        setDepartments(response);
        setDepartmentOptions(options);
      } else {
        setDepartmentOptions([]);
        setDepartments(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchRiskPotential = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_RISK_POTENTIAL + `/get-risks`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((data: any) => ({
          value: `${data?.riskpotential} Risk`,
          label: `${data?.riskpotential} Risk`,
        }));
        setInjuredJobTypeOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchNatureOfInjuries = async () => {
    try {
      const response = await serverRequest(
        {},
        GET_NATURE_OF_INJURIES + `/get-nature-of-injuries`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.injuryType,
          label: data?.injuryType,
        }));
        setInjuryNatureOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchBodyPartsDetail = async () => {
    try {
      const response = await serverRequest(
        {},
        GET_ALL_BODY_PARTS + `/get-body-parts`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.bodyPart,
          label: data?.bodyPart,
        }));
        setBodyPartOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchPreliminaryClassification = async () => {
    try {
      const response = await serverRequest(
        {},
        GET_PRELIMINARY_CLASSIFICATION + `/get-incident-classifications`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        setPrelimClassificOptions(
          response.map((item: any) => ({
            id: item.id,
            value: item.incidentClassification,
            label: item.incidentClassification,
          }))
        );
      }
    } catch (error) {
      console.error("Error Preliminary Classification", error);
    }
  };

  const toggleSection = (index: number) => {
    if (index > currentStatus) return; // block if index > currentStatus

    setOpenSection((prev) => (prev === index ? -1 : index));
  };
  return (
    <>
      {accordionTitles.map((title, index) => {
        if (title === "Details of Injury" && pirData?.injuryHappened === "No")
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
                  <UnitDetails
                    unitData={unitData as UnitDataInterface}
                    setUnitData={setUnitData}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    unitOptions={unitOptions}
                    departmentOptions={departmentOptions}
                    departments={departments}
                    pirData={pirData}
                    setPirData={setPirData}
                  />
                )}
                {index === 1 && (
                  <PreliminaryClassification
                    preliminaryData={preliminaryData}
                    prelimClassificOptions={prelimClassificOptions}
                    setPreliminaryData={setPreliminaryData}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    pirData={pirData}
                    setPirData={setPirData}
                  />
                )}
                {index === 2 && (
                  <IncidentDetails
                    incidentData={incidentData}
                    setIncidentData={setIncidentData}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    pirData={pirData}
                    setPirData={setPirData}
                  />
                )}
                {index === 3 && pirData?.injuryHappened == "Yes" && (
                  <DetailsOfInjury
                    pirData={pirData}
                    setPirData={setPirData}
                    // injuredJobTypeOptions={injuredJobTypeOptions}
                    injuredJobTypeOptions={Array.isArray(injuredJobTypeOptions) ? injuredJobTypeOptions : [injuredJobTypeOptions]}
                    injuryData={injuryData}
                    setInjuryData={setInjuryData}
                    // bodyPartOptions={bodyPartOptions}
                    bodyPartOptions={Array.isArray(bodyPartOptions) ? bodyPartOptions : [bodyPartOptions]}
                    injuryNatureOptions={injuryNatureOptions}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                  />
                )}
                {index === 4 && (
                  <Immediate
                    immediateData={immediateData}
                    departmentOptions={departmentOptions}
                    setImmediateData={setImmediateData}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    pirData={pirData}
                    setPirData={setPirData}
                  />
                )}
                {index === 5 && (
                  <PirSubmit
                    pirData={pirData}
                    pirSubmitData={pirSubmitData}
                    setPirSubmitData={setPirSubmitData}
                    setPirData={setPirData}
                    currentStatus={currentStatus}
                    readOnly={true}
                    pirSubmittedBy={incidentList[0]?.responsiblePerson || user?.name ||""}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                  />
                )}
              </>
            )}
          </div>
        );
      })}
      {openSection == 5 && 
      <div className="actionWrapper ">
        <button
          className="iconBtn orange v2"
          onClick={async() => { await saveDraftPir(); setOpenPreviewModal(true);}}
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
      </div>}
      <CustomModal 
         isOpen={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        bodyClassName="isScrollable"
        title="Preview PIR">
          <>
          {accordionTitles.map((title, index) => {
            if (title === "Details of Injury" && pirData?.injuryHappened === "No") return null;
            return (
              <div className="c-accordion" key={index}>
                <div className="c-accordion__head">
                  <div className="c-accordion__head--title">{title}</div>
                </div>
                <>
                  {index === 0 && (
                    <UnitDetails
                      unitData={unitData as UnitDataInterface}
                      setUnitData={setUnitData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      unitOptions={unitOptions}
                      departmentOptions={departmentOptions}
                      departments={departments}
                      pirData={pirData}
                      setPirData={setPirData}
                      readOnly={true}
                    />
                  )}
                  {index === 1 && (
                    <PreliminaryClassification
                      preliminaryData={preliminaryData}
                      prelimClassificOptions={prelimClassificOptions}
                      setPreliminaryData={setPreliminaryData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      pirData={pirData}
                      setPirData={setPirData}
                      readOnly={true}
                    />
                  )}
                  {index === 2 && (
                    <IncidentDetails
                      incidentData={incidentData}
                      setIncidentData={setIncidentData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      pirData={pirData}
                      setPirData={setPirData}
                      readOnly={true}
                    />
                  )}
                  {index === 3 && pirData?.injuryHappened == "Yes" && (
                    <DetailsOfInjury
                      pirData={pirData}
                      setPirData={setPirData}
                      // injuredJobTypeOptions={injuredJobTypeOptions}
                      injuredJobTypeOptions={Array.isArray(injuredJobTypeOptions) ? injuredJobTypeOptions : [injuredJobTypeOptions]}
                      injuryData={injuryData}
                      setInjuryData={setInjuryData}
                      // bodyPartOptions={bodyPartOptions}
                      bodyPartOptions={Array.isArray(bodyPartOptions) ? bodyPartOptions : [bodyPartOptions]}
                      injuryNatureOptions={injuryNatureOptions}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      readOnly={true}
                    />
                  )}
                  {index === 4 && (
                    <Immediate
                      immediateData={immediateData}
                      departmentOptions={departmentOptions}
                      setImmediateData={setImmediateData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      pirData={pirData}
                      setPirData={setPirData}
                      readOnly={true}
                    />
                  )}
                  {index === 5 && (
                    <PirSubmit
                      pirData={pirData}
                      pirSubmitData={pirSubmitData}
                      setPirSubmitData={setPirSubmitData}
                      setPirData={setPirData}
                      currentStatus={currentStatus}
                      pirSubmittedBy={incidentList[0]?.responsiblePerson || user?.name ||""}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      readOnly={true}
                    />
                  )}
                </>
              </div>
            );
          })}
          <div className="actionWrapper">
            <button
            className="iconBtn orange v2"
            onClick={async() => setOpenPreviewModal(false)}
            type="button"
          >
            <span>Back</span>
          </button>
          <button
            className="iconBtn green v2"
            onClick={publishPir}
            disabled={isPublishing} // disable while submitting
            type="button"
          >
            <span>{isPublishing ? "Publishing..." : "Submit PIR"}</span>
              <Image
                width="15"
                height="15"                
                alt="submit button"
                src="/images/svg/plane_icon_45deg.svg"
                className="img-fluid u-image ms-1"
              />
          </button>
          </div>
          </>
      </CustomModal>
      <ToastContainer position="top-right" autoClose={3000} 
                      hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default ProtectedRoute(PirForm);
