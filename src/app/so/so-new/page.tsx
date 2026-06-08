"use client";
import styles from "./layout.module.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import CustomModal from "@/components/Layouts/CustomModal";
import { useEffect, useRef, useState } from "react";
import InputField from "@/components/Form/InputField";
import UnitInteraction from "./_partials/UnitInteraction";
import Observations from "./_partials/Observations";
import { emptySelector } from "@/config/config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { serverRequest } from "@/services/getServerSideRender";
import { SelectOptions } from "@/components/interfaces";
import AIAssistantDrawer from "./_partials/AIAssistantDrawer";
import type { DocumentProcessResponse } from "./types/ocr.types";
import {
  FETCH_UNITS,
  FETCH_DEPARTMENTS,
  FETCH_SECTIONS,
  FETCH_OBSERVATION_TYPE,  
  FETCH_OBSERVATION_CATEGORY,
  FETCH_RISK_POTENTIAL,
  FETCH_SO,
  BUCKET_URL,
  DOWNLOAD_FILE
} from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import { clearObjectId, setObjectId } from "@/store/slices/soSlice";
import {
  mapOCRObservations,
  mergeObservations,
  cleanDuration,
  parseDate,
  mapOCRMetadataToFormFields,
} from "./utils/ocrDataMapper";

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
  higher_role: string;
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
// export interface SoDetailData {
//   objectId: string;
//   createdat: string; 
//   siNo: string;
//   unit: string;
//   unitDisplay: string;
//   department: string;
//   departmentDisplay: string;
//   sections: string;
//   sectionDisplay: string;
//   locations: string;
//   nameObserver: string;
//   siDate: string; 
//   duration: string;
//   createdby: string;
//   updatedat: string; 
//   updatedby: string;
//   status: string
//   generalComment: string;
//   hod: string;
//   flag: string;
//   idd: number;
//   modulename: string;
//   employetype: string
//   rowIndex: number;
//   userUnit: string;
//   userDepartment: string;
//   userSection: string;
//   os: string;
//   accordionIndex: number;
//   observations: ObservationsDataInterface[];
// }
// interface MasterPayloadSchemaData {
//   objectId: string | null;
//   siNo: string;
//   unit: string;
//   unitDisplay: string;
//   department: string;
//   departmentDisplay: string;
//   sections: string;
//   sectionDisplay: string;
//   locations: string;
//   nameObserver: string;
//   siDate: string;
//   starttime: string;
//   endtime: string;
//   duration: string;
//   createdat: string;
//   createdby: string;
//   updatedat: string;
//   updatedby: string;
//   status: string;
//   generalComment: string;
//   hod: string;
//   flag: string;
//   idd: number;
//   modulename: string;
//   employetype: string;
//   rowIndex: number;
//   scheduleStatus: string;
//   noOfCoobserver: string;
//   userUnit: string;
//   userDepartment: string;
//   userSection: string;
//   os: string;
//   accordionIndex: number;
//   observations: ObservationsDataInterface[];
//   noPeopleObserved: string;
// }

