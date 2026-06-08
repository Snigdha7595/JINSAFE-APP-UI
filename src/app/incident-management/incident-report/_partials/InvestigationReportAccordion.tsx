"use client";
import { useFormik } from "formik";
import { useEffect, useRef, useState, useMemo } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import UploadFieldV2 from "@/components/Form/UploadFieldV2";
import Link from "next/link";
import Image from "next/image";
import { useModalManager } from "@/hooks/useModalManager";
import { serverRequest } from "@/services/getServerSideRender";
import { BUCKET_URL, DELETE_FILE, DOWNLOAD_FILE, GET_NATURE_OF_INJURIES, FETCH_LINEMANAGER, FETCH_SECTIONS, GET_ALL_BODY_PARTS, SEARCH_INDIVIDUAL, UPLOAD_FILE } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUser, selectUserToken } from "@/store/slices/authSlice";
import { SelectOptions } from "@/components/interfaces";
import { emptySelector } from "@/config/config";
import { RootState } from "@/store/store";
import CustomModal from "@/components/Layouts/CustomModal";
import KeyFindings from "./KeyFindings";
import Chronology from "./Chronology";
// import MultiSelectDropdown from "../../../../components/Form/MultiSelectDropdown";
// import WhyWhyChart from "../../../../components/WhyWhyChart";
import WhyWhyAnalysis, { WhyNodeData } from './WhyWhyAnalysis';
import dayjs from "dayjs";
import MultiSelectField from "@/components/Form/MultiSelectField";
import * as Yup from "yup";
import { INVESTIGATION } from "@/config/apiConfig";
// import MultiFileUploader from "@/components/Form/MultiFileUploader";
import { toast, ToastContainer } from "react-toastify";
import { clearObjectId } from "@/store/slices/investigationSlice";
import InteractedPerson from "./InteractedPerson";
import RecordViewed from "./RecordViewed";

const injuredEmployeeTypeOptions = [
  { value: "Internal", label: "Internal" },
  { value: "External", label: "External" },
  { value: "Contractor", label: "Contractor" },
  { value: "Others", label: "Others" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Others", label: "Others" },
];

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (text.charAt(maxLength) === ' ') {
        return truncated + "...";
    }
    
    if (lastSpace === -1) {
        return truncated + "...";
    }
    
    return text.substring(0, lastSpace) + "...";
}

interface SupportingEvidenceItem {
  supportEvidenceId?: number;
  evidenceType?: string;
  evidenceName: string;
  evidenceSize?: string;
  fileId: string;
  pirId?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  evidenceDescription: string;
  evidenceThumbnail?: string;
}

type InjuryDetails = {
  injuryId?: number;
  employeeType: string;
  employeeId: string;
  injuredName: string;
  gender: string;
  designation: string;
  address: string;
  incidentLastDate: string | null;
  bodyParts: string;
  natureOfInjuries: string;
  jobType: string;
  nameOfEmployer?: string;
  bodyPartList: Array<{
    id?: number;
    bodyPart: string;
    employeeId: string;
    pirId: string;
    createdAt: string;
    createdBy: string;
    natureOfInjury: string;
    flagInjuryId: number;
    irStatus: string;
    hodRemark: string;
    rowIndex: number;
  }>;
  pirId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  rowIndex: number;
  flagInjuryId: number;
  irStatus: string;
  hodRemark: string;
};

type Facts = {
  keyId?: number;
  keyFinding: string;
  createdAt: Date | string | null;
  createdBy: string;
  pirId: string;
  updatedAt: Date | string | null;
  updatedBy: string;
};

type Chronology = {
  chronologyId?: number;
  chronologyDate: Date | null;
  chronologyTime: Date | null;
  chronologyActivity: string;
  chronologyRemark: string;
  createdAt: Date | string | null;
  createdBy: string;
  pirId: string;
  updatedAt: Date | string | null;
  updatedBy: string
};

type RecordSection = {
  recordId?: number;
  recordViewed: string;
};

type InteractedSection = {
  personId?: number;
  interactedEmployeeType: SelectOptions | null;
  interactedEmployeeId: string;
  interactedEmail: string;
  interactedName: string;
  interactedDesignation: string;
  interactedDept: string;
};

type RecommendationSection = {
  pirId: string;
  actiontaken: string;
  actionId?: number;
  actiontaken: string;
  createdat: string;
  createdby: string;
  updatedat: string;
  updatedby: string;
  targetdate: string | null;
  status: string;
  imSubmoduleName: string;
  units: string;
  departments: string;
  responsibleDepartmentName: string;
  sections: string;
  responsibleSectionName: string;
  sectionhead: string;
  assignLinemanager: string;
  linemanagerName: string;
  findingFlag: number;
  finding: string;
};

interface InvestigationReportAccordionProps {
  readOnly?: boolean;
  injuryData: any;
  injuredJobTypeOptions: SelectOptions[];
  setInjuryData: (data: any) => void;
  currentStatus: number;
  isSubmitCase?: boolean;
  setSubmitCase?: (x: boolean) => void;
  bodyPartOptions?: SelectOptions[];
  departmentOptions: SelectOptions[];
  setDepartmentOptions: any;
  injuryNatureOptions: SelectOptions[];
  setCurrentStatus?: (status: number) => void;
  setOpenSection?: (section: number) => void;
  pirData?: any;
  reportData?: any,
  teamMembers: any,
  immedActions: any,
  rootCausesData: any,
  setPirData?: (data: any) => void;
  supportingEvidences?: any[];
  costInRupees?: string,
  costOfIncident?: string,
  costOfIncidentText?: string,
}

