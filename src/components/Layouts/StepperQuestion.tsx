import React, { useState } from "react";
import Link from "next/link";
import TextareaField from "@/components/Form/TextareaField";

// Sample step data
const steps = [
  {
    id: 1,
    label: "STEP 1 of 6",
    question:
      "Observe, decide how to approach the employee, stop the unseen act(safety).",
  },
  {
    id: 2,
    label: "STEP 2 of 6",
    question: "Engage with the employee and listen actively.",
  },
  {
    id: 3,
    label: "STEP 3 of 6",
    question: "Appreciate and encourage positive behavior.",
  },
  {
    id: 4,
    label: "STEP 4 of 6",
    question: "Guide and correct unsafe behavior constructively.",
  },
  {
    id: 5,
    label: "STEP 5 of 6",
    question: "Get commitment for future safe behavior.",
  },
  {
    id: 6,
    label: "STEP 6 of 6",
    question: "Follow-up and record the interaction.",
  },
];

const StepperQuestion: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState("");

  const handleResponseChange = (stepId: number, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [stepId]: value,
    }));
    setTouched(true);
    if (value.length < 10) {
      setErrors("Minimum 10 characters required");
    } else {
      setErrors("");
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePreview = () => {
    console.log("Collected Responses:", responses);
    alert("Preview logic triggered. Check console.");
  };

  return (
    <div className="filters">
      <div className="d-flex justify-content-center fw-bold">
        Safety Interaction Six Steps Process
      </div>

      <div className="d-flex justify-content-center my-4 ">
        <div className="step-buttons d-flex flex-wrap gap-2 justify-content-center">
          {steps.map((step) => (
            <button
              key={step.id}
              className={`step-btn px-4 py-2 rounded fw-bold ${
                currentStep === step.id ? "active-step" : ""
              }`}
              onClick={() => setCurrentStep(step.id)}
            >
              {step.id}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .step-btn {
          font-size: 1.1rem;
          min-width: 50px;
          height: 50px;
          background-color: #6c757d; /* orange */
          color: white;
          border: none;
          transition: background-color 0.3s ease-in-out;
        }

        .step-btn:hover {
          background-color: #fd7e14; /* grey */
        }

        .active-step {
          box-shadow: 0 0 0 3px #fd7e14; /* subtle focus */
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
        <p className="fw-bold">
          {steps[currentStep - 1].label}: {steps[currentStep - 1].question}
        </p>
      </div>

      <div className="d-flex justify-content-center my-4 gap-2">
        <button
          className="iconBtn grey w100 gap-1"
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
          className="iconBtn green w100 gap-2"
          onClick={() => console.log(`Skipped Step ${currentStep}`)}
        >
          <img
            width="20"
            height="20"
            alt="Skip"
            src="/images/svg/icons/Skip.svg"
            className="white-icon"
          />
          <span>Skipped This Step</span>
        </button>

        <button className="iconBtn green w100 gap-2" onClick={handleNext}>
          <img
            width="20"
            height="20"
            alt="Done"
            src="/images/svg/icons/Submit.svg"
            className="white-icon"
          />
          <span>Done This Step</span>
        </button>
      </div>

      <div className="d-flex justify-content-center my-2">
        <span>** Acknowledge all steps to preview Submission.</span>
      </div>

      <TextareaField
        name={`step-${currentStep}-comment`}
        placeholder="General Comments"
        value={responses[currentStep] || ""}
        onChange={(e) => handleResponseChange(currentStep, e.target.value)}
        touched={touched}
        errors={errors}
        maxLength={1300}
        disabled={false}
        onKeyDown={(e) => console.log(e.key)}
        customClass="my-extra-padding"
        onBlur={() => {}}
      />

      <div className="d-flex flex-row justify-content-center g-2 my-4 gap-2">
        <Link href="#">
          <button className="iconBtn grey w100 gap-2">
            <img
              width="20"
              height="20"
              alt="Cancel"
              src="/images/svg/icons/Cancel.svg"
              className="white-icon"
            />
            <span>Cancel</span>
          </button>
        </Link>

        <button className="iconBtn orange w100" onClick={handlePreview}>
          <img
            width="20"
            height="20"
            alt="ViewGraph"
            src="/images/svg/icons/Graph.svg"
            className="white-icon"
          />
          <span>Preview Before Submit</span>
        </button>
      </div>
    </div>
  );
};

export default StepperQuestion;
