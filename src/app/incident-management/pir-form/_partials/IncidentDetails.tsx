import React, { ChangeEvent, useRef, useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import InputField from "@/components/Form/InputField";
import { AutoSubmitTrigger } from "./AutoSubmitTrigger";
import Button from "@/components/Elements/Button";
import TextareaField from "@/components/Form/TextareaField";
import MultiFileUploader from "@/components/Form/MultiFileUploader";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { restrictAlphabets, restrictSpecialCharactersExceptHyphen } from "@/config/globalUtils";
import { DELETE_FILE } from "@/config/apiConfig";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { ToastContainer, toast } from "react-toastify";

const IncidentDetails = ({ readOnly, pirData, incidentData, setIncidentData, currentStatus, setCurrentStatus, setOpenSection, setPirData }: any) => {
    const token = useSelector(selectUserToken);
    const personInjuredRef = useRef<HTMLInputElement | null>(null);
    const incidentDescRef = useRef<HTMLTextAreaElement | null>(null);
    const whatHappenedRef = useRef<HTMLTextAreaElement | null>(null);
    const preliminaryFindingsDescRef = useRef<HTMLTextAreaElement | null>(null);
    const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

    const initialValues = {
    personInjured: pirData?.personInjured || incidentData?.personInjured || "",
    remark: pirData?.remark || incidentData?.remark || "",
    whatHappened: pirData?.whatHappened || incidentData?.whatHappened || "",
    preliminaryFindings: pirData?.preliminaryFindings || incidentData?.preliminaryFindings || "",    
    images:
      pirData?.images?.length > 0
        ? pirData.images
        : incidentData?.images?.length > 0
        ? incidentData.images
        : [
            {
              fileId: "",
              fileType: "",
              fileName: "",
              fileSize: "",
              fileThumbnail: "",
              createdAt: "",
              createdBy: pirData?.createdBy,
            },
          ],
  };

    const validationSchema = Yup.object({
    // personInjured: Yup.string().required("No. of Persons injured is required"),
    // personInjured:pirData?.injuryHappened === "Yes"
    //   ? Yup.number()
    //       .required("No. of Persons injured is required")
    //       .min(1, "At least 1 person should be injured")
    //   : Yup.number()
    //       .oneOf([0], "Must be 0 when no injury happened"),
    remark: Yup.string().required("Incident Description is required"),
    whatHappened: Yup.string().required("What Happened is required"),
    preliminaryFindings: Yup.string().required("Preliminary Findings is required"),
    images: Yup.array().of(
      Yup.object({
        fileId: Yup.string().required(),
        fileName: Yup.string().required(),
        fileType: Yup.string().required(),
        fileSize: Yup.string().required(),
        fileThumbnail: Yup.string(),
        createdAt: Yup.string(),
        createdBy: Yup.string(),
      }).required("Atleast one image is required")
    ),
  });

    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);
    const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement | null>, isMob: boolean) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };

  const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  };

  const handleImageChanges = (newImages: any[], deletedIds: string[]) => {
    // Update pending deletions
    setPendingDeletions(deletedIds);
    // Update form values without saving to session
    return newImages;
  };

  // useEffect(() => {
  // if (pirData?.injuryHappened === "No") {
  //   setFieldValue("personInjured", 0);
  // }
  // }, [pirData?.injuryHappened]);

  const handleSubmit = async (values: any) => {
    try {
      // Process pending deletions first
      if (pendingDeletions.length > 0) {
        await serverRequest(
        pendingDeletions,
        DELETE_FILE,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
      }

      // Prepare final values
      const finalValues = {
        ...values,
        images: values.images.filter((img: any) => !pendingDeletions.includes(img.fileId))
      };

      // Update state and storage
      setIncidentData(finalValues);
      setPirData((prevPirData: any) => ({...prevPirData, ...finalValues}));
      
      // Clear pending deletions
      setPendingDeletions([]);
      
      // Move to next step
      setCurrentStatus(pirData?.injuryHappened == "Yes"? 3: 4);
      setOpenSection(pirData?.injuryHappened == "Yes"? 3: 4);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <>
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, handleBlur, handleSubmit, setFieldTouched, setFieldValue, touched, errors }) => (
        <form onSubmit={handleSubmit}>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField 
                  type="number"
                  name="personInjured" 
                  placeholder="Count of Persons" 
                  required={true}
                  label="No. of Persons injured" 
                  value={pirData?.injuryHappened === "No" ? 0 : values.personInjured}
                  disabled={pirData?.injuryHappened === "No"}  // 👈 disable if No
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFieldValue(name, value);
                  }} 
                  onBlur={handleBlur} 
                  reference={personInjuredRef} 
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, personInjuredRef, false)}
                  maxLength={6} 
                  errors={touched.personInjured && errors.personInjured} 
                  touched={touched.personInjured}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <TextareaField 
                  label="Incident Description" 
                  name="remark" 
                  required={true}
                  disabled={readOnly}
                  placeholder="Description (Max. 300 characters)" 
                  reference={incidentDescRef} 
                  value={values.remark} 
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const { name, value } = e.target;
                    setFieldValue(name, value);
                    setFieldTouched('remark', true);
                  }}
                  onBlur={(e) => {setFieldTouched('remark', true);handleBlur(e)}}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => restrictTextArea(e)}
                  errors={touched.remark && errors.remark} 
                  touched={touched.remark}
                  maxLength={500}
                />
              </div>
               <div className="col-12 col-md-6 col-lg-6">
                <TextareaField
                  label="What Happened"
                  required={true}
                  value={values.whatHappened}
                  disabled={readOnly}
                  name="whatHappened"
                  placeholder="What Happened (Max. 300 characters)"
                  reference={whatHappenedRef}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const { name, value } = e.target;
                    setFieldValue(name, value);
                    setFieldTouched('whatHappened', true);
                  }}
                  onBlur={(e) => {setFieldTouched('whatHappened', true);handleBlur(e)}}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => restrictTextArea(e)}
                  maxLength={500}        
                  errors={touched.whatHappened && errors.whatHappened}
                  touched={touched.whatHappened}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <TextareaField
                  label="Preliminary Findings"
                  required={true}
                  value={values.preliminaryFindings}
                  disabled={readOnly}
                  name="preliminaryFindings"
                  placeholder="Preliminary Findings (Max. 300 characters)"
                  reference={preliminaryFindingsDescRef}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const { name, value } = e.target;
                    setFieldValue(name, value);
                    setFieldTouched('preliminaryFindings', true);
                  }}
                  onBlur={(e) => {setFieldTouched('preliminaryFindings', true);handleBlur(e)}}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => restrictTextArea(e)}
                  maxLength={500}       
                  errors={touched.preliminaryFindings && errors.preliminaryFindings}
                  touched={touched.preliminaryFindings}
                />
              </div>
              <div className="col-12">
                <div className='uploadWrapper'>
                  {token && (
                    <MultiFileUploader 
                      token={token}
                      required={true}
                      disabled={readOnly}
                      elName="images"
                      createdBy={pirData.createdBy}
                      existingFiles={values.images} 
                      onFilesChange={(images: any, deletedIds: any) => {
                        const updatedImages = handleImageChanges(images, deletedIds);
                        setFieldValue('images', updatedImages);
                      }} 
                    />
                  )}
                </div>
              </div>
            </div>
            { !readOnly && 
            <button
            className="iconBtn green v2 ms-0"
            type="button"
            // disabled={values.personInjured === "" || values.remark.trim() === "" || !(values.images.length && values.images[0].fileId)}
            // title={`${values.personInjured === "" ? "No. of Persons injured is required" : values.remark.trim() === "" ? "Incident Description is required" : !(values.images.length && values.images[0].fileId) ? "Atleast one image is required": "Save & Next" }`}
            // disabled={
            //     (pirData?.injuryHappened === "Yes" && values.personInjured === "") ||
            //     values.remark.trim() === "" ||
            //     !(values.images.length && values.images[0].fileId)
            //   }
            //   title={
            //     pirData?.injuryHappened === "Yes" && values.personInjured === ""
            //       ? "No. of Persons injured is required"
            //       : values.remark.trim() === ""
            //       ? "Incident Description is required"
            //       : !(values.images.length && values.images[0].fileId)
            //       ? "At least one image is required"
            //       : "Save & Next"
            //   }
             onClick={() => {
              if (pirData?.injuryHappened === "No") {
                setFieldValue("personInjured", 0);
              }
              if (pirData?.injuryHappened === "Yes" && values.personInjured === "") {
                toast.warning("No. of Persons injured is required");
                return;
              }
              if (values.remark.trim() === "") {
                toast.warning("Incident Description is required");
                return;
              }
              if (!(values.images.length && values.images[0].fileId)) {
                toast.warning("At least one image is required");
                return;
              }
              handleSubmit();
              }}
            >
            <span>Save & Next</span>
          </button>}
          </div>
        </form>
      )}
    </Formik>
    <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
  </>
  );
};

export default IncidentDetails;