const InvestigationReportAccordion = ({
  pirData,
  reportData,
  teamMembers,
  immedActions,
  rootCausesData,
  isSubmitCase,
  setSubmitCase,
  // bodyPartOptions,
  setPirData,
  injuredJobTypeOptions,
  departmentOptions,
  // setDepartmentOptions,
  injuryNatureOptions,
  readOnly = false,
  // setCurrentStatus,
  // setOpenSection
  costInRupees,
  costOfIncident,
  costOfIncidentText,
}: InvestigationReportAccordionProps) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector((state: RootState) => state.auth as { user: any });
  const pirId = useSelector((state: RootState) => state.pir.pirId);
  const responsiblePersonId = useSelector((state: RootState) => state.pir.responsiblePersonId);
  const [accordionIndexFromWhyWhy, setAccordionIndexFromWhyWhy] = useState<number | null>(null);
  const [currentEvidenceDescription, setCurrentEvidenceDescription] = useState<string>("");
  const [currentInjuryIndex, setCurrentInjuryIndex] = useState<number>(-1);
  const [employeeType, setEmployeeType] = useState<SelectOptions | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [injuredName, setInjuredName] = useState("");
  const [gender, setGender] = useState<SelectOptions | null>(null);
  const [designation, setDesignation] = useState("");
  const [address, setAddress] = useState("");
  const [incidentLastDate, setIncidentLastDate] = useState<any>(null);
  const [bodyPartListOptions, setBodyPartListOptions] = useState<SelectOptions[]>(emptySelector);
  const [bodyParts, setBodyParts] = useState<SelectOptions | null>(null);
  const [injuryNature, setInjuryNature] = useState<SelectOptions[]>([]);
  const [natureOfInjuriesOptions, setNatureOfInjuriesOptions] = useState<SelectOptions[]>(emptySelector);
  const [chronologyFiles, setChronologyFiles] = useState<any | []>([]);
  const [rootCauseFiles, setRootCauseFiles] = useState<any | []>([]);
  const [isChronologyUploaded, setIsChronologyUploaded] = useState(false);
  const [isRootCauseUploaded, setIsRootCauseUploaded] = useState(false);
  const [isRootCauseAdded, setIsRootCauseAdded] = useState(false);
  const [whyWhyPayload, setWhyWhyPayload] = useState<any[]>([])
  const [formPreviewed, setFormPreviewed] = useState(false);
  
  const [jobType, setJobType] = useState<SelectOptions | null>(null);
  const [nameOfEmployer, setNameOfEmployer] = useState("");
  const [rows, setRows] = useState<any[]>([{ bodyPart: null, injuryNature: [], isOpen: false }]);
  const [finding, setFinding] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editFinding, setEditFinding] = useState("");
  const [chronology, setChronology] = useState<Chronology[]>([]);
  const [rootCauseRfAdded, setRootCauseRfAdded] = useState<any | []>([]);
  const [editingChronologyIndex, setEditingChronologyIndex] = useState<number | null>(null);
  const [editChronologyDate, setEditChronologyDate] = useState<Date | null>(null);
  const [editChronologyTime, setEditChronologyTime] = useState<Date | null>(null);
  const [editChronologyActivity, setEditChronologyActivity] = useState<string>("");
  const [editChronologyRemark, setEditChronologyRemark] = useState<string>("");
  const [chronologyDate, setChronologyDate] = useState<Date | null>(null);
  const [chronologyTime, setChronologyTime] = useState<Date | null>(null);
  const [chronologyActivity, setChronologyActivity] = useState("");
  const [chronologyRemark, setChronologyRemark] = useState("");
  const [recordViewed, setRecordViewed] = useState("");
  // const [recordSection, setRecordSection] = useState<RecordSection[]>([]);
  // const [interactedSection, setInteractedSection] = useState<InteractedSection[]>([]);
  const [interactedEmployeeType, setInteractedEmployeeType] = useState<SelectOptions | null>(null);
  const [interactedEmployeeId, setInteractedEmployeeId] = useState("");
  const [interactedName, setInteractedName] = useState("");
  const [interactedEmail, setInteractedEmail] = useState("");
  const [interactedDesignation, setInteractedDesignation] = useState("");
  const [interactedDept, setInteractedDept] = useState<string | null>(null);
  const [recmdFinding, setRecmdFinding] = useState("");
  const [recmd, setRecmd] = useState("");
  const [recmdDept, setRecmdDept] = useState("");
  const [recmdDeptName, setRecmdDeptName] = useState("");
  const [recmdDeptId, setRecmdDeptId] = useState<string | number>("");
  const [recmdSectionName, setRecmdSectionName] = useState("");
  const [recmdSectionHead, setRecmdSectionHead] = useState("");
  const [recmdLineManager, setRecmdLineManager] = useState("");
  const [recmdLineManagerId, setRecmdLineManagerId] = useState("");
  const [recmdTargetDate, setRecmdTargetDate] = useState<Date | null>(null);
  const [recmdSection, setRecmdSection] = useState("");
  // const [injuredBodyParts, setInjuredBodyParts] = useState<SelectOptions | null>(null);
  // const [injuryNature, setInjuryNature] = useState<SelectOptions[]>([]);
  // const [rows, setRows] = useState("");
  // const [currentInjuryIndex, setCurrentInjuryIndex] = useState<number>(-1);
  // const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [lineManagerOptions, setLineManagerOptions] = useState<SelectOptions[] | null>(null);
  const [sectionOptions, setSectionOptions] = useState<SelectOptions[] | null>(emptySelector);
  const { modals, openModal, closeModal } = useModalManager([
    "AddInjuryDetails",
    "teamMembersModal",
    "AddKey",
    "AddChronologyForm",
    "AddOtherFields",
    "AddRecordSection",
    "AddInteractedSection",
    "AddRecommendationSection",
    "conductWhyWhySection",
    "AddRootCase",
    "EditRootCause",
    "PreventiveCorrectiveAction",
  ] as const);

  const whyWhyInitialData: WhyNodeData = {
    id: "root",
    label: "",
    status: "new",
    isDiscarded: false,
    children: [],
  };

  const [supportingEvidence, setSupportingEvidence] = useState({
    evidenceType: "",
    evidenceName: "",
    evidenceSize: "",
    fileId: "",
    pirId: "",
    createdAt: "",
    createdBy: "",
    updatedAt: "",
    updatedBy: "",
    evidenceDescription: "",
    evidenceThumbnail: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [supportingEvidences, setSupportingEvidences] = useState([]);
  const [chronologyBlobUrl, setChronologyBlobUrl] = useState<string | null>(null);
  const [rootCauseBlobUrl, setRootCauseBlobUrl] = useState<string | null>(null);
  const [fileBlobCache, setFileBlobCache] = useState<Record<string, string>>({});
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [evidenceBlobUrls, setEvidenceBlobUrls] = useState({});
  const handleImageError = (fileId) => {
      if (fileId) {
          fetchFileAsBlob(fileId, {
              storeInMap: true
          }).catch(() => {
              console.error(`Permanently failed to load image for ${fileId}`);
          });
      }
  };
  const handleTreeChange = (tree: WhyNodeData) => {
    formik.setFieldValue('rootCausesData', tree)
  };

  const fetchEmployeeDetails = async (email: string) => {
    try { 
      const response = await serverRequest(
        {},
        SEARCH_INDIVIDUAL + `/email/${email}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      ); 
      if (response) {
        const empData = response;
        setInteractedEmployeeId(empData?.empId || "");
        setInteractedName(empData?.empName || "");
        setInteractedDesignation(empData?.empDesignation || "");
        setInteractedDept(empData?.empDepartment || "");
      }} catch(error){
        console.error("Error fetching member detail:", error);
      } };

  const fetchSections = async (departmentId: string | number) => {
        try {
          const response = await serverRequest(
            {},
            FETCH_SECTIONS + `/get-sections/${departmentId}`,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            token
          );
          if (response?.length > 0) {
            const options = response?.map((sect: any) => ({value: sect?.sectionid, label: sect?.sectionname}))
            setSectionOptions(options)
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

    const fetchSectionHead = async (sectionId: string | number, departmentId: string | number, unitId: string | number) => {
          try {
            const response = await serverRequest(
              {},
              FETCH_SECTIONS + `/${unitId}/${departmentId}/${sectionId}`,
              CONSTANTS.REQUEST_GET,
              true,
              true,
              token
            );
            if (response?.sectionHead) {
              setRecmdSectionHead(response.sectionHead?.linemanagerName)
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
          
  const fetchLineManagers = async (departmentId: string | number, sectionId: string | number) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_LINEMANAGER + `/get-line-managers/${departmentId}/active/${sectionId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      
      if (response?.length > 0) {
        const options = response.map((manager: any) => ({value: manager?.jsplid, label: manager?.linemanagerName}))
        setLineManagerOptions(options)
      } else {
        setLineManagerOptions(emptySelector)
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const nowIso = new Date().toISOString();

  const parseIncidentTime = (value) => {
    if (!value) return null;
    // Case 1: Full ISO datetime
    if (value.includes('T')) {
      return new Date(value);
    }
    // Case 2: Time only (HH:mm or HH:mm:ss)
    return new Date(`1970-01-01T${value}:00`);
  };

  const initialValues = {
    injuries: pirData?.injuries || [],
    recordSection: pirData?.recordsViewed?.map(r => ({recordViewed: r.recordViewed})) || [],
    keyFindings: pirData?.keyFindings || [],
    briefDescription: pirData?.briefDescription || "",
    similarIncident: pirData?.similarIncident || reportData?.similarIncident || "",
    interactedSection: pirData?.personsInteracted?.map(p => ({
      interactedEmployeeType: injuredEmployeeTypeOptions.find(opt => opt.value === p.empType) || null,
      interactedEmployeeId: p.employeeId || "",
      interactedEmail: p.empEmail || "",
      interactedName: p.empName || "",
      interactedDesignation: p.empDesignationName || "",
      interactedDept: p.empDepartmentName || ""
    })) || [],
    immediateActions: [],
    lastDateOfIncident: pirData?.lastDateOfIncident ? pirData?.lastDateOfIncident : null,
    incidentInitiatedDate: pirData?.incidentInitiatedDate ? pirData?.incidentInitiatedDate : null,
    incidentInitiatedTime: pirData?.incidentInitiatedTime ? parseIncidentTime(pirData?.incidentInitiatedTime) : null,
    supportingEvidences: pirData?.supportingEvidences ? pirData?.supportingEvidences : [],
  };

  const validationSchema = Yup.object().shape({});

  const resetInjuryForm = () => {
    setEmployeeType(null);
    setEmployeeId("");
    setInjuredName("");
    setGender(null);
    setAddress("");
    setDesignation("");
    setBodyParts(null);
    setInjuryNature([]);
    setJobType(null);
    setNameOfEmployer("");
    setIncidentLastDate(null);
    setCurrentInjuryIndex(-1);
    setRows([{ bodyPart: null, injuryNature: [], isOpen: false }]);
  };

  const handleFileDelete = async (fileId: any, triggeredFrom) => {
    try {
      const response = await serverRequest(
        [fileId],
        DELETE_FILE,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      )

      if(response.success){
        if(triggeredFrom == "chronologyFile"){
          setIsChronologyUploaded(false)
          setChronologyFiles(null)
        }
        if(triggeredFrom == "rootCauseFile"){
          setIsRootCauseUploaded(false)
          setRootCauseFiles(null)
        }
      }
    } catch(err) {
      toast.error('Could not delete file')
      console.log(`Error: ${err}`)
    }
  }

  const handleAddInjuries = (values: any, setFieldValue: any) => {
  const validRows = rows.filter(
    (row) => row.bodyPart && row.injuryNature?.length > 0
  );
  if (validRows?.length === 0) return;

  const currentInjuries = Array.isArray(values?.injuries) ? values.injuries : [];
  
  let flagInjuryId;

  if (currentInjuryIndex === -1) {
    if (currentInjuries?.length === 0) {
      flagInjuryId = 1;
    } else {
      const maxFlagId = Math.max(...currentInjuries.map((inj: any) => 
        Number(inj.flagInjuryId) || 0
      ));
      flagInjuryId = maxFlagId + 1;
    }
  } else {
    flagInjuryId = currentInjuries[currentInjuryIndex]?.flagInjuryId || 1;
  }

  const bodyParts = validRows?.map((r) => r.bodyPart?.label).filter(Boolean).join(", ");
  const natureOfInjuries = validRows
    ?.map((r) => r.injuryNature?.map((n) => n.label).join(", "))
    .filter(Boolean)
    .join(", ");

  const newInjuryDetail: InjuryDetails = {
    employeeType: employeeType.value,
    employeeId: employeeId,
    injuredName,
    gender: gender.value,
    designation,
    address: address,
    incidentLastDate: incidentLastDate ? dayjs(incidentLastDate).format("YYYY-MM-DD") : null,
    bodyParts,
    natureOfInjuries,
    jobType: jobType.value,
    nameOfEmployer,
    bodyPartList: validRows?.map((r, i) => ({
      bodyPart: r.bodyPart?.label || "",
      employeeId: employeeId,
      pirId: pirId,
      createdAt: dayjs().toISOString(),
      createdBy: user?.createdBy || "",
      natureOfInjury: r.injuryNature?.map((n) => n.label).join(", "),
      flagInjuryId: flagInjuryId,
      irStatus: "Active",
      hodRemark: "",
      rowIndex: i,
    })),
    pirId: pirId,
    createdAt: new Date().toISOString(),
    createdBy: user?.createdBy || "",
    updatedAt: new Date().toISOString(),
    updatedBy: user?.updatedBy || "",
    rowIndex: currentInjuryIndex === -1 ? currentInjuries?.length : currentInjuryIndex,
    flagInjuryId: flagInjuryId,
    irStatus: "Active",
    hodRemark: "",
  };

  const updatedInjuries = [...currentInjuries];
  if (currentInjuryIndex === -1) {
    updatedInjuries.push(newInjuryDetail);
  } else {
    updatedInjuries[currentInjuryIndex] = newInjuryDetail;
  }

  setFieldValue("injuries", updatedInjuries);
  resetInjuryForm();
  closeModal("AddInjuryDetails");
}; 

  const removeInjuryDetails = (index: number, values: any) => {
    // Ensure values.injuries exists and is an array
    const currentInjuries = Array.isArray(values?.injuries) ? values.injuries : [];
    const updatedInjuries = [...currentInjuries];
    updatedInjuries.splice(index, 1);
    formik.setFieldValue("injuries", updatedInjuries);
  };

  const editInjuryDetail = (index: number, injury: any) => {
    setCurrentInjuryIndex(index);
    setEmployeeType(injuredEmployeeTypeOptions.find(opt => opt.value === injury.employeeType) || null);
    setEmployeeId(injury.employeeId);
    setInjuredName(injury.injuredName);
    setGender(genderOptions.find(opt => opt.value === injury.gender) || null);
    setDesignation(injury.designation);
    setAddress(injury.address);
    setIncidentLastDate(injury.incidentLastDate ? new Date(injury.incidentLastDate) : null);
    // Convert the injury data into rows format
    const injuryRows = injury.bodyPartList?.map((bodyPartItem: any) => {
      const bodyPartOption = bodyPartListOptions.find(opt => opt.value === bodyPartItem.bodyPart) || null;
      const natureOptions = bodyPartItem.natureOfInjury 
        ? bodyPartItem.natureOfInjury.split(", ")?.map((nature: string) => 
            natureOfInjuriesOptions.find(opt => opt.label === nature) || { value: nature, label: nature }
          ).filter(Boolean)
        : [];
        return {
          bodyPart: bodyPartOption,
          injuryNature: natureOptions,
          isOpen: false
        };
    });

    setRows(injuryRows);  
    setJobType(injuredJobTypeOptions.find(opt => opt.value === injury.jobType) || null);
    setNameOfEmployer(injury.nameOfEmployer || "");
    openModal("AddInjuryDetails");
  };

const addFacts = (values: any, setFieldValue: any) => {
  if (!finding) return;
  const newFact: Facts = {
    createdAt: new Date(),
    createdBy: user?.createdBy,
    keyFinding: finding,
    pirId: pirData?.pirId || '',
    updatedAt: new Date(),
    updatedBy: user?.updatedBy
  };
  const currentFacts = Array.isArray(values?.keyFindings) ? values.keyFindings : [];
  const updatedFacts = [...currentFacts, newFact];
  setFieldValue("keyFindings", updatedFacts);
  setFinding("");
};

const updateFacts = (index, updatedFinding, values, setFieldValue) => {
  const updatedFacts = values.keyFindings?.map((fact, i) =>
    i === index ? { ...fact, keyFinding: updatedFinding, createdAt: fact.createdAt,
    createdBy: user.createdBy,
    pirId: pirData?.pirId || '',
    updatedAt: new Date(),
    updatedBy: user?.updatedBy } : fact
  );
  setFieldValue('keyFindings', updatedFacts);
  setEditingIndex(null);
  setEditFinding("");
};

const removefacts = (index: number, values: any, setFieldValue: any) => {
  const currentFacts = Array.isArray(values?.keyFindings) ? values.keyFindings : [];
  const updatedFacts = [...currentFacts];
  updatedFacts.splice(index, 1);
  
  setFieldValue("keyFindings", updatedFacts);
};

const addChronology = (values: any, setFieldValue: any) => {
  const newChronology: Chronology = {
    chronologyDate,
    chronologyActivity,
    chronologyTime,
    chronologyRemark,
    createdAt: new Date(),
    createdBy: user?.createdBy || '',
    pirId: pirData.pirId,
    updatedAt: new Date(),
    updatedBy: user?.updatedBy,
  };
  const currentChronology = Array.isArray(chronology) ? chronology : [];
  const updatedChronology = [...currentChronology, newChronology];
  
  setChronology(updatedChronology)
  
  setChronologyDate(null);
  setChronologyTime(null);
  setChronologyActivity("");
  setChronologyRemark("");
};

const updateChronology = (index: number, values: any, setFieldValue: any) => {
  const updatedChronology = chronology?.map((item: any, i: number) =>
    i === index ? {
      ...item,
      chronologyDate: editChronologyDate,
      chronologyTime: editChronologyTime,
      chronologyActivity: editChronologyActivity,
      chronologyRemark: editChronologyRemark,
      createdAt: new Date(),
      createdBy: user?.createdBy || '',
      pirId: pirData.pirId,
      updatedAt: new Date(),
      updatedBy: user?.updatedBy,
    } : item
  );
  
  setChronology(updatedChronology)
  setEditingChronologyIndex(null);
  resetChronologyFields();
};

const resetChronologyFields = () => {
  setChronologyDate(null);
  setChronologyTime(null);
  setChronologyActivity("");
  setChronologyRemark("");
  setEditChronologyDate(null);
  setEditChronologyTime(null);
  setEditChronologyActivity("");
  setEditChronologyRemark("");
};

const removechronology = (index: number, values: any, setFieldValue: any) => {
  const currentChronology = Array.isArray(chronology) ? chronology : [];
  const updatedChronology = [...currentChronology];
  updatedChronology.splice(index, 1);
  // setFieldValue("chronology", updatedChronology);
  setChronology(updatedChronology)
};

  const addRecords = () => {
    const currentRecords: RecordSection[] = Array.isArray(formik.values.recordSection)
      ? formik.values.recordSection
      : [];
    const newRecord: RecordSection = { recordViewed };
    const updatedRecords = [...currentRecords, newRecord];
    formik.setFieldValue("recordSection", updatedRecords);
    setRecordViewed("");
  };

  const removeRecord = (index: number) => {
    const currentRecords = Array.isArray(formik.values?.recordSection) ? formik.values.recordSection : [];
    const updatedRecords = [...currentRecords];
    updatedRecords.splice(index, 1);
    formik.setFieldValue("recordSection", updatedRecords);
  };

  const addInteraction = (values: any, setFieldValue: any) => {
    if (!interactedEmployeeType) return;
  
    const newInteraction: InteractedSection = {
      interactedEmployeeType,
      interactedEmployeeId,
      interactedEmail,
      interactedName,
      interactedDesignation,
      interactedDept,
    };
  
    const currentInteractions = Array.isArray(values?.interactedSection) ? values.interactedSection : [];
    const updatedInteractions = [...currentInteractions, newInteraction];
    setFieldValue("interactedSection", updatedInteractions);
    
    setInteractedEmployeeType(null);
    setInteractedDesignation("");
    setInteractedEmail("");
    setInteractedName("");
    setInteractedDept(null);
    setInteractedEmployeeId("");
    closeModal("AddInteractedSection");
  };
  
  const removeInteracted = (index: number, values: any, setFieldValue: any) => {
    const currentInteractions = Array.isArray(values?.interactedSection) ? values.interactedSection : [];
    const updatedInteractions = [...currentInteractions];
    updatedInteractions.splice(index, 1);
    setFieldValue("interactedSection", updatedInteractions);
  }

  const addRecommendation = (values: any, setFieldValue: any) => {
    if (
      !recmd || 
      !recmdDept || 
      !recmdSection || 
      !recmdSectionHead || 
      !recmdLineManager || 
      !recmdTargetDate
    ) {
      return;
    }
  
    const newRec: RecommendationSection = {
      pirId: pirData?.pirId,
      actiontaken: recmd,
      createdat: new Date().toISOString(),
      createdby: user?.createdBy,
      updatedat: new Date().toISOString(),
      updatedby: user?.updatedBy,
      targetdate: recmdTargetDate ? dayjs(recmdTargetDate).format("YYYY-MM-DD") : null,
      status: 'Pending',
      imSubmoduleName: 'Incident Report',
      units: pirData?.unitId.toString(),
      departments: recmdDeptId.toString(),
      responsibleDepartmentName: recmdDeptName,
      sections: recmdSection,
      responsibleSectionName: recmdSectionName,
      sectionhead: recmdSectionHead,
      assignLinemanager: recmdLineManagerId,
      linemanagerName: recmdLineManager,
      findingFlag: 0,
      finding: recmdFinding || "",
    };
  
    const currentRecommendations = Array.isArray(values?.immediateActions) ? values.immediateActions : [];
    const updatedRecommendations = [...currentRecommendations, newRec];
    setFieldValue("immediateActions", updatedRecommendations);
    
    setRecmdFinding("");
    setRecmd("");
    setRecmdDept("");
    setRecmdDeptName("");
    setRecmdDeptId("");
    setRecmdSectionHead("");
    setRecmdLineManager("");
    setRecmdLineManagerId("");
    setRecmdTargetDate(null);
    setRecmdSection("");
    setRecmdSectionName("");
    closeModal("AddRecommendationSection");
  };
  
  const removeRecommendation = (index: number, values: any, setFieldValue: any) => {
    const currentRecommendations = Array.isArray(values?.immediateActions) ? values.immediateActions : [];
    const updatedRecommendations = [...currentRecommendations];
    updatedRecommendations.splice(index, 1);
    
    setFieldValue("immediateActions", updatedRecommendations);
  }; 

  const fethBodyPartList = async () => {
    try {
      const response = await serverRequest(
        {},
        GET_ALL_BODY_PARTS + `/get-body-parts`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
        const options = response?.map((partlist: any) => ({
          value: partlist?.bodyPart,
          label: partlist?.bodyPart,
        }));
        setBodyPartListOptions(options);
      }
    } catch (error) {
      console.error("Error fetching body parts:", error);
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
      if (response && response?.length > 0) {
        const options = response?.map((data: any) => ({
          value: data?.injuryType || data?.value || "",
          label: data?.injuryType || data?.label || "",
        }));
        setNatureOfInjuriesOptions(options);
      }
    } catch (error) {
      if (injuryNatureOptions && injuryNatureOptions?.length > 0) {
        setNatureOfInjuriesOptions(injuryNatureOptions);
        console.log(error)
      }
    }
  };

  useEffect(() => {    
    fethBodyPartList();
    fetchNatureOfInjuries();
  }, [injuryNatureOptions]);

  useEffect(() => {
    if (pirData) {
      // setSimilarIncident(pirData.similarIncident || "");
      formik.setFieldValue('similarIncident', pirData.similarIncident || "");

      formik.setFieldValue('briefDescription', pirData.briefDescription || "");

      if (pirData.keyFindings && pirData.keyFindings?.length > 0) {
        formik.setFieldValue('keyFindings', pirData.keyFindings);
      }

      if (pirData.chronologyOfEvents && pirData.chronologyOfEvents?.length > 0) {
        const formattedChronology = pirData.chronologyOfEvents?.map(event => ({
          chronologyDate: event.chronologyDate ? new Date(event.chronologyDate) : null,
          chronologyTime: event.chronologyTime ? new Date(`1970-01-01T${event.chronologyTime}`) : null,
          chronologyActivity: event.chronologyActivity || "",
          chronologyRemark: event.chronologyRemark || "",
          createdAt: event.createdAt || new Date().toISOString(),
          createdBy: event.createdBy || user?.createdBy || "",
          pirId: event.pirId || pirData.pirId,
          updatedAt: event.updatedAt || new Date().toISOString(),
          updatedBy: event.updatedBy || user?.updatedBy || ""
        }));
        setChronology(formattedChronology);
      }

      if (pirData.recordsViewed && pirData.recordsViewed?.length > 0) {
        formik.setFieldValue('recordSection', pirData.recordsViewed?.map(record => ({
          recordViewed: record.recordViewed || ""
        })));
      }

      if (pirData.personsInteracted && pirData.personsInteracted?.length > 0) {
        const formattedInteractions = pirData.personsInteracted?.map(person => ({
          interactedEmployeeType: injuredEmployeeTypeOptions.find(opt => 
            opt.value === person.empType) || null,
          interactedEmployeeId: person.employeeId || "",
          interactedEmail: person.empEmail || "",
          interactedName: person.empName || "",
          interactedDesignation: person.empDesignationName || "",
          interactedDept: person.empDepartmentName || ""
        }));
        formik.setFieldValue('interactedSection', formattedInteractions);
      }

      if (pirData.immediateActions && pirData.immediateActions?.length > 0) {
        const formattedRecommendations = pirData.immediateActions?.filter(action => action.imSubmoduleName == 'Incident Report')?.map(action => ({
          finding: action.finding || "",
          actiontaken: action.actiontaken || "",
          responsibleDepartmentName: action.responsibleDepartmentName || "",
          responsibleSectionName: action.responsibleSectionName || "",
          sectionHead: action.sectionHead || "",
          linemanagerName: action.linemanagerName || "",
          targetdate: action.targetdate ? new Date(action.targetdate) : null
        }));
        formik.setFieldValue('immediateActions', formattedRecommendations);
      }

      if (pirData.chronologyManualFile) {
        setIsChronologyUploaded(true);
        // You might need to fetch file details if needed
      }
      
      if (pirData.whyWhyManualFile) {
        setIsRootCauseUploaded(true);
        // You might need to fetch file details if needed
      }
      if (pirData && pirData.supportingEvidences && pirData.supportingEvidences.length > 0) {
        const transformedEvidences = pirData.supportingEvidences.map((evidence: any) => ({
          evidenceType: evidence.evidenceType || "",
          evidenceName: evidence.evidenceName || "",
          evidenceSize: evidence.evidenceSize || "",
          fileId: evidence.fileId || evidence.mongoId || "",
          pirId: evidence.pirId || "",
          createdAt: evidence.createdAt || "",
          createdBy: evidence.createdBy || "",
          updatedAt: evidence.updatedAt || "",
          updatedBy: evidence.updatedBy || "",
          evidenceDescription: evidence.evidenceDescription || "",
          evidenceThumbnail: evidence.evidenceThumbnail || ""
        }));
        
        setSupportingEvidences(transformedEvidences);
        
        // Also set formik value if evidenceDescription is part of formik
        if (pirData.supportingEvidences[0]?.evidenceDescription) {
          setCurrentEvidenceDescription(pirData.supportingEvidences[0].evidenceDescription)
        }
      }
    }
  }, [pirData]);

  useEffect(() => {
    if(interactedEmployeeType?.value == "Internal" && interactedEmail){
      const timer = setTimeout(() => {
        fetchEmployeeDetails(interactedEmail);
      }, 1000); 
      return () => clearTimeout(timer);
    }
  },[interactedEmail, interactedEmployeeType])

  useEffect(() => {
    const loadBlobsForExistingEvidence = async () => {
        if (!supportingEvidences || supportingEvidences.length === 0) return;
        
        const blobPromises = supportingEvidences
            .filter(item => item?.fileId && !evidenceBlobUrls[item.fileId])
            .map(async (item) => {
                try {
                    await fetchFileAsBlob(item.fileId, {
                        storeInMap: true
                    });
                } catch (error) {
                    console.error(`Failed to load blob for file ${item.fileId}:`, error);
                }
            });

        const batchSize = 3;
        for (let i = 0; i < blobPromises.length; i += batchSize) {
            const batch = blobPromises.slice(i, i + batchSize);
            await Promise.all(batch);
        }
    };
    
    loadBlobsForExistingEvidence();
}, [supportingEvidences.length]);

 useEffect(() => {
    if (isChronologyUploaded || pirData?.chronologyManualFile) {
      loadChronologyFileBlob();
    }
  }, [isChronologyUploaded, chronologyFiles, pirData?.chronologyManualFile]);

  useEffect(() => {
    if (isRootCauseUploaded || pirData?.whyWhyManualFile) {
      loadRootCauseFileBlob();
    }
  }, [isRootCauseUploaded, rootCauseFiles, pirData?.whyWhyManualFile]);

  useEffect(() => {
      return () => {
          if (chronologyBlobUrl) URL.revokeObjectURL(chronologyBlobUrl);
          if (rootCauseBlobUrl) URL.revokeObjectURL(rootCauseBlobUrl);
          if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);

          Object.values(evidenceBlobUrls).forEach(blobUrl => {
              URL.revokeObjectURL(blobUrl);
          });
          Object.values(fileBlobCache).forEach(blobUrl => {
            URL.revokeObjectURL(blobUrl);
          });
      };
  }, []);

useEffect(() => {
    return () => {
        // Clean up all blob URLs on unmount
        if (previewBlobUrl) {
            URL.revokeObjectURL(previewBlobUrl);
        }
        
        Object.values(evidenceBlobUrls).forEach(blobUrl => {
            URL.revokeObjectURL(blobUrl);
        });
    };
}, []);

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log("whyWhyPayload on full form submit", whyWhyPayload)
      const recordsArray = Array.isArray(formik.values?.recordSection) ? formik.values.recordSection : [];
      const injuriesArray = Array.isArray(formik.values?.injuries) ? formik.values.injuries : [];
      const factsArray = Array.isArray(formik.values?.keyFindings) ? formik.values.keyFindings : [];
      const chronologyArray = Array.isArray(chronology) ? chronology: [];
      const interactedArray = Array.isArray(formik.values?.interactedSection) ? formik.values.interactedSection : [];
      const recommendationArray = Array.isArray(formik.values?.immediateActions) ? formik.values.immediateActions : [];

      const completeFormData = {
        ...pirData,
        ...values,
        accordionIndex: accordionIndexFromWhyWhy || 0,
        similarIncident: pirData?.similarIncident || formik.values.similarIncident || reportData?.similarIncident || "",
        incidentInitiatedDate: pirData?.incidentInitiatedDate || formik.values.incidentInitiatedDate || null,
        incidentInitiatedTime: pirData?.incidentInitiatedTime || formik.values.incidentInitiatedTime || null,
        lastDateOfIncident: pirData?.lastDateOfIncident || formik.values.lastDateOfIncident || null,
        injuries: injuriesArray?.map((inj: any, index: number) => ({
          employeeType: inj.employeeType,
          employeeId: inj.employeeId,
          injuredName: inj.injuredName,
          gender: inj.gender,
          designation: inj.designation,
          address: inj.address,
          incidentLastDate: inj.incidentLastDate || "",
          bodyParts: inj.bodyParts,
          natureOfInjury: inj.natureOfInjuries,
          jobType: inj.jobType,
          nameOfEmployer: inj.nameOfEmployer || "",
          pirId: pirId,
          createdAt: nowIso,
          createdBy: user?.createdBy || "",
          updatedAt: nowIso,
          updatedBy: user?.updatedBy || "",
          rowIndex: index,
          flagInjuryId: inj.flagInjuryId ?? 0,
          bodyPartList: (inj.bodyPartList || [])?.map((part: any, partIndex: number) => ({
            bodyPart: part.bodyPart || inj.bodyParts,
            employeeId: inj.employeeId,
            pirId: pirId,
            createdAt: nowIso,
            createdBy: user?.createdBy || "",
            natureOfInjury: part.natureOfInjury || inj.natureOfInjuries,
            flagInjuryId: part.flagInjuryId ?? 0,
            irStatus: part.irStatus || "Active",
            hodRemark: part.hodRemark || "",
            rowIndex: partIndex,
          })),
        })),
        recordsViewed: recordsArray?.map((record: any, index: number) => ({
          recordViewed: record.recordViewed,
          pirId: pirId,
          createdAt: nowIso,
          createdBy: user?.createdBy || "",
          updatedAt: nowIso,
          updatedBy: user?.updatedBy,
        })),
        keyFindings: factsArray?.map((fact: any) => ({
          keyFinding: fact.keyFinding,
          pirId: pirId,
          createdAt: nowIso,
          createdBy: user?.createdBy || "",
          updatedAt: nowIso,
          updatedBy: user?.updatedBy,
        })),
        chronologyOfEvents: chronologyArray?.map((chrono: any, index: number) => ({
          chronologyDate: chrono.chronologyDate ? dayjs(chrono.chronologyDate).format("YYYY-MM-DD") : null,
          chronologyTime: chrono.chronologyTime ? dayjs(chrono.chronologyTime).format("HH:mm") : null,
          chronologyActivity: chrono.chronologyActivity,
          chronologyRemark: chrono.chronologyRemark,
          pirId: pirId,
          createdAt: nowIso,
          createdBy: user?.createdBy || "",
          updatedAt: nowIso,
          updatedBy: user?.updatedBy,
        })),
        chronologyManualFile: chronologyFiles?.[0]?.fileId || null,
        whyWhyManualFile: rootCauseFiles?.[0]?.fileId || null,
        whyAnalyses: whyWhyPayload,
        personsInteracted: interactedArray?.map((interaction: any, index: number) => ({
          empType: interaction.interactedEmployeeType?.value || "",
          employeeId: interaction.interactedEmployeeId,
          empEmail: interaction.interactedEmail,
          empName: interaction.interactedName,
          empDesignationName: interaction.interactedDesignation,
          empDepartmentName: interaction.interactedDept,
          departmentId: departmentOptions?.find(department => department.label == interaction.interactedDept)?.value || null,
          designationId: null,//asked for null temporarily
          pirId: pirId,
          createdAt: nowIso,
          createdBy: user?.createdBy || "",
          updatedAt: nowIso,
          updatedBy: user?.updatedBy,
        })),
        immediateActions: recommendationArray?.map((rec: any, index: number) => ({
          siNo: pirData?.pirId,
          status: rec.status,
          imSubmoduleName: rec.imSubmoduleName,
          units: rec.units,
          departments: rec.departments,
          responsibleDepartmentName: rec.responsibleDepartmentName,
          sections: rec.sections,
          responsibleSectionName: rec.responsibleSectionName,
          sectionhead: rec.sectionhead,
          assignLinemanager: rec.assignLinemanager,
          linemanagerName: rec.linemanagerName,
          findingFlag: 0,
          finding: rec.finding,
          actiontaken: rec.actiontaken,
          targetdate: rec.targetdate ? dayjs(rec.targetdate).format("YYYY-MM-DD") : null,
          createdat: nowIso,
          createdby: user?.createdBy || "",
          updatedat: nowIso,
          updatedby: user?.updatedBy,
        })),
        costInRupees : costInRupees || "",
        costOfIncident : costOfIncident || "",
        costOfIncidentText : costOfIncidentText || "",
        supportingEvidences: supportingEvidences.map((evidence, index) => ({
          evidenceType: evidence.evidenceType || "",
          evidenceName: evidence.evidenceName || "",
          evidenceSize: evidence.evidenceSize || "",
          fileId: evidence.fileId || "",
          pirId: pirId,
          createdAt: evidence.createdAt || nowIso,
          createdBy: evidence.createdBy || user?.createdBy || "",
          updatedAt: evidence.updatedAt || nowIso,
          updatedBy: evidence.updatedBy || user?.updatedBy || "",
          evidenceDescription: evidence.evidenceDescription || "",
          evidenceThumbnail: evidence.evidenceThumbnail || ""
        })),
      };

      if (setPirData) {
        setPirData(completeFormData);
      }
    },
  });



 const handleWhyWhySubmit = async (payload: any[], imageFile: File | null) => {
  console.log("Received Why-Why payload in parent:", payload);
  console.log("Received image:", imageFile);
  setWhyWhyPayload(payload);
  setAccordionIndexFromWhyWhy(1);

  // Upload the image file to server if it exists
  if (imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile, imageFile.name);

    try {
      const response = await serverRequest(
        formData,
        UPLOAD_FILE + `/same`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token,
        true,
        false
      );

      if (response?.success && response?.objectId) {
        const uploadedFile = {
          fileId: response.objectId,
          fileType: imageFile.type || '',
          fileName: imageFile.name,
          fileSize: (imageFile.size / 1024).toFixed(3),
          fileThumbnail: response.objectId,
          createdAt: new Date().toISOString(),
          createdBy: user?.createdBy || ''
        };

        setRootCauseFiles((prevFiles: any) => [uploadedFile, ...prevFiles]);
        setIsRootCauseUploaded(true);
        setIsRootCauseAdded(true);

        await loadRootCauseFileBlob();
        toast.success('Analysis and file added successfully');
      } else {
        toast.error('File upload failed: ' + (response?.message || 'Unknown error'));
        toast.success('Analysis added but file upload failed');
        setIsRootCauseAdded(true);
      }
    } catch (error) {
      toast.error('Error uploading file.');
      console.error(error);
      toast.success('Analysis added but file upload failed');
      setIsRootCauseAdded(true);
    }
  } 
  
  
  else {
    toast.success('Analysis added successfully');
    setIsRootCauseAdded(true);
  }
  
  closeModal("conductWhyWhySection");
};


     const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // const previewUrl = URL.createObjectURL(file);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed types: .jpg, .jpeg, .png, .pdf, .doc, .docx, .xls, .xlsx");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file, file.name);
    try {
      const response = await serverRequest(
        formData,
        UPLOAD_FILE,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token,
        true,
        false
      );
      if (response?.success && response?.objectId) {
        await fetchFileAsBlob(response?.objectId, {
            storeForPreview: true,
            storeInMap: true
        });
        setSupportingEvidence({
          ...supportingEvidence,
          evidenceType: "",
          evidenceName: file.name,
          evidenceSize: ((file?.size / 1024).toFixed(2) + " KB") || "",
          fileId: response?.objectId,
          pirId: pirData?.pirId,
          createdAt: new Date().toISOString(),
          createdBy: user?.createdBy || "",
          updatedAt: new Date().toISOString(),
          updatedBy: user?.createdBy || "",
          evidenceThumbnail: response?.objectId,
          evidenceDescription: "",
        });
        toast.success("File uploaded successfully");
      } else {
        toast.error("Upload failed: " + (response?.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("Error uploading image.");
      console.error(error);
    }
  };

 const deleteFileFromBucket = async (index, type) => {
  const payload = [];
  let fileIdToDelete = "";

  // DELETE SINGLE TOP UPLOADED FILE
  if (type === "single") {
    if (supportingEvidence.fileId) {
      fileIdToDelete = supportingEvidence.fileId;
      payload.push(supportingEvidence.fileId);
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }
    }
  }

  // DELETE ROW FROM TABLE LIST
  if (type === "row") {
    if (supportingEvidences[index]?.fileId) {
      fileIdToDelete = supportingEvidences[index].fileId;
      payload.push(fileIdToDelete);
      if (fileIdToDelete && evidenceBlobUrls[fileIdToDelete]) {
        URL.revokeObjectURL(evidenceBlobUrls[fileIdToDelete]);
        setEvidenceBlobUrls(prev => {
          const newBlobs = { ...prev };
          delete newBlobs[fileIdToDelete];
          return newBlobs;
        });
      }
    }
  }
console.log("delete payload-",payload);
  if (payload.length === 0) {
    toast.error("No files found to delete.");
    return;
  }

  try {
    const response = await serverRequest(
      payload,
      DELETE_FILE,
      CONSTANTS.REQUEST_DELETE,
      true,
      true,
      token
    );

    if (response?.success) {
      // CLEAR TOP SINGLE EVIDENCE
      if (type === "single") {
        setSupportingEvidence({
          evidenceType: "",
          evidenceName: "",
          evidenceSize: "",
          fileId: "",
          pirId: "",
          createdAt: "",
          createdBy: "",
          updatedAt: "",
          updatedBy: "",
          evidenceDescription: "",
          evidenceThumbnail: "",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      // REMOVE ROW FROM ARRAY
      if (type === "row") {
        const updated = [...supportingEvidences];
        updated.splice(index, 1);
        setSupportingEvidences(updated);
      }

      toast.success("File deleted successfully!");
    }
  } catch (error) {
    toast.error("Error deleting file.");
    console.error(error);
  }
};

  const handleAddEvidence = () => {
  if (!currentEvidenceDescription || !previewBlobUrl) {
    toast.warning("Please enter Evidence Description and upload a file first");
    return;
  }
  if (!supportingEvidence.fileId) {
    toast.warning("Please upload a file");
    return;
  }

  const isDuplicate = supportingEvidences.some(
      evidence => evidence.fileId === supportingEvidence.fileId
    );

    if (isDuplicate) {
      toast.warning("This file is already added to the list");
      return;
    }

  const newEvidence = {
    evidenceDescription: currentEvidenceDescription,
    fileId: supportingEvidence?.fileId,
    evidenceName: supportingEvidence.evidenceName,
    evidenceThumbnail: supportingEvidence.evidenceThumbnail,
    evidenceSize: supportingEvidence.evidenceSize,
    pirId: pirId,
    createdAt: new Date().toISOString(),
    createdBy: user?.createdBy || "",
    updatedAt: new Date().toISOString(),
    updatedBy: user?.updatedBy || ""
    };

    setSupportingEvidences(prev => [...prev, newEvidence]);
    setCurrentEvidenceDescription("")
    if (fileInputRef.current) fileInputRef.current.value = "";
  if (previewBlobUrl) {
    setPreviewBlobUrl(null);
  }
    
  setCurrentEvidenceDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

  // Clear input fields
  setSupportingEvidence({
    evidenceType: "",
    evidenceName: "",
    evidenceSize: "",
    fileId: "",
    pirId: "",
    createdAt: "",
    createdBy: "",
    updatedAt: "",
    updatedBy: "",
    evidenceDescription: "",
    evidenceThumbnail: "",
  });

  setCurrentEvidenceDescription("");
  fileInputRef.current.value = "";
};

const fetchFileAsBlob = async (fileId, options = {}) => {
    const { storeForPreview = false, storeInMap = false, openInNewTab = false, cacheKey } = options;
    const cacheKeyToUse = cacheKey || fileId;
    if (fileBlobCache[cacheKeyToUse] && !openInNewTab) {
      return { blobUrl: fileBlobCache[cacheKeyToUse], fileId };
    }
    try {
        const response = await serverRequest(
            fileId,
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
        
        // Create blob URL
        const blobUrl = URL.createObjectURL(blob);
        
        setFileBlobCache(prev => ({
          ...prev,
          [cacheKeyToUse]: blobUrl
        }));

        // Store if requested
        if (storeForPreview) {
            setPreviewBlobUrl(blobUrl);
        }
        
        if (storeInMap && fileId) {
            setEvidenceBlobUrls(prev => ({
                ...prev,
                [fileId]: blobUrl
            }));
        }

        if (openInNewTab) {
          const tempUrl = URL.createObjectURL(blob);
          window.open(tempUrl, "_blank");
          setTimeout(() => {
            URL.revokeObjectURL(tempUrl);
          }, 1000);
        }
        
        return { blob, blobUrl, fileId };
        
    } catch (error) {
        console.error("Failed to fetch file as blob:", error);
        toast.error("Failed to load file");
        throw error;
    }
};

const openFileFromBlob = async (fileId: string, cacheKey?: string) => {
    try {
      await fetchFileAsBlob(fileId, { openInNewTab: true, cacheKey });
    } catch (error) {
      console.error("Failed to open file:", error);
      toast.error("Failed to open file");
    }
  };

const loadChronologyFileBlob = async () => {
  const fileId = chronologyFiles?.[0]?.fileId || pirData?.chronologyManualFile;
  if (!fileId) return;
  
  try {
    const { blobUrl } = await fetchFileAsBlob(fileId, { 
      cacheKey: 'chronology' 
    });
    setChronologyBlobUrl(blobUrl);
  } catch (error) {
    console.error("Failed to load chronology file blob:", error);
  }
};

// Function to load root cause file blob
const loadRootCauseFileBlob = async () => {
  const fileId = rootCauseFiles?.[0]?.fileId || pirData?.whyWhyManualFile;
  if (!fileId) return;
  
  try {
    const { blobUrl } = await fetchFileAsBlob(fileId, { 
      cacheKey: 'rootCause' 
    });
    setRootCauseBlobUrl(blobUrl);
  } catch (error) {
    console.error("Failed to load root cause file blob:", error);
  }
};

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="filters">
            <div className="row form_grider d1"></div>
            <div className="row">
              <div className="col-12">
                <div className="actionWrapper mb-0">
                  <button
                    className="iconBtn green v2"
                    onClick={() => {
                      if (!natureOfInjuriesOptions || natureOfInjuriesOptions?.length === 0) {
                        fetchNatureOfInjuries();
                      }
                      openModal("AddInjuryDetails");
                    }}
                    type="button"
                  >
                    <span>Add Injury Details</span>
                    <Image
                      width="15"
                      height="15"
                      alt="icon"
                      className="img-fluid u-image"
                      src="/images/svg/plus.svg"
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="formTable">
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Job Type</th>
                            <th>Body Part</th>
                            <th>Nature of Injury</th>
                            <th>Incident Last Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formik.values.injuries && formik.values.injuries?.length > 0 ? (
                            formik.values.injuries?.map((member, index) => (
                              <tr key={index}>
                                <td>{member.employeeId}</td>
                                <td>{member.injuredName}</td>
                                <td>{member.gender ? member.gender : ""}</td>
                                <td>{member.jobType ? member.jobType : ""}</td>
                                <td>
                                  {member.bodyParts ? member.bodyParts : ""}
                                </td>
                                <td>
                                  {member.natureOfInjuries ? member.natureOfInjuries : ""}
                                </td>
                                <td>
                                  {member.incidentLastDate
                                    ? new Date(
                                        member.incidentLastDate
                                      ).toLocaleDateString()
                                    : ""}
                                </td>
                                <td className="u-icon">
                                  <button
                                    type="button"
                                    className="tableBtn v2"
                                    onClick={() => editInjuryDetail(index, member)}
                                  >
                                    <span className="iconSecondary">
                                      <Image
                                        width={15}
                                        height={15}
                                        alt="Edit"
                                        src="/images/svg/edit-icon-blue.svg"
                                        className="img-fluid u-image"
                                      />
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    className="tableBtn v2"
                                    onClick={() => removeInjuryDetails(index, formik.values)}
                                  >
                                    <span className="iconSecondary">
                                      <Image
                                        width={15}
                                        height={15}
                                        alt="Delete"
                                        src="/images/svg/delete-icon.svg"
                                        className="img-fluid u-image"
                                      />
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="text-center">
                                No details added yet
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
            <div className="row g-3">
              <div className="col-12 d-flex flex-column flex-md-row">
                {/* Left Column - File Attachment Buttons */}
                <div className="col-md-6 d-flex flex-column gap-2 pe-md-3 mb-3 mb-md-0">
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <div className="flex-grow-1">
                      <button
                        className="iconBtn orange v2 w-100"
                        type="button"
                        disabled={isChronologyUploaded || chronology?.length > 0}
                        onClick={() => document.getElementById('chronology-file-input')?.click()}
                      >
                        Attach Chronology File
                      </button>
                      <input
                        id="chronology-file-input"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const allowedTypes = [
                            "image/jpeg",
                            "image/png",
                            "application/pdf",
                          ];

                          if (!allowedTypes.includes(file.type)) {
                            toast.error("Invalid file type. Only .jpg, .jpeg and .pdf are allowed.");
                            e.target.value = "";
                            return;
                          }

                          const formData = new FormData();
                          formData.append('file', file, file.name);

                          try {
                            const response = await serverRequest(
                              formData,
                              UPLOAD_FILE,
                              CONSTANTS.REQUEST_POST,
                              true,
                              true,
                              token,
                              true,
                              false
                            );

                            if (response?.success && response?.objectId) {
                              const uploadedFile = {
                                fileId: response.objectId,
                                fileType: file.type || '',
                                fileName: file.name,
                                fileSize: (file.size / 1024).toFixed(3),
                                fileThumbnail: response.objectId,
                                createdAt: new Date().toISOString(),
                                createdBy: user?.createdBy || ''
                              };

                              setChronologyFiles((prevFiles: any) => [uploadedFile, prevFiles]);
                              setIsChronologyUploaded(true);
                              await loadChronologyFileBlob();
                              toast.success('File uploaded successfully');
                            } else {
                              toast.error('Upload failed: ' + (response?.message || 'Unknown error'));
                            }
                          } catch (error) {
                            toast.error('Error uploading file.');
                            console.error(error);
                          }
                          e.target.value = '';
                        }}
                      />
                      { isChronologyUploaded && <span className="ms-3">
                        <div className="d-flex justify-content-between ps-3">
                          {chronologyBlobUrl ? (
                            <a 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                openFileFromBlob(
                                  chronologyFiles?.[0]?.fileId || pirData?.chronologyManualFile, 
                                  'chronology'
                                );
                              }}
                              style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'none' }}
                            >
                              File Link
                            </a>
                          ) : (
                            <span className="text-muted small">Loading file...</span>
                          )}
                          <span>
                            <button
                              type="button"
                              className="tableBtn v2 pt-0"
                              onClick={() => {
                                handleFileDelete(
                                  `${chronologyFiles?.[0]?.fileId ? chronologyFiles?.[0]?.fileId : pirData?.chronologyManualFile}`, 
                                  "chronologyFile"
                                );
                                
                                // Clean up blob URL
                                if (chronologyBlobUrl) {
                                  URL.revokeObjectURL(chronologyBlobUrl);
                                  setChronologyBlobUrl(null);
                                }
                              }}
                            >
                              <span className="iconSecondary">
                                <Image
                                  width={15}
                                  height={15}
                                  alt="Delete"
                                  src="/images/svg/delete-icon.svg"
                                  className="img-fluid u-image"
                                />
                              </span>
                            </button>
                          </span>
                        </div>
                      </span>}
                    </div>
                    <div className="flex-grow-1">
                      <button
                        className="iconBtn orange v2 w-100"
                        disabled={isRootCauseUploaded || isRootCauseAdded}
                        type="button"
                        onClick={() => document.getElementById('root-cause-file-input')?.click()}
                      >
                        Attach Root Cause File
                      </button>
                      <input
                        id="root-cause-file-input"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const allowedTypes = [
                            "image/jpeg",
                            "image/png",
                            "application/pdf",
                          ];

                          if (!allowedTypes.includes(file.type)) {
                            toast.error("Invalid file type. Only .jpg, .jpeg and .pdf are allowed.");
                            e.target.value = "";
                            return;
                          }

                          const formData = new FormData();
                          formData.append('file', file, file.name);

                          try {
                            const response = await serverRequest(
                              formData,
                              UPLOAD_FILE,
                              CONSTANTS.REQUEST_POST,
                              true,
                              true,
                              token,
                              true,
                              false
                            );

                            if (response?.success && response?.objectId) {
                              const uploadedFile = {
                                fileId: response.objectId,
                                fileType: file.type || '',
                                fileName: file.name,
                                fileSize: (file.size / 1024).toFixed(3),
                                fileThumbnail: response.objectId,
                                createdAt: new Date().toISOString(),
                                createdBy: user?.createdBy || ''
                              };

                              setRootCauseFiles((prevFiles: any) => [uploadedFile, prevFiles]);
                              setIsRootCauseUploaded(true)
                              await loadRootCauseFileBlob();
                              toast.success('File uploaded successfully');
                            } else {
                              toast.error('Upload failed: ' + (response?.message || 'Unknown error'));
                            }
                          } catch (error) {
                            toast.error('Error uploading file.');
                            console.error(error);
                          }
                          e.target.value = '';
                        }}
                      />
                      { isRootCauseUploaded && <span className="ms-3">
                        
                          <div className="d-flex justify-content-between ps-3">
                            {rootCauseBlobUrl ? (
                              
                              <a 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  openFileFromBlob(
                                    rootCauseFiles?.[0]?.fileId || pirData?.whyWhyManualFile, 
                                    'rootCause'
                                  );
                                }}
                                style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'none' }}
                              >
                                File Link 
                              </a>
                            ) : (
                              <span className="text-muted small">Loading file...</span>
                            )}
                            <span>
                              <button
                                type="button"
                                className="tableBtn v2 pt-0"
                                onClick={() => {
                                  handleFileDelete(
                                    `${rootCauseFiles?.[0]?.fileId ? rootCauseFiles?.[0]?.fileId : pirData?.whyWhyManualFile}`, 
                                    "rootCauseFile"
                                  );
                                  
                                  // Clean up blob URL
                                  if (rootCauseBlobUrl) {
                                    URL.revokeObjectURL(rootCauseBlobUrl);
                                    setRootCauseBlobUrl(null);
                                  }
                                }}
                              >
                                <span className="iconSecondary">
                                  <Image
                                    width={15}
                                    height={15}
                                    alt="Delete"
                                    src="/images/svg/delete-icon.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                            </span>
                          </div>
                        </span>}
                    </div>
                  </div>
                </div>
                {/* Right Column - Action Buttons Grid */}
                <div className="col-md-6">
                  <div className="actionWrapper h-100 mb-0">
                    <div className="row g-2 h-100">
                      <div className="col-6 d-flex">
                        <button type="button" className={`iconBtn ${teamMembers?.length > 0 ? "green" : "grey"} v2 w-100`} onClick={() => openModal("teamMembersModal")} >
                          View Investigation Team
                        </button>
                      </div>
                      
                      <div className="col-6 d-flex">
                        <button
                          type="button"
                          className={`iconBtn ${formik.values.keyFindings?.length > 0 ? "green" : "grey"} v2 w-100`}
                          onClick={() => openModal("AddKey")}
                        >
                          <span>Facts</span>
                        </button>
                      </div>
                      
                      <div className="col-6 d-flex">
                        <button
                          type="button"
                          className={`iconBtn ${isChronologyUploaded || chronology?.length > 0 ? "green" : "grey"} v2 w-100`}
                          onClick={() => openModal("AddChronologyForm")}
                          disabled={isChronologyUploaded}
                        >
                          <span>Chronology of events</span>
                        </button>
                      </div>
                      
                      <div className="col-6 d-flex">
                        <button
                          type="button"
                          className={`iconBtn ${isRootCauseUploaded || isRootCauseAdded ? "green" : "grey"} v2 w-100`}
                          onClick={() => openModal("conductWhyWhySection")}
                        >
                          Root Cause
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row form_grider d1 pt-3">
              <div className="col-12 col-md-6 col-lg-6">
                <DatePickerField
                  label="Last date of incident of contractor organization"
                  name="lastDateOfIncident"
                  placeholder="Choose date"
                  value={formik.values.lastDateOfIncident 
                    ? new Date(formik.values.lastDateOfIncident) 
                    : null}
                  onChange={(date: Date | null) =>{
                    const dateFormatted = date ? dayjs(date).format('YYYY-MM-DD') : null;
                    formik.setFieldValue("lastDateOfIncident", dateFormatted)
                  }}
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  errors={formik.errors.lastDateOfIncident}
                  touched={formik.touched.lastDateOfIncident}
                />
              </div>
              <div className="col-md-3 col-lg-3">
                <DatePickerField
                  label="Incident Investigation Initiated Date"
                  name="incidentInitiatedDate"
                  placeholder="Choose date"
                  value={formik.values.incidentInitiatedDate}
                  onChange={(date: Date | null) =>{
                    const dateFormatted = date ? dayjs(date).format('YYYY-MM-DD') : null;
                    formik.setFieldValue("incidentInitiatedDate", dateFormatted)
                    formik.setFieldValue("incidentInitiatedTime", null)
                    formik.setFieldTouched("incidentInitiatedDate", false)
                  }}
                  onBlur={(e) => {formik.handleBlur(e); formik.setFieldTouched("incidentInitiatedDate", true)}}
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  errors={formik.touched.incidentInitiatedDate && formik.errors.incidentInitiatedDate}
                  touched={formik.touched.incidentInitiatedDate}
                />
              </div>
              <div className="col-md-3 col-lg-3">
                <DatePickerField
                  label="Incident Investigation Initianted Time"
                  name="incidentInitiatedTime"
                  placeholder="Select time"
                  value={formik.values.incidentInitiatedTime}
                  onChange={(time: Date | null) => {
                    formik.setFieldValue("incidentInitiatedTime", time)
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  referenceDate={formik.values.incidentInitiatedDate}
                  errors={formik.errors.incidentInitiatedTime}
                  touched={formik.touched.incidentInitiatedTime}
                />
              </div>
              <div className="col-12">
                <div className="row">
                  <div className="col-6">
                    <InputField
                      type="text"
                      label="Any Similar Incident happened in Organization"
                      value={formik.values.similarIncident}
                      name="similarIncident"
                      placeholder=""
                      errors={""}
                      touched={""}
                      onBlur={() => {}}
                      onChange={(e) => {formik.setFieldValue('similarIncident', e.target.value)}}
                      maxLength={120}
                    />
                    <InputField
                      type="text"
                      label="Brief Description of Incident"
                      value={formik.values.briefDescription}
                      name="briefDescription"
                      placeholder=""
                      errors={""}
                      touched={""}
                      onBlur={() => {}}
                      onChange={(e) => {formik.setFieldValue('briefDescription', e.target.value)}}
                      maxLength={180}
                    />
                  </div>
                  <div className="col-6">
                    <div className="col-12 mb-3">
                      <div style={{color: "#616264"}}>Immediate Action Taken After Incident</div>
                      <ul style={{border: "2px solid black", maxHeight: '125px', overflowY: 'auto'}}>
                        {immedActions?.length > 0 && immedActions?.map((action: any) => <li style={{borderBottom: '1px solid grey', paddingLeft: "5px"}} key={action.actionId}>{action.actiontaken}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-12 col-lg-6">
                <div className="formTable">
                  <div className="tableTitle" style={{color: "#616264"}}>Key Factor Identified Through Analysis</div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Key Factor Identified</th>
                            <th>Factor Type</th>
                            <th>Factor Sub-Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rootCausesData?.map((item, index) => (
                            <tr key={item.pkeyId || index}>
                              <td>{item.factorName}</td>
                              <td>{item.factorType}</td>
                              <td>{item.physicalFactorType || "--"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-12 col-lg-6">
                <div className="formTable">
                  <div className="d-flex justify-content-between">
                    <div className="tableTitle" style={{color: "#616264"}}>Record View</div>
                    <div className="actionWrapper mb-0">
                      <button
                        className="iconBtn green v2 "
                        onClick={() => openModal("AddRecordSection")}
                        type="button"
                      >
                        <span>Add Record</span>
                        <Image
                          width="15"
                          height="15"
                          alt="icon"
                          className="img-fluid u-image"
                          src="/images/svg/plus.svg"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>S no</th>
                            <th>Record Viewed</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formik.values.recordSection && formik.values.recordSection?.length > 0 ? (
                            formik.values.recordSection?.map((member, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td style={{cursor: "pointer"}} title={member.recordViewed}>{truncateText(member.recordViewed, 50)}</td>
                                <td className="u-icon">
                                  <button
                                    type="button"
                                    className="tableBtn v2"
                                    onClick={() => removeRecord(index)}
                                  >
                                    <span className="iconSecondary">
                                      <Image
                                        width={15}
                                        height={15}
                                        alt="Delete"
                                        src="/images/svg/delete-icon.svg"
                                        className="img-fluid u-image"
                                      />
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center">
                                No details added yet
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
            <div className="row">
              <div className="col-12 mt-3">
                <div className="formTable">
                  <div className="d-flex justify-content-between">
                    <div className="tableTitle" style={{color: "#616264"}}>
                      Persons Interacted During Incident Investigation
                    </div>
                    <div className="actionWrapper mb-0">
                      <button
                        className="iconBtn green v2 "
                        onClick={() => openModal("AddInteractedSection")}
                        type="button"
                      >
                        <span>Add Person</span>
                        <Image
                          width="15"
                          height="15"
                          alt="icon"
                          className="img-fluid u-image"
                          src="/images/svg/plus.svg"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Department</th>
                            <th>Employee Type</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formik.values.interactedSection && formik.values.interactedSection?.length > 0 ? (
                            formik.values.interactedSection?.map((member, index) => (
                              <tr key={index}>
                                <td>{member.interactedName}</td>
                                <td>{member.interactedDesignation}</td>
                                <td>{member.interactedDept}</td>
                                <td>
                                  {member.interactedEmployeeType
                                    ? member.interactedEmployeeType.label
                                    : ""}
                                </td>
                                <td className="u-icon">
                                  <button
                                    type="button"
                                    className="tableBtn v2"
                                    onClick={() => removeInteracted(index, formik.values, formik.setFieldValue)}
                                  >
                                    <span className="iconSecondary">
                                      <Image
                                        width={15}
                                        height={15}
                                        alt="Delete"
                                        src="/images/svg/delete-icon.svg"
                                        className="img-fluid u-image"
                                      />
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center">
                                No details added yet
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
            <div className="row">
              <div className="col-12">
                <div className="formTable">
                  <div className="d-flex justify-content-between">
                    <div className="tableTitle" style={{color: "#616264"}}>Recommendation</div>
                    <div className="actionWrapper mb-0">
                      <button
                        className="iconBtn green v2 "
                        type="button"
                        onClick={() => openModal("AddRecommendationSection")}
                      >
                        <span>Add Recommendation</span>
                        <Image
                          width="15"
                          height="15"
                          alt="icon"
                          className="img-fluid u-image"
                          src="/images/svg/plus.svg"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Finding</th>
                            <th>Recommendation</th>
                            <th>Target Date</th>
                            <th>Responsible Department</th>
                            <th>Responsible Section</th>
                            <th>Responsible Person</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formik.values.immediateActions && formik.values.immediateActions?.length > 0 ? (
                            formik.values.immediateActions?.map((member, index) => (
                              <tr key={index}>
                                <td style={{cursor: "pointer"}} title={member.finding}>{truncateText(member.finding, 50)}</td>
                                <td style={{cursor: "pointer"}} title={member.actiontaken}>{truncateText(member.actiontaken, 50)}</td>
                                <td>
                                  {member.targetdate
                                    ? new Date(member.targetdate).toLocaleDateString()
                                    : ""}
                                </td>
                                <td>{member.responsibleDepartmentName}</td>
                                <td>{member.responsibleSectionName}</td>
                                <td>{member.linemanagerName}</td>
                                <td className="u-icon">
                                  <button
                                    type="button"
                                    className="tableBtn v2"
                                    onClick={() => removeRecommendation(index, formik.values, formik.setFieldValue)}
                                  >
                                    <span className="iconSecondary">
                                      <Image
                                        width={15}
                                        height={15}
                                        alt="Delete"
                                        src="/images/svg/delete-icon.svg"
                                        className="img-fluid u-image"
                                      />
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center">
                                No details added yet
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
            <div className="c-accordion__head">
            <div className="c-accordion__head--title"> Supporting Evidence </div>
          </div>
            <div className="row form_grider d1 mt-2">
              <div className="col-12 col-md-3">
                <InputField
                  type="text"
                  placeholder="description of evidence"
                  label="Evidence Description"
                  value={currentEvidenceDescription}
                  name="evidenceDescription"
                  onChange={(e) => setCurrentEvidenceDescription(e.target.value)}
                  maxLength={180}
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="mt-2">Image Upload</label>
                <input
                  type="file"
                  id="evidenceFile"
                  name="evidenceFile"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="form-control"
                />
              </div>
                 <div className="col-12 col-md-4">
                    <label className="mb-1">Preview</label>
                    <div style={{ position: "relative", width: "100%", minHeight: "120px" }}>
                      {supportingEvidence?.fileId ? (
                        <div style={{ position: "relative" }}>
                            <button
                              className="iconBtn orange p-2"
                              type="button"
                              style={{ 
                                position: "absolute", 
                                right: "10px", 
                                top: "0",
                                zIndex: 10 
                              }}
                              title="Delete"
                              onClick={() => {
                                // Clean up blob URL
                                if (previewBlobUrl) {
                                  URL.revokeObjectURL(previewBlobUrl);
                                  setPreviewBlobUrl(null);
                                }
                                
                                // Clear supporting evidence
                                setSupportingEvidence({
                                  evidenceName: "",
                                  fileId: "",
                                  evidenceDescription: "",
                                  evidenceThumbnail: "",
                                  evidenceSize: ""
                                });
                                
                                // Clear file input
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                                
                                toast.info("File cleared");
                              }}
                            >
                              <Image
                                width="20"
                                height="20"
                                alt="Delete"
                                src="/images/svg/icons/Delete.svg"
                                className="white-icon"
                              />
                            </button>
                          <div className="d-flex align-items-start gap-2">
                            {/* Preview Image/Icon */}
                            {previewBlobUrl ? (
                              <div style={{ width: "80px", height: "80px", flexShrink: 0 }}>
                                <Image
                                  src={previewBlobUrl}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    padding: "4px",
                                    backgroundColor: "#f9f9f9",
                                  }}
                                  width={80}
                                  height={80}
                                  alt="File preview"
                                  onError={(e) => {
                                    // If image fails to load (e.g., it's a PDF), show file icon
                                    const isImage = supportingEvidence.evidenceName?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
                                    if (!isImage) {
                                      e.currentTarget.style.display = 'none';
                                      // You could show a file icon here instead
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div style={{ width: "80px", height: "80px", flexShrink: 0 }}>
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px dashed #ccc",
                                    borderRadius: "8px",
                                    backgroundColor: "#f5f5f5",
                                  }}
                                >
                                  <span className="text-muted small">Loading preview...</span>
                                </div>
                              </div>
                            )}
                            
                            {/* File Info */}
                            <div className="small">
                              <div className="fw-bold">{supportingEvidence.evidenceName || "Uploaded file"}</div>
                              {supportingEvidence.evidenceSize && (
                                <div className="text-muted">Size: {supportingEvidence.evidenceSize}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="text-muted small d-flex align-items-center justify-content-center"
                          style={{ 
                            height: "120px", 
                            border: "2px dashed #ddd", 
                            borderRadius: "8px",
                            backgroundColor: "#f9f9f9"
                          }}
                        >
                          <div className="text-center">
                            <Image
                              src="/images/icons/file-icon.svg"
                              width={40}
                              height={40}
                              alt="No file"
                              className="mb-2 opacity-50"
                            />
                            <div>No file selected</div>
                          </div>
                        </div>
                      )}
                    </div>
                 </div>

              <div className="col-12 col-md-2 text-start text-md-end mt-2">
                <button disabled={!supportingEvidence.fileId} className="iconBtn green" type="button" onClick={handleAddEvidence}>
                  <Image src="/images/svg/plus.svg" alt="Add" width={20} height={20}/>
                  Add File
                </button>
              </div>

            </div>
            <div className="formTable__table">
              <div className="admin-table d3 table-responsive mt-3 noHover">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Serial No.</th>
                      <th>Remark</th>
                      <th>File Name</th>
                      <th>File Size</th>
                      <th>Uploaded Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                <tbody>
                  {supportingEvidences && supportingEvidences.length > 0 ? (
                    supportingEvidences.map((item, index) => {
                      const hasBlob = item?.fileId && evidenceBlobUrls[item.fileId];
                      const isImage = item.evidenceName?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
                      
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td title={item.evidenceDescription}>{truncateText(item.evidenceDescription || item.evidenceName, 45)}</td>
                          <td>
                            {item?.fileId ? (
                              <div className="d-flex align-items-center">
                                {/* Preview thumbnail */}
                                <div className="me-2" style={{ width: "50px", height: "35px" }}>
                                  {hasBlob && isImage ? (
                                    <Image
                                      src={evidenceBlobUrls[item.fileId]}
                                      alt="File Preview"
                                      width={50}
                                      height={35}
                                      style={{
                                        objectFit: "cover",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px"
                                      }}
                                      onError={() => handleImageError(item.fileId)}
                                    />
                                  ) : (
                                    <div 
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        border: "1px dashed #ddd",
                                        borderRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f5f5f5"
                                      }}
                                    >
                                      <Image
                                        src={
                                          item.evidenceName?.match(/\.pdf$/i) 
                                            ? "/images/icons/pdf-icon.svg"
                                            : item.evidenceName?.match(/\.(doc|docx)$/i)
                                            ? "/images/icons/doc-icon.svg"
                                            : item.evidenceName?.match(/\.(xls|xlsx)$/i)
                                            ? "/images/icons/xls-icon.svg"
                                            : "/images/icons/file-icon.svg"
                                        }
                                        width={24}
                                        height={24}
                                        alt="File type"
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                {/* File name with download link */}
                                <div>
                                  <a 
                                    href="#" 
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      try {
                                        await openFileFromBlob(item.fileId);
                                      } catch (error) {
                                        console.error("Failed to open file:", error);
                                      }
                                    }}
                                    className="text-decoration-none"
                                    title={item.evidenceName}
                                  >
                                    {truncateText(item.evidenceName, 30)}
                                  </a>
                                  {item.evidenceSize && (
                                    <div className="text-muted small">{item.evidenceSize}</div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{item.evidenceSize || "N/A"}</td>
                          <td>
                            {item.createdAt 
                              ? new Date(item.createdAt).toLocaleDateString() 
                              : "N/A"}
                          </td>
                           <td>
                              <button
                                className="iconBtn"
                                type="button"
                                onClick={() => {
                                  // Clean up blob URL
                                  if (item.fileId && evidenceBlobUrls[item.fileId]) {
                                    URL.revokeObjectURL(evidenceBlobUrls[item.fileId]);
                                    setEvidenceBlobUrls(prev => {
                                      const newBlobs = { ...prev };
                                      delete newBlobs[item.fileId];
                                      return newBlobs;
                                    });
                                  }
                                  deleteFileFromBucket(index, "row");
                                }}
                              >
                                <Image
                                  width={15}
                                  height={15}
                                  alt="Delete"
                                  src="/images/svg/delete-icon.svg"
                                  className="img-fluid u-image"
                                />
                              </button>
                            </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No supporting evidence added yet
                      </td>
                    </tr>
                  )}
                </tbody>
                </table>
              </div>
            </div>
          </div>
      <div className="actionWrapper mt-2 mb-0">
        {/* {!formPreviewed && <button className="iconBtn orange v2" onClick={() => {setTimeout(() => {
          setFormPreviewed(true)
        }, 1000);}} type="submit">
          <span>Save IR</span>
        </button>} */}


<button disabled={isSubmitCase} className="iconBtn green v2" onClick={() => {
          setSubmitCase(true)
        }}>
          <span>Submit IR</span>
        </button>
      </div>
      <CustomModal
        isOpen={modals.teamMembersModal}
        onClose={() => closeModal("teamMembersModal")}
        title="Team Details"
      >
        <div className="filters">
          <div className="row form_grider d1">
           <div className="col-12">
              <div className="formTable">
                <div className="formTable__table">
                  <div className="admin-table d3 table-responsive mt-3 noHover">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Name</th>
                          <th>Designation</th>
                          <th>Department</th>
                          <th>IM Trained</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers?.length > 0 ? (
                          teamMembers?.map((member: any, index: number) => (
                            <tr key={index}>
                              <td>{member.email}</td>
                              <td>{member.name}</td>
                              <td>{member.designationName}</td>
                              <td>{member.departmentName}</td>
                              <td>{member.trainingStatus}</td>
                              <td>{member.memberRole}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center">
                              No Data Found
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
          <div className="row">
            <div className="col-12">
              <div className="btnWrapper">
                <button
                  className="btnNoicon red"
                  type="button"
                  onClick={() => closeModal("teamMembersModal")}
                >
                  Close
                </button>
                {/* <button className="btnNoicon green" onClick={() => {
                  if (!natureOfInjuriesOptions || natureOfInjuriesOptions?.length === 0) {
                    if (injuryNatureOptions && injuryNatureOptions?.length > 0) {
                    }
                  }
                  handleAddInjuries(formik.values, formik.setFieldValue);
                }}>
                  Edit Team
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={modals.AddInjuryDetails}
        onClose={() => closeModal("AddInjuryDetails")}
        title={currentInjuryIndex === -1 ? "Add Injury Details" : "Edit Injury Details"}
      >
        <div className="filters">
          <div className="row form_grider d1">
            <div className="col-12 col-md-4 col-lg-4">
              <SelectField
                label="Employee Type"
                value={employeeType}
                name="employeeType"
                placeholder=""
                options={injuredEmployeeTypeOptions}
                onChange={(selectedOption: SelectOptions | null) =>
                  setEmployeeType(selectedOption)
                }
                onBlur={() => {}}
              />
            </div>
            <div className="col-12 col-md-4 col-lg-4">
              <InputField
                type="text"
                label="Employee ID"
                value={employeeId}
                name="employeeId"
                placeholder=""
                errors={""}
                touched={""}
                onBlur={() => {}}
                onChange={(e) => setEmployeeId(e.target.value)}
                maxLength={30}
              />
            </div>

            <div className="col-12 col-md-4 col-lg-4">
              <InputField
                type="text"
                label="Injured Name"
                value={injuredName}
                name="injuredName"
                placeholder=""
                errors={""}
                touched={""}
                onBlur={() => {}}
                onChange={(e) => setInjuredName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className="col-12 col-md-4 col-lg-4">
              <SelectField
                label="Gender"
                value={gender}
                name="gender"
                placeholder=""
                options={genderOptions}
                onChange={(selectedOption: SelectOptions | null) =>
                  setGender(selectedOption)
                }
                onBlur={() => {}}
              />
            </div>
            <div className="col-12 col-md-4 col-lg-4">
              <SelectField
                label="Job Type"
                value={jobType}
                name="jobType"
                placeholder=""
                options={injuredJobTypeOptions}
                onChange={(value: any) => {
                  setJobType(value);
                }}
                onBlur={() => {}}
              />
            </div>
            <div className="col-12 col-md-4 col-lg-4">
              <InputField
                type="text"
                label="Designation"
                value={designation}
                name="designation"
                placeholder=""
                errors={""}
                touched={""}
                onBlur={() => {}}
                onChange={(e) => setDesignation(e.target.value)}
                maxLength={50}
              />
            </div>
              <div className="col-12 col-md-8 col-lg-8">
              <table className="w-100 bg-white border border-gray-300 rounded">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-2 border">Body Part</th>
                    <th className="text-left px-4 py-2 border">Nature of Injury</th>
                    <th className="text-center px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows?.map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border">
                        <SelectField
                          label="Body Parts Injured"
                          value={row?.bodyPart}
                          placeholder=""
                          name={`bodyPart-${index}`}
                          options={bodyPartListOptions}
                          onChange={(val: SelectOptions | null) => {
                            setRows((prev) =>
                              prev?.map((r, i) => (i === index ? { ...r, bodyPart: val } : r))
                            );
                          }}
                          onBlur={() => {}}
                        />
                      </td>
                      <td>
                        <MultiSelectField
                          label="Nature of Injury"
                          value={row?.injuryNature}
                          name={`injuryNature-${index}`}
                          options={(natureOfInjuriesOptions && natureOfInjuriesOptions?.length > 0) ? natureOfInjuriesOptions : (injuryNatureOptions || [])}
                          selectAllLabel="Select All"
                          placeholder="Select nature of injuries"
                          onChange={(output) => {
                            setRows((prev) =>
                              prev?.map((r, i) =>
                                i === index
                                  ? { ...r, injuryNature: output as SelectOptions[] }
                                  : r
                              )
                            );
                          }}
                          outputFormat="object"
                          onBlur={() => {}}
                          enableSelectAll={true}
                        />
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <div className="flex justify-center items-center gap-x-2">
                          {index === rows?.length - 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setRows([...rows, { bodyPart: null, injuryNature: [], isOpen: false }])
                              }
                              disabled={readOnly}
                            >
                              <Image width={15} height={15} alt="Add" src="/images/svg/add-icon.svg" />
                            </button>
                          )}
                          {rows?.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setRows(rows.filter((_, i) => i !== index))}
                              disabled={readOnly}
                            >
                              <Image width={15} height={15} alt="Delete" src="/images/svg/delete-icon.svg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            <div className="col-12 col-md-4 col-lg-4">
              <div className="dateFlield">
                <DatePickerField
                  label="Incident Last Date"
                  name="incidentLastDate"
                  placeholder="choose a date"
                  errors={""}
                  touched={""}
                  value={incidentLastDate ? new Date(incidentLastDate) : null}
                  onChange={(date: Date) => {
                    const dateFormatted = date ? dayjs(date).format('YYYY-MM-DD') : null;
                    setIncidentLastDate(dateFormatted)
                  }}
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyy"
                />
                <span className="dateFlield__icon">
                </span>
              </div>
            </div>
            <div className="col-12 col-md-8 col-lg-8">
              <InputField
                type="text"
                label="Address"
                value={address}
                name="address"
                placeholder=""
                errors={""}
                touched={""}
                onBlur={() => {}}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={120}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="btnWrapper">
                <button
                  className="btnNoicon red"
                  type="button"
                  onClick={() => {resetInjuryForm(); closeModal("AddInjuryDetails")}}
                >
                  Cancel
                </button>
                <button className="btnNoicon green" type="button" onClick={() => {
                  if (!natureOfInjuriesOptions || natureOfInjuriesOptions?.length === 0) {
                    if (injuryNatureOptions && injuryNatureOptions?.length > 0) {
                    }
                  }
                  handleAddInjuries(formik.values, formik.setFieldValue);
                }}>
                  {currentInjuryIndex === -1 ? "Add Details" : "Update Details"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={modals.AddKey}
        onClose={() => closeModal("AddKey")}
        title="Key Findings"
      >
        <KeyFindings
          formik={formik}
          finding={finding}
          setFinding={setFinding}
          editFinding={editFinding}
          setEditFinding={setEditFinding}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
          updateFacts={updateFacts}
          addFacts={addFacts}
          removefacts={removefacts}
          closeModal={closeModal}
        />
      </CustomModal>

      <CustomModal
        isOpen={modals.AddChronologyForm}
        onClose={() => {closeModal("AddChronologyForm"); setEditingChronologyIndex(null); resetChronologyFields();}}
        title="Chronology of Events"
      >
        <Chronology
          formik={formik}
          chronology={chronology}
          // State values
          chronologyDate={chronologyDate}
          setChronologyDate={setChronologyDate}
          chronologyTime={chronologyTime}
          setChronologyTime={setChronologyTime}
          chronologyActivity={chronologyActivity}
          setChronologyActivity={setChronologyActivity}
          chronologyRemark={chronologyRemark}
          setChronologyRemark={setChronologyRemark}
          editChronologyDate={editChronologyDate}
          setEditChronologyDate={setEditChronologyDate}
          editChronologyTime={editChronologyTime}
          setEditChronologyTime={setEditChronologyTime}
          editChronologyActivity={editChronologyActivity}
          setEditChronologyActivity={setEditChronologyActivity}
          editChronologyRemark={editChronologyRemark}
          setEditChronologyRemark={setEditChronologyRemark}
          editingChronologyIndex={editingChronologyIndex}
          setEditingChronologyIndex={setEditingChronologyIndex}
          // Functions
          updateChronology={updateChronology}
          addChronology={addChronology}
          removechronology={removechronology}
          closeModal={closeModal}
          resetChronologyFields={resetChronologyFields}
        />
      </CustomModal>

      <CustomModal
        isOpen={modals.conductWhyWhySection}
        onClose={() => closeModal("conductWhyWhySection")}
        title="Conduct Why Why"
      >
        <div className="filters">
          <div className="row form_grider d1">
            <div className="col-12">
              {/* <WhyWhyChart /> */}
              <WhyWhyAnalysis
                initialData={whyWhyInitialData}
                onTreeChange={handleTreeChange}
                onSubmit={handleWhyWhySubmit}
                height="80vh"
                readOnly={false}
                incidentId={pirId}
              />
            </div>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={modals.AddRecordSection}
        onClose={() => closeModal("AddRecordSection")}
        title="Record Viewed"
      >
        <RecordViewed
          formik={formik}
          recordViewed={recordViewed}
          setRecordViewed={setRecordViewed}
          addRecords={addRecords}
          removeRecord={removeRecord}
          closeModal={closeModal}
        />
      </CustomModal>

      <CustomModal
        isOpen={modals.AddInteractedSection}
        onClose={() => closeModal("AddInteractedSection")}
        title="Add Person Interacted"
      >
        <InteractedPerson
          formik={formik}
          // State values
          interactedEmployeeType={interactedEmployeeType}
          setInteractedEmployeeType={setInteractedEmployeeType}
          interactedEmail={interactedEmail}
          setInteractedEmail={setInteractedEmail}
          interactedEmployeeId={interactedEmployeeId}
          setInteractedEmployeeId={setInteractedEmployeeId}
          interactedName={interactedName}
          setInteractedName={setInteractedName}
          interactedDesignation={interactedDesignation}
          setInteractedDesignation={setInteractedDesignation}
          interactedDept={interactedDept}
          setInteractedDept={setInteractedDept}
          injuredEmployeeTypeOptions={injuredEmployeeTypeOptions}
          addInteraction={addInteraction}
          closeModal={closeModal}
        />
      </CustomModal>

      <CustomModal
        isOpen={modals.AddRecommendationSection}
        onClose={() => closeModal("AddRecommendationSection")}
        title="Add Recommendation"
      >
        <div className="filters">
          <div className="row form_grider d1">
            <div className="col-12 col-md-4 col-lg-4">
              <InputField
                type="text"
                label="Finding"
                value={recmdFinding}
                onBlur={() => {}}
                name="recmdFinding"
                placeholder=""
                onChange={(e) => setRecmdFinding(e.target.value)}
                maxLength={300}
              />
            </div>

            <div className="col-12 col-md-4 col-lg-4">
              <InputField
                type="text"
                label="Recommendation"
                onBlur={() => {}}
                value={recmd}
                name="recmd"
                placeholder=""
                onChange={(e) => setRecmd(e.target.value)}
                maxLength={300}
              />
            </div>

            <div className="col-12 col-md-4 col-lg-4">
              <SelectField
                label="Department"
                value={departmentOptions?.find(opt => opt.value === recmdDept) || null}
                name="recmdDept"
                placeholder="Select Department"
                options={departmentOptions}
                onChange={(selectedOption: SelectOptions | null) => {
                  setRecmdDept(selectedOption?.value)
                  setRecmdDeptName(selectedOption?.label)
                  setRecmdDeptId(selectedOption?.value)
                  fetchSections(selectedOption?.value)
                  }
                }
                onBlur={() => {}}
              />
            </div>

            <div className="col-12 col-md-4 col-lg-4">
              <SelectField
                label="Section"
                value={sectionOptions?.find(opt => opt.value === recmdSection) || null}
                name="recmdSection"
                placeholder="Select Section"
                options={sectionOptions}
                onChange={(selectedOption: SelectOptions | null) => {
                  setRecmdSection(selectedOption?.value)
                  setRecmdSectionName(selectedOption?.label)
                  fetchSectionHead(selectedOption?.value, recmdDeptId, pirData?.unitId)
                  fetchLineManagers(recmdDeptId, selectedOption?.value)
                  }
                }
                onBlur={() => {}}
              />
            </div>

            <div className="col-12 col-md-4 col-lg-4">
              <InputField
                type="text"
                label="Section Head"
                value={recmdSectionHead}
                disabled={true}
                onBlur={() => {}}
                name="recmdSectionHead"
                placeholder=""
                onChange={() => {}}
                maxLength={50}
              />
            </div>

            <div className="col-12 col-md-4 col-lg-4">
              <SelectField
                label="Line Manager"
                value={lineManagerOptions?.find(opt => opt?.value === recmdLineManagerId) || null}
                name="recmdLineManager"
                placeholder="Select Line Manager"
                options={lineManagerOptions}
                onChange={(selectedOption: SelectOptions | null) => {
                  setRecmdLineManager(selectedOption?.label)
                  setRecmdLineManagerId(selectedOption?.value)
                }}
                onBlur={() => {}}
              />
            </div>

            <div className="col-12 col-md-4 col-lg-4">
              <DatePickerField
                label="Target Date"
                name="recmdTargetDate"
                value={recmdTargetDate}
                placeholder="choose a date"
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                onChange={(date: Date) => setRecmdTargetDate(date)}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="btnWrapper">
                <button
                  type="button"
                  className="btnNoicon red"
                  onClick={() => closeModal("AddRecommendationSection")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btnNoicon green"
                  title={(!recmd ||
                    !recmdDept ||
                    !recmdSection ||
                    !recmdSectionHead ||
                    !recmdLineManager ||
                    !recmdTargetDate)?"All fields are compulsory except finding": ""}
                  disabled={
                    !recmd ||
                    !recmdDept ||
                    !recmdSection ||
                    !recmdSectionHead ||
                    !recmdLineManager ||
                    !recmdTargetDate
                  }
                  onClick={() => addRecommendation(formik.values, formik.setFieldValue)}
                  >
                  Add Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
      {/* <ToastContainer/> */}
    </form>
  );
};

export default InvestigationReportAccordion;
