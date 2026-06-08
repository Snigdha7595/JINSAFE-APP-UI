"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import CustomModal from "@/components/Layouts/CustomModal";
import { useEffect, useRef, useState } from "react";
import InputField from "@/components/Form/InputField";
import ContractorDetail from "./_partials/ContractorDetail";
import CoAuditors from "./_partials/CoAuditors";
import Observations from "./_partials/Observations";
import { emptySelector } from "@/config/config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { serverRequest } from "@/services/getServerSideRender";
import { SelectOptions } from "@/components/interfaces";
import {
  FETCH_UNITS,
  FETCH_CSFA,
  BUCKET_URL,
  DOWNLOAD_FILE
} from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import { clearObjectId, setObjectId } from "@/store/slices/csmSlice";

interface UserData {
  aud: string;
  cfsaTrainedStatus: "YES" | "NO";
  companyName: string;
  createdBy: string;
  departmentDisplay: string;
  departmentHod: string;
  designationDisplay: string;
  email: string;
  empActiveStatus: "TRUE" | "FALSE";
  empArea: string;
  empDepartment: string;
  empDesignation: string;
  empEmail: string;
  empId: string;
  empMobile: string;
  empName: string;
  empSection: string;
  empUnit: string;
  unitId: string;
  exp: number;
  higher_role: string;
  iat: number;
  imTrainedStatus: "Yes" | "No";
  iss: string;
  jsplid: string;
  loginType: string;
  name: string;
  nbf: number;
  picture: string;
  role: string[];
  roleCode: string;
  sectionDisplay: string;
  siTrainedStatus: "YES" | "NO";
  siTrainingUntill: string;
  sub: string;
  updatedBy: string;
  unitDisplay: string;
}
const masterPayloadSchema = {
  objectId: null,
  csfaNo: "",
  contractorId: "",
  contractorName: "",
  contractorEmail: "",
  visitedUnit: "",
  visitedUnitName: "",
  visitedDepartment: "",
  visitedDepartmentName: "",
  visitedSection: "",
  visitedSectionName: "",
  exactLocation: "",
  hod: "",
  hodId: "",
  hodEmail: "",
  areaOwner: "",
  noOfPeopleWorking: "",
  noOfCoauditor: "",
  auditDate: "",
  auditDuration: "",
  weatherConditions: "",
  createdBy: "",
  createdByEmail: "",
  createdByName: "",
  createdAt: "",
  updatedBy: "",
  updatedByEmail: "",
  updatedByName: "",
  updatedAt: "",
  status: "",
  emailStatus: "",
  siteName: "",
  workOrderNo: "",
  auditDesc: "",
  zone: "",
  zoneName: "",
  rowIndex: 0,
  id: 0,
  coAuditors: [],
  observations: []
};

