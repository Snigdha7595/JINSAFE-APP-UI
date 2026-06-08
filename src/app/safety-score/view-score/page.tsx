"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { selectUserToken } from "@/store/slices/authSlice";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_DEPARTMENTS, FETCH_UNITS, FETCH_SAFETY_SCORE } from "@/config/apiConfig";   
import {APP_URL, CONSTANTS } from "@/config/constant";
import { emptySelector } from "@/config/config";
import { SelectOptions } from "@/components/interfaces";
import SelectField from "@/components/Form/SelectFields";

import { getScorecardApi } from "@/services/fireSafety.service";
import { getSubmissionWindowApi } from "@/services/fireSafety.service";

interface SafetyBoardFormValues {
    unitId: string;
    departmentId: string;
    unitName?: string;
    departmentName?: string;
    totalScore?: string;
    month?: string;
}

interface SafetyUnitWithAccordionProps {
    initialData?: Partial<SafetyBoardFormValues>;
    onSubmit: (values: SafetyBoardFormValues, formikHelpers: FormikHelpers<SafetyBoardFormValues>) => void | Promise<void>;
    isDisabled?: boolean;
}

interface DropdownOption {
    id: string;
    name: string;
}

interface DepartmentData {
    createdAt: string;
    departmentid: number;
    departmentname: string;
    hod: string;
    hodEmail: string;
    jsplid: string;
    lwUpdatedAt: string;
    monthlyScheduleCfsa: number;
    monthlyScheduleLw: number;
    monthlyScheduleSi: number;
    rowIndex: number;
    siUpdatedAt: string;
    status: "active" | "inactive";
    statusImage: string;
    unitid: number;
    updatedAt: string;
    weeklyScheduleLw: number;
    weeklyScheduleSi: number;
    safetyScoreFlag: boolean;
}

interface SubParameter {
    id: string;
    name: string;
    weight: number;
    rule: "positive" | "negative";
    uom: string;
    type: "leading" | "lagging" | "current" | null;
    achieved: number;
    result: number;
}

interface MainParameter {
    id: string;
    subtotal: number;
    achievedTotal: number;
    name: string;
    subParams: SubParameter[];
}

interface UserData {
    empUnit: string;
    unitId: string;
    unitDisplay: string;
    departmentDisplay?: string;
    role?: string | string[];
}

const MocUnitSchema = Yup.object().shape({
    unitId: Yup.string()
        .required('Unit is required')
        .notOneOf([''], 'Please select a unit'),

    departmentId: Yup.string()
        .required('Department is required')
        .notOneOf([''], 'Please select a department'),
});

