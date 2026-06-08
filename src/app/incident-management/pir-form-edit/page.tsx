"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import Link from "next/link";
// import SafetyAlertAccordion from "@/components/Form/SafetyAlertAccordion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useState, useRef } from "react";
import { serverRequest } from "@/services/getServerSideRender";
import {
  FETCH_DEPARTMENTS,
  FETCH_RISK_POTENTIAL,
  GET_ALL_BODY_PARTS,
  GET_NATURE_OF_INJURIES,
  GET_PRELIMINARY_CLASSIFICATION,
  // SAFETY_ALERT,
  SAVE_DRAFT_PIR,
  DELETE_FILE,
} from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import { emptySelector } from "@/config/config";
import UnitDetailsEdit from "./_partials/UnitDetailsEdit";
import IncidentDetailsEdit from "./_partials/IncidentDetailsEdit";
import ImmediateEdit from "./_partials/ImmediateEdit";
import PreliminaryClassificationEdit from "./_partials/PreliminaryClassificationEdit";
import DetailsOfInjuryEdit from "./_partials/DetailsOfInjuryEdit";
import { SelectOptions } from "@/components/interfaces";
import { setPirId } from "@/store/slices/pirSlice";
import { useRouter } from "next/navigation";
// import Button from "@/components/Elements/Button";
import CustomModal from "@/components/Layouts/CustomModal";
import { ToastContainer, toast } from "react-toastify";
// import { useDispatch as useDispatchHook } from "react-redux";

// const masterPayloadSchema = {
//   id: null,
//   pirId: null,
//   unitId: "",
//   unitName: "",
//   departmentId: "",
//   departmentName: "",
//   sectionId: "",
//   sectionName: "",
//   exactLocation: "",
//   incidentDate: "",
//   incidentTime: "",
//   lineManager: "",
//   sectionHead: "",
//   departmentHod: "",
//   incidentClassification: "",
//   incidentCategory: "",
//   personInjured: "",
//   tier: null,
//   remark: "",
//   status: "",
//   processSteps: "",
//   createdAt: "",
//   createdBy: "",
//   updatedAt: "",
//   updatedBy: "",
//   designationId: "",
//   designationName: "",
//   createdByUserRole: "",
//   injuryHappened: "",
//   whatHappened: "",
//   preliminaryFindings: "",
//   hipoCase: "",
//   accordionIndex: 0,
//   images: [],
//   injuries: [],
//   immediateActions: [],
// };

