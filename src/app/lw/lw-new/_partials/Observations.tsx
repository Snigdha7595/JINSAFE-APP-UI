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
  FETCH_LINEMANAGER,
  UPLOAD_FILE,
  DELETE_FILE,
  BUCKET_URL,
  DOWNLOAD_FILE
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
  lwImages: {
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
  lwData: any;
  setLWData: any;
  setIsPreviewActive: any;
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
  lwData,
  setLWData,
  setIsPreviewActive
}: ObservationsInterface) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [capaDepartmentOptions, setCapaDepartmentOptions] = useState(emptySelector);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector);
  const [capaSectionOptions, setCapaSectionOptions] = useState(emptySelector);
  // const [capaSection, setCapaSection] = useState("");
  // const [typeOfObservationsOptions, setTypeOfObservationsOptions] =
  //   useState(emptySelector);
  // const [observationType, setObservationType] = useState("");
  // const [observationCategoriesOptions, setObservationCategoriesOptions] =
  //   useState(emptySelector);
  // const [observationCategory, setObservationCategory] = useState("");
  const [observationSubTypesOptions, setObservationSubTypesOptions] =
    useState(emptySelector);
  const [observationSubType, setObservationSubType] = useState("");
  const [observationSubCategoriesOptions, setObservationSubCategoriesOptions] =
    useState(emptySelector);
  const [subSubCategoriesOptions, setSubSubCategoriesOptions] =
    useState(emptySelector);
  const [observationDetail, setObservationDetail] = useState("");
  // const [riskPotentialOptions, setRiskPotentialOptions] =
  //   useState(emptySelector);
  // const [riskPotentials, setRiskPotentials] = useState("");
  // const [riskPotentialList, setRiskPotentialList] = useState([]);
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
    lwImages: [],
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
  const [lwImageDraft, setLwImageDraft] = useState({
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
  const emptyLwImageDraft = {
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

  const [lwImagesDraft, setLwImagesDraft] = useState([]);
  const [nextObservationNo, setNextObservationNo] = useState(1);
  const [currentObservationIndex, setCurrentObservationIndex] = useState(null);
  const [actionsForView, setActionsForView] = useState([]);
  const [imagesForView, setImagesForView] = useState([]);
  const [targetDays, setTargetDays] = useState("");
 
  const initialValues: FormValues = {
    capaDepartments: "", //lwData?.department || "",
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
    exactLocation: "",
    observations: lwData?.observations || observationData || [],
    lwImages: [],
    actionsTakens: [],
    targetDate: "",
    status: "",
    actiontaken: "",
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

  useEffect(() => {
    const maxNo = Math.max(
      ...(lwData?.observations?.length ? lwData?.observations?.map(obs => Number(obs?.observationNo))?.filter(n => !isNaN(n)) : [0])
    );
    setNextObservationNo(maxNo + 1);
  }, [lwData?.observations]);

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
    fetchCapaDepartments(lwData?.unit);
  },[lwData?.unit]);
  
  // useEffect(() => {
  //   fetchCapaSections(lwData?.department);
  // }, [lwData?.department]);

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
  const fetchSectionHead = async (unitId, departmentId, sectionId, setFieldValue: (x: string, y: any) => void, values: any) => {
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
    setImagesForView(values.observations[index].lwImages);
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
  const handleBeforeFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // const previewUrl = URL.createObjectURL(file);

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
        };
        // Update state immediately with file info
        setLwImageDraft((prev) => ({
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
  //working code file uploading..end
  const handleAfterFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // const previewUrl = URL.createObjectURL(file);

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
        // console.log("objectId--", response?.objectId);
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
        // Update state immediately with file info
        setLwImageDraft((prev) => ({
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
  const deleteFileFromBucket = async (
    index: number,
    type: "before" | "after" | "row"
  ) => {
    let payload = [];
    let fileToDelete = "";
    if (type == "before" && (lwImageDraft.beforefileid ?? "") != "") {
      fileToDelete = lwImageDraft.beforefileid;
      payload = [fileToDelete];
    } else if (type == "after" && (lwImageDraft.afterfileid ?? "") != "") {
      fileToDelete = lwImageDraft.afterfileid;
      payload = [fileToDelete];
    } else if (type == "row") {
      if ((lwImagesDraft[index].beforefileid ?? "") != "") {
        payload.push(lwImagesDraft[index].beforefileid);
      }
      if ((lwImagesDraft[index].afterfileid ?? "") != "") {
        payload.push(lwImagesDraft[index].afterfileid);
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
          setLwImageDraft((prev) => ({
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
          setLwImageDraft((prev) => ({
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
          const updated = [...lwImagesDraft];
          updated.splice(index, 1);
          setLwImagesDraft(updated);
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
  // const fetchObservationSubType = async (observationType) => {
  //   try {
  //     setObservationSubTypesOptions([]);
  //     const response = await serverRequest(
  //       {},
  //       FETCH_OBSERVATION_TYPE + `/${observationType}/GetObservationSubTypes`,
  //       CONSTANTS.REQUEST_GET,
  //       true,
  //       true,
  //       token
  //     );
  //     if (response.length > 0) {
  //       const options = response.map((data: any) => ({
  //         value: data?.actid,
  //         label: data?.act,
  //       }));
  //       setObservationSubTypesOptions(options);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };
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
  // useEffect(() => {
  //   const fetchDate = async () => {
  //     const date = await getTargetDateCalculation();
  //     setCalculatedDate(date);
  //     setActionDraft((prev) => ({
  //       ...prev,
  //       targetdate: date,
  //     }));
  //   };
  //   fetchDate();
  // }, [targetDays]);
  
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
        setLWData((prevlwData: any) => ({
          ...prevlwData,
          // Ensure these additional fields are maintained if they exist
          ...(prevlwData?.objectId && { objectId: prevlwData.objectId }),
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
          setLWData((prevlwData: any) => ({
            ...prevlwData,
            // Ensure these additional fields are maintained if they exist
            ...(prevlwData?.objectId && { objectId: prevlwData.objectId }),
            observations: values.observations,
          }));
          
          setObservationData(values.observations);
        };

        useEffect(() => {
          saveDraftObservation();
        }, [values.observations]);

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
            lwImages: lwImagesDraft,
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
          setFieldValue("lwImages", []);

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
            lwImages: [],
          });
          // reset images
          setLwImageDraft({
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
          setLwImagesDraft([]);
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
                lwImages: lwImagesDraft,
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
            setFieldValue("lwImages", []);
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
                    touched={touched.observationDetail}                  
                    errors={touched.observationDetail && errors.observationDetail}
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
                    touched={touched.exactLocation}
                    errors={touched.exactLocation && errors.exactLocation}
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
                      errors={touched.observationSubsubcategory}
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
                      if (isObservationIncomplete || !lwData?.unit) {
                        //alert("Please fill all required fields in the Observation Section")
                        toast.error("Please fill all fields in Observation Section");
                      } else {
                        setIsAddActionOpen(true);
                        // setFieldValue("capaDepartments", null);
                        // setFieldValue("responsibleDepartmentName", "");
                        //fetchCapaDepartments(lwData?.unit);
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
                  setLwImageDraft(emptyLwImageDraft);
                }}
                title="File Attachments"
              >
                <div className="row col-12 col-md-12 col-lg-12  d-flex justify-content-between">
                  <div className="col-12 col-md-6 col-lg-3 d-flex flex-column gap-3 mb-2 ms-2">
                    <span>Before Image Upload</span>
                    <input
                      type="file"
                      id="beforeFile"
                      onChange={handleBeforeFileChange}
                      name="beforeFile"
                      ref={beforeFileInputRef}
                    />
                    <span>After Image Upload</span>
                    <input
                      type="file"
                      id="afterFile"
                      name="afterFile"
                      ref={afterFileInputRef}
                      onChange={handleAfterFileChange}
                    />
                  </div>
                  <div className="col-12 col-md-3 col-lg-3  d-flex flex-column gap-4 position-relative">
                    <h5>Before Image</h5>
                    <div style={{ position: "relative", width: "100%" }}>
                      {lwImageDraft.beforefileid ? (
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
                            src={`${BUCKET_URL}/${lwImageDraft?.beforefileid}`}
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
                          File Name: {lwImageDraft?.beforefilename}
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
                      {/* {lwImageDraft.afterPreview ? ( */}
                      {lwImageDraft.afterfileid ? (
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
                            src={`${BUCKET_URL}/${lwImageDraft?.afterfileid}`}
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
                          File Name: {lwImageDraft?.afterfilename}
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
                          !lwImageDraft.beforefileid &&
                          !lwImageDraft.afterfileid
                        ) {
                          toast.error("Please upload files");
                          return;
                        }
                        const imageToAdd = {
                          ...lwImageDraft,
                          siNo: "",
                          observationNo: nextObservationNo,
                          actionId: 0,
                          beforefile: lwImageDraft.beforefile,
                          beforefileid: lwImageDraft.beforefileid,
                          beforefilename: lwImageDraft.beforefilename,
                          beforeCreatedat: dayjs().format("YYYY-MM-DD"),
                          beforeCreatedby: user.updatedBy || "",
                          afterfile: lwImageDraft.afterfile,
                          afterfileid: lwImageDraft.afterfileid,
                          afterfilename: lwImageDraft.afterfilename,
                          afterCreatedat: dayjs().format("YYYY-MM-DD"),
                          afterCreatedby: user.updatedBy || "",
                        };
                        setLwImagesDraft((prev) => [...prev, imageToAdd]);
                        //Reset ImageDraft
                        setLwImageDraft({
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
                        {lwImagesDraft?.length > 0 ? (
                          lwImagesDraft.map((row, index) => (
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
                              {row.afterfileid ? (
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
                        if (isObservationIncomplete || !lwData?.unit) {
                          //alert("Please fill all required fields in the Observation Section")
                          toast.error("Please fill all fields in Observation Section");
                        } else {
                          setIsAddImageOpen(false);
                          setIsAddActionOpen(true);
                          // setFieldValue("capaDepartments", null);
                          // setFieldValue("responsibleDepartmentName", "");
                          //fetchCapaDepartments(lwData?.unit);
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
                      // onClick={() => { handleAddObservationNoAction(); setIsAddImageOpen(false);}}

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
                            onChange={handleChange}
                            onBlur={handleBlur}
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
                                    (option) => option.value == values.capaDepartments
                                  ) || ""}
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
                              fetchSectionHead(lwData?.unit, values?.capaDepartments, selectedOption?.value, setFieldValue, values);
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
                              onChange={handleChange}
                              onBlur={handleBlur}
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
                                    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
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
