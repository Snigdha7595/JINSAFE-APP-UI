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
import InvestigationReportAccordion from "@/app/incident-management/incident-report/update/_partials/InvestigationReportAccordion";
import { SelectOptions } from "@/components/interfaces";
import UnitDetails from "./_partials/UnitDetails";
import { emptySelector } from "@/config/config";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/Layouts/CustomModal";
import InputField from "@/components/Form/InputField";

const User = () => {
  const router = useRouter();
  const reportObjectIdRef = useRef<string | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const objectId = useSelector((state: RootState) => state.investigation.objectId);
  const pirId = useSelector((state: RootState) => state.pir.pirId);
  const dispatch = useDispatch();
  const [openSection, setOpenSection] = useState<number>(0);
  const [incidentList, setIncidentList] = useState<any>([]);
  const [responsiblePersonId, setResponsiblePersonId] = useState<string>("");
  // const [submitCase, setSubmitCase] = useState<boolean>(false)
  // const [revertCase, setRevertCase] = useState<boolean>(false)
  const [irAction, setIrAction] = useState<string | null>(null);
  const [irRevertRemark, setIrRevertRemark] = useState<string>("")
  const [unitData, setUnitData] = useState({ unitId: "" });
  const [departments, setDepartments] = useState<any>(null);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [currentStatus, setCurrentStatus] = useState<number>(0);
  const token = useSelector(selectUserToken);
  const { user } = useSelector((state: RootState) => state.auth as { user: any });

  const [pirData, setPirData] = useState<any>(null);
  const [apiInProgress, setApiInProgress] = useState(false);
  const [pirProxyData, setPirProxyData] = useState<any>(null);
  const [costOfIncidentOptions, setCostOfIncidentOptions] = useState<SelectOptions[]>([]);
  const [injuredJobTypeOptions, setInjuredJobTypeOptions] = useState<SelectOptions[]>();
  const [injuryNatureOptions, setInjuryNatureOptions] = useState<SelectOptions[]>([]);
  const [bodyPartOptions, setBodyPartOptions] = useState<SelectOptions[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOptions[]>([]);
  const [prelimClassificOptions, setPrelimClassificOptions] = useState<SelectOptions[]>(emptySelector);
  const [reportData, setReportData] = useState(null);
  const [teamMembers, setTeamMembers] = useState(null);
  const [immedActions, setImmedActions] = useState(null);
  const [rootCausesData, setRootCausesData] = useState(null)
  const [isSavingForRevert, setIsSavingForRevert] = useState<boolean>(false);
  const [openRevertConfirmation, setOpenRevertConfirmation] = useState<boolean>(false);
  const [isProcessingRevert, setIsProcessingRevert] = useState<boolean>(false);

  const accordionTitles = [
    "Unit Details",
    "Incident Report"
  ];
  // const createMasterPayload =  async () => {
  //   console.log("pirData in creat master payload", pirData)
  //   return({
  //   objectId: "",
  //   costInRupees: pirData?.ir?.costInRupees,
  //   costOfIncident: pirData?.ir?.costOfIncident,
  //   costOfIncidentText: pirData?.ir?.costOfIncidentText,
  //   lastDateOfIncident: pirData?.ir?.lastDateOfIncident,
  //   similarIncident: pirData?.ir?.similarIncident,
  //   incidentInitiatedDate: pirData?.ir?.incidentInitiatedDate,
  //   incidentInitiatedTime: pirData?.ir?.incidentInitiatedTime,
  //   briefDescription: pirData?.ir?.briefDescription,
  //   pirId: pirId || "",
  //   createdAt: pirData?.createdAt,
  //   createdBy: pirData?.createdBy,
  //   updatedAt: new Date().toISOString(),
  //   updatedBy: user?.ir?.updatedBy,
  //   unitId: pirData?.ir?.unitId,
  //   unitName: pirData?.pir?.unitName || "",
  //   departmentId: pirData?.ir?.departmentId || "",
  //   departmentName: pirData?.pir?.departmentName || "",
  //   sectionId: pirData?.ir?.sectionId || "",
  //   sectionName: pirData?.pir?.sectionName || "",
  //   injuryHappened: pirData?.pir?.injuryHappened || "No",
  //   accordionIndex: pirData?.accordionIndex || 0,
  //   injuries: pirData?.injuries || [],
  //   keyFindings: pirData?.keyFindings || [],
  //   chronologyOfEvents: pirData?.chronologyOfEvents || [],
  //   whyAnalyses: pirData?.whyAnalyses || [],
  //   recordsViewed: pirData?.recordsViewed || [],
  //   personsInteracted: pirData?.personsInteracted || [],
  //   immediateActions: pirData?.immediateActions || [],
  //   supportingEvidences: pirData?.supportingEvidences || [],
  //   irStatus: pirData?.irStatus || "Draft",
  //   chronologyManualFile: pirData?.ir?.chronologyManualFile,
  //   whyWhyManualFile: pirData?.ir?.whyWhyManualFile,
  //   irId: pirData?.ir?.irId
  // })};

  useEffect(() => {
  if (pirData && pirId && Object.keys(pirData).length > 0 && irAction) {
    const callApi = async () => {
      try {
        await publishReport(irAction);
      } catch (error) {
        console.error("Error in publish/revert:", error);
        toast.error(`Error in ${irAction} operation`);
      }
    };

    callApi();
  }

  return () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };
}, [pirData]);

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
    fetchReportData(pirId)
  }, [pirId]);

  const handleRevertClick = async () => {
    setOpenRevertConfirmation(true);
  };

  const handleConfirmRevert = async () => {
    if (!irRevertRemark?.trim()) {
      toast.error("Please enter a revert remark");
      return;
    }

    if (!pirData || !pirId) {
      toast.error("No investigation data found");
      return;
    }

    setIsProcessingRevert(true);
    try {
      const payload = { ...pirData };

      delete payload?.exactLocation;
      delete payload?.incidentCategory;
      delete payload?.interactedSection;

      payload.irRevertRemark = irRevertRemark.trim();

      const response = await serverRequest(
        payload,
        INVESTIGATION + `/save-investigation-report/revert`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.irId || response?.success) {
        toast.success("Investigation report reverted successfully");        
        setIrRevertRemark("");
        setOpenRevertConfirmation(false);

        dispatch(clearObjectId());
        dispatch(setPirId(pirId));
        router.push(APP_URL.INCIDENT_DETAIL);
      } else {
        throw new Error("Failed to revert investigation report");
      }
    } catch (error) {
      console.error("Error reverting investigation report:", error);
      toast.error("Error reverting investigation report");
    } finally {
      setIsProcessingRevert(false);
    }
  };

  const publishReport = async (irAction) => {
  if (apiInProgress) return;
  setApiInProgress(true);
  
  if (!pirData || !pirId || !irAction) {
    setApiInProgress(false);
    return;
  }

  const payload = { ...pirData };
  
  delete payload?.exactLocation;
  delete payload?.incidentCategory;
  delete payload?.interactedSection;

  if (irAction === "REVERT" && irRevertRemark) {
    payload.irRevertRemark = irRevertRemark
  }

  try {
    let endpoint = '';
    if (irAction === "PUBLISH") {
      endpoint = '/publish';
    } else if (irAction === 'REVERT') {
      endpoint = '/revert';
    } else {
      setApiInProgress(false);
      return;
    }

    const response = await serverRequest(
      payload,
      INVESTIGATION + `/save-investigation-report${endpoint}`,
      CONSTANTS.REQUEST_POST,
      true,
      true,
      token
    );

    if (response?.irId || response?.success) {
      setIrAction(null);
      setIrRevertRemark("");

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
      
      dispatch(clearObjectId());
      dispatch(setPirId(pirId));

      router.push(APP_URL.INCIDENT_DETAIL);
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    toast.error(`Error during ${irAction}`);
    setIrAction(null);
    setIrRevertRemark("");
  } finally {
    resetTimerRef.current = setTimeout(() => {
      setApiInProgress(false);
      setIrAction(null);
      setIrRevertRemark("");
    }, 2000);
  }
};

  const transformIRDataToFormData = (apiResponse: any) => {
    if (!apiResponse || !apiResponse.success) return null;
    
    // Extract data from API response
    const { pir, ir, injuries, keyFindings, chronologyEvents, recordsViewed, personsInteracted, immediateActions, whyAnalyses, supportingEvidences, rootCauses, teamMembers, pirJourneys } = apiResponse;
    setIncidentList(pirJourneys)

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
        injuryId: injury.injuryId,
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
          id: part.id,
          bodyPart: part.bodyPart || "",
          employeeId: part.employeeId || "",
          pirId: part.pirId || "",
          natureOfInjury: part.natureOfInjury || "",
          flagInjuryId: part.flagInjuryId || 0,
          rowIndex: part.rowIndex || 0
        })) || []
      })) || [],
      
      keyFindings: keyFindings?.map((finding: any) => ({
        keyId: finding.keyId,
        keyFinding: finding.keyFinding || "",
        pirId: finding.pirId || ""
      })) || [],
      
      recordsViewed: recordsViewed?.map((record: any) => ({
        recordId: record.recordId,
        recordViewed: record.recordViewed || "",
        pirId: record.pirId || ""
      })) || [],
      
      personsInteracted: personsInteracted?.map((person: any) => ({
        personId: person.personId,
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
        chronologyId: event.chronologyId,
        chronologyDate: event.chronologyDate || "",
        chronologyTime: event.chronologyTime || "",
        chronologyActivity: event.chronologyActivity || "",
        chronologyRemark: event.chronologyRemark || "",
        pirId: event.pirId || ""
      })) || [],
      
      immediateActions: immediateActions,
      whyAnalyses: whyAnalyses,
      supportingEvidences: supportingEvidences,
      
      // Other fields with defaults
      objectId: "",
      accordionIndex: 0,
      createdAt: ir?.createdAt || new Date().toISOString(),
      createdBy: ir?.createdBy || "",
      updatedAt: ir?.updatedAt || new Date().toISOString(),
      updatedBy: ir?.updatedBy || "",
      chronologyManualFile: null,
      whyWhyManualFile: ir?.whyWhyManualFile || null,
      teamMembers: teamMembers || []
    };

    setImmedActions(immediateActions);
    // setRootCausesData(rootCauses);
    setTeamMembers(teamMembers);
    
    return formData;
  };

  const toggleSection = (index: number) => {
    if (index > currentStatus) return
    setOpenSection((prev) => (prev === index ? -1 : index));
  };

  const fetchReportData = async (pirId: string) => {
     try {
    const irResponse = await serverRequest(
      {},
      INVESTIGATION + `/get-investigation-report/${pirId}`,
      CONSTANTS.REQUEST_GET,
      true,
      true,
      token
    );
    setPirData(transformIRDataToFormData(irResponse))
      
    } catch (error) {
      console.error("Error fetching sequential data:", error);
      toast.error("Error loading investigation data");
    }
  }
  
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

  const revertButtonVisible = !incidentList?.some((incident: any) => 
      incident?.subSection === "Incident Report" && incident?.nextAction.toUpperCase() === "RESUBMIT"
  );

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
          Incident Investigation Report
          </Link>
          {revertButtonVisible && (
          <div className="d-flex justify-content-end mt-3">
            <button
              className="iconBtn orange v2"
              type="button"
              disabled={isSavingForRevert || apiInProgress}
              onClick={handleRevertClick}
            >
              <span>{isSavingForRevert ? "Saving..." : "Revert"}</span>
            </button>
          </div>
        )}
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
                        setIrAction={setIrAction}
                      />
                      )}
                      {index === 1 && (
                      <InvestigationReportAccordion
                        pirData={pirProxyData || pirData }
                        teamMembers={teamMembers}
                        immedActions={immedActions}
                        rootCausesData={rootCausesData}
                        irAction={irAction}
                        setIrAction={setIrAction}
                        apiInProgress={apiInProgress}
                        setPirData={setPirData}
                        reportData={reportData} 
                        injuredJobTypeOptions={injuredJobTypeOptions} 
                        injuryNatureOptions={injuryNatureOptions}
                        bodyPartOptions={bodyPartOptions}
                        departmentOptions={departmentOptions}
                        setDepartmentOptions={setDepartmentOptions}
                        injuryData={undefined} 
                        revertButtonVisible={revertButtonVisible}
                        irRevertRemark={irRevertRemark}
                        setIrRevertRemark={setIrRevertRemark}
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
    <CustomModal
        isOpen={openRevertConfirmation}
        onClose={() => {
          if (!isProcessingRevert) {
            setOpenRevertConfirmation(false);
            setIrRevertRemark("");
          }
        }}
        bodyClassName="isScrollable"
        title="Confirm Revert Investigation Report"
      >
        <div className="filters">
          <div className="row form_grider d1">
            <h2>Are you sure you want to revert this Investigation report?</h2>
            <div className="py-2">
              <InputField 
                type="text"
                label="Revert remark *"
                maxLength={300}
                value={irRevertRemark}
                name="irRevertRemark"
                placeholder="Reverted due to..."
                onChange={(e) => {
                  setIrRevertRemark(e.target.value);
                }}
                disabled={isProcessingRevert}
              />
            </div>
            <div className="col-12">
              <div className="btnWrapper">
                <button
                  className="iconBtn orange v2"
                  onClick={() => {
                    setOpenRevertConfirmation(false);
                    setIrRevertRemark("");
                  }}
                  type="button"
                  disabled={isProcessingRevert}
                >
                  <span>Cancel</span>
                </button>
                <button
                  className="iconBtn green v2"
                  disabled={!irRevertRemark?.trim() || isProcessingRevert}
                  style={{ 
                    cursor: irRevertRemark?.trim() && !isProcessingRevert ? "pointer" : "not-allowed",
                    opacity: isProcessingRevert ? 0.7 : 1
                  }}
                  onClick={handleConfirmRevert}
                  type="button"
                >
                  <span>
                    {isProcessingRevert ? "Processing..." : "Confirm Revert"}
                    {!isProcessingRevert && (
                      <Image
                        width="15"
                        height="15"
                        alt="submit button"
                        src="/images/svg/plane_icon_45deg.svg"
                        className="img-fluid u-image ms-1"
                      />
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default ProtectedRoute(User);