const mergeWithSchema = (schema: any, data: any) => {
  const result: any = {};
  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(data || {}, key)) {
      result[key] = data[key] !== undefined ? data[key] : schema[key];
    } else {
      result[key] = schema[key];
    }
  }
  return result;
};
const CFANew = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const objectId = useSelector((state: RootState) => state.csm.objectId);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: UserData }
  );
  const token = useSelector(selectUserToken);
  const [currentStatus, setCurrentStatus] = useState<number>(0);
  const [openSection, setOpenSection] = useState<number>(0);
  const [unitData, setUnitData] = useState<{
  // objectId: string;
  // csfaNo: string;
  contractorId: string;
  contractorName: string;
  visitedUnit: string;
  visitedUnitName: string;
  visitedDepartment: string;
  visitedDepartmentName: string;
  visitedSection: string;
  visitedSectionName: string;
  exactLocation: string;
  hod: string;
  areaOwner: string;
  noOfPeopleWorking: string;
  noOfCoauditor: string;
  auditDate: string;
  auditTime: string;
  weatherConditions: string;
  siteName: string;
  workOrderNo: string;
  auditDesc: string;
  zone: string;
  zoneName: string;
  emailStatus: string;
  createdBy: string;
  updatedBy: string;
  rowIndex: number;
  id: number;
}>({
  // objectId: "",
  // csfaNo: "",
  contractorId: "",
  contractorName: "",
  visitedUnit: "",
  visitedUnitName: "",
  visitedDepartment: "",
  visitedDepartmentName: "",
  visitedSection: "",
  visitedSectionName: "",
  exactLocation: "",
  hod: "",
  areaOwner: "",
  noOfPeopleWorking: "",
  noOfCoauditor: "",
  auditDate: "",
  auditTime: "",
  weatherConditions: "",
  siteName: "",
  workOrderNo: "",
  auditDesc: "",
  zone: "",
  zoneName: "",
  emailStatus: "",
  createdBy: "",
  updatedBy: "",
  rowIndex: 0,
  id: 0
});
  const [coAuditorsData, setCoAuditorsData] = useState([]);
  const [observationData, setObservationData] = useState([]);
  const [csfaData, setCSFAData] = useState(null);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const createCaseObjectIdRef = useRef<string | null>(null);
  const accordionTitles = [
    "Contractor Details",
    "Co-Auditors",
    "Observations",
  ];
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchExistingCSFAData = async (id: string) => {    
    try {
      const response = await serverRequest(
        {},
        `${FETCH_CSFA}/get-draft/${user?.createdBy}/${id}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {        
        setCSFAData(response);        
        setCurrentStatus(0);
        setOpenSection(0);
      }
    } catch (error) {
      console.error("Error fetching existing CSFA data:", error);
    }
  };

  useEffect(() => {
    if (objectId) {
      fetchExistingCSFAData(objectId ?? " ");
    } else {
      setCSFAData(mergeWithSchema(masterPayloadSchema, {}));
    }
  }, []);

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

  const saveDraftCSFA = async () => {
    if (isPublishing || isSavingDraft) return; // Prevent conflict with publish or ongoing draft save
    if (!csfaData?.visitedUnit || !csfaData?.visitedDepartment || !csfaData?.visitedSection || !csfaData?.auditDate) return;
    setIsSavingDraft(true);

    const fullPayload = mergeWithSchema(masterPayloadSchema, csfaData);
    // redux store > ref
    if (objectId) {
      fullPayload.objectId = objectId;
    } else if (createCaseObjectIdRef.current) {
      fullPayload.objectId = createCaseObjectIdRef.current;
    }
    fullPayload.createdBy = user?.createdBy;
    fullPayload.updatedBy = user?.createdBy;

    try {
      const response = await serverRequest(
        fullPayload,
        FETCH_CSFA + "/save-csfa",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );

      if (response?.objectId && !objectId && !createCaseObjectIdRef.current) {
        createCaseObjectIdRef.current = response.objectId;
        dispatch(setObjectId(response.objectId));
      }
    } catch (error) {
      console.error("Error saving CSFA:", error);
    }
    finally {
      setIsSavingDraft(false);
    }
  };
 
   useEffect(() => {
    if(csfaData?.visitedUnit && csfaData?.visitedDepartment && csfaData?.visitedSection && csfaData?.auditDate)
      saveDraftCSFA();
  }, [csfaData]);
   
  const publishCSFA = async () => {
    if (isPublishing || isSavingDraft) return; // stop if any save is in progress
    setIsPublishing(true);
    const fullPayload = mergeWithSchema(masterPayloadSchema, csfaData);
    if (objectId) {fullPayload.objectId = objectId;}
    else if (createCaseObjectIdRef.current) {fullPayload.objectId = createCaseObjectIdRef.current;}

    fullPayload.observations.forEach(obs => {obs.severity = String(obs.severity);
      obs.violationsSeverityProduct = String(obs.violationsSeverityProduct); });

    const payloadString = JSON.stringify(fullPayload);

    try {
      const response = await serverRequest(
        payloadString,
        FETCH_CSFA + "/save-csfa/PUBLISH",
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token,
        false,
        false
      );

      if (response?.id) {
        toast.success("CSFA published successfully");       
        // clear local state and redirect
        dispatch(clearObjectId());
        setTimeout(() => {
          router.push(APP_URL.CSM);
        }, 1000);
        return;
      } else {
        toast.error(response?.message || "Publish failed");
        setIsPublishing(false);
      }
    } catch (error) {
      console.error("Error saving CSFA:", error);      
      setIsPublishing(false);
    }
  };
 
  useEffect(() => {
    if (user?.empUnit) {
      // Only set these if we're creating a new PIR
      setUnitOptions([
        { label: user?.unitDisplay || "", value: user?.empUnit || "" },
      ]);
      setUnitData({
        // objectId: "",
        // csfaNo: "",
        contractorId: "",
        contractorName: "",
        visitedUnit: user?.empUnit,
        visitedUnitName: user?.unitDisplay,
        visitedDepartment: user?.empDepartment,
        visitedDepartmentName: user?.departmentDisplay,
        visitedSection: user?.empSection,
        visitedSectionName: user?.sectionDisplay,
        exactLocation: "",
        hod: "",
        areaOwner: "",
        noOfPeopleWorking: "",
        noOfCoauditor: "",
        auditDate: "",
        auditTime: "",
        weatherConditions: "",
        siteName: "",
        workOrderNo: "",
        auditDesc: "",
        zone: "",
        zoneName: "",
        emailStatus: "",
        createdBy: "",
        updatedBy: "",
        rowIndex: 0,
      });
      setCSFAData((prev) => ({
        ...prev,
        visitedUnit: user?.empUnit,
        visitedUnitName: user?.unitDisplay,
        visitedDepartment: user?.empDepartment,
        visitedDepartmentName: user?.departmentDisplay,
        visitedSection: user?.empSection,
        visitedSectionName: user?.sectionDisplay,
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {  
    try {
      setUnitOptions(emptySelector);
      const response = await serverRequest(
        {},
        FETCH_UNITS + `/get-units`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.unitid,
          label: data?.unitname,
        }));
        setUnitOptions(options);
      } else {
        setUnitOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 
  const toggleSection = (index: number) => {
    if (index > currentStatus) return; // block if index > currentStatus
    setOpenSection((prev) => (prev === index ? 1 : index));
  };

  const [isViewActionOpen, setIsViewActionOpen] = useState(false);
  const [actionsForView, setActionsForView] = useState([]);
  const [imagesForView, setImagesForView] = useState([]);

  const handleObservationView = async (row) => {
    setActionsForView(row.actionTakens);
    setImagesForView(row.images);
    setIsViewActionOpen(true);
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
  return (
    <>
      <div className="container-fluid">
        <div className="admin-boxContainer d3">
          <div className="adminAction">
            <Link href={APP_URL.CSM} className="adminAction__title">
              <span className="icon">
                <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage CSM
            </Link>
          </div>
        </div>
        {accordionTitles.map((title, index) => {
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
                    <ContractorDetail
                      unitData={unitData}
                      setUnitData={setUnitData}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                      setOpenSection={setOpenSection}
                      unitOptions={unitOptions}
                      csfaData={csfaData}
                      setCSFAData={setCSFAData}
                    />
                  )}
                  {index === 1 && (
                    <>
                      <CoAuditors
                        coAuditorsData={coAuditorsData}
                        setCoAuditorsData={setCoAuditorsData}
                        setOpenSection={setOpenSection}
                        csfaData={csfaData}
                        setCSFAData={setCSFAData}
                        currentStatus={currentStatus}            
                        setCurrentStatus={setCurrentStatus}    
                      />
                    </>
                  )}
                   {index === 2 && (
                    <>
                      <Observations
                        observationData={observationData}
                        setObservationData={setObservationData}
                        setOpenSection={setOpenSection}
                        csfaData={csfaData}
                        setCSFAData={setCSFAData}
                        setIsPreviewActive={setIsPreviewActive}
                        currentStatus={currentStatus}            
                        setCurrentStatus={setCurrentStatus}    
                      />
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <CustomModal isOpen={isPreviewActive} onClose={() => {setIsPreviewActive(false)}} title="Preview CFA Form">
        <div className="c-accordion" key="0">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Contractor Details</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-md-3">              
              <InputField
                type="text"
                label="Unit"
                name="unitPreview"
                placeholder=""
                value={csfaData?.visitedUnitName || ""}
                disabled={true} 
                onBlur={() => {}}
                onChange={() => {}}
               />
            </div>
            {/* Department */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Department"
                name="departmentPreview"
                placeholder=""
                value={csfaData?.visitedDepartment || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Visited Section */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Visited Section"
                name="sectionPreview"
                placeholder=""
                value={csfaData?.visitedSectionName || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
              <div className="col-md-3">
              <InputField
                type="text"
                label="Zone"
                name="zoneNamePreview"
                placeholder=""
                value={csfaData?.zoneName || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* HOD Name */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="HOD Name"
                name="hodPreview"
                placeholder=""
                value={csfaData?.hod || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* SI Date */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Audit Date"
                name="auditDatePreview"
                placeholder=""
                value={csfaData?.auditDate || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            {/* Duration */}
            <div className="col-md-3">
              <InputField
                type="text"
                label="Duration"
                name="auditDurationPreview"
                placeholder=""
                value={csfaData?.auditDuration || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            <div className="col-md-3">
              <InputField
                type="text"
                label="Exact Location"
                name="exactLocationPreview"
                placeholder=""
                value={csfaData?.exactLocation || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
             <div className="col-md-3">
              <InputField
                type="text"
                label="Area Owner"
                name="areaOwnerPreview"
                placeholder=""
                value={csfaData?.areaOwner || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
             <div className="col-md-3">
              <InputField
                type="text"
                label="Number of People Working"
                name="noOfPeopleWorkingPreview"
                placeholder=""
                value={csfaData?.noOfPeopleWorking || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
            <div className="col-md-3">
              <InputField
                type="text"
                label="Work Order No"
                name="workOrderNoPreview"
                placeholder=""
                value={csfaData?.workOrderNo || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
             <div className="col-md-3">
              <InputField
                type="text"
                label="Audit Description"
                name="auditDescPreview"
                placeholder=""
                value={csfaData?.auditDesc || ""}
                disabled={true}
                onBlur={() => {}}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
        <div className="c-accordion" key="2">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">Observations</div>
          </div>
          <div className="row py-2 form_grider d1">
            <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Observation Description</th>
                        <th>Observation Location</th>
                        <th>Responsible Supervisor</th>
                        <th>No. of Violations</th>
                        <th>Severity</th>
                        <th>Violations Severity</th>
                        <th>Indicators</th>
                        <th style={{ width: 120 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csfaData?.observations?.length > 0 ? (
                        csfaData?.observations.map((row, index) => (
                          <tr key={index}>
                            <td>{row?.observationDescription}</td>
                            <td>{row?.observationLocation}</td>
                            <td>{row?.responsibleSupervisor}</td>
                            <td>{row?.noOfViolations}</td>
                            <td>{row?.severity}</td>
                            <td>{row?.violationsSeverityProduct}</td>
                            <td>{row?.indicators}</td>
                            <td>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                      handleObservationView(row);
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
                          <td colSpan={6} className="text-center">
                            No Observation added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
        <div className="actionWrapper">
          <button
            className="iconBtn orange v2"
            onClick={() => {setIsPreviewActive(false)}}
            type="button"
          >
            <span>Edit CFA Form</span>
            <Image
              width={15}
              height="15"
              alt="icon"
              className="img-fluid u-image"
              src="/images/svg/edit-icon.svg"
            />
          </button>
          <button
            className="iconBtn green v2"
            onClick={publishCSFA}
            type="button"
            disabled={isPublishing} // disable while submitting
          >
            <span>{isPublishing ? "Publishing..." : "Submit CFA Form"}</span>
            <Image
              width={15}
              height={15}
              alt="icon"
              className="img-fluid u-image"
              src="/images/svg/plane_icon.svg"
              style={{transform: "rotate(135deg)"}}
            />
          </button>
        </div>
      </CustomModal>
      <CustomModal isOpen={isViewActionOpen} onClose={() => setIsViewActionOpen(false)}
        title="View Actions & File Attachments">
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
                      <td colSpan={2} className="text-center">
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
      <ToastContainer position="top-right" autoClose={2000} 
                      hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default ProtectedRoute(CFANew);
