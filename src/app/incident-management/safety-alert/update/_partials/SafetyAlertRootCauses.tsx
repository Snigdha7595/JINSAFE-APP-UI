import { useState, useEffect } from "react";
import { SelectOptions } from "@/components/interfaces";
import Image from "next/image";
import { selectUserToken } from "@/store/slices/authSlice";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import CustomModal from "@/components/Layouts/CustomModal";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import { INCIDENT_RCA_FACTOR } from "@/config/apiConfig";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { emptySelector } from "@/config/config";

const SafetyAlertRootCauses = ({
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  readOnly,
  saData,
  setSaData,
  isUpdateMode,
}: any) => {
  const token = useSelector(selectUserToken);
  const [rootCauseFindings, setRootCauseFindings] = useState<string>("");
  const [rootCauseFactorType, setRootCauseFactorType] = useState<SelectOptions | null>(null);
  const [humanFactor, setHumanFactor] = useState<SelectOptions | null>(null);
  const [physicalUnsafe, setPhysicalUnsafe] = useState<SelectOptions | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [systemRCAFactorOptions, setSystemRCAFactorOptions] = useState<SelectOptions[] | null>(emptySelector);
  const [humanFactorOptions, setHumanFactorOptions] =  useState<SelectOptions | null>(null);
  const [systemFactorSelector, setSystemFactorSelector] = useState<boolean>(false)
  const [humanFactorSelector, setHumanFactorSelector] = useState<boolean>(false)
  const [physicalFactorSelector, setPhysicalFactorSelector] = useState<boolean>(false)
  const [systemFactor, setSystemFactor] = useState<SelectOptions | null>(null);
  const [unsafeSituation, setUnsafeSituation] = useState<SelectOptions | null>(null);
  const [physicalUnsafeOptions, setPhysicalUnsafeOptions] = useState<SelectOptions | null>(null);
  const [pkeyId, setPkeyId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rootCauseFactorTypeOptions = [
    { label: "System Factor", value: "System" },
    { label: "Human Factor", value: "Human" },
    { label: "Physical Factor", value: "Physical" },
  ];

  const situationOptions = [{ label: "Unsafe Acts", value: "UnsafeAct" },
    { label: "Unsafe Conditions", value: "UnsafeCondition" },]

  const getInitialValues = () => {
    if (saData?.safetyAlertRootCauses && saData.safetyAlertRootCauses.length > 0) {
      const transformedRootCauses = saData.safetyAlertRootCauses?.map((cause: any) => ({
        findings: cause.finding || cause.findings || "",
        factorType: cause.factorType || "",
        factorName: cause.factorName || "",
        physicalFactorType: cause.physicalFactorType || null,
        pirId: cause.pirId || "",
        other: cause.other || "",
        pkeyId: cause.pkeyId || 0,
        ...cause
      }));

      return {
        rootCauses: transformedRootCauses,
      };
    }

    return {
      rootCauses: [],
    };
  };

  const validationSchema = Yup.object().shape({
    rootCauses: Yup.array().of(
      Yup.object().shape({
        findings: Yup.string().nullable(),
        factorType: Yup.string().required("Factor Type is required"),
        factorName: Yup.string().required("Factor Name is required"),
         humanFactor: Yup.string().nullable(),
        physicalFactorType: Yup.string().nullable(),
        pirId: Yup.string().nullable(),
        other: Yup.string().nullable(),
      })
    ),
  });
  const fetchHumanFactors =  async () => {
    try {
      const response = await serverRequest(
        {},
        INCIDENT_RCA_FACTOR + `/get-factors/Human/None`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response?.map((item: any) => ({ value: item.id, label: item.humanFactor }));
        setHumanFactorOptions(options)
        setHumanFactorSelector(true);
      }
    } catch (error) {
      console.error("Error fetching human factors:", error);
    }
  }

  const fetchPhysicalUnsafe = async (unsafeVal: string) => {
    try {
      const response = await serverRequest(
        {},
        INCIDENT_RCA_FACTOR + `/get-factors/Physical/${unsafeVal}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {

        const options = response?.map((item: any) => ({ value: item.id, label: (unsafeVal == 'UnsafeCondition') ? item.unsafeCondition : item.unsafeAct }));
        setPhysicalUnsafeOptions(options)
      }
    } catch (error) {
      console.error("Error fetching physical unsafe options:", error);
    }
  }

  const fetchSystemRCAFactors = async() => {
    try {
      const response = await serverRequest(
        {},
        INCIDENT_RCA_FACTOR + `/get-factors/System/None`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {         
        const options = response?.map((item: any) => ({ value: item.id, label: item.systemFactor }));
        setSystemRCAFactorOptions(options)
        setSystemFactorSelector(true);
      }
    } catch (error) {
      console.error("Error fetching system RCA factors:", error);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setEditIndex(null);
      setRootCauseFindings("");
      setRootCauseFactorType(null);
      setHumanFactor(null);
      setSystemFactor(null);
      setUnsafeSituation(null);
      setPhysicalUnsafe(null);
      setPkeyId(null);
      setSystemFactorSelector(false);
      setHumanFactorSelector(false);
      setPhysicalFactorSelector(false);
    }
  }, [isOpen]);

  const transformToSafetyAlertRootCauses = (rootCauses: any[]) => {
    return rootCauses?.map(cause => ({
      pkeyId: cause.pkeyId || 0,
      factorType: cause.factorType || "",
      physicalFactorType: cause.physicalFactorType || null,
      factorName: cause.factorName || "",
      pirId: cause.pirId || saData?.pirId || "",
      finding: cause.findings || cause.finding || "",
      other: cause.other || ""
    }));
  };

  const handleSubmit = async (values: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updatedSaData = {
        ...saData,
        safetyAlertRootCauses: transformToSafetyAlertRootCauses(values.rootCauses)
      };
      console.log("SafetyAlertRootCauses - Updated saData:", updatedSaData);
      setSaData(updatedSaData);
      setCurrentStatus(5);
      setOpenSection(5);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={getInitialValues()}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={handleSubmit}
      >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit: formikSubmit,
        resetForm,
        setFieldValue,
        touched,
        errors,
        isValid,
      }) => (
        <form onSubmit={(e) => {
          e.preventDefault();
          formikSubmit();
        }}>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="row">
                <div className="col-12">
                  <div className="actionWrapper ">
                    {!readOnly && <button
                      className="iconBtn green v2 withborderBT"
                      onClick={() => setIsOpen(true)}
                      type="button"
                    >
                      <span>Add Root Cause</span>
                      <Image
                        width={15}
                        height={15}
                        alt="icon"
                        className="img-fluid u-image"
                        src="/images/svg/plus.svg"
                      />
                    </button>}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="formTable">
                    <div className="formTable__table">
                      <div className="admin-table d3 table-responsive mt-3 noHover">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Findings</th>
                              <th>Factor Type</th>
                              <th>Factor Identified</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {values.rootCauses.length > 0 ? (
                              values.rootCauses?.map(
                                (item: any, index: number) => {
                                  const displayFindings = item.findings || item.finding || "";
                                  return (
                                  <tr key={index}>
                                    <td>{displayFindings}</td>
                                    <td>{item.factorType}</td>
                                    <td>{item.factorName}</td>
                                    <td className="u-icon">
                                      <button
                                        type="button"
                                        className="tableBtn v2"
                                        onClick={() => {
                                          setEditIndex(index);
                                          setRootCauseFindings(item.findings || item.finding || "")
                                          setPkeyId(item.pkeyId || null);
                                          const selectedFactorType = rootCauseFactorTypeOptions.find(opt => opt.label === item.factorType);
                                          setRootCauseFactorType(selectedFactorType || null);

                                          setSystemFactorSelector(false);
                                          setHumanFactorSelector(false);
                                          setPhysicalFactorSelector(false);

                                          if (selectedFactorType?.value === "System") {
                                            fetchSystemRCAFactors();
                                            setSystemFactor({ label: item.factorName, value: item.factorName });
                                          } else if (selectedFactorType?.value === "Human") {
                                            fetchHumanFactors();
                                            setHumanFactor({ label: item.factorName, value: item.factorName });
                                          } else if (selectedFactorType?.value === "Physical") {
                                            setPhysicalFactorSelector(true);
                                            const match = situationOptions.find(o => o.label === item.physicalFactorType);
                                            if (match) {
                                              setUnsafeSituation(match);
                                              fetchPhysicalUnsafe(match.value).then(() => {
                                                setPhysicalUnsafe({ label: item.factorName, value: item.factorName });
                                              });
                                            }
                                          }

                                          setIsOpen(true);
                                        }}
                                      >
                                        <Image width={15} height={15} alt="edit" src="/images/svg/edit-icon-blue.svg" />
                                      </button>
                                      <button
                                        type="button"
                                        className="tableBtn v2"
                                        onClick={() => {
                                          const updated = [...values.rootCauses];
                                          updated.splice(index, 1);
                                          setFieldValue("rootCauses", updated);
                                        }}
                                      >
                                        <Image width={15} height={15} alt="delete" src="/images/svg/delete-icon.svg" />
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              )
                            ) : (
                              <tr>
                                <td colSpan={5}>No Root Causes Added</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* {!readOnly && <button className="iconBtn green v2 ms-0" type="submit">
              <span>Save & Next</span>
            </button>} */}
            {!readOnly && (
              <button
                className="iconBtn green v2 ms-0"
                type="button"
                onClick={() => formikSubmit()}
              >
                <span>{isSubmitting ? "Saving..." : "Save & Next"}</span>
              </button>
            )}
          </div>
          <CustomModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={`${editIndex !== null ? "Edit" : "Add"} Root Cause`}>
            <>
              <div className="filters">
                <div className="row form_grider d1">
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      type="text"
                      label="Findings (Max. 300 characters)"
                      value={rootCauseFindings}
                      name="rootCauseFindings"
                      placeholder="Enter Root cause Findings"
                      errors={""}
                      touched={""}
                      onBlur={() => {}}
                      onChange={(e: any) => {
                        setRootCauseFindings(e.target.value);
                      }}
                      maxLength={300}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <SelectField
                      label="Factor Type"
                      value={rootCauseFactorType}
                      name="rootCauseFactorType"
                      placeholder="Select Factor Type"
                      options={rootCauseFactorTypeOptions}
                      onChange={(value: any) => {
                        setRootCauseFactorType(value);
                        // Reset all optional fields before switching
                        setSystemFactor(null);
                        setHumanFactor(null);
                        setPhysicalUnsafe(null);
                        setUnsafeSituation(null);

                        // Hide all selectors first
                        setSystemFactorSelector(false);
                        setHumanFactorSelector(false);
                        setPhysicalFactorSelector(false);

                        // Handle logic based on selected factor type
                        if (value.value === "System") {
                          fetchSystemRCAFactors();
                          setSystemFactorSelector(true);
                        }

                        if (value.value === "Human") {
                          fetchHumanFactors();
                          setHumanFactorSelector(true);
                        }

                        if (value.value === "Physical") {
                          setPhysicalFactorSelector(true);
                        }
                      }}
                      onBlur={() => {}}
                    />
                  </div>
                  { physicalFactorSelector && <div className="col-12 colmd-6 col-lg-6">
                    <SelectField
                      label="Unsafe Situation"
                      value={unsafeSituation}
                      name="unsafeSituation"
                      placeholder="Select Unsafe Situation"
                      options={situationOptions}
                      onChange={(value: any) => {
                        setUnsafeSituation(value);
                        fetchPhysicalUnsafe(value.value)
                      }}
                      onBlur={() => {}}
                    />
                  </div>}
                  { systemFactorSelector && <div className="col-12 colmd-6 col-lg-6">
                    <SelectField
                      label="System Factor"
                      value={systemFactor}
                      name="systemFactor"
                      placeholder="Select System Factor"
                      options={systemRCAFactorOptions}
                      onChange={(value: any) => {
                        setSystemFactor(value);
                      }}
                      onBlur={() => {}}
                    />
                  </div>}
                  { humanFactorSelector && <div className="col-12 col-md-6 col-lg-6">
                    <SelectField
                      label="Human Factor"
                      value={humanFactor}
                      name="humanFactor"
                      placeholder="Enter Human Factor"
                      options={humanFactorOptions}
                      onChange={(value: any) => {
                        setHumanFactor(value);
                      }}
                      onBlur={() => {}}
                    />
                  </div>}
                  { physicalFactorSelector && unsafeSituation &&<div className="col-12 col-md-6 col-lg-6">
                    <SelectField
                      label={`Physical Factor ${unsafeSituation.label}`}
                      value={physicalUnsafe}
                      name="humanFactor"
                      placeholder="Enter Human Factor"
                      options={physicalUnsafeOptions}
                      onChange={(value: any) => {
                        setPhysicalUnsafe(value);
                      }}
                      onBlur={() => {}}
                    />
                  </div>}
                  <div className="row">
                    <div className="col-12">
                      <div className="btnWrapper mt-3">
                        <button
                          className="btnNoicon green"
                          type="button"
                          onClick={() => {
                            if (!rootCauseFindings || !rootCauseFactorType?.value) return;

                            const newRootCause: any = {
                              findings: rootCauseFindings,
                              factorType: rootCauseFactorType.label,
                              physicalFactorType: null,
                              pirId: saData?.pirId,
                              other: "",
                              pkeyId: editIndex !== null ? pkeyId || values.rootCauses[editIndex]?.pkeyId || 0 : 0
                            };

                            if (rootCauseFactorType.value === "System" && systemFactor) {
                              newRootCause.factorName = systemFactor.label;
                            } else if (rootCauseFactorType.value === "Human" && humanFactor) {
                              newRootCause.factorName = humanFactor.label;
                            } else if (
                              rootCauseFactorType.value === "Physical" &&
                              unsafeSituation &&
                              physicalUnsafe
                            ) {
                              newRootCause.factorName = physicalUnsafe.label;
                              newRootCause.physicalFactorType = unsafeSituation.label;
                            }

                            const updated = [...values.rootCauses];
                            if (editIndex !== null) {
                              updated[editIndex] = newRootCause;
                            } else {
                              updated.push(newRootCause);
                            }

                            setFieldValue("rootCauses", updated);
                            setIsOpen(false);
                          }}
                        >
                          {editIndex !== null ? "Update" : "Apply"}
                        </button>
                        <button
                          type="button"
                          className="btnNoicon red"
                          onClick={() => {
                            setIsOpen(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </CustomModal>
        </form>
      )}
    </Formik>
  );
};

export default SafetyAlertRootCauses;