const VIEWSCORE: React.FC<SafetyUnitWithAccordionProps> = ({
    initialData = {},
    onSubmit,
    isDisabled = false
}) => {
    const router = useRouter();
    const [units, setUnits] = useState<DropdownOption[]>([]);
    const [unitOptions, setUnitOptions] = useState<SelectOptions[]>(emptySelector);
    const [departmentOptions, setDepartmentOptions] = useState<SelectOptions[]>(emptySelector);
    const [departments, setDepartments] = useState<DepartmentData[]>([]);
    const [loading, setLoading] = useState({
        units: false,
        departments: false
    });
    const [mainParameters, setMainParameters] = useState<MainParameter[]>([]);
    const [openMainParam, setOpenMainParam] = useState<Record<string, boolean>>({});
    // const [applicable, setApplicable] = useState<Record<string, boolean>>({});
    const [values, setValues] = useState<Record<string, Record<string, number>>>({});
    const [totalScore, setTotalScore] = useState<string>('0');
    const [achievedScore, setAchievedScore] = useState<string>('0');
    const [resultScore, setResultScore] = useState<string>('0');
    const [isSelectionFrozen, setIsSelectionFrozen] = useState(false);
    const [selectedUnitOption, setSelectedUnitOption] = useState<SelectOptions | null>(null);
    const [selectedDepartmentOption, setSelectedDepartmentOption] = useState<SelectOptions | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedMonthOption, setSelectedMonthOption] = useState<SelectOptions | null>({
        value: String(new Date().getMonth() + 1),
        label: new Date().toLocaleString('default', { month: 'long' })
    });
    const { user } = useSelector(
        (state: RootState) => state.auth as { user: UserData }
    );
      const token = useSelector(selectUserToken);

    // Submission Window States
    const [submissionWindow, setSubmissionWindow] = useState<{
        unitId: number;
        submissionStartDate: string;
        submissionEndDate: string;
        isSubmissionOpen: boolean;
    } | null>(null);
    const [isSubmissionWindowLoading, setIsSubmissionWindowLoading] = useState(false);

    useEffect(() => {
        if (token) {
            fetchUnits();
        }
    }, [token]); 

    // Initialize selectedUnitOption from user state or initial data when unitOptions are loaded
    useEffect(() => {
        if (unitOptions && unitOptions.length > 0 && !selectedUnitOption) {
            let matchedUnit = null;
             // First try to match from user's unitDisplay
            if (user?.unitDisplay) {
                matchedUnit = unitOptions.find(
                    (option) => option.label === user.unitDisplay
                );
            }
            // If not found, try from initial data
            if (!matchedUnit && initialData?.unitId) {
                matchedUnit = unitOptions.find(
                    (option) => option.value === initialData.unitId
                );
            }
            if (matchedUnit) {
                setSelectedUnitOption(matchedUnit);
                // Fetch departments for the auto-selected unit
                fetchDepartments(matchedUnit.value);
            }
        }
    }, [unitOptions, user?.unitDisplay, initialData?.unitId]); 

    const fetchUnits = async () => {
        setLoading(prev => ({ ...prev, units: true }));
        try {
            const response = await serverRequest(
                {},
                FETCH_UNITS + `/get-units`,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
            );
            console.log("fetchUnits response:", response);
            if (response && response.length > 0) {
                const options = response.map((unit: any) => ({
                    value: unit?.unitid?.toString(),
                    label: unit?.unitname,
                }));
                setUnitOptions(options);
                // Also keep units for backward compatibility
                const unitsFormatted = response.map((unit: any) => ({
                    id: unit?.unitid?.toString(),
                    name: unit?.unitname,
                }));
                setUnits(unitsFormatted);
            } else {
                setUnitOptions(emptySelector);
                setUnits([]);
            }
        } catch (error) {
            console.error('Error fetching units:', error);
            setUnitOptions(emptySelector);
            setUnits([]);
        } finally {
            setLoading(prev => ({ ...prev, units: false }));
        }
    };

    // const fetchDepartments = async (unitId: string) => {
    //     setLoading(prev => ({ ...prev, departments: true }));
    //     try {
    //         setDepartmentOptions(emptySelector);
    //         setDepartments([]);
    //         const response = await serverRequest(
    //             {},
    //             FETCH_DEPARTMENTS + `/get-departments/${unitId}/`,
    //             CONSTANTS.REQUEST_GET,
    //             true,
    //             true,
    //             token
    //         );
    //         console.log("fetchDepartments response for unitId", unitId, ":", response);
    //         if (response && response.length > 0) {
    //             const options = response.map((dept: DepartmentData) => ({
    //                 value: dept?.departmentid?.toString(),
    //                 label: dept?.departmentname,
    //             }));
    //             setDepartmentOptions(options);
    //             setDepartments(response);
    //         } else {
    //             setDepartmentOptions(emptySelector);
    //             setDepartments([]);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching departments:', error);
    //         setDepartmentOptions(emptySelector);
    //         setDepartments([]);
    //     } finally {
    //         setLoading(prev => ({ ...prev, departments: false }));
    //     }
    // };

    const fetchDepartments = async (unitId: string) => {
    setLoading(prev => ({ ...prev, departments: true }));
    try {
        setDepartmentOptions(emptySelector);
        setDepartments([]);
        const response = await serverRequest(
            {},
         FETCH_DEPARTMENTS  +  `/get-safetyscore-departments/${unitId}`,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            token
        );
        console.log("New Safety Dept API response:", response);
        if (response && response.length > 0) {
        const filteredDepartments = response.filter(
         (dept: any) => dept.safetyScoreFlag === true
            );
    //     const filteredDepartments = response.filter(
    //     (dept: any) =>
    //     dept.safetyScoreFlag === true &&
    //    dept.departmentname === user.departmentDisplay
    //    );
       const options = filteredDepartments.map((dept: any) => ({
                value: dept.departmentid?.toString(),
                label: dept.departmentname,
            }));
            setDepartmentOptions(options);
            setDepartments(filteredDepartments);
            } else {
            setDepartmentOptions(emptySelector);
            setDepartments([]);
            }
        } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartmentOptions(emptySelector);
        setDepartments([]);
    } finally {
        setLoading(prev => ({ ...prev, departments: false }));
    }
};

    // Initialize selectedDepartmentOption from user state or initial data when departmentOptions are loaded
    useEffect(() => {
        if (departmentOptions && departmentOptions.length > 0 && !selectedDepartmentOption) {
            let matchedDept = null;
            // First try to match from user's departmentDisplay
            if (user?.departmentDisplay) {
                matchedDept = departmentOptions.find(
                    (option) => option.label === user.departmentDisplay
                );
            }
            // If not found, try from initial data
            if (!matchedDept && initialData?.departmentId) {
                matchedDept = departmentOptions.find(
                    (option) => option.value === initialData.departmentId
                );
            }
            if (matchedDept) {
                setSelectedDepartmentOption(matchedDept);
            }
        }
    }, [departmentOptions, user?.departmentDisplay, initialData?.departmentId]);

    // Trigger fetchScorecard when department is auto-selected
    useEffect(() => {
        if (selectedUnitOption && selectedDepartmentOption) {
            fetchScorecard(selectedUnitOption.value, selectedDepartmentOption.value);
            setIsSelectionFrozen(true);
        }
    }, [selectedDepartmentOption]);

    // const fetchSubmissionWindow = async (unitId: string) => {
    //     setIsSubmissionWindowLoading(true);
    //     try {
    //         const { data } = await getSubmissionWindowApi(Number(unitId));
    //         console.log("Submission Window API Data:", data);
    //         setSubmissionWindow(data);
    //     } catch (error) {
    //         console.error("Error fetching submission window:", error);
    //         setSubmissionWindow(null);
    //     } finally {
    //         setIsSubmissionWindowLoading(false);
    //     }
    // };   


