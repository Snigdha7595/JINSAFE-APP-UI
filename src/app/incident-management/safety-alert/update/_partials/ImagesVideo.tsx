import React, { ChangeEvent, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

import InputField from "@/components/Form/InputField";
import Image from "next/image";
import TextareaField from "@/components/Form/TextareaField";
import MultiFileUploader from "@/components/Form/MultiFileUploader";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { restrictAlphabets, restrictSpecialCharactersExceptHyphen } from "@/config/globalUtils";
import { DELETE_FILE, SAFETY_ALERT } from "@/config/apiConfig";
import { serverRequest } from "@/services/getServerSideRender";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/Layouts/CustomModal";

const ImagesVideo = ({ readOnly, saData, setSaData, setPublishButtonVisible, twoStepProcess, setOpenSAPreview, publishButtonVisible, currentStatus, setCurrentStatus, setOpenSection, isUpdateMode, setOpenRevertConfirmation, revertButtonVisible, onForceSave}: any) => {
    const { user } = useSelector((state: RootState) => state.auth) as { user: any };
    const router = useRouter();
    const token = useSelector(selectUserToken);
    // const personInjuredRef = useRef<HTMLInputElement | null>(null);
    // const incidentDescRef = useRef<HTMLTextAreaElement | null>(null);
    const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getInitialValues = () => {
      return {
        // personInjured: saData?.personInjured || "",
        // remark: saData?.remarks || "",
        images: saData?.safetyAlertImages || [
          {
            fileId: "",
            fileType: "",
            fileName: "",
            fileSize: "",
            fileThumbnail: "",
            createdAt: "",
            createdBy: user?.createdBy,
          },
        ],
      };
    };

    const [formValues, setFormValues] = useState(getInitialValues());

    const validationSchema = Yup.object({
    // personInjured: Yup.string().required("No. of Persons injured is required"),
    // remark: Yup.string().required("Incident Description is required"),
    images: Yup.array().of(
      Yup.object({
        fileId: Yup.string(),
        fileName: Yup.string(),
        fileType: Yup.string(),
        fileSize: Yup.string(),
        fileThumbnail: Yup.string(),
        createdAt: Yup.string(),
        createdBy: Yup.string(),
      })
    ),
  });

    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);
  //   const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
  //   restrictAlphabets(event.nativeEvent, ref, isMob);
  // };

  // const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  // };

  const handleImageChanges = (newImages: any[], deletedIds: string[]) => {
    // Update pending deletions
    setPendingDeletions(deletedIds);
    // Update form values without saving to session
    return newImages;
  };

  const transformToSAImages = (images: any[]) => {
    return images.filter((img: any) => img.fileId && img.fileName).map(img => ({
        imageId: img.imageId || 0,
        pirId: img.pirId || saData?.pirId || "",
        fileId: img.fileId,
        fileName: img.fileName,
        fileSize: img.fileSize || "",
        fileThumbnail: img.fileThumbnail || img.fileId,
        createdAt: img.createdAt || new Date().toISOString(),
        createdBy: img.createdBy || user?.createdBy || "",
        rowIndex: img.rowIndex || 0
  }))};

  // const handleSubmit = async (values: any) => {
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);

  //   try {
  //     if (pendingDeletions.length > 0) {
  //       await serverRequest(
  //         pendingDeletions,
  //         DELETE_FILE,
  //         CONSTANTS.REQUEST_DELETE,
  //         true,
  //         true,
  //         token
  //       );
  //     }

  //     const updatedSaData = {
  //       ...saData,
  //       // personInjured: values.personInjured,
  //       // remarks: values.remark,
  //       safetyAlertImages: transformToSAImages(values.images.filter((img: any) => !pendingDeletions.includes(img.fileId)))
  //     };
  //     setSaData(updatedSaData);

  //     setPendingDeletions([]);
  //     return true;
  //     } catch (error) {
  //       console.error("Submission error:", error);
  //       return false;
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };

    const forceSaveImages = async (values: any) => {
    if (isSubmitting) false;
    setIsSubmitting(true);

    try {
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

      const updatedSaData = {
        ...saData,
        // personInjured: values.personInjured,
        // remarks: values.remark,
        safetyAlertImages: transformToSAImages(values.images.filter((img: any) => !pendingDeletions.includes(img.fileId)))
      };
      setSaData(updatedSaData);

      setPendingDeletions([]);
      return true;
      } catch (error) {
        console.error("Submission error:", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSubmit = async (values: any) => {
      const success = await forceSaveImages(values);
      return success;
    };

    const handleSubmitForm = async (values: any) => {
      const success = await handleSubmit(values);
      if (success) {
        if (twoStepProcess) {
          setCurrentStatus(4);
          setOpenSection(4);
        } else {
          setPublishButtonVisible(true);
          setOpenSAPreview(true);
        }
      }
    };

  const handleSaveAndPreview = (formikSubmit: () => void) => {
    formikSubmit();
  };

//   const handleSubmit = async (values: any) => {
//     try {
//       // Process pending deletions first
//       if (pendingDeletions.length > 0) {
//         await serverRequest(
//         pendingDeletions,
//         DELETE_FILE,
//         CONSTANTS.REQUEST_DELETE,
//         true,
//         true,
//         token
//       );
//       }

//       // Prepare final values
//       const finalValues = {
//         ...values,
//         images: values.images.filter((img: any) => !pendingDeletions.includes(img.fileId))
//       };

//       // Update state and storage
//       setIncidentData(finalValues);
//       setPirData((prevPirData: any) => ({...prevPirData, ...finalValues}));
      
//       // Clear pending deletions
//       setPendingDeletions([]);
      
//       // Move to next step
//       setCurrentStatus(4);
//       setOpenSection(4);
//     } catch (error) {
//       console.error("Submission error:", error);
//     }
//   };

  return (
    <Formik
      initialValues={getInitialValues()}
      enableReinitialize={true}
      validationSchema={validationSchema}
      onSubmit={handleSubmitForm}
    >
      {({ values, handleChange, handleBlur, handleSubmit: formikSubmit, setFieldValue, touched, errors, isValid }) => (
        <form onSubmit={(e) => {
          e.preventDefault();
          formikSubmit();
        }}>
          <div className="filters">
            <div className="row form_grider d1">
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
                <div className='uploadWrapper'>
                  {token && (
                    <MultiFileUploader
                      token={token}
                      elName="images"
                       disabled={readOnly || !isUpdateMode}
                      createdBy={user?.createdBy}
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
            {/* <div className="d-flex">
                {!readOnly && publishButtonVisible && !twoStepProcess ? <button className="iconBtn green v2 ms-0" type="submit" onClick={() => { setOpenSAPreview(true) }}>Save & Preview</button> : (!readOnly && <button
                    className="iconBtn green v2 ms-0"
                    type="submit"
                    onClick={() => {if(!twoStepProcess){setPublishButtonVisible(true)} else{ setCurrentStatus(4); setOpenSection(4); }}}
                >
                    <span>Save & Next</span>
                </button>)}
                {!readOnly && publishButtonVisible && !twoStepProcess && (
                    <button
                        className="iconBtn orange v2 ms-3"
                        type="button"
                        onClick={() => {
                            setOpenRevertConfirmation(true);
                        }}
                        >
                    Revert
                </button>
              )}
            </div> */}
            <div className="d-flex">
                {!readOnly && isUpdateMode && currentStatus === 3 && (
                  <>
                    {!twoStepProcess ? (
                      <button 
                        className="iconBtn green v2 ms-0" 
                        type="button"
                        disabled={isSubmitting || !isValid}
                        onClick={() => {handleSubmit(values).then(() => {
                          setOpenSAPreview(true);
                        })}}
                      >
                        {isSubmitting ? "Saving..." : "Save & Preview"}
                      </button>
                    ) : (
                      <button
                        className="iconBtn green v2 ms-0"
                        type="button"
                        disabled={isSubmitting || !isValid}
                        onClick={() => formikSubmit()}
                      >
                        <span>{isSubmitting ? "Saving..." : "Save & Next"}</span>
                      </button>
                    )}

                    {!twoStepProcess && publishButtonVisible && revertButtonVisible && (
                      <button
                        className="iconBtn orange v2 ms-3"
                        type="button"
                        disabled={isSubmitting}
                        onClick={async () => {
                          const saved = await forceSaveImages(values);
                          if (saved) {
                            setOpenRevertConfirmation(true);
                          }}}
                      >
                        Revert
                      </button>
                    )}
                  </>
                )}
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default ImagesVideo;