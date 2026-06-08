"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import Link from 'next/link';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useState, useRef } from "react";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_DEPARTMENTS, FETCH_RISK_POTENTIAL, GET_ALL_BODY_PARTS, GET_NATURE_OF_INJURIES, GET_PRELIMINARY_CLASSIFICATION, SAFETY_ALERT, SAVE_DRAFT_PIR } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import { emptySelector } from "@/config/config";
import UnitDetails from "./_partials/UnitDetails";
import IncidentDetails from "./_partials/IncidentDetails";
import Immediate from "./_partials/Immediate";
import SafetyAlertRootCauses from "./_partials/SafetyAlertRootCauses";
import PreventiveActions from "./_partials/PreventiveActions";
import { SelectOptions } from "@/components/interfaces";
import ImagesVideo from "./_partials/ImagesVideo";
import { setPirId } from "@/store/slices/pirSlice";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/Layouts/CustomModal";
import { ToastContainer, toast } from "react-toastify";
import InputField from "@/components/Form/InputField";

const SafetyAlert = () => {
    const pirId = useSelector((state: RootState) => state.pir.pirId);
    const { user } = useSelector((state: RootState) => state.auth as { user: any });
    const dispatch = useDispatch();
    const router = useRouter();
    const token = useSelector(selectUserToken);
    const safetyAlertId = pirId;

    const [saData, setSaData] = useState<any>(null);
    const [openRevertConfirmation, setOpenRevertConfirmation] = useState<boolean>(false);
    const [safetyRevertRemark, setSafetyRevertRemark] = useState<string>("")
    const [isFinalSubmit, setIsFinalSubmit] = useState<boolean>(false)
    const [incidentList, setIncidentList] = useState<any>([]);    
    const [openSAPreview, setOpenSAPreview] = useState<boolean>(false); 
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isReverting, setIsReverting] = useState(false);
    const [showRevertModal, setShowRevertModal] = useState(false);
    const [pirData, setPirData ] = useState<any>(null);
    const [publishButtonVisible, setPublishButtonVisible ] = useState<boolean>(false);
    const [immediateData, setImmediateData] = useState(null);
    const [incidentData, setIncidentData] = useState([{}]);
    const [prelimClassificOptions, setPrelimClassificOptions] =useState<SelectOptions[]>(emptySelector);
    const [twoStepProcess, setTwoStepProcess] = useState<boolean>(false);
    const [currentStatus, setCurrentStatus] = useState<number>(0);
    const [openSection, setOpenSection] = useState<number>(0);
    const [safetyAlertRootCausesData, setSafetyAlertRootCausesData] = useState<any>({});
    const [preventiveActions, setPreventiveActions] = useState<any>({});
    const [unitOptions, setUnitOptions] = useState(emptySelector);
    const [unitData, setUnitData] = useState({ unitId: "" });
    const [departments, setDepartments] = useState<any>(null);
    const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
    const [injuredJobTypeOptions, setInjuredJobTypeOptions] = useState<{ label: string; value: string; } | null>(null);
    const [injuryNatureOptions, setInjuryNatureOptions] = useState<SelectOptions[] | null>(null);
    const [bodyPartOptions, setBodyPartOptions] = useState<{ label: string; value: string;} | null>(null);

    const imagesVideoRef = useRef<any>(null);
    const preventiveActionsRef = useRef<any>(null);
    const [isSavingForRevert, setIsSavingForRevert] = useState<boolean>(false);

    const accordionTitles = [
        "Unit Details",
        "Incident Details",
        "Immediate Actions",
        "Images Video",
        "Root Cause",
        "Preventive/Corrective Action"
    ];

   const canEditPIR = (user?.userRoles?.some((role: any) => role.userRole === "IM Champion") || incidentList?.some((incident: any) => incident?.responsiblePersonJsplid === user?.jsplid)) && (incidentList?.some((incident: any) => (incident?.subSection === "Safety Alert" && incident?.status !== "Done")));
    
    const revertButtonVisible = canEditPIR && !incidentList?.some((incident: any) => 
        incident?.subSection === "Safety Alert" && incident?.nextAction.toUpperCase() === "RESUBMIT"
    );

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

    const fetchSafetyAlertData = async (safetyAlertId: string) => {
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
          
          // Transform API response to match expected saData structure
          const transformedSaData = {
            // Basic safety alert fields
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
            // Additional fields from PIR if needed
            personInjured: pirData?.personInjured || "",
            exactLocation: pirData?.exactLocation || safetyAlert.incidentLocation,
            
            // Transform images array to safetyAlertImages format
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
            
            // Transform immediateActions to actionTaken format
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
            
            // Transform rootCauses to safetyAlertRootCauses format
            safetyAlertRootCauses: (response.rootCauses || []).map((cause: any) => ({
                pkeyId: cause.pkeyId || 0,
                factorType: cause.factorType,
                physicalFactorType: null,
                factorName: cause.factorName,
                pirId: cause.pirId,
                finding: cause.finding || "",
                other: cause.other || ""
            })),
            
            // Transform preventiveActions if exists
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
            
            // Set root causes data separately for SafetyAlertRootCauses component
            if (transformedSaData.safetyAlertRootCauses && transformedSaData.safetyAlertRootCauses.length > 0) {
              setSafetyAlertRootCausesData(transformedSaData.safetyAlertRootCauses);
            }
            
            // Set preventive actions data separately for PreventiveActions component
            if (transformedSaData.preventiveActions && transformedSaData.preventiveActions.length > 0) {
              setPreventiveActions(transformedSaData.preventiveActions);
            }
            
            // Set PIR data
            if (pirData) {
              setPirData(pirData);
              setTwoStepProcess(pirData.processSteps === "Two");
            }
            
            // Set incident list
            setIncidentList(response.pirJourneys || []);
            
            // Set unit data and options
            if (safetyAlert?.unitId) {
              setUnitData({ unitId: safetyAlert.unitId });
              setUnitOptions([
                  { label: safetyAlert.unitName || "", value: safetyAlert.unitId || "" },
              ]);
              fetchDepartments(safetyAlert.unitId);
            } 
          } else {
            toast.error("Safety Alert not found");
            dispatch(setPirId(pirId))
            router.push(APP_URL.INCIDENT_DETAIL);
          }
      } catch (error) {
        console.error("Error fetching Safety Alert:", error);
        toast.error("Failed to load Safety Alert");
        dispatch(setPirId(pirId))
        router.push(APP_URL.INCIDENT_DETAIL);
      }
  };

    useEffect(() =>{
        fetchRiskPotential();
        fetchPreliminaryClassification();
        fetchBodyPartsDetail();
        fetchNatureOfInjuries();

        return () => {
          dispatch(setPirId(pirId))
        }
    }, [])

    useEffect(() => {
        if (safetyAlertId) {
            fetchSafetyAlertData(safetyAlertId);
        } else {
            toast.error("Invalid Safety Alert ID");
            router.push(APP_URL.INCIDENT_MANAGEMENT);
        }
    }, [safetyAlertId]);

    useEffect(() => {
        if(((openSection == 5) && twoStepProcess) || (!twoStepProcess && (openSection == 3))){
            setPublishButtonVisible(true)
        } else {
            setPublishButtonVisible(false)
        }
    }, [openSection, twoStepProcess])

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

      const updateSafetyAlert = async () => {
        if (!saData) return;
        
        setIsUpdating(true);
        try {
            const response = await serverRequest(
                {
                    ...saData,
                    updatedAt: new Date().toISOString(),
                    updatedBy: user?.jsplid || user?.createdBy
                },
                SAFETY_ALERT + `/update-safety-alert/${safetyAlertId}`,
                CONSTANTS.REQUEST_PUT,
                true,
                true,
                token
            );

            if (response.success) {
                toast.success("Safety Alert updated successfully!");
                fetchSafetyAlertData(safetyAlertId);
            } else {
                toast.error(response.message || "Failed to update Safety Alert");
            }
        } catch (error) {
            console.error("Error updating Safety Alert:", error);
            toast.error("An error occurred while updating");
        } finally {
            setIsUpdating(false);
        }
      };
    
      const revertSafetyAlert = async () => {
        if (!saData || !safetyRevertRemark.trim()) return;
        setIsReverting(true);
        try {
          const unitId = saData.unitId || "4";
          const sectionId = "1";
          const isNewEntry = (id: any) => {
            return id === 0 || id === null || id === undefined;
          };
          const departmentName = saData?.departmentName || "";

          const revertPayload: any = {
            safetyId: saData.safetyId,
            pirId: saData.pirId,
            unitId: unitId,
            unitName: saData.unitName,
            department: saData.department,
            departmentName: departmentName,
            sectionName: saData.sectionName,
            incidentDate: saData.incidentDate,
            incidentTime: saData.incidentTime,
            incidentLocation: saData.incidentLocation,
            incidentClassification: saData.incidentClassification,
            processSafetyIncidentCategory: saData.processSafetyIncidentCategory,
            whatHappened: saData?.whatHappened || pirData.whatHappened,
            preliminaryFindings: saData?.preliminaryFindings || pirData.preliminaryFindings,
            remarks: saData?.remark || pirData?.remark,
            safetyRevertRemark: safetyRevertRemark || "",
            createdBy: saData.createdBy,
            updatedBy: user?.jsplid || user?.createdBy,
            accordionIndex: saData.accordionIndex || 0,
            toMailGroup: saData.toMailGroup,
            ccMailGroup: saData.ccMailGroup,
            
            actionTaken: (saData.actionTaken || []).map((action: any) => {
              const isNew = isNewEntry(action.actionId);
              return {
                siNo: action.siNo || saData.pirId,
                actiontaken: action.actiontaken,
                createdat: typeof action.createdat === 'string' 
                  ? action.createdat 
                  : (action.createdat?.toISOString?.() || new Date().toISOString()),
                createdby: action.createdby || user?.createdBy || "",
                updatedat: typeof action.updatedat === 'string' 
                  ? action.updatedat 
                  : (action.updatedat?.toISOString?.() || new Date().toISOString()),
                updatedby: action.updatedby || user?.createdBy || "",
                actionId: isNew ? 0 : (action.actionId || 0),
                targetdate: action.targetdate,
                status: action.status || "Pending",
                rowIndex: action.rowIndex || 0,
                actiontakenByUser: action.actiontakenByUser || "Safety Alert",
                imSubmoduleName: action.imSubmoduleName || "Safety Alert",
                units: action.units || unitId,
                departments: action.departments || saData.department || "128",
                responsibleDepartmentName: action.responsibleDepartmentName || departmentName,
                sections: action.sections || sectionId,
                responsibleSectionName: action.responsibleSectionName || saData.sectionName,
                sectionhead: action.sectionhead || "",
                assignLinemanager: action.assignLinemanager || "",
                linemanagerName: action.linemanagerName || ""
              };
            }),
            
            safetyAlertImages: (saData.safetyAlertImages || []).map((image: any) => {
              const isNew = isNewEntry(image.imageId);
              return {
                imageId: isNew ? 0 : (image.imageId || 0),
                pirId: image.pirId || saData.pirId,
                fileId: image.fileId,
                fileType: image.fileType || "",
                fileName: image.fileName,
                createdAt: image.createdAt,
                createdBy: image.createdBy,
                fileSize: image.fileSize,
                fileThumbnail: image.fileThumbnail || image.fileId,
                rowIndex: image.rowIndex || 0
              };
            })
          };

          if (twoStepProcess) {
            revertPayload.safetyAlertRootCauses = (saData.safetyAlertRootCauses || []).map((cause: any) => {
              const isNew = isNewEntry(cause.pkeyId);
              return {
                pkeyId: isNew ? 0 : (cause.pkeyId || 0),
                factorType: cause.factorType,
                physicalFactorType: null,
                factorName: cause.factorName,
                pirId: cause.pirId || saData.pirId,
                finding: cause.finding || "",
                other: cause.other || ""
              };
            });
            
            revertPayload.preventiveActions = (saData.preventiveActions || []).map((action: any) => {
              const isNew = isNewEntry(action.actionId);
              return {
                siNo: action.siNo || saData.pirId,
                actiontaken: action.actiontaken || "",
                createdat: typeof action.createdat === 'string' 
                  ? action.createdat 
                  : (action.createdat?.toISOString?.() || new Date().toISOString()),
                createdby: action.createdby || "",
                updatedat: typeof action.updatedat === 'string' 
                  ? action.updatedat 
                  : (action.updatedat?.toISOString?.() || new Date().toISOString()),
                updatedby: action.updatedby || "",
                actionId: isNew ? 0 : (action.actionId || 0),
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
                actionType: action.actionType || "",
                rowIndex: action.rowIndex || 0
              };
            });
          }
          const response = await serverRequest(
            revertPayload,
            SAFETY_ALERT + `/save-safety-alert/revert`,
            CONSTANTS.REQUEST_POST,
            true,
            true,
            token
          );
            if(response.success){                
              toast.success("Safety Alert reverted successfully!");
              setShowRevertModal(false);
              setSafetyRevertRemark("");
              setTimeout(() => {
              dispatch(setPirId(pirId))
              router.push(APP_URL.INCIDENT_DETAIL);
            }, 1000);
          } else {
            toast.error(response?.message || "Failed to revert Safety Alert");
          }
        } catch (error) {
          console.error("Error reverting Safety Alert:", error);
          toast.error("An error occurred while reverting");
        } finally {
          setIsReverting(false);
        }
      };

    const publishSafetyAlert = async () => {
    setIsPublishing(true);
    
    if (!saData) {
      toast.error("No safety alert data to publish");
      setIsPublishing(false);
      return;
    }
    
    try {
        const unitId = saData.unitId || "4";
        const sectionId = "1";
        const isNewEntry = (id: any) => {
          return id === 0 || id === null || id === undefined;
        };
      const departmentName = saData?.departmentName || "";
      const publishPayload = {
        safetyId: saData.safetyId,
          pirId: saData.pirId,
          unitId: unitId,
          unitName: saData.unitName,
          department: saData.department,
          departmentName: departmentName,
          sectionName: saData.sectionName,
          incidentDate: saData.incidentDate,
          incidentTime: saData.incidentTime,
          incidentLocation: saData.incidentLocation,
          incidentClassification: saData.incidentClassification,
          processSafetyIncidentCategory: saData.processSafetyIncidentCategory,
          whatHappened: saData.whatHappened || pirData?.whatHappened,
          preliminaryFindings: saData.preliminaryFindings || pirData?.preliminaryFindings,
          remarks: saData.remarks || pirData?.remark || "",
          createdBy: saData.createdBy,
          updatedBy: user?.jsplid || user?.createdBy,
          accordionIndex: saData.accordionIndex || 0,
          toMailGroup: saData.toMailGroup,
          ccMailGroup: saData.ccMailGroup,
          actionTaken: (saData.actionTaken || []).map((action: any) => {

            const isNew = isNewEntry(action.actionId);
            return {
              siNo: action.siNo || saData.pirId,
              actiontaken: action.actiontaken,
              createdat: typeof action.createdat === 'string' 
                ? action.createdat 
                : (action.createdat?.toISOString?.() || new Date().toISOString()),
              createdby: action.createdby || user?.createdBy || "",
              updatedat: typeof action.updatedat === 'string' 
                ? action.updatedat 
                : (action.updatedat?.toISOString?.() || new Date().toISOString()),
              updatedby: action.updatedby || user?.createdBy || "",
              actionId: isNew ? 0 : (action.actionId || 0),
              targetdate: action.targetdate,
              status: action.status || "Pending",
              rowIndex: action.rowIndex || 0,
              actiontakenByUser: action.actiontakenByUser || "Safety Alert",
              imSubmoduleName: action.imSubmoduleName || "Safety Alert",
              units: action.units || unitId,
              departments: action.departments || saData.department || "",
              responsibleDepartmentName: action.responsibleDepartmentName || departmentName,
              sections: action.sections || sectionId,
              responsibleSectionName: action.responsibleSectionName || saData.sectionName,
              sectionhead: action.sectionhead || "",
              assignLinemanager: action.assignLinemanager || "",
              linemanagerName: action.linemanagerName || ""
            };
          }),
          safetyAlertImages: (saData.safetyAlertImages || []).map((image: any) => {
            const isNew = isNewEntry(image.imageId);
            
            return {
              imageId: isNew ? 0 : (image.imageId || 0),
              pirId: image.pirId || saData.pirId,
              fileId: image.fileId,
              fileType: image.fileType || "",
              fileName: image.fileName,
              createdAt: image.createdAt,
              createdBy: image.createdBy,
              fileSize: image.fileSize,
              fileThumbnail: image.fileThumbnail || image.fileId,
              rowIndex: image.rowIndex || 0
            };
          }),
          ...(twoStepProcess && {
            safetyAlertRootCauses: (saData.safetyAlertRootCauses || []).map((cause: any) => {
              const isNew = isNewEntry(cause.pkeyId);
              
              return {
                pkeyId: isNew ? 0 : (cause.pkeyId || 0),
                factorType: cause.factorType,
                physicalFactorType: null,
                factorName: cause.factorName,
                pirId: cause.pirId || saData.pirId,
                finding: cause.finding || "",
                other: cause.other || ""
              };
            }),
            preventiveActions: (saData.preventiveActions || []).map((action: any) => {
              const isNew = isNewEntry(action.actionId);

              return {
                siNo: action.siNo || saData.pirId,
                actiontaken: action.actiontaken || "",
                createdat: typeof action.createdat === 'string' 
                  ? action.createdat 
                  : (action.createdat?.toISOString?.() || new Date().toISOString()),
                createdby: action.createdby || "",
                updatedat: typeof action.updatedat === 'string' 
                  ? action.updatedat 
                  : (action.updatedat?.toISOString?.() || new Date().toISOString()),
                updatedby: action.updatedby || "",
                actionId: isNew ? 0 : (action.actionId || 0),
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
                actionType: action.actionType || "",
                rowIndex: action.rowIndex || 0
              };
            })
          })
        }
      
      const response = await serverRequest(
        publishPayload,
        SAFETY_ALERT + `/save-safety-alert/publish`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      
      if (response?.safetyId || response?.success) {
        toast.success("Safety Alert published Successfully");
        dispatch(setPirId(pirId));
        setTimeout(() => {
          router.push(APP_URL.INCIDENT_DETAIL);
        }, 1000);
      } else {
        toast.error(response?.message || "Failed to publish Safety Alert");
      }
      
    } catch (error) {
      console.error("Error publishing Safety Alert:", error);
      toast.error("An error occurred while publishing");
    } finally {
      setTimeout(() => {
          setIsPublishing(false);
        }, 1500);
    }
  };

      useEffect(() => {
        if (pirData?.unitId) {
            fetchDepartments(pirData.unitId);
        }
    }, [pirData?.unitId]);

    const toggleSection = (index: number) => {
        if (index > currentStatus) return; // block if index > currentStatus
        setOpenSection((prev) => (prev === index ? -1 : index));
    };

    const forceSaveAllData = async (): Promise<boolean> => {
        setIsSavingForRevert(true);
        try {
            let allSaved = true;
            
            // Save ImagesVideo data if component exists
            if (imagesVideoRef.current) {
                const imagesSaved = await imagesVideoRef.current.forceSaveImages();
                if (!imagesSaved) allSaved = false;
            }
            
            // Save PreventiveActions data if component exists
            if (preventiveActionsRef.current) {
                const preventiveSaved = await preventiveActionsRef.current.forceSavePreventiveActions();
                if (!preventiveSaved) allSaved = false;
            }
            
            return allSaved;
        } catch (error) {
            console.error("Error saving data for revert:", error);
            return false;
        } finally {
            setIsSavingForRevert(false);
        }
    };

    const handleRevertClick = async () => {
        const saved = await forceSaveAllData();
        if (saved) {
            setOpenRevertConfirmation(true);
        } else {
            toast.error("Failed to save form data. Please try again.");
        }
    };

  return (
    <>
    <div className="container-fluid">
      <div className="admin-boxContainer d3">
        <div className="adminAction">
          <Link href={APP_URL.INCIDENT_DETAIL} className="adminAction__title">
            <span className="icon">
              <Image
                width="15"
                height="15"
                alt="icon"
                src="/images/svg/arrow-left-grey.svg"
                className="img-fluid u-image"
              />
            </span>
            Publish Safety Alert
          </Link>
          <div className="d-flex">
          {revertButtonVisible && (
            <button
              className="iconBtn orange v2"
              type="button"
              disabled={isSavingForRevert}
              onClick={handleRevertClick}
            >
              <span>{isSavingForRevert ? "Saving..." : "Revert Safety Alert"}</span>
            </button>
          )}
          { canEditPIR && (
          <button className="iconBtn orange" type="button"
           onClick={() => {
            dispatch(setPirId(pirId)); 
            router.push(APP_URL.PIR_EDIT);
          }}
          >
          <span>Edit PIR</span>
          <Image
            width="15"
            height="15"
            alt="icon"
            src="/images/svg/icons/Edit.svg"
            className="img-fluid u-image"
          />
        </button>)}
        </div>
        </div>
      </div>
      <div className="admin-boxContainer d1 nobackground">
          {accordionTitles.map((title, index) => {
            if ((title === "Root Cause" || title === "Preventive/Corrective Action") && !twoStepProcess){
                return null;
            }
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
                  isUpdateMode={true}
                />
                )}
                {index === 1 && (
                  <IncidentDetails
                    incidentData={incidentData}
                    saData={saData}
                    setSaData={setSaData}
                    setIncidentData={setIncidentData}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    pirData={pirData}
                    setPirData={setPirData}
                    isUpdateMode={true}
                  />
                )}
                {index === 2 && <Immediate
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
                    isUpdateMode={true}
                  />
                }
                { index === 3 && <ImagesVideo 
                    ref={imagesVideoRef}
                    incidentData={incidentData}
                    setIncidentData={setIncidentData}
                    publishButtonVisible={publishButtonVisible}
                    twoStepProcess={twoStepProcess}
                    setOpenSAPreview={setOpenSAPreview}
                    openSAPreview={openSAPreview}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    setPublishButtonVisible={setPublishButtonVisible}
                    setOpenRevertConfirmation={setOpenRevertConfirmation}
                    onRevertClick={handleRevertClick}
                    pirData={pirData}
                    saData={saData}
                    setSaData={setSaData}
                    setPirData={setPirData}
                    revertButtonVisible={revertButtonVisible}
                    isUpdateMode={true}
                /> }
                { index === 4 && twoStepProcess && <SafetyAlertRootCauses
                    pirData={pirData}
                    safetyAlertRootCausesData={safetyAlertRootCausesData}
                    setSafetyAlertRootCausesData={setSafetyAlertRootCausesData}
                    setPirData={setPirData}
                    saData={saData}
                    setSaData={setSaData}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    isUpdateMode={true}
                />}
                { index === 5 && twoStepProcess && <PreventiveActions
                    ref={preventiveActionsRef}
                    pirData={pirData}
                    preventiveActions={preventiveActions}
                    setPreventiveActions={setPreventiveActions}
                    setPirData={setPirData}                    
                    setSaData={setSaData}
                    saData={saData}
                    publishButtonVisible={publishButtonVisible}
                    setOpenSAPreview={setOpenSAPreview}
                    setPublishButtonVisible={setPublishButtonVisible}
                    onRevertClick={handleRevertClick}
                    revertButtonVisible={revertButtonVisible}
                    setOpenRevertConfirmation={setOpenRevertConfirmation}
                    departmentOptions={departmentOptions}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    isUpdateMode={true}
                />}
              </>
            )}
          </div>
        );
      })}
      </div>
    </div>
    <CustomModal 
        isOpen={openSAPreview}
        onClose={() => setOpenSAPreview(false)}
        bodyClassName="isScrollable"
        title="Publish Safety Alert">
          <>
          {accordionTitles.map((title, index) => {
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
                    <UnitDetails
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
                    <IncidentDetails
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
                    <Immediate
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
                    <ImagesVideo 
                      incidentData={incidentData}
                      setIncidentData={setIncidentData}
                      publishButtonVisible={publishButtonVisible}
                      twoStepProcess={twoStepProcess}
                      setOpenSAPreview={setOpenSAPreview}
                      openSAPreview={openSAPreview}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      setPublishButtonVisible={setPublishButtonVisible}
                      pirData={pirData}
                      saData={saData}
                      setSaData={setSaData}
                      setPirData={setPirData}
                      isUpdateMode={false}
                      readOnly={true}
                    />
                  )}
                  {index === 4 && twoStepProcess && (
                    <SafetyAlertRootCauses
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
                    <PreventiveActions
                      pirData={pirData}
                      preventiveActions={preventiveActions}
                      setPreventiveActions={setPreventiveActions}
                      setPirData={setPirData}
                      setSaData={setSaData}
                      saData={saData}
                      publishButtonVisible={publishButtonVisible}
                      setOpenSAPreview={setOpenSAPreview}
                      setPublishButtonVisible={setPublishButtonVisible}
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
          <div className="actionWrapper">
            <button
            className="iconBtn orange v2"
            onClick={async() => setOpenSAPreview(false)}
            type="button"
          >
            <span>Back</span>
          </button>
          <button
            className="iconBtn green v2"
            onClick={async() => {publishSafetyAlert(); setIsFinalSubmit(true)}}
            disabled={isPublishing}
            type="button"
          >
            <span>{isPublishing ? "Publishing..." : "Publish Safety Alert"}</span>
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
      <CustomModal
        isOpen={openRevertConfirmation}
        onClose={() => setOpenRevertConfirmation(false)}
        bodyClassName="isScrollable"
        title="Confirm Safety Alert Revert"
      >
        <div className="filters">
          <div className="row form_grider d1">
            <h2>Are you sure you want to revert this Safety Alert?</h2>
            <div className="py-2">
              <InputField 
                type="text"
                label="Revert remark"
                maxLength={300}
                value={safetyRevertRemark}
                name="safetyRevertRemark"
                placeholder="Reverted due to..."
                onChange={(e) => {
                  setSafetyRevertRemark(e.target.value);
                }}/>
            </div>
            <div className="col-12">
              <div className="btnWrapper">
                <button
                  className="iconBtn orange v2"
                  onClick={() => setOpenRevertConfirmation(false)}
                  type="button"
                >
                  <span>Back</span>
                </button>
                <button
                  className="iconBtn green v2"
                  disabled={!safetyRevertRemark.trim() || isReverting}
                  style={{cursor: safetyRevertRemark.trim() ? "pointer" : "not-allowed"}}
                  onClick={async () => {
                    revertSafetyAlert();
                  }}
                  type="button"
                >
                  <span>
                    {isReverting ? "Reverting..." : "Submit"}
                    <Image
                      width="15"
                      height="15"
                      alt="submit button"
                      src="/images/svg/plane_icon_45deg.svg"
                      className="img-fluid u-image ms-1"
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
       <ToastContainer position="top-right" autoClose={3000} 
        hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default ProtectedRoute(SafetyAlert);
