import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import SelectField from "@/components/Form/SelectFields";
import { emptySelector, yesNoSelector } from "@/config/config";
import MultiSelectField from "@/components/Form/MultiSelectField";
import { SelectOptions } from "@/components/interfaces";
import { serverRequest } from "@/services/getServerSideRender";
import { GET_INCIDENT_CATEGORY, SAVE_DRAFT_PIR } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { ToastContainer, toast } from "react-toastify";
import { RootState } from "@/store/store";

const getInjuryHappenedFromClassification = (classification: string | string[]): "Yes" | "No" => {
  if (!classification) return "No";
  const triggers = [
    "Fatality",
    "Lost Time Case",
    "Restricted Workday Cases",
    "Medical Treatment Cases",
    "First-Aid Cases",
  ];

  const classifications = typeof classification === 'string' 
    ? classification.split(',').map(item => item.trim())
    : classification;
    
  return triggers.some(trigger => classifications.some((cls: string) => cls.includes(trigger))) ? "Yes" : "No";
};
const PreliminaryClassificationEdit = ({
  readOnly,
  preliminaryData,
  setPreliminaryData,
  prelimClassificOptions,
  pirData,
  setPirData,
}: any) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const incidentTierOptions = [{ value: "Tier 1", label: "Tier 1" }, { value: "Tier 2", label: "Tier 2" }, { value: "Tier 3", label: "Tier 3" }]
  const [incidentCategoryOptions, setIncidentCategoryOptions] = useState<SelectOptions[]>(emptySelector)
  const [injuryHappened, setInjuryHappened] = useState<SelectOptions>(emptySelector[0])
  const [displayTierField, setDisplayTierField] = useState<boolean>(false);

  const initialValues = {
    incidentClassification: pirData?.incidentClassification || preliminaryData?.incidentClassification || "",
    hipoCase: pirData?.hipoCase || preliminaryData?.hipoCase || "",
    injuryHappened: pirData?.injuryHappened || preliminaryData?.injuryHappened || "",
    incidentCategory: pirData?.incidentCategory || preliminaryData?.incidentCategory || "",
    tier: pirData?.tier || preliminaryData?.tier || "",
  };

  // useEffect(() => {
  //   const initialInjuryValue = initialValues.injuryHappened;
  //   if (initialInjuryValue === "Yes" || initialInjuryValue === "No") {
  //     setInjuryHappened({ label: initialInjuryValue, value: initialInjuryValue });
  //   } else if (initialValues.incidentClassification) {
  //       const derivedValue = getInjuryHappenedFromClassification(initialValues.incidentClassification);
  //       setInjuryHappened({ label: derivedValue, value: derivedValue });
  //       setPreliminaryData((prev: any) => ({
  //         ...prev,
  //         injuryHappened: prev?.injuryHappened || derivedValue,
  //       }));
  //       setPirData((prev: any) => ({
  //         ...prev,
  //         injuryHappened: prev?.injuryHappened || derivedValue,
  //       }));
  //     }
  //     const hasProcessSafety = initialValues.incidentClassification?.includes("Process Safety");
  //     fetchIncidentCategory(hasProcessSafety);
  //     setDisplayTierField(hasProcessSafety);
  // }, []);

  useEffect(() => {
    const initializeForm = async () => {
      const incidentClassification = initialValues.incidentClassification;
      
      // Determine if Process Safety is selected
      const hasProcessSafety = incidentClassification?.includes("Process Safety");
      
      // Set injury happened value
      let injuryValue = initialValues.injuryHappened;
      if (!injuryValue && incidentClassification) {
        injuryValue = getInjuryHappenedFromClassification(incidentClassification);
      }
      
      // Update local state
      setInjuryHappened({ label: injuryValue || "No", value: injuryValue || "No" });
      setDisplayTierField(hasProcessSafety);
      
      // Update parent components if injury value was derived
      if (!initialValues.injuryHappened && injuryValue) {
        setPreliminaryData((prev: any) => ({
          ...prev,
          injuryHappened: injuryValue,
        }));
        setPirData((prev: any) => ({
          ...prev,
          injuryHappened: injuryValue,
        }));
      }
      
      // Fetch incident categories
      await fetchIncidentCategory(hasProcessSafety);
    };

    initializeForm();
  }, [initialValues.incidentClassification, initialValues.injuryHappened]);

  const fetchIncidentCategory = async (hasProcessSafety: boolean) => {
    const endpoint = hasProcessSafety ? "Process Safety" : " ";
    try {
      const response = await serverRequest(
        {},
        GET_INCIDENT_CATEGORY + `/get-incident-categories/${endpoint}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((dept: any) => ({
          value: dept?.category,
          label: dept?.category,
        }));
        setIncidentCategoryOptions(options);
      } else {
        setIncidentCategoryOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const validationSchema = Yup.object().shape({
    incidentClassification: Yup.string().required("Preliminary Classification is required"),
    hipoCase: Yup.string().required("High Potential Case is required"),
    injuryHappened: Yup.string().required("Injury Happened is required"),
    incidentCategory: Yup.string().required("Incident Category is required"),
    tier: Yup.string()
    .nullable()
    .test(
      'tier-required-for-process-safety',
      'Tier is required when Process Safety is selected',
      function (value) {
        const { incidentClassification } = this.parent;
        if (incidentClassification && incidentClassification.includes("Process Safety")) {
          return !!value;
        }
        return true;
      }
    ),
  });
  const onSubmit = async (values: any) => {
    const updatedData = {
      ...pirData,
      incidentClassification: values.incidentClassification,
      hipoCase: values.hipoCase,
      injuryHappened: values.injuryHappened,
      incidentCategory: values.incidentCategory,
      tier: values.tier,
      updatedBy: user?.createdBy
    };
     try {
      const response = await serverRequest(
        updatedData,
        SAVE_DRAFT_PIR + `/update-pir/${pirData.pirId}`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );
      if (response?.success == true) {
        if(response?.message != null )
        {
          toast.success(response.message);
        }
        else{
          toast.success("PIR Updated Successfully");
        }
      }
    } catch (error) {
      console.error("Error saving PIR:", error);
    } 
    // Update both PIR and Safety Alert data
    // setPirData(updatedData);
    // setSaData(prev => ({
    //   ...prev,
    //   ...transformValuesToSafetyAlert(values),
    //   objectId: prev?.objectId || null
    // }));
    // setCurrentStatus(1);
    // setOpenSection(1);
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      {({
        values,
        handleBlur,
        handleSubmit,
        setFieldTouched,
        setFieldValue,
        touched,
        errors,
      }) => (
        <form onSubmit={handleSubmit}>
          <div className="filters">
          <div className="row form_grider d1">
            {/* Incident Classification */}
            <div className="col-md-3">
              <MultiSelectField
                label="Preliminary Classification"
                value={values.incidentClassification || ''}
                name="incidentClassification"
                required={true}
                disabled={readOnly}
                placeholder="Select"
                options={prelimClassificOptions}
                selectAllLabel="Select All"
                onChange={(output, ids) => {
                  setFieldValue('incidentClassification', output);
                  
                  if (!output) {
                    setFieldValue('incidentCategory', "");
                    setIncidentCategoryOptions(emptySelector);
                    setFieldValue('injuryHappened', "No");
                    setInjuryHappened({ label: "No", value: "No" });
                    setDisplayTierField(false);
                    return;
                  }

                  // Convert output to array of strings for consistent checking
                  const outputValues = typeof output === 'string' 
                    ? output.split(',').map(v => v.trim())
                    : output.map(item => typeof item === 'string' ? item : item.value);

                  // Check for Process Safety
                  if (outputValues.includes("Process Safety")) {
                    fetchIncidentCategory(true);
                    setDisplayTierField(true);
                  } else {
                    fetchIncidentCategory(false);
                    setFieldValue('tier', "");
                    setDisplayTierField(false);
                  }

                  setFieldValue('incidentCategory', "");

                  // Check for injury types
                  // const injuryTypes = [
                  //   'Fatality',
                  //   'Lost Time Case',
                  //   'Restricted Workday Cases',
                  //   'Medical Treatment Cases',
                  //   'First-Aid Cases'
                  // ];

                  // const hasInjury = injuryTypes.some(type => outputValues.includes(type));
                  // setFieldValue('injuryHappened', hasInjury ? "Yes" : "No");
                  // setInjuryHappened({ 
                  //   label: hasInjury ? "Yes" : "No", 
                  //   value: hasInjury ? "Yes" : "No" 
                  // });

                  // Determine injury happened value

                  const injuryValue = getInjuryHappenedFromClassification(outputValues);
                  setFieldValue('injuryHappened', injuryValue);
                  setInjuryHappened({ label: injuryValue, value: injuryValue });
                  setFieldTouched('incidentClassification', true);
                }}
                outputFormat="string"
                onBlur={(e) => {setFieldTouched('incidentClassification', true);handleBlur(e)}}
                enableSelectAll={true}
                errors={errors.incidentClassification}
                touched={touched.incidentClassification}
              />
            </div>

            {/* HIPO Case */}
            <div className="col-md-3">
              <SelectField
                  label="HiPo"
                  disabled={readOnly}
                  required={true}
                  value={[{label: values.hipoCase, value: values.hipoCase}]}
                  name="hipoCase"
                  placeholder="HiPo Case"
                  options={yesNoSelector}
                  onChange={(selectedOption: SelectOptions) => {
                    setFieldValue("hipoCase", selectedOption.value);
                    setFieldTouched('hipoCase', true);
                  }}
                  onBlur={(e) => {setFieldTouched('hipoCase', true);handleBlur(e)}}
                  errors={touched.hipoCase && errors.hipoCase}
                  touched={touched.hipoCase}
                />
            </div>

            {/* Injury Happened */}
            <div className="col-md-3">
              <SelectField
                label="Injury Happened"
                value={[{ label: injuryHappened.value, value: injuryHappened.value }]}
                disabled={true}
                required={true}
                name="injuryHappened"
                placeholder="Select"
                options={yesNoSelector}
                // onChange={() => { setFieldTouched('injuryHappened', true); }}
                onChange={() => {}}
                onBlur={(e) => {setFieldTouched('injuryHappened', true);handleBlur(e)}}
                errors={touched.injuryHappened && errors.injuryHappened}
                touched={touched.injuryHappened}
              />
            </div>

            {/* Incident Category */}
            <div className="col-md-3">
                <SelectField
                  label="Incident Category"
                  required={true}
                  disabled={readOnly}
                  value={[{label: values.incidentCategory, value: values.incidentCategory}]}
                  name="incidentCategory"
                  placeholder="Select Category"
                  options={incidentCategoryOptions}
                  onChange={(selectedOption: SelectOptions) => {
                    setFieldValue("incidentCategory", selectedOption.value);
                    setFieldTouched('incidentCategory', true);
                  }}
                  onBlur={(e) => {setFieldTouched('incidentCategory', true);handleBlur(e)}}
                  errors={touched.incidentCategory && errors.incidentCategory}
                  touched={touched.incidentCategory}
                />
            </div>

            {/* Tier */}
            <div className="col-md-3">
              {displayTierField &&                
                  <SelectField
                    label="Tier"
                    disabled={readOnly}
                    value={[{label: values.tier, value: values.tier}]}
                    name="tier"
                    placeholder="Select Tier"
                    options={incidentTierOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("tier", selectedOption.value);
                      setFieldTouched('tier', true);
                    }}                    
                    onBlur={(e) => {setFieldTouched('tier', true);handleBlur(e)}}
                    required={values.incidentClassification?.includes("Process Safety")}
                    errors={touched.tier && errors.tier}
                    touched={touched.tier}
                  />}
            </div>
          </div>

          {/* Auto-submit if currentStatus is 1 */}
          {/* {currentStatus === 1 ? (
            <AutoSubmitTrigger />
          ) : (
            <Button
              color="primary"
              varient="bordered"
              radius="sm"
              type="submit"
              size="sm"
            >
              Update
            </Button>
          )} */}
          { !readOnly && <button
            className="iconBtn green v2 ms-0"
            type="submit"
            disabled={values.incidentClassification.length === 0 || !values.hipoCase || !values.injuryHappened || !values.incidentCategory || (displayTierField && !values.tier)}
            title={`${values.incidentClassification.length === 0 ? "Please select at least one Preliminary Classification" : !values.hipoCase ? "Please select HiPo Case" : !values.injuryHappened ? "Please select if Injury Happened" : !values.incidentCategory ? "Please select Incident Category" : (displayTierField && !values.tier) ? "Please select Tier" : "Save & Next" }`}
          >
            <span>Save & Next</span>
          </button>}
          </div>
        </form>
      )}
    </Formik>
  );
};

export default PreliminaryClassificationEdit;
