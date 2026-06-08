import React from 'react';
import InputField from '@/components/Form/InputField';
import SelectField from '@/components/Form/SelectFields';


const InteractedPerson = ({
  formik,
  interactedEmployeeType,
  setInteractedEmployeeType,
  interactedEmail,
  setInteractedEmail,
  interactedEmployeeId,
  setInteractedEmployeeId,
  interactedName,
  setInteractedName,
  interactedDesignation,
  setInteractedDesignation,
  interactedDept,
  setInteractedDept,
  injuredEmployeeTypeOptions,
  addInteraction,
  closeModal
}) => {
  return (
    <div className="filters">
      <div className="row form_grider d1">
        <div className="col-12 col-md-4 col-lg-4">
          <SelectField
            label="Employee Type"
            value={interactedEmployeeType}
            name="interactedEmployeeType"
            placeholder=""
            options={injuredEmployeeTypeOptions}
            onChange={(selectedOption) => setInteractedEmployeeType(selectedOption)}
            onBlur={() => {}}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <InputField
            type="text"
            label="Email"
            onBlur={() => {}}
            value={interactedEmail}
            name="interactedEmail"
            placeholder=""
            onChange={(e) => setInteractedEmail(e.target.value)}
            maxLength={50}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <InputField
            type="text"
            label="Employee ID"
            value={interactedEmployeeId}
            name="interactedEmployeeId"
            placeholder=""
            onBlur={() => {}}
            onChange={(e) => setInteractedEmployeeId(e.target.value)}
            maxLength={30}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <InputField
            type="text"
            label="Name"
            value={interactedName}
            name="interactedName"
            onBlur={() => {}}
            placeholder=""
            onChange={(e) => setInteractedName(e.target.value)}
            maxLength={50}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <InputField
            type="text"
            label="Designation"
            value={interactedDesignation}
            name="interactedDesignation"
            onBlur={() => {}}
            placeholder=""
            onChange={(e) => setInteractedDesignation(e.target.value)}
            maxLength={50}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <InputField
            type="text"
            label="Department"
            value={interactedDept}
            name="interactedDept"
            onBlur={() => {}}
            placeholder=""
            onChange={(e) => setInteractedDept(e.target.value)}
            maxLength={50}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="btnWrapper">
            <button
              type="button"
              className="btnNoicon red"
              onClick={() => closeModal("AddInteractedSection")}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btnNoicon green"
              onClick={() => addInteraction(formik.values, formik.setFieldValue)}
            >
              Add Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractedPerson;