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
import MultiSelectField from "@/components/Form/MultiSelectField";
import MultiFileUploader from "@/components/Form/MultiFileUploader";
import Select from "react-select";
import DatePickerField from "@/components/Form/DatePickerField";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { serverRequest } from "@/services/getServerSideRender";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { emptySelector } from "@/config/config";
import { 
    FETCH_UNITS,
    FETCH_DEPARTMENTS,
    SAVE_DRAFT_PIR,
    HORIZONTAL_DEPLOYMENT
} from "@/config/apiConfig";
import { ToastContainer, toast } from "react-toastify";
import * as Yup from "yup";
import { useSelector } from "react-redux";

type SelectOption = { value: number | string; label: string };

type FormValues = {
  pirId: string | null;
  actiontaken: string | null;
  createdby?: string | null;
  updatedby?: string | null;
  assignLinemanager?: string | null;
  targetdate: string | null;
  sections?: string | null;
  departments: SelectOption[];
  units: string | null;
  flagHd?: string | null;
 };

const HorizontalDeployment = () => {
  const router = useRouter();
  const pirId = useSelector((state: RootState) => state.pir.pirId);
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [pirData, setPirData] = useState<{
    pir?: any;
    immediateActions?: any;
    incedentReport?: any;
    keyLearnings?: any; 
  }>(null);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [addedList, setAddedList] = useState<any[]>([]);

  const formik = useFormik<FormValues>({
    initialValues: {
    pirId: null,
    actiontaken: null,
    updatedby: user?.createdBy,
    assignLinemanager: null,
    targetdate: null,
    sections: null,
    departments: [],
    units: null,
    flagHd: "1",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = addedList.map((item) => ({
      pirId: pirId,
      actiontaken: item.action,
      createdby: user?.createdBy || "",
      updatedby: user?.createdBy || "",
      assignLinemanager: null,
      targetdate: values.targetdate,
      sections: null,
      departments: item.departmentIds?.join(", ") || "",
      units: String(item.unitId),
      flagHd: "1",
    }));

    console.log("Final API Payload:", JSON.stringify(payload, null, 2));
    await saveHorizontalDeployment(payload, pirId, user?.createdBy);
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
      setPirData({
        pir: response?.pir,
        immediateActions: response?.immediateActions,
        incedentReport: response?.incedentReport,
        keyLearnings: response?.lessonLearntKeyLearnings,
     });
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

  // combined list of immediate action,incident report,key learning
  const combinedList = [
    ...(pirData?.immediateActions || []).map((item, index) => ({
      section: item?.imSubmoduleName,
      action: item?.actiontaken,
    })),
    ...(pirData?.keyLearnings || []).map((item, index) => ({
      section: "Key Learning",
      action: item?.keyLearning,
    }))
  ];

  useEffect(() => {
    fetchUnits();
  }, []);

 const fetchUnits = async () => {
    try {
      const response = await serverRequest(
        {},
        FETCH_UNITS + `/get-units`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
         const options = response.map((value) => ({
          value: value?.unitid,
          label: value?.unitname,
        }));
        setUnitOptions(options);
       } else {
        setUnitOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
 const fetchDepartments = async (unitId) => {
    try {
      setDepartmentOptions(emptySelector);
      setSectionOptions(emptySelector);
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${unitId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((value) => ({
          value: value?.departmentid,
          label: value?.departmentname,
        }));
        setDepartmentOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
 };
 const saveHorizontalDeployment = async (payload: any, pirId: string, updatedby: string) => {
    try {
      const response = await serverRequest(
        payload,
        HORIZONTAL_DEPLOYMENT + `/save-horizontal-deployment/${pirId}/${updatedby}`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response) {
        toast.success("Horizontal Deployment published successfully");
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
                <img
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
            <div className="c-accordion__head--title"> Horizontal Deployment </div>
        </div>
        <div className="filters">
            <div className="row form_grider d1">
             <div style={{width: "100%", overflowY: "auto", borderRadius: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#c5cddaff" }}>
                  <tr>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Select</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Serial No.</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Section</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedList.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "10px" }}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    combinedList.map((row, index) => (
                      <tr key={index}>
                        <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(index)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows([...selectedRows, index]);
                              } else {
                                setSelectedRows(selectedRows.filter((i) => i !== index));
                              }
                            }}
                          />
                        </td>

                        <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                          {index + 1}
                        </td>

                        <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                          {row.section}
                        </td>

                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {row.action}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Block 2 */}
         <div className="row form_grider d1 mt-3 align-items-end">
          <div className="col-md-2">
            <SelectField
              label="Unit"
              placeholder="Select Unit"
              value={
                formik.values.units
                  ? unitOptions.find((u) => String(u.value) === String(formik.values.units))
                  : null
              }
              name="units"
              options={unitOptions}
              onChange={(option: any) => {
                if (option) {
                  formik.setFieldValue("units", option.value);
                  formik.setFieldValue("departments", []);
                  fetchDepartments(option.value);
                } else {
                  formik.setFieldValue("units", "");
                  formik.setFieldValue("departments", []);
                }
              }}
            />
          </div>
          <div className="col-md-6">
           <MultiSelectField
              label="Departments"
              value={formik.values.departments}
              name="departments"
              placeholder="Select Departments"
              options={departmentOptions}
              selectAllLabel="Select All"
              outputFormat="object"
              enableSelectAll={true}
              onChange={(selectedItems) => {
                const safeItems = Array.isArray(selectedItems) ? selectedItems : [];
                formik.setFieldValue("departments", safeItems);
              }}
              errors={formik.errors.departments}
              touched={formik.touched.departments}
            />
          </div>
          <div className="col-md-2 d-flex mb-3">
            <button
              className="iconBtn orange w-50"
              style={{
              height: "38px",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              }}
              type="button"
              onClick={() => {
                if (!formik.values.units) {
                  toast.warn("Please select Unit!");
                  return;
                }

                if (!formik.values.departments || formik.values.departments.length === 0) {
                  toast.warn("Please select Departments!");
                  return;
                }

                if (!selectedRows || selectedRows.length === 0) {
                  toast.warn("Please select at least one row!");
                  return;
                }

                // Get Unit Name
                const unitName =
                  unitOptions.find(u => String(u.value) === String(formik.values.units))
                    ?.label || "";

                // Get Department IDs and Names
                const deptIds = formik.values.departments.map(d => d.value);
                const deptNames = departmentOptions
                  .filter(opt => deptIds.includes(opt.value))
                  .map(opt => opt.label);

                // Prepare new rows
                const newRows = selectedRows.map(idx => ({
                  action: combinedList[idx]?.action || "",
                  unitId: formik.values.units,
                  unit: unitName,
                  departmentIds: deptIds,
                  departments: deptNames,
                }));

                // Merge new rows, avoiding duplicates
                const filteredNewRows = newRows.filter(newRow => {
                  const exists = addedList.some(
                    existing =>
                      existing.action === newRow.action &&
                      existing.unitId === newRow.unitId &&
                      JSON.stringify(existing.departmentIds) === JSON.stringify(newRow.departmentIds)
                  );

                  if (exists) {
                    toast.warn(`Record for action "${newRow.action}" already exists!`);
                  }

                  return !exists;
                });

                // Update state and Formik
                const updated = [...addedList, ...filteredNewRows];
                setAddedList(updated);
                formik.setFieldValue("addedList", updated);
                setSelectedRows([]);
              }}
              >
              <span>Add</span>
              <img
                width="16"
                height="16"
                alt="Add"
                src="/images/svg/icons/Add.svg"
                className="white-icon"
              />
            </button>
          </div>
         </div>
          {/* Block 3 */}
           <div className="row form_grider d1">
             <div style={{width: "100%", overflowY: "auto", borderRadius: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#c5cddaff" }}>
                  <tr>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Serial No.</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Actions</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Assigned To Unit</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Assigned To Departments</th>                    
                    <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {addedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "10px" }}>
                        No records added
                      </td>
                    </tr>
                  ) : (
                    addedList.map((item, index) => (
                      <tr key={index}>
                        <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                          {index + 1}
                        </td>

                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {item.action}
                        </td>

                        <td style={{ border: "1px solid #ddd", textAlign: "center" }}>
                          {item.unit}
                        </td>

                        <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                          {item.departments.join(", ")}
                        </td>

                        <td style={{ border: "1px solid #ddd", textAlign: "center",padding: "10px"}}>
                          <button
                            className="tableBtn"
                            style={{ border: "0px", alignItems: "center"}}
                            type="button"
                            onClick={() => {
                              setAddedList(addedList.filter((_, i) => i !== index));
                            }}
                          >
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
         {/* Block 4 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px', borderTop: '1px solid #eee', gap: '15px' }}>
            {/* <button style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              Skip
            </button> */}
            <button style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
              type="submit"
              >
              Publish
            </button>
          </div>
        </div>      
    </div>
   </form>
   
    <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
};

export default HorizontalDeployment;
