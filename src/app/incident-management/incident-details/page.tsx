"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { serverRequest } from "@/services/getServerSideRender";
import { BUCKET_URL, DOWNLOAD_FILE, FETCH_DEPARTMENTS, FETCH_RISK_POTENTIAL, GET_ALL_BODY_PARTS, GET_NATURE_OF_INJURIES, GET_PRELIMINARY_CLASSIFICATION, INCIDENT_COST, INVESTIGATION, LESSION_LEARNT, SAFETY_ALERT, SAVE_DRAFT_PIR } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import Link from "next/link";
import { setObjectId, setPirId, setSafetyId } from "@/store/slices/pirSlice";
import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { toast, ToastContainer } from "react-toastify";
import CustomModal from "@/components/Layouts/CustomModal";
import UnitDetails from "../pir-form/_partials/UnitDetails";
import UnitDetailsSA from "../safety-alert/update/_partials/UnitDetails";
import UnitDetailsIR from "../incident-report/update/_partials/UnitDetails";
import PreliminaryClassification from "../pir-form/_partials/PreliminaryClassification";
import IncidentDetails from "../pir-form/_partials/IncidentDetails";
import IncidentDetailsSA from "../safety-alert/update/_partials/IncidentDetails";
import DetailsOfInjury from "../pir-form/_partials/DetailsOfInjury";
import Immediate from "../pir-form/_partials/Immediate";
import ImmediateSA from "../safety-alert/update/_partials/Immediate";
import PirSubmit from "../pir-form/_partials/PirSubmit";
import { emptySelector } from "@/config/config";
import { SelectOptions } from "@/components/interfaces";
import SafetyAlertRootCausesSA from "../safety-alert/update/_partials/SafetyAlertRootCauses";
import PreventiveActionsSA from "../safety-alert/update/_partials/PreventiveActions";
import ImagesVideoSA from "../safety-alert/update/_partials/ImagesVideo";
import { setIn } from "formik";
import InvestigationReportAccordion from "../incident-report/update/_partials/InvestigationReportAccordion";
import InputField from "@/components/Form/InputField";
dayjs.extend(localizedFormat);

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