// const fetchScorecard = async (unitId: string, departmentId: string) => {
//     try {
//         const month = Number(selectedMonth);
//         const year = new Date().getFullYear();
//         const response = await serverRequest(
//             {},
//             FETCH_SAFETY_SCORE + `/dept-scorecard?unitId=${Number(unitId)}&departmentId=${Number(departmentId)}&month=${month}&year=${year}`,
//             CONSTANTS.REQUEST_GET,
//             true,
//             true,
//             token
//         );
// // const data = response?.data;
//         const data = response;
//         if (!data) {
//             setMainParameters([]);
//             return;
//         }
//  /* ---------- SET TOTAL SCORE ---------- */
//     setTotalScore(String(data?.overallWeightage || 0)); // Total Score
//     setResultScore(String(data?.overallResult || 0));   // Result Score
// /* ---------- MAP HEADERS ---------- */
//     const mappedParameters: MainParameter[] = data.headers.map((header: any) => ({
//             id: header.headerId.toString(),
//             name: header.headerName,
//             subtotal: header.weightageTotal,   //  Sub Total
//             achievedTotal: header.resultTotal, //  Result Total
//             subParams: header.lineItems.map((item: any) => {
//             const type = item.parameterType ? item.parameterType.toLowerCase() : null;
//         return {
//         id: item.lineItemId.toString(),
//         name: item.lineItemName,
//         weight: item.weightage,
//         rule: type === "lagging" ? "negative" : "positive",
//         uom: item.uom,
//         type: type,
//         achieved: item.achievedScore,
//         // result: item.result
//         result: item.result,
//     };
// }),
//   }));
// const valueMap: Record<string, any> = {};
//         data.headers.forEach((header: any) => {
//             header.lineItems.forEach((item: any) => {
//                 valueMap[item.lineItemId] = {
//                     value: item.achievedScore,
//                 };
//             });
//         });
// const applicableMap: Record<string, boolean> = {};
//         data.headers.forEach((header: any) => {
//             applicableMap[header.headerId] = header.isApplicable;
//         });
// // setApplicable(applicableMap);
//         setValues(valueMap);
//         setMainParameters(mappedParameters);
// } catch (error) {
//         console.error("Error fetching scorecard:", error);
//     }
// };

