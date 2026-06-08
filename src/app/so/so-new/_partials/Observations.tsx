'use client'
import React, { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import SelectField from "@/components/Form/SelectFields";
import MultiSelectField from "@/components/Form/MultiSelectField";
import { SelectOptions } from "@/components/interfaces";
import DatePickerField from "@/components/Form/DatePickerField";
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
  FETCH_OBSERVATION_TYPE,
  FETCH_OBSERVATION_CATEGORY,
  FETCH_RISK_POTENTIAL,
  FETCH_SO,
  FETCH_LINEMANAGER,
  UPLOAD_FILE,
  DELETE_FILE,
  DOWNLOAD_FILE,
  BUCKET_URL,
} from "@/config/apiConfig";

type SelectOption = { value: number | string; label: string };

interface ObservationsDataInterface {
  observationType: string;
  observationTypeDisplay: string;
  observationCategory: string;
  observationCategoryDisplay: string;
  observationSubcategory: string;
  observationSubcategoryDisplay: string;
  observationSubsubcategory: SelectOption[];
  observationDetail: string;
  riskPotentials: string;
  riskPotentialsDisplay: string;
  createdat: string;
  createdby: string;
  updatedat: string;
  updatedby: string;
  observationNo: number;
  rowIndex: number;
  id: number;
  status: string;
  exactLocation: string;
  actionsTaken: {
    actionId: string;
    actionMedia: string;
    actionMediaType: string;
    actiontaken: string;
    actiontakenByUser: string;
    actionType: string;
    assignLinemanager: string;
    capaDepartments: string;
    cfsaNo: string;
    cfsaVerifyEmailStatus: string;
    cfsaVerifyStatus: string;
    createdat: string;
    createdby: string;
    departmentHodName: string;
    departments: string;
    emailStatus: string;
    findings: string;
    findingFlag: string;
    flagId: string;
    flagImage1: string;
    flagImage2: string;
    hodRemark: string;
    imIrFlag: string;
    imStatus: string;
    imSubmoduleName: string;
    linemanagerName: string;
    observationNo: string;
    reassignReason: string;
    responsibleDepartmentName: string;
    responsibleSectionName: string;
    rowIndex: number;
    sectionhead: string;
    sections: string;
    siNo: string;
    status: string;
    targetdate: string;
    units: string;
    updatedat: string;
    updatedby: string;
  }[];
  soImages: {
    siNo: string;
    observationNo: string;
    actionId: number;
    beforefile: string;
    beforefileid: string;
    beforefilename: string;
    beforeCreatedat: string;
    beforeCreatedby: string;
    afterfile: string;
    afterfileid: string;
    afterfilename: string;
    afterCreatedat: string;
    afterCreatedby: string;
  }[];
}
interface FormValues {
  capaDepartments: string;
  capaSection: string;
  capaSectionHeadName: string;
  assignLineManager: string;
  lineManagerName: string;
  responsibleDepartmentName: string;
  responsibleSectionName: string;
  observationType: string;
  observationTypeDisplay: string;
  observationCategory: string;
  observationCategoryDisplay: string;
  observationSubcategory: string;
  observationSubcategoryDisplay: string;
  observationSubsubcategory: SelectOption[];
  observationDetail: string;
  riskPotentials: string;
  riskPotentialsDisplay: string;
  targetDate: string;
  exactLocation: string;
  status: string;
  actiontaken: string;
  observations: ObservationsDataInterface[];
  lwImages: any[];
  actionsTakens: any[];
}
interface ObservationsInterface {
  observationData: ObservationsDataInterface[];
  setObservationData: React.Dispatch<React.SetStateAction<ObservationsDataInterface[]>>;
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;  
  typeOfObservationsOptions: SelectOptions[];
  observationCategoriesOptions: SelectOptions[];
  riskPotentialOptions: SelectOptions[];
  riskPotentialList: any[];  
  soData: any;
  setSOData: any;
  setIsPreviewActive: any;
  ocrDraftFields?: any;
  onSendToChat?: (message: { role: string; content: string }) => void;
}

