import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import SelectField from "@/components/Form/SelectFields";
import { emptySelector } from "@/config/config";
import { SelectOptions } from "@/components/interfaces";
import { serverRequest } from "@/services/getServerSideRender";
import { GET_INCIDENT_CATEGORY } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import InputField from "@/components/Form/InputField";
// import TextareaField from "@/components/Form/TextareaField";
// import { restrictAlphabets, restrictSpecialCharactersExceptHyphen } from "@/config/globalUtils";

const getInjuryHappenedFromClassification = (
  classification: string
): "Yes" | "No" => {
  const triggers = [
    "Fatality",
    "Lost Time Case",
    "Restricted Workday Cases",
    "Medical Treatment Cases",
    "First-Aid Cases",
  ];
  return triggers.some((t) => classification.includes(t)) ? "Yes" : "No";
};

const IncidentDetails = ({
  readOnly,
  preliminaryData,
  setPreliminaryData,
  prelimClassificOptions,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  pirData,
  saData,
  setPirData,
  setSaData,
}: any) => {
  const token = useSelector(selectUserToken);
  // const personInjuredRef = useRef<HTMLInputElement | null>(null);
  // const incidentDescRef = useRef<HTMLTextAreaElement | null>(null);
  const [incidentCategoryOptions, setIncidentCategoryOptions] =
    useState<SelectOptions[]>(emptySelector);
  const initialValues = {
    whatHappened: pirData?.whatHappened || saData?.whatHappened || "",
    personInjured: pirData?.personInjured || saData?.personInjured || "",
    remark: pirData?.remarks || saData?.remarks || "",
    preliminaryFindings: pirData?.preliminaryFindings|| saData?.preliminaryFindings || "",
    incidentClassification: pirData?.incidentClassification || "",
    incidentCategory: pirData?.incidentCategory || "",
  };

  useEffect(() => {
    if (initialValues.incidentClassification) {
      const derivedValue = getInjuryHappenedFromClassification(
        initialValues.incidentClassification
      );
      setPirData((prev: any) => ({
        ...prev,
        injuryHappened: prev?.injuryHappened || derivedValue,
      }));
    }
    const hasProcessSafety =
      initialValues.incidentClassification?.includes("Process Safety");
    fetchIncidentCategory(hasProcessSafety);
  }, [initialValues.incidentClassification]);

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
    whatHappened: Yup.string().required("Required"),
    preliminaryFindings: Yup.string().required("required"),
    incidentClassification: Yup.string().required("Required"),
    incidentCategory: Yup.string().required("Required"),
  });

  // const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
  //   restrictAlphabets(event.nativeEvent, ref, isMob);
  // };

  // const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  // };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
        const updatedPirData = {
          ...pirData,
          ...values,
          // Ensure these are included in the update
          whatHappened: values.whatHappened,
          preliminaryFindings: values.preliminaryFindings,
          incidentClassification: values.incidentClassification,
          incidentCategory: values.incidentCategory
        };
        
        setPirData(updatedPirData);
        
        // Immediately transform to SA payload
        const updatedSaData = {
          ...saData,
          whatHappened: values.whatHappened,
          preliminaryFindings: values.preliminaryFindings,
          incidentClassification: values.incidentClassification,
          processSafetyIncidentCategory: values.incidentCategory,
          // personInjured: values.personInjured,
          // remarks: values.remark
        };
        setSaData(updatedSaData);

        setCurrentStatus(2);
        setOpenSection(2);
      }}
    >
      {({
        values,
        handleBlur,
        handleSubmit,
        setFieldValue,
        touched,
        errors,
      }) => (
        <form onSubmit={handleSubmit}>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="Preliminary Classification"
                  value={values.incidentClassification}
                  disabled={readOnly || true}
                  name="incidentClassification"
                  placeholder=""
                  errors={touched.incidentClassification && errors.incidentClassification}
                  touched={touched.incidentClassification}
                  onBlur={handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue("incidentClassification", e.target.value);
                    // Update category options when classification changes
                    const hasProcessSafety = e.target.value.includes("Process Safety");
                    fetchIncidentCategory(hasProcessSafety);
                  }}
                  maxLength={50}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Incident Category"
                  disabled={readOnly || true}
                  value={[
                    {
                      label: values.incidentCategory,
                      value: values.incidentCategory,
                    },
                  ]}
                  name="incidentCategory"
                  placeholder="Select Category"
                  options={incidentCategoryOptions}
                  onChange={(selectedOption: SelectOptions) => {
                    setFieldValue("incidentCategory", selectedOption.value);
                  }}
                  onBlur={handleBlur}
                  errors={touched.incidentCategory && errors.incidentCategory}
                />
              </div>
              {/* <div className="col-12 col-md-6 col-lg-6">
                <InputField 
                  type="text"
                  disabled={readOnly || true}
                  label="No. of Persons injured" 
                  value={values.personInjured} 
                  name="personInjured" 
                  placeholder="Count of Persons" 
                  errors={errors.personInjured} 
                  touched={touched.personInjured} 
                  onChange={handleChange} 
                  onBlur={handleBlur} 
                  reference={personInjuredRef} 
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, personInjuredRef, false)}
                  maxLength={6} 
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <TextareaField 
                  label="Incident Description"
                  name="remark" 
                  disabled={readOnly || true}
                  placeholder="Description..." 
                  reference={incidentDescRef} 
                  value={values.remark} 
                  onBlur={() => {}}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    const { name, value } = e.target;
                    setFieldValue(name, value);
                  }} 
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => restrictTextArea(e)} 
                  errors={errors.remark} 
                  touched={touched.remark} 
                />
              </div> */}
              <div className="col-12">
                <InputField
                  type="text"
                  label="What Happened"
                  value={values.whatHappened}
                  name="whatHappened"
                  disabled={readOnly}
                  placeholder="(Max. 300 characters)"
                  errors={touched.whatHappened && errors.whatHappened}
                  touched={touched.whatHappened}
                  onBlur={handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue("whatHappened", e.target.value);
                  }}
                  maxLength={300}
                />
              </div>
              <div className="col-12">
                <InputField
                  type="text"
                  label="Preliminary Findings"
                  value={values.preliminaryFindings}
                  name="preliminaryFindings"
                  disabled={readOnly}
                  placeholder=" (Max. 300 characters)"
                  errors={touched.preliminaryFindings && errors.preliminaryFindings}
                  touched={touched.preliminaryFindings}
                  onBlur={handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue("preliminaryFindings", e.target.value);
                  }}
                  maxLength={300}
                />
              </div>
            </div>
            {!readOnly && <button className="iconBtn green v2 ms-0" type="submit">
              <span>Save & Next</span>
            </button>}
          </div>
        </form>
      )}
    </Formik>
  );
};

export default IncidentDetails;