const fetchScorecard = async (unitId: string, departmentId: string) => {
    try {
        const month = Number(selectedMonth);
        const year = new Date().getFullYear();

        const response = await serverRequest(
            {
                unitId: Number(unitId),
                departmentId: Number(departmentId),
                month: month,
                year: year
            },
            FETCH_SAFETY_SCORE + `/dept-scorecard`,
            CONSTANTS.REQUEST_POST,
            true,
            true,
            token
        );

        const data = response?.response;

        if (!data) {
            setMainParameters([]);
            return;
        }

        //  Set totals
        setTotalScore(String(data?.overallWeightage ?? 0));
        setResultScore(String(data?.overallResult ?? 0));
        // setTotalScore(String(data.overallWeightage || 0));
        // setResultScore(String(data.overallResult || 0));

        // Map headers 
        const mappedParameters: MainParameter[] = (data.headers ?? [])
    .filter((h: any) => h?.isApplicable !== false)
    .map((header: any) => ({
        id: String(header?.headerId ?? ""),
        name: header?.headerName ?? "-",
        subtotal: Number(header?.weightageTotal ?? 0),
        achievedTotal: Number(header?.resultTotal ?? 0),
        subParams: (header?.lineItems ?? []).map((item: any) => ({
            id: String(item?.lineItemId ?? ""),
            name: item?.lineItemName ?? "-",
            weight: Number(item?.weightage ?? 0),
            uom: item?.uom ?? "-",
            type: item?.parameterType?.toLowerCase?.() ?? null,
            achieved: Number(item?.achievedScore ?? 0),
            result: Number(item?.result ?? 0)
        }))
    }));
        // const mappedParameters: MainParameter[] = data.headers
        //     .filter((h: any) => h.isApplicable !== false)
        //     .map((header: any) => ({
        //         id: header.headerId.toString(),
        //         name: header.headerName,
        //         subtotal: header.weightageTotal,
        //         achievedTotal: header.resultTotal,
        //         subParams: header.lineItems.map((item: any) => ({
        //             id: item.lineItemId.toString(),
        //             name: item.lineItemName,
        //             weight: item.weightage,
        //             uom: item.uom,
        //             type: item.parameterType?.toLowerCase(),
        //             achieved: item.achievedScore,
        //             result: item.result
        //         }))
        //     }));

        setMainParameters(mappedParameters);

    } catch (error) {
        console.error("Error fetching scorecard:", error);
    }
};


 useEffect(() => {
    let overallAchieved = 0;
    let totalScoreSum = 0;
    let overallResultScore = 0;

    mainParameters.forEach((param) => {
        // Sum of subtotals for total score
        totalScoreSum += param.subtotal;
        
        // Calculation of achieved score
        param.subParams.forEach((sub) => {
            const value = values?.[sub.id]?.value || 0;
            overallAchieved += value * sub.weight;
        });
         });
setAchievedScore(overallAchieved.toFixed(2));
    // setTotalScore(totalScoreSum.toFixed(2));
    // setResultScore(overallResultScore.toFixed(2));
}, [values, mainParameters]);

const toggleMainParam = (paramId: string) => {
        setOpenMainParam((prev) => ({
            ...prev,
            [paramId]: !prev[paramId]
        }));
    };

    // const toggleApplicable = (paramId: string) => {
    //     const isCurrentlyApplicable = applicable?.[paramId] ?? false;

    //     setApplicable((prev) => ({
    //         ...prev,
    //         [paramId]: !isCurrentlyApplicable
    //     }));

    //     if (isCurrentlyApplicable) {
    //         setOpenMainParam((prev) => ({
    //             ...prev,
    //             [paramId]: false
    //         }));
    //     }
    // };

    const handleValueChange = (subParamId: string, value: string) => {
        console.log("Value changed for", subParamId, "New value:", value,"values",values);
        setValues((prev) => ({
            ...prev,
            [subParamId]: { value: value === '' ? 0 : Number(value) },
        }));
    };

