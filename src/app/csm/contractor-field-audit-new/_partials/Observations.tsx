'use client'
import React, { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import SelectField from "@/components/Form/SelectFields";
import MultiSelectField from "@/components/Form/MultiSelectField";
import { SelectOptions } from "@/components/interfaces";
import DatePickerField from "@/components/Form/DatePickerField";
import EmployeeEmailField from "@/components/Form/EmployeeEmailField";
import InputField from "@/components/Form/InputField";
import { emptySelector } from "@/config/config";
import { AutoSubmitTrigger } from "./AutoSubmitTrigger";
import Button from "@/components/Elements/Button";
import ToggleButton from "@/components/Form/ToggleButton";
import CustomModal from "@/components/Layouts/CustomModal";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  restrictAlphabets,
  restrictSpecialCharactersExceptHyphen,
} from "@/config/globalUtils";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import {
  FETCH_DEPARTMENTS,
  FETCH_SECTIONS,
  FETCH_CSFA,
  FETCH_LINEMANAGER,
  UPLOAD_FILE,
  DELETE_FILE,
  DOWNLOAD_FILE,
  BUCKET_URL,
} from "@/config/apiConfig";

type SelectOption = { value: number | string; label: string };

interface ObservationsDataInterface {
  csfaNo: string;
  observationDescription: string;
  observationLocation: string;
  responsibleSupervisor: string;
  goodCitizens: string;
  violaters: string;
  noOfViolations: SelectOption[];
  severity: string;
  violationsSeverityProduct: string;
  unsafeActs: string;
  unsafeConditions: string;
  remarks: string;
  createdBy: string;
  createdAt: string;
  updatedby: string;
  updatedAt: string;  
  observationNo: number;
  rowIndex: number;
  id: number;
  indicators: string;
  status: string;
  jspSupervisiorId: string;
  jspSupervisiorName: string;
  jspSupervisiorEmail: string;
  contractorSupervisiorName: string;
  actionTakens: {
    actionId: number;
    observationNo: number;
    csfaNo: string;
    correctiveAction: string;
    departments: string;
    sections: string;
    sectionHead: string;
    assignedTo: string;
    assignedLineManager: string;
    assignedLineManagerName: string;
    assignedLineManagerEmail: string;
    targetDate: string;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    status: string;
    rowIndex: number;
  }[];
  images: {
    id: number;
    fileId: string;
    cfsaNo: string;
    fileName: string;
    fileSize: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    observationNo: string;
    rowIndex: number;
  }[];
}

interface ObservationsInterface {
  observationData: ObservationsDataInterface[];
  setObservationData: React.Dispatch<React.SetStateAction<ObservationsDataInterface[]>>;
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;  
  csfaData: any;
  setCSFAData: any;
  setIsPreviewActive: any;
}

