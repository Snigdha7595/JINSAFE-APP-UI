"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import Link from 'next/link';
import SafetyAlertAccordion from "@/components/Form/SafetyAlertAccordion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useRef, useState } from "react";
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
import Button from "@/components/Elements/Button";
import CustomModal from "@/components/Layouts/CustomModal";
import { ToastContainer, toast } from "react-toastify";

const masterPayloadSchema = {
  objectId: "",
  pirId: "",
  unitName: "",
  incidentDate: "",
  incidentLocation: "",
  incidentTime: "",
  incidentClassification: "",
  processSafetyIncidentCategory: "",
  whatHappened: "",
  preliminaryFindings: "",
  createdAt: "",
  createdBy: "",
  updatedAt: "",
  updatedBy: "",
  assignedTo: "",
  assigneeSection: "",
  department: "",
  responsiblePerson: "",
  status: "",
  unitId: "",
  sectionName: "",
  departmentName: "",
  remarks: "",

  actionTaken: [
    {
      siNo: "",
      actiontaken: "",
      createdat: "",
      createdby: "",
      updatedat: "",
      updatedby: "",
      actionId: null,
      targetdate: "",
      status: "",
      imSubmoduleName: "",
      units: "",
      departments: "",
      responsibleDepartmentName: "",
      sections: "",
      responsibleSectionName: "",
      sectionhead: "",
      assignLinemanager: "",
      linemanagerName: "",
      rowIndex: null,
    },
  ],

  safetyAlertImages: [
    {
      imageId: null,
      pirId: "",
      fileId: "",
      fileType: "",
      fileName: "",
      createdAt: "",
      createdBy: "",
      fileSize: "",
      fileThumbnail: "",
    },
  ],

  safetyAlertRootCauses: [
    {
      factorType: "",
      physicalFactorType: null,
      factorName: "",
      pirId: "",
      finding: "",
      other: "",
    },
  ],

  preventiveActions: [
    {
      siNo: "",
      actiontaken: "",
      createdat: "",
      createdby: "",
      updatedat: "",
      updatedby: "",
      targetdate: "",
      status: "",
      imSubmoduleName: "",
      units: "",
      departments: "",
      responsibleDepartmentName: "",
      sections: "",
      responsibleSectionName: "",
      sectionhead: "",
      assignLinemanager: "",
      linemanagerName: "",
      actionType: "",
    },
  ],
};

