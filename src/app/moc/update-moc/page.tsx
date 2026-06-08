"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useFormik } from "formik";
import { useState, useEffect, useCallback } from "react";
import * as Yup from "yup";
import dayjs from "dayjs";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_DEPARTMENTS, FETCH_MOC_DETAIL, FETCH_DRAFT_APPLICATION, FETCH_SECTIONS, FETCH_UNITS, SAVE_MOC_APPLICATION_FORM, FETCH_CHECKLIST_HEADERS } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { useDispatch, useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { FormValues, TMocDepartments, TMocSections, TMocUnits } from "@/types/moc";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { setObjectId, clearObjectId } from "@/store/slices/mocSlice";
import Image from "next/image";
import { setUpdateMocData } from "@/store/slices/updateMocSlice";

const User = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const token = useSelector(selectUserToken);
    const [unitOptions, setUnitOptions] = useState<TMocUnits[]>([]);
    const [departmentOptions, setDepartmentOptions] = useState<TMocDepartments[]>([]);
    const [sectionOptions, setSectionOptions] = useState<TMocSections[]>([]);
    const [CheckListName, setCheckListName] = useState<{ headerName: string, headerShtCode: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);
    const objectId = useSelector((state: RootState) => state.moc.objectId);
    const mocNo = typeof window !== 'undefined' ? sessionStorage.getItem('mocAfNo') : null;
    const validationSchema = Yup.object({
        title: Yup.string().required("Title is required").max(500, "Title must be 500 characters or less"),
        unitId: Yup.number().required("Unit is required"),
        unitName: Yup.string().required("Unit name is required").max(100, "Unit name must be 100 characters or less"),
        departmentId: Yup.number().required("Department is required"),
        departmentName: Yup.string().required("Department name is required").max(100, "Department name must be 100 characters or less"),
        sectionId: Yup.string().required("Section is required"),
        sectionName: Yup.string().required("Section name is required").max(100, "Section name must be 100 characters or less"),
        descriptionPresent: Yup.string().max(1000, "Description of present procedure must be 1000 characters or less"),
        descriptionProposed: Yup.string().required("Description of proposed change is required").max(1000, "Description of proposed change must be 1000 characters or less"),
        typeOfChange: Yup.string(),
        applicableForDays: Yup.number(),
        reasonForChange: Yup.string().required("Reason for change is required").max(1000, "Reason for change must be 1000 characters or less"),
        typeOfExpenditure: Yup.string(),
        amount: Yup.string().matches(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number with up to two decimal places"),
        currency: Yup.string(),
        changeRequirePlantModification: Yup.string(),
        changeRequirePlantModificationDetails: Yup.string().max(1000, "Details must be 1000 characters or less"),
        subsequentAffectedChange: Yup.string(),
        subsequentAffectedChangeDetails: Yup.string().max(1000, "Details must be 1000 characters or less"),
        mocChangeCategories: Yup.array().of(
            Yup.object().shape({
                slNo: Yup.number().required("Serial number is required"),
                changeCategory: Yup.string().required("Change category is required"),
                status: Yup.string().required("Status is required"),
                identificationName: Yup.string().max(500, "Identification name must be 500 characters or less")
            })
        ),
        mocChecklistsFormHeaders: Yup.array().required("Checklists are required")
    });

    const formik = useFormik<FormValues>({
        initialValues: {
            unitId: null,
            unitName: "",
            departmentId: null,
            departmentName: "",
            sectionId: null,
            sectionName: "",
            title: "",
            departmentHodId: null,
            departmentHodEmail: null,
            departmentHodName: null,
            sectionHeadId: null,
            sectionHeadMail: null,
            sectionHeadName: null,
            descriptionPresent: "",
            descriptionProposed: "",
            typeOfChange: "",
            applicableForDays: 15,
            applicableTillDate: null,
            reasonForChange: "",
            typeOfExpenditure: "Capex",
            amount: 0,
            currency: "INR",
            changeRequirePlantModification: "",
            changeRequirePlantModificationDetails: "",
            subsequentAffectedChange: "",
            subsequentAffectedChangeDetails: "",
            createdById: user?.jsplid,
            createdByMail: user?.empEmail,
            createdByName: user?.empName,
            updatedById: user?.jsplid,
            updatedByMail: user?.empEmail,
            updatedByName: user?.empName,
            mocChangeCategories: [
                {
                    slNo: 0, changeCategory: "", status: "", identificationName: "", createdById: user?.jsplid,
                    createdByMail: user?.empEmail,
                    createdByName: user?.empName, updatedById: user?.jsplid,
                    updatedByMail: user?.empEmail,
                    updatedByName: user?.empName,
                },
            ],
            mocChecklistsFormHeaders: [],
        },
        validationSchema,
        onSubmit: async (values) => {
            console.log("Form submitted:", values);
            toast.success("Form submitted successfully!", {
                position: "top-right",
            });
        },
    });

    const fetchUnits = useCallback(async () => {
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
                setUnitOptions(response);
            } else {
                setUnitOptions([]);
            }
        } catch (error) {
            console.error("Error fetching units:", error);
            toast.error("Failed to fetch units");
        }
    }, [token]);

    const fetchDepartments = useCallback(async (id: number) => {
        try {
            const response = await serverRequest(
                {},
                FETCH_DEPARTMENTS + `/get-departments/${id}`,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
            );
            if (response.length > 0) {
                setDepartmentOptions(response);
            } else {
                setDepartmentOptions([]);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
            toast.error("Failed to fetch departments");
        }
    }, [token]);

    const fetchSections = useCallback(async (departmentId: number) => {
        try {
            const response = await serverRequest(
                {},
                FETCH_SECTIONS + `/get-sections/${departmentId}`,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
            );
            if (response.length > 0) {
                setSectionOptions(response);
            } else {
                setSectionOptions([]);
            }
        } catch (error) {
            console.error("Error fetching sections:", error);
            toast.error("Failed to fetch sections");
        }
    }, [token]);

    const fetchChecklistHeaders = useCallback(async () => {
        try {
            const response = await serverRequest(
                {},
                FETCH_CHECKLIST_HEADERS,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
            );
            if (response.length > 0) {
                setCheckListName(response);
            }
        } catch (error) {
            console.error("Error fetching checklist headers:", error);
        }
    }, [token]);

    const fetchDepartmentHeads = useCallback(async (unitId: number) => {
        try {
            const response = await serverRequest(
                {},
                `${FETCH_DEPARTMENTS}/get-departments/${unitId}`,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
            );
            console.log("Department head response:----------", response);
            if (response && response.length > 0) {
                const departmentData = response[0];
                formik.setFieldValue("departmentHodId", departmentData.hod);
                formik.setFieldValue("departmentHodEmail", departmentData.hodEmail);
                formik.setFieldValue("departmentHodName", departmentData.hodName);
            } else {
                formik.setFieldValue("departmentHodId", null);
                formik.setFieldValue("departmentHodEmail", null);
                formik.setFieldValue("departmentHodName", null);
            }
        } catch (error) {
            console.error("Error fetching department head:", error);
        }
    }, [formik.setFieldValue, token]);

    const fetchSectionHeads = useCallback(async (unitId: number, departmentId: number, sectionId: number) => {
        try {
            const response = await serverRequest(
                {},
                FETCH_SECTIONS + `/${unitId}` + `/${departmentId}` + `/${sectionId}`,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
            );
            console.log("Section head response:----------", response);
            if (response?.sectionHead != null) {
                formik.setFieldValue("sectionHeadId", response?.sectionHead?.jsplid);
                formik.setFieldValue("sectionHeadMail", response?.sectionHead?.linemanagerEmail);
                formik.setFieldValue("sectionHeadName", response?.sectionHead?.linemanagerName);
            } else {
                formik.setFieldValue("sectionHeadId", null);
                formik.setFieldValue("sectionHeadMail", null);
                formik.setFieldValue("sectionHeadName", null);
            }
        } catch (error) {
            console.error("Error fetching section head:", error);
        }
    }, [formik.setFieldValue, token]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [units, checklists] = await Promise.all([fetchUnits(), fetchChecklistHeaders()]);
            if (mocNo && user?.jsplid) {
                try {
                    const updatedData = await serverRequest(
                        {},
                        `${FETCH_MOC_DETAIL}/${mocNo}`,
                        CONSTANTS.REQUEST_GET,
                        true,
                        true,
                        token);
                    if (updatedData) {
                        formik.setValues({
                            objectId: updatedData.id,
                            id: updatedData.id,
                            mocAfNo: updatedData.mocAfNo,
                            date: updatedData.createdDate ? new Date(updatedData.createdDate) : new Date(),
                            docNo: updatedData.docNo,
                            revNo: updatedData.revNo,
                            revDate: updatedData.revDate,
                            createdDate: updatedData.createdDate,
                            mocAfStatus: updatedData.mocAfStatus,
                            title: updatedData.title,
                            unitId: updatedData.unitId,
                            unitName: updatedData.unitName,
                            applicableForDays: updatedData.applicableForDays,
                            departmentId: updatedData.departmentId,
                            departmentName: updatedData.departmentName,
                            sectionId: updatedData.sectionId,
                            sectionName: updatedData.sectionName,
                            departmentHodId: updatedData.departmentHodId,
                            departmentHodEmail: updatedData.departmentHodEmail,
                            departmentHodName: updatedData.departmentHodName,
                            sectionHeadId: updatedData.sectionHeadId,
                            sectionHeadMail: updatedData.sectionHeadMail,
                            sectionHeadName: updatedData.sectionHeadName,
                            descriptionPresent: updatedData.descriptionPresent,
                            descriptionProposed: updatedData.descriptionProposed,
                            typeOfChange: updatedData.typeOfChange,
                            applicableTillDate: updatedData.applicableTillDate,
                            reasonForChange: updatedData.reasonForChange,
                            typeOfExpenditure: updatedData.typeOfExpenditure,
                            amount: updatedData.amount,
                            currency: updatedData.currency,
                            changeRequirePlantModification: updatedData.changeRequirePlantModification,
                            changeRequirePlantModificationDetails: updatedData.changeRequirePlantModificationDetails,
                            subsequentAffectedChange: updatedData.subsequentAffectedChange,
                            subsequentAffectedChangeDetails: updatedData.subsequentAffectedChangeDetails,
                            createdById: updatedData.createdById,
                            createdByMail: updatedData.createdByMail,
                            createdByName: updatedData.createdByName,
                            updatedById: updatedData.updatedById,
                            updatedByMail: updatedData.updatedByMail,
                            updatedByName: updatedData.updatedByName,
                            mocAfStatusModifiedDate: updatedData.mocAfStatusModifiedDate,
                            mocAfStatusModifiedById: user?.jsplid,
                            mocAfStatusModifiedByMail: user?.empEmail,
                            mocAfStatusModifiedByName: user?.empName,
                            mocAfPrimaryPendingAtId: user?.jsplid,
                            mocAfPrimaryPendingAtMail: user?.empEmail,
                            mocAfPrimaryPendingAtName: user?.empName,
                            mocAfPrimaryPendingFor: "Reverted",
                            mocChangeCategories: updatedData.mocChangeCategories || formik.initialValues.mocChangeCategories,
                            mocChecklistsFormHeaders: updatedData.mocChecklistsFormHeaders || [],
                        });

                        // Fetch dependent options after setting values
                        if (updatedData.unitId) {
                            await fetchDepartments(updatedData.unitId);
                            if (updatedData.departmentId) {
                                await fetchSections(updatedData.departmentId);
                            }
                        }
                        //  toast.info("Draft loaded successfully!");
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                    toast.error("Failed to load data.");
                }
            }
            setIsLoading(false);
        };

        loadData();
    }, [objectId, user?.jsplid, token, fetchUnits, fetchChecklistHeaders, fetchDepartments, fetchSections]);

    useEffect(() => {
        if (formik.values.unitId) {
            fetchDepartments(formik.values.unitId);
        }
    }, [formik.values.unitId, fetchDepartments]);

    useEffect(() => {
        if (formik.values.departmentId) {
            fetchSections(formik.values.departmentId);
        }
    }, [formik.values.departmentId, fetchSections]);

    useEffect(() => {
        if (formik.values.typeOfChange === "Permanent" && CheckListName.length > 0) {
            const existingHeaders = formik.values.mocChecklistsFormHeaders;
            if (existingHeaders.length === 0 || existingHeaders.length !== CheckListName.length) {
                formik.setFieldValue("mocChecklistsFormHeaders", CheckListName.map((item) => ({
                    headerShtCode: item.headerShtCode,
                    headerName: item.headerName,
                    createdById: user?.jsplid,
                    createdByMail: user?.empEmail,
                    createdByName: user?.empName,
                    updatedById: user?.jsplid,
                    updatedByMail: user?.empEmail,
                    updatedByName: user?.empName,
                    checklistPrimaryPendingAtId: null,
                    checklistPrimaryPendingAtName: null,
                    checklistPrimaryPendingAtMail: null,
                    mocChecklistsFormBodies: [],
                })));
            }
        }
    }, [formik.values.typeOfChange, user, CheckListName, formik.values.mocChecklistsFormHeaders.length]);

    const handleSaveNext = async () => {
        const errors = await formik.validateForm();


        if (Object.keys(errors).length > 0) {
            formik.setTouched({
                title: true,
                unitId: true,
                unitName: true,
                departmentId: true,
                departmentName: true,
                sectionId: true,
                sectionName: true,
                descriptionProposed: true,
                reasonForChange: true,
                mocChangeCategories: formik.values.mocChangeCategories.map(() => ({
                    status: true,
                    identificationName: true,
                })),
            });

            toast.error("Please fix the errors in the form.");
            return;
        }

        const serializableValues = {
            ...formik.values,
            mocChangeCategories: formik.values.mocChangeCategories.map((item, index) => ({
                ...item,
                createdById: item.createdById ?? user?.jsplid,
                createdByMail: item.createdByMail ?? user?.empEmail,
                createdByName: item.createdByName ?? user?.empName,
                updatedById: user?.jsplid,
                updatedByMail: user?.empEmail,
                updatedByName: user?.empName,
            })),
            mocChecklistsFormHeaders: formik.values.mocChecklistsFormHeaders.map((item) => ({
                ...item,
                updatedById: user?.jsplid,
                updatedByMail: user?.empEmail,
                updatedByName: user?.empName,
            })),
            date: formik.values.date
                ? dayjs(formik.values.date).toISOString()
                : null,
        };
        dispatch(setUpdateMocData(serializableValues));
        router.push(APP_URL.UPDATE_CHECKLIST_FORMS);
    };

    if (isLoading) {
        return <div className="text-center p-5">Loading...</div>;
    }

    return (
        <div className="container-fluid">
            <div className="admin-boxContainer d3">
                <div className="adminAction">
                    <Link href={APP_URL.MOC_DASHBOARD} className="adminAction__title">
                        <span className="icon">
                            <Image width={15} height={15} alt="icon" src="/images/svg/arrow-left-grey.svg" className="img-fluid u-image" />
                        </span>
                        Update MOC Request ({mocNo})
                    </Link>
                </div>
            </div>
            <div className="card shadow rounded-4 p-4">
                <div className="admin-boxContainer d1 nobackground" style={{ fontFamily: "inherit" }}>
                    <h6 style={{ fontWeight: 600 }}>
                        Management of Change <span style={{ fontWeight: 400 }}>(Technology and Facilities)</span>{" "}
                        <strong>Procedure</strong>
                    </h6>
                    <form className="form mt-4" onSubmit={formik.handleSubmit}>
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <select
                                    className="form-select form-select-sm"
                                    name="unitId"
                                    value={formik.values.unitId || ''}
                                    onChange={(e) => {
                                        const selectedUnitId = Number(e.target.value);
                                        const selectedUnit = unitOptions.find((unit) => unit.unitid === selectedUnitId);
                                        formik.setFieldValue("unitId", selectedUnitId || null);
                                        formik.setFieldValue("unitName", selectedUnit?.unitname || "");
                                        formik.setFieldValue("departmentId", null);
                                        formik.setFieldValue("departmentName", "");
                                        formik.setFieldValue("sectionId", null);
                                        formik.setFieldValue("sectionName", "");
                                    }}
                                    onBlur={formik.handleBlur}
                                >
                                    <option value="">Select Unit</option>
                                    {unitOptions.map((items) => (
                                        <option key={items.unitid} value={items.unitid}>
                                            {items.unitname}
                                        </option>
                                    ))}
                                </select>
                                {formik.touched.unitName && formik.errors.unitName && (
                                    <div className="text-danger">{formik.errors.unitName}</div>
                                )}
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select form-select-sm"
                                    name="departmentId"
                                    value={formik.values.departmentId || ''}
                                    onChange={(e) => {
                                        const selectedDepartmentId = Number(e.target.value);
                                        const selectedDepartment = departmentOptions.find((dept) => dept.departmentid === selectedDepartmentId);
                                        formik.setFieldValue("departmentId", selectedDepartmentId || null);
                                        formik.setFieldValue("departmentName", selectedDepartment?.departmentname || "");
                                        formik.setFieldValue("sectionId", null);
                                        formik.setFieldValue("sectionName", "");
                                    }}
                                    onBlur={formik.handleBlur}
                                >
                                    <option value="">Select Department</option>
                                    {departmentOptions.map((items) => (
                                        <option key={items.departmentid} value={items.departmentid}>
                                            {items.departmentname}
                                        </option>
                                    ))}
                                </select>
                                {formik.touched.departmentName && formik.errors.departmentName && (
                                    <div className="text-danger">{formik.errors.departmentName}</div>
                                )}
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select form-select-sm"
                                    name="sectionId"
                                    value={formik.values.sectionId || ''}
                                    onChange={(e) => {
                                        const selectedSectionId = e.target.value;
                                        const selectedSection = sectionOptions.find((sec) => sec.sectionid === selectedSectionId);
                                        formik.setFieldValue("sectionId", selectedSectionId || null);
                                        formik.setFieldValue("sectionName", selectedSection?.sectionname || "");
                                        fetchSectionHeads(formik.values.unitId, formik.values.departmentId, Number(selectedSectionId));
                                    }}
                                    onBlur={formik.handleBlur}
                                >
                                    <option value="">Select Section</option>
                                    {sectionOptions.map((items) => (
                                        <option key={items.sectionid} value={items.sectionid}>
                                            {items.sectionname}
                                        </option>
                                    ))}
                                </select>
                                {formik.touched.sectionName && formik.errors.sectionName && (
                                    <div className="text-danger">{formik.errors.sectionName}</div>
                                )}
                            </div>
                        </div>

                        <div className="row mb-4 ">
                            <div className="col-md-3">
                                <input
                                    type="date"
                                    value={dayjs().format("YYYY-MM-DD")}
                                    className="form-control form-control-sm"
                                    name="date"
                                    disabled
                                    onChange={formik.handleChange}
                                />
                            </div>
                            <div className="col-md-5">
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Enter Title"
                                    name="title"
                                    maxLength={500}
                                    value={formik.values.title?.toString() || ''}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    onKeyPress={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                                />
                                {formik.touched.title && formik.errors.title && (
                                    <div className="text-danger">{formik.errors.title}</div>
                                )}
                            </div>
                        </div>

                        <table className="table table-bordered mb-4" style={{ fontFamily: "inherit" }}>
                            <thead className="custom-table-header">
                                <tr>
                                    <th style={{ width: "35%" }}>Category</th>
                                    <th style={{ width: "20%" }}>Status</th>
                                    <th style={{ width: "25%" }}>Name of Product/Location/Equipment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {["Change/s to Process", "Change/s to Engineering / support systems", "Change/s to equipment", "Change/s to procedures"].map((category, index) => (
                                    <tr key={index} >
                                        <td>{category}</td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                name={`mocChangeCategories[${index}].status`}
                                                value={formik.values?.mocChangeCategories[index]?.status || ''}
                                                onChange={(e) => {
                                                    formik.handleChange(e);
                                                    formik.setFieldValue(`mocChangeCategories[${index}].slNo`, index + 1);
                                                    formik.setFieldValue(`mocChangeCategories[${index}].changeCategory`, category);
                                                }}
                                                onBlur={formik.handleBlur}
                                            >
                                                <option value="">Select</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Text here"
                                                name={`mocChangeCategories[${index}].identificationName`}
                                                value={formik.values?.mocChangeCategories[index]?.identificationName || ''}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
                            <div className="mb-4">
                                <label htmlFor="presentProcedure" className="form-label fw-bold">Description of the present procedure / system</label>
                                <textarea
                                    id="presentProcedure" className="form-control" name="descriptionPresent" rows={2} placeholder="Description of the present procedure / system"
                                    value={formik.values.descriptionPresent?.toString() || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                    onKeyPress={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                                ></textarea>
                                {formik.touched.descriptionPresent && formik.errors.descriptionPresent && (
                                    <div className="text-danger">{formik.errors.descriptionPresent}</div>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="proposedChange" className="form-label fw-bold">Description of the proposed change*:</label>
                                <textarea
                                    id="proposedChange" className="form-control" name="descriptionProposed" rows={2} placeholder="Description of the proposed change*"
                                    value={formik.values.descriptionProposed?.toString() || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                    onKeyPress={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                                ></textarea>
                                {formik.touched.descriptionProposed && formik.errors.descriptionProposed && (
                                    <div className="text-danger">{formik.errors.descriptionProposed}</div>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="form-label" style={{ color: "#F37021", fontWeight: 700, fontSize: "1.1rem" }}>Type of Change</label>
                                <div className="d-flex align-items-center gap-4 mt-2 mb-3">
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="typeOfChange" id="temporary" value="Temporary" checked={formik.values.typeOfChange === "Temporary"} disabled onChange={formik.handleChange} />
                                        <label className="form-check-label" htmlFor="temporary">Temporary</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="typeOfChange" id="permanent" value="Permanent" checked={formik.values.typeOfChange === "Permanent"} disabled onChange={formik.handleChange} />
                                        <label className="form-check-label" htmlFor="permanent">Permanent</label>
                                    </div>
                                    {formik.values.typeOfChange === "Temporary" && (
                                        <div className="col-md-2">
                                            <select className="form-select form-select-sm" name="applicableForDays" value={formik.values.applicableForDays || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                                                <option value={90}>90 Days</option>
                                                <option value={75}>75 Days</option>
                                                <option value={60}>60 Days</option>
                                                <option value={45}>45 Days</option>
                                                <option value={30}>30 Days</option>
                                                <option value={15}>15 Days</option>
                                                <option value={10}>10 Days</option>
                                                <option value={7}>7 Days</option>
                                                <option value={3}>3 Days</option>

                                            </select>
                                            {formik.touched.applicableForDays && formik.errors.applicableForDays && (
                                                <div className="text-danger">{formik.errors.applicableForDays}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {formik.touched.typeOfChange && formik.errors.typeOfChange && (
                                    <div className="text-danger">{formik.errors.typeOfChange}</div>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="justification" className="form-label fw-bold">Reasons (justification) for the proposed change*:</label>
                                <textarea
                                    id="justification" className="form-control" name="reasonForChange" rows={2} placeholder="Reason for change"
                                    value={formik.values.reasonForChange?.toString() || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                    onKeyPress={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                                ></textarea>
                                {formik.touched.reasonForChange && formik.errors.reasonForChange && (
                                    <div className="text-danger">{formik.errors.reasonForChange}</div>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold">Type of Expenditure  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Amount (in INR)</label>
                                <div className="d-flex align-items-center gap-4 mb-2">
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="typeOfExpenditure" id="capex" value="Capex" checked={formik.values.typeOfExpenditure === "Capex"} onChange={formik.handleChange} />
                                        <label className="form-check-label" htmlFor="capex">Capex</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="typeOfExpenditure" id="opex" value="Opex" checked={formik.values.typeOfExpenditure === "Opex"} onChange={formik.handleChange} />
                                        <label className="form-check-label" htmlFor="opex">Opex</label>
                                    </div>
                                    <input
                                        type="text" className="form-control form-control-sm ms-3" placeholder="Amount (e.g., 38.01 Cr)" name="amount"
                                        value={formik?.values?.amount?.toString() || ''} onChange={formik?.handleChange} onBlur={formik?.handleBlur} style={{ maxWidth: "200px" }}
                                    />
                                </div>
                                {formik.touched.typeOfExpenditure && formik.errors.typeOfExpenditure && (
                                    <div className="text-danger">{formik.errors.typeOfExpenditure}</div>
                                )}
                                {formik.touched.amount && formik.errors.amount && (
                                    <div className="text-danger">{formik.errors.amount}</div>
                                )}
                            </div>
                            <div className="mb-4 d-flex justify-content-between align-items-center">
                                <label className="form-label fw-bold mb-0">Does this change require plant modification?</label>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="changeRequirePlantModification" id="modNo" value="No" checked={formik.values.changeRequirePlantModification === "No"} onChange={formik.handleChange} />
                                        <label className="form-check-label" htmlFor="modNo">No</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="changeRequirePlantModification" id="modYes" value="Yes" checked={formik.values.changeRequirePlantModification === "Yes"} onChange={formik.handleChange} />
                                        <label className="form-check-label" htmlFor="modYes">Yes</label>
                                    </div>
                                </div>
                            </div>
                            {formik.values.changeRequirePlantModification === "Yes" && (
                                <div className="mb-4">
                                    <textarea
                                        className="form-control" placeholder="If yes, provide details" name="changeRequirePlantModificationDetails" rows={2}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); } }}
                                        value={formik.values.changeRequirePlantModificationDetails?.toString() || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                    ></textarea>
                                    {formik.touched.changeRequirePlantModificationDetails && formik.errors.changeRequirePlantModificationDetails && (
                                        <div className="text-danger">{formik.errors.changeRequirePlantModificationDetails}</div>
                                    )}
                                </div>
                            )}
                            <div className="mb-4 d-flex justify-content-between align-items-center">
                                <label className="form-label fw-bold mb-0">Whether subsequent stages are affected by this change:</label>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="subsequentAffectedChange" id="stageNo" value="No" checked={formik.values.subsequentAffectedChange === "No"} onChange={formik.handleChange} />
                                        <label className="form-check-label" htmlFor="stageNo">No</label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="subsequentAffectedChange" id="stageYes" value="Yes" checked={formik.values.subsequentAffectedChange === "Yes"} onChange={formik.handleChange} />
                                        <label className="form-check-label" htmlFor="stageYes">Yes</label>
                                    </div>
                                </div>
                            </div>
                            {formik.values.subsequentAffectedChange === "Yes" && (
                                <div className="mb-4">
                                    <textarea
                                        className="form-control" placeholder="If yes, provide details" name="subsequentAffectedChangeDetails" rows={2}
                                        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                                        value={formik.values.subsequentAffectedChangeDetails?.toString() || ''} onChange={formik.handleChange} onBlur={formik.handleBlur}
                                    ></textarea>
                                    {formik.touched.subsequentAffectedChangeDetails && formik.errors.subsequentAffectedChangeDetails && (
                                        <div className="text-danger">{formik.errors.subsequentAffectedChangeDetails}</div>
                                    )}
                                </div>
                            )}
                            <div className="mb-4">
                                <strong style={{ fontSize: "18px", color: "#333" }}>Mandatory checklists must be completed for MOC approval.</strong>
                                <div className="d-flex flex-wrap gap-4 mt-3">
                                    {CheckListName.map((item, idx) => (
                                        <label
                                            key={idx} className="d-flex align-items-center gap-2"
                                            style={{ fontSize: "16px", fontWeight: 400, cursor: "pointer" }}
                                        >
                                            <input
                                                type="checkbox" value={item.headerShtCode} disabled
                                                checked={formik.values.mocChecklistsFormHeaders.some((header) => header.headerShtCode === item.headerShtCode)}
                                                name="mocChecklistsFormHeaders" style={{ width: "18px", height: "18px" }}
                                                className={`form-check-input ${formik.values.typeOfChange === "Permanent" ? "green" : ""}`}
                                                onChange={(e) => {
                                                    const headers = formik.values.mocChecklistsFormHeaders;
                                                    const isChecked = headers.some((h) => h.headerShtCode === item.headerShtCode);
                                                    const updatedHeaders = isChecked
                                                        ? headers.filter((h) => h.headerShtCode !== item.headerShtCode)
                                                        : [
                                                            ...headers,
                                                            {
                                                                headerShtCode: item.headerShtCode, headerName: item.headerName, createdById: user?.jsplid, createdByMail: user?.empEmail,
                                                                createdByName: user?.empName, updatedById: user?.jsplid, updatedByMail: user?.empEmail,
                                                                updatedByName: user?.empName, checklistPrimaryPendingAtId: null, checklistPrimaryPendingAtName: null,
                                                                checklistPrimaryPendingAtMail: null, mocChecklistsFormBodies: [],
                                                            },
                                                        ];
                                                    formik.setFieldValue("mocChecklistsFormHeaders", updatedHeaders);
                                                }}
                                            />
                                            <div className="d-flex" style={{ alignItems: 'center' }}>
                                                <div className={`${formik?.values.mocChecklistsFormHeaders?.some((header) => (header?.headerShtCode === item.headerShtCode) && (header?.headerName) && header?.mocChecklistsFormBodies?.length > 0) ? 'green-circle' : 'circle'}`} />
                                                {item.headerShtCode}
                                            </div>
                                        </label>
                                    ))}
                                </div><br />
                                <div
                                    style={{
                                        fontSize: "15px",
                                        fontWeight: 500,
                                        color: "#555",
                                        lineHeight: "1.8",
                                        background: "#f8f9fa",
                                        borderLeft: "4px solid #007bff",
                                        padding: "10px 15px",
                                        borderRadius: "6px",
                                        marginTop: "10px",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "10px"
                                    }}
                                >
                                    {[
                                        "C1 - Operating Methods",
                                        "C2 - Process",
                                        "C3 - Safety",
                                        "C4 - Environment",
                                        "C5 - Maintenance",
                                        "C6 - Materials"
                                    ].map((item, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                border: "1px solid #007bff",
                                                borderRadius: "20px",
                                                padding: "5px 12px",
                                                background: "#fff",
                                                color: "#007bff",
                                                fontSize: "14px",
                                                fontWeight: 500
                                            }}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>

                            </div>
                            <div className="d-flex justify-content-end">
                                <div className="d-flex justify-content-end mt-10">
                                    <button
                                        type="button"
                                        className={`iconBtn ${formik.isValid ? "orange" : "disable"}`}
                                        disabled={!formik.isValid}
                                        onClick={handleSaveNext}
                                        style={{
                                            width: "120px",
                                            height: "38px",
                                            fontSize: "18px",
                                            borderRadius: "5px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Next
                                    </button>

                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000}
                hideProgressBar={false} closeOnClick pauseOnHover />
        </div>

    );
};

export default ProtectedRoute(User);