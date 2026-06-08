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
import { restrictAlphabets, restrictSpecialCharactersExceptHyphen } from "@/config/globalUtils";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { FETCH_DETAILS_FROM_MAIL } from "@/config/apiConfig";
interface CoObserversDataInterface {
  coObserverType: string;
  coObserverEmail: string;
  coObserverName: string;
  coObserverMobile: string;
}

interface CoObserversInterface {
  coObserverData: CoObserversDataInterface;
  setCoObserverData: React.Dispatch<
    React.SetStateAction<CoObserversDataInterface>
  >;
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  siData: any;
  setSIData: any;
}

const CoObservers = ({
  coObserverData,
  setCoObserverData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  siData,
  setSIData,
}: CoObserversInterface) => {
  const token = useSelector(selectUserToken);
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [coObserverName, setCoObserverName] = useState("");
  const [coObserverType, setCoObserverType] = useState(null);
  const [coObserverEmail, setCoObserverEmail] = useState("");
  const [coObserverMobile, setCoObserverMobile] = useState("");

  const coObserverMobileRef = useRef<HTMLInputElement | null>(null);
  
  const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };
  const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement>) => {
      restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  };

  const initialValues = {
    coObserverType:
      siData?.coObserverType || coObserverData?.coObserverType || "Internal",
    coObserverEmail:
      siData?.coObserverEmail || coObserverData?.coObserverEmail || "",
    coObserverName:
      siData?.coObserverName || coObserverData?.coObserverName || "",
    coObserverMobile:
      siData?.coObserverMobile || coObserverData?.coObserverMobile || "",
    coObservers: siData?.coObservers || [],
  };

  const singleCoObserverSchema = Yup.object().shape({
    coObserverType: Yup.string().required("Type is required"),
    coObserverEmail: Yup.string()
                .email("Invalid email format")
                .required("Email is required"),
    coObserverName: Yup.string().required("Name is required"),
    coObserverMobile: Yup.string()
                    .transform((value) => (value === "" ? null : value)) // allow empty
                    .matches(
                      /^[6-9]\d{9}$/,
                      "Invalid mobile number format"
                    )
                    .nullable()
                    .notRequired(),
  });

  // Not Working code -- Use alternate validation at OnSubmit
  // const validationSchema = Yup.object().shape({
  //   coObservers: Yup.array()
  //     .of(
  //       Yup.object().shape({
  //         name: Yup.string().required(),
  //         email: Yup.string().email().required(),
  //         mobile: Yup.string().matches(/^[6-9]\d{9}$/).notRequired(),
  //         types: Yup.string().required(),
  //       })
  //     )
  //     .test(
  //       "match-count",
  //       "Please add the required number of co-observers",
  //       function (value) {
  //         const expectedCount = this.options.context?.noOfCoobserver || 0;
  //         console.log("expectedCount", expectedCount);
  //         console.log("value", value);
  //         return value?.length === Number(expectedCount);
  //       }
  //     ),
  // });

  const coObserverTypeOptions = [
    { value: "External", label: "External" },
    { value: "Internal", label: "Internal" },
  ];
  const fetchDetailByMail = async (mailid: string, setFieldValue: Function, values: any) => {
    try {
      if (values?.coObserverType === "Internal") {
        const response = await serverRequest(
          {},
          FETCH_DETAILS_FROM_MAIL + `/email/${mailid}`,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );
      
        if (response?.empEmail != null) {
          setFieldValue("coObserverName", response?.empName || "");
          setFieldValue("coObserverMobile", response?.empMobile || "");
        } else {
          setFieldValue("coObserverName", "");
          setFieldValue("coObserverMobile", "");
        }
      } else {
        setFieldValue("coObserverName", "");
        setFieldValue("coObserverMobile", "");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={(values) => {
          if(values.coObservers?.length != Number(siData?.noOfCoobserver)) {           
            alert("Please add exact " + Number(siData?.noOfCoobserver) + " no. of co-observers");
            return;
          }
          let setIndex = 2;
          setSIData((prevsiData: any) => ({
            ...prevsiData,
            // Ensure these additional fields are maintained if they exist
            ...(prevsiData?.objectId && { objectId: prevsiData.objectId }),
            ...(prevsiData?.scheduleId && { scheduleId: prevsiData.scheduleId }),
            coObservers: values.coObservers,
            accordionIndex: setIndex,
          }));

          setCoObserverData(values.coObservers);
          setCurrentStatus(setIndex);
          setOpenSection(setIndex);
        }
      }
    >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        touched,
        errors,
      }) => {
        //Any helper logic put here...
        const isCoObserverFormComplete =
        !!values.coObserverType?.trim() &&
        !!values.coObserverName?.trim() &&
        !!values.coObserverEmail?.trim();

        const isCoObserverLimitReached =
          values.coObservers?.length >= Number(siData?.noOfCoobserver);

        const handleAddCoObserver = async() => {
          await singleCoObserverSchema.validate(values, { abortEarly: false });

          if (isCoObserverLimitReached) {
            //toast.error("You can add only mentioned no. of co-observers.");
            alert("You can add maximum " + Number(siData?.noOfCoobserver) + " no. of co-observers.");
            return;
          }

          if (!isCoObserverFormComplete) {
            //toast.error("Please fill all fields");
            alert("Please fill all fields");
            return;
          }

          setFieldValue("coObservers", [
            ...values.coObservers,
            {
              name: values.coObserverName,
              types: values.coObserverType,
              email: values.coObserverEmail,
              mobile: values.coObserverMobile
            },
          ]);
          
          setFieldValue("coObserverName", "");
          setFieldValue("coObserverEmail", "");
          setFieldValue("coObserverMobile", "");
        };
        return (
          <form onSubmit={handleSubmit}>
            <div className="filters">
              <div className="row form_grider d1">
                {/* coObserverType */}
                <div className="col-md-2">
                  <SelectField
                    label="Type"
                    // value={values.coObserverType}
                    value={[
                      {
                        label: values.coObserverType,
                        value: values.coObserverType,
                      },
                    ]}
                    name="coObserverType"
                    placeholder="Select"
                    options={coObserverTypeOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("coObserverType", selectedOption.value);
                    }}
                    onBlur={handleBlur}
                    errors={touched.coObserverType && errors.coObserverType}
                  />
                </div>

                {/* Email */}
                <div className="col-md-3">
                  <InputField
                    type="email"
                    label="Email"
                    value={values.coObserverEmail}
                    name="coObserverEmail"
                    placeholder="example@domain.com"
                    onChange={handleChange}
                    onBlur={(e) => {
                      handleBlur(e);
                      fetchDetailByMail(e.target.value, setFieldValue, values); // 🔁 Pass everything
                    }}
                    maxLength={50}
                    errors={errors.coObserverEmail}                    
                    touched={touched.coObserverEmail}
                  />
                </div>

                {/* Name of Observer */}
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="Name of Employee"
                    value={values.coObserverName}
                    name="coObserverName"
                    placeholder="Name of Employee"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={500}
                    errors={errors.coObserverName}
                    touched={touched.coObserverName}
                  />
                </div>
                {/* Co-Observer Mobile */}
                <div className="col-md-2">
                  <InputField
                    type="text"
                    label="Mobile"
                    value={values.coObserverMobile}
                    name="coObserverMobile"
                    placeholder="Mobile"
                    touched={touched.coObserverMobile}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    reference={coObserverMobileRef} 
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, coObserverMobileRef, true)} 
                    maxLength={15}
                    errors={touched.coObserverMobile && errors.coObserverMobile}
                  />
                </div>
                <div className="col-md-2 justify-content-end align-self-center">
                  <button
                      className="iconBtn orange"
                      type="button"
                      title={!isCoObserverFormComplete ? "Please fill all fields" : ""}
                      disabled={!isCoObserverFormComplete}
                      onClick={handleAddCoObserver}
                    >
                      <img
                        width="15"
                        height="15"
                        alt="icon"
                        src="/images/svg/plus.svg"
                        className="img-fluid u-image"
                      />
                      <span>Add Co-observer</span>
                  </button>
                </div>
              </div>
              <div className="pb-4">
                <div className="admin-boxContainer d1 ">
                  <div className="row">
                    <div className="col-12">
                      <div className="admin-table d3 table-responsive noHover">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Email</th>
                              <th>Name of Employee</th>
                              <th>Mobile Number</th>
                              <th style={{ width: 120 }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {values.coObservers?.length > 0 ? (
                              values.coObservers.map((row, index) => (
                                <tr key={index}>
                                  <td>{row.types}</td>
                                  <td>{row.email}</td>
                                  <td>{row.name}</td>
                                  <td>{row.mobile}</td>
                                  <td>
                                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <button
                                      className="tableBtn"
                                      type="button"
                                      onClick={() => {
                                        const updated = [
                                          ...values.coObservers,
                                        ];
                                        updated.splice(index, 1);
                                        setFieldValue("coObservers", updated);
                                      }}
                                    >
                                      <img
                                        width="20"
                                        height="20"
                                        alt="icon"
                                        style={{
                                          filter:
                                            "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                        }}
                                        src="/images/svg/icons/Delete.svg"
                                      />
                                    </button>
                                   </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="text-center">
                                  No co-observers added yet
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              {<button className="iconBtn green v2 ms-0" type="submit">
                <span>Save & Next</span>
              </button>}
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default CoObservers;
