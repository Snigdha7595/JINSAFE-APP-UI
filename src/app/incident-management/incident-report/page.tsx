"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { clearObjectId, setObjectId} from "@/store/slices/investigationSlice"; // selectDraftObjectIds
import { setPirId } from "@/store/slices/pirSlice";
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { serverRequest } from "@/services/getServerSideRender";
import { SAVE_DRAFT_PIR, FETCH_RISK_POTENTIAL, INCIDENT_COST, GET_ALL_BODY_PARTS, FETCH_DEPARTMENTS, GET_PRELIMINARY_CLASSIFICATION, INVESTIGATION, SAFETY_ALERT } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import Image from "next/image";
import InvestigationReportAccordion from "@/app/incident-management/incident-report/_partials/InvestigationReportAccordion";
import { SelectOptions } from "@/components/interfaces";
import UnitDetails from "./_partials/UnitDetails";
import { emptySelector } from "@/config/config";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";

const User = () => {
  const router = useRouter();
  const reportObjectIdRef = useRef<string | null>(null);
  const objectId = useSelector((state: RootState) => state.investigation.objectId);
  const pirId = useSelector((state: RootState) => state.pir.pirId);
  const dispatch = useDispatch();
  const [openSection, setOpenSection] = useState<number>(0);
  const [responsiblePersonId, setResponsiblePersonId] = useState<string>("");
  const [isSubmitCase, setSubmitCase] = useState<boolean>(false)
  const [unitData, setUnitData] = useState({ unitId: "" });
  const [departments, setDepartments] = useState<any>(null);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [currentStatus, setCurrentStatus] = useState<number>(0);
  const token = useSelector(selectUserToken);
  const { user } = useSelector((state: RootState) => state.auth as { user: any });

  const [pirData, setPirData] = useState<any>(null);
  const [pirProxyData, setPirProxyData] = useState<any>(null);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [costOfIncidentOptions, setCostOfIncidentOptions] = useState<SelectOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [injuredJobTypeOptions, setInjuredJobTypeOptions] = useState<SelectOptions[]>();
  const [injuryNatureOptions, setInjuryNatureOptions] = useState<SelectOptions[]>([]);
  const [bodyPartOptions, setBodyPartOptions] = useState<SelectOptions[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOptions[]>([]);
  const [prelimClassificOptions, setPrelimClassificOptions] = useState<SelectOptions[]>(emptySelector);
  const [reportData, setReportData] = useState(null);
  const [teamMembers, setTeamMembers] = useState(null);
  const [immedActions, setImmedActions] = useState(null);
  const [rootCausesData, setRootCausesData] = useState(null)

  const accordionTitles = [
    "Unit Details",
    "Incident Report"
  ];
  const createMasterPayload = () => ({
    objectId: pirData?.objectId || pirProxyData?.objectId || "",
    costInRupees: pirData?.costInRupees || pirProxyData?.costInRupees || "",
    costOfIncident: pirData?.costOfIncident || pirProxyData?.costOfIncident || "",
    costOfIncidentText: pirData?.costOfIncidentText || pirProxyData?.costOfIncidentText || "",
    lastDateOfIncident: pirData?.lastDateOfIncident || pirProxyData?.lastDateOfIncident || null,
    similarIncident: pirData?.similarIncident || pirProxyData?.similarIncident || "",
    incidentInitiatedDate: pirData?.incidentInitiatedDate || pirProxyData?.incidentInitiatedDate || null,
    incidentInitiatedTime: pirData?.incidentInitiatedTime || pirProxyData?.incidentInitiatedTime || null,
    briefDescription: pirData?.briefDescription || pirProxyData?.briefDescription || "",
    pirId: pirId || "",
    createdAt: pirData?.createdAt || pirProxyData?.createdAt || new Date().toISOString(),
    createdBy: pirData?.createdBy || pirProxyData?.createdBy || user?.createdBy,
    updatedAt: new Date().toISOString(),
    updatedBy: user?.updatedBy,
    unitId: pirData?.unitId || pirProxyData?.unitId || "",
    unitName: pirData?.unitName || pirProxyData?.unitName || "",
    departmentId: pirData?.departmentId || pirProxyData?.departmentId || "",
    departmentName: pirData?.departmentName || pirProxyData?.departmentName || "",
    sectionId: pirData?.sectionId || pirProxyData?.sectionId || "",
    sectionName: pirData?.sectionName || pirProxyData?.sectionName || "",
    injuryHappened: pirData?.injuryHappened || pirProxyData?.injuryHappened || "No",
    accordionIndex: pirData?.accordionIndex || pirProxyData?.accordionIndex || 0,
    injuries: pirData?.injuries || pirProxyData?.injuries || [],
    keyFindings: pirData?.keyFindings || pirProxyData?.keyFindings || [],
    chronologyOfEvents: pirData?.chronologyOfEvents || pirProxyData?.chronologyOfEvents || [],
    whyAnalyses: pirData?.whyAnalyses || pirProxyData?.whyAnalyses || [],
    recordsViewed: pirData?.recordsViewed || pirProxyData?.recordsViewed || [],
    personsInteracted: pirData?.personsInteracted || pirProxyData?.personsInteracted || [],
    immediateActions: pirData?.immediateActions || pirProxyData?.immediateActions || [],
    supportingEvidences: pirData?.supportingEvidences || pirProxyData?.supportingEvidences || [],
    irStatus: pirData?.irStatus || pirProxyData?.irStatus || "Draft",
    chronologyManualFile: pirData?.chronologyManualFile || pirProxyData?.chronologyManualFile || null,
    whyWhyManualFile: pirData?.whyWhyManualFile || pirProxyData?.whyWhyManualFile || null,
    irId: pirData?.irId || pirProxyData?.irId || null
  });

  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Skip the initial load and only save when pirData is updated by form submission
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    if (!isDraftReady) return;
    if (pirData && pirId && Object.keys(pirData).length > 0) {
      saveDraftReport();
    }
  }, [pirData, pirId, isSubmitCase]);

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
  
  useEffect(() => {
  const init = async () => {
    try {
      const draftResponse = await serverRequest(
        {},
        INVESTIGATION + `/get-draft-report/${pirId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );

      if (draftResponse) {

        // Lock objectId right away
        if (draftResponse.objectId && !reportObjectIdRef.current) {
          reportObjectIdRef.current = draftResponse.objectId;
          dispatch(setObjectId(draftResponse.objectId));
        }
        setPirProxyData((prev) => {return draftResponse?.objectId ? { ...prev, ...draftResponse, objectId: prev?.objectId || draftResponse.objectId } : { ...prev, objectId: prev?.objectId || draftResponse.objectId }});
        }

      // Then fetch everything else
      await fetchAllDataSequentially(pirId);
    } catch (err) {
      console.error("Error in init:", err);
    }
    finally {
      setIsDraftReady(true);
    }
  };

  init();
}, [pirId, token]);

  useEffect(() => {
    if (objectId && !reportObjectIdRef.current) {
      reportObjectIdRef.current = objectId;
      setPirData((prev: any) => ({
        ...(prev || {}),
        objectId: objectId,
      }));
    }
  }, [objectId]);

  const saveDraftReport = useCallback(async () => {
    if (!pirData || !pirId) return;
    const masterPayload = createMasterPayload();  
    const payload = {
        ...pirData,
        ...masterPayload,
        pirId: pirId,
        unitId: pirData.unitId || pirProxyData.unitId || "",
        departmentId: pirData.departmentId || pirProxyData.departmentId || "",
        sectionId: pirData.sectionId || pirProxyData.sectionId || "",
        costInRupees: pirData.costInRupees || pirProxyData.costInRupees || "",
        costOfIncident: pirData.costOfIncident || pirProxyData.costOfIncident || "",
        chronologyManualFile: pirData?.chronologyManualFile|| pirProxyData?.chronologyManualFile || null,
        whyWhyManualFile: pirData?.whyWhyManualFile || pirProxyData?.whyWhyManualFile || null,
        supportingEvidences: pirData.supportingEvidences?.map((evidence: any) => ({
          evidenceType: evidence.evidenceType || "",
          evidenceName: evidence.evidenceName || "",
          evidenceSize: evidence.evidenceSize || "",
          fileId: evidence.fileId || "",
          pirId: pirId,
          createdAt: evidence.createdAt || new Date().toISOString(),
          createdBy: evidence.createdBy || user?.createdBy || "",
          updatedAt: evidence.updatedAt || new Date().toISOString(),
          updatedBy: evidence.updatedBy || user?.updatedBy || "",
          evidenceDescription: evidence.evidenceDescription || "",
          evidenceThumbnail: evidence.evidenceThumbnail || ""
        })) || []
      };

      delete payload?.exactLocation
      delete payload?.incidentCategory
      delete payload?.interactedSection

      if (reportObjectIdRef.current) {
        payload.objectId = reportObjectIdRef.current;
      } else if (objectId) {
        payload.objectId = objectId;
      }

    try {
      setSavingDraft(true);
      const response = await serverRequest(
        payload,
        INVESTIGATION + `/save-investigation-report${isSubmitCase? '/publish': ''}`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.objectId && !reportObjectIdRef.current) {
          reportObjectIdRef.current = response.objectId;
          dispatch(setObjectId(response.objectId));
          setPirData((prev: any) => ({
            ...prev,
            objectId: response.objectId,
          }));
        toast.success("Draft added successfully");
      }

      if(response.irId){
        reportObjectIdRef.current = null;
        dispatch(clearObjectId());
        dispatch(setPirId(pirId))
        router.push(APP_URL.INCIDENT_DETAIL)
      }
  } catch (error) {
    console.error("Error saving draft:", error);
    toast.error("Error saving draft");
  } finally {
    setTimeout(() => {
      setSavingDraft(false);
    }, 1500);
  }
  }, [pirData, pirId, token, objectId]);

  const toggleSection = (index: number) => {
    if (index > currentStatus) return
    setOpenSection((prev) => (prev === index ? -1 : index));
  };

  const fetchAllDataSequentially = async (pirId: string) => {
  try {
    setLoading(true);

    const pirResponse = await serverRequest(
      {},
      SAVE_DRAFT_PIR + `/get-pir/${pirId}`,
      CONSTANTS.REQUEST_GET,
      true,
      true,
      token
    );
    
    if (!pirResponse.success) {
      throw new Error('Failed to fetch PIR data');
    }
    if(pirResponse.success) {
    const transformData = (response: any) => {
          const { pir, injuries, immediateActions, investigationTeamMembers } = response;

          setTeamMembers(investigationTeamMembers)
          setImmedActions(immediateActions)

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
              updatedAt: injury.createdAt,
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
          // const transformedImmediateActions = immediateActions.map(action => ({
          //   actiontaken: action.actiontaken,
          //   createdat: action.createdat,
          //   createdby: action.createdby,
          //   updatedat: action.createdat,
          //   updatedby: action.createdby,
          //   assignLinemanager: action.assignLinemanager,
          //   linemanagerName: action.linemanagerName,
          //   targetdate: action.targetdate,
          //   sections: action.sections,
          //   departments: action.departments || "",
          //   sectionhead: action.sectionhead,
          //   imSubmoduleName: action.imSubmoduleName,
          //   units: action.units,
          //   finding: "",
          //   siNo: action.siNo,
          //   status: action.status,
          //   responsibleDepartmentName: action.responsibleDepartmentName,
          //   responsibleSectionName: action.responsibleSectionName,
          //   findingFlag: 0
          // }));
          // Create the main object
          const transformedData = {
            objectId: pirData?.objectId || null,
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
            incidentClassification: pir.incidentClassification,
            incidentCategory: pir.incidentCategory,
            createdAt: pir.createdAt,
            createdBy: pir.createdBy,
            updatedAt: pir.updatedAt,
            updatedBy: user.updatedBy,
            injuryHappened: pir.injuryHappened,
            accordionIndex: pir?.accordionIndex || 0,
            injuries: transformedInjuries,
            immediateActions: []
          };

          if (response.objectId) {
            transformedData.objectId = response.objectId;
          }

          return transformedData;
        };

    const transformedPirData = transformData(pirResponse);
    setPirProxyData((prev) => ({...prev, ...transformedPirData}))}

    const safetyAlertResponse = await serverRequest(
      {},
      SAFETY_ALERT + `/get-safety-alert/${pirId}`,
      CONSTANTS.REQUEST_GET,
      true,
      true,
      token
    );
    
    if (safetyAlertResponse.success) {
      const { rootCauses } = safetyAlertResponse;
      setRootCausesData(rootCauses);

      setPirProxyData((prev) => ({
        ...prev,
        rootCauses: rootCauses,
      }));
    }

    const draftResponse = await serverRequest(
      {},
      INVESTIGATION + `/get-draft-report/${pirId}`,
      CONSTANTS.REQUEST_GET,
      true,
      true,
      token
    );
    
    if (draftResponse) {
      const safeDraftResponse = { ...draftResponse };
      const protectedArrays = [
        'injuries', 'immediateActions', 'keyFindings', 
        'chronologyOfEvents', 'whyAnalyses', 'recordsViewed', 
        'personsInteracted', 'supportingEvidences'
      ];
      protectedArrays.forEach(key => {
        if (safeDraftResponse[key] && Array.isArray(safeDraftResponse[key]) && safeDraftResponse[key].length === 0) {
          delete safeDraftResponse[key];
        }
      });

        setPirProxyData(prev => {
          const merged = { 
            ...prev,
            ...safeDraftResponse,
            ...pirProxyData,
            objectId: prev?.objectId || safeDraftResponse.objectId,
          };
          
        // Preserve the original immediateActions if they exist and draft has empty ones
          if (prev?.immediateActions && prev.immediateActions.length > 0 && 
              safeDraftResponse.immediateActions && safeDraftResponse.immediateActions.length === 0) {
            merged.immediateActions = prev.immediateActions;
          }
          if (safeDraftResponse.objectId && !reportObjectIdRef.current) {
            reportObjectIdRef.current = safeDraftResponse.objectId;
            dispatch(setObjectId(safeDraftResponse.objectId));
          }
          return merged;
        });
      }
      
    } catch (error) {
      console.error("Error fetching sequential data:", error);
      toast.error("Error loading investigation data");
    } finally {
      setLoading(false);
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
          const options = response.map((dept: any) => ({ value: dept?.departmentid, label: dept?.departmentname }));
          setDepartmentOptions(options);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

     useEffect(() => {
          if (pirData?.unitId) {
            fetchDepartments(pirData.unitId);
          }
      }, [pirData?.unitId]);

  useEffect(() => {
    fetchRiskPotential();
    fetchCostOfIncident();
    fetchPreliminaryClassification();
    return () => {
      dispatch(setPirId(pirId))
    }
  }, []);

  return (
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
          Incident Investigation Report
          </Link>
        </div>
      </div>
     
      <div className="admin-boxContainer d1 nobackground">
        {(pirData || pirProxyData ) ? (
          <>
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
                      <UnitDetails
                          unitData={unitData}
                          reportData={reportData}
                          setUnitData={setUnitData}
                          currentStatus={currentStatus}
                          setCurrentStatus={setCurrentStatus}
                          costOfIncidentOptions={costOfIncidentOptions}
                          setOpenSection={setOpenSection}
                          unitOptions={unitOptions}
                          prelimClassificOptions={prelimClassificOptions}
                          departmentOptions={departmentOptions}
                          departments={departments}
                          pirData={pirProxyData || pirData}
                          setPirData={setPirData}
                      />
                      )}
                      {index === 1 && (
                      <InvestigationReportAccordion
                          pirData={pirProxyData || pirData }
                          teamMembers={teamMembers}
                          immedActions={immedActions}
                          rootCausesData={rootCausesData}
                          isSubmitCase={savingDraft}
                          setSubmitCase={setSubmitCase}
                          setPirData={setPirData}
                          reportData={reportData} 
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
                          supportingEvidences={pirProxyData?.supportingEvidences || pirData?.supportingEvidences || []}
                          />
                          )}
                    </>)}
        </div>)})}
      </>
        ) : (
          <div className="text-center py-5">No investigation data found</div>
        )}
      </div>
      <ToastContainer/>
    </div>
  );
};

export default ProtectedRoute(User);