const Observations = ({
  observationData,
  setObservationData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  typeOfObservationsOptions,
  observationCategoriesOptions,
  riskPotentialOptions,
  riskPotentialList,
  soData,
  setSOData,
  setIsPreviewActive,
  ocrDraftFields,
  onSendToChat
  ,
  chatSelectedTemplate,
  clearChatSelectedTemplate,
}: ObservationsInterface & { chatSelectedTemplate?: string | null; clearChatSelectedTemplate?: () => void }) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [capaDepartmentOptions, setCapaDepartmentOptions] = useState(emptySelector);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector);
  const [capaSectionOptions, setCapaSectionOptions] = useState(emptySelector);
  
  // AI Image analysis states
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    disasterClass: 'Natural' | 'Artificial' | null;
    disasterType: string;
    details: string;
    risk: string;
    confidence: number;
    colorPalette: string[];
    brightness: string;
    detectedFeatures: string[];
  } | null>(null);
  // Manual override for disaster type (user can select instead of AI suggestion)
  const [manualDisasterType, setManualDisasterType] = useState<string>("");
  // Whether selecting a template is required before upload
  const [requireTemplateBeforeUpload, setRequireTemplateBeforeUpload] = useState<boolean>(true);

  const disasterTemplates: { [key: string]: { details: string; risk: string; confidence: number; isNatural: boolean } } = {
    "Wildfire / Vegetation Fire": { details: "Potential wildfire or vegetation fire. Inspect for active flames and spread.", risk: "Extreme", confidence: 90, isNatural: true },
    "Inundation / Flooding": { details: "Flooding/inundation detected. Check water ingress and affected assets.", risk: "Extreme", confidence: 88, isNatural: true },
    "Industrial Chemical/Oil Spill": { details: "Possible chemical/oil spill. Avoid ignition sources and contain leakage.", risk: "High", confidence: 86, isNatural: false },
    "Earthquake Disruption": { details: "Structural damage consistent with seismic activity. Assess collapse risk and debris.", risk: "Extreme", confidence: 85, isNatural: true },
    "Explosion / Fireball": { details: "Explosion signature detected. Look for blast damage and thermal hotspots.", risk: "Extreme", confidence: 90, isNatural: false },
    "Structural Collapse": { details: "Structural collapse or integrity failure. Evacuate and secure area.", risk: "High", confidence: 87, isNatural: false },
    "Landslide / Rockfall": { details: "Slope failure/landslide risk. Check access and stability of surrounding slopes.", risk: "Extreme", confidence: 88, isNatural: true },
    "Thermal / Fire Hazard": { details: "Thermal/heat source detected. Possible fire hazard or hot equipment — verify immediately.", risk: "Extreme", confidence: 80, isNatural: false },
    "Flooding / Accumulation": { details: "Cool-spectrum signature suggesting water accumulation. Inspect drainage and assets.", risk: "High", confidence: 75, isNatural: true },
    "Vegetation / Environmental Hazard": { details: "Vegetation-related or environmental disturbance observed.", risk: "Moderate", confidence: 70, isNatural: true },
    "Structural / Debris Hazard": { details: "Debris or structural textures detected. Assess for trip/hazard risks and repairs.", risk: "Moderate", confidence: 68, isNatural: false },
    "Environmental Anomaly": { details: "Ambiguous visual features; further inspection recommended.", risk: "Moderate", confidence: 65, isNatural: true },
  };

  const runImageAnalysis = (file: File) => {
    setIsAnalyzingImage(true);
    setAnalysisResult(null);

    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 100;
      canvas.height = 100;
      if (ctx) {
        ctx.drawImage(img, 0, 0, 100, 100);
        const imgData = ctx.getImageData(0, 0, 100, 100);
        const data = imgData.data;

        let rSum = 0, gSum = 0, bSum = 0;
        let brightnessSum = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          rSum += r;
          gSum += g;
          bSum += b;
          brightnessSum += (0.299 * r + 0.587 * g + 0.114 * b);
        }

        const totalPixels = data.length / 4;
        const avgR = rSum / totalPixels;
        const avgG = gSum / totalPixels;
        const avgB = bSum / totalPixels;
        const avgBrightness = brightnessSum / totalPixels;

        const redIntensity = avgR - Math.max(avgG, avgB);
        const blueIntensity = avgB - Math.max(avgR, avgG);
        const greenIntensity = avgG - Math.max(avgR, avgB);
        const redDominance = redIntensity > 25;
        const blueDominance = blueIntensity > 25;
        const greenDominance = greenIntensity > 15;
        const brightnessDesc = avgBrightness > 180 ? "High Exposure (Intense Source)" : avgBrightness < 75 ? "Low Exposure (Dark/Smoke)" : "Moderate Exposure";
        
        const filenameLower = file.name.toLowerCase();
        let disasterType = "Environmental Anomaly";
        let isNatural = false;
        let details = "";
        let risk = "High";
        let confidence = 85;
        let features = [];

        if (redDominance && avgBrightness > 100) {
          features.push("Warm/red-dominant spectrum detected");
        } else if (blueDominance && avgBrightness > 90) {
          features.push("Cool/blue-dominant spectrum detected");
        } else if (greenDominance) {
          features.push("Vegetation/green spectrum detected");
        } else {
          features.push("Neutral/mixed spectrum detected");
        }

        if (filenameLower.includes("fire") || filenameLower.includes("wildfire") || filenameLower.includes("burn") || filenameLower.includes("forest")) {
          disasterType = "Wildfire / Vegetation Fire";
          isNatural = filenameLower.includes("wildfire") || filenameLower.includes("forest");
          details = isNatural 
            ? "Uncontrolled natural wildfire detected in forest/vegetation zone. Features show intense thermal radiance."
            : "Man-made/Industrial fire incident. Thermal radiation poses significant risk to structure safety.";
          risk = "Extreme";
          confidence = 97;
        } else if (filenameLower.includes("flood") || filenameLower.includes("water") || filenameLower.includes("rain") || filenameLower.includes("river") || filenameLower.includes("submerge")) {
          disasterType = "Inundation / Flooding";
          isNatural = true;
          details = "Large-scale natural flooding/inundation detected. Visual footprint shows low brightness, mud sediment, and cool-spectrum reflections.";
          risk = "Extreme";
          confidence = 94;
        } else if (filenameLower.includes("spill") || filenameLower.includes("oil") || filenameLower.includes("chemical") || filenameLower.includes("leak") || filenameLower.includes("toxic")) {
          disasterType = "Industrial Chemical/Oil Spill";
          isNatural = false;
          details = "Hazardous chemical or hydrocarbon spill (artificial disaster). Irregular floor reflection and toxic slick features identified.";
          risk = "High";
          confidence = 92;
        } else if (filenameLower.includes("earthquake") || filenameLower.includes("quake") || filenameLower.includes("crack") || filenameLower.includes("seismic")) {
          disasterType = "Earthquake Disruption";
          isNatural = true;
          details = "Structural rubble and fractures consistent with seismic activity (natural disaster). Severe displacement detected.";
          risk = "Extreme";
          confidence = 89;
        } else if (filenameLower.includes("explosion") || filenameLower.includes("blast") || filenameLower.includes("bomb")) {
          disasterType = "Explosion / Fireball";
          isNatural = false;
          details = "Industrial explosion or blast (artificial disaster). Thermal energy and dust plume signatures detected.";
          risk = "Extreme";
          confidence = 95;
        } else if (filenameLower.includes("collapse") || filenameLower.includes("structure") || filenameLower.includes("ruin")) {
          disasterType = "Structural Collapse";
          isNatural = false;
          details = "Structural collapse/integrity failure (artificial disaster). Irregular fracture geometries and debris patterns detected.";
          risk = "High";
          confidence = 90;
        } else if (filenameLower.includes("landslide") || filenameLower.includes("mud") || filenameLower.includes("avalanche")) {
          disasterType = "Landslide / Rockfall";
          isNatural = true;
          details = "Slope failure/landslide (natural disaster). Heavy mass displacement of mud, soil, or rock detected.";
          risk = "Extreme";
          confidence = 93;
        } else {
          if (redDominance && avgBrightness > 130 && avgR > 140) {
            disasterType = "Thermal / Fire Hazard";
            isNatural = false;
            details = "Anomaly: Strong thermal/fire-red signature. Potential active fire or high heat source detected.";
            risk = "Extreme";
            confidence = 78;
          } else if (blueDominance && avgBrightness > 100 && avgB > 130) {
            disasterType = "Flooding / Accumulation";
            isNatural = true;
            details = "Anomaly: Uniform cool spectrum indicating massive water accumulation or active inundation.";
            risk = "High";
            confidence = 76;
          } else if (greenDominance && avgBrightness > 85 && avgG > 110) {
            disasterType = "Vegetation / Environmental Hazard";
            isNatural = true;
            details = "Anomaly: Green-dominant spectrum suggests vegetation disturbance or environmental hazard.";
            risk = "Moderate";
            confidence = 72;
          } else if (avgBrightness < 95) {
            disasterType = "Structural / Debris Hazard";
            isNatural = false;
            details = "Anomaly: Mixed spectrum and structural texture consistent with debris, rubble, or non-fire damage.";
            risk = "Moderate";
            confidence = 70;
          } else {
            disasterType = "Environmental Anomaly";
            isNatural = true;
            details = "Anomaly: Ambiguous visual features with mixed color spectrum. Further inspection is recommended.";
            risk = "Moderate";
            confidence = 68;
          }
        }

        const palette = [
          `rgba(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)}, 0.8)`,
          `rgba(${Math.round(avgR*0.8)}, ${Math.round(avgG*0.8)}, ${Math.round(avgB*1.2)}, 0.8)`,
          `rgba(${Math.round(avgR*1.2)}, ${Math.round(avgG*0.7)}, ${Math.round(avgB*0.7)}, 0.8)`,
        ];

          setTimeout(() => {
            setAnalysisResult({
            disasterClass: isNatural ? 'Natural' : 'Artificial',
            disasterType,
            details,
            risk,
            confidence,
            colorPalette: palette,
            brightness: brightnessDesc,
            detectedFeatures: features
            });
            setIsAnalyzingImage(false);
            URL.revokeObjectURL(imgUrl);
          }, 1200);
        }
      };

    img.onerror = () => {
      setIsAnalyzingImage(false);
      URL.revokeObjectURL(imgUrl);
    };
  };
  // const [capaSection, setCapaSection] = useState("");
  // const [typeOfObservationsOptions, setTypeOfObservationsOptions] =
  //   useState(emptySelector);
  // const [observationType, setObservationType] = useState("");
  // const [observationCategoriesOptions, setObservationCategoriesOptions] =
  //   useState(emptySelector);
  // const [observationCategory, setObservationCategory] = useState("");
  // const [riskPotentialOptions, setRiskPotentialOptions] =
  //   useState(emptySelector);
  // const [riskPotentials, setRiskPotentials] = useState("");
  // const [riskPotentialList, setRiskPotentialList] = useState([]);
  const [observationSubCategoriesOptions, setObservationSubCategoriesOptions] =
    useState(emptySelector);
  const [observationSubcategory, setObservationSubcategory] = useState("");
  const [observationDetail, setObservationDetail] = useState("");
  const [subSubCategoriesOptions, setSubSubCategoriesOptions] =
    useState(emptySelector);
  const [capaLineManager, setCapaLineManager] = useState("");
  const [capaSectionHeadName, setCapaSectionHeadName] = useState("");
  const [capaDepartments, setCapaDepartments] = useState("");
  const [departmentHodName, setDepartmentHodName] = useState("");
  const [calculatedDate, setCalculatedDate] = useState("");
  const [observationDraft, setObservationDraft] = useState({
    observationType: "",
    observationTypeDisplay: "",
    observationCategory: "",
    observationCategoryDisplay: "",
    observationSubcategory: "",
    observationSubcategoryDisplay: "",
    observationSubsubcategory: [],
    observationDetail: "",
    riskPotentials: "",
    riskPotentialsDisplay: "",
    exactLocation: "",
    actionsTaken: [],
    soImages: [],
  });
  const [actionDraft, setActionDraft] = useState({
    siNo: "",
    actiontaken: "",
    createdat: null,
    createdby: user?.createdBy || "",
    updatedat: null,
    updatedby: user?.updatedBy || "",
    actionId: 0,
    observationNo: 0,
    assignLinemanager: "",
    linemanagerName: "",
    departments: "",
    sections: "",
    responsibleDepartmentName: "",
    responsibleSectionName: "",
    sectionhead: null,
    targetdate: null,
    status: "",
  });
  const [actionsDraft, setActionsDraft] = useState([]); // for actions of current observation
  const [soImageDraft, setSoImageDraft] = useState({
    siNo: "",
    observationNo: 0,
    actionId: 0,
    beforefile: "",
    beforefileid: "",
    beforefilename: "",
    beforeCreatedat: null,
    beforeCreatedby: "",
    afterfile: "",
    afterfileid: "",
    afterfilename: "",
    afterCreatedat: null,
    afterCreatedby: "",
  });
  const emptySoImageDraft = {
    siNo: "",
    observationNo: 0,
    actionId: 0,
    beforefile: "",
    beforefileid: "",
    beforefilename: "",
    beforeCreatedat: null,
    beforeCreatedby: "",
    afterfile: "",
    afterfileid: "",
    afterfilename: "",
    afterCreatedat: null,
    afterCreatedby: "",
  };
  const [soImagesDraft, setSoImagesDraft] = useState([]);
  const [nextObservationNo, setNextObservationNo] = useState(1);
  const [currentObservationIndex, setCurrentObservationIndex] = useState(null);
  const [actionsForView, setActionsForView] = useState([]);
  const [imagesForView, setImagesForView] = useState([]);
  const [targetDays, setTargetDays] = useState("");

  const initialValues = {
    capaDepartments: "", //soData?.department || "",
    capaSection: "",
    capaSectionHeadName: "",
    assignLineManager: "",
    lineManagerName: "",
    responsibleDepartmentName: "",
    responsibleSectionName: "",
    observationType: "",
    observationTypeDisplay: "",
    observationCategory: "",
    observationCategoryDisplay: "",
    observationSubcategory: "",
    observationSubcategoryDisplay: "",
    observationSubsubcategory: [],
    observationDetail: "",
    riskPotentials: "",
    riskPotentialsDisplay: "",
    targetDate: "",
    exactLocation: "",
    actiontaken: "",
    observations: soData?.observations || observationData || [],
    soImages: [],
    actionsTakens: []
  };
  // const toggleSection = (section: keyof typeof openSections) => {
  //   setOpenSections((prev) => ({
  //     ...prev,
  //     [section]: !prev[section],
  //   }));
  // };
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [isViewActionOpen, setIsViewActionOpen] = useState(false);
  const [isToggleButton, setIsToggleButton] = useState(false);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  // Preview states for showing image before uploading
  const [beforePreviewUrl, setBeforePreviewUrl] = useState<string | null>(null);
  const [beforePendingFile, setBeforePendingFile] = useState<File | null>(null);
  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  const [afterPreviewUrl, setAfterPreviewUrl] = useState<string | null>(null);
  const [afterPendingFile, setAfterPendingFile] = useState<File | null>(null);
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);

  const singleObservationValidationSchema = Yup.object().shape({
    observationDetail: Yup.string().required("ObservationDetail is required"),
    observationType: Yup.string().required("Observation Type is required"),
    observationCategory: Yup.string().required(
      "Observation Category is required"
    ),
    observationSubcategory: Yup.string().required(
      "Observation Subcategory is required"
    ),
    observationSubsubcategory: Yup.string().required(
      "Observation Sub-Subcategory is required"
    ),
    riskPotentials: Yup.string().required("Risk Potential is required"),
    exactLocation: Yup.string().required("Exact Location is required"),
  });

  // useEffect(() => {
  //   if (soData?.unit || unitData?.unit) {
  //     fetchCapaDepartments(soData?.unit ?? unitData.unit);
  //     fetchTypeOfObservations();
  //     fetchObservationCategory();
  //     fetchRiskPotential();
  //   }
  // }, [soData?.unit || unitData.unit]);
  const fetchCapaDepartments = async (unitId) => {
    try {
      setCapaDepartmentOptions(emptySelector);
      setCapaSectionOptions(emptySelector);
      //setSelectedSection(null);
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
    fetchCapaDepartments(soData?.unit);
  },[soData?.unit]);
  
  // useEffect(() => {
  //   fetchCapaSections(soData?.department);
  // }, [soData?.department]);
  
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
        setFieldValue("capaSectionHeadName", response?.sectionHead?.linemanagerName);
        setCapaSectionHeadName(response?.sectionHead?.linemanagerName);
        setActionDraft((prev) => ({
          ...prev,
          sectionhead: response?.sectionHead?.linemanagerName,
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
    setActionsForView(values.observations[index].actionsTaken);
    setImagesForView(values.observations[index].soImages);
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
  // Step 1: Show local preview (no upload yet)
  const handleBeforeFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Revoke old preview URL to prevent memory leak
    if (beforePreviewUrl) URL.revokeObjectURL(beforePreviewUrl);
    const previewUrl = URL.createObjectURL(file);
    setBeforePreviewUrl(previewUrl);
    setBeforePendingFile(file);
  };

  // Step 2: Confirm and actually upload
  const confirmBeforeUpload = async () => {
    if (!beforePendingFile) return;
    setIsUploadingBefore(true);
    const file = beforePendingFile;
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
          siNo: "",
          observationNo: 0,
          actionId: 0,
          beforefile: file.name,
          beforefilename: file.name,
          beforeCreatedat: new Date().toISOString().split("T")[0],
          beforeCreatedby: user.updatedBy || "",
          beforefileid: response?.objectId,
          beforefileType: manualDisasterType || "",
          beforefileTemplateDetail: manualDisasterType ? (disasterTemplates[manualDisasterType]?.details || "") : "",
        };
        setSoImageDraft((prev) => ({
          ...prev,
          ...newFileData,
        }));
        // If user manually selected a disaster type, use that template instead of auto-analyzing
        if (manualDisasterType) {
          const templ = disasterTemplates[manualDisasterType];
          setAnalysisResult({
            disasterClass: templ.isNatural ? 'Natural' : 'Artificial',
            disasterType: manualDisasterType,
            details: templ.details,
            risk: templ.risk,
            confidence: templ.confidence,
            colorPalette: [],
            brightness: "User-selected",
            detectedFeatures: ["User selected template"]
          });
        } else {
          // Run AI feature extraction analysis on the before image
          runImageAnalysis(file);
        }
        toast.success("Before image uploaded successfully!");
        // Clear preview after successful upload
        if (beforePreviewUrl) URL.revokeObjectURL(beforePreviewUrl);
        setBeforePreviewUrl(null);
        setBeforePendingFile(null);
      } else {
        toast.error("Upload failed: " + (response?.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("Error uploading image.");
      console.error(error);
    } finally {
      setIsUploadingBefore(false);
    }
  };

  const cancelBeforePreview = () => {
    if (beforePreviewUrl) URL.revokeObjectURL(beforePreviewUrl);
    setBeforePreviewUrl(null);
    setBeforePendingFile(null);
    if (beforeFileInputRef.current) beforeFileInputRef.current.value = "";
  };
  //working code file uploading..end
  // Step 1: Show local preview for after image
  const handleAfterFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (afterPreviewUrl) URL.revokeObjectURL(afterPreviewUrl);
    const previewUrl = URL.createObjectURL(file);
    setAfterPreviewUrl(previewUrl);
    setAfterPendingFile(file);
  };

  // Step 2: Confirm and actually upload after image
  const confirmAfterUpload = async () => {
    if (!afterPendingFile) return;
    setIsUploadingAfter(true);
    const file = afterPendingFile;
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
          siNo: "",
          observationNo: 0,
          actionId: 0,
          afterfile: file.name,
          afterfilename: file.name,
          afterCreatedat: new Date().toISOString().split("T")[0],
          afterCreatedby: user.updatedBy || "",
          afterfileid: response?.objectId,
        };
        setSoImageDraft((prev) => ({
          ...prev,
          ...newFileData,
        }));
        toast.success("After image uploaded successfully!");
        if (afterPreviewUrl) URL.revokeObjectURL(afterPreviewUrl);
        setAfterPreviewUrl(null);
        setAfterPendingFile(null);
      } else {
        toast.error("Upload failed: " + (response?.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("Error uploading image.");
      console.error(error);
    } finally {
      setIsUploadingAfter(false);
    }
  };

  const cancelAfterPreview = () => {
    if (afterPreviewUrl) URL.revokeObjectURL(afterPreviewUrl);
    setAfterPreviewUrl(null);
    setAfterPendingFile(null);
    if (afterFileInputRef.current) afterFileInputRef.current.value = "";
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
    type: "before" | "after" | "row"
  ) => {
    let payload = [];
    let fileToDelete = "";
    if (type == "before" && (soImageDraft.beforefileid ?? "") != "") {
      fileToDelete = soImageDraft.beforefileid;
      payload = [fileToDelete];
    } else if (type == "after" && (soImageDraft.afterfileid ?? "") != "") {
      fileToDelete = soImageDraft.afterfileid;
      payload = [fileToDelete];
    } else if (type == "row") {
      if ((soImagesDraft[index].beforefileid ?? "") != "") {
        payload.push(soImagesDraft[index].beforefileid);
      }
      if ((soImagesDraft[index].afterfileid ?? "") != "") {
        payload.push(soImagesDraft[index].afterfileid);
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
        if (type == "before") {
          setSoImageDraft((prev) => ({
            ...prev,
            beforefile: "",
            beforefilename: "",
            beforeCreatedat: null,
            beforeCreatedby: "",
            beforefileid: "",
          }));
          if (beforeFileInputRef.current) {
            beforeFileInputRef.current.value = "";
          }
        } else if (type == "after") {
          setSoImageDraft((prev) => ({
            ...prev,
            afterfile: "",
            afterfilename: "",
            afterCreatedat: null,
            afterCreatedby: "",
            afterfileid: "",
          }));
          if (afterFileInputRef.current) {
            afterFileInputRef.current.value = "";
          }
        } else if (type == "row") {
          const updated = [...soImagesDraft];
          updated.splice(index, 1);
          setSoImagesDraft(updated);
        }
      }
    } catch (error) {
      toast.error("Error deleting file.");
      console.error(error);
    }
  };

  const fetchLineManager = async (departmentId, sectionid) => {
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
      } else {
        setLineManagerOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchObservationSubCategory = async (observationType, categoryId) => {
    try {
      setObservationSubCategoriesOptions([]);
      const response = await serverRequest(
        {},
        FETCH_OBSERVATION_CATEGORY +
          `/${categoryId}/${observationType}/GetObservationSubCategories`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.id,
          label: data?.observationSubcategory,
        }));
        setObservationSubCategoriesOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchSubSubCategories = async (type: string, category: string, subcategory: string) => {
    try {
      setSubSubCategoriesOptions([]);
      const response = await serverRequest(
        {},
        FETCH_OBSERVATION_CATEGORY +
          `/${category}/${subcategory}/${type}/GetObservationSubSubCategories`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.observationSubsubcategory,
          label: data?.observationSubsubcategory,
        }));
        setSubSubCategoriesOptions(options);
      }
      else {
        setSubSubCategoriesOptions([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const getTargetDateCalculation = async (targetDays) => {
    if (targetDays > 0) {
      const date = new Date();
      date.setDate(date.getDate() + targetDays);
      return dayjs(date).format("YYYY-MM-DD");
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
          //alert("Please add atleast one observation.");
          toast.error("Please add atleast " + minNoOfObservations + " observations.");
          return;
        }
        setSOData((prevsoData: any) => ({
          ...prevsoData,
          // Ensure these additional fields are maintained if they exist
          ...(prevsoData?.objectId && { objectId: prevsoData.objectId }),
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
        useEffect(() => {
          if (!chatSelectedTemplate) return;
          const templ = disasterTemplates[chatSelectedTemplate];
          if (!templ) return;
          setManualDisasterType(chatSelectedTemplate);
          setFieldValue("observationDetail", templ.details);
          
          if (templ.risk) {
            const matchedRisk = riskPotentialOptions.find((opt: any) => 
              opt.label.toLowerCase().includes(templ.risk.toLowerCase()) ||
              templ.risk.toLowerCase().includes(opt.label.toLowerCase())
            );
            if (matchedRisk) {
              setFieldValue("riskPotentials", matchedRisk.value);
              setFieldValue("riskPotentialsDisplay", matchedRisk.label);
              
              const targetDays = riskPotentialList.find(
                (x: any) => x.id.toString() === matchedRisk.value.toString()
              )?.targetDays || 1;
              
              getTargetDateCalculation(targetDays).then((date) => {
                setFieldValue("targetDate", date);
              });
            }
          }
          
          const matchedType = typeOfObservationsOptions.find((opt: any) => 
             opt.label.toLowerCase().includes("unsafe condition")
          );
          if (matchedType) {
             setFieldValue("observationType", matchedType.value);
             setFieldValue("observationTypeDisplay", matchedType.label);
          }
          
          const categoryToMatch = templ.isNatural ? "Natural Disaster" : "Artificial Disaster";
          const matchedCategory = observationCategoriesOptions.find((opt: any) => 
            opt.label.toLowerCase().includes(categoryToMatch.toLowerCase())
          );
          if (matchedCategory) {
             setFieldValue("observationCategory", matchedCategory.value);
             setFieldValue("observationCategoryDisplay", matchedCategory.label);
             
             if (matchedType) {
                fetchObservationSubCategory(matchedType.value, matchedCategory.value);
             }
          }
          
          toast.info(`Hazard '${chatSelectedTemplate}' selected from chat. Fields mapped automatically.`);
          if (typeof clearChatSelectedTemplate === 'function') clearChatSelectedTemplate();
        }, [chatSelectedTemplate]);
        //Any helper logic put here...
        // const isObservationFormComplete =
        //   !!values.observationType?.trim() &&
        //   !!values.observationCategory?.trim() &&
        //   !!values.observationSubcategory?.trim() &&
        //   !!values.observationDetail?.trim() &&
        //   !!values.riskPotentials?.trim() &&
        //   !!values.exactLocation?.trim();

        //   setFieldValue("observations", [
        //     ...values.observations,
        //     {
        //       name: values.coObserverName,
        //       types: values.coObserverType,
        //       email: values.coObserverEmail,
        //       mobile: values.coObserverMobile,
        //     },
        //   ]);
        //   setFieldValue("observations", []);
        // };

        const isObservationIncomplete = !values.observationType ||
          !values.observationCategory ||
          !values.observationSubcategory ||
          values.observationSubsubcategory.length === 0 ||
          !values.observationDetail ||
          !values.exactLocation ||
          !values.riskPotentials;

        const isUnsafeObservation = values.observationTypeDisplay?.startsWith("Unsafe");

        const addObsWithoutActionDisabled = isObservationIncomplete || isUnsafeObservation;

        const addObsWithoutActionTitle = isObservationIncomplete
          ? "Please fill all fields"
          : isUnsafeObservation
          ? "Ensure actions are defined for unsafe observations."
          : "";
        const saveDraftObservation = () => {
          setSOData((prevsoData: any) => ({
            ...prevsoData,
            // Ensure these additional fields are maintained if they exist
            ...(prevsoData?.objectId && { objectId: prevsoData.objectId }),
            observations: values.observations,
          }));
          
          setObservationData(values.observations);
        };

        useEffect(() => {
          saveDraftObservation();
        }, [values.observations]);

        useEffect(() => {
          if (ocrDraftFields) {
            if (ocrDraftFields.observationDetail) setFieldValue("observationDetail", ocrDraftFields.observationDetail);

            let matchedTypeValue = "";
            let matchedCategoryValue = "";

            if (ocrDraftFields.observationTypeDisplay) {
              const ocrType = ocrDraftFields.observationTypeDisplay.toLowerCase();
              const matchedType = typeOfObservationsOptions.find((opt: any) => {
                const optLabel = opt.label.toLowerCase();
                // Prevent "safe condition" from incorrectly matching "unsafe condition"
                if (optLabel === "safe condition" && ocrType.includes("unsafe")) return false;
                if (ocrType === "safe condition" && optLabel.includes("unsafe")) return false;
                
                return optLabel.includes(ocrType) || ocrType.includes(optLabel);
              });

              if (matchedType) {
                setFieldValue("observationType", matchedType.value);
                setFieldValue("observationTypeDisplay", matchedType.label);
                matchedTypeValue = matchedType.value;
              }
            }
            
            // Default to Unsafe Condition if not set or incorrectly defaulted
            if (!matchedTypeValue && typeOfObservationsOptions.length > 0) {
              const defaultUnsafe = typeOfObservationsOptions.find((opt: any) => 
                opt.label.toLowerCase().includes("unsafe")
              );
              if (defaultUnsafe) {
                setFieldValue("observationType", defaultUnsafe.value);
                setFieldValue("observationTypeDisplay", defaultUnsafe.label);
                matchedTypeValue = defaultUnsafe.value;
              }
            }

            if (ocrDraftFields.observationCategoryDisplay) {
              const matchedCategory = observationCategoriesOptions.find((opt: any) => 
                opt.label.toLowerCase().includes(ocrDraftFields.observationCategoryDisplay.toLowerCase()) ||
                ocrDraftFields.observationCategoryDisplay.toLowerCase().includes(opt.label.toLowerCase())
              );
              if (matchedCategory) {
                setFieldValue("observationCategory", matchedCategory.value);
                setFieldValue("observationCategoryDisplay", matchedCategory.label);
                matchedCategoryValue = matchedCategory.value;
              }
            }

            if (matchedTypeValue && matchedCategoryValue) {
              fetchObservationSubCategory(matchedTypeValue, matchedCategoryValue);
            }

            if (ocrDraftFields.riskPotentialsDisplay) {
              const matchedRisk = riskPotentialOptions.find((opt: any) => 
                opt.label.toLowerCase().includes(ocrDraftFields.riskPotentialsDisplay.toLowerCase()) ||
                ocrDraftFields.riskPotentialsDisplay.toLowerCase().includes(opt.label.toLowerCase())
              );
              if (matchedRisk) {
                setFieldValue("riskPotentials", matchedRisk.value);
                setFieldValue("riskPotentialsDisplay", matchedRisk.label);
                
                const targetDays = riskPotentialList.find(
                  (x: any) => x.id.toString() === matchedRisk.value.toString()
                )?.targetDays || 1;
                
                getTargetDateCalculation(targetDays).then((date) => {
                  setFieldValue("targetDate", date);
                });
              }
            }
          }
        }, [ocrDraftFields]);

        useEffect(() => {
          if (ocrDraftFields && ocrDraftFields.observationSubcategoryDisplay && observationSubCategoriesOptions.length > 0) {
            const matchedSub = observationSubCategoriesOptions.find((opt: any) => 
              opt.label.toLowerCase().includes(ocrDraftFields.observationSubcategoryDisplay.toLowerCase()) ||
              ocrDraftFields.observationSubcategoryDisplay.toLowerCase().includes(opt.label.toLowerCase())
            );
            if (matchedSub) {
              setFieldValue("observationSubcategory", matchedSub.value);
              setFieldValue("observationSubcategoryDisplay", matchedSub.label);
              
              if (values.observationType && values.observationCategory) {
                fetchSubSubCategories(values.observationType, values.observationCategory, matchedSub.value);
              }
            }
          }
        }, [observationSubCategoriesOptions, ocrDraftFields]);

        // Default to Unsafe Condition for any new manual observation
        useEffect(() => {
          if (!values.observationType && typeOfObservationsOptions.length > 0 && !ocrDraftFields) {
            const defaultUnsafe = typeOfObservationsOptions.find((opt: any) => 
              opt.label.toLowerCase().includes("unsafe")
            );
            if (defaultUnsafe) {
              setFieldValue("observationType", defaultUnsafe.value);
              setFieldValue("observationTypeDisplay", defaultUnsafe.label);
            }
          }
        }, [typeOfObservationsOptions, values.observationType, ocrDraftFields]);

        useEffect(() => {
          if (ocrDraftFields && ocrDraftFields.observationSubsubcategory && subSubCategoriesOptions.length > 0) {
            const expectedLabels = Array.isArray(ocrDraftFields.observationSubsubcategory)
              ? ocrDraftFields.observationSubsubcategory.map((x: any) => (x.label || x.value || x).toLowerCase())
              : typeof ocrDraftFields.observationSubsubcategory === 'string'
              ? ocrDraftFields.observationSubsubcategory.split(',').map((x: string) => x.trim().toLowerCase())
              : [];
            
            const matchedOptions = subSubCategoriesOptions.filter((opt: any) => 
              expectedLabels.some((lbl: string) => opt.label.toLowerCase().includes(lbl) || lbl.includes(opt.label.toLowerCase()))
            );
            
            if (matchedOptions.length > 0) {
              setFieldValue("observationSubsubcategory", matchedOptions);
            }
          }
        }, [subSubCategoriesOptions, ocrDraftFields]);

        const handleAddObservation = () => {
          const newObservation = {
            observationType: values.observationType || "",
            observationTypeDisplay: values.observationTypeDisplay || "",
            observationCategory: values.observationCategory || "",
            observationCategoryDisplay: values.observationCategoryDisplay || "",
            observationSubcategory: values.observationSubcategory || "",
            observationSubcategoryDisplay: values.observationSubcategoryDisplay || "",
            observationSubsubcategory: Array.isArray(values.observationSubsubcategory)
            ? values.observationSubsubcategory.map(x => x.label || x.value).join(", ")
            : "",
            observationDetail: values.observationDetail,
            riskPotentials: values.riskPotentials || "",
            riskPotentialsDisplay: values.riskPotentialsDisplay || "",
            actionsTaken: values.actionsTakens || [],
            createdat: dayjs().format("YYYY-MM-DD"),
            updatedat: dayjs().format("YYYY-MM-DD"),
            createdby: user.createdBy || "",
            updatedby: user.updatedBy || "",
            observationNo: nextObservationNo,
            exactLocation: values.exactLocation,
            rowIndex: 0,
            id: 0,
            status: values.actionsTakens?.filter((x) => x.status == "Open").length > 0 ? "WIP" : "Completed",
            soImages: soImagesDraft,
          };

          setFieldValue("observations", [
            ...values.observations,
            newObservation,
          ]);

          setNextObservationNo(nextObservationNo + 1);
          setFieldValue("observationDetail", "");
          setFieldValue("exactLocation", "");
          setFieldValue("observationType", null);
          setFieldValue("observationTypeDisplay", "");
          setFieldValue("observationCategory", null);
          setFieldValue("observationCategoryDisplay", "");
          setFieldValue("observationSubcategoryDisplay", "");
          setFieldValue("observationSubsubcategory", []);
          setFieldValue("observationSubcategory", null);
          setFieldValue("riskPotentials", null);
          setFieldValue("riskPotentialsDisplay", "");
          setFieldValue("actionsTakens", []);
          setFieldValue("soImages", []);

          // Reset actionDraft
          setActionDraft({
            siNo: "",
            actiontaken: "",
            createdat: null,
            createdby: user.createdBy || "",
            updatedat: null,
            updatedby: user.updatedBy || "",
            actionId: 0,
            observationNo: 0,
            assignLinemanager: "",
            linemanagerName: "",
            departments: "",
            sections: "",
            responsibleDepartmentName: "",
            responsibleSectionName: "",
            sectionhead: "",
            targetdate: null,
            status: "",
          });

          // Reset drafts
          setObservationDraft({
            observationType: "",
            observationTypeDisplay: "",
            observationCategory: "",
            observationCategoryDisplay: "",
            observationSubcategory: "",
            observationSubcategoryDisplay: "",
            observationSubsubcategory: [],
            observationDetail: "",
            riskPotentials: "",
            riskPotentialsDisplay: "",
            exactLocation: "",
            actionsTaken: [],
            soImages: [],
          });
          // reset images
          setSoImageDraft({
            siNo: "",
            observationNo: 0,
            actionId: 0,
            beforefile: "",
            beforefileid: "",
            beforefilename: "",
            beforeCreatedat: null,
            beforeCreatedby: "",
            afterfile: "",
            afterfileid: "",
            afterfilename: "",
            afterCreatedat: null,
            afterCreatedby: "",
          });
          //setActionsDraft([]);
          setSoImagesDraft([]);
          setIsAddActionOpen(false);
        };
        const handleAddAction = () => {
          if (isToggleButton === false) {
            if (!values.capaDepartments || !values.responsibleDepartmentName || !values.capaSection || !values.responsibleSectionName || !values.assignLineManager || !values.lineManagerName || !values.capaSectionHeadName) 
              {
              toast.error("Please fill the mandatory fields");
              return;
            }
          }
          if (isToggleButton === true) {
            if (!values.actiontaken) {
              toast.error("Please fill Corrective Action");
              return;
            }
          }
          let actionStatus = isToggleButton === false ? "Open" : "Completed";
          let departments = isToggleButton === false ? values.capaDepartments : null;
          let responsibleDepartmentName = isToggleButton === false ? values.responsibleDepartmentName : null;
          let sections = isToggleButton === false ? values.capaSection : null;
          let responsibleSectionName = isToggleButton === false ? values.responsibleSectionName : null;
          let assignLinemanager = isToggleButton === false ? values.assignLineManager : user.createdBy;
          let linemanagerName = isToggleButton === false ? values.lineManagerName : user.name;
          let sectionHead = isToggleButton === false ? values.capaSectionHeadName : "";
          
          
          const actionToAdd = {
            ...actionDraft,
            siNo: "",
            actiontaken: values.actiontaken,
            createdat: dayjs().format("YYYY-MM-DD"),
            updatedat: dayjs().format("YYYY-MM-DD"),
            createdby: user.createdBy,
            updatedby: user.updatedBy,
            actionId: 0,
            observationNo: nextObservationNo,
            assignLinemanager: assignLinemanager,
            linemanagerName: linemanagerName,
            departments: departments,
            responsibleDepartmentName: responsibleDepartmentName,
            sections: sections,
            responsibleSectionName: responsibleSectionName,
            sectionhead: sectionHead,
            targetdate: values.targetDate,
            status: actionStatus,
          };

          //setActionsDraft((prev) => [...prev, actionToAdd]);

          setFieldValue("actionsTakens", [...values.actionsTakens, actionToAdd,]);
          setFieldValue("actiontaken", "");
        };
        const handleAddObservationNoAction = () => {
          if(
              !values.observationType ||
              !values.observationCategory ||
              !values.observationSubcategory ||
              values.observationSubsubcategory.length === 0 ||
              !values.observationDetail ||
              !values.exactLocation ||
              !values.riskPotentials
            ) {
            //alert("Please fill all fields");
            toast.error("Please fill all fields");
            return;
          } else {
            if(values.observationTypeDisplay.startsWith("Unsafe")) {
              alert("Actions must be defined for Unsafe Observations.");
              return;
            }
            setFieldValue("observations", [
              ...values.observations,
              {
                observationType: values.observationType || "",
                observationTypeDisplay:
                  values.observationTypeDisplay || "",
                observationCategory:
                  values.observationCategory || "",
                observationCategoryDisplay:
                  values.observationCategoryDisplay || "",
                observationSubcategory:
                  values.observationSubcategory || "",
                observationSubcategoryDisplay:
                  values.observationSubcategoryDisplay || "",
                observationSubsubcategory:
                  Array.isArray(values.observationSubsubcategory)
                  ? values.observationSubsubcategory.map(x => x.label || x.value).join(", ")
                  : "",
                observationDetail: values.observationDetail,
                riskPotentials: values.riskPotentials || "",
                riskPotentialsDisplay: values.riskPotentialsDisplay || "",
                createdat: dayjs().format("YYYY-MM-DD"),
                createdby: user.createdBy || "",
                updatedat: dayjs().format("YYYY-MM-DD"),
                updatedby: user.updatedBy || "",
                observationNo: nextObservationNo,
                rowIndex: 0,
                id: 0,
                status: "Completed",
                exactLocation: values.exactLocation,
                actionsTaken: [],
                soImages: soImagesDraft,
              },
            ]);
            setNextObservationNo(nextObservationNo + 1);
            // Reset drafts
            setFieldValue("observationDetail", "");
            setFieldValue("exactLocation", "");
            setFieldValue("observationType", null);
            setFieldValue("observationTypeDisplay", "");
            setFieldValue("observationCategory", null);
            setFieldValue("observationCategoryDisplay", "");
            setFieldValue("observationSubcategoryDisplay", "");
            setFieldValue("observationSubcategory", null);
            setFieldValue("observationSubsubcategory", []);
            setFieldValue("riskPotentials", null);
            setFieldValue("riskPotentialsDisplay", "");
            setFieldValue("actionsTakens", []);
            setFieldValue("soImages", []);
          }
        };
        return (
          <form onSubmit={handleSubmit}>
            <div className="filters">
              <div className="row form_grider d1">
                {/* Details of Observation */}
                <div className="col-12 col-md-3 col-lg-6">
                  <InputField
                    type="text"
                    label="Details of Observation"
                    name="observationDetail"
                    placeholder="Details of Observation"
                    value={values.observationDetail}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={500}
                  />
                </div>
                {/* Exact Location */}
                <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="Exact Location"
                    name="exactLocation"
                    placeholder="Exact Location"
                    value={values.exactLocation}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={500}
                  />
                </div>
                 {/* Risk Potential */}
                <div className="col-md-3">
                  <SelectField
                    label="Risk Potential"
                    value={riskPotentialOptions.find(
                        (option) => option.value == values.riskPotentials
                      ) || ""}
                    name="riskPotentials"
                    placeholder="Select Risk Potential"
                    options={riskPotentialOptions}
                    onChange={async (selectedOption: SelectOptions) => {
                      setFieldValue("riskPotentials", selectedOption.value);
                      setFieldValue("riskPotentialsDisplay", selectedOption.label);
                      setFieldValue("targetDays", riskPotentialList.find(
                          (x) =>
                            x.id.toString() ===
                            selectedOption?.value?.toString()
                        )?.targetDays || 1);
                      let targetDays = riskPotentialList.find((x) => x.id.toString() === selectedOption?.value?.toString()
                                                            )?.targetDays || 1;
                      let targetDate = await getTargetDateCalculation(targetDays)
                      setFieldValue("targetDate", targetDate);
                    }}
                    onBlur={handleBlur}
                    errors={touched.riskPotentials && errors.riskPotentials}
                  />
                </div>
                {/* Type of observation */}
                <div className="col-md-3">
                  <SelectField
                    label="Type"
                    value={
                      typeOfObservationsOptions.find(
                        (option) => option.value == values.observationType
                      ) || ""}
                    name="observationType"
                    placeholder="Select Type"
                    options={typeOfObservationsOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("observationType", selectedOption.value);
                      setFieldValue("observationTypeDisplay", selectedOption.label);
                      setFieldValue("observationSubsubcategory", []);
                      fetchObservationSubCategory(selectedOption.value, values.observationCategory);
                      fetchSubSubCategories(selectedOption.value, values.observationCategory, values.observationSubcategory);
                    }}
                    onBlur={handleBlur}
                    errors={touched.observationType && errors.observationType}
                  />
                </div>
                {/* Observation Category */}
                <div className="col-md-3">
                  <SelectField
                    label="Category"
                    value={observationCategoriesOptions.find(
                        (option) => option.value == values.observationCategory
                      ) || ""}
                    name="observationCategory"
                    placeholder="Select Category"
                    options={observationCategoriesOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("observationCategory", selectedOption.value);
                      setFieldValue("observationCategoryDisplay", selectedOption.label);
                      setFieldValue("observationSubsubcategory", []);
                      fetchObservationSubCategory(values.observationType, selectedOption.value);
                      fetchSubSubCategories(values.observationType, selectedOption.value, values.observationSubcategory);
                    }}
                    onBlur={handleBlur}
                    errors={
                      touched.observationCategory && errors.observationCategory
                    }
                  />
                </div>
               {/* Observation Sub Category */}
                <div className="col-md-3">
                  <SelectField
                    label="SubCategory"
                    value={observationSubCategoriesOptions.find(
                        (option) => option.value == values.observationSubcategory
                      ) || ""}
                    name="observationSubcategory"
                    placeholder="Select Subcategory"
                    options={observationSubCategoriesOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("observationSubcategory", selectedOption.value);
                      setFieldValue("observationSubcategoryDisplay", selectedOption.label);
                      setFieldValue("observationSubsubcategory", []);
                      fetchSubSubCategories(values.observationType, values.observationCategory, selectedOption.value);
                    }}
                    onBlur={handleBlur}
                    errors={
                      touched.observationSubcategory &&
                      errors.observationSubcategory
                    }
                  />
                </div>
                 {/* Observation Sub-Sub Category */}
                <div className="col-md-3">
                   <MultiSelectField
                      label="Sub-SubCategory"
                      value={values.observationSubsubcategory}
                      name="observationSubsubcategory"
                      placeholder="Select Sub-SubCategory"
                      options={subSubCategoriesOptions}
                      selectAllLabel="Select All"
                      outputFormat="object"
                      enableSelectAll={true}
                      onChange={(selectedItems) => {
                        const safeItems = Array.isArray(selectedItems) ? selectedItems : [];
                        setFieldValue("observationSubsubcategory", safeItems);
                      }}
                      errors={touched.observationSubsubcategory && errors.observationSubsubcategory}
                      touched={touched.observationSubsubcategory}
                    />
                </div>

                <div className="col-12 col-md-12 col-lg-12 d-flex justify-content-end pb-4 gap-2">
                  <button
                    type="button"
                    className="iconBtn orange w100 gap-1"
                    onClick={() => {
                      if (isObservationIncomplete) {
                        //alert("Please fill all fields in Observation Section")
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
                      if (isObservationIncomplete || !soData?.unit) {
                        //alert("Please fill all required fields in the Observation Section")
                        toast.error("Please fill all fields in Observation Section");
                      } else {
                        setIsAddActionOpen(true);
                        // setFieldValue("capaDepartments", null);
                        // setFieldValue("responsibleDepartmentName", "");
                        //fetchCapaDepartments(soData?.unit);
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
                  <button
                    className="iconBtn green"
                    type="button"
                    title={addObsWithoutActionTitle}
                    disabled={addObsWithoutActionDisabled}
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
                  </button>
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
                              <th>Details of Observation</th>
                              <th>Type of Observation</th>
                              <th>Observation Category</th>
                              <th>Observation Subcategory</th>
                              <th>Observation Sub-Subcategory</th>
                              <th>Risk Potential</th>
                              <th>Exact Location</th>
                              <th style={{ width: 120 }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {values?.observations?.length > 0 ? (
                              values?.observations.map((row, index) => (
                                <tr key={index}>
                                  <td>{row.observationDetail}</td>
                                  <td>{row.observationTypeDisplay}</td>
                                  <td>{row.observationCategoryDisplay}</td>
                                  <td>{row.observationSubcategoryDisplay}</td>
                                  <td>
                                    {Array.isArray(row.observationSubsubcategory)
                                  ? row.observationSubsubcategory.map(x => x.label || x.value).join(", ")
                                  : row.observationSubsubcategory || ""}
                                  </td>
                                  <td>{row.riskPotentialsDisplay}</td>
                                  <td>{row.exactLocation}</td>
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
                  setSoImageDraft(emptySoImageDraft);
                  setAnalysisResult(null);
                  setIsAnalyzingImage(false);
                  // Clean up preview URLs
                  cancelBeforePreview();
                  cancelAfterPreview();
                }}
                title="File Attachments"
              >
                <div className="row col-12 col-md-12 col-lg-12  d-flex justify-content-between">
                  <div className="col-12 col-md-6 col-lg-3 d-flex flex-column gap-3 mb-2 ms-2">
                    <span>Before Image Upload</span>
                    <input
                      type="file"
                      id="beforeFile"
                      accept="image/*,.pdf,.docx"
                      onChange={handleBeforeFileChange}
                      name="beforeFile"
                      ref={beforeFileInputRef}
                      disabled={isUploadingBefore}
                    />
                    {/* Before Image Preview */}
                    {beforePreviewUrl && beforePendingFile && !soImageDraft.beforefileid && (
                      <div style={{
                        border: '2px dashed #f47920',
                        borderRadius: '10px',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #fff8f0 0%, #fff 100%)',
                        position: 'relative',
                      }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span style={{ fontSize: '14px' }}>👁️</span>
                          <span className="fw-bold small" style={{ color: '#f47920' }}>Preview — Not yet uploaded</span>
                        </div>
                        <img
                          src={beforePreviewUrl}
                          alt="Before Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '120px',
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                            marginBottom: '8px',
                          }}
                        />
                        <div className="small text-muted mb-2" style={{ wordBreak: 'break-all' }}>
                          📄 {beforePendingFile.name} ({(beforePendingFile.size / 1024).toFixed(1)} KB)
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={requireTemplateBeforeUpload}
                              onChange={(e) => setRequireTemplateBeforeUpload(e.target.checked)}
                            />
                            <span className="small">Require template selection before upload</span>
                          </label>
                          <div style={{ flex: 1 }}>
                            <label className="small mb-1">Select Disaster Type</label>
                            <SelectField
                              label=""
                              name="manualDisasterType"
                              placeholder="Choose disaster type to attach to this image"
                              options={Object.keys(disasterTemplates).map((k) => ({ value: k, label: k }))}
                              value={manualDisasterType ? { value: manualDisasterType, label: manualDisasterType } : ""}
                              onChange={(opt: any) => {
                                setManualDisasterType(opt?.value || "");
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-2 small text-muted" style={{ fontSize: '0.85rem' }}>
                          Select a file, preview it, then click the arrow upload button to submit manually.
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm text-white fw-semibold px-3"
                            style={{ backgroundColor: '#28a745', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={confirmBeforeUpload}
                            disabled={isUploadingBefore || (requireTemplateBeforeUpload && !manualDisasterType)}
                          >
                            <span>⬆️</span>
                            {isUploadingBefore ? '⏳ Uploading...' : 'Upload Selected File'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-3"
                            style={{ borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={confirmBeforeUpload}
                            disabled={isUploadingBefore || requireTemplateBeforeUpload}
                            title={requireTemplateBeforeUpload ? 'Disable requirement to enable manual upload without selecting a template' : 'Upload manually without template selection'}
                          >
                            <span>⬆️</span>
                            Manual Upload
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-3"
                            style={{ borderRadius: '4px' }}
                            onClick={cancelBeforePreview}
                            disabled={isUploadingBefore}
                          >
                            ✖ Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <span>After Image Upload</span>
                    <input
                      type="file"
                      id="afterFile"
                      accept="image/*,.pdf,.docx"
                      name="afterFile"
                      ref={afterFileInputRef}
                      onChange={handleAfterFileChange}
                      disabled={isUploadingAfter}
                    />
                    {/* After Image Preview */}
                    {afterPreviewUrl && afterPendingFile && !soImageDraft.afterfileid && (
                      <div style={{
                        border: '2px dashed #0d6efd',
                        borderRadius: '10px',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #f0f4ff 0%, #fff 100%)',
                        position: 'relative',
                      }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span style={{ fontSize: '14px' }}>👁️</span>
                          <span className="fw-bold small" style={{ color: '#0d6efd' }}>Preview — Not yet uploaded</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={requireTemplateBeforeUpload}
                              onChange={(e) => setRequireTemplateBeforeUpload(e.target.checked)}
                            />
                            <span className="small">Require template selection before upload</span>
                          </label>
                          <div style={{ flex: 1 }}>
                            <label className="small mb-1">Select Disaster Type</label>
                            <SelectField
                              label=""
                              name="manualDisasterType"
                              placeholder="Choose disaster type to attach to this image"
                              options={Object.keys(disasterTemplates).map((k) => ({ value: k, label: k }))}
                              value={manualDisasterType ? { value: manualDisasterType, label: manualDisasterType } : ""}
                              onChange={(opt: any) => {
                                setManualDisasterType(opt?.value || "");
                              }}
                            />
                          </div>
                        </div>
                        <img
                          src={afterPreviewUrl}
                          alt="After Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '120px',
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                            marginBottom: '8px',
                          }}
                        />
                        <div className="small text-muted mb-2" style={{ wordBreak: 'break-all' }}>
                          📄 {afterPendingFile.name} ({(afterPendingFile.size / 1024).toFixed(1)} KB)
                        </div>
                        <div className="mb-2 small text-muted" style={{ fontSize: '0.85rem' }}>
                          Select a file, preview it, then click the arrow upload button to submit manually.
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm text-white fw-semibold px-3"
                            style={{ backgroundColor: '#28a745', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={confirmAfterUpload}
                            disabled={isUploadingAfter || (requireTemplateBeforeUpload && !manualDisasterType)}
                          >
                            <span>⬆️</span>
                            {isUploadingAfter ? '⏳ Uploading...' : 'Upload Selected File'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-3"
                            style={{ borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={confirmAfterUpload}
                            disabled={isUploadingAfter || requireTemplateBeforeUpload}
                            title={requireTemplateBeforeUpload ? 'Disable requirement to enable manual upload without selecting a template' : 'Upload manually without template selection'}
                          >
                            <span>⬆️</span>
                            Manual Upload
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-3"
                            style={{ borderRadius: '4px' }}
                            onClick={cancelAfterPreview}
                            disabled={isUploadingAfter}
                          >
                            ✖ Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-3 col-lg-3  d-flex flex-column gap-4 position-relative">
                    <h5>Before Image</h5>
                    <div style={{ position: "relative", width: "100%" }}>
                      {soImageDraft?.beforefileid ? (
                        <div style={{ position: "relative", width: "100%" }}>
                          <button
                            className="iconBtn orange p-2"
                            type="button"
                            style={{ position: "absolute", right: "110px" }}
                            title="Delete"
                            onClick={() => deleteFileFromBucket(0, "before")}
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
                            src={`${BUCKET_URL}/${soImageDraft?.beforefileid}`}
                            alt="Before"
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
                          File Name: {soImageDraft?.beforefilename}
                        </div>
                      ) : (
                        <div className="text-muted small">
                          No image selected
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-12 col-md-3 col-lg-3  d-flex flex-column gap-4 position-relative">
                    <h5>After Image</h5>
                    <div style={{ position: "relative", width: "100%" }}>
                      {/* {siImageDraft.afterPreview ? ( */}
                      {soImageDraft.afterfileid ? (
                        <div style={{ position: "relative", width: "100%" }}>
                          <button
                            className="iconBtn orange p-2"
                            type="button"
                            style={{ position: "absolute", right: "110px" }}
                            title="Delete"
                            onClick={() => deleteFileFromBucket(0, "after")}
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
                            src={`${BUCKET_URL}/${soImageDraft?.afterfileid}`}
                            alt="After"
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
                          File Name: {soImageDraft?.afterfilename}
                        </div>
                      ) : (
                        <div className="text-muted small">
                          No image selected
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isAnalyzingImage && (
                    <div className="col-12 mt-3 p-4 text-center rounded-3 bg-light border position-relative overflow-hidden" style={{ minHeight: '120px' }}>
                      <div className="position-absolute start-0 top-0 h-100 bg-primary opacity-10" style={{
                        width: '100%',
                        animation: 'scanEffect 1.8s ease-in-out infinite'
                      }} />
                      <style>{`
                        @keyframes scanEffect {
                          0% { transform: translateY(-100%); }
                          100% { transform: translateY(100%); }
                        }
                      `}</style>
                      <div className="spinner-border text-primary mb-2 animate-spin" role="status" style={{ borderRightColor: 'transparent' }} />
                      <h6 className="text-primary fw-bold">Analyzing Disaster Features...</h6>
                      <p className="text-muted small mb-0">Extracting color anomalies, luminance vectors, and hazard patterns...</p>
                    </div>
                  )}

                  {analysisResult && (
                    <div className="col-12 mt-3 p-3 rounded-3 border bg-white shadow-sm" style={{ borderLeft: '5px solid #f47920' }}>
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fs-5">🤖</span>
                          <h6 className="fw-bold mb-0 text-dark">AI Computer Vision Features & Mapping</h6>
                        </div>
                        <span className="badge bg-success px-2 py-1 small">Confidence: {analysisResult.confidence}%</span>
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <div className="p-2 bg-light rounded mb-2">
                            <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>Disaster Classification</span>
                            <span className="fw-bold fs-6 text-primary d-flex align-items-center gap-2">
                              {analysisResult.disasterClass === 'Natural' ? '🌍 Natural Disaster' : '🏭 Artificial / Man-made Disaster'}
                            </span>
                          </div>
                          <div className="p-2 bg-light rounded">
                            <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>Identified Hazard Type</span>
                            <span className="fw-bold text-dark">{analysisResult.disasterType}</span>
                          </div>
                        </div>
                        
                        <div className="col-12 col-md-6">
                          <div className="p-2 bg-light rounded mb-2">
                            <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>Luminosity & Color Energy</span>
                            <div className="d-flex align-items-center gap-2 mt-1">
                              <span className="small text-dark fw-medium">{analysisResult.brightness}</span>
                              <div className="d-flex gap-1">
                                {analysisResult.colorPalette.map((col, idx) => (
                                  <div key={idx} style={{ backgroundColor: col, width: '15px', height: '15px', borderRadius: '50%' }} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="p-2 bg-light rounded">
                            <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>Severity Risk Rating</span>
                            <span className="badge bg-danger">{analysisResult.risk}</span>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="p-2 bg-light rounded border-start border-3 border-warning">
                            <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>AI Suggested Details</span>
                            <p className="small mb-0 text-dark italic">{analysisResult.details}</p>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="p-2 bg-white rounded mb-2">
                            <span className="small text-muted d-block" style={{ fontSize: '0.75rem' }}>Manual Hazard Override</span>
                            <SelectField
                              label="Manual Hazard (optional)"
                              value={manualDisasterType ? { value: manualDisasterType, label: manualDisasterType } : ""}
                              name="manualDisasterType"
                              placeholder="Select hazard to override AI"
                              options={Object.keys(disasterTemplates).map(k => ({ value: k, label: k }))}
                              onChange={(selected: any) => setManualDisasterType(selected.value)}
                            />
                          </div>
                        </div>

                        <div className="col-12 text-end mt-2">
                          <button
                            type="button"
                            className="btn btn-sm text-white px-3 py-2 fw-semibold"
                            style={{ backgroundColor: '#f47920', border: 'none', borderRadius: '4px' }}
                            onClick={async () => {
                              const usedResult = manualDisasterType && disasterTemplates[manualDisasterType]
                                ? {
                                    ...analysisResult,
                                    disasterType: manualDisasterType,
                                    details: disasterTemplates[manualDisasterType].details,
                                    risk: disasterTemplates[manualDisasterType].risk,
                                    confidence: disasterTemplates[manualDisasterType].confidence,
                                    disasterClass: disasterTemplates[manualDisasterType].isNatural ? 'Natural' : 'Artificial',
                                  }
                                : analysisResult;

                              setFieldValue("observationDetail", usedResult.details);

                              const analysisText = `${usedResult.disasterType} ${usedResult.details}`.toLowerCase();

                              const findOption = (options: any[], keywords: string[]) =>
                                options.find((opt) =>
                                  keywords.some((keyword) =>
                                    opt?.label?.toLowerCase().includes(keyword)
                                  )
                                );

                              const typePriority = [
                                ["fire", "wildfire", "burn", "thermal", "explosion", "blast", "flare"],
                                ["chemical", "oil", "spill", "toxic", "leak", "hazard", "pollution"],
                                ["earthquake", "quake", "seismic", "collapse", "landslide", "structural", "debris", "damage"],
                                ["flood", "water", "river", "inundation", "rain", "submerge", "hydro"],
                              ];

                              let foundType = null;
                              for (const keywords of typePriority) {
                                if (keywords.some((keyword) => analysisText.includes(keyword))) {
                                  foundType = findOption(typeOfObservationsOptions, keywords);
                                  if (foundType) break;
                                }
                              }
                              if (!foundType) {
                                foundType = typeOfObservationsOptions.find((opt) =>
                                  opt.label.toLowerCase().includes("unsafe") ||
                                  opt.label.toLowerCase().includes("condition")
                                ) || typeOfObservationsOptions[0];
                              }

                              setFieldValue("observationType", foundType.value);
                              setFieldValue("observationTypeDisplay", foundType.label);

                              const categoryPriority = [
                                ["chemical", "oil", "spill", "toxic", "leak", "pollution"],
                                ["fire", "wildfire", "burn", "thermal", "explosion", "blast", "flare"],
                                ["earthquake", "quake", "seismic", "collapse", "landslide", "structural", "debris", "damage"],
                                ["flood", "water", "river", "inundation", "rain", "submerge"],
                              ];

                              let foundCat = null;
                              for (const keywords of categoryPriority) {
                                if (keywords.some((keyword) => analysisText.includes(keyword))) {
                                  foundCat = findOption(observationCategoriesOptions, keywords);
                                  if (foundCat) break;
                                }
                              }
                              if (!foundCat) {
                                foundCat = observationCategoriesOptions.find((opt) =>
                                  opt.label.toLowerCase().includes("emergency") ||
                                  opt.label.toLowerCase().includes("safety") ||
                                  opt.label.toLowerCase().includes("hazard") ||
                                  opt.label.toLowerCase().includes("natural") ||
                                  opt.label.toLowerCase().includes("artificial")
                                ) || observationCategoriesOptions[0];
                              }

                              setFieldValue("observationCategory", foundCat.value);
                              setFieldValue("observationCategoryDisplay", foundCat.label);
                              if (foundType && foundCat) {
                                fetchObservationSubCategory(foundType.value, foundCat.value);
                              }

                              const foundRisk = riskPotentialOptions.find((opt) =>
                                opt.label.toLowerCase().includes(usedResult.risk.toLowerCase())
                              ) || riskPotentialOptions[0];

                              if (foundRisk) {
                                setFieldValue("riskPotentials", foundRisk.value);
                                setFieldValue("riskPotentialsDisplay", foundRisk.label);

                                const targetDays = riskPotentialList.find((x) =>
                                  x.id.toString() === foundRisk.value.toString()
                                )?.targetDays || 1;
                                setFieldValue("targetDays", targetDays);
                                const targetDate = await getTargetDateCalculation(targetDays);
                                setFieldValue("targetDate", targetDate);
                              }

                              toast.success("AI Disaster features mapped to form successfully!");
                              setIsAddImageOpen(false);
                            }}
                          >
                            ✨ Apply AI Mappings
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm text-white px-3 py-2 fw-semibold ms-2"
                            style={{ backgroundColor: '#0d6efd', border: 'none', borderRadius: '4px' }}
                            onClick={() => {
                              if (!analysisResult) return;
                              const chatContent = [
                                manualDisasterType ? `🔧 **Manual Hazard Override:** ${manualDisasterType}` : null,
                                `📋 **Observation Analysis Report**`,
                                ``,
                                `🔹 **Disaster Classification:** ${analysisResult.disasterClass === 'Natural' ? '🌍 Natural Disaster' : '🏭 Artificial / Man-made Disaster'}`,
                                `🔹 **Identified Hazard:** ${analysisResult.disasterType}`,
                                `🔹 **Severity Risk:** ${analysisResult.risk}`,
                                `🔹 **Confidence:** ${analysisResult.confidence}%`,
                                `🔹 **Luminosity:** ${analysisResult.brightness}`,
                                ``,
                                `📝 **AI Suggested Details:**`,
                                `${analysisResult.details}`,
                                ``,
                                `🔍 **Detected Features:**`,
                                ...analysisResult.detectedFeatures.map(f => `  • ${f}`),
                              ].filter(Boolean).join('\n');
                              
                              if (typeof onSendToChat === 'function') {
                                onSendToChat({ role: 'assistant', content: chatContent });
                                toast.success('Observation analysis sent to AI Chat!');
                              } else {
                                toast.error('Chat not available');
                              }
                            }}
                          >
                            📤 Send to Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-end mt-2 mb-2 d-flex justify-content-end">
                    <button
                      className="iconBtn orange"
                      type="button"
                      onClick={() => {
                        if (
                          !soImageDraft.beforefileid &&
                          !soImageDraft.afterfileid
                        ) {
                          toast.error("Please upload files");
                          return;
                        }
                        const imageToAdd = {
                          ...soImageDraft,
                          siNo: "",
                          observationNo: nextObservationNo,
                          actionId: 0,
                          beforefile: soImageDraft.beforefile,
                          beforefileid: soImageDraft.beforefileid,
                          beforefilename: soImageDraft.beforefilename,
                          beforeCreatedat: dayjs().format("YYYY-MM-DD"),
                          beforeCreatedby: user.updatedBy || "",
                          afterfile: soImageDraft.afterfile,
                          afterfileid: soImageDraft.afterfileid,
                          afterfilename: soImageDraft.afterfilename,
                          afterCreatedat: dayjs().format("YYYY-MM-DD"),
                          afterCreatedby: user.updatedBy || "",
                        };
                        setSoImagesDraft((prev) => [...prev, imageToAdd]);
                        //Reset ImageDraft
                        setSoImageDraft({
                          siNo: "",
                          observationNo: 0,
                          actionId: 0,
                          beforefile: "",
                          beforefileid: "",
                          beforefilename: "",
                          beforeCreatedat: null,
                          beforeCreatedby: "",
                          afterfile: "",
                          afterfileid: "",
                          afterfilename: "",
                          afterCreatedat: null,
                          afterCreatedby: "",
                        });
                         // 🔹 Clear file input selections
                        if (beforeFileInputRef.current) {
                          beforeFileInputRef.current.value = "";
                        }
                        if (afterFileInputRef.current) {
                          afterFileInputRef.current.value = "";
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
                          <th>Before File Name</th>
                          <th>After File Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soImagesDraft?.length > 0 ? (
                          soImagesDraft.map((row, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {row?.beforefileid ? (
                                <>
                                  <a href="#" onClick={(e) => {e.preventDefault(); downloadFile(row?.beforefileid);}}>
                                  {row?.beforefilename}{" "}
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
                            <td>
                              {row?.afterfileid ? (
                                <>
                                  <a href="#" onClick={(e) => {e.preventDefault(); downloadFile(row?.afterfileid);}}>
                                  {row?.afterfilename}{" "}
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
                        if (isObservationIncomplete || !soData?.unit) {
                          //alert("Please fill all required fields in the Observation Section")
                          toast.error("Please fill all fields in Observation Section");
                        } else {
                          setIsAddImageOpen(false);
                          setIsAddActionOpen(true);
                          // setFieldValue("capaDepartments", null);
                          // setFieldValue("responsibleDepartmentName", "");
                          //fetchCapaDepartments(soData?.unit);
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
                    <button
                      className="iconBtn green"
                      type="button"
                      title={addObsWithoutActionTitle}
                      disabled={addObsWithoutActionDisabled}
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
                    </button>
                  </div>
                </div>
              </CustomModal>
              {/* Add Action Modal Start */}
              <CustomModal
                isOpen={isAddActionOpen}
                onClose={() => setIsAddActionOpen(false)}
                title="Add Action"
              >
                <div className="filters px-2 py-2 scrollable-container">
                  <div className="row g-3 px-3 ">
                    <div className="col-12 ">
                      {/* Action Form Inputs */}
                      <div className="row form_grider d1 g-2 my-0">
                        <div className="col-12 col-sm-6 col-lg-8">
                          <InputField
                            type="text"
                            label="Corrective Action / Suggestion"
                            value={values.actiontaken}
                            name="actiontaken"
                            placeholder="Corrective Action / Suggestion"
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
                          <InputField
                            type="text"
                            label="Target Date"
                            value={values.targetDate || ""}
                            name="targetDate"
                            placeholder="Target Date"
                            disabled={true}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          />
                          <span
                            className="small text-muted mt-0"
                            // className="small text-muted d-block mt-0"
                            // aria-hidden="true"
                          >
                            Will be as per risk potential
                          </span>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                          <SelectField
                            label="Department"
                            value={capaDepartmentOptions.find(
                                    (option) => option.value == values.capaDepartments) || ""}
                            name="capaDepartments"
                            placeholder="Choose Department"
                            options={capaDepartmentOptions}
                            onChange={(selectedOption: SelectOptions) => {
                              setFieldValue("capaDepartments", selectedOption?.value);
                              setFieldValue("responsibleDepartmentName", selectedOption?.label);
                              setFieldValue("capaSection", null);
                              setFieldValue("responsibleSectionName", "");
                              setFieldValue("assignLineManager", null);
                              setFieldValue("lineManagerName", "");
                              setFieldValue("capaSectionHeadName", "");
                              fetchCapaSections(selectedOption?.value);
                            }}
                            disabled={isToggleButton}
                          />
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                          <SelectField
                            label="Section"
                            value={capaSectionOptions.find(
                                    (option) => option.value == values.capaSection
                                  ) || ""}
                            name="capaSection"
                            placeholder="Choose Section"
                            options={capaSectionOptions}
                            onChange={(selectedOption: SelectOptions) => {
                              setFieldValue("capaSection", selectedOption?.value);
                              setFieldValue("responsibleSectionName", selectedOption?.label);
                              setFieldValue("assignLineManager", null);
                              setFieldValue("lineManagerName", "");
                              setFieldValue("capaSectionHeadName", "");
                              fetchSectionHead(soData?.unit, values?.capaDepartments, selectedOption?.value, setFieldValue, values);
                              fetchLineManager(values?.capaDepartments, selectedOption?.value);
                            }}
                            disabled={isToggleButton}
                          />
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                          <SelectField
                            label="Assign to Line Manager"
                            placeholder="Choose Line Manager"
                            value={lineManagerOptions.find(
                                    (option) => option.value == values.assignLineManager
                                  ) || ""}
                            name="capaLineManager"
                            options={lineManagerOptions}
                            onChange={(selectedOption: SelectOptions) => {
                              setFieldValue("assignLineManager", selectedOption?.value);
                              setFieldValue("lineManagerName", selectedOption?.label);
                            }}
                            disabled={isToggleButton}
                          />
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                          <div className="mb-2">
                            <InputField
                              type="text"
                              label="Section Head"
                              value={values.capaSectionHeadName || ""}
                              name="capaSectionHeadName"
                              placeholder="Section Head"
                              disabled={true}
                              onBlur={handleBlur}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-center d-flex">
                        <strong className="me-4">
                          <span className="text-primary">*</span> Risk Potential
                          / Target Days:
                        </strong>{" "}
                        Extreme: 1 Day, High: 3 Days, Moderate: 7 Days, Low: 15 Days
                      </div>

                      {/* Add Action Button */}
                      <div className="text-end mt-2 d-flex justify-content-end">
                        <button
                          className="iconBtn orange"
                          type="button"
                          onClick={handleAddAction}
                        >
                          <img src="/images/svg/plus.svg" alt="Add" />
                          Add Action
                        </button>
                      </div>

                      {/* Action Draft Table */}
                      <div className="admin-table d3 table-responsive mt-3">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Corrective Action</th>
                              <th>Section Head</th>
                              <th>Assign to Line Manager</th>
                              <th>Target Date</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {values?.actionsTakens?.length > 0 ? (
                              values?.actionsTakens.map((row, idx) => (
                                <tr key={idx}>
                                  <td>{row?.actiontaken}</td>
                                  <td>{row?.sectionhead}</td>
                                  <td>{row?.linemanagerName ?? ""}</td>
                                  <td>{row?.targetdate}</td>
                                  <td>{row?.status}</td>
                                  <td>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                      <button
                                        className="tableBtn"
                                        type="button"
                                        onClick={() => {
                                          const updated = [...values.actionsTakens];
                                        updated.splice(idx, 1);
                                        //setActionsDraft(updated);
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

                      {/* Add Observation Button */}
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
                                      {row?.beforefilename}{" "}
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
                                      {row?.afterfilename}{" "}
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
              {/* {currentStatus == 0 ? (
                <AutoSubmitTrigger />
              ) : (
                <Button
                  color="primary"
                  varient="bordered"
                  radius="sm"
                  type="submit"
                  size="sm"
                  //isDisabled={disabled}
                >
                  Update
                </Button>
              )} */}
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
