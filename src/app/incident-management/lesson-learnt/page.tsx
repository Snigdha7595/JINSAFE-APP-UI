"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useFormik } from "formik";
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import MultiFileUploaderLessionLearnt from "@/components/Form/MultiFileUploaderLessionLearnt";
import Select from "react-select";
import DatePickerField from "@/components/Form/DatePickerField";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { serverRequest } from "@/services/getServerSideRender";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { emptySelector } from "@/config/config";
import { FETCH_UNITS, FETCH_DEPARTMENTS, FETCH_SECTIONS, SAVE_DRAFT_PIR, LESSION_LEARNT} from "@/config/apiConfig";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { setPirId } from "@/store/slices/pirSlice";

interface LRImages {
  imageId?: number;
  pirId?: string;
  mongoId?: string;
  fileType?: string;
  fileName?: string;
  fileThumbnail?: string;
  UploadedFile?: string;
}
interface KeyLearning {
  id?: number;
  pirId?: string;
  keyLearning?: string;
}
type FormValues = {
  objectId: string | null;
  pirId: string | null;
  unitId: string | null;
  unitName?: string | null;
  departmentId: string | null;
  departmentName?: string | null;
  sectionId: string | null;
  sectionName?: string | null;
  exactLocation?: string;
  incidentDate?: string | null;
  incidentTime?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  images: LRImages[];
  keyLearnings: KeyLearning[];
  keyLearning?: string;
 };