const calculateAchievedScore = (param: MainParameter) => {
    let total = 0;
 param.subParams.forEach((sub) => {
        const value = values?.[sub.id]?.value || 0;
        total += value * sub.weight;
    });

    return total.toFixed(2);
};

    const calculateParameterSubtotal = (param: MainParameter) => {
        let totalWeight = 0;
        param.subParams.forEach((sub) => {
            totalWeight += sub.weight;
        });
        return totalWeight;
    };

    const calculateParameterResultTotal = (param: MainParameter) => {
        let total = 0;
        param.subParams.forEach((sub) => {
            const result = sub.achieved === 0 ? sub.weight : (sub.weight * (-sub.achieved));
            total += result;
        });
        return total.toFixed(2);
    };


// const initialValues: SafetyBoardFormValues = {
//         unitId: selectedUnitOption?.value || initialData?.unitId || '',
//         departmentId: selectedDepartmentOption?.value || initialData?.departmentId || '',
//         unitName: selectedUnitOption?.label || initialData?.unitName || '',
//         departmentName: selectedDepartmentOption?.label || initialData?.departmentName || '',
//         totalScore: totalScore,
//         month: selectedMonth,
//     };
const initialValues: SafetyBoardFormValues = {
    unitId: selectedUnitOption?.value ?? initialData?.unitId ?? '',
    departmentId: selectedDepartmentOption?.value ?? initialData?.departmentId ?? '',
    unitName: selectedUnitOption?.label ?? initialData?.unitName ?? '',
    departmentName: selectedDepartmentOption?.label ?? initialData?.departmentName ?? '',
    totalScore: totalScore ?? "0",
    month: selectedMonth ?? "",
};


if (!user) return null;
const isDSO =
  Array.isArray(user?.role)
    ? user.role.includes("DSO")
    : user?.role === "DSO";
