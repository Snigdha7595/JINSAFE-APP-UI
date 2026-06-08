"use client";
import React, { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import SelectField from "@/components/Form/SelectFields";
import { SelectOptions } from "@/components/interfaces";
import DatePickerField from "@/components/Form/DatePickerField";
import InputField from "@/components/Form/InputField";
import { emptySelector } from "@/config/config";
import { AutoSubmitTrigger } from "./AutoSubmitTrigger";
import Button from "@/components/Elements/Button";
import {
  restrictAlphabets,
  restrictSpecialCharactersExceptHyphen,
} from "@/config/globalUtils";

import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { FETCH_DETAILS_FROM_MAIL } from "@/config/apiConfig";
import { toast } from "react-toastify";
import { RootState } from "@/store/store";

interface SixStepsProcessDataInterface {
  steps: string;
  status: string;
  siNo: string;
  createdat: "";
  createdby: string;
  updatedat: "";
  updatedby: string;
  rowIndex: number;
}

interface SixStepsProcessInterface {
  sixStepsProcessData: SixStepsProcessDataInterface[];
  setSixStepsProcessData: React.Dispatch<React.SetStateAction<SixStepsProcessDataInterface[]>>;
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  siData: any;
  setSIData: any;
  setIsPreviewActive: any;
}

const SixStepsProcess = ({
  sixStepsProcessData,
  setSixStepsProcessData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  siData,
  setSIData,
  setIsPreviewActive
}: SixStepsProcessInterface) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
      (state: RootState) => state.auth as { user: any }
  );
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [generalComment, setGeneralComment] = useState("");
  const steps = [
    {
      id: 1,
      steps: "1",
      label: "STEP 1 of 6",
      question:
        "Observe, decide how to get the person’s attention, stop the unsafe act (safely).",
      isActive: true,
      status: "Pending",
    },
    {
      id: 2,
      steps: "2",
      label: "STEP 2 of 6",
      question: "Comment on what the employee was doing safely.",
      isActive: false,
      status: "Pending",
    },
    {
      id: 3,
      steps: "3",
      label: "STEP 3 of 6",
      question: "Discuss with the employee: possible consequences of the unsafe act and safer ways to do the job.",
      isActive: false,
      status: "Pending",
    },
    {
      id: 4,
      steps: "4",
      label: "STEP 4 of 6",
      question: "Get the employee’s agreement to work safely.",
      isActive: false,
      status: "Pending",
    },
    {
      id: 5,
      steps: "5",
      label: "STEP 5 of 6",
      question: "Discuss other safety issues of the job.",
      isActive: false,
      status: "Pending",
    },
    {
      id: 6,
      steps: "6",
      label: "STEP 6 of 6",
      question: "Thank the employee.",
      isActive: false,
      status: "Pending",
    },
  ];
  const [stepStatus, setStepStatus] = useState<{
    [key: number]: "Pending" | "Done" | "Skip";
  }>({});
  const [stepsData, setStepsData] = useState(siData?.steps || sixStepsProcessData || steps);
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState("");

  const initialValues = {
    steps: siData.steps.length > 0 ? siData.steps : sixStepsProcessData ? sixStepsProcessData : steps,
    generalComment: siData?.generalComment || "",
  };

  const validationSchema = Yup.object().shape({
    steps: Yup.string().required("Steps are required"),
  });
  const handleResponseChange = (stepId: number, value: string) => {
    setResponses((prev) => ({ ...prev, [stepId]: value }));
    setTouched(true);
    // setErrors(value.length < 10 ? "Minimum 10 characters required" : "");
  };
  
  const handlePreview = () => {
    const incompleteSteps = steps.filter((step) => !stepStatus[step.id]);
    if (incompleteSteps.length > 0) {
      alert(
        `Please complete all steps before previewing. Pending: ${incompleteSteps
          .map((s) => s.id)
          .join(", ")}`
      );
    }
  };
  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={(values) => {
        const completedSteps = values.steps.filter(
          (x) => x.status === "Done" || x.status === "Skip"
        );

        console.log(completedSteps);

        if (completedSteps.length === 6) {
          setSIData((prevsiData: any) => ({
            ...prevsiData,
            // Ensure these additional fields are maintained if they exist
            ...(prevsiData?.objectId && { objectId: prevsiData.objectId }),
            ...(prevsiData?.siId && { siId: prevsiData.siId }),
            steps: values.steps,
            generalComment: values.generalComment,
          }));
          // console.log("SI DATA-", siData);
          setSixStepsProcessData(values.steps);
          setIsPreviewActive(true);
        } else {
          toast.error("Please acknowledge all steps before previewing.");
        }
      }}
    >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        touched,
        errors
      }) => {
        //Any helper logic put here...
        const handleNext = () => {
          if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
          } else {
            setCurrentStep(7);
          }
        };
        const handleBack = () => {
          if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
          }
        };
        const handleDone = () => {
          if(currentStep <= 6)
          {
            let updated = values.steps.filter((entry) => entry.steps.toString() !== currentStep.toString());            
            const newStepsData = [
              ...updated,
              {
                steps: currentStep.toString(),
                status: "Done",
                siNo: "",
                createdat: dayjs().format("YYYY-MM-DD"),
                createdby: user.createdBy || "",
                updatedat: dayjs().format("YYYY-MM-DD"),
                updatedby: user.updatedBy || "",
                rowIndex: 0,
              },
            ];
            setSixStepsProcessData(newStepsData);
            setFieldValue("steps", newStepsData);
            handleNext();
          }
        };
        const handleSkip = () => {
          if(currentStep <= 6)
          {
            let updated = values.steps.filter((entry) => entry.steps.toString() !== currentStep.toString());
            const newStepsData = [
              ...updated,
              {
                steps: currentStep.toString(),
                status: "Skip",
                siNo: "",
                createdat: dayjs().format("YYYY-MM-DD"),
                createdby: user.createdBy || "",
                updatedat: dayjs().format("YYYY-MM-DD"),
                updatedby: user.updatedBy || "",
                rowIndex: 0,
              },
            ];
            setSixStepsProcessData(newStepsData);
            setFieldValue("steps", newStepsData);
            handleNext();
          }
        };
        
        return (
          <form onSubmit={handleSubmit}>
            <div className="filters">
              <div className="row form_grider d1">
                {/* Button section */}
                <div className="d-flex justify-content-center my-4 ">
                  <div className="step-buttons d-flex flex-wrap gap-2 justify-content-center">
                    {values?.steps?.sort((a, b) => a.steps - b.steps).map((step) => (
                      <button
                        type="button"
                        key={step.steps}
                        className={`step-btn px-4 py-2 rounded fw-bold
                          ${(currentStep === step.steps) ? "active-step" : ""}
                          ${(currentStep !== step.steps && step.status === "Done") ? "completed-step" : ""}
                          ${(currentStep !== step.steps && step.status === "Skip") ? "skipped-step" : ""}`}
                        onClick={() => setCurrentStep(parseInt(step.steps))}
                      >
                        {step.steps}
                      </button>
                    ))}
                  </div>
                </div>
                <style jsx>{`
                  .step-btn {
                    font-size: 1.1rem;
                    min-width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: 3px solid #f47920;
                    color: #f47920;
                    background-color: white;
                    font-weight: bold;
                    transition: all 0.3s ease;
                  }

                  .step-btn.active-step:hover {
                    background-color: #636466;
                    color: white;
                  }

                  .active-step {
                    background-color: #ffffff;
                    color: #636466;
                    border: 3px solid #636466;
                    box-shadow: none;
                  }

                  .completed-step {
                    background-color: #28a745;
                    color: white;
                    border: 3px solid #28a745;
                  }

                  .skipped-step {
                    background-color: #f47920;
                    color: white;
                    border: 3px solid #f47920;
                  }

                  @media (max-width: 576px) {
                    .step-btn {
                      min-width: 40px;
                      font-size: 1rem;
                      height: 45px;
                    }
                  }
                `}</style>
                <div className="d-flex justify-content-center mt-3">
                  {steps[currentStep - 1] && (
                  <p className="fw-bold">
                    {steps[currentStep - 1].label}:{" "}{steps[currentStep - 1].question}
                  </p>
                  )}
                  {currentStep == 7 && (<p className="fw-bold">All 6 steps acknowledged.</p>)}
                </div>

                <div className="d-flex justify-content-center my-4 gap-2">
                  <button
                    className="iconBtn grey w100 gap-1"
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                  >
                    <img
                      width="20"
                      height="20"
                      alt="Back"
                      src="/images/svg/icons/Left.svg"
                      className="white-icon"
                    />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    className="iconBtn green w100 gap-2"
                    disabled={currentStep === 7}
                    onClick={handleSkip}
                  >
                    <span>Skip This Step</span>
                    <img
                      width="20"
                      height="20"
                      alt="Skip"
                      src="/images/svg/icons/Skip.svg"
                      className="white-icon flipped-icon"
                    />
                  </button>

                  <button
                    type="button"
                    className="iconBtn green w100 gap-2"
                    disabled={currentStep === 7}
                    onClick={handleDone}
                  >
                    <span>Done This Step</span>
                    <img
                      width="20"
                      height="20"
                      alt="Done"
                      src="/images/svg/icons/Submit.svg"
                      className="white-icon"
                    />
                  </button>
                </div>
              </div>

              {/* General Comments */}
              <div className="d-flex justify-content-center my-2">
                <span>** Acknowledge all steps to preview Submission.</span>
              </div>
              <div className="row form_grider d1 g-2 my-0">
                <div className="col-12 col-sm-6 col-lg-12">
                  <InputField
                    type="text"
                    label="General Comments (Optional)"
                    value={values.generalComment}
                    name="generalComment"
                    placeholder="Fill any general comments here..."
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={500}
                    errors={errors.generalComment}
                    touched={touched.generalComment}
                  />
                </div>
              </div>
              {
                <button className="iconBtn green v2 ms-0" type="submit">
                  <span>Save & Preview</span>
                </button>
              }

              {/* {currentStatus == 0 ? (
                <AutoSubmitTrigger />
              ) : (
                <Button
                  color="primary"
                  varient="bordered"
                  radius="sm"
                  type="submit"
                  size="sm"
                  //isDisabled={disabled}
                >
                  Update
                </Button>
              )} */}
              {
                // <AutoSubmitTrigger />
                // <button className="iconBtn green v2 ms-0" type="submit">
                //   <span>Save</span>
                // </button>
              }
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default SixStepsProcess;
