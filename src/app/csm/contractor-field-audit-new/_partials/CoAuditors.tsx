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
import { ToastContainer, toast } from "react-toastify";

interface CoAuditorsDataInterface {
  csfaNo: string;
  types: string;
  email: string;
  name: string;
  mobile: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  id?: number;
  rowIndex?: number;
}

interface CoAuditorsInterface {
  coAuditorsData: CoAuditorsDataInterface;
  setCoAuditorsData: React.Dispatch<
    React.SetStateAction<CoAuditorsDataInterface>
  >;
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  csfaData: any;
  setCSFAData: any;
}

const CoAuditors = ({
  coAuditorsData,
  setCoAuditorsData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  csfaData,
  setCSFAData
}: CoAuditorsInterface) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const mobileRef = useRef<HTMLInputElement | null>(null);
  
  const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };
  const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement>) => {
      restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  };

  const initialValues = {
    csfaNo: csfaData?.csfaNo || coAuditorsData?.csfaNo || "",
    types: csfaData?.types || coAuditorsData?.types || "Internal",
    name: csfaData?.name || coAuditorsData?.name || "",
    email: csfaData?.email || coAuditorsData?.email || "",
    mobile: csfaData?.mobile || coAuditorsData?.mobile || "",
    // coAuditors: (csfaData?.coAuditors || coAuditorsData?.coAuditors || []).map((auditor: any) => ({
    // ...auditor,
    // createdAt: auditor.createdAt || new Date().toISOString().split("T")[0],
    // createdBy: auditor.createdBy || user?.createdBy || "",
    // updatedAt: auditor.updatedAt || new Date().toISOString().split("T")[0],
    // updatedBy: auditor.updatedBy || user?.createdBy || "",
    // })),
    coAuditors: csfaData?.coAuditors || coAuditorsData?.coAuditors || [],
    createdAt: new Date().toISOString().split("T")[0],
    createdBy: user?.createdBy || "",
    updatedAt: new Date().toISOString().split("T")[0],
    updatedBy: user?.createdBy || ""
   };

  const singlecoAuditorschema = Yup.object().shape({
    types: Yup.string().trim().required("Type is required"),
    name: Yup.string().trim().required("Name is required"),
    email: Yup.string()
      .trim()
      .email("Invalid email")
      .required("Email is required"),
    mobile: Yup.string()
      .trim()
      .matches(/^[0-9]{10}$/, "Mobile must be 10 digits")
      .required("Mobile is required"),
  });

  const coAuditorsTypeOptions = [
    { value: "External", label: "External" },
    { value: "Internal", label: "Internal" },
  ];
  const fetchDetailByMail = async (mailid: string, setFieldValue: Function, values: any) => {
    try {
      if (values?.types === "Internal") {
        const response = await serverRequest(
          {},
          FETCH_DETAILS_FROM_MAIL + `/email/${mailid}`,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );
      
        if (response?.empEmail != null) {
          setFieldValue("name", response?.empName || "");
          setFieldValue("mobile", response?.empMobile || "");
          setFieldValue("email", response?.empEmail || "");
        }
        //  else {
        //   setFieldValue("name", "");
        //   setFieldValue("mobile", "");
        //   setFieldValue("email", "");
        // }
      }
      //  else {
      //   setFieldValue("name", "");
      //   setFieldValue("mobile", "");
      //   setFieldValue("email", "");
      // }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <>
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={(values) => {
          const expectedCount = Number(csfaData?.noOfCoauditor) || 0;
          if (values.coAuditors.length !== expectedCount) {
            toast.warn(
              "Please add exact " + expectedCount + " no. of co-auditors"
            );
            return;
          }
          // Validate entire array
          // Yup.array()
          //   .of(singlecoAuditorschema)
          //   .validate(values.coAuditors, { abortEarly: false });

          const normalizedCoAuditors = values.coAuditors.map((auditor: any) => ({
            ...auditor,
            createdAt: auditor.createdAt || new Date().toISOString().split("T")[0],
            createdBy: auditor.createdBy || user?.createdBy || "",
            updatedAt: new Date().toISOString().split("T")[0],
            updatedBy: user?.createdBy || "",
            rowIndex: auditor.rowIndex || 0,
            id: auditor.id || 0,
            csfaNo: csfaData?.csfaNo || "",
          }));

          let setIndex = 2;
          setCSFAData((prevcsfaData: any) => ({
          ...prevcsfaData,
          ...(prevcsfaData?.objectId && { objectId: prevcsfaData.objectId }),
          coAuditors: normalizedCoAuditors,
          accordionIndex: setIndex,
          }));
          // console.log("coAuditors-",JSON.stringify(csfaData));
          console.log("coAuditors-",JSON.stringify(normalizedCoAuditors));
          setCoAuditorsData(normalizedCoAuditors);
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
        const isCoAuditorsFormComplete =
        !!values.types?.trim() &&
        !!values.name?.trim() &&
        // !!values.email?.trim() &&
        !!values.mobile?.trim();

        const isCoAuditorLimitReached =
          values.coAuditors?.length >= Number(csfaData?.noOfCoauditor);

        // const handleAddCoAuditor = async() => {
        //   await singlecoAuditorschema.validate(values, { abortEarly: false });

        //   if (isCoAuditorLimitReached) {
        //     //toast.error("You can add only mentioned no. of co-observers.");
        //     toast.warn("You can add maximum " + Number(csfaData?.noOfCoauditor) + " no. of co-auditors.");
        //     return;
        //   }

        //   if (!isCoAuditorsFormComplete) {
        //     //toast.error("Please fill all fields");
        //     toast.warn("Please fill all fields");
        //     return;
        //   }

        //   setFieldValue("coAuditors", [
        //     ...values.coAuditors,
        //     {
        //       types: values.types,
        //       name: values.name,
        //       email: values.email,
        //       mobile: values.mobile,
        //       createdAt: new Date().toISOString().split("T")[0],
        //       createdBy: user?.createdBy || "",
        //       updatedAt: new Date().toISOString().split("T")[0],
        //       updatedBy: user?.createdBy || ""
        //     },
        //   ]);
        //   setFieldValue("name", "");
        //   setFieldValue("email", "");
        //   setFieldValue("mobile", "");
        // };
        const handleAddCoAuditor = async () => {
            try {
              await singlecoAuditorschema.validate(
                {
                  types: values.types,
                  name: values.name,
                  email: values.email,
                  mobile: values.mobile,
                },
                { abortEarly: false }
              );

              if (isCoAuditorLimitReached) {
                toast.warn(
                  "You can add maximum " +
                    Number(csfaData?.noOfCoauditor) +
                    " no. of co-auditors."
                );
                return;
              }

              setFieldValue("coAuditors", [
                ...values.coAuditors,
                {
                  types: values.types,
                  name: values.name,
                  email: values.email,
                  mobile: values.mobile,
                  createdAt: new Date().toISOString().split("T")[0],
                  createdBy: user?.createdBy || "",
                  updatedAt: new Date().toISOString().split("T")[0],
                  updatedBy: user?.createdBy || "",
                },
              ]);

              setFieldValue("name", "");
              setFieldValue("email", "");
              setFieldValue("mobile", "");
            } catch (err: any) {
              if (err.inner) {
                err.inner.forEach((error: any) => {
                  toast.warn(error.message);
                });
              } else {
                toast.warn(err.message);
              }
            }
          };
        return (
          <form onSubmit={handleSubmit}>
            <div className="filters">
              <div className="row form_grider d1">
                <div className="col-md-2">
                  <SelectField
                    label="Type"
                    value={[
                      {
                        label: values.types,
                        value: values.types,
                      },
                    ]}
                    name="types"
                    placeholder="Select"
                    options={coAuditorsTypeOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("types", selectedOption.value);
                    }}
                    onBlur={handleBlur}
                    errors={touched.types && errors.types}
                  />
                </div>
                <div className="col-md-3">
                  <InputField
                    type="email"
                    label="Email"
                    value={values.email}
                    name="email"
                    placeholder="example@domain.com"
                    onChange={handleChange}
                    onBlur={(e) => {
                      handleBlur(e);
                      fetchDetailByMail(e.target.value, setFieldValue, values); // 🔁 Pass everything
                    }}
                    maxLength={50}
                    errors={errors.email}                    
                    touched={touched.email}
                  />
                </div>
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="Name of Employee"
                    value={values.name}
                    name="name"
                    placeholder="Name of Employee"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={500}
                    errors={errors.name}
                    touched={touched.name}
                  />
                </div>
                <div className="col-md-2">
                  <InputField
                    type="text"
                    label="Mobile"
                    value={values.mobile}
                    name="mobile"
                    placeholder="Mobile"
                    touched={touched.mobile}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    reference={mobileRef} 
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, mobileRef, true)} 
                    maxLength={15}
                    errors={touched.mobile && errors.mobile}
                  />
                </div>
                <div className="col-md-2 justify-content-end align-self-center">
                  <button
                      className="iconBtn orange"
                      type="button"
                      // title={!isCoAuditorsFormComplete ? "Please fill all fields" : ""}
                      // disabled={!isCoAuditorsFormComplete}
                      onClick={handleAddCoAuditor}
                    >
                      <img
                        width="15"
                        height="15"
                        alt="icon"
                        src="/images/svg/plus.svg"
                        className="img-fluid u-image"
                      />
                      <span>Add</span>
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
                            {values.coAuditors?.length > 0 ? (
                              values.coAuditors.map((row, index) => (
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
                                          ...values.coAuditors,
                                        ];
                                        updated.splice(index, 1);
                                        setFieldValue("coAuditors", updated);
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
                                  No Co-Auditors added yet
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
    <ToastContainer position="top-right" autoClose={2000} 
                      hideProgressBar={false} closeOnClick pauseOnHover />
   </>
  );
};

export default CoAuditors;