const IncidentDetailsComp = () => {  
  const router = useRouter();

  const pirId = useSelector((state: RootState) => state.pir.pirId);
  const dispatch = useDispatch();
  const accordionTitles = [
    "Unit Details",
    "Preliminary Classification",
    "Incident Details",
    "Details of Injury",
    "Immediate Actions",
    "PIR Submitted by"
  ];

  const safetyAlertAccordionTitles = [
        "Unit Details",
        "Incident Details",
        "Immediate Actions",
        "Images Video",
        "Root Cause",
        "Preventive/Corrective Action"
    ];
  
  const iRAccordionTitles = [
    "Unit Details",
    "Incident Report"
  ];
  
  const { user } = useSelector((state: RootState) => state.auth as { user: any });
  const token = useSelector(selectUserToken);
    const [unitData, setUnitData] = useState({ unitId: "" });
    const [pirData, setPirData] = useState<any>({});
    const [lessonLearntPreviewOpen, setLessonLearntPreviewOpen] = useState<boolean>(false)
    const [lessonLearntData, setLessonLearntData] = useState(null)
    const [saData, setSaData] = useState<any>(null);
    const [safetyAlertRootCausesData, setSafetyAlertRootCausesData] = useState<any>({});
    const [preventiveActions, setPreventiveActions] = useState<any>({});
    const [iRData, setIRData] = useState<any>(null);
    const [safetyAlertData, setSafetyAlertData] = useState<any>({});
    const [teamMembers, setTeamMembers] = useState<any>([]);
    const [preliminaryData, setPreliminaryData] = useState(null);
    const [incidentData, setIncidentData] = useState([{}]);
    const [injuryData, setInjuryData] = useState(null);
    const [immediateData, setImmediateData] = useState(null);
    const [pirSubmitData, setPirSubmitData] = useState(null);
    const [departments, setDepartments] = useState<any>(null);
    const [pirPreviewOpen, setPirPreviewOpen] = useState<boolean>(false);
    const [safetyAlertPreviewOpen, setSafetyAlertPreviewOpen] = useState<boolean>(false);
    const [teamDetailsPreviewOpen, setTeamDetailsPreviewOpen] = useState<boolean>(false);
    const [investigationReportPreviewOpen, setInvestigationReportPreviewOpen] = useState<boolean>(false);
    const [unitOptions, setUnitOptions] = useState(emptySelector);
    const [saUnitOptions, setSaUnitOptions] = useState(emptySelector);
    const [currentStatus, setCurrentStatus] = useState<number>(0);
    const [openSection, setOpenSection] = useState<number>(0);
    const [isPirDataInitialized, setIsPirDataInitialized] = useState(false);
    const [twoStepProcess, setTwoStepProcess] = useState<boolean>(false);
    const [bodyPartOptions, setBodyPartOptions] = useState<SelectOptions[] | null>(null);
    const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
    const [costOfIncidentOptions, setCostOfIncidentOptions] = useState<SelectOptions[] | null>(null);
    const [injuryNatureOptions, setInjuryNatureOptions] = useState<SelectOptions[] | null>(null);
    const [prelimClassificOptions, setPrelimClassificOptions] = useState<SelectOptions[]>(emptySelector);
    const [injuredJobTypeOptions, setInjuredJobTypeOptions] = useState<SelectOptions[] | null>(null);
    const [incidentList, setIncidentList] = useState<any>([])
    const [safetyAlertInfo, setSafetyAlertInfo] = useState<any>(null);


    useEffect(() => {
    if (pirData?.createdBy && !isPirDataInitialized) {
      setIsPirDataInitialized(true);
      // Only set these if we're creating a new PIR
      setUnitOptions([
        { label: pirData?.unitName || "", value: pirData?.unitId || "" },
      ]);
      setUnitData({ unitId: pirData?.unitId });
      setPirData((prev) => ({
        ...prev,
        unitId: pirData?.unitId,
        unitName: pirData?.unitName,
        designationId: pirData?.designationId,
        createdBy: pirData?.createdBy,
        updatedBy: pirData?.updatedBy,
        designationName: pirData?.designationName,
        createdByUserRole: pirData.createdByUserRole,
      }));
      setTwoStepProcess(pirData?.pir?.processSteps == "Two"? true : false)

      if (pirData?.unitId) {
        fetchDepartments(pirData?.unitId);
      }
    }
  }, [pirData, isPirDataInitialized]);

  const fetchCostOfIncident = async () => {
          try {
          const response = await serverRequest(
              {},
              INCIDENT_COST + `/get-incident-costs`,
              CONSTANTS.REQUEST_GET,
              true,
              true,
              token
          );
          if (response.length > 0) {
              const options = response.map((data: any) => ({
                  value: data?.incidentCost,
                  label: data?.incidentCost,
              }));
              setCostOfIncidentOptions(options);
              }
          } catch (error) {
          console.error("Error fetching data:", error);
          }
      };

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
          const options = response.map((dept: any) => ({
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

  useEffect(() => {
    fetchRiskPotential();
    fetchPreliminaryClassification();
    fetchBodyPartsDetail();
    fetchNatureOfInjuries();
  }, []);

    const fetchPirData = async(pirId: string, fromButton?: boolean) => {
      try {
        const response = await serverRequest(
          {},
          SAVE_DRAFT_PIR + `/get-pir/${pirId}`,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );
        
        if(response.success){
          // dispatch(setObjectId(response.objectId));
          const transformData = (response: any) => {
            const { pir, injuries, images, immediateActions } = response;

            // Transform images
            const transformedImages = images.map(img => ({
              fileId: img.mongoId,
              fileType: img.fileType,
              fileName: img.fileName,
              fileSize: img.fileSize,
              fileThumbnail: img.fileThumbnail,
              createdAt: img.createdAt,
              createdBy: img.createdBy
            }));

            // Transform injuries
            const transformedInjuries = injuries.map((injury: any) => {
              const bodyParts = injury.bodyPartList.map((bp: any) => bp.bodyPart).join(' || ');
              const natureOfInjuries = injury.bodyPartList.map((bp: any) => bp.natureOfInjury).join(' || ');

              return {
                employeeType: injury.employeeType,
                employeeId: injury.employeeId,
                injuredName: injury.injuredName,
                gender: injury.gender,
                address: injury.address,
                designation: injury.designation,
                jobType: injury.jobType,
                nameOfEmployer: injury.nameOfEmployer,
                flagInjuryId: injury.flagInjuryId,
                bodyParts,
                natureOfInjuries,
                irStatus: null,
                incidentLastDate: null,
                createdAt: injury.createdAt,
                createdBy: injury.createdBy,
                updatedAt: injury.createdAt, // Using createdAt since no updatedAt in source
                updatedBy: injury.createdBy,
                bodyPartList: injury.bodyPartList.map(bp => ({
                  bodyPart: bp.bodyPart,
                  employeeId: bp.employeeId,
                  createdAt: bp.createdAt,
                  createdBy: bp.createdBy,
                  natureOfInjury: bp.natureOfInjury,
                  flagInjuryId: bp.flagInjuryId,
                  rowIndex: bp.rowIndex
                }))
              };
            });

            // Transform immediateActions
            const transformedImmediateActions = immediateActions.map(action => ({
              actiontaken: action.actiontaken,
              createdat: action.createdat,
              createdby: action.createdby,
              updatedat: action.createdat, // Using createdat since no updatedat in source
              updatedby: action.createdby,
              assignLinemanager: action.assignLinemanager,
              linemanagerName: action.linemanagerName,
              targetdate: action.targetdate,
              sections: action.sections,
              departments: action.departments,
              sectionhead: action.sectionhead,
              imSubmoduleName: action.imSubmoduleName,
              units: action.units,
              departmentHodName: '', // Not in source data
              flagId: '0',
              responsibleDepartmentName: action.responsibleDepartmentName,
              responsibleSectionName: action.responsibleSectionName,
              findingFlag: action.findingFlag
            }));

            // Create the main object
            const transformedData = {
              objectId: null,
              pirId: pir.pirId,
              unitId: pir.unitId,
              unitName: pir.unitName,
              departmentId: pir.departmentId,
              departmentName: pir.departmentName,
              sectionId: pir.sectionId,
              sectionName: pir.sectionName,
              exactLocation: pir.exactLocation,
              incidentDate: pir.incidentDate,
              incidentTime: pir.incidentTime,
              lineManager: pir.lineManager,
              sectionHead: pir.sectionHead,
              departmentHod: pir.departmentHod,
              incidentClassification: pir.incidentClassification,
              incidentCategory: pir.incidentCategory,
              personInjured: pir.personInjured,
              tier: pir.tier,
              remark: pir.remark,
              createdAt: pir.createdAt,
              createdBy: pir.createdBy,
              updatedAt: pir.updatedAt,
              updatedBy: pir.updatedBy,
              designationId: pir.designationId,
              designationName: pir.designationName,
              createdByUserRole: pir.createdByUserRole === 'USER' ? 'Employee' : pir.createdByUserRole,
              injuryHappened: pir.injuryHappened,
              whatHappened: pir.whatHappened,
              preliminaryFindings: pir.preliminaryFindings,
              hipoCase: pir.hipoCase,
              accordionIndex: 2, // Default value
              processSteps: pir?.processSteps || "",
              images: transformedImages,
              injuries: transformedInjuries,
              immediateActions: transformedImmediateActions
            };

            return transformedData;
          };

          // Usage:
          const transformedData = transformData(response);
          setTwoStepProcess(transformedData?.processSteps == "Two"? true : false)
          setPirData(transformedData);
          if(fromButton){
            setPirPreviewOpen(true)
          }
        }
      } catch (error) {
        console.error("Error saving PIR:", error);
      }
    }

    useEffect(() => {
      if(pirId){
        fetchPirData(pirId)
        fetchIncidentTeamData(pirId)
        fetchIncidentList(pirId)
        fetchPirData(pirId)
        fetchIncidentReportData(pirData)
        fetchCostOfIncident()
      } else {
        router.push(APP_URL.INCIDENT_MANAGEMENT);
      }
    }, []); // pirId

//     const fetchSafetyAlertData = async(pirId: string, fromButton?: boolean) => {
//       try {
//         const response = await serverRequest(
//           {},
//           SAFETY_ALERT + `/get-safety-alert/${pirId}`,
//           CONSTANTS.REQUEST_GET,
//           true,
//           true,
//           token
//         );
        
//         if(response.success){
//           const transformData = (response: any) => {
//             const { pir, safetyAlert, images, immediateActions, rootCauses, preventiveActions } = response;
//             setSaUnitOptions([{ label: pir?.unitName || "", value: pir?.unitId || "" }]);
//             fetchDepartments(pir?.unitId);
            
//             // Transform images
//             const transformedImages = images.map((img: any) => ({
//               fileId: img.mongoId || img.fileId,
//               fileType: img.fileType || "image",
//               fileName: img.fileName,
//               fileSize: img.fileSize,
//               fileThumbnail: img.fileThumbnail,
//               createdAt: img.createdAt,
//               createdBy: img.createdBy
//             }));
            
//             // Transform immediate actions to actionTaken
//             const transformedActionTaken = immediateActions.map((action: any) => ({
//               actiontaken: action.actiontaken,
//               createdat: action.createdat,
//               createdby: action.createdby,
//               updatedat: action.updatedat || action.createdat,
//               updatedby: action.updatedby || action.createdby,
//               assignLinemanager: action.assignLinemanager || "",
//               targetdate: action.targetdate,
//               status: action.status || "Pending",
//               imSubmoduleName: action.imSubmoduleName,
//               units: action.units,
//               departments: action.departments,
//               responsibleDepartmentName: action.responsibleDepartmentName,
//               sections: action.sections,
//               responsibleSectionName: action.responsibleSectionName,
//               sectionhead: action.sectionhead,
//               linemanagerName: action.linemanagerName,
//               rowIndex: action.rowIndex || null
//             }));
            
//             // Transform root causes
//             const transformedRootCauses = rootCauses.map((cause: any) => ({
//               factorType: cause.factorType || "",
//               physicalFactorType: cause.physicalFactorType || null,
//               factorName: cause.factorName || "",
//               pirId: cause.pirId || "",
//               finding: cause.finding || "",
//               other: cause.other || ""
//             }));
            
//             // Transform preventive actions
//             const transformedPreventiveActions = preventiveActions.map((action: any) => ({
//               siNo: action.siNo || "",
//               actiontaken: action.actiontaken,
//               createdat: action.createdat,
//               createdby: action.createdby,
//               updatedat: action.updatedat || action.createdat,
//               updatedby: action.updatedby || action.createdby,
//               targetdate: action.targetdate,
//               status: action.status || "Pending",
//               imSubmoduleName: action.imSubmoduleName,
//               units: action.units,
//               departments: action.departments,
//               responsibleDepartmentName: action.responsibleDepartmentName,
//               sections: action.sections,
//               responsibleSectionName: action.responsibleSectionName,
//               sectionhead: action.sectionhead,
//               assignLinemanager: action.assignLinemanager || "",
//               linemanagerName: action.linemanagerName,
//               actionType: action.actionType || ""
//             }));
            
//             // Create the transformed safety alert data
//             const transformedData = {
//               objectId: safetyAlert?.objectId || null,
//               pirId: safetyAlert?.pirId || pir?.pirId || "",
//               unitId: safetyAlert?.unitId || pir?.unitId || "",
//               unitName: safetyAlert?.unitName || pir?.unitName || "",
//               departmentId: safetyAlert?.department || pir?.departmentId || "",
//               department: safetyAlert?.department || pir?.departmentId || "",
//               departmentName: safetyAlert?.departmentName || pir?.departmentName || "",
//               sectionId: safetyAlert?.assigneeSection || pir?.sectionId || "",
//               sectionName: safetyAlert?.sectionName || pir?.sectionName || "",
//               exactLocation: safetyAlert?.incidentLocation || pir?.exactLocation || "",
//               incidentDate: safetyAlert?.incidentDate || pir?.incidentDate || "",
//               incidentTime: safetyAlert?.incidentTime || pir?.incidentTime || "",
//               personInjured: pir?.personInjured || "",
//               lineManager: pir?.lineManager || "",
//               sectionHead: pir?.sectionHead || "",
//               departmentHod: pir?.departmentHod || "",
//               incidentClassification: safetyAlert?.incidentClassification || pir?.incidentClassification || "",
//               incidentCategory: pir?.incidentCategory || "",
//               whatHappened: safetyAlert?.whatHappened || pir?.whatHappened || "",
//               processSteps: pir?.processSteps || "",
//               preliminaryFindings: safetyAlert?.preliminaryFindings || pir?.preliminaryFindings || "",
//               remark: safetyAlert?.remarks || pir?.remark || "",
//               images: transformedImages,
//               immediateActions: transformedActionTaken,
//               createdByUserRole: pir?.createdByUserRole === 'USER' ? 'Employee' : pir?.createdByUserRole || "",
//               injuryHappened: pir?.injuryHappened === "Yes" ? "Yes" : "No",
              
//               // Safety Alert specific fields
//               safetyId: safetyAlert?.safetyId || 0,
//               incidentLocation: safetyAlert?.incidentLocation || pir?.exactLocation || "",
//               processSafetyIncidentCategory: safetyAlert?.processSafetyIncidentCategory || pir?.incidentCategory || "",
//               createdAt: safetyAlert?.createdAt || pir?.createdAt || new Date().toISOString(),
//               createdBy: safetyAlert?.createdBy || pir?.createdBy || "",
//               updatedAt: safetyAlert?.updatedAt || new Date().toISOString(),
//               updatedBy: safetyAlert?.updatedBy || "",
//               status: safetyAlert?.status || "pending",
//               remarks: safetyAlert?.remarks || pir?.remark || "",
//               actionTaken: transformedActionTaken,
//               safetyAlertImages: transformedImages,
//               safetyAlertRootCauses: transformedRootCauses,
//               preventiveActions: transformedPreventiveActions
//             };
            
//             return transformedData;
//           };

//           const transformedData = transformData(response);
//           setSafetyAlertData(transformedData);
          // if(fromButton){
          //   setSafetyAlertPreviewOpen(true);
          // }
//     }
//   } catch (error) {
//     console.error("Error displaying Safety Alert Data:", error);
//   }
// };
    const fetchSafetyAlertData = async (safetyAlertId: string, fromButton: boolean) => {
          try {
            const response = await serverRequest(
                {},
                SAFETY_ALERT + `/get-safety-alert/${safetyAlertId}`,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
            );
    
            if (response.success) {
              const safetyAlert = response.safetyAlert;
              const pirData = response.pir;
              
              const transformedSaData = {
                safetyId: safetyAlert.safetyId,
                pirId: safetyAlert.pirId,
                unitName: safetyAlert.unitName,
                incidentDate: safetyAlert.incidentDate,
                incidentLocation: safetyAlert.incidentLocation,
                incidentTime: safetyAlert.incidentTime,
                incidentClassification: safetyAlert.incidentClassification,
                processSafetyIncidentCategory: safetyAlert.processSafetyIncidentCategory,
                whatHappened: safetyAlert.whatHappened,
                preliminaryFindings: safetyAlert.preliminaryFindings,
                createdAt: safetyAlert.createdAt,
                createdBy: safetyAlert.createdBy,
                updatedAt: safetyAlert.updatedAt,
                updatedBy: safetyAlert.updatedBy,
                assignedTo: safetyAlert.assignedTo,
                department: safetyAlert.department,
                responsiblePerson: safetyAlert.responsiblePerson,
                status: safetyAlert.status,
                unitId: safetyAlert.unitId,
                sectionName: safetyAlert.sectionName,
                departmentName: safetyAlert.departmentName,
                rowIndex: safetyAlert.rowIndex,
                remarks: pirData.remark || "",
                personInjured: pirData?.personInjured || "",
                exactLocation: pirData?.exactLocation || safetyAlert.incidentLocation,
                
                safetyAlertImages: (response.images || []).map((img: any) => ({
                    imageId: img.imageId || 0,
                    pirId: img.pirId,
                    fileId: img.mongoId || img.fileId,
                    fileType: img.fileType || "",
                    fileName: img.fileName,
                    createdAt: img.createdAt,
                    createdBy: img.createdBy,
                    fileSize: img.fileSize,
                    fileThumbnail: img.fileThumbnail || img.mongoId,
                    rowIndex: img.rowIndex || 0
                })),

                actionTaken: (response.immediateActions || []).map((action: any) => ({
                    siNo: action.siNo,
                    actiontaken: action.actiontaken,
                    createdat: action.createdat,
                    createdby: action.createdby,
                    updatedat: action.updatedat || action.createdat,
                    updatedby: action.updatedby || action.createdby,
                    actionId: action.actionId || null,
                    assignLinemanager: action.assignLinemanager || "",
                    targetdate: action.targetdate,
                    status: action.status || "Pending",
                    rowIndex: action.rowIndex || 0,
                    sections: action.sections,
                    departments: action.departments,
                    sectionhead: action.sectionhead,
                    imSubmoduleName: action.imSubmoduleName,
                    units: action.units,
                    linemanagerName: action.linemanagerName,
                    responsibleDepartmentName: action.responsibleDepartmentName,
                    responsibleSectionName: action.responsibleSectionName,
                    actiontakenByUser: action.actiontakenByUser || "Safety Alert"
                })),

                safetyAlertRootCauses: (response.rootCauses || []).map((cause: any) => ({
                    pkeyId: cause.pkeyId || 0,
                    factorType: cause.factorType,
                    physicalFactorType: null,
                    factorName: cause.factorName,
                    pirId: cause.pirId,
                    finding: cause.finding || "",
                    other: cause.other || ""
                })),

                preventiveActions: (response.preventiveActions || []).map((action: any) => ({
                    actionId: action.actionId || null,
                    siNo: action.siNo || "",
                    actiontaken: action.actiontaken || "",
                    createdat: action.createdat || "",
                    createdby: action.createdby || "",
                    updatedat: action.updatedat || action.createdat,
                    updatedby: action.updatedby || action.createdby,
                    targetdate: action.targetdate || "",
                    status: action.status || "Pending",
                    imSubmoduleName: action.imSubmoduleName || "",
                    units: action.units || "",
                    departments: action.departments || "",
                    responsibleDepartmentName: action.responsibleDepartmentName || "",
                    sections: action.sections || "",
                    responsibleSectionName: action.responsibleSectionName || "",
                    sectionhead: action.sectionhead || "",
                    assignLinemanager: action.assignLinemanager || "",
                    linemanagerName: action.linemanagerName || "",
                    actionType: action.actionType || ""
                  }))
                };
                
                setSaData(transformedSaData);
                if(fromButton){
                  setSafetyAlertPreviewOpen(true);
                }

                if (transformedSaData.safetyAlertRootCauses && transformedSaData.safetyAlertRootCauses.length > 0) {
                  setSafetyAlertRootCausesData(transformedSaData.safetyAlertRootCauses);
                }

                if (transformedSaData.preventiveActions && transformedSaData.preventiveActions.length > 0) {
                  setPreventiveActions(transformedSaData.preventiveActions);
                }

                if (pirData) {
                  setPirData(pirData);
                  setTwoStepProcess(pirData.processSteps === "Two");
                }

                setIncidentList(response.pirJourneys || []);

                if (safetyAlert?.unitId) {
                  setUnitData({ unitId: safetyAlert.unitId });
                  setUnitOptions([
                      { label: safetyAlert.unitName || "", value: safetyAlert.unitId || "" },
                  ]);
                  fetchDepartments(safetyAlert.unitId);
                } 
              } else {
                toast.error("Safety Alert not found");
              }
          } catch (error) {
            console.error("Error fetching Safety Alert:", error);
            toast.error("Failed to load Safety Alert");
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
          // toast.error("File open failed. Please try again.");
      }
    };

    const fetchIncidentTeamData = async(pirId: string, fromButton?: boolean) => {
      try {
          if (pirId) {
            const response = await serverRequest(
              {},
              INVESTIGATION + `/get-investigation-team-members/${pirId}`,
              CONSTANTS.REQUEST_GET,
              true,
              true,
              token
            );
            
            const apiData = response;
      
            if (apiData?.length > 0) {
              const mappedMembers = apiData.map((member: any, index: number) => {
                return {
                  id: member.id || index + 1,
                  email: member.email || member.memberEmail,
                  name: member.name || member.memberName,
                  designation: member.designationName || member.designation || member.memberDesignation,
                  department: member.departmentName || member.department || member.memberDepartment,
                  trainingStatus: member.trainingStatus || member.imTrained || member.isTrained,
                  memberRole: member.memberRole || member.role,
                  isLead: member.memberRole === "Lead" || member.isLead,
                  designationName: member.designationName || member.designation || member.designation,
                  departmentName: member.departmentName || member.department,
                  tlMemJsplid: member.tlMemJsplid || member.jsplId,
                  unitId: member.unitId,
                  departmentId: member.departmentId,
                  sectionId: member.sectionId,
                  designationId: member.designationId || member.designationID,
                  rowIndex: member.rowIndex || index + 1
                };
              });
      
              setTeamMembers(mappedMembers);
              if(fromButton){
                setTeamDetailsPreviewOpen(true)
              }
            } else {
              setTeamMembers([]);
            }
          }
        } catch (error) {
          console.error("Error fetching team members:", error);
        }
    }

  const transformIRDataToFormData = (apiResponse: any) => {
    if (!apiResponse || !apiResponse.success) return null;
    
    // Extract data from API response
    const { pir, ir, injuries, keyFindings, chronologyEvents, recordsViewed, personsInteracted } = apiResponse;
    
    // Create the flat structure that your components expect
    const formData = {
      // From pir object
      pirId: pir?.pirId || "",
      unitId: pir?.unitId || "",
      unitName: pir?.unitName || "",
      departmentId: pir?.departmentId || "",
      departmentName: pir?.departmentName || "",
      sectionId: pir?.sectionId || "",
      sectionName: pir?.sectionName || "",
      exactLocation: pir?.exactLocation || "",
      incidentDate: pir?.incidentDate || "",
      incidentTime: pir?.incidentTime || "",
      incidentClassification: pir?.incidentClassification || "",
      incidentCategory: pir?.incidentCategory || "",
      injuryHappened: pir?.injuryHappened || "No",
      
      // From ir object - with proper IDs
      irId: ir?.irId || null,
      costInRupees: ir?.costInRupees || "",
      costOfIncident: ir?.costOfIncident || "",
      costOfIncidentText: ir?.costOfIncidentText || "",
      lastDateOfIncident: ir?.lastDateOfIncident || null,
      similarIncident: ir?.similarIncident || "",
      incidentInitiatedDate: ir?.incidentInitiatedDate || null,
      incidentInitiatedTime: ir?.incidentInitiatedTime || null,
      briefDescription: ir?.briefDescription || "",
      irStatus: ir?.irStatus || "Draft",
      
      // Arrays with preserved IDs
      injuries: injuries?.map((injury: any) => ({
        injuryId: injury.injuryId || 0,
        employeeType: injury.employeeType || "",
        employeeId: injury.employeeId || "",
        injuredName: injury.injuredName || "",
        gender: injury.gender || "",
        address: injury.address || "",
        designation: injury.designation || "",
        jobType: injury.jobType || "",
        nameOfEmployer: injury.nameOfEmployer || "",
        flagInjuryId: injury.flagInjuryId || 0,
        bodyParts: injury.bodyParts || "",
        natureOfInjuries: injury.natureOfInjuries || "",
        incidentLastDate: injury.incidentLastDate || null,
        pirId: injury.pirId || "",
        bodyPartList: injury.bodyPartList?.map((part: any) => ({
          id: part.id || 0,
          bodyPart: part.bodyPart || "",
          employeeId: part.employeeId || "",
          pirId: part.pirId || "",
          natureOfInjury: part.natureOfInjury || "",
          flagInjuryId: part.flagInjuryId || 0,
          rowIndex: part.rowIndex || 0
        })) || []
      })) || [],
      
      keyFindings: keyFindings?.map((finding: any) => ({
        keyId: finding.keyId || 0,
        keyFinding: finding.keyFinding || "",
        pirId: finding.pirId || ""
      })) || [],
      
      recordsViewed: recordsViewed?.map((record: any) => ({
        recordId: record.recordId || 0,
        recordViewed: record.recordViewed || "",
        pirId: record.pirId || ""
      })) || [],
      
      personsInteracted: personsInteracted?.map((person: any) => ({
        personId: person.personId || 0,
        empType: person.empType || "",
        employeeId: person.employeeId || "",
        empEmail: person.empEmail || "",
        empName: person.empName || "",
        empDesignationName: person.empDesignationName || "",
        empDepartmentName: person.empDepartmentName || "",
        departmentId: person.departmentId || "",
        pirId: person.pirId || ""
      })) || [],
      
      // Initialize empty arrays for others
      chronologyOfEvents: chronologyEvents?.map((event: any) => ({
        chronologyId: event.chronologyId || 0,
        chronologyDate: event.chronologyDate || "",
        chronologyTime: event.chronologyTime || "",
        chronologyActivity: event.chronologyActivity || "",
        chronologyRemark: event.chronologyRemark || "",
        pirId: event.pirId || ""
      })) || [],
      
      immediateActions: apiResponse?.immediateActions || [],
      whyAnalyses:apiResponse?. whyAnalyses || [],
      supportingEvidences: apiResponse?.supportingEvidences?.map((evidence: any) => ({
        evidenceType: evidence.evidenceType || "",
        evidenceName: evidence.evidenceName || "",
        evidenceSize: evidence.evidenceSize || "",
        fileId: evidence.evidenceThumbnail || evidence.mongoId || "",
        pirId: evidence.pirId || "",
        createdAt: evidence.createdAt || "",
        createdBy: evidence.createdBy || "",
        updatedAt: evidence.updatedAt || evidence.createdAt || "",
        updatedBy: evidence.updatedBy || evidence.createdBy || "",
        evidenceDescription: evidence.evidenceDescription || "",
        evidenceThumbnail: evidence.evidenceThumbnail || evidence.mongoId || ""
      })) || [],
      rootCauses: apiResponse?.rootCauses || [],
      
      // Other fields with defaults
      objectId: "",
      accordionIndex: 0,
      createdAt: ir?.createdAt || new Date().toISOString(),
      createdBy: ir?.createdBy || "",
      updatedAt: ir?.updatedAt || new Date().toISOString(),
      updatedBy: ir?.updatedBy || "",
      chronologyManualFile: null,
      whyWhyManualFile: ir?.whyWhyManualFile || null,
      teamMembers: apiResponse?.teamMembers || []
    };
    
    return formData;
  };

  const fetchReferenceData = async () => {
    try {
      setInjuredJobTypeOptions([]);
      setInjuryNatureOptions([]);
      setBodyPartOptions([]);
      setDepartmentOptions([]);
      
    } catch (error) {
      console.error("Error fetching reference data:", error);
    }
  };

    const fetchIncidentReportData = async (pirId: string, fromButton?: boolean) => {
    try {
      
      const response = await serverRequest(
        {},
        INVESTIGATION + `/get-investigation-report/${pirId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );

      if (response) {
        // Transform the response to match our frontend structure
        const transformedData = transformIRDataToFormData(response);
        setIRData(transformedData);
        if(fromButton){
          setInvestigationReportPreviewOpen(true)
          }
        
        
        // Fetch additional reference data if needed
        await fetchReferenceData();
      } else {
        toast.error("No investigation report found for this PIR ID");
      }
    } catch (error) {
      console.error("Error fetching investigation report:", error);
      toast.error("Error loading investigation report data");
    }
  };

  const fetchLessonLearntData = async (pirId: string, fromButton?: boolean) => {  
    try {
    const response = await serverRequest(
          {}, 
          LESSION_LEARNT + `/get-lessonlearnt/${pirId}`, 
          CONSTANTS.REQUEST_GET, 
          true, 
          true, 
          token
      );
      if (response?.success === true) {
        setLessonLearntData({
          pir: response?.pir,
          lessonLearnt: response?.lessonLearnt, // fallback
          images: (response?.lessonLearntImages || response.imageList || []).map(
            (img: any) => ({
              imageId: img.imageId ?? img.id ?? 0,
              pirId: img.pirId ?? img.pirId ?? response.lessonLearnt?.pirId,
              mongoId: img.mongoId ?? img.fileId ?? img.imagePath ?? img.fileName,
              fileType: img.fileType ?? img.mimeType,
              fileName: img.fileName ?? img.imageName ?? img.fileName,
              fileThumbnail: img.fileThumbnail ?? img.imagePath ?? img.fileThumbnail,
              fileId: img.mongoId ?? img.fileId ?? img.id,
            })
          ),
          keyLearnings: (response.lessonLearntKeyLearnings || response.lessonLearntKeyLearning || []).map(
            (kl: any) => ({
              id: kl.id ?? kl.pirLessonLearntId ?? 0,
              pirId: kl.pirId ?? response.lessonLearnt?.pirId,
              keyLearning: kl.keyLearning ?? kl.value ?? kl.keyLearning,
            })
          ),
        });
        if(fromButton){
          setLessonLearntPreviewOpen(true);
        }
      }
      else
      {
        setLessonLearntData({
          pir: null,
          lessonLearnt: null,
          images: null,
          keyLearnings:null});
          setLessonLearntPreviewOpen(false);
      }
      } catch (error) {
      console.error("Error fetching LessonLearnt:", error);
      }
    };

    const fetchData = (pirId: string, subSection: string) => {
      if(subSection == "PIR"){
        fetchPirData(pirId, true)
      }
      else if(subSection == "Safety Alert"){
        fetchSafetyAlertData(pirId, true)
      }
      else if(subSection == "Incident Team"){
        fetchIncidentTeamData(pirId, true)
      }
      else if(subSection == "Incident Report"){
        fetchIncidentReportData(pirId, true)
      }
      else if(subSection == "Lesson Learnt"){
        fetchLessonLearntData(pirId, true)
      }
      // else if(subSection == "Horizontal Deployment"){
      //   fetchHorizontalDeploymentData(pirId)
      // }
    }
    const goToActionPage = (pirId: string, safetyId: number, subSection: string, nextAction: string) => {
      dispatch(setPirId(pirId));
      dispatch(setSafetyId(safetyId));
      let goToPage = "";
      if(subSection == "Safety Alert") {
        if(nextAction == "Start") {
          goToPage = "safety-alert";
        } else {
          goToPage = "safety-alert/update";
        }
      }
      else if(subSection == "Incident Team") {
        if(nextAction == "Start") {
          goToPage = "incident-team";
        }
      }
      else if(subSection == "Incident Report") {
        if(nextAction == "Start") {
          goToPage = "incident-report";
        }
        else {
          goToPage = "incident-report/update";
        }
      }
      else if(subSection == "Lesson Learnt") {
        if(nextAction == "Start") {
          goToPage = "lesson-learnt";
        }
        else {
          goToPage = "lesson-learnt/update";
        }
      }
      else if(subSection == "Horizontal Deployment") {
        if(nextAction == "Start") {
          goToPage = "horizontal-deployment";
        }
      }
      router.push(APP_URL.INCIDENT_MANAGEMENT + "/" + goToPage);
    }

    const fetchIncidentList = async (pirId: string) => {
      
      try {
        const response = await serverRequest(
          {},
          SAVE_DRAFT_PIR + `/get-pir/${pirId}`,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );
        
        if(response){
          // dispatch(setObjectId(response.objectId));
          setIncidentList(response.pirJourneys)
          setSafetyAlertInfo(response.safetyAlert)
        }
      } catch (error) {
        console.error("Error saving PIR:", error);
      }
    };
    return (
        <><div className="container-fluid">
        <div className="admin-boxContainer d3">
          <div className="adminAction">
            <Link href={APP_URL.INCIDENT_MANAGEMENT} className="adminAction__title">
              <span className="icon">
                <Image
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage IM
            </Link>
            {/* <Link href="/images/pdf/zeroharm.pdf" target="_blank" className="adminAction__title">
              Consolidated IR
              <span className="icon">
                <Image
                  width="30"
                  height="30"
                  alt="icon"
                  src="/images/svg/pdf-icon.svg"
                  className="img-fluid u-icon"
                />
              </span>
            </Link> */}
          </div>
          <p className="ms-2 fw-bold">PIR ID : {incidentList[0]?.pirId}</p>
        </div>
        <div className="pb-4">
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Sub-Section</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Responsible Person</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidentList && incidentList?.map((incident: any) => { 
                         if((incident?.subSection == "Incident Team" || incident?.subSection == "Lesson Learnt" || incident?.subSection == "Incident Report" || incident?.subSection == "All Evidences" ) && twoStepProcess){
                          return null;
                        }
                        const canClick = (incident?.subSection === "Incident Report" && teamMembers.some(m => m.tlMemJsplid === user?.jsplid)) || incident?.responsiblePersonJsplid === user?.jsplid || user?.userRoles?.some((role: any) => role.userRole === "IM Champion");
                        // const canClick = incident?.subSection === "Incident Report" && (teamMembers.some(m => m.tlMemJsplid === user?.jsplid) || incident?.responsiblePersonJsplid === user?.jsplid || user?.userRoles?.some((role: any) => role.userRole === "IM Champion"));
                        // const canClick = (incident?.subSection === "Incident Report" ? teamMembers.some(m => m.tlMemJsplid === user?.jsplid) : incident?.responsiblePersonJsplid === user?.jsplid) || user?.userRoles?.some((role: any) => role.userRole === "IM Champion");
                         return (
                      <tr key={incident.id}>
                        <td>{incident?.subSection}</td>
                        <td>{incident?.status}</td>
                        <td>{dayjs(incident?.dueDate).format('DD-MM-YYYY')}</td>
                        <td>{incident?.responsiblePerson}</td>
                        <td className="u-icon">
                            {incident?.status == "Done" && 
                              <button
                                className="tableBtn"
                                type="button"
                                onClick={() => {fetchData(incident?.pirId, incident?.subSection)}}
                              >
                                View
                                <span>
                                  <Image
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/eyeicon.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                            }
                            {!canClick && incident?.status != "Done" &&
                              <Link style={{cursor: "unset"}} href="javascript:void(0);" onClick={(e) => { e.preventDefault();}}>
                                <button disabled={true} type="button" className="tableBtn">
                                  {incident.nextAction}
                                  <span>
                                    <Image
                                      width="15"
                                      height="15"
                                      alt="icon"
                                      src="/images/svg/icons/Right.svg"
                                      className="img-fluid u-image"
                                    />
                                  </span>
                                </button>
                              </Link>
                            }
                            {canClick && incident?.status != "Done" &&
                              <button type="button" className="tableBtn iconBtn orange m-2"
                                onClick={() => {goToActionPage(incident?.pirId, safetyAlertInfo?.safetyId, incident?.subSection, incident?.nextAction)}}
                              >
                                {incident.nextAction}
                                <span>
                                  <Image
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/icons/Right.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                            }
                        </td>
                      </tr>)})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CustomModal
        isOpen={lessonLearntPreviewOpen}
        onClose={() => setLessonLearntPreviewOpen(false)}
        title="Lesson Learnt Details"
        
      >
      <div className="modal-scrollable-content px-2 py-3"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}>
       <div className="container-fluid">
       <div className="c-accordion__head">
         <div className="c-accordion__head--title"> Unit Interaction </div>
       </div>
         <div className="filters">
           <div className="row form_grider d1">
             <div className="col-12 col-md-4 col-lg-3">
                  <InputField
                    type="text"
                    label="Unit"
                    value={lessonLearntData?.pir?.unitName || ""}
                    name="unitName"
                    placeholder="Unit"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
               </div>
              <div className="col-12 col-md-4 col-lg-3">
                  <InputField
                     type="text"
                    label="Department"
                    value={lessonLearntData?.pir?.departmentName || ""}
                    name="departmentName"
                    placeholder="Department"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
              </div>
               <div className="col-12 col-md-4 col-lg-3">
                   <InputField
                    type="text"
                    label="Section"
                    value={lessonLearntData?.pir?.sectionName || ""}
                    name="sectionName"
                    placeholder="Section"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
              </div>
               <div className="col-12 col-md-4 col-lg-3">
                   <InputField
                    type="text"
                    label="inciden tDate"
                    value={lessonLearntData?.pir?.incidentDate || ""}
                    name="incidentDate"
                    placeholder="Section"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
              </div>
               <div className="col-12 col-md-4 col-lg-3">
                   <InputField
                    type="text"
                    label="incident Time"
                    value={lessonLearntData?.pir?.incidentTime || ""}
                    name="incidentTime"
                    placeholder="incidentTime"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
              </div>
             <div className="col-12 col-md-4 col-lg-6">
                 <InputField
                  type="text"
                  label="Exact Location"
                  disabled={true}
                  value={lessonLearntData?.pir?.exactLocation}
                  name="exactLocation"
                  placeholder="Enter Location"
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={250}
              />
              </div>
            </div>
          </div>
       <div className="c-accordion__head">
         <div className="c-accordion__head--title"> Key Learnings </div>
       </div>
         <div className="filters">
           <div className="row form_grider d1">
              <div style={{width: "100%", overflowY: "auto", borderRadius: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#c5cddaff" }}>
                  <tr>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Serial No.</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Key Learning</th>
                  </tr>
                </thead>
                <tbody>
                  {lessonLearntData?.keyLearnings.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "10px" }}>
                        No Key Learnings Added
                      </td>
                    </tr>
                  )}
                  {lessonLearntData?.keyLearnings.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: "5px", border: "1px solid #ddd", textAlign: "center" }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: "5px", border: "1px solid #ddd" }}>
                        {item.keyLearning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
       <div className="c-accordion__head">
         <div className="c-accordion__head--title"> Image </div>
       </div>
           <div className="row form_grider d1 mt-2">
              <div className='d-flex mb-2 gap-2'>
                {lessonLearntData?.images?.length > 0 ? (
                  lessonLearntData?.images?.map((row, idx) => (
                    <div key={idx}>
                      {row?.fileThumbnail ? (
                        <a href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            downloadFile(row?.fileThumbnail );
                          }}
                        >
                          <Image
                            src={`${BUCKET_URL}/${row.fileThumbnail}`}
                            alt="File"
                            width={100}
                            height={100}
                          />
                        </a>
                        ) : (
                          <div className="noImage">-</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No images found</p>
                    )}
                </div>
            </div>
          <div className="actionWrapper">
           <button className="iconBtn orange v2 ms-0" type="button" onClick={() => setLessonLearntPreviewOpen(false)}>
            <span>Close</span>
           </button>
          </div>
        </div>
      </div>
      </CustomModal>
      <CustomModal 
         isOpen={pirPreviewOpen}
        onClose={() => setPirPreviewOpen(false)}
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
                      readOnly={true}
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
                      readOnly={true}
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
                      readOnly={true}
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
                      readOnly={true}
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
                      readOnly={true}
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
                      pirSubmittedBy={incidentList[0]?.responsiblePerson || ""}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                    />
                  )}
                </>
              </div>
            );
          })}
          <div className="d-flex">
            <button
            className="iconBtn orange v2"
            onClick={async() => setPirPreviewOpen(false)}
            type="button"
          >
            <span>Back</span>
          </button>
          </div>
          </>
      </CustomModal>
      <CustomModal 
        isOpen={safetyAlertPreviewOpen}
        onClose={() => setSafetyAlertPreviewOpen(false)}
        bodyClassName="isScrollable"
        title="Preview Safety Alert">
          <>
          {safetyAlertAccordionTitles.map((title, index) => {
            if ((title === "Root Cause" || title === "Preventive/Corrective Action") && !twoStepProcess){
                return null;
            }
            return (
              <div className="c-accordion" key={index}>
                <div className="c-accordion__head">
                  <div className="c-accordion__head--title">{title}</div>
                </div>
                <>
                  {index === 0 && (
                    <UnitDetailsSA
                      unitData={unitData}
                      setUnitData={setUnitData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      unitOptions={unitOptions}
                      departmentOptions={departmentOptions}
                      departments={departments}
                      pirData={pirData}
                      setPirData={setPirData}
                      saData={saData}
                      setSaData={setSaData}
                      isUpdateMode={false}
                      readOnly={true}
                      />
                  )}
                  {index === 1 && (
                    <IncidentDetailsSA
                      incidentData={incidentData}
                      saData={saData}
                      setSaData={setSaData}
                      setIncidentData={setIncidentData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      pirData={pirData}
                      setPirData={setPirData}
                      isUpdateMode={false}
                      readOnly={true}
                    />
                  )}
                  {index === 2 && (
                    <ImmediateSA
                      immediateData={immediateData}
                      departmentOptions={departmentOptions}
                      setImmediateData={setImmediateData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      saData={saData}
                      setSaData={setSaData}
                      pirData={pirData}
                      setPirData={setPirData}
                      isUpdateMode={false}
                      readOnly={true}
                    />
                  )}
                  {index === 3 && (
                    <ImagesVideoSA
                      incidentData={incidentData}
                      setIncidentData={setIncidentData}
                      twoStepProcess={twoStepProcess}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      pirData={pirData}
                      saData={saData}
                      setSaData={setSaData}
                      setPirData={setPirData}
                      isUpdateMode={false}
                      readOnly={true}
                    />
                  )}
                  {index === 4 && twoStepProcess && (
                    <SafetyAlertRootCausesSA
                      pirData={pirData}
                      safetyAlertRootCausesData={safetyAlertRootCausesData}
                      setSafetyAlertRootCausesData={setSafetyAlertRootCausesData}
                      setPirData={setPirData}
                      saData={saData}
                      setSaData={setSaData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      isUpdateMode={false}
                      readOnly={true}
                    />
                  )}
                  {index === 5 && twoStepProcess && (
                    <PreventiveActionsSA
                      pirData={pirData}
                      preventiveActions={preventiveActions}
                      setPreventiveActions={setPreventiveActions}
                      setPirData={setPirData}                    
                      setSaData={setSaData}
                      saData={saData}
                      departmentOptions={departmentOptions}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      isUpdateMode={false}
                      readOnly={true}
                    />
                  )}
                </>
              </div>
            );
          })}
          <div className="d-flex">
            <button
            className="iconBtn orange v2"
            onClick={async() => setSafetyAlertPreviewOpen(false)}
            type="button"
          >
            <span>Back</span>
          </button>
          </div>
          </>
      </CustomModal>
      <CustomModal
        isOpen={teamDetailsPreviewOpen}
        onClose={() => setTeamDetailsPreviewOpen(false)}
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
                        {teamMembers.length > 0 ? (
                          teamMembers.map((member: any, index: number) => (
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
                  onClick={() => setTeamDetailsPreviewOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
      <CustomModal 
         isOpen={investigationReportPreviewOpen}
        onClose={() => setInvestigationReportPreviewOpen(false)}
        bodyClassName="isScrollable"
        title="Preview IR">
          <>
          {iRAccordionTitles.map((title, index) => (
              <div className="c-accordion" key={index}>
                <div className="c-accordion__head">
                  <div className="c-accordion__head--title">{title}</div>
                </div>
                  <>
                    {index === 0 && (
                      <UnitDetailsIR
                        unitData={unitData}
                        setUnitData={setUnitData}
                        pirData={iRData}
                        setPirData={setIRData}
                        unitOptions={unitOptions}
                        departmentOptions={departmentOptions}
                        departments={departments}
                        currentStatus={currentStatus}
                        setCurrentStatus={setCurrentStatus}
                        setOpenSection={setOpenSection}
                        costOfIncidentOptions={costOfIncidentOptions}
                        prelimClassificOptions={prelimClassificOptions}
                        isEditMode={false}
                        readOnly={true}
                        />
                    )}
                    {index === 1 && (
                      <InvestigationReportAccordion
                        pirData={iRData || pirData }
                        teamMembers={iRData?.teamMembers}
                        immedActions={iRData?.immediateActions}
                        rootCausesData={iRData?.rootCauses}
                        setPirData={setPirData}
                        injuredJobTypeOptions={injuredJobTypeOptions} 
                        injuryNatureOptions={injuryNatureOptions}
                        bodyPartOptions={bodyPartOptions}
                        departmentOptions={departmentOptions}
                        setDepartmentOptions={setDepartmentOptions}
                        injuryData={undefined} 
                        setInjuryData={function (data: any): void {
                            throw new Error("Function not implemented.");
                        }} 
                        currentStatus={0}  
                        setCurrentStatus={function (status: number): void {
                            throw new Error("Function not implemented.");
                        }} 
                        setOpenSection={function (section: number): void {
                            throw new Error("Function not implemented.");
                        }}
                        readOnly={true}
                      />
                    )}
                  </>
              </div>
            ))}
          <div className="d-flex">
            <button
            className="iconBtn orange v2"
            onClick={async() => setInvestigationReportPreviewOpen(false)}
            type="button"
          >
            <span>Back</span>
          </button>
          </div>
          </>
      </CustomModal>
      <ToastContainer />
    </>
    );
};

export default ProtectedRoute(IncidentDetailsComp);
