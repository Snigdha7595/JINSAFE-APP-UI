import React, { ChangeEvent, useRef, useState, useEffect } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import InputField from "@/components/Form/InputField";
import Button from "@/components/Elements/Button";
import TextareaField from "@/components/Form/TextareaField";
import MultiFileUploader from "@/components/Form/MultiFileUploader";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { restrictAlphabets, restrictSpecialCharactersExceptHyphen } from "@/config/globalUtils";
import { DELETE_FILE ,SAVE_DRAFT_PIR} from "@/config/apiConfig";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { ToastContainer, toast } from "react-toastify";
import { RootState } from "@/store/store";

interface ApiImage {
  imageId?: number;
  mongoId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string | number;
  fileThumbnail?: string;
  createdAt?: string;
  createdBy?: string;
}

interface UploaderImage {
  fileId: string;
  imageId?: number;   
  fileName?: string;
  fileType?: string;
  fileSize?: string | number;
  fileThumbnail?: string;
  createdAt?: string;
  createdBy?: string;
  mongoId?: string;
}

const IncidentDetailsEdit = ({
readOnly,
pirData,
incidentData,
setIncidentData,
setPirData }: any) => {
const token = useSelector(selectUserToken);
const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
const personInjuredRef = useRef<HTMLInputElement | null>(null);
const incidentDescRef = useRef<HTMLTextAreaElement | null>(null);
const whatHappenedRef = useRef<HTMLTextAreaElement | null>(null);
const preliminaryFindingsDescRef = useRef<HTMLTextAreaElement | null>(null);
const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
const [isSubmitting, setIsSubmitting] = useState(false);

// Map API image objects to uploader format (fileId etc.)
 const mapImages = (images: ApiImage[] = []): UploaderImage[] =>
  images.map((img) => ({
    fileId: img.imageId?.toString() ?? crypto.randomUUID(),
    imageId: img.imageId ?? null,    // << IMPORTANT
    fileName: img.fileName ?? "",
    fileType: img.fileType ?? "",
    fileSize: img.fileSize ?? "",
    fileThumbnail: img.fileThumbnail ?? "",
    createdAt: img.createdAt ?? "",
    createdBy: img.createdBy ?? "",
    mongoId: img.mongoId ?? "",
  }));

const initialValues = {
pirId: pirData?.pirId || incidentData?.pirId || "",
personInjured: pirData?.personInjured || incidentData?.personInjured || "",
remark: pirData?.remark || incidentData?.remark || "",
whatHappened: pirData?.whatHappened || incidentData?.whatHappened || "",
preliminaryFindings: pirData?.preliminaryFindings || incidentData?.preliminaryFindings || "",    
images:
    pirData?.images?.length > 0
    ? mapImages(pirData.images)
    : incidentData?.images?.length > 0
    ? mapImages(incidentData.images)
    : [
        {
            fileId: "",
            fileType: "",
            fileName: "",
            fileSize: "",
            fileThumbnail: "",
            createdAt: "",
            createdBy: pirData?.createdBy || user?.createdBy || "",
        },
        ],

};
const validationSchema = Yup.object({
personInjured: Yup.string().required("No. of Persons injured is required"),
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

// Called by MultiFileUploader: newImages is current files array, deletedIds is list removed
const handleImageChanges = (
  newImages: UploaderImage[],
  deletedIds: string[],
  previousImages: UploaderImage[]
) => {

  if (deletedIds?.length > 0) {
    setPendingDeletions((prev) => {
      const updated = [...prev];

      deletedIds.forEach((deleteId) => {
        // Find deleted image from previous image list
        const deletedImg = previousImages.find((img) => img.fileId === deleteId);

        if (deletedImg?.fileThumbnail) {
          updated.push(deletedImg.fileThumbnail);
        }
      });

      return updated;
    });
  }

  return newImages;
};
  // Use a formik ref to set fields from outside Formik (for injuryHappened change)
  const formikRef = useRef<any>(null);

  // If pirData.injuryHappened becomes "No", set personInjured = 0 in form
  useEffect(() => {
    if (pirData?.injuryHappened === "No" && formikRef.current?.setFieldValue) {
      formikRef.current.setFieldValue("personInjured", 0);
    }
  }, [pirData?.injuryHappened]);

  // useEffect(() => {
  // if (pirData?.injuryHappened === "No") {
  //   setFieldValue("personInjured", 0);
  // }
  // }, [pirData?.injuryHappened]);

 // Map uploader images back to API payload
  const mapToApiPayloadImages = (images: UploaderImage[]) =>
  images.map((img) => ({
    imageId: img.fileId ? Number(img.fileId) : null,
    mongoId: img.mongoId,
    fileName: img.fileName,
    fileType: img.fileType,
    fileSize: img.fileSize,
    fileThumbnail: img.fileThumbnail,  // must not change
    createdAt: img.createdAt,
    createdBy: img.createdBy,
  }));

  // Formik submit handler (single place to: delete pending files -> call update API -> update local state)
  const onSubmit = async (values: any, formikHelpers?: FormikHelpers<any>) => {
  try {
    formikHelpers?.setSubmitting(true);
    // 1) Delete removed files
    if (pendingDeletions.length > 0) {
      await serverRequest(
        pendingDeletions, // list of fileThumbnail strings
        DELETE_FILE,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
    }
    // 2) Remove deleted images from uploader list
    const cleanedImages = values.images.filter(
    (img: any) => !pendingDeletions.includes(img.fileId)
    );

    // 3) Convert uploader images → API payload format
    const payloadImages = mapToApiPayloadImages(values.images);

    // 4) Prepare final payload
    const updatedPayload = {
      ...pirData,                   // keep existing PIR data
      personInjured: values.personInjured,
      remark: values.remark,
      whatHappened: values.whatHappened,
      preliminaryFindings: values.preliminaryFindings,
      images: payloadImages,        // final cleaned images
      updatedBy: user?.createdBy,
    };

    // 5) Send update request
    const response = await serverRequest(
      updatedPayload,
      SAVE_DRAFT_PIR + `/update-pir/${values.pirId}`,
      CONSTANTS.REQUEST_PUT,
      true,
      true,
      token
    );

    // 6) Response handling
    if (response?.success) {
      toast.success(response?.message);
          formikHelpers?.resetForm({
        values: {
          ...values,
          images: payloadImages,
        },
      });

      setIncidentData(updatedPayload);
      setPirData(updatedPayload);
      setPendingDeletions([]);
    } else {
      toast.error(response?.message || "Failed to update PIR");
    }
    formikHelpers?.setSubmitting(false);
  } catch (error) {
    console.error("Error saving PIR:", error);
    toast.error("Something went wrong while saving PIR");
    formikHelpers?.setSubmitting(false);
  }
};
  return (
    <>
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleBlur, handleSubmit, setFieldTouched, setFieldValue, touched, errors, submitForm }) => (
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
                  maxLength={300}
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
                  maxLength={300}        
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
                  maxLength={300}       
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
                      createdBy={pirData?.createdBy}
                      existingFiles={values.images}
                      onFilesChange={(newImages: UploaderImage[], deletedIds: string[]) => {
                        const updatedImages = handleImageChanges(newImages, deletedIds, values.images);
                        setFieldValue("images", updatedImages);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            {!readOnly && (
                <button
                  className="iconBtn green v2 ms-0"
                  type="button"
                  onClick={() => {
                    // local validations before calling Formik submit
                    if (pirData?.injuryHappened === "No") {
                      setFieldValue("personInjured", 0);
                    }
                    if (pirData?.injuryHappened === "Yes" && (values.personInjured === "" || values.personInjured === null)) {
                      toast.warning("No. of Persons injured is required");
                      return;
                    }
                    if (!values.remark || values.remark.trim() === "") {
                      toast.warning("Incident Description is required");
                      return;
                    }
                    if (!(values.images && values.images.length && values.images[0].fileId)) {
                      toast.warning("At least one image is required");
                      return;
                    }
                    // Submit Formik form -> onSubmit runs
                    submitForm();
                  }}
                >
                  <span>Save & Next</span>
                </button>
              )}
          </div>
        </form>
      )}
    </Formik>
    <ToastContainer position="top-right" autoClose={1000} 
        hideProgressBar={false} closeOnClick pauseOnHover />
  </>
  );
};

export default IncidentDetailsEdit;