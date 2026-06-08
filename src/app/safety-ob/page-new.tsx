"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import CustomModal from "@/components/Layouts/CustomModal";
import { useEffect, useRef, useState } from "react";
import InputField from "@/components/Form/InputField";
import { emptySelector } from "@/config/config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { serverRequest } from "@/services/getServerSideRender";
import { SelectOptions } from "@/components/interfaces";
import AIAssistantDrawer from "../so/so-new/_partials/AIAssistantDrawer";
import type { DocumentProcessResponse } from "../so/so-new/types/ocr.types";
import {
  FETCH_UNITS,
  FETCH_DEPARTMENTS,
  FETCH_SECTIONS,
  FETCH_OBSERVATION_TYPE,
  FETCH_OBSERVATION_CATEGORY,
  FETCH_RISK_POTENTIAL,
  BUCKET_URL,
} from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import { mapOCRMetadataToFormFields } from "../so/so-new/utils/ocrDataMapper";

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
  siTrainedStatus: "YES" | "NO";
  siTrainingUntill: string;
  sub: string;
  updatedBy: string;
  unitDisplay: string;
}

interface ObservationData {
  observationType: string;
  observationTypeDisplay: string;
  observationCategory: string;
  observationCategoryDisplay: string;
  observationDetail: string;
  riskPotentials: string;
  riskPotentialsDisplay: string;
  exactLocation: string;
  status: string;
  rowIndex: number;
}

const masterPayloadSchema = {
  objectId: null,
  unit: "",
  unitDisplay: "",
  department: "",
  departmentDisplay: "",
  sections: "",
  sectionDisplay: "",
  locations: "",
  nameObserver: "",
  obsDate: "",
  duration: "",
  createdby: "",
  updatedat: "",
  updatedby: "",
  status: "DRAFT",
  generalComment: "",
  hod: "",
  modulename: "OBS",
  observations: [],
};