// export interface ObservationsDataInterface {
//   observationType: string;
//   observationTypeDisplay: string;
//   observationSubType: string;
//   observationSubTypeDisplay: string;
//   observationDetail: string;
//   riskPotentials: string;
//   riskPotentialsDisplay: string;
//   createdat: string;
//   createdby: string;
//   updatedat: string;
//   updatedby: string;
//   observationNo: number;
//   rowIndex: number;
//   id: number;
//   status: string;
//   exactLocation: string;
//   actionsTaken: {
//     actionId: string;
//     actionMedia: string;
//     actionMediaType: string;
//     actiontaken: string;
//     actiontakenByUser: string;
//     actionType: string;
//     assignLinemanager: string;
//     capaDepartments: string;
//     cfsaNo: string;
//     cfsaVerifyEmailStatus: string;
//     cfsaVerifyStatus: string;
//     createdat: string;
//     createdby: string;
//     departmentHodName: string;
//     departments: string;
//     emailStatus: string;
//     findings: string;
//     findingFlag: string;
//     flagId: string;
//     flagImage1: string;
//     flagImage2: string;
//     hodRemark: string;
//     imIrFlag: string;
//     imStatus: string;
//     imSubmoduleName: string;
//     linemanagerName: string;
//     observationNo: string;
//     reassignReason: string;
//     responsibleDepartmentName: string;
//     responsibleSectionName: string;
//     rowIndex: number;
//     sectionhead: string;
//     sections: string;
//     siNo: string;
//     status: string;
//     targetdate: string;
//     units: string;
//     updatedat: string;
//     updatedby: string;
//   }[];
//   soImages: {
//     siNo: string;
//     observationNo: string;
//     actionId: number;
//     beforefile: string;
//     beforefileid: string;
//     beforefilename: string;
//     beforeCreatedat: string;
//     beforeCreatedby: string;
//     afterfile: string;
//     afterfileid: string;
//     afterfilename: string;
//     afterCreatedat: string;
//     afterCreatedby: string;
//   }[];
// }

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
  modulename: "SO",
  employetype: "Internal",
  rowIndex: 0,
  scheduleStatus: "",
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
const SoNew = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const objectId = useSelector((state: RootState) => state.so.objectId);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: UserData }
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
  duration: "",
  createdBy: "",
});
  // const [coObserverData, setCoObserverData] = useState(null);
  const [observationData, setObservationData] = useState([]);
  // const [soData, setSOData] = useState<SoDetailData[] | null>(null);
  const [soData, setSOData] = useState(null);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [typeOfObservationsOptions, setTypeOfObservationsOptions] =
    useState(emptySelector);
  // // const [typeOfObservations, setTypeOfObservations] = useState([]);
  const [observationCategoriesOptions, setObservationCategoriesOptions] =
    useState(emptySelector);
  // // const [observationCategories, setObservationCategories] = useState([]);
  // const [observationSubCategoriesOptions, setObservationSubCategoriesOptions] =
    useState(emptySelector);
  // const [observationSubCategories, setObservationSubCategories] = useState([]);
  const [riskPotentialOptions, setRiskPotentialOptions] =
    useState(emptySelector);
  const [riskPotentialList, setRiskPotentialList] = useState([]);
  const [lastOCRResult, setLastOCRResult] = useState<DocumentProcessResponse | null>(null);
  const [ocrDraftFields, setOcrDraftFields] = useState<any>(null);
  const createCaseObjectIdRef = useRef<string | null>(null);
  const accordionTitles = [
    "Unit And SO Details",
    "Observations",
  ];
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [chatExternalMessage, setChatExternalMessage] = useState<{ role: string; content: string; id?: string } | null>(null);
  const [chatSelectedTemplate, setChatSelectedTemplate] = useState<string | null>(null);

  const handleSendToChat = (message: { role: string; content: string }) => {
    // Open the AI assistant if it's not open
    if (!isAIAssistantOpen) {
      setIsAIAssistantOpen(true);
    }
    // Set a new unique message object each time so the useEffect triggers
    setChatExternalMessage({ ...message, id: `ext-${Date.now()}` });
  };

  const fetchExistingSOData = async (id: string) => {
    try {
      const response = await serverRequest(
        {},
        `${FETCH_SO}/get-draft/${user?.createdBy}/${id}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        setSOData(response);        
        setCurrentStatus(response?.accordionIndex ?? 0);
        setOpenSection(response?.accordionIndex ?? 0);
      }
    } catch (error) {
      console.error("Error fetching existing SO data:", error);
    }
  };

  useEffect(() => {
    if (objectId) {
      fetchExistingSOData(objectId ?? " ");
    } else {
      setSOData(mergeWithSchema(masterPayloadSchema, {}));
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

  const saveDraftSO = async () => {
    if (isPublishing || isSavingDraft) return; // Prevent conflict with publish or ongoing draft save
    if (!soData?.unit || !soData?.department || !soData?.sections || !soData?.siDate) return;
    setIsSavingDraft(true);

    const fullPayload = mergeWithSchema(masterPayloadSchema, soData);
    // redux store > ref
    if (objectId) {
      fullPayload.objectId = objectId;
    } else if (createCaseObjectIdRef.current) {
      fullPayload.objectId = createCaseObjectIdRef.current;
    }
    fullPayload.createdBy = user?.createdBy;
    fullPayload.updatedBy = user?.createdBy;

    try {
      const response = await serverRequest(
        fullPayload,
        FETCH_SO + "/save-so",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.objectId && !objectId && !createCaseObjectIdRef.current) {
        createCaseObjectIdRef.current = response.objectId;
        dispatch(setObjectId(response.objectId));
        console.log("SaveDraft ObjectId--", response.objectId);
        // Also update local lwData
        // setSOData((prev: any) => ({
        //   ...prev,
        //   objectId: response.objectId,
        // }));
      }
    } catch (error) {
      console.error("Error saving SO:", error);
    }
    finally {
      setIsSavingDraft(false);
    }
  };
  const removeDraftSO = async (draftId: string) => {
    try {
      await serverRequest(
        {},
        FETCH_SO + `/remove-draft/${user?.createdBy}/${draftId}`,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
    } catch (error) {
      console.error("Error removing SO:", error);
    }
  };
  const publishSO = async () => {
    if (isPublishing || isSavingDraft) return; // stop if any save is in progress
    setIsPublishing(true);
    const fullPayload = mergeWithSchema(masterPayloadSchema, soData);
    if (objectId) {fullPayload.objectId = objectId;}
    else if (createCaseObjectIdRef.current) {fullPayload.objectId = createCaseObjectIdRef.current;}

    fullPayload.createdBy = user?.createdBy;
    fullPayload.updatedBy = user?.createdBy;

    try {
      const response = await serverRequest(
        fullPayload,
        FETCH_SO + "/save-so/publish",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.id) {
        toast.success("SO published successfully");       
        // clear local state and redirect
        dispatch(clearObjectId());
        setTimeout(() => {
          router.push(APP_URL.SAFETY_SO);
        }, 1000);
        return;
      } else {
        toast.error(response?.message || "Publish failed");
        setIsPublishing(false);
      }
    } catch (error) {
      console.error("Error saving SO:", error);      
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
        hod: "",
        siDate: "",
        duration: "",
      });
      setSOData((prev) => ({
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
    if(soData?.unit && soData?.department && soData?.sections && soData?.siDate)
      saveDraftSO();
  }, [soData]);

//   useEffect(() => {
//   if (
//     !isPublishing &&
//     !isSavingDraft &&
//     soData?.unit &&
//     soData?.department &&
//     soData?.sections &&
//     soData?.siDate
//     ) {
//       const timer = setTimeout(() => {
//         saveDraftSO(); // your function to save draft
//       }, 1000); // 1 second debounce

//       return () => clearTimeout(timer); // cleanup on unmount or dependency change
//     }
//  }, [soData, isPublishing, isSavingDraft]);

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
        return options;
      } else {
        setUnitOptions(emptySelector);
        return emptySelector;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return emptySelector;
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
        // setTypeOfObservations(response);
      } else {
        setTypeOfObservationsOptions([]);
        // setTypeOfObservations([]);
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

  const fetchDepartmentsForUnit = async (unitId: string | number) => {
    try {
      if (!unitId) return [];
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${unitId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (Array.isArray(response) && response.length > 0) {
        return response.map((dept: any) => ({
          value: dept.departmentid,
          label: dept.departmentname,
          hod: dept.hod,
        }));
      }
    } catch (error) {
      console.error("Error fetching departments for OCR mapping:", error);
    }
    return [];
  };

  const fetchSectionsForDepartment = async (departmentId: string | number) => {
    try {
      if (!departmentId) return [];
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/get-sections/${departmentId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (Array.isArray(response) && response.length > 0) {
        return response.map((section: any) => ({
          value: section.sectionid,
          label: section.sectionname,
        }));
      }
    } catch (error) {
      console.error("Error fetching sections for OCR mapping:", error);
    }
    return [];
  };

  const normalizeForMatch = (value: any) => {
    if (value === null || value === undefined) return "";
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^a-z0-9 ]/g, "");
  };

  const findMatchingOption = (options: any[], label?: string) => {
    if (!label || !options?.length) return undefined;
    const normalizedLabel = normalizeForMatch(label);
    if (!normalizedLabel) return undefined;

    const exactMatch = options.find(
      (option) =>
        normalizeForMatch(option.label) === normalizedLabel ||
        normalizeForMatch(option.value) === normalizedLabel
    );
    if (exactMatch) return exactMatch;

    const includeMatch = options.find(
      (option) =>
        normalizeForMatch(option.label).includes(normalizedLabel) ||
        normalizeForMatch(option.value).includes(normalizedLabel)
    );
    if (includeMatch) return includeMatch;

    const reverseIncludeMatch = options.find(
      (option) =>
        normalizedLabel.includes(normalizeForMatch(option.label)) ||
        normalizedLabel.includes(normalizeForMatch(option.value))
    );
    if (reverseIncludeMatch) return reverseIncludeMatch;

    const tokens = normalizedLabel.split(" ").filter(Boolean);
    if (tokens.length > 0) {
      const allTokensMatch = options.find((option) => {
        const normalizedOptionLabel = normalizeForMatch(option.label);
        return tokens.every((token) => normalizedOptionLabel.includes(token));
      });
      if (allTokensMatch) return allTokensMatch;
    }

    if (tokens.length > 1) {
      const anyTokenMatch = options.find((option) => {
        const normalizedOptionLabel = normalizeForMatch(option.label);
        return tokens.some((token) => normalizedOptionLabel.includes(token));
      });
      if (anyTokenMatch) return anyTokenMatch;
    }

    return undefined;
  };

  const chooseFirstNonEmpty = (obj: Record<string, any>, keys: string[]) => {
    for (const key of keys) {
      const value = obj[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return String(value).trim();
      }
    }
    return "";
  };

  const normalizeOCRFields = (res: DocumentProcessResponse) => {
    const mappedFields = {
      ...mapOCRMetadataToFormFields(res),
      ...(res.field_mappings || {}),
    };

    return {
      unitDisplay: chooseFirstNonEmpty(mappedFields, [
        "unitDisplay",
        "unit",
        "unitName",
        "unit_name",
        "unitname",
        "site",
        "facility",
      ]),
      departmentDisplay: chooseFirstNonEmpty(mappedFields, [
        "departmentDisplay",
        "department",
        "departmentName",
        "dept",
        "division",
        "department_name",
        "departmentname",
      ]),
      sectionDisplay: chooseFirstNonEmpty(mappedFields, [
        "sectionDisplay",
        "section",
        "sectionName",
        "section_name",
        "visitedSection",
        "visited_section",
        "area",
        "area_name",
      ]),
      hod: chooseFirstNonEmpty(mappedFields, [
        "hod",
        "hodName",
        "headOfDepartment",
        "manager",
        "hod_name",
      ]),
      nameObserver: chooseFirstNonEmpty(mappedFields, [
        "nameObserver",
        "observerName",
        "observer",
        "reportedBy",
        "inspectedBy",
        "observer_name",
      ]),
      siDate: chooseFirstNonEmpty(mappedFields, [
        "siDate",
        "soDate",
        "date",
        "safetyObservationDate",
        "inspectionDate",
      ]),
      duration: chooseFirstNonEmpty(mappedFields, [
        "duration",
        "time",
        "timeSpent",
        "durationOfObservation",
        "inspectionDuration",
      ]),
    };
  };

  const handleOCRResult = async (res: DocumentProcessResponse, includeObservations = true) => {
    if (!res) return;

    // Store OCR result for later use in observations extraction
    setLastOCRResult(res);

    const mappedFields = normalizeOCRFields(res);

    const parsedFields: any = {
      unitDisplay: mappedFields.unitDisplay || "",
      departmentDisplay: mappedFields.departmentDisplay || "",
      sectionDisplay: mappedFields.sectionDisplay || "",
      hod: mappedFields.hod || "",
      nameObserver: mappedFields.nameObserver || "",
      siDate: parseDate(mappedFields.siDate || ""),
      duration: cleanDuration(mappedFields.duration || ""),
    };

    let unitOption = findMatchingOption(unitOptions, parsedFields.unitDisplay);
    if (!unitOption && parsedFields.unitDisplay) {
      // try fetching units immediately and retry matching
      const fetchedUnits = await fetchUnits();
      unitOption = findMatchingOption(fetchedUnits || [], parsedFields.unitDisplay);
    }
    if (unitOption) {
      parsedFields.unit = unitOption.value;
      parsedFields.unitDisplay = unitOption.label;
    }

    if (unitOption && parsedFields.departmentDisplay) {
      const departmentOptions = await fetchDepartmentsForUnit(unitOption.value);
      const departmentOption = findMatchingOption(
        departmentOptions,
        parsedFields.departmentDisplay
      );
      if (departmentOption) {
        parsedFields.department = departmentOption.value;
        parsedFields.departmentDisplay = departmentOption.label;
        parsedFields.hod = parsedFields.hod || departmentOption.hod || "";
      }

      if (departmentOption && parsedFields.sectionDisplay) {
        const sectionOptions = await fetchSectionsForDepartment(departmentOption.value);
        const sectionOption = findMatchingOption(
          sectionOptions,
          parsedFields.sectionDisplay
        );
        if (sectionOption) {
          parsedFields.sections = sectionOption.value;
          parsedFields.sectionDisplay = sectionOption.label;
        }
      }
    }

    setSOData((prev: any) => {
      const next = {
        ...(prev || mergeWithSchema(masterPayloadSchema, {})),
        ...parsedFields,
      };

      if (includeObservations) {
        const mappedObservations = mapOCRObservations(res.observations || []);
        next.observations = mergeObservations(prev?.observations || [], mappedObservations);
      }

      return next;
    });

    setUnitData((prev) => ({
      ...prev,
      ...parsedFields,
    }));
  };

  const handleObservationOCRResult = async (res: DocumentProcessResponse) => {
    if (!res) return;
    
    // Map only metadata and unit-level fields; keep observations as a review draft.
    await handleOCRResult(res, false);
    
    const mappedObservations = mapOCRObservations(res.observations || []);
    if (mappedObservations.length > 0) {
      // Pass the first observation to pre-fill the form draft instead of adding directly
      setOcrDraftFields(mappedObservations[0]);
    }
  };
  useEffect(() => {
    const syncOCRFieldsToOptions = async () => {
      if (!soData) return;

      const updates: any = {};
      const shouldMatchUnit = !!soData.unitDisplay && !soData.unit;
      const unitOption = shouldMatchUnit
        ? findMatchingOption(unitOptions, soData.unitDisplay)
        : findMatchingOption(unitOptions, soData.unitDisplay || "");

      if (unitOption && unitOption.value !== soData.unit) {
        updates.unit = unitOption.value;
        updates.unitDisplay = unitOption.label;
      }

      if (unitOption && soData.departmentDisplay && !soData.department) {
        const departmentOptions = await fetchDepartmentsForUnit(unitOption.value);
        const departmentOption = findMatchingOption(
          departmentOptions,
          soData.departmentDisplay
        );
        if (departmentOption) {
          updates.department = departmentOption.value;
          updates.departmentDisplay = departmentOption.label;
          updates.hod = updates.hod || soData.hod || departmentOption.hod || "";
        }

        if (departmentOption && soData.sectionDisplay && !soData.sections) {
          const sectionOptions = await fetchSectionsForDepartment(
            departmentOption.value
          );
          const sectionOption = findMatchingOption(
            sectionOptions,
            soData.sectionDisplay
          );
          if (sectionOption) {
            updates.sections = sectionOption.value;
            updates.sectionDisplay = sectionOption.label;
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        setSOData((prev: any) => ({ ...prev, ...updates }));
        setUnitData((prev) => ({ ...prev, ...updates }));
      }
    };

    syncOCRFieldsToOptions();
  }, [unitOptions, soData?.unitDisplay, soData?.departmentDisplay, soData?.sectionDisplay, soData?.unit]);

  // Auto-open AI assistant when moving to observations section after unit details saved
  useEffect(() => {
    if (currentStatus === 1 && lastOCRResult && !isAIAssistantOpen) {
      setIsAIAssistantOpen(true);
    }
  }, [currentStatus, lastOCRResult]);

  const toggleSection = (index: number) => {
    if (index > currentStatus) return; // block if index > currentStatus
    setOpenSection((prev) => (prev === index ? -1 : index));
  };
  // const handlePreview = () => {
  //   if(soData?.observations && soData?.observations?.length > 0) {
  //     setIsPreviewActive(true);
  //   }
  // };

  const [isViewActionOpen, setIsViewActionOpen] = useState(false);
  const [actionsForView, setActionsForView] = useState([]);
  const [imagesForView, setImagesForView] = useState([]);

  const handleObservationView = async (row) => {
    setActionsForView(row.actionsTaken);
    setImagesForView(row.soImages);
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
  <div className={styles.layoutContainer} style={{ minHeight: "100vh", alignItems: "stretch" }}>
    {/* Main content area */}
    <div className={styles.mainContent}>
      <div>
        <div className="container-fluid">
          <div className="admin-boxContainer d3">
            <div className="adminAction">
              <Link href={APP_URL.SAFETY_SO} className="adminAction__title">
                <span className="icon">
                  <img
                    width="15"
                    height="15"
                    alt="icon"
                    src="/images/svg/arrow-left-grey.svg"
                    className="img-fluid u-image"
                  />
                </span>
                Manage SO
              </Link>
              <button
  type="button"
  onClick={() => setIsAIAssistantOpen(true)}
  style={{
    marginLeft: "12px",
    padding: "6px 14px",
    fontSize: "13px",
    background: "linear-gradient(135deg, #1d9e75, #185fa5)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
    whiteSpace: "nowrap",
    flexShrink: 0,
  }}
>
  🚀 Velocity Jinsafe
</button>
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
                    disabled={index > currentStatus}
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
                        soData={soData}
                        setSOData={setSOData}
                      />
                    )}
                    {index === 1 && (
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
                        soData={soData}
                        setSOData={setSOData}
                        setIsPreviewActive={setIsPreviewActive}
                        ocrDraftFields={ocrDraftFields}
                        onSendToChat={handleSendToChat}
                        chatSelectedTemplate={chatSelectedTemplate}
                        clearChatSelectedTemplate={() => setChatSelectedTemplate(null)}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    {/* AI Chatbot drawer — flex sibling so main content slides */}
    <div className={`${styles.drawerWrapper} ${isAIAssistantOpen ? styles.drawerOpen : ""}`}>
  <AIAssistantDrawer
    onClose={() => setIsAIAssistantOpen(false)}
    onExtract={handleOCRResult}
    onObservationExtract={handleObservationOCRResult}
    onTemplateSelect={(t) => setChatSelectedTemplate(t)}
    currentStage={currentStatus === 1 ? "observations" : "unit-details"}
    lastOCRResult={lastOCRResult}
    externalMessage={chatExternalMessage}
  />
</div>
  </div>
      <CustomModal isOpen={isPreviewActive} onClose={() => {setIsPreviewActive(false)}} title="Preview SO Form">
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
                value={soData?.unitDisplay || ""}
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
                value={soData?.departmentDisplay || ""}
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
                value={soData?.sectionDisplay || ""}
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
                value={soData?.hod || ""}
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
                value={soData?.siDate || ""}
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
                value={soData?.duration || ""}
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
                value={soData?.nameObserver || ""}
                disabled={true}
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
                      {soData?.observations?.length > 0 ? (
                        soData?.observations.map((row, index) => (
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
        <div className="actionWrapper">
          <button
            className="iconBtn orange v2"
            onClick={() => {setIsPreviewActive(false)}}
            type="button"
          >
            <span>Edit SO Form</span>
            <Image
              width={15}
              height="15"
              alt="icon"
              className="img-fluid u-image"
              src="/images/svg/edit-icon.svg"
            />
          </button>
          
          <button
            className="iconBtn blue v2"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", color: "white" }}
            onClick={() => setIsAIAssistantOpen(true)}
            type="button"
          >
            <span>Ask AI</span>
            <span style={{ marginLeft: "8px", fontSize: "16px" }}>✨</span>
          </button>
          <button
            className="iconBtn green v2"
            onClick={publishSO}
            type="button"
            disabled={isPublishing} // disable while submitting
          >
            <span>{isPublishing ? "Publishing..." : "Submit SO"}</span>
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

export default ProtectedRoute(SoNew);