const SafetyAlert = () => {
    const pirId = useSelector((state: RootState) => state.pir.pirId);
    const safetyId = useSelector((state: RootState) => state.pir.safetyId)
    const { user } = useSelector((state: RootState) => state.auth as { user: any });
    const dispatch = useDispatch();
    const router = useRouter();
    const token = useSelector(selectUserToken);

    const [saData, setSaData] = useState<any>(null);
    const [incidentList, setIncidentList] = useState<any>([]);
    const [ safetyRevertRemark, setSafetyRevertRemark ] = useState<string>("");
    const [ openSAPreview, setOpenSAPreview ] = useState<boolean>(false); 
    const transformPirToSafetyAlert = (pirData: any, user: any) => {
        return {
            ...masterPayloadSchema,
            objectId: createCaseSAObjectIdRef.current || saData?.objectId || null,
            safetyId: safetyId || "",
            pirId: pirData.pirId,
            unitName: pirData.unitName,
            unitId: pirData.unitId,
            incidentDate: pirData.incidentDate,
            incidentLocation: pirData.exactLocation,
            incidentTime: pirData.incidentTime,
            incidentClassification: pirData.incidentClassification,
            processSafetyIncidentCategory: pirData.incidentCategory,
            whatHappened: pirData.whatHappened,
            preliminaryFindings: pirData.preliminaryFindings,
            createdAt: new Date().toISOString(),
            createdBy: user?.createdBy,
            // createdBy: 'JSPL000002343', //user?.createdBy,
            updatedAt: new Date().toISOString(),
            // updatedBy: 'JSPL000002343', //user?.createdBy,
            updatedBy: user?.createdBy,
            department: pirData.departmentId,
            departmentName: pirData.departmentName,
            sectionName: pirData.sectionName,
            remarks: pirData.remark,
            status: "pending",
            assignedTo: pirData.lineManager,
            assigneeSection: pirData.sectionId,
            responsiblePerson: pirData.lineManager,
            
            // Transform images
            safetyAlertImages: pirData.images?.map((img: any) => ({
            pirId: pirData.pirId,
            fileId: img.fileId,
            fileType: img.fileType,
            fileName: img.fileName,
            fileSize: img.fileSize,
            fileThumbnail: img.fileThumbnail,
            createdAt: img.createdAt,
            createdBy: img.createdBy
            })) || [],
            
            // Transform immediateActions to actionTaken
            actionTaken: pirData.immediateActions?.map((action: any) => ({
            siNo: pirData.pirId,
            actiontaken: action.actiontaken,
            createdat: action.createdat,
            createdby: action.createdby,
            updatedat: action.updatedat,
            updatedby: action.updatedby,
            targetdate: action.targetdate,
            status: "Pending",
            imSubmoduleName: action.imSubmoduleName,
            units: action.units,
            departments: action.departments,
            responsibleDepartmentName: action.responsibleDepartmentName,
            sections: action.sections,
            responsibleSectionName: action.responsibleSectionName,
            sectionhead: action.sectionhead,
            assignLinemanager: action.assignLinemanager,
            linemanagerName: action.linemanagerName
            })) || [],
            
            safetyAlertRootCauses: [],
            preventiveActions: []
        };
        };
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [pirData, setPirData ] = useState<any>(null);
    const [publishButtonVisible, setPublishButtonVisible ] = useState<boolean>(false);
    const [immediateData, setImmediateData] = useState(null);
    const [incidentData, setIncidentData] = useState([{}]);
    const [prelimClassificOptions, setPrelimClassificOptions] =useState<SelectOptions[]>(emptySelector);
    const [twoStepProcess, setTwoStepProcess] = useState<boolean>(false);
    const [currentStatus, setCurrentStatus] = useState<number>(0);
    const [openSection, setOpenSection] = useState<number>(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [safetyAlertRootCausesData, setSafetyAlertRootCausesData] = useState<any>({});
    const [preventiveActions, setPreventiveActions] = useState<any>({});
    const [unitOptions, setUnitOptions] = useState(emptySelector);
    const createCaseSAObjectIdRef = useRef<string | null>(null);
    const [unitData, setUnitData] = useState({ unitId: "" });
    const [departments, setDepartments] = useState<any>(null);
    const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
    const [isPirDataInitialized, setIsPirDataInitialized] = useState(false);
    const [injuredJobTypeOptions, setInjuredJobTypeOptions] = useState<{ label: string; value: string; } | null>(null);
    const [injuryNatureOptions, setInjuryNatureOptions] = useState<SelectOptions[] | null>(null);
    const [bodyPartOptions, setBodyPartOptions] = useState<{ label: string; value: string;} | null>(null);

    const accordionTitles = [
        "Unit Details",
        "Incident Details",
        "Immediate Actions",
        "Images Video",
        "Root Cause",
        "Preventive/Corrective Action"
    ];

   const canEditPIR = (user?.userRoles?.some((role: any) => role.userRole === "IM Champion") || incidentList?.some((incident: any) => incident?.responsiblePersonJsplid === user?.jsplid)) && (incidentList?.some((incident: any) => (incident?.subSection === "Safety Alert" && incident?.status !== "Done" )));

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

    const fetchPirData = async (pirId: string) => {
        try {
        const response = await serverRequest(
            {}, 
            SAVE_DRAFT_PIR + `/get-pir/${pirId}`, 
            CONSTANTS.REQUEST_GET, 
            true, 
            true, 
            token
        );

        if (response.success) {
            let transformedData = {
            objectId: null,
            pirId: response.pir.pirId,
            unitId: response.pir.unitId,
            unitName: response.pir.unitName,
            departmentId: response.pir.departmentId,
            department: response.pir.departmentId,
            departmentName: response.pir.departmentName,
            sectionId: response.pir.sectionId,
            sectionName: response.pir.sectionName,
            exactLocation: response.pir.exactLocation,
            incidentDate: response.pir.incidentDate,
            incidentTime: response.pir.incidentTime,
            personInjured: response.pir.personInjured,
            lineManager: response.pir.lineManager,
            sectionHead: response.pir.sectionHead,
            departmentHod: response.pir.departmentHod,
            incidentClassification: response.pir.incidentClassification,
            incidentCategory: response.pir.incidentCategory,
            whatHappened: response?.pir?.whatHappened || response.safetyAlert?.whatHappened || "",
            processSteps: response.pir.processSteps,
            preliminaryFindings: response?.pir?.preliminaryFindings || response?.safetyAlert?.preliminaryFindings,
            remark: response.pir.remark,
            images: response.images.map((img: any) => ({
                fileId: img.mongoId,
                fileType: img.fileType,
                fileName: img.fileName,
                fileSize: img.fileSize,
                fileThumbnail: img.fileThumbnail,
                createdAt: img.createdAt,
                createdBy: img.createdBy
            })),
            immediateActions: response.immediateActions.map((action: any) => ({
                actiontaken: action.actiontaken,
                createdat: action.createdat,
                createdby: action.createdby,
                updatedat: action.updatedat || action.createdat,
                updatedby: action.updatedby || action.createdby,
                assignLinemanager: action.assignLinemanager,
                linemanagerName: action.linemanagerName,
                targetdate: action.targetdate,
                sections: action.sections,
                departments: action.departments,
                sectionhead: action.sectionhead,
                imSubmoduleName: action.imSubmoduleName,
                units: action.units,
                responsibleDepartmentName: action.responsibleDepartmentName,
                responsibleSectionName: action.responsibleSectionName
            }))
            };

            const saDraftResponse = await serverRequest(
                {},
                SAFETY_ALERT + `/get-draft/${pirId}`,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
              );
              if (saDraftResponse.pirId) {
                transformedData = {
                  ...transformedData,
                  ...saDraftResponse,
                  preventiveActions: saDraftResponse?.preventiveActions,
                  safetyAlertRootCauses: saDraftResponse?.safetyAlertRootCauses,
                  images: [...transformedData.images, ...(saDraftResponse.safetyAlertImages || [])],
                };
              }

              setPirData(transformedData);
              setSaData(transformPirToSafetyAlert(transformedData, user))
              console.log("response journey", response);
              setIncidentList(response.pirJourneys)
        }
        } catch (error) {
        console.error("Error fetching PIR:", error);
        }
    };

    useEffect(() => {
        if (pirId) {
            fetchPirData(pirId)
        } else if (!pirId) {
          router.push(APP_URL.INCIDENT_MANAGEMENT);
        }
        return () => {
            createCaseSAObjectIdRef.current = null;
            dispatch(setPirId(pirId))
            };
    }, [])

    useEffect(() => {
      console.log("pirData images changed:", pirData?.images);
      console.log("saData safetyAlertImages changed:", saData?.safetyAlertImages);
    }, [pirData?.images, saData?.safetyAlertImages]);

    useEffect(() =>{
        fetchRiskPotential();
        fetchPreliminaryClassification();
        fetchBodyPartsDetail();
        fetchNatureOfInjuries();
    }, [])

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

    const saveDraftSafetyAlert = async () => {
    if (isPublishing || isSavingDraft) return; // Prevent conflict with publish or ongoing draft save
    setIsSavingDraft(true);
    if (!saData) return;
    try {
      const payload = {
        ...saData,
        objectId: createCaseSAObjectIdRef.current || null
      };
      const response = await serverRequest(
        payload,
        SAFETY_ALERT + `/save-safety-alert`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response?.objectId) {
        setSaData((prev: any) => ({ ...prev, objectId: response.objectId, pirId: response.pirId }));
        
        if (!createCaseSAObjectIdRef.current) {
          createCaseSAObjectIdRef.current = response.objectId;
        }
      }
    } catch (error) {
      console.error("Error saving Safety Alert:", error);
    }
     finally {
      setIsSavingDraft(false);
    }
  };
    
      const revertDraftSafetyAlert = async () => {
        if (!saData) return;

        try {
            const payload = {
                ...saData,
                objectId: createCaseSAObjectIdRef.current || null
            };
            const response = await serverRequest(
                payload,
                SAFETY_ALERT + `/save-safety-alert/revert`,
                CONSTANTS.REQUEST_POST,
                true,
                true,
                token
            );

            if(response.success){
                setSafetyRevertRemark("")
                dispatch(setPirId(pirId))
                router.push(APP_URL.INCIDENT_DETAIL);
            }
        } catch (error) {
          console.error("Error saving PIR:", error);
        }
      };
    
      const publishSafetyAlert = async () => {
        // if (isPublishing || isSavingDraft) return; // stop if any save is in progress
        setIsPublishing(true);
        setIsSavingDraft(false);
        try {
          const response = await serverRequest(
            {
                ...saData,
                objectId: createCaseSAObjectIdRef.current
            },
            SAFETY_ALERT + `/save-safety-alert/publish`,
            CONSTANTS.REQUEST_POST,
            true,
            true,
            token
          );
    
          if (response?.safetyId) {
            toast.success("Safety Alert published Successfully");
            dispatch(setPirId(pirId));
            setTimeout(() => {
              router.push(APP_URL.INCIDENT_DETAIL);
            }, 1000);
          }
        } catch (error) {
          console.error("Error saving PIR:", error);
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

    useEffect(() => {
      if (pirData?.pirId && !isPirDataInitialized) {
        setIsPirDataInitialized(true);
        // Only set these if we're creating a new PIR
        setUnitOptions([
            { label: pirData?.unitName || "", value: pirData?.unitId || "" },
        ]);
        setUnitData({ unitId: pirData?.unitId });
        setTwoStepProcess(pirData?.processSteps == "Two"? true : false)
        setPirData((prev) => ({
            ...prev,
            unitId: pirData?.unitId,
            unitName: pirData?.unitName,
            designationId: pirData?.designationId,
            createdBy: pirData?.createdBy,
            updatedBy: pirData?.updatedBy,
            designationName: pirData?.designationName,
            createdByUserRole: user.role.includes("HOD")? "HOD": "Employee",//pirData.createdByUserRole,
        }));

        if (pirData?.unitId) {
            fetchDepartments(pirData?.unitId);
        }
      }
    }, [pirData, isPirDataInitialized]);

  //   useEffect(() => {
  //   if (pirId) {
  //     fetchPirData(pirId);
  //   }
  // }, [pirId]);

    useEffect(() => {
        saveDraftSafetyAlert();
    }, [pirData]);

    useEffect(() => {
    if (pirData && !isInitialized) {
      setUnitOptions([{ label: pirData.unitName, value: pirData.unitId }]);
      setIsInitialized(true);
    }
  }, [pirData, isInitialized]);

    const toggleSection = (index: number) => {
        if (index > currentStatus) return; // block if index > currentStatus

        setOpenSection((prev) => (prev === index ? -1 : index));
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
      <div className="admin-boxContainer d1 nobackground">
          {/* <SafetyAlertAccordion/> */}
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
                  />
                }
                { index === 3 && <ImagesVideo 
                    incidentData={incidentData}
                    setIncidentData={setIncidentData}
                    publishButtonVisible={publishButtonVisible}
                    twoStepProcess={twoStepProcess}
                    setOpenSAPreview={setOpenSAPreview}
                    openSAPreview={openSAPreview}
                    createCaseSAObjectIdRef={createCaseSAObjectIdRef}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    setPublishButtonVisible={setPublishButtonVisible}
                    pirData={pirData}
                    saData={saData}
                    setSaData={setSaData}
                    setPirData={setPirData}
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
                />}
                { index === 5 && twoStepProcess && <PreventiveActions
                    pirData={pirData}
                    preventiveActions={preventiveActions}
                    setPreventiveActions={setPreventiveActions}
                    setPirData={setPirData}
                    createCaseSAObjectIdRef={createCaseSAObjectIdRef}
                    setSaData={setSaData}
                    saData={saData}
                    publishButtonVisible={publishButtonVisible}
                    setOpenSAPreview={setOpenSAPreview}
                    setPublishButtonVisible={setPublishButtonVisible}
                    departmentOptions={departmentOptions}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
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
        title="Preview Safety Alert">
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
                        currentStatus={currentStatus}
                        setCurrentStatus={setCurrentStatus}
                        setOpenSection={setOpenSection}
                        setPublishButtonVisible={setPublishButtonVisible}
                        pirData={pirData}
                        saData={saData}
                        setSaData={setSaData}
                        setPirData={setPirData}
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
                        readOnly={true}
                    />
                  )}
                  {index === 5 && twoStepProcess && (
                    <PreventiveActions
                        pirData={pirData}
                        preventiveActions={preventiveActions}
                        setPreventiveActions={setPreventiveActions}
                        setPirData={setPirData}
                        twoStepProcess={twoStepProcess}
                        setSaData={setSaData}
                        saData={saData}
                        publishButtonVisible={publishButtonVisible}
                        setPublishButtonVisible={setPublishButtonVisible}
                        departmentOptions={departmentOptions}
                        currentStatus={currentStatus}
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
            onClick={async() => setOpenSAPreview(false)}
            type="button"
          >
            <span>Back</span>
          </button>
          <button
            className="iconBtn green v2"
            // onClick={async() => {publishSafetyAlert()}}
            onClick={publishSafetyAlert}
            disabled={isPublishing} // disable while submitting
            type="button"
          >
            <span>{isPublishing ? "Publishing..." : "Submit Safety Alert"}</span>
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

export default ProtectedRoute(SafetyAlert);