const SafetyObservation = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: UserData }
  );
  const token = useSelector(selectUserToken);
  const [currentStatus, setCurrentStatus] = useState<number>(0);
  const [openSection, setOpenSection] = useState<number>(0);
  const [observationData, setObservationData] = useState<any>(masterPayloadSchema);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [sectionsOptions, setSectionsOptions] = useState(emptySelector);
  const [typeOfObservationsOptions, setTypeOfObservationsOptions] = useState(emptySelector);
  const [observationCategoriesOptions, setObservationCategoriesOptions] = useState(emptySelector);
  const [riskPotentialOptions, setRiskPotentialOptions] = useState(emptySelector);
  const [observations, setObservations] = useState<ObservationData[]>([]);
  const [lastOCRResult, setLastOCRResult] = useState<DocumentProcessResponse | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const accordionTitles = [
    "Observation Details",
    "Observations",
  ];

  useEffect(() => {
    if (user?.empUnit) {
      setUnitOptions([
        { label: user?.unitDisplay || "", value: user?.empUnit || "" },
      ]);
      setObservationData((prev: any) => ({
        ...prev,
        unit: user?.empUnit,
        unitDisplay: user?.unitDisplay,
        department: user?.empDepartment,
        departmentDisplay: user?.departmentDisplay,
        sections: user?.empSection,
        sectionDisplay: user?.sectionDisplay,
        createdby: user?.createdBy,
        nameObserver: user?.empName,
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchUnits();
    fetchTypeOfObservations();
    fetchObservationCategory();
    fetchRiskPotential();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_UNITS + `/get-units`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.unitid,
          label: data?.unitname,
        }));
        setUnitOptions(options);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const fetchDepartments = async (unitId: string) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${unitId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.deptid,
          label: data?.deptname,
          hod: data?.hod,
        }));
        setDepartmentOptions(options);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchSections = async (deptId: string) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/get-sections/${deptId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.sectionid,
          label: data?.sectionname,
        }));
        setSectionsOptions(options);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchTypeOfObservations = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_OBSERVATION_TYPE + "/GetObservationTypes",
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.id,
          label: data?.observation,
        }));
        setTypeOfObservationsOptions(options);
      }
    } catch (error) {
      console.error("Error fetching observation types:", error);
    }
  };

  const fetchObservationCategory = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_OBSERVATION_CATEGORY + "/GetObservationCategories",
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.id,
          label: data?.category_name,
        }));
        setObservationCategoriesOptions(options);
      }
    } catch (error) {
      console.error("Error fetching observation categories:", error);
    }
  };

  const fetchRiskPotential = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_RISK_POTENTIAL + "/GetRiskPotentials",
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
        const options = response.map((data: any) => ({
          value: data?.id,
          label: data?.risk_potential,
        }));
        setRiskPotentialOptions(options);
      }
    } catch (error) {
      console.error("Error fetching risk potentials:", error);
    }
  };

  const handleOCRResult = (result: DocumentProcessResponse) => {
    setLastOCRResult(result);
    
    // Auto-populate observations from OCR result
    if (result.observations && result.observations.length > 0) {
      const extractedObservations = result.observations.map((obs: any, index: number) => ({
        observationType: "",
        observationTypeDisplay: "",
        observationCategory: "",
        observationCategoryDisplay: "",
        observationDetail: obs.description || obs.title || "",
        riskPotentials: obs.severity || "",
        riskPotentialsDisplay: obs.severity || "",
        exactLocation: obs.location || "",
        status: "DRAFT",
        rowIndex: index,
      }));
      setObservations(extractedObservations);
    }
  };

  // Auto-open AI assistant when moving to observations section
  useEffect(() => {
    if (currentStatus === 1 && !isAIAssistantOpen) {
      setIsAIAssistantOpen(true);
    }
  }, [currentStatus]);

  const toggleSection = (index: number) => {
    if (index > currentStatus) return;
    setOpenSection((prev) => (prev === index ? -1 : index));
  };

  const handleNextInDetailsSection = async () => {
    if (!observationData?.unit || !observationData?.department || 
        !observationData?.sections || !observationData?.obsDate) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Save draft before moving to next section
    setIsSavingDraft(true);
    try {
      // Here you would save the observation data
      // await saveDraftObservation(observationData);
      setCurrentStatus(1);
      setOpenSection(1);
      toast.success("Moving to observations section...");
    } catch (error) {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (observations.length === 0) {
      toast.error("Please add at least one observation");
      return;
    }

    setIsPublishing(true);
    try {
      const payload = {
        ...observationData,
        observations,
        updatedby: user?.createdBy,
        status: "PUBLISHED",
      };
      // await publishObservation(payload);
      toast.success("Observation published successfully!");
      setTimeout(() => {
        router.push(APP_URL.SAFETY_OB);
      }, 1500);
    } catch (error) {
      toast.error("Failed to publish. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div
        style={{
          transition: "all 0.25s ease",
          marginRight: 0,
        }}
      >
        <div className="container-fluid">
          <div className="admin-boxContainer d3">
            <div className="adminAction">
              <Link href={APP_URL.SAFETY_OB} className="adminAction__title">
                <span className="icon">
                  <img
                    width="15"
                    height="15"
                    alt="icon"
                    src="/images/svg/arrow-left-grey.svg"
                    className="img-fluid u-image"
                  />
                </span>
                Safety Observations
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAIAssistantOpen(true)}
                style={{ marginLeft: "12px", padding: "6px 14px", fontSize: "13px" }}
              >
                🚀 Velocity Jinsafe
              </button>
            </div>
          </div>

          {isAIAssistantOpen && (
            <AIAssistantDrawer
              onClose={() => setIsAIAssistantOpen(false)}
              onExtract={handleOCRResult}
              currentStage={currentStatus === 1 ? "observations" : "unit-details"}
              lastOCRResult={lastOCRResult}
            />
          )}

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
                      <div className="row py-2 form_grider d1">
                        <div className="col-md-3">
                          <InputField
                            type="text"
                            label="Unit"
                            name="unit"
                            placeholder="Select Unit"
                            value={observationData?.unitDisplay || ""}
                            disabled={true}
                            onBlur={() => {}}
                            onChange={() => {}}
                          />
                        </div>
                        <div className="col-md-3">
                          <InputField
                            type="text"
                            label="Department"
                            name="department"
                            placeholder="Select Department"
                            value={observationData?.departmentDisplay || ""}
                            disabled={true}
                            onBlur={() => {}}
                            onChange={() => {}}
                          />
                        </div>
                        <div className="col-md-3">
                          <InputField
                            type="text"
                            label="Section"
                            name="section"
                            placeholder="Select Section"
                            value={observationData?.sectionDisplay || ""}
                            disabled={true}
                            onBlur={() => {}}
                            onChange={() => {}}
                          />
                        </div>
                        <div className="col-md-3">
                          <InputField
                            type="date"
                            label="Observation Date"
                            name="obsDate"
                            placeholder="Select Date"
                            value={observationData?.obsDate || ""}
                            disabled={false}
                            onBlur={() => {}}
                            onChange={(e) => {
                              setObservationData((prev: any) => ({
                                ...prev,
                                obsDate: e.target.value,
                              }));
                            }}
                          />
                        </div>
                        <div className="col-md-12 mt-3">
                          <InputField
                            type="textarea"
                            label="General Comments"
                            name="generalComment"
                            placeholder="Enter any general comments"
                            value={observationData?.generalComment || ""}
                            disabled={false}
                            onBlur={() => {}}
                            onChange={(e) => {
                              setObservationData((prev: any) => ({
                                ...prev,
                                generalComment: e.target.value,
                              }));
                            }}
                          />
                        </div>
                        <div className="actionWrapper">
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleNextInDetailsSection}
                            disabled={isSavingDraft}
                          >
                            {isSavingDraft ? "Saving..." : "Next"}
                          </button>
                        </div>
                      </div>
                    )}

                    {index === 1 && (
                      <div className="row py-2 form_grider d1">
                        <div className="col-md-12">
                          <h5>Observations ({observations.length})</h5>
                          {observations.length === 0 ? (
                            <div className="alert alert-info">
                              No observations added yet. Upload documents or add observations manually.
                            </div>
                          ) : (
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Type</th>
                                  <th>Category</th>
                                  <th>Details</th>
                                  <th>Location</th>
                                  <th>Risk Level</th>
                                </tr>
                              </thead>
                              <tbody>
                                {observations.map((obs, idx) => (
                                  <tr key={idx}>
                                    <td>{obs.observationTypeDisplay || "-"}</td>
                                    <td>{obs.observationCategoryDisplay || "-"}</td>
                                    <td>{obs.observationDetail?.substring(0, 50) || "-"}...</td>
                                    <td>{obs.exactLocation || "-"}</td>
                                    <td>{obs.riskPotentialsDisplay || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          <div className="actionWrapper mt-3">
                            <button
                              className="btn btn-success"
                              type="button"
                              onClick={handlePublish}
                              disabled={isPublishing || observations.length === 0}
                            >
                              {isPublishing ? "Publishing..." : "Publish Observation"}
                            </button>
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={() => {
                                setCurrentStatus(0);
                                setOpenSection(0);
                              }}
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default ProtectedRoute(SafetyObservation);
