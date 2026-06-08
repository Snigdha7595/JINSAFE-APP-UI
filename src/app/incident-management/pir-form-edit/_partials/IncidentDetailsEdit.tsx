import React, { ChangeEvent, useRef, useState, useEffect } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import InputField from "@/components/Form/InputField";
import TextareaField from "@/components/Form/TextareaField";
import MultiFileUploader from "@/components/Form/MultiFileUploader";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { restrictAlphabets, restrictSpecialCharactersExceptHyphen } from "@/config/globalUtils";
import { SAVE_DRAFT_PIR } from "@/config/apiConfig";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { toast } from "react-toastify";
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

const REMOVE_IMAGE_API = `${SAVE_DRAFT_PIR}/remove-pir-image`; // will be used as `${REMOVE_IMAGE_API}/{pirId}/{imageId}`

const IncidentDetailsEdit = ({
  readOnly,
  pirData,
  incidentData,
  setIncidentData,
  setPirData,
  setCurrentStatus,
  setOpenSection
}: any) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector((state: RootState) => state.auth as { user: any });
  const personInjuredRef = useRef<HTMLInputElement | null>(null);
  const incidentDescRef = useRef<HTMLTextAreaElement | null>(null);
  const whatHappenedRef = useRef<HTMLTextAreaElement | null>(null);
  const preliminaryFindingsDescRef = useRef<HTMLTextAreaElement | null>(null);

  // Keep track of IDs of images that exist on server and were removed,
  // in case you want to batch-delete later. We also call delete API immediately when detected.
  const [pendingDeletions, setPendingDeletions] = useState<number[]>([]);

  // Map API images -> uploader format
  const mapImages = (images: ApiImage[] = []): UploaderImage[] =>
    images.map((img) => ({
      fileId: img.imageId?.toString() ?? crypto.randomUUID(),
      imageId: img.imageId ?? 0,
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
        : [],
  };

  const validationSchema = Yup.object({
    personInjured: Yup.string().required("No. of Persons injured is required"),
    remark: Yup.string().required("Incident Description is required"),
    whatHappened: Yup.string().required("What Happened is required"),
    preliminaryFindings: Yup.string().required("Preliminary Findings is required"),
    images: Yup.array().min(1, "At least one image is required"),
  });

  const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement | null>, isMob: boolean) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };

  const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  };

  // When MultiFileUploader reports changes, we:
  // - immediately call removal API for any deleted image that has an imageId (existing on server)
  // - update the Formik field value with the new images
  //
  // newImages: the new current array shown in uploader
  // deletedIds: list of uploader fileIds that were removed in this change
  // previousImages: the previous uploader list before change (so we can map fileId -> imageId)
  const handleImageChanges = async (
    newImages: UploaderImage[],
    deletedIds: string[],
    previousImages: UploaderImage[],
    pirId: string
  ) => {
    if (deletedIds?.length > 0) {
      // for each deleted uploader id, find the corresponding previous image
      for (const delFileId of deletedIds) {
        const removed = previousImages.find((img) => img.fileId === delFileId);
        if (removed && removed.imageId && pirId) {
          // Call DELETE API immediately for server-stored image
          try {
            const url = `${REMOVE_IMAGE_API}/${pirId}/${removed.imageId}`;
            const resp = await serverRequest({}, url, CONSTANTS.REQUEST_DELETE, true, true, token);
            if (resp?.success) {
              toast.success(resp?.message || "Image removed");
            } else {
              // if delete failed, show error and keep track
              toast.error(resp?.message || "Failed to remove image from server");
              // If desired, add to pendingDeletions for a later attempt
              setPendingDeletions((prev) => Array.from(new Set([...prev, removed.imageId!])));
            }
          } catch (err) {
            console.error("Error deleting image:", err);
            toast.error("Error removing image");
            setPendingDeletions((prev) => Array.from(new Set([...prev, removed.imageId!])));
          }
        }
      }
    }

    return newImages;
  };

  // Convert uploader images → API payload images
  const mapToApiPayloadImages = (images: UploaderImage[]) =>
    images.map((img) => ({
      imageId: img.imageId ?? null,
      mongoId: img.mongoId,
      fileName: img.fileName,
      fileType: img.fileType,
      fileSize: img.fileSize,
      fileThumbnail: img.fileThumbnail,
      createdAt: img.createdAt,
      createdBy: img.createdBy,
    }));

  // NOTE: onSubmit no longer calls update-pir API.
  // Instead it merges section form values into parent pirData via setPirData and setIncidentData.
  // Actual server update happens only via the centralized Update PIR button in page.tsx.
  const onSubmit = async (values: any, formikHelpers?: FormikHelpers<any>) => {
    try {
      formikHelpers?.setSubmitting(true);

      // If injuryHappened is No, ensure personInjured is 0 locally (UI already disables field)
      const personInjuredValue = pirData?.injuryHappened === "No" ? 0 : values.personInjured;

      // Prepare images payload (the uploader list should already be cleaned)
      const payloadImages = mapToApiPayloadImages(values.images || []);

      const updatedPayload = {
        ...pirData,
        personInjured: personInjuredValue,
        remark: values.remark,
        whatHappened: values.whatHappened,
        preliminaryFindings: values.preliminaryFindings,
        images: payloadImages,
        updatedBy: user?.createdBy,
      };

      // Update parent state only
      setIncidentData?.(updatedPayload);
      setPirData?.((prev: any) => ({ ...prev, ...updatedPayload }));

      toast.success("Incident details saved locally");
      setCurrentStatus(pirData?.injuryHappened == "Yes"? 3: 4);
      setOpenSection(pirData?.injuryHappened == "Yes"? 3: 4);

      formikHelpers?.setSubmitting(false);
    } catch (error) {
      console.error("Error saving incident locally:", error);
      toast.error("Something went wrong while saving incident details");
      formikHelpers?.setSubmitting(false);
    }
  };

  return (
    <>
      <Formik initialValues={initialValues} enableReinitialize={true} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ values, handleBlur, handleSubmit, setFieldValue, setFieldTouched, touched, errors, submitForm }) => (
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
                    disabled={pirData?.injuryHappened === "No"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const { name, value } = e.target;
                      setFieldValue(name, value);
                      // Sync to parent immediately on change
                      setPirData?.((prev: any) => ({ ...prev, personInjured: value }));
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
                      setFieldTouched("remark", true);
                      // Sync to parent
                      setPirData?.((prev: any) => ({ ...prev, remark: value }));
                    }}
                    onBlur={(e) => {
                      setFieldTouched("remark", true);
                      handleBlur(e);
                    }}
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
                      setFieldTouched("whatHappened", true);
                      // Sync to parent
                      setPirData?.((prev: any) => ({ ...prev, whatHappened: value }));
                    }}
                    onBlur={(e) => {
                      setFieldTouched("whatHappened", true);
                      handleBlur(e);
                    }}
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
                      setFieldTouched("preliminaryFindings", true);
                      // Sync to parent
                      setPirData?.((prev: any) => ({ ...prev, preliminaryFindings: value }));
                    }}
                    onBlur={(e) => {
                      setFieldTouched("preliminaryFindings", true);
                      handleBlur(e);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => restrictTextArea(e)}
                    maxLength={500}
                    errors={touched.preliminaryFindings && errors.preliminaryFindings}
                    touched={touched.preliminaryFindings}
                  />
                </div>

                <div className="col-12">
                  <div className="uploadWrapper">
                    {token && (
                      <MultiFileUploader
                        token={token}
                        required={true}
                        disabled={readOnly}
                        elName="images"
                        createdBy={pirData?.createdBy}
                        existingFiles={values.images}
                        onFilesChange={async (newImages: UploaderImage[], deletedIds: string[]) => {
                          // Call handler which will delete server images if necessary and return updated list
                          const updated = await handleImageChanges(newImages, deletedIds, values.images || [], values.pirId);
                          // Update Formik field
                          setFieldValue("images", updated);
                          // Sync to parent immediately
                          const payloadImages = mapToApiPayloadImages(updated);
                          setPirData?.((prev: any) => ({ ...prev, images: payloadImages }));
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
                    if (pirData?.injuryHappened === "Yes" && values.personInjured === "0") {
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
                    // Submit Formik form -> onSubmit runs (which updates parent state only)
                    submitForm();
                  }}
                >
                  <span>Next</span>
                </button>
              )}
            </div>
          </form>
        )}
      </Formik>
    </>
  );
};

export default IncidentDetailsEdit;