const LessionLearnt = () => {
  const router = useRouter();
  const dispatch = useDispatch()
  const pirId = useSelector((state: RootState) => state.pir.pirId);
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [pirData, setPirData] = useState<any>(null);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  
   const validationSchema = Yup.object({
   keyLearnings: Yup.array()
    .of(
      Yup.object().shape({
        keyLearning: Yup.string().required("Key Learning is required")
      })
    )
    .min(1, "Add at least one Key Learning"),
  images: Yup.array().min(1, "Upload at least 1 image"),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
    objectId: pirData?.objectId || null,
    pirId: pirData?.pirId || null,
    unitId: pirData?.unitId || null,
    unitName: pirData?.unitName || null,
    departmentId: pirData?.departmentId || null,
    departmentName: pirData?.departmentName || null,
    sectionId: pirData?.sectionId || null,
    sectionName: pirData?.sectionName || null,
    exactLocation: pirData?.exactLocation || "",
    incidentDate: pirData?.incidentDate,
    incidentTime: pirData?.incidentTime,
    images: [],
    keyLearnings: [],
    keyLearning: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        objectId: values?.objectId || null,
        pirId: values.pirId,
        unitId: values.unitId,
        departmentId: values.departmentId,
        sectionId: values.sectionId,
        updatedBy: user?.createdBy,

        images: values.images.map((img) => ({
          imageId: 0,
          pirId: values.pirId,
          mongoId: img.mongoId || "",
          fileType: img.fileType,
          fileName: img.fileName,
          fileThumbnail: img.fileThumbnail
        })),

        keyLearnings: values.keyLearnings.map((kl) => ({
          id: 0,
          pirId: values.pirId,
          keyLearning: kl.keyLearning
        }))
      };
      await saveLessonLearnt(payload);
    },
  });

  const fetchPirData = async (pirId: string) => {
    try {
    const response = await serverRequest(
        {}, 
        SAVE_DRAFT_PIR + `/get-pir/${pirId}`, 
        CONSTANTS.REQUEST_GET, 
        true, 
        true, 
        token
    );
    if (response?.success === true) {
      setPirData(response?.pir);
    }
    } catch (error) {
    console.error("Error fetching PIR:", error);
    }
  };
  useEffect(() => {
    if (pirId) {
        fetchPirData(pirId);
    }
  }, [pirId]);
  
  useEffect(() => {
    return () => {
      dispatch(setPirId(pirId))
    }
  }, [])
   const handleImageChanges = (newImages: any[], deletedIds: string[]) => {
    // Update pending deletions
    setPendingDeletions(deletedIds);
    // Update form values without saving to session
    return newImages;
  };
  // ➤ Add Key Learning
    const handleAddKeyLearning = () => {
    if (!formik.values.keyLearning || formik.values.keyLearning.trim() === "") {
      toast.warning("Please enter a key learning");
      return;
    }
    formik.setFieldValue("keyLearnings", [
    ...formik.values.keyLearnings,
    { keyLearning: formik.values.keyLearning }
    ]);

    // Clear input field
    formik.setFieldValue("keyLearning", "");
  };

  // ➤ Delete Key Learning
  const handleDeleteKeyLearning = (index: number) => {
    const updated = formik.values.keyLearnings.filter((_, i) => i !== index);
    formik.setFieldValue("keyLearnings", updated);
  };
  const saveLessonLearnt = async (payload: FormValues) => {
    try {
      const response = await serverRequest(
        payload,
        LESSION_LEARNT + `/save-lessonlearnt/publish`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response) {
        toast.success("Lesson Learnt added successfully");
        dispatch(setPirId(pirId))
        router.push(APP_URL.INCIDENT_DETAIL);
        } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 

  return (
    <>
     <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="container-fluid">
        <div className="admin-boxContainer d3 ">
          <div className="adminAction">
            <Link href={APP_URL.INCIDENT_DETAIL} className="adminAction__title">
              <span className="icon">
                <Image
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage Incident Detail
            </Link>
          </div>
        </div>
        
         {/* Block 1 */}
       <div className="c-accordion__head">
         <div className="c-accordion__head--title"> Unit Interaction </div>
       </div>
         <div className="filters">
           <div className="row form_grider d1">
             <div className="col-12 col-md-4 col-lg-3">
                  <InputField
                    type="text"
                    label="Unit"
                    value={formik.values.unitName || ""}
                    name="unitName"
                    placeholder="Unit"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
               </div>
              <div className="col-12 col-md-4 col-lg-3">
                  <InputField
                     type="text"
                    label="Department"
                    value={formik.values.departmentName || ""}
                    name="departmentName"
                    placeholder="Department"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
              </div>
               <div className="col-12 col-md-4 col-lg-3">
                   <InputField
                    type="text"
                    label="Section"
                    value={formik.values.sectionName || ""}
                    name="sectionName"
                    placeholder="Section"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
              </div>
               <div className="col-12 col-md-4 col-lg-3">
                   <InputField
                    type="text"
                    label="inciden tDate"
                    value={formik.values.incidentDate || ""}
                    name="incidentDate"
                    placeholder="Section"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
              </div>
               <div className="col-12 col-md-4 col-lg-3">
                   <InputField
                    type="text"
                    label="incident Time"
                    value={formik.values.incidentTime || ""}
                    name="incidentTime"
                    placeholder="incidentTime"
                    errors={""}
                    touched={""}
                    onBlur={() => {}}
                    onChange={() => {}}
                />
              </div>
             <div className="col-12 col-md-4 col-lg-6">
                 <InputField
                  type="text"
                  label="Exact Location"
                  disabled={true}
                  value={formik.values.exactLocation}
                  name="exactLocation"
                  placeholder="Enter Location"
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={250}
              />
              </div>
            </div>
          </div>
      {/* Block 2 */}
       <div className="c-accordion__head">
         <div className="c-accordion__head--title"> Key Learnings </div>
       </div>
         <div className="filters">
           <div className="row form_grider d1">
             <div className="col-12 col-md-4 col-lg-6">
                  <InputField
                    type="text"
                    label="Key Learning (Max. 300 characters)"
                    value={formik.values.keyLearning || ""}
                    name="keyLearning"
                    placeholder="Key Learning"
                    errors={""}
                    touched={""}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    maxLength={300}
                />
               </div>
               <div className="col-md-6 d-flex align-items-center"
                style={{ gap: "5px", marginTop: "10px"}} >
                <button
                  className="iconBtn green v2 d-flex align-items-center gap-2"
                  type="button"
                  onClick={handleAddKeyLearning}
                >
                  <img width={20} height={20} alt="Add" src="/images/svg/icons/Add.svg" className="white-icon" />
                  <span>Add</span>
                </button>
              </div>
              <div style={{width: "100%", overflowY: "auto", borderRadius: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#c5cddaff" }}>
                  <tr>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Serial No.</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Key Learning</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.keyLearnings.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "10px" }}>
                        No Key Learnings Added
                      </td>
                    </tr>
                  )}
                  {formik.values.keyLearnings.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: "5px", border: "1px solid #ddd", textAlign: "center" }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: "5px", border: "1px solid #ddd", textAlign: "center" }}>
                        {item.keyLearning}
                      </td>
                      <td style={{ padding: "5px", border: "1px solid #ddd",display: "flex",justifyContent: "center", textAlign: "center",alignItems: "center" }}>
                        <button
                          className="tableBtn"
                          style={{ border: "0px"}}
                          type="button"
                          onClick={() => handleDeleteKeyLearning(index)}>
                         <span className="u-icon">
                            <Image
                              width={15}
                              height={15}
                              alt="icon"
                              src="/images/svg/delete-icon.svg"
                              className="img-fluid u-image"
                            />
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
          {/* Block 3 */}
       <div className="c-accordion__head">
         <div className="c-accordion__head--title"> Image Upload </div>
       </div>
         <div className="filters">
           <div className="row form_grider d1">
              <div className='uploadWrapper'>
                  {token && (
                    <MultiFileUploaderLessionLearnt
                      token={token}
                      elName="images"
                      createdBy={pirData?.createdBy}
                      existingFiles={formik.values.images}
                      onFilesChange={(files: LRImages[], deletedIds: string[]) => {
                      formik.setFieldValue('images', files);
                      setPendingDeletions(deletedIds); // optional if you want to track deletions
                      }}
                      disabled={false} 
                      // onFilesChange={(images: any, deletedIds: any) => {
                      //   const updatedImages = handleImageChanges(images, deletedIds);
                      //   formik.setFieldValue('images', updatedImages);
                      // }} 
                    />
                  )}
                </div>
            </div>
          </div>
          <div className="actionWrapper">
           <button className="iconBtn green v2 ms-0" type="submit">
            <span>Submit</span>
            <Image
              width={15}
              height={15}
              alt="icon"
              className="img-fluid u-image"
              src="/images/svg/plane_icon.svg"
              style={{transform: "rotate(135deg)"}}
            />
           </button>
          </div>
        </div>
   </form>
   
    <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default LessionLearnt;