const Observations = ({
  observationData,
  setObservationData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  csfaData,
  setCSFAData,
  setIsPreviewActive
}: ObservationsInterface) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [selectedSection, setSelectedSection] = useState<SelectOptions | null>(
    null
  );
  const [capaDepartmentOptions, setCapaDepartmentOptions] = useState(emptySelector);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector);
  const [capaSectionOptions, setCapaSectionOptions] = useState(emptySelector);
  const [lineManagerList, setLineManagerList] = useState([]);
  // const [observationDetail, setObservationDetail] = useState("");
  // const [capaLineManager, setCapaLineManager] = useState("");
  const [capaSectionHeadName, setCapaSectionHeadName] = useState("");
  // const [capaDepartments, setCapaDepartments] = useState("");
  // const [departmentHodName, setDepartmentHodName] = useState("");
  // const [calculatedDate, setCalculatedDate] = useState("");
  const [observationDraft, setObservationDraft] = useState({
    observationDescription: "",
    observationLocation: "",
    responsibleSupervisor: "",
    goodCitizens: "",
    violaters: "",
    noOfViolations: "",
    severity: "",
    violationsSeverityProduct: "",
    unsafeActs: "",
    unsafeConditions: "",
    remarks: "",
    createdBy: user?.createdBy || "",
    createdAt: null,
    updatedby: user?.updatedBy || "",
    updatedAt: null,
    observationNo: 0,
    id: 0,
    rowIndex: 0,
    indicators: "",
    status: "",
    jspSupervisiorId: "",
    jspSupervisiorName: "",
    jspSupervisiorEmail: "",
    contractorSupervisiorName: "",
    actionTakens: [],
    images: [],
  });
  const [actionDraft, setActionDraft] = useState({
    actionId: 0,
    observationNo: 0,
    csfaNo: "",
    correctiveAction: "",
    departments: "",
    sections: "",
    sectionHead: "",
    assignedTo: "",
    assignedLineManager: "",
    assignedLineManagerName: "",
    assignedLineManagerEmail: "",
    targetDate: null,
    createdBy: user?.createdBy || "",
    createdAt: null,
    updatedBy: user?.updatedBy || "",
    updatedAt: null,
    status: "",
    rowIndex: 0,
  });
  const [actionsDraft, setActionsDraft] = useState([]); // for actions of current observation
  const [imageDraft, setImageDraft] = useState({
    id: 0,
    fileId: "",
    cfsaNo: "",
    fileName: "",
    fileSize: "",
    createdAt: null,
    createdBy: user?.createdBy || "",
    updatedAt: null,
    updatedBy: user?.updatedBy || "",
    observationNo: "",
    rowIndex: 0
  });
  const emptyImageDraft = {
    id: 0,
    fileId: "",
    cfsaNo: "",
    fileName: "",
    fileSize: "",
    createdAt: null,
    createdBy: user?.createdBy || "",
    updatedAt: null,
    updatedBy: user?.updatedBy || "",
    observationNo: "",
    rowIndex: 0
  };
  const [imagesDraft, setImagesDraft] = useState([]);
  const [nextObservationNo, setNextObservationNo] = useState(1);
  const [currentObservationIndex, setCurrentObservationIndex] = useState(null);
  const [actionsForView, setActionsForView] = useState([]);
  const [imagesForView, setImagesForView] = useState([]);
  const [targetDays, setTargetDays] = useState("");
  const severityOptions = [
    { value: 0, label: "Good citizen (0)" },
    { value: 1, label: "Untidy area, minor issues, sets poor example (1)" },
    { value: 2, label: "Restricted access, unacceptable trash, disorderly  (2)" },
    { value: 3, label: "Rule or procedure violation, potential injury (3)" },
    { value: 4, label: "Unsafe condition, serious injury potential (4)" },
    { value: 5, label: "Immediate serious injury potential, stop activity immediately and correct (5)"},
  ];
   const indicatorOptions = [
    { value: 0, label: "Excavation" },
    { value: 1, label: "Working at Height" },
    { value: 2, label: "Scaffolding" },
    { value: 3, label: "Gas Cutting & Welding" },
    { value: 4, label: "Electrical Safety" },
    { value: 5, label: "Material Handling" },
    { value: 6, label: "Confined Space" },
    { value: 7, label: "Housekeeping" },
    { value: 8, label: "PPE" },
    { value: 9, label: "Slip, Trip & Fall" }
    ];
  const assignedToOptions = [
    { value: "Employee", label: "Employee" },
    { value: "Contractor", label: "Contractor" },
  ]; 
 
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 15);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const noOfGoodCitizensRef = useRef<HTMLInputElement | null>(null);
  const noOfViolatersRef = useRef<HTMLInputElement | null>(null);
  const noOfViolationsRef = useRef<HTMLInputElement | null>(null);
  const noOfUnsafeActsRef = useRef<HTMLInputElement | null>(null);
  const noOfUnsafeConditionsRef = useRef<HTMLInputElement | null>(null);

  const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };
  const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement>) => {
      restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  };  

  const initialValues = {
    csfaNo: "",
    observationDescription: "",
    observationLocation: "",
    responsibleSupervisor: "",
    goodCitizens: "",
    violaters: "",
    noOfViolations: "",
    severity: "",
    violationsSeverityProduct: "",
    unsafeActs: "",
    unsafeConditions: "",
    remarks: "",
    indicators: "",
    status: "",
    jspSupervisiorId: "",
    jspSupervisiorName: "",
    jspSupervisiorEmail: "",
    contractorSupervisiorName: "",
    createdBy: user?.createdBy || "",
    createdAt: null,
    updatedby: user?.updatedBy || "",
    updatedAt: null,
    observationNo: 0,
    rowIndex: 0,
    id: 0,    
    correctiveAction: "",
    observations: csfaData?.observations || observationData || [],
    actionsTakens: [],
    images: [],
    disableUnsafeActs: false,
    disableUnsafeConditions: false
  };
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [isViewActionOpen, setIsViewActionOpen] = useState(false);
  const [isToggleButton, setIsToggleButton] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const singleObservationValidationSchema = Yup.object().shape({
    observationDescription: Yup.string().required("observationDescription is required"),
    observationLocation: Yup.string().required("observationLocation is required"),
    responsibleSupervisor: Yup.string().required("responsibleSupervisor is required"),
    goodCitizens: Yup.string().required("goodCitizens is required"),
    violaters: Yup.string().required("violaters is required"),
    noOfViolations: Yup.string().required("noOfViolations is required"),
    severity: Yup.string().required("severity is required"),
    violationsSeverityProduct: Yup.string().required("violationsSeverityProduct is required"),
    // unsafeActs: Yup.string().required("unsafeActs is required"),
    // unsafeConditions: Yup.string().required("unsafeConditions is required"),
    remarks: Yup.string().required("remarks is required"),
    indicators: Yup.string().required("indicators is required"),
    contractorSupervisiorName: Yup.string().required("contractorSupervisiorName is required")
  });

  const fetchCapaDepartments = async (unitId) => {
    try {
      setCapaDepartmentOptions(emptySelector);
      setCapaSectionOptions(emptySelector);
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${unitId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((dept: any) => ({
          value: dept?.departmentid,
          label: dept?.departmentname,
        }));
        setCapaDepartmentOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(()=>{
    fetchCapaDepartments(csfaData?.visitedUnit);
  },[csfaData?.visitedUnit]);
  
  const fetchCapaSections = async (departmentId: string | number) => {
    try {
      setCapaSectionOptions(emptySelector);
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/get-sections/${departmentId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((sect: any) => ({
          value: sect?.sectionid,
          label: sect?.sectionname,
        }));
        setCapaSectionOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchSectionHead = async (unitId, departmentId, sectionId, setFieldValue: Function, values?: any) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/${unitId}` + `/${departmentId}` + `/${sectionId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.sectionHead != null) {
        setFieldValue("sectionHead", response?.sectionHead?.linemanagerName);
        setCapaSectionHeadName(response?.sectionHead?.linemanagerName);
        setActionDraft((prev) => ({
          ...prev,
          sectionHead: response?.sectionHead?.linemanagerName,
        }));
      } else {
        setCapaSectionHeadName("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleObservationView = async (values, index) => {
    await setCurrentObservationIndex(index);
    setActionsForView(values.observations[index].actionTakens);
    setImagesForView(values.observations[index].images);
    setIsViewActionOpen(true);
  };
  useEffect(() => {
    if(!currentObservationIndex)
    {
      setIsViewActionOpen(false);
      setActionsForView([]);
      setImagesForView([]);
    }
  }, [currentObservationIndex]);

  //working code file uploading..start
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
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
        const newFileData = {
          id: 0,
          observationNo: "",
          fileId: response?.objectId,
          cfsaNo: "",
          fileName: file.name,
          fileSize: file.size.toString(),
          createdAt: new Date().toISOString().split("T")[0],
          createdBy: user.createdBy || "",
          updatedAt: new Date().toISOString().split("T")[0],
          updatedBy: user.updatedBy || "",
          rowIndex: 0
        };
        // Update state immediately with file info
        setImageDraft((prev) => ({
          ...prev,
          ...newFileData,
        }));
      } else {
        toast.error("Upload failed: " + (response?.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("Error uploading image.");
      console.error(error);
    }
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
           "blob" 
        );
        let blob;
        if (response instanceof Response) {
            blob = await response.blob();
        } else {
            blob = response; // already a Blob
        }
        const url = window.URL.createObjectURL(blob);
        // console.log("url",url);
        window.open(url, "_blank");
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 1000);
    } catch (error) {
        console.error("Open failed:", error);
        toast.error("File open failed. Please try again.");
    }
  };

  const deleteFileFromBucket = async (
    index: number,
    type: "single" | "row"
  ) => {
    let payload = [];
    let fileToDelete = "";
    if (type == "single" && (imageDraft.fileId ?? "") != "") {
      fileToDelete = imageDraft.fileId;
      payload = [fileToDelete];
    } else if (type == "row") {
      if ((imagesDraft[index].fileId ?? "") != "") {
        payload.push(imagesDraft[index].fileId);
      }
    }
    if (payload.length == 0) {
      toast.error("No files found to remove.");
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
        if (type == "single") {
          setImageDraft((prev) => ({
            ...prev,
            fileId: "",
            fileName: "",
            createdAt: null,
            createdBy: "",
          }));
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else if (type == "row") {
          const updated = [...imagesDraft];
          updated.splice(index, 1);
          setImagesDraft(updated);
        }
      }
    } catch (error) {
      toast.error("Error deleting file.");
      console.error(error);
    }
  };

  const fetchLineManager = async (departmentId, sectionid) => {
    setLineManagerList([]);
    setLineManagerOptions(emptySelector);
    try {
      const response = await serverRequest(
        {},
        FETCH_LINEMANAGER +
          `/get-line-managers/${departmentId}` +
          `/active` +
          `/${sectionid}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.jsplid,
          label: data?.linemanagerName,
        }));
        setLineManagerOptions(options);
        setLineManagerList(response);
      } else {
        setLineManagerOptions(emptySelector);
        setLineManagerList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const handleSeverityChange = (
    selectedOption,
    values,
    setFieldValue
  ) => {
    const severity = selectedOption?.value || 0;
    const violations = Number(values.noOfViolations || 0);

    // 1️⃣ multiply severity × noOfViolations
    const product = severity * violations;

    setFieldValue("severity", severity);
    setFieldValue("violationsSeverityProduct", product);

    // 2️⃣ Enable / disable logic
    if (severity === 1 || severity === 2) {
      // Unsafe Conditions only
      setFieldValue("unsafeActs", "");
      setFieldValue("disableUnsafeActs", true);
      setFieldValue("disableUnsafeConditions", false);
    }

    else if (severity === 3) {
      // Both allowed
      setFieldValue("disableUnsafeActs", false);
      setFieldValue("disableUnsafeConditions", false);
    }

    else if (severity === 4 || severity === 5) {
      // Unsafe Acts only
      setFieldValue("unsafeConditions", "");
      setFieldValue("disableUnsafeActs", false);
      setFieldValue("disableUnsafeConditions", true);
    }

    else {
      // default
      setFieldValue("disableUnsafeActs", false);
      setFieldValue("disableUnsafeConditions", false);
    }
  };  
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={(values) => {
        let minNoOfObservations = 1;
        if(values?.observations?.length < minNoOfObservations)
        {
          toast.error("Please add atleast " + minNoOfObservations + " observations.");
          return;
        }
        setCSFAData((prevcsfaData: any) => ({
          ...prevcsfaData,
          ...(prevcsfaData?.objectId && { objectId: prevcsfaData.objectId }),
          observations: values.observations,
        }));
        
        setObservationData(values.observations);
        setIsPreviewActive(true);
      }}
    >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        touched,
        errors,
      }) => {
        const isEmployee = values.assignedTo === "Employee";
        const isContractor = values.assignedTo === "Contractor";

        const isObservationIncomplete = !values.observationDescription ||
          !values.observationLocation ||
          !values.responsibleSupervisor ||
          !values.violationsSeverityProduct ||
          !values.indicators ||
          !values.violaters ||
          !values.goodCitizens ||
          !values.remarks;

        const addObsWithoutActionTitle = isObservationIncomplete
          ? "Please fill all required fields"
          : "";
        const saveDraftObservation = () => {
          setCSFAData((prevcsfaData: any) => ({
            ...prevcsfaData,
            ...(prevcsfaData?.objectId && { objectId: prevcsfaData.objectId }),
            observations: values.observations,
          }));          
          setObservationData(values.observations);
        };

        useEffect(() => {
          saveDraftObservation();
        }, [values.observations]);

        const handleAddObservation = () => {
          const newObservation = {
            csfaNo: "",
            observationNo: nextObservationNo,
            observationDescription: values.observationDescription,
            observationLocation: values.observationLocation,
            responsibleSupervisor: values.responsibleSupervisor,
            goodCitizens: values.goodCitizens,
            violaters: values.violaters,
            noOfViolations: values.noOfViolations,
            severity: values.severity.toString(),
            violationsSeverityProduct: values.violationsSeverityProduct.toString(),
            unsafeActs: values.unsafeActs,
            unsafeConditions: values.unsafeConditions,
            remarks: values.remarks,
            indicators: values.indicators,
            jspSupervisiorId: values.jspSupervisiorId,
            jspSupervisiorName: values.jspSupervisiorName,
            jspSupervisiorEmail: values.jspSupervisiorEmail,
            contractorSupervisiorName: values.contractorSupervisiorName,
            createdBy: user?.createdBy || "",
            createdAt: dayjs().format("YYYY-MM-DD"),
            updatedBy: user?.updatedBy || "",
            updatedAt: dayjs().format("YYYY-MM-DD"),
            actionTakens: values.actionsTakens || [],
            images: imagesDraft,
            rowIndex: 0,
            id: 0,
            status: values.actionsTakens?.filter((x) => x.status == "Open").length > 0 ? "WIP" : "Completed"
          };
         
          setFieldValue("observations", [
            ...values.observations,
            newObservation,
          ]);

          setNextObservationNo(nextObservationNo + 1);
          // Reset fields
          setFieldValue("observationDescription", "");
          setFieldValue("observationLocation", "");
          setFieldValue("responsibleSupervisor", "");
          setFieldValue("goodCitizens", "");
          setFieldValue("violaters", "");
          setFieldValue("noOfViolations", "");
          setFieldValue("severity", "");
          setFieldValue("violationsSeverityProduct", "");
          setFieldValue("unsafeActs", "");
          setFieldValue("unsafeConditions", "");
          setFieldValue("remarks", "");
          setFieldValue("indicators", "");
          setFieldValue("jspSupervisiorId", "");
          setFieldValue("jspSupervisiorName", "");
          setFieldValue("jspSupervisiorEmail", "");
          setFieldValue("contractorSupervisiorName", "");
          setFieldValue("actionsTakens", []);
          setFieldValue("images", []);

          setActionDraft({
            actionId: 0,
            observationNo: 0,
            csfaNo: "",
            correctiveAction: "",
            departments: "",
            sections: "",
            sectionHead: "",
            assignedTo: "",
            assignedLineManager: "",
            assignedLineManagerName: "",
            assignedLineManagerEmail: "",
            targetDate: null,
            createdBy: user.createdBy || "",
            createdAt: null,
            updatedBy: user.updatedBy || "",
            updatedAt: null,
            status: "",
            rowIndex: 0 
          });

          // Reset drafts
          setObservationDraft({
            observationDescription: "",
            observationLocation: "",
            responsibleSupervisor: "",
            goodCitizens: "",
            violaters: "",
            noOfViolations: "",
            severity: "",
            violationsSeverityProduct: "",
            unsafeActs: "",
            unsafeConditions: "",
            remarks: "",
            createdBy: user?.createdBy || "",
            createdAt: null,
            updatedBy: user?.updatedBy || "",
            updatedAt: null,
            observationNo: 0,
            id: 0,
            rowIndex: 0,
            indicators: "",
            status: "",
            jspSupervisiorId: "",
            jspSupervisiorName: "",
            jspSupervisiorEmail: "",
            contractorSupervisiorName: "",
            actionTakens: [],
            images: [],
          });
          // reset images
          setImageDraft({
            id: 0,
            fileId: "",
            cfsaNo: "",
            fileName: "",
            fileSize: "",
            createdAt: null,
            createdBy: user?.createdBy || "",
            updatedAt: null,
            updatedBy: user?.updatedBy || "",
            observationNo: "",
            rowIndex: 0
          });
          //setActionsDraft([]);
          setImagesDraft([]);
          setIsAddActionOpen(false);
        };
      const handleAddAction = () => {

      const isEmployeeRole = values.assignedTo === "Employee";
      const isContractorRole = values.assignedTo === "Contractor";

      // When toggle = FALSE → Open action (all mandatory fields required)
      if (isToggleButton === false) {
        if (
          !values.departments ||
          !values.sections ||
          !values.correctiveAction ||
          !values.targetDate
        ) {
          toast.error("Please fill in all mandatory fields.");
          return;
        }

        if (
          isEmployeeRole &&
          (!values.assignedLineManager ||
            !values.assignedLineManagerName ||
            !values.assignedLineManagerEmail)
        ) {
          toast.error("Please select Line Manager.");
          return;
        }

        if (
          isContractorRole &&
          (!csfaData?.contractorId ||
            !csfaData?.contractorName ||
            !csfaData?.contractorEmail)
        ) {
          toast.error("Contractor details not found.");
          return;
        }
      }

      // When toggle = TRUE → Completed action (only corrective action required)
      if (isToggleButton === true) {
        if (!values.correctiveAction) {
          toast.error("Please fill Corrective Action.");
          return;
        }
      }

      // Status
      const actionStatus = isToggleButton === false ? "Open" : "Completed";

      // Assign values based on toggle
      const departments = isToggleButton === false ? values.departments : null;
      const sections = isToggleButton === false ? values.sections : null;
      const sectionHead = isToggleButton === false ? values.sectionHead : "";

      const assignedLineManager = isToggleButton === false
        ? (isEmployeeRole ? values.assignedLineManager : csfaData?.contractorId)
        : user.createdBy;

      const assignedLineManagerName = isToggleButton === false
        ? (isEmployeeRole ? values.assignedLineManagerName : csfaData?.contractorName)
        : user.name;

      const assignedLineManagerEmail = isToggleButton === false
        ? (isEmployeeRole ? values.assignedLineManagerEmail : csfaData?.contractorEmail)
        : "";

      const targetDate =
        isToggleButton === false
          ? dayjs(values.targetDate).format("YYYY-MM-DD")
          : dayjs(csfaData?.auditDate).format("YYYY-MM-DD");

      const actionToAdd = {
        ...actionDraft,
        actionId: 0,
        observationNo: nextObservationNo,
        csfaNo: "",
        correctiveAction: values.correctiveAction,
        departments: departments,
        sections: sections,
        sectionHead: sectionHead,
        assignedTo: values.assignedTo,
        assignedLineManager: assignedLineManager,
        assignedLineManagerName: assignedLineManagerName,
        assignedLineManagerEmail: assignedLineManagerEmail,
        targetDate: targetDate,
        createdAt: dayjs().format("YYYY-MM-DD"),
        updatedAt: dayjs().format("YYYY-MM-DD"),
        createdBy: user.createdBy,
        updatedBy: user.updatedBy,
        status: actionStatus,
      };

      console.log("actionToAdd", JSON.stringify(actionToAdd));

      setFieldValue("actionsTakens", [...values.actionsTakens, actionToAdd]);
      // Reset fields
      setFieldValue("correctiveAction", "");
      setFieldValue("assignedLineManager", "");
      setFieldValue("assignedLineManagerName", "");
      setFieldValue("assignedLineManagerEmail", "");
    };

        // const handleAddAction = () => {          
        //   const isEmployeeRole = values.assignedTo === "Employee";
        //   const isContractorRole = values.assignedTo === "Contractor";

        // if (!values.departments || !values.sections || !values.correctiveAction || !values.targetDate) {
        //     toast.error("Please fill in all mandatory fields.");
        //     return;
        //   }
        //   // Employee-specific validation
        //   if (isEmployeeRole && (!values.assignedLineManager || !values.assignedLineManagerName || !values.assignedLineManagerEmail)) {
        //     toast.error("Please select Line Manager.");
        //     return;
        //   }
        //   // Contractor-specific validation
        //   if (isContractorRole && (!csfaData?.contractorId || !csfaData?.contractorName || !csfaData?.contractorEmail)) {
        //     toast.error("Contractor details not found.");
        //     return;
        //   }
        //   const actionToAdd = {
        //     ...actionDraft,
        //     actionId: 0,
        //     observationNo: nextObservationNo,
        //     csfaNo: "",
        //     correctiveAction: values.correctiveAction,
        //     departments: values.departments,
        //     sections: values.sections,
        //     sectionHead: values.sectionHead,
        //     assignedTo: values.assignedTo,
        //     assignedLineManager: isEmployeeRole
        //       ? values.assignedLineManager
        //       : csfaData?.contractorId,
        //     assignedLineManagerName: isEmployeeRole
        //       ? values.assignedLineManagerName
        //       : csfaData?.contractorName,
        //     assignedLineManagerEmail: isEmployeeRole
        //       ? values.assignedLineManagerEmail
        //       : csfaData?.contractorEmail,
        //     targetDate: dayjs(values.targetDate).format("YYYY-MM-DD"),
        //     createdAt: dayjs().format("YYYY-MM-DD"),
        //     updatedAt: dayjs().format("YYYY-MM-DD"),
        //     createdBy: user.createdBy,
        //     updatedBy: user.updatedBy,
        //     status: "Open",
        //   };
        //   console.log("actionto add",JSON.stringify(actionToAdd));
        //    // ADD TO LIST
        //   setFieldValue("actionsTakens", [
        //      ...values.actionsTakens,
        //       actionToAdd,
        //   ]);
        // // RESET FIELDS
        //   setFieldValue("correctiveAction", "");
        //   setFieldValue("assignedLineManager", "");
        //   setFieldValue("assignedLineManagerName", "");
        //   setFieldValue("assignedLineManagerEmail", "");       
        // };
        // const handleAddObservationNoAction = () => {
        //   if(
        //     !values.observationDescription ||
        //     !values.observationLocation ||
        //     !values.responsibleSupervisor ||
        //     !values.violationsSeverityProduct ||
        //     !values.indicators ||
        //     !values.violaters ||
        //     !values.goodCitizens ||
        //     !values.remarks
        //     ) {
        //     toast.error("Please fill all fields");
        //     return;
        //   } else {
        //     // if(values.observationTypeDisplay.startsWith("Unsafe")) {
        //     //   alert("Actions must be defined for Unsafe Observations.");
        //     //   return;
        //     // }
        //     const observationObj = {
        //     csfaNo: "",
        //     observationDescription: values.observationDescription || "",
        //     observationLocation: values.observationLocation || "",
        //     responsibleSupervisor: values.responsibleSupervisor || "",
        //     goodCitizens: values.goodCitizens || "",
        //     violaters: values.violaters || "",
        //     noOfViolations: values.noOfViolations || "",
        //     severity: values.severity || "",
        //     violationsSeverityProduct: values.violationsSeverityProduct || "",
        //     unsafeActs: values.unsafeActs || "",
        //     unsafeConditions: values.unsafeConditions || "",
        //     remarks: values.remarks || "",
        //     indicators: values.indicators || "",
        //     jspSupervisiorId: values.jspSupervisiorId || "",
        //     jspSupervisiorName: values.jspSupervisiorName || "",
        //     jspSupervisiorEmail: values.jspSupervisiorEmail || "",
        //     contractorSupervisiorName: values.contractorSupervisiorName || "",
        //     createdBy: user.createdBy || "",
        //     createdAt: dayjs().format("YYYY-MM-DD"),
        //     updatedAt: dayjs().format("YYYY-MM-DD"),
        //     updatedBy: user.updatedBy || "",
        //     observationNo: nextObservationNo,
        //     rowIndex: 0,
        //     id: 0,
        //     status: "",
        //     actionsTaken: [],
        //     images: imagesDraft,
        //   };

        //   // ✅ console here
        //   console.log("Observation Object:", JSON.stringify( observationObj));

        //     setFieldValue("observations", [
        //       ...values.observations,
        //       {
        //         csfaNo: "",
        //         observationDescription: values.observationDescription || "",
        //         observationLocation: values.observationLocation || "",
        //         responsibleSupervisor: values.responsibleSupervisor || "",
        //         goodCitizens: values.goodCitizens || "",
        //         violaters: values.violaters || "",
        //         noOfViolations: values.noOfViolations || "",
        //         severity: values.severity || "",
        //         violationsSeverityProduct: values.violationsSeverityProduct || "",
        //         unsafeActs: values.unsafeActs || "",
        //         unsafeConditions: values.unsafeConditions || "",
        //         remarks: values.remarks || "",
        //         indicators: values.indicators || "",
        //         jspSupervisiorId: values.jspSupervisiorId || "",
        //         jspSupervisiorName: values.jspSupervisiorName || "",
        //         jspSupervisiorEmail: values.jspSupervisiorEmail || "",
        //         contractorSupervisiorName: values.contractorSupervisiorName || "",
        //         createdBy: user.createdBy || "",
        //         createdAt: dayjs().format("YYYY-MM-DD"),
        //         updatedAt: dayjs().format("YYYY-MM-DD"),
        //         updatedBy: user.updatedBy || "",
        //         observationNo: nextObservationNo,
        //         rowIndex: 0,
        //         id: 0,
        //         status: "",
        //         actionsTaken: actionDraft ? [actionDraft] : [],
        //         images: imagesDraft,
        //       },
        //     ]);
        //     setNextObservationNo(nextObservationNo + 1);
        //     // Reset drafts
        //     setFieldValue("observationDescription", "");
        //     setFieldValue("observationLocation", "");
        //     setFieldValue("responsibleSupervisor", "");
        //     setFieldValue("goodCitizens", "");
        //     setFieldValue("violaters", "");
        //     setFieldValue("noOfViolations", "");
        //     setFieldValue("severity", "");
        //     setFieldValue("violationsSeverityProduct", "");
        //     setFieldValue("unsafeActs", "");
        //     setFieldValue("unsafeConditions", "");
        //     setFieldValue("remarks", "");
        //     setFieldValue("indicators", "");
        //     setFieldValue("jspSupervisiorId", "");
        //     setFieldValue("jspSupervisiorName", "");
        //     setFieldValue("jspSupervisiorEmail", "");
        //     setFieldValue("contractorSupervisiorName", "");
        //     setFieldValue("actionsTakens", []);
        //     setFieldValue("images", []);
        //   }
        // };
        return (
          <form onSubmit={handleSubmit}>
            <div className="filters">
              <div className="row form_grider d1">
               <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    type="text"
                    label="Observation"
                    name="observationDescription"
                    placeholder="Description"
                    value={values.observationDescription}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={300}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    type="text"
                    label="Location"
                    name="observationLocation"
                    placeholder="Location"
                    value={values.observationLocation}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={300}
                  />
                </div>
                <div className="col-12 col-md-3 col-lg-3">
                 <label className="form-label mb-0">Supervisor Email (Employee):</label>
                  <EmployeeEmailField
                    token={token}
                    value={values.responsibleSupervisor || ""}
                    onChange={(email, val) => {
                    setFieldValue("responsibleSupervisor", email);
                    setFieldValue("jspSupervisiorId", val?.jsplid || "");
                    setFieldValue("jspSupervisiorName", val?.empName || "");
                    setFieldValue("jspSupervisiorEmail", email || "");
                    }}
                  />
                </div>
                <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="Supervisor Name (Employee)"
                    name="jspSupervisiorName"
                    placeholder="Name"
                    value={values.jspSupervisiorName}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={50}
                    disabled={true}
                  />
                </div>
                 <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="Responsible Supervisor Name"
                    name="contractorSupervisiorName"
                    placeholder="Name"
                    value={values.contractorSupervisiorName}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={50}
                  />
                </div>
                 <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="No. of Good Citizens"
                    name="goodCitizens"
                    placeholder=""
                    value={values.goodCitizens}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={3}
                    reference={noOfGoodCitizensRef}  
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, noOfGoodCitizensRef, false)} 
                    errors={touched.goodCitizens && errors.goodCitizens}
                  />
                </div>
                <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="No. of Violaters"
                    name="violaters"
                    placeholder=""
                    value={values.violaters}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={3}
                    reference={noOfViolatersRef}  
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, noOfViolatersRef, false)} 
                    errors={touched.violaters && errors.violaters}
                  />
                </div>
                 <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="No. of Violations"
                    name="noOfViolations"
                    placeholder=""
                    value={values.noOfViolations}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={3}
                    reference={noOfViolationsRef}  
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, noOfViolationsRef, false)} 
                    errors={touched.noOfViolations && errors.noOfViolations}
                  />
                </div>
                 <div className="col-12 col-md-6 col-lg-6">
                 <SelectField
                    label="Severity"
                    value={severityOptions.find(opt => opt.value === values.severity)}
                    name="severity"
                    placeholder="Select Severity"
                    options={severityOptions}
                    // onChange={(option) => setFieldValue("severity", option?.label)}
                    onChange={(option) =>
                      handleSeverityChange(option, values, setFieldValue)
                    }
                    onBlur={handleBlur}
                    errors={touched.severity && errors.severity}
                  />
                </div>
                 <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="Violations X Severity"
                    name="violationsSeverityProduct"
                    placeholder="Violations X Severity"
                    value={values.violationsSeverityProduct}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    disabled={true}
                  />
                </div>
                 <div className="col-12 col-md-3 col-lg-3">
                  <SelectField
                    label="Indicators"
                    value={indicatorOptions.find(opt => opt.value === values.indicators)}
                    name="indicators"
                    placeholder="Select Indicators"
                    options={indicatorOptions}
                    onChange={(option) => setFieldValue("indicators", option?.label)}
                    onBlur={handleBlur}
                    errors={touched.indicators && errors.indicators}
                  />
                </div>
                <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="No. of Unsafe Acts"
                    name="unsafeActs"
                    placeholder=""
                    value={values.unsafeActs}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={3}
                    disabled={values.disableUnsafeActs}
                    reference={noOfUnsafeActsRef}  
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, noOfUnsafeActsRef, false)} 
                    errors={touched.unsafeActs && errors.unsafeActs}
                  />
                </div>
                  <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="No. of Unsafe Conditions"
                    name="unsafeConditions"
                    placeholder=""
                    value={values.unsafeConditions}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={3}
                    disabled={values.disableUnsafeConditions}
                    reference={noOfUnsafeConditionsRef}  
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, noOfUnsafeConditionsRef, false)} 
                    errors={touched.unsafeConditions && errors.unsafeConditions}
                  />
                </div>
                 <div className="col-12 col-md-3 col-lg-6">
                  <InputField
                    type="text"
                    label="Remarks"
                    name="remarks"
                    placeholder="remarks"
                    value={values.remarks}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={300}
                  />
                </div>
                <div className="severity-note">
                    <strong>Note:</strong>
                    <ul>
                        <li>
                        <strong>Severity 1 &amp; 2:</strong> Please enter <em>Unsafe Conditions</em> only.
                        </li>
                        <li>
                        <strong>Severity 3:</strong> Please enter either <em>Unsafe Conditions</em> or <em>Unsafe Acts</em>.
                        </li>
                        <li>
                        <strong>Severity 4 &amp; 5:</strong> Please enter <em>Unsafe Acts</em> only.
                        </li>
                    </ul>
                </div>
                <div className="col-12 col-md-12 col-lg-12 d-flex justify-content-end pb-4 gap-2">
                  <button
                    type="button"
                    className="iconBtn orange w100 gap-1"
                    onClick={() => {
                      if (isObservationIncomplete) {
                        toast.error("Please fill all fields in Observation Section");
                      } else {
                        setIsAddImageOpen(true);
                      }
                    }}
                  >
                    <img
                      width="15"
                      height="15"
                      alt="icon"
                      src="/images/svg/plus.svg"
                      className="img-fluid u-image"
                    />
                    <span>Add Attachment</span>
                  </button>
                  <button
                    type="button"
                    className="iconBtn orange w100 gap-1"
                      onClick={() => {
                        if (isObservationIncomplete || !csfaData?.visitedUnit) {
                          toast.error("Please fill all fields in Observation Section");
                        } else {
                          setIsAddActionOpen(true);
                        }
                      }}
                    >
                    <img
                      width="15"
                      height="15"
                      alt="icon"
                      src="/images/svg/plus.svg"
                      className="img-fluid u-image"
                    />
                    <span>Add Action</span>
                  </button>
                  {/* <button
                    className="iconBtn green"
                    type="button"
                    title={addObsWithoutActionTitle}
                    // disabled={addObsWithoutActionDisabled}
                    onClick={handleAddObservationNoAction}
                  >
                    <img
                      width="15"
                      height="15"
                      alt="icon"
                      src="/images/svg/plus.svg"
                      className="img-fluid u-image"
                    />
                    <span>Add Observation</span>
                  </button> */}
                </div>
              </div>
              <div className="pb-4">
                <div className="admin-boxContainer d1 ">
                  <div className="row">
                    <div className="col-12">
                      <div className="admin-table d3 table-responsive noHover">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Observation Description</th>
                              <th>Severity</th>
                              <th>Location</th>
                              <th>Responsible Supervisor</th>
                              <th>Violators</th>
                              <th>violationsSeverityProduct</th>
                              <th style={{ width: 120 }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {values?.observations?.length > 0 ? (
                              values?.observations.map((row, index) => (
                                <tr key={index}>
                                  <td>{row?.observationDescription}</td>
                                  <td>{row?.severity}</td>
                                  <td>{row?.observationLocation}</td>
                                  <td>{row?.responsibleSupervisor}</td>
                                  <td>{row?.violaters}</td>
                                  <td>{row?.violationsSeverityProduct}</td>
                                  <td>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                      <button
                                        className="tableBtn"
                                        type="button"
                                        onClick={() => {
                                          const updated = [
                                            ...values.observations,
                                          ];
                                          updated.splice(index, 1);
                                          setFieldValue("observations", updated);
                                        }}
                                      >
                                        <span>
                                          <img
                                            width="15"
                                            height="15"
                                            alt="icon"
                                            style={{
                                              filter:
                                                "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                            }}
                                            src="/images/svg/icons/Delete.svg"
                                            // className="img-fluid u-image"
                                          />
                                        </span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                            handleObservationView(values, index);
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
                                <td colSpan={8} className="text-center">
                                  No Observation added yet
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
              {/* Add Image Modal Start */}
              <CustomModal
                isOpen={isAddImageOpen}
                onClose={() => {
                  setIsAddImageOpen(false);
                  // setImageDraft(emptyimageDraft);
                   setImageDraft({
                    id: 0,
                    fileId: "",
                    cfsaNo: 0,
                    fileName: "",
                    fileSize: "",
                    createdAt: null,
                    createdBy: user?.createdBy || "",
                    updatedAt: null,
                    updatedBy: user?.updatedBy || "",
                    observationNo: "",
                    rowIndex: 0
                  });
                  setImagesDraft([]);
                }}
                title="File Attachments"
                modalSizeClassName="modal-sm"
              >
              <div
                className="modal-scrollable-content px-2 py-3"
                style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                <div className="row col-12 col-md-10 col-lg-12 d-flex justify-content-between">
                  <div className="col-12 col-md-6 col-lg-3 d-flex flex-column gap-2 mb-2 ms-2">
                    <span>Image Upload</span>
                    <input
                      type="file"
                      id="fileId"
                      onChange={handleFileChange}
                      name="fileId"
                      ref={fileInputRef}
                    />
                   </div>
                  <div className="col-12 col-md-3 col-lg-3 d-flex flex-column gap-3 position-relative">
                    <h5>Image</h5>
                    <div style={{ position: "relative", width: "100%" }}>
                      {imageDraft?.fileId ? (
                        <div style={{ position: "relative", width: "100%" }}>
                          <button
                            className="iconBtn orange p-2"
                            type="button"
                            style={{ position: "absolute", right: "110px" }}
                            title="Delete"
                            onClick={() => deleteFileFromBucket(0, "single")}
                          >
                            <img
                              width="20"
                              height="20"
                              alt="Delete"
                              src="/images/svg/icons/Delete.svg"
                              className="white-icon"
                            />
                          </button>
                          <img
                            src={`${BUCKET_URL}/${imageDraft?.fileId}`}
                            alt="File"
                            style={{
                              maxWidth: "50%",
                              maxHeight: "100px",
                              objectFit: "contain", // or "cover"
                              display: "block",
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                              padding: "4px",
                              backgroundColor: "#f9f9f9",
                            }}
                          />
                          File Name: {imageDraft?.fileName}
                        </div>
                      ) : (
                        <div className="text-muted small">
                          No image selected
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-end mt-2 mb-2 d-flex justify-content-end">
                    <button
                      className="iconBtn orange"
                      type="button"
                      onClick={() => {
                        if (
                          !imageDraft.fileId
                        ) {
                          toast.error("Please upload files");
                          return;
                        }
                        const imageToAdd = {
                          ...imageDraft,
                          id: 0,
                          observationNo: nextObservationNo,                          
                          cfsaNo: "",
                          fileId: imageDraft.fileId,
                          fileName: imageDraft.fileName,
                          fileSize: imageDraft.fileSize,
                          createdAt: dayjs().format("YYYY-MM-DD"),
                          createdBy: user.createdBy || "",
                          updatedAt: dayjs().format("YYYY-MM-DD"),
                          updatedBy: user.updatedBy || "",
                          rowIndex: 0
                        };
                        setImagesDraft((prev) => [...prev, imageToAdd]);
                        setImageDraft({
                          id: 0,
                          fileId: "",
                          cfsaNo: 0,
                          fileName: "",
                          fileSize: "",
                          createdAt: null,
                          createdBy: user?.createdBy || "",
                          updatedAt: null,
                          updatedBy: user?.updatedBy || "",
                          observationNo: "",
                          rowIndex: 0
                        });
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <img src="/images/svg/plus.svg" alt="Add" />
                      Add File
                    </button>
                  </div>
                  <div>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>File Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {imagesDraft?.length > 0 ? (
                          imagesDraft.map((row, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {row?.fileId ? (
                                <>
                                  <a href="#" onClick={(e) => {e.preventDefault(); downloadFile(row?.fileId);}}>
                                  {row?.fileName}{" "}
                                  <img
                                    src={`${BUCKET_URL}/${row?.fileId}`}
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
                            <td>
                              <button
                                className="tableBtn"
                                title="Delete"
                                type="button"
                                onClick={() =>
                                  deleteFileFromBucket(index, "row")
                                }
                              >
                                <img
                                  style={{
                                    filter:
                                      "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                  }}
                                  src="/images/svg/icons/Delete.svg"
                                  alt="Delete"
                                  width="20"
                                  height="20"
                                />
                              </button>
                            </td>
                          </tr>
                        ))) : (
                          <tr>
                            <td colSpan={4} className="text-center">
                              No files added yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-end mt-2 mb-2 d-flex justify-content-end">
                    <button
                      type="button"
                      className="iconBtn orange w100 gap-1"
                      onClick={() => {
                        if (isObservationIncomplete || !csfaData?.visitedUnit) {
                          toast.error("Please fill all fields in Observation Section");
                        } else {
                          setIsAddImageOpen(false);
                          setIsAddActionOpen(true);
                        }
                      }}
                    >
                      <img
                        width="15"
                        height="15"
                        alt="icon"
                        src="/images/svg/plus.svg"
                        className="img-fluid u-image"
                      />
                      <span>View Action Tab</span>
                    </button>
                    {/* <button
                      className="iconBtn green"
                      type="button"
                      title={addObsWithoutActionTitle}
                      // disabled={addObsWithoutActionDisabled}
                      onClick={handleAddObservationNoAction}
                    >
                      <img
                        width="15"
                        height="15"
                        alt="icon"
                        src="/images/svg/plus.svg"
                        className="img-fluid u-image"
                      />
                      <span>Add Observation</span>
                    </button> */}
                  </div>
                </div>
              </div>
              </CustomModal>
              {/* Add Action Modal Start */}
              <CustomModal
                isOpen={isAddActionOpen}
                onClose={() => setIsAddActionOpen(false)}
                title="Add Action"
                // modalSizeClassName="modal-xl"
              >
                <div className="filters px-2 py-2 scrollable-container">
                  <div className="row g-3 px-3 ">
                    <div className="col-12">
                      <div className="row form_grider d1 g-2 my-0">
                        <div className="col-12 col-sm-6 col-lg-8">
                          <InputField
                            type="text"
                            label="Corrective Action"
                            value={values.correctiveAction}
                            name="correctiveAction"
                            placeholder="Corrective Action"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={500}
                          />
                        </div>
                         <div className="col-12 col-sm-6 col-lg-2">
                          <ToggleButton
                            name="ToggleButton"
                            label="Closed on The Spot"
                            checked={isToggleButton}
                            onChange={(e) =>
                              setIsToggleButton(e.target.checked)
                            }
                            disabled={false}
                            theme="primary" // "primary" | "secondary" | "accent"
                            customColor="#f47920" // ✅ Optional: overrides theme color when ON
                            noLabel="No" // Label shown when unchecked
                            yesLabel="Yes" // Label shown when checked
                          />
                        </div>
                          <div className="col-12 col-sm-6 col-lg-2">
                          {/* <DatePickerField
                            label="Target Date"
                            name="targetDate"
                            placeholder="Choose Date"
                            value={values.targetDate}
                            onChange={(date: Date | null) => {
                              setFieldValue("targetDate", date);
                            }}
                            minDate={tomorrow}
                            maxDate={maxDate}
                            dateFormat="yyyy-MM-dd"
                            errors={errors.targetDate}
                            touched={touched.targetDate}
                          /> */}
                          <DatePickerField
                            label="Target Date"
                            name="targetDate"
                            placeholder="Choose Date"
                            value={
                              isToggleButton === true
                                ? (csfaData?.auditDate
                                    ? dayjs(csfaData.auditDate).toDate()
                                    : null)
                                : values.targetDate
                            }
                            onChange={(date: Date | null) => {
                              if (!isToggleButton) {
                                setFieldValue("targetDate", date);
                              }
                            }}
                            disabled={isToggleButton === true}   // ✅ Disable when toggle ON
                            minDate={isToggleButton ? undefined : tomorrow}
                            maxDate={maxDate}
                            dateFormat="yyyy-MM-dd"
                            errors={errors.targetDate}
                            touched={touched.targetDate}
                          />
                        </div>  
                        <div className="col-12 col-sm-6 col-lg-3">
                          <SelectField
                            label="Department"
                            value={capaDepartmentOptions.find(
                                    (option) => option.value == values.departments) || ""}
                            name="departments"
                            placeholder="Choose Department"
                            options={capaDepartmentOptions}
                            onChange={(selectedOption: SelectOptions) => {
                              setFieldValue("departments", selectedOption?.value);
                              setFieldValue("sections", "");
                              setFieldValue("sectionHead", "");
                              setFieldValue("assignedLineManager", "");
                              setFieldValue("assignedLineManagerName", "");
                              setFieldValue("assignedLineManagerEmail", "");
                              fetchCapaSections(selectedOption?.value);
                            }}
                            disabled={isToggleButton}
                          />
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                          <SelectField
                            label="Section"
                            value={capaSectionOptions.find(
                                    (option) => option.value == values.sections
                                  ) || ""}
                            name="sections"
                            placeholder="Choose Section"
                            options={capaSectionOptions}
                            onChange={(selectedOption: SelectOptions) => {
                              setFieldValue("sections", selectedOption?.value);
                              setFieldValue("assignedLineManager", "");
                              setFieldValue("assignedLineManagerName", "");
                              setFieldValue("assignedLineManagerEmail", "");
                              setFieldValue("sectionHead", "");
                              fetchSectionHead(csfaData?.visitedUnit, values?.departments, selectedOption?.value, setFieldValue, values);
                              fetchLineManager(values?.departments, selectedOption?.value);
                            }}
                            disabled={isToggleButton}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                          <div className="mb-2">
                            <InputField
                              type="text"
                              label="Section Head"
                              value={values.sectionHead || ""}
                              name="sectionHead"
                              placeholder="Section Head"
                              disabled={true}
                              onBlur={handleBlur}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        </div>      
                        {/* <div className="row form_grider d1 g-2 my-0">      
                         <div className="col-12 col-sm-6 col-lg-3">
                           <SelectField
                            label="Assigned To Role"
                            value={values.assignedTo}
                            value={[
                              {
                                label: values.assignedTo,
                                value: values.assignedTo,
                              },
                            ]}
                            name="assignedTo"
                            placeholder="Choose Role"
                            options={assignedToOptions}
                            onChange={(selectedOption: SelectOptions) => {
                              setFieldValue("assignedTo", selectedOption.value);
                            }}
                            onBlur={handleBlur}
                            errors={touched.assignedTo && errors.assignedTo}
                          />
                        </div>
                        {isEmployee && (
                         <div className="row form_grider d1 g-2 my-0">
                          <div className="col-9 col-sm-6 col-lg-3">
                            <SelectField
                            label="Assign to Line Manager"
                            placeholder="Choose Line Manager"
                            name="assignedLineManager"
                            options={lineManagerOptions}
                            isClearable
                            value={
                            lineManagerOptions.find(
                            (option) => option.value === values.assignedLineManager
                            ) || null
                            }
                            onChange={(selectedOption) => {
                            if (selectedOption) {
                            setFieldValue("assignedLineManager", selectedOption.value);
                            setFieldValue("assignedLineManagerName", selectedOption.label);


                            const selectedManager = lineManagerList.find(
                            (item) => item.jsplid === selectedOption.value
                            );
                            setFieldValue(
                            "assignedLineManagerEmail",
                            selectedManager?.linemanagerEmail || ""
                            );
                            } else {
                            setFieldValue("assignedLineManager", null);
                            setFieldValue("assignedLineManagerName", "");
                            setFieldValue("assignedLineManagerEmail", "");
                            }
                            }}
                            />
                          </div>
                          <div className="col-9 col-sm-6 col-lg-3">
                            <InputField
                            label="LineManager Code"
                            value={values.assignedLineManager || ""}
                            disabled
                            />
                          </div>
                          <div className="col-9 col-sm-6 col-lg-3">
                            <InputField
                            label="LineManager Email"
                            value={values.assignedLineManagerEmail || ""}
                            disabled
                            />
                           </div>
                          </div>
                          )}
                      </div>
                      {isContractor && (
                        <div className="row form_grider d1 g-2 my-0">
                          <div className="col-9 col-sm-6 col-lg-3">
                            <InputField
                            label="Assign LineManager (Contractor)"
                            value={csfaData?.contractorName || ""}
                            disabled
                            />
                          </div>
                        <div className="col-9 col-sm-6 col-lg-3">
                          <InputField
                          label="LineManager Code (Contractor)"
                          value={csfaData?.contractorId || ""}
                          disabled
                          />
                        </div>
                        <div className="col-9 col-sm-6 col-lg-3">
                          <InputField
                          label="LineManager Email (Contractor)"
                          value={csfaData?.contractorEmail || ""}
                          disabled
                          />
                        </div>
                       </div>
                      )} */}
                      <div className="row form_grider d1 g-2 my-0">

                      {/* Assigned Role */}
                      <div className="col-12 col-sm-6 col-lg-3">
                        <SelectField
                          label="Assigned To Role"
                          name="assignedTo"
                          placeholder="Choose Role"
                          options={assignedToOptions}
                          value={{
                            label: values.assignedTo,
                            value: values.assignedTo,
                          }}
                          onChange={(option) => {
                            setFieldValue("assignedTo", option.value);
                          }}
                          disabled={isToggleButton}
                        />
                      </div>

                      {/* Manager Name */}
                      <div className="col-12 col-sm-6 col-lg-3">
                        {isEmployee ? (
                          <SelectField
                            label="Assign to Line Manager"
                            placeholder="Choose Line Manager"
                            name="assignedLineManager"
                            options={lineManagerOptions}
                            isClearable
                            value={
                              lineManagerOptions.find(
                                (o) => o.value === values.assignedLineManager
                              ) || null
                            }
                            onChange={(option) => {
                              if (option) {
                                setFieldValue("assignedLineManager", option.value);
                                setFieldValue("assignedLineManagerName", option.label);

                                const manager = lineManagerList.find(
                                  (m) => m.jsplid === option.value
                                );

                                setFieldValue(
                                  "assignedLineManagerEmail",
                                  manager?.linemanagerEmail || ""
                                );
                              } else {
                                setFieldValue("assignedLineManager", "");
                                setFieldValue("assignedLineManagerName", "");
                                setFieldValue("assignedLineManagerEmail", "");
                              }
                            }}
                            disabled={isToggleButton}
                          />
                        ) : (
                          <InputField
                            label="Assign Line Manager (Contractor)"
                            value={csfaData?.contractorName || ""}
                            disabled
                          />
                        )}
                      </div>

                      {/* Manager Code */}
                      <div className="col-12 col-sm-6 col-lg-3">
                        <InputField
                          label={
                            isEmployee
                              ? "Line Manager Code"
                              : "Line Manager Code (Contractor)"
                          }
                          value={
                            isEmployee
                              ? values.assignedLineManager || ""
                              : csfaData?.contractorId || ""
                          }
                          disabled
                        />
                      </div>
                      {/* Manager Email */}
                     <div className="col-12 col-sm-6 col-lg-3">
                        <InputField
                          label={
                            isEmployee
                              ? "Line Manager Email"
                              : "Line Manager Email (Contractor)"
                          }
                          value={
                            isEmployee
                              ? values.assignedLineManagerEmail || ""
                              : csfaData?.contractorEmail || ""
                          }
                          disabled
                        />
                      </div>
                     </div>

                      <div className="text-end mt-2 d-flex justify-content-end">
                        <button
                          className="iconBtn orange"
                          type="button"
                          onClick={() => {
                          if (isObservationIncomplete || !csfaData?.visitedUnit) {
                              toast.error("Please fill all fields in Observation Section");
                            } else {
                              setIsAddActionOpen(true);
                            }
                          }}
                          onClick={handleAddAction}
                        >
                          <img src="/images/svg/plus.svg" alt="Add" />
                          Add Action
                        </button>
                      </div>

                      <div className="admin-table d3 table-responsive mt-3">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Corrective Action</th>
                              <th>Assign to Line Manager</th>
                              <th>Line Manager Email</th>
                              <th>Target Date</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {values?.actionsTakens?.length > 0 ? (
                              values?.actionsTakens.map((row, idx) => (
                                <tr key={idx}>
                                  <td>{row?.correctiveAction}</td>
                                  <td>{row?.assignedLineManagerName ?? ""}</td>                                  
                                  <td>{row?.assignedLineManagerEmail ?? ""}</td>
                                  <td>{row?.targetDate}</td>
                                  <td>{row?.status}</td>
                                  <td>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                      <button
                                        className="tableBtn"
                                        type="button"
                                        onClick={() => {
                                          const updated = [...values.actionsTakens];
                                        updated.splice(idx, 1);
                                        setFieldValue("actionsTakens", updated);
                                      }}
                                    >
                                      <img
                                        style={{
                                          filter:
                                            "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                        }}
                                        src="/images/svg/icons/Delete.svg"
                                        alt="Delete"
                                        width="20"
                                        height="20"
                                      />
                                    </button>
                                   </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="text-center">
                                  No actions added yet
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="text-end mt-4 border-top pt-3  d-flex justify-content-end">
                        <button
                          className="iconBtn green"
                          type="button"
                          title={
                            !(values?.actionsTakens?.length > 0)
                              ? "No actions defined yet."
                              : ""
                          }
                          disabled={!(values?.actionsTakens?.length > 0)}
                          onClick={handleAddObservation}
                        >
                          <img src="/images/svg/icons/Add.svg" alt="Add Obs" />
                          Add Observation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CustomModal>
              <CustomModal
                isOpen={isViewActionOpen}
                onClose={() => setCurrentObservationIndex(null)}
                title="View Actions & File Attachments"
              >
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
                                <td className="text-start">{row?.correctiveAction}</td>
                                <td className="text-start">{row?.sectionHead}</td>
                                <td className="text-start">{row?.assignedLineManagerName ?? ""}</td>
                                <td className="text-start">{row?.targetDate}</td>
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
                            <th style={{ width: "50%" }}>File Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {imagesForView?.length > 0 ? (
                            imagesForView.map((row, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td className="text-start">
                                  {row?.fileId ? (
                                    <>
                                      <a href="#" onClick={(e) => {e.preventDefault(); downloadFile(row?.fileId);}}>
                                      {row?.fileName}{" "}
                                      <img
                                        src={`${BUCKET_URL}/${row?.fileId}`}
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
             {
                <button className="iconBtn green v2 ms-0" type="submit">
                  <span>Save & Preview</span>
                </button>
              }
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default Observations;
