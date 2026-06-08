import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Image from "next/image"
import { useFormik } from "formik";
import { emptySelector } from "@/config/config";
import {
  FETCH_DEPARTMENTS,
  FETCH_SECTIONS,
  FETCH_LINEMANAGER,
  FETCH_UNITS,
} from "@/config/apiConfig";
import { toast } from "react-toastify";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { serverRequest } from "@/services/getServerSideRender";
import SelectField from "@/components/Form/SelectFields";
import * as Yup from "yup";
import { RootState } from "@/store/store";

interface LineManagerType {
  id: number;
  unitid: string;
  departmentid: string;
  sectionid: string;
  sectionname: string;
  linemanagerName: string;
  linemanagerEmail: string;
  jsplid: string;
  rowIndex?: number;
  sectionhead: string;
  status: string;
  createdat: string;
  updatedat: string;
}
type FormValues = {
  id?: string;
  unitid: string;
  unitname?: string;
  departmentid: string;
  departmentname?: string;
  sectionid?: string;
  sectionname: string;
  linemanagerName?: string;
  linemanagerEmail?: string;
  jsplid?: string;
  sectionhead: string;
  status?: string;
};

export default function LineManagerHandler({
  userDetails,
  checkWorkspacePermission
}: {
  userDetails: any;
  checkWorkspacePermission: (
    unitId: string, 
    departmentId: string,
    removableRole?: string
  ) => boolean;
}) {
   console.log("userDetails", userDetails, "*************")
  const token = useSelector(selectUserToken);
  const { user } = useSelector((state: RootState) => state.auth as { user: any });
  // console.log("user from store", user)
  const sectionHeadOptions = [
      { value: "YES", label: "YES" },
      { value: "NO", label: "NO" },
  ];
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [unitList, setUnitList] = useState([]);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [lineManagerList, setLineManagerList] = useState<LineManagerType[]>([]);
  
  const checkToInactiveLineManager = async(id: number, name: string, unitId: string, departmentId: string) => {
    if(checkWorkspacePermission(unitId ?? "", departmentId ?? "")) {
      updateLineManager(id, name, "inactive");
    } else {
      toast.warning("You don't have enough permission to remove this role.");
    }
  };

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
          setUnitList(response);
        } else {
          setUnitOptions(emptySelector);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

  const fetchDepartments = async () => {
    try {
      const res = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${userDetails?.empUnitId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );

      if (res?.length) {
        setDepartmentOptions(
          res.map((d: any) => ({ value: d.departmentid, label: d.departmentname }))
        );
      } else {
        setDepartmentOptions(emptySelector);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /** ---------------------------------------------------
   * Fetch Sections
   --------------------------------------------------- */
  const fetchSections = async (deptId: string) => {
    try {
      const res = await serverRequest(
        {},
        FETCH_SECTIONS + `/get-sections/${deptId}/all`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );

      if (res?.length) {
        setSectionOptions(
          res.map((s: any) => ({ value: s.sectionid, label: s.sectionname }))
        );
      } else {
        setSectionOptions(emptySelector);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /** ---------------------------------------------------
   * Fetch Assigned List of this Employee
   --------------------------------------------------- */
  const fetchLineManagers = async () => {
    setLineManagerList([]);    
    try {
      const response = await serverRequest(
        {},
        FETCH_LINEMANAGER + `/get-line-manager-mapping/${userDetails?.jsplid}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response && response.length >0) {
        setLineManagerList(response);
      } else {
        setLineManagerList([]);
      }
    } catch (error) {
      console.error("Error fetching line managers:", error);
    }
  };

  // Update Line Manager (Edit)
  const updateLineManager = async (id: number, name: string, status: string) => {   
    const payload = {
      id: id,
      linemanagerName: name,
      status: status,
      updatedby: user?.createdBy
    }; 
    try {
      const response = await serverRequest(
        payload,
        FETCH_LINEMANAGER + `/update-status/${id}`,
        CONSTANTS.REQUEST_PATCH,
        true,
        true,
        token
      );
      if (response?.success) { 
        toast.success(response?.message);
        fetchLineManagers();
      } else {
        toast.error(response?.message || "Failed to update Line Manager.");
      }
    } catch (error) {
      console.error("Error updating Line Manager:", error);
      toast.error("An error occurred during update.");
    }
  };
  
  const getLineManagerValidationSchema = Yup.object({
        unitid: Yup.string().required("Unit is required"),
        departmentid: Yup.string().required("Department is required"),
        sectionid: Yup.string().required("Section is required"),
        sectionhead: Yup.string().required("Section Head status is required"),
      });
    
  const addformik = useFormik<FormValues>({
      initialValues: {
        unitid: userDetails?.empUnitId,
        departmentid: "",
        sectionid: "",
        sectionname: "",
        linemanagerEmail: userDetails?.empEmail,
        linemanagerName: userDetails?.empName,
        jsplid: userDetails?.jsplid,
        sectionhead: "",
        status: "Active",  
      },
      validationSchema: getLineManagerValidationSchema,
      enableReinitialize: true,
      onSubmit: (values) => {
        saveLineManager(values)
      },
    });

    const saveLineManager = async (payload: FormValues) => {
      console.log("payload", payload)
  
      if (!payload.linemanagerEmail) {
        toast.error("Line Manager Email must be selected.");
        return;
      }
  
      if (!payload.sectionname) {
        toast.error("Selected section details are missing. Please re-select the Section.");
        return;
      }
  
      const sectionHeadForPayload = payload.sectionhead === "YES" ? "TRUE" : "FALSE";
      const sectionNameForPayload = payload.sectionname;
      // const statusForPayload = payload.status === "active" ? "active" : "inactive";
  
      const ISO_NO_Z_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';
  
      const addPayload = {
        unitid: String(payload.unitid),
        departmentid: Number(payload.departmentid),
        sectionid: String(payload.sectionid),
        sectionhead: sectionHeadForPayload,
        linemanagerName: userDetails?.empName,
        sectionname: sectionNameForPayload,
        linemanagerEmail: payload.linemanagerEmail,
        jsplid: userDetails?.jsplid,
        status: 'active',
        createdat: dayjs().format(ISO_NO_Z_FORMAT),
        createdby: user?.createdBy,
        updatedat: dayjs().format(ISO_NO_Z_FORMAT),
        updatedby: user?.updatedBy,
        landscapeId: 0,
      }
  
      try {
        const response = await serverRequest(
          addPayload,
          FETCH_LINEMANAGER,
          CONSTANTS.REQUEST_POST,
          true,
          true,
          token
        );
        if (response && response.id) {
          toast.success("Line Manager added successfully");
          fetchLineManagers();
        } else {
          toast.error(response?.message || "Failed to add Line Manager.");
        }
      } catch (error) {
        console.error("Error saving Line Manager:", error);
      } finally {
          addformik.resetForm()
      }
    };

  useEffect(() => {
      fetchUnits();
    }, []);

  useEffect(() => {
    fetchDepartments();
    fetchLineManagers();
  }, [userDetails?.jsplid]);

  // const formik = useFormik({
  //   initialValues: {
  //     departmentid: "",
  //     sectionid: "",
  //     sectionhead: "FALSE",
  //   },

  //   onSubmit: async (values) => {
  //     try {
  //       const payload = {
  //         unitid: userDetails?.empUnitId,
  //         departmentid: values.departmentid,
  //         sectionid: values.sectionid,
  //         linemanagerEmail: userDetails?.empEmail,
  //         linemanagerName: userDetails?.empName,
  //         jsplid: userDetails?.jsplid,
  //         sectionhead: values.sectionhead,
  //       };

  //       await serverRequest(
  //         payload,
  //         `/api/jinsafeim/linemanager/add`,
  //         CONSTANTS.REQUEST_POST,
  //         true,
  //         true,
  //         token
  //       );

  //       toast.success("User assigned successfully!");
  //       formik.resetForm();
  //       fetchLineManagers();
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Failed to assign user");
  //     }
  //   },
  // });

  return (
    <>
      <div className="basic-content-block">        
        <div className="basic-content-block-heading">
        </div>
        <div className="content-containers">
            <form onSubmit={addformik.handleSubmit}>
            <div className="adminFilters__list p-0">
              <div className="row form_grider d1">
                  <div className="col-md-2">
                  <SelectField
                    label="Unit"
                    placeholder="Unit"
                    value={unitOptions.find((u) => ((String(u.value) === userDetails?.empUnitId)))}
                    name="unitid"
                    disabled={userDetails?.empUnitId ? true : false}
                    options={unitOptions}
                    onChange={(option: any) => {
                      if (option) {
                        addformik.setFieldValue("unitid", option.value);
                        addformik.setFieldValue("departmentid", "");
                      } else {
                        addformik.setFieldValue("unitid", "");
                        addformik.setFieldValue("departmentid", "");
                        addformik.setFieldValue("sectionid", "");
                      }
                    }}
                    errors={addformik.errors.unitid}
                    touched={addformik.touched.unitid}
                  />
                  </div>
                  <div className="col-md-3">
                  <SelectField
                    label="Department"
                    placeholder="Department"
                    value={
                      addformik.values.departmentid
                        ? departmentOptions.find((u) => String(u.value) === String(addformik.values.departmentid))
                        : null
                    }
                    name="departmentid"
                    options={departmentOptions}
                    onChange={(option: any) => {
                      if (option) {
                        addformik.setFieldValue("departmentid", option.value);
                        addformik.setFieldValue("sectionid", "");
                        fetchSections(option.value)
                      } else {
                        addformik.setFieldValue("departmentid", "");
                        addformik.setFieldValue("sectionid", "");                                          
                        setSectionOptions(emptySelector);
                      }
                    }}
                    errors={addformik.errors.departmentid}
                    touched={addformik.touched.departmentid}
                  />
                  </div>
                  <div className="col-md-3">
                  <SelectField
                    label="Section"
                    placeholder="Section"
                    value={
                      addformik.values.sectionid
                        ? sectionOptions.find((u) => String(u.value) === String(addformik.values.sectionid))
                        : null
                    }
                    name="sectionid"
                    options={sectionOptions}
                    onChange={(option: any) => {
                      if (option) {
                        addformik.setFieldValue("sectionid", option.value);
                        addformik.setFieldValue("sectionname", option.label);
                      } else {
                        addformik.setFieldValue("sectionid", "");
                        addformik.setFieldValue("sectionname", "");
                      }
                    }}
                    errors={addformik.errors.sectionid}
                    touched={addformik.touched.sectionid}
                  />
                  </div>
                  <div className="col-md-2">
                  <SelectField
                      value={sectionHeadOptions.find(opt => opt.value === addformik.values.sectionhead)}
                      label="Section Head"
                      name="sectionhead"
                      placeholder="Section Head"
                      options={sectionHeadOptions}
                      onChange={(option) => addformik.setFieldValue("sectionhead", option?.value)}
                      onBlur={addformik.handleBlur}
                      errors={addformik.errors.sectionhead}
                      touched={addformik.touched.sectionhead}
                    />
                  </div>
                  <div className="col-md-2 ps-0 mt-4">
                    <div className="d-flex">                        
                      <button type="submit" className="iconBtn green">
                          <span>Add Line Manager</span>
                          <Image width="20" height="20" alt="Button1"
                              src="/images/svg/icons/Add.svg" className="white-icon" />
                      </button>
                      </div>
                  </div>
              </div>
            </div>
            </form>
        </div>
      </div>      
      <div style={{overflowY: "auto", borderRadius: "4px", marginTop: "25px"}}>              
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, backgroundColor: "#c5cddaff" }}>
            <tr>
              <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Role</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Unit</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Department</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Section</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Section Head</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", color: "#000", textAlign: "center", fontWeight: "bold" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {lineManagerList?.length > 0 ? (
              lineManagerList.map((lm, index) => (
              <tr key={index}>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>Line Manager</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{lm?.unitid}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{lm?.departmentid}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{lm?.sectionname}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center", color: "#000" }}>{lm?.sectionhead === "TRUE" ? "Yes" : "No"}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                  <button type="button"
                    onClick={() => checkToInactiveLineManager(lm?.id, lm?.linemanagerName, lm?.unitid, lm?.departmentid)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Inactive
                  </button>
                </td>
              </tr>
            ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#777" }}>
                  No Line Managers Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