const PirEdit = () => {
  const pirId = useSelector((state: RootState) => state.pir.pirId);
  // console.log("PIR ID-", pirId);
  const safetyId = useSelector((state: RootState) => state.pir.safetyId);
  const escapeUpdateClicksRef = useRef<any>(null);
  const { user } = useSelector((state: RootState) => state.auth as { user: any });
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector(selectUserToken);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasImmediateChanges, setHasImmediateChanges] = useState<boolean>(false);
  const [actionsPendingDelete, setActionsPendingDelete] = useState<number[]>([]);
  const [pirData, setPirData] = useState<any>(null);
  // const [publishButtonVisible, setPublishButtonVisible] = useState<boolean>(false);
  const [incidentData, setIncidentData] = useState(null);
  const [preliminaryData, setPreliminaryData] = useState(null);
  const [injuryData, setInjuryData] = useState(null);
  const [immediateData, setImmediateData] = useState(null);
  const [prelimClassificOptions, setPrelimClassificOptions] = useState<SelectOptions[]>(emptySelector);
  const [twoStepProcess, setTwoStepProcess] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<number>(0);
  const [openSection, setOpenSection] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [unitData, setUnitData] = useState({ unitId: "" });
  const [departments, setDepartments] = useState<any>(null);
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [isPirDataInitialized, setIsPirDataInitialized] = useState(false);
  const [injuredJobTypeOptions, setInjuredJobTypeOptions] = useState<{ label: string; value: string; } | null>(null);
  const [injuryNatureOptions, setInjuryNatureOptions] = useState<SelectOptions[] | null>(null);
  const [bodyPartOptions, setBodyPartOptions] = useState<{ label: string; value: string;} | null>(null);
  // const [injuryData, setInjuryData] = useState(null);

  // New modal state for confirmation when injuryHappened === "No"
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  // const [pendingFinalUpdate, setPendingFinalUpdate] = useState(false); // indicates user confirmed and we should proceed

  const accordionTitles = [
    "Unit Details",
    "Preliminary Classification",
    "Incident Details",
    "Details of Injury",
    "Immediate Actions"
  ];

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
      if (response?.length > 0) {
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
      if (response?.length > 0) {
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
      if (response?.length > 0) {
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
    //   if (response.success) {
    //     let transformedData = {
    //       id: response.pir.id,
    //       pirId: response.pir.pirId,
    //       unitId: response.pir.unitId,
    //       unitName: response.pir.unitName,
    //       departmentId: response.pir.departmentId,
    //       departmentName: response.pir.departmentName,
    //       sectionId: response.pir.sectionId,
    //       sectionName: response.pir.sectionName,
    //       exactLocation: response.pir.exactLocation,
    //       incidentDate: response.pir.incidentDate,
    //       incidentTime: response.pir.incidentTime,
    //       personInjured: response.pir.personInjured,
    //       lineManager: response.pir.lineManager,
    //       sectionHead: response.pir.sectionHead,
    //       departmentHod: response.pir.departmentHod,
    //       incidentClassification: response.pir.incidentClassification,
    //       incidentCategory: response.pir.incidentCategory,
    //       whatHappened: response?.pir?.whatHappened,
    //       processSteps: response.pir.processSteps,
    //       tier: response.pir.tier,
    //       preliminaryFindings: response?.pir?.preliminaryFindings,
    //       remark: response.pir.remark,
    //       status: response.pir.status,
    //       designationId: response.pir.designationId,
    //       designationName: response.pir.designationName,
    //       createdByUserRole: response.pir.createdByUserRole,
    //       pendingAction: response.pir.pendingAction,
    //       rowIndex: response.pir.rowIndex,
    //       pirTimeLimit: response.pir.pirTimeLimit,
    //       injuryHappened: response.pir.injuryHappened,
    //       hipoCase: response.pir.hipoCase,
    //       createdBy: response.pir.createdBy,
    //       createdAt: response.pir.createdAt,
    //       updatedAt: response.pir.updatedAt,
    //       updatedBy: response.pir.updatedBy,

    //       images: response.images.map((img: any) => ({
    //         imageId: img.imageId,
    //         pirId: img.pirId,
    //         mongoId: img.mongoId,
    //         fileType: img.fileType,
    //         fileName: img.fileName,
    //         fileSize: img.fileSize,
    //         fileThumbnail: img.fileThumbnail,
    //         rowIndex: img.rowIndex,
    //         createdAt: img.createdAt,
    //         createdBy: img.createdBy
    //       })),
    //       injuries: response.injuries.map((injury: any) => ({
    //         pirId: injury.pirId,
    //         injuryId: injury.injuryId,
    //         employeeType: injury.employeeType,
    //         employeeId: injury.employeeId,
    //         injuredName: injury.injuredName,
    //         gender: injury.gender,
    //         address: injury.address,
    //         designation: injury.designation,
    //         jobType: injury.jobType,
    //         nameOfEmployer: injury.nameOfEmployer,
    //         flagInjuryId: injury.flagInjuryId,
    //         bodyParts: injury.bodyParts,
    //         natureOfInjuries: injury.natureOfInjuries,
    //         rowIndex: injury.rowIndex,
    //         createdAt: injury.createdAt,
    //         createdBy: injury.createdBy,
    //         bodyPartList: injury.bodyPartList.map((bp: any) => ({
    //           id: bp.id,
    //           bodyPart: bp.bodyPart,
    //           pirId: bp.pirid,
    //           employeeId: bp.employeeId,
    //           createdAt: bp.createdAt,
    //           createdBy: bp.createdBy,
    //           natureOfInjury: bp.natureOfInjury,
    //           flagInjuryId: bp.flagInjuryId,
    //           rowIndex: bp.rowIndex
    //         }))
    //       })),
    //       immediateActions: response.immediateActions.map((action: any) => ({
    //         siNo: action.siNo,
    //         actionId: action.actionId,
    //         actiontaken: action.actiontaken,
    //         createdat: action.createdat,
    //         createdby: action.createdby,
    //         assignLinemanager: action.assignLinemanager,
    //         linemanagerName: action.linemanagerName,
    //         targetdate: action.targetdate,
    //         sections: action.sections,
    //         departments: action.departments,
    //         sectionhead: action.sectionhead,
    //         imSubmoduleName: action.imSubmoduleName,
    //         units: action.units,
    //         status: action.status,
    //         responsibleDepartmentName: action.responsibleDepartmentName,
    //         responsibleSectionName: action.responsibleSectionName,
    //         findingFlag: action.findingFlag,
    //         cfsaVerifyStatus: action.cfsaVerifyStatus,
    //         rowIndex: action.rowIndex
    //       }))
    //     };
    //     setPirData(transformedData);
    //   }
    // }
    if (response?.success) {
        const transformed = {
          ...response.pir,
          images: response.images || [],
          injuries: response.injuries || [],
          immediateActions: response.immediateActions || []
        };
        setPirData(transformed);
        // const accordionIndex = response.pir?.accordionIndex || 0;
        // setCurrentStatus(accordionIndex);
        // setOpenSection(accordionIndex);
      }
    }
     catch (error) {
      console.error("Error fetching PIR:", error);
    }
  };

  useEffect(() =>{
    if (pirId) {
      fetchPirData(pirId)
    }
    if (!pirId) {
      router.push(APP_URL.INCIDENT_MANAGEMENT);
    }
    fetchRiskPotential();
    fetchPreliminaryClassification();
    fetchBodyPartsDetail();
    fetchNatureOfInjuries();
    return () => {
      clearTimeout(escapeUpdateClicksRef.current);
      dispatch(setPirId(pirId))
    }
  }, [])

  // useEffect(() => {
  //   if(((openSection == 5) && twoStepProcess) || (!twoStepProcess && (openSection == 3))){
  //     setPublishButtonVisible(true)
  //   } else {
  //     setPublishButtonVisible(false)
  //   }
  // }, [openSection, twoStepProcess])

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
      if (response?.length > 0) {
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

  useEffect(() => {
    if (pirData?.unitId) {
      fetchDepartments(pirData.unitId);
    }
  }, [pirData?.unitId]);

  useEffect(() => {
    if (pirData?.pirId && !isPirDataInitialized) {
      setIsPirDataInitialized(true);
  //     setUnitOptions([
  //       { label: pirData?.unitName || "", value: pirData?.unitId || "" },
  //     ]);
  //     setUnitData({ unitId: pirData?.unitId });
  //     setTwoStepProcess(pirData?.processSteps == "Two"? true : false)
  //     setPirData((prev) => ({
  //       ...prev,
  //       unitId: pirData?.unitId,
  //       unitName: pirData?.unitName,
  //       designationId: pirData?.designationId,
  //       createdBy: pirData?.createdBy,
  //       updatedBy: pirData?.updatedBy,
  //       designationName: pirData?.designationName,
  //       createdByUserRole: user.role.includes("HOD")? "HOD": "Employee",
  //     }));

  //     if (pirData?.unitId) {
  //       fetchDepartments(pirData?.unitId);
  //     }
  //   }
  // }, [pirData, isPirDataInitialized]);

  // useEffect(() => {
  //   if (pirData && !isInitialized) {
      setUnitOptions([{ label: pirData.unitName, value: pirData.unitId }]);
      setUnitData({ unitId: pirData.unitId });
    }
  }, [pirData]); // isInitialized

  const toggleSection = (index: number) => {
    if (index > currentStatus) return; // block if index > currentStatus

    setOpenSection((prev) => (prev === index ? -1 : index));
  };

  // -------------------------
  // CENTRALIZED FINAL UPDATE
  // -------------------------
  // Called when user confirms Update PIR
  const performFinalUpdate = async () => {
    if (!pirData?.pirId) {
      toast.error("PIR id missing");
      return;
    }
    setIsPublishing(true);

    try {
      // If injuryHappened === "No", remove injuries (server-side)
      // if (pirData?.injuryHappened === "No" && Array.isArray(pirData.injuries) && pirData.injuries.length > 0) {
      //   // call delete API for each server-side injury that has an ID
      //   for (const inj of pirData.injuries) {
      //     const injuryId = inj.injuryId || inj.rowIndex || null;
      //     if (injuryId) {
      //       // Use the remove-pir-injury endpoint pattern used elsewhere
      //       try {
      //         await serverRequest(
      //           {},
      //           SAVE_DRAFT_PIR + `/remove-pir-injury/${pirData.pirId}/${injuryId}`,
      //           CONSTANTS.REQUEST_DELETE,
      //           true,
      //           true,
      //           token
      //         );
      //       } catch (err) {
      //         console.warn("Failed to delete injury", injuryId, err);
      //       }
      //     }
      //   }
      // }

      // If there are images with fileThumbnail strings that need deletion, call DELETE_FILE
      // We'll collect any image mongoId/fileThumbnail that look like server images but are not present in final payload.
      // For simplicity: if pirData._imagesToDelete exists (see note), call DELETE_FILE with that list.
      
      // if (pirData._imagesToDelete && Array.isArray(pirData._imagesToDelete) && pirData._imagesToDelete.length > 0) {
      //   try {
      //     await serverRequest(
      //       pirData._imagesToDelete,
      //       DELETE_FILE,
      //       CONSTANTS.REQUEST_DELETE,
      //       true,
      //       true,
      //       token
      //     );
      //   } catch (err) {
      //     console.warn("Failed to delete images", err);
      //   }
      // }

      for (const actionId of actionsPendingDelete || []) {
        try {
          await serverRequest(
            {},
            SAVE_DRAFT_PIR + `/remove-pir-action/${pirData.pirId}/${actionId}`,
            CONSTANTS.REQUEST_DELETE,
            true,
            true,
            token
          );
        } catch (err) {
          console.warn("Failed to delete immediate action", actionId, err);
        }
      }

      // TODO: immediateActions deletions if required
      // If you have an endpoint to remove immediate actions, call it here for each server-side id.
      // Example (if endpoint exists):
      // await serverRequest({}, SAVE_DRAFT_PIR + `/remove-pir-action/${pirData.pirId}/${actionId}`, CONSTANTS.REQUEST_DELETE, true, true, token);

      // Prepare final payload. Ensure new entries follow backend contract (injuryId: 0 or null for new).
      const finalPayload = { ...pirData, updatedBy: user?.createdBy };

      // Send one single consolidated update request
      const response = await serverRequest(
        finalPayload,
        SAVE_DRAFT_PIR + `/update-pir/${pirData.pirId}`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );

      if (response?.success) {
        toast.success(response?.message || "PIR Updated Successfully");
      } else {
        toast.error(response?.message || "Failed to update PIR");
      }
    } catch (error) {
      console.error("Error during final PIR update:", error);
      toast.error("Something went wrong while updating PIR");
    } finally {
      dispatch(setPirId(pirId));
      escapeUpdateClicksRef.current = setTimeout(() => {
        setIsPublishing(false);
      }, 1500)
      router.push( APP_URL.INCIDENT_DETAIL);
    }
  };

  // Handler when user clicks final Update button (may open confirmation modal)
  const handleUpdateClick = () => {
    if (pirData?.injuryHappened === "No" && Array.isArray(pirData.injuries) && pirData.injuries.length > 0) {
      setConfirmModalOpen(true);
      return;
    }
    performFinalUpdate();
  };

  return (
    <>
      <div className="container-fluid">
        <div className="admin-boxContainer d3">
          <div className="adminAction">
            <Link href={APP_URL.SAFETY_ALERT} className="adminAction__title">
              <span className="icon">
                <Image
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage Safety Alert
            </Link>
          </div>
        </div>
        <div className="admin-boxContainer d1 nobackground">
          {accordionTitles.map((title, index) => {
            // if (title === "Details of Injury" && pirData?.injuryHappened === "No")
            //   return null;
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
              <div className="c-accordion__body">
                {index === 0 && (
                  <UnitDetailsEdit
                    unitData={unitData}
                    setUnitData={setUnitData}
                    unitOptions={unitOptions}
                    departmentOptions={departmentOptions}
                    departments={departments}
                    pirData={pirData}
                    setPirData={setPirData}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                  />
                )}
                {index === 1 && (
                  <PreliminaryClassificationEdit
                    preliminaryData={preliminaryData}
                    prelimClassificOptions={prelimClassificOptions}
                    setPreliminaryData={setPreliminaryData}
                    pirData={pirData}
                    setPirData={setPirData}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                  />
                )}
                {index === 2 && (
                  <IncidentDetailsEdit
                    incidentData={incidentData}
                    setIncidentData={setIncidentData}
                    pirData={pirData}
                    setPirData={setPirData}
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                  />
                )}
                {index === 3 && (
                  <DetailsOfInjuryEdit
                    pirData={pirData}
                    setPirData={setPirData}
                    noInjuredPersons={pirData?.injuryHappened === "No"}
                    injuredJobTypeOptions={Array.isArray(injuredJobTypeOptions) ? injuredJobTypeOptions : [injuredJobTypeOptions]}
                    injuryData={injuryData}
                    setInjuryData={setInjuryData}
                    bodyPartOptions={Array.isArray(bodyPartOptions) ? bodyPartOptions : [bodyPartOptions]}
                    injuryNatureOptions={injuryNatureOptions}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                  />
                )}
                {index === 4 && (
                  <ImmediateEdit
                    pirData={pirData}
                    setPirData={setPirData}
                    immediateData={immediateData}
                    setImmediateData={setImmediateData}
                    departmentOptions={departmentOptions}
                    setImmediatePendingDeletes={(arr: (string | number)[]) =>
                      // convert incoming string|number[] to number[] expected by local state
                      setActionsPendingDelete(arr.map((a) => Number(a)))
                    }
                    currentStatus={currentStatus}
                    setCurrentStatus={setCurrentStatus}
                    setOpenSection={setOpenSection}
                    setHasUnsavedChanges={setHasImmediateChanges}
                  />
                )}
              </div>)}
            </div>
          )})}
        </div>
      </div>

      {/* Update button (visible under same condition as your publishButtonVisible) */}
      {/* {publishButtonVisible && ()} */}
        <div className="fixed-bottom-actions" style={{ padding: 12, display: "flex", justifyContent: "end" }} title={hasImmediateChanges ? "Immediate actions changes need to be saved before updating the PIR" : ""}>
          <div className="row">
            <div className="col-12">
              <button
                className="btn btn-primary"
                disabled={hasImmediateChanges || isPublishing}
                onClick={() => handleUpdateClick()}
              >
                {isPublishing ? "Updating..." : "Update PIR"}
              </button>
            </div>
          </div>
        </div>
      
      {/* Confirm modal for injuryHappened === "No" */}
      <CustomModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm remove injured persons"
      >
        <div>
          <p>
            Injury is marked as <strong>No</strong>. So, you must remove all existing injured persons.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={() => setConfirmModalOpen(false)}>Close</button>
          </div>
        </div>
      </CustomModal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default ProtectedRoute(PirEdit);