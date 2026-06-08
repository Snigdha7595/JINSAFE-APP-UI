import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import SelectField from "@/components/Form/SelectFields";
import InputField from "@/components/Form/InputField";

import { emptySelector } from "@/config/config";
import { AutoSubmitTrigger } from "./AutoSubmitTrigger";
import Button from "@/components/Elements/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";



const PirSubmit = ({
 readOnly,
 pirData, 
 pirSubmitData,
 setPirSubmitData,
 setPirData,
 currentStatus,
 setCurrentStatus,
 setOpenSection,
 pirSubmittedBy
}:any) => {
  const { user } = useSelector((state: RootState) => state.auth) as { user: any };
  const initialValues = {
  };

  const validationSchema = Yup.object().shape({
   
  });

  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
       console.log("PIR submitted section values", values);
        setPirSubmitData(values);
        setPirData((prevData: any) => ({...prevData, ...values}))
        setCurrentStatus(1);
        setOpenSection(1);
      }}
    >
      {({
        values,
        handleChange,
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
                  label="Submitted By"
                  value={pirSubmittedBy}
                  name="pirSubmittedBy"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                  disabled={readOnly}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Designation"
                  value={{label: pirData.designationName, value: pirData.designationName}}
                  disabled={readOnly || true}
                  name="designationName"
                  placeholder=""
                  options={[...emptySelector]}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
            </div>
          </div>
          {currentStatus == 5 ?
           <AutoSubmitTrigger /> :
           (!readOnly && <Button
                  color="primary"
                  varient="bordered"
                  radius="sm"
                  type="submit"
                  size="sm"
                //isDisabled={disabled}
                >
                  Update
                </Button>)
          }
        </form>
      )}
    </Formik>
  );
};

export default PirSubmit;