if (
  selectedDepartmentOption &&
  user?.departmentDisplay &&
  selectedDepartmentOption.label !== user.departmentDisplay &&
  isDSO
) {
  return (
    <div
      style={{
        height: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h2 style={{ color: "#c62828" }}>
        🚫 You are not authorized to view this department!
      </h2>
    </div>
  );
}

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={MocUnitSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
        >
            {({ isSubmitting, setFieldValue, values }) => (
                
                <div className='container-fluid p-4'>
                   <div className="admin-boxContainer d3">
                    <div className="adminAction">
                    <Link href={APP_URL.SAFETY_SCORE}  className="adminAction__title">
                    <span className="icon">
                     <img
                     src="/images/svg/arrow-left-grey.svg"
                    alt="back"
                    width={15}
                    height={15}
                    />
                  </span>
                 View-Scorecard
                  </Link>
                 </div>
                </div> 

                 <div style={{ marginBottom: 16, marginTop: -30, display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                   <button
                   className="iconBtn green w100"
                //    onClick={() => router.push("/safety-score/add-safety")}
                    onClick={() => router.push(APP_URL.SAFETY_SCORE_NEW)}
                   >
                  <span>Safety Scoreboard Details</span>
                  <img width="20" height="20" alt="Add" src="/images/svg/icons/Add.svg" className="white-icon" />
                  </button>
                  </div>

                    <div className="card shadow rounded-4 px-4 pb-4 pt-0">
                        <div className="c-accordion">
                            <div className="c-accordion__head">
                                <div className="c-accordion__head--title">Unit Section</div>
                            </div>
                        </div>

                        <div className="p-3 border rounded mt-0">
                            <Form>
                                <div className="row g-3 ">
                                    {/* Unit Dropdown */}
                                    <div className="col-md-3 ">
                                        <SelectField
                                            label="Unit Name"
                                            value={selectedUnitOption}
                                            name="unitId"
                                            placeholder="Select Unit"
                                            options={unitOptions}
                                            disabled={true} 
                                            // disabled={isSelectionFrozen}
                                            onChange={(selectedOption: SelectOptions) => {
                                            setSelectedUnitOption(selectedOption);   //  label store
                                            setFieldValue('unitId', selectedOption.value);
                                            setFieldValue('unitName', selectedOption.label);
                                            setFieldValue('departmentId', '');
                                            setFieldValue('departmentName', '');
                                            setSelectedDepartmentOption(null);       // reset department
                                            fetchDepartments(String(selectedOption.value));
                                            // fetchSubmissionWindow(String(selectedOption.value));
                                            }}
                                        />
                                    </div>

                                    {/* Department Dropdown */}
                                    <div className="col-md-3 ">
                                        <SelectField
                                            label="Department"
                                            value={selectedDepartmentOption}
                                            name="departmentId"
                                            placeholder="Select Department"
                                            options={departmentOptions}
                                              disabled={true} 
                                            // disabled={isSelectionFrozen}
                                            onChange={(selectedOption: SelectOptions) => {
                                            setSelectedDepartmentOption(selectedOption);  //  label store
                                            setFieldValue('departmentId', selectedOption.value);
                                            setFieldValue('departmentName', selectedOption.label);
                                            if (values.unitId) {
                                            fetchScorecard(values.unitId, selectedOption.value);
                                            setIsSelectionFrozen(true);
                                            }
                                            }}
                                        />
                                    </div>

                                    {/* {submissionWindow?.isSubmissionOpen && (
                                        <> */}
                                            <div className="col-md-3 d-flex flex-column">
                                                <label htmlFor="totalScore" >
                                                    Total Weightage
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    //  style={{ height: "38px" }}
                                                    id="totalScore"
                                                    name="totalScore"
                                                    value={totalScore}
                                                    readOnly
                                                    // disabled
                                                    placeholder="Total score"
                                                />
                                            </div>
                                            <div className="col-md-3 d-flex flex-column">
                                                <label htmlFor="resultScore" >
                                                    Result Score
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                     style={{ height: "38px" }}
                                                    id="resultScore"
                                                    name="resultScore"
                                                     value={resultScore}
                                                    readOnly
                                                />
                                            </div>
                                        {/* </>
                                    )} */}

                                    {/* Month Picker */}
                                    <div className="col-md-3">
                                        <SelectField
                                            label="Month"
                                            name="month"
                                            placeholder="Select Month"
                                            value={selectedMonthOption}
                                            options={[
                                                { value: "1", label: "January" },
                                                { value: "2", label: "February" },
                                                { value: "3", label: "March" },
                                                { value: "4", label: "April" },
                                                { value: "5", label: "May" },
                                                { value: "6", label: "June" },
                                                { value: "7", label: "July" },
                                                { value: "8", label: "August" },
                                                { value: "9", label: "September" },
                                                { value: "10", label: "October" },
                                                { value: "11", label: "November" },
                                                { value: "12", label: "December" },
                                            ]}
                                            onChange={(selectedOption: SelectOptions) => {
                                                setSelectedMonthOption(selectedOption);
                                                setSelectedMonth(selectedOption.value);
                                                setFieldValue('month', selectedOption.value);
                                                if (selectedUnitOption && selectedDepartmentOption) {
                                               fetchScorecard(selectedUnitOption.value, selectedDepartmentOption.value);
                                              }
                                            }}
                                        />
                                    </div>
                                </div>
                            </Form>
                        </div>

                        <div className="mt-2">
                             {/* {submissionWindow && !submissionWindow.isSubmissionOpen && (
                                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                                    <strong>Submission Window Closed</strong>
                                    <p className="mb-0">
                                        The submission window for this unit is currently closed. 
                                        <br/>
                                        <small>
                                            Start Date: {new Date(submissionWindow.submissionStartDate).toLocaleDateString()}
                                            <br/>
                                            End Date: {new Date(submissionWindow.submissionEndDate).toLocaleDateString()}
                                        </small>
                                    </p>
                                </div> 
                            )} */}

                            {/* {submissionWindow?.isSubmissionOpen ? ( */}
                                <>
                                    <h5 className="mb-3">Safety Parameters</h5>
                                     {(mainParameters ?? []).map((param, index) => {
                                    {/* {mainParameters.map((param, index) => { */}
                                // const isApplicable = applicable?.[param.id] ?? false;
                                const isOpen = openMainParam?.[param.id] ?? false;

                                return (
                                    <div key={param.id} style={{ marginBottom: 15 }}>
                                          <div
                                          style={{
                                          background: "#446183",
                                          padding: "10px 15px",
                                          display: "flex",
                                          color: "white",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        //   borderRadius: "10px",
                                          marginBottom: "10px",
                                          cursor: "pointer"
                                          }}
                                         onClick={() => toggleMainParam(param.id)}
                                          >
                                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                <span style={{ fontWeight: 500 }}>{index + 1}. {param?.name ?? "-"}</span>

                                                <span style={{ fontSize: "14px", background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "15px" }}>
                                                     Weightage SubTotal: {param?.subtotal ?? 0}
                                                    {/* Weightage SubTotal: {param.subtotal} */}
                                                </span>

                                                <span style={{ fontSize: "14px", background: "rgba(210, 155, 155, 0.2)", padding: "3px 10px", borderRadius: "15px" }}>
                                                     Result Total: {param?.achievedTotal ?? 0}
                                                   {/* Result Total: {param.achievedTotal} */}
                                                </span>
                                            </div>
                                            <div>
                                              {isOpen ? (
                                                <img
                                                  width="20"
                                                  height="20"
                                                  alt="collapse"
                                                  src="/images/svg/up-arrow.svg"
                                                  style={{ filter: "brightness(0) invert(1)" }}
                                                />
                                              ) : (
                                                <img
                                                  width="20"
                                                  height="20"
                                                  alt="expand"
                                                  src="/images/svg/down-arrow.svg"
                                                  style={{ filter: "brightness(0) invert(1)" }}
                                                />
                                              )}
                                            </div>
                                        </div>

                                        {/* {isOpen && isApplicable && ( */}
                                        {isOpen && (
                                            <div className="admin-boxContainer d1 ">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="admin-table d3 table-responsive noHover">
                                                            <table
                                                                className="table"
                                                                cellPadding="6"
                                                                style={{ width: "100%" }}
                                                            >
                                                                <thead style={{ background: "#D4DDE8", color: "black" }}>
                                                                    <tr className="text-center">
                                                                        <th>Sr no.</th>
                                                                        <th>Parameter Type</th>
                                                                        <th style={{ width: "25%" }}>Sub Parameter</th>  
                                                                        <th>Weightage</th>
                                                                        <th>UOM</th>
                                                                        <th style={{ width: "15%" }}>Input</th>         
                                                                        <th>Result</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {param.subParams.map((sub, subIndex) => (
                                                                        <tr key={sub.id} className="text-center">
                                                                            <td>{subIndex + 1}</td>
                                                                            <td>
                                                                            <span
                                                                       className={`fw-bold ${
                                                                       sub.type === "leading"
                                                                       ? "text-success"
                                                                       : sub.type === "lagging"
                                                                       ? "text-danger"
                                                                       : "text-secondary"
                                                                       }`}
                                                                        >
                                                                       {/* {sub.type === null
                                                                        ? "null"
                                                                      : sub.type.charAt(0).toUpperCase() + sub.type.slice(1)} */}

                                                                      {sub.type
                                                                      ? sub.type.charAt(0).toUpperCase() + sub.type.slice(1)
                                                                      : ""}
                                                                      </span>
                                                                            </td>
                                                                            {/* <td>{sub.name}</td>
                                                                            <td>{sub.weight}</td>
                                                                            <td>{sub.uom}</td>
                                                                            <td>
                                                                                {sub.achieved}
                                                                            </td> */}
                                                                            <td>{sub?.name ?? "-"}</td>
                                                                            <td>{sub?.weight ?? 0}</td>
                                                                            <td>{sub?.uom ?? "-"}</td>
                                                                            <td>{sub?.achieved ?? 0}</td>
                                                                            <td>
                                                                            {sub.result ?? "-"}
                                                                        </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>

                                                            <div className="d-flex justify-content-end">
                                                                <div className="d-flex justify-content-end mt-10">
                                                                     
                                                                </div> 
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                                </>
                            {/* ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted">Please select a unit to check the submission window status.</p>
                                </div>
                            )} */}

                            {submissionWindow?.isSubmissionOpen && (
                                <div className="d-flex justify-content-end mt-4">
                                    <div className="d-flex justify-content-end mt-10">
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            )
            }
        </Formik>
    );
};

export default ProtectedRoute (VIEWSCORE);