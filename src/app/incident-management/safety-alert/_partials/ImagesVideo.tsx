import React, { ChangeEvent, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

// import InputField from "@/components/Form/InputField";
import Image from "next/image";
// import TextareaField from "@/components/Form/TextareaField";
import MultiFileUploader from "@/components/Form/MultiFileUploader";
import { useDispatch, useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
// import { restrictAlphabets, restrictSpecialCharactersExceptHyphen } from "@/config/globalUtils";
import { DELETE_FILE, SAFETY_ALERT } from "@/config/apiConfig";
import { serverRequest } from "@/services/getServerSideRender";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/Layouts/CustomModal";
import { setPirId } from "@/store/slices/pirSlice";

const ImagesVideo = ({ readOnly, pirData, saData, setSaData, setPublishButtonVisible, twoStepProcess, setOpenSAPreview, publishButtonVisible, createCaseSAObjectIdRef, incidentData, setIncidentData, currentStatus, setCurrentStatus, setOpenSection, setPirData }: any) => {
    const dispatch = useDispatch()
    const { user } = useSelector((state: RootState) => state.auth) as { user: any };
    const pirId = useSelector((state: RootState) => state.pir.pirId);
    const router = useRouter();
    const token = useSelector(selectUserToken);
    // const personInjuredRef = useRef<HTMLInputElement | null>(null);
    // const incidentDescRef = useRef<HTMLTextAreaElement | null>(null);
    const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
    // const [ safetyRevertRemark, setSafetyRevertRemark ] = useState<string>("")
    // const [ openRevertConfirmation, setOpenRevertConfirmation ] = useState<boolean>(false);

    const initialValues = {
    // personInjured: pirData?.personInjured || "",
    // remark: pirData?.remark || "",
    images: (pirData?.images?.length > 0 ? pirData?.images : 
     saData?.safetyAlertImages?.length > 0 ? saData.safetyAlertImages : 
     [])
      .map((img: any) => ({
        fileId: img.fileId || img.mongoId || "",
        fileType: img.fileType || "",
        fileName: img.fileName || "",
        fileSize: img.fileSize || "",
        fileThumbnail: img.fileThumbnail || "",
        createdAt: img.createdAt || "",
        createdBy: img.createdBy || user?.createdBy,
      })),
  };

    const validationSchema = Yup.object({
    // personInjured: Yup.string().required("No. of Persons injured is required"),
    // remark: Yup.string().required("Incident Description is required"),
    images: Yup.array().of(
      Yup.object({
        fileId: Yup.string().required(),
        fileName: Yup.string().required(),
        fileType: Yup.string().required(),
        fileSize: Yup.string().required(),
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

  const revertDraftSafetyAlert = async () => {
      if (!saData) return;
  
      try {
        const payload = {
          ...saData,
          objectId: createCaseSAObjectIdRef.current || null,
        };
        const response = await serverRequest(
          payload,
          SAFETY_ALERT + `/save-safety-alert/revert`,
          CONSTANTS.REQUEST_POST,
          true,
          true,
          token
        );
  
        if (response.success) {
          // setSafetyRevertRemark("");
          dispatch(setPirId(pirId))
          router.push(APP_URL.INCIDENT_DETAIL);
        }
      } catch (error) {
        console.error("Error saving PIR:", error);
      }
    };

  const handleImageChanges = (newImages: any[], deletedIds: string[]) => {
    // Update pending deletions
    setPendingDeletions(deletedIds);
    // Update form values without saving to session
    return newImages;
  };

  const transformToSAImages = (images: any[]) => {
    return images?.map(img => ({
      pirId: pirData.pirId,
      fileId: img.fileId,
      fileType: img.fileType,
      fileName: img.fileName,
      fileSize: img.fileSize,
      fileThumbnail: img.fileThumbnail,
      createdAt: img.createdAt,
      createdBy: img.createdBy || user.createdBy
    }));
  };

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

      // Update PIR data
      const updatedPirData = {
        ...pirData,
        // personInjured: values.personInjured,
        // remark: values.remark,
        images: values?.images?.filter((img: any) => !pendingDeletions.includes(img.fileId))
      };
      setPirData(updatedPirData);

      // Update SA data if available
      if (saData && setSaData) {
        const updatedSaData = {
          ...saData,
          safetyAlertImages: transformToSAImages(values?.images?.filter((img: any) => !pendingDeletions.includes(img.fileId)))
        };
        setSaData(updatedSaData);
      }

      // Clear pending deletions
      setPendingDeletions([]);

      // Move to next step
      setCurrentStatus(4);
      setOpenSection(4);
    } catch (error) {
      console.error("Submission error:", error);
    }
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
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, handleBlur, setFieldValue, touched, errors }) => (
        <form onSubmit={handleSubmit}>
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
                      disabled={readOnly}
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
            <div className="d-flex">
                {!readOnly && publishButtonVisible && !twoStepProcess ? <button className="iconBtn green v2 ms-0" type="button" onClick={() => {handleSubmit(values).then(() => {
            setOpenSAPreview(true);
          })}}>Save & Preview</button> : (!readOnly && <button
                    className="iconBtn green v2 ms-0"
                    type="submit"
                    onClick={() => {if(!twoStepProcess){setPublishButtonVisible(true)}}}
                >
                    <span>Save & Next</span>
                </button>)}
                {/* {!readOnly && publishButtonVisible && !twoStepProcess && (
                    <button
                        className="iconBtn orange v2 ms-3"
                        type="button"
                        onClick={() => {
                            setOpenRevertConfirmation(true);
                        }}
                        >
                    Revert
                </button>
              )} */}
            </div>
            {/* <CustomModal
              isOpen={openRevertConfirmation}
              onClose={() => setOpenRevertConfirmation(false)}
              bodyClassName="isScrollable"
              title="Confirm Safety Alert Revert"
            >
              <div className="filters">
                <div className="row form_grider d1">
                  <h2>Are you sure you want to revert this Safety Alert?</h2>
                  <div>
                    <label>Remarks</label>
                    <input
                      type="text"
                      value={safetyRevertRemark}
                      onChange={(e) => {
                        setSafetyRevertRemark(e.target.value);
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <div className="btnWrapper">
                      <button
                        className="iconBtn orange v2"
                        onClick={async () => setOpenRevertConfirmation(false)}
                        type="button"
                      >
                        <span>Back</span>
                      </button>
                      <button
                        className="iconBtn green v2"
                        disabled={!safetyRevertRemark}
                        style={{cursor: safetyRevertRemark? "pointer": "unset"}}
                        onClick={async () => {
                          setSaData(function (prev: any) {
                            return {
                              ...prev,
                              safetyRevertRemark: safetyRevertRemark,
                            };
                          });
                          revertDraftSafetyAlert();
                        }}
                        type="button"
                      >
                        <span>
                          Submit
                          <Image
                            width="15"
                            height="15"
                            alt="submit button"
                            src="/images/svg/plane_icon_45deg.svg"
                            className="img-fluid u-image ms-1"
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CustomModal> */}
          </div>
        </form>
      )}
    </Formik>
  );
};

export default ImagesVideo;