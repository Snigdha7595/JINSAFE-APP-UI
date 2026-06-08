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
import { selectUserRole } from "@/store/slices/authSlice";
import { SelectOptions } from "@/components/interfaces";
import SelectField from "@/components/Form/SelectFields";
import { ToastContainer, toast } from "react-toastify";
import CustomModal from "@/components/Layouts/CustomModal";
import { getScorecard } from "@/services/fireSafety.service";
import { saveScoreApi } from "@/services/fireSafety.service";
import { getSubmissionWindowApi } from "@/services/fireSafety.service";
import { getDraftApi } from "@/services/fireSafety.service";
import InputField from "@/components/Form/InputField";

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
}

interface SubParameter {
    id: string;
    name: string;
    weight: number;
    rule: "positive" | "negative";
    uom: string;
    type: "leading" | "lagging" | "current" | null;
    decimalPrecision?: number;
    maxValue?: number | null;
    achieved: number;
}

interface MainParameter {
    id: string;
    subtotal: number;
    name: string;
    subParams: SubParameter[];
}

interface UserData {
    empUnit: string;
    unitId: string;
    unitDisplay: string;
    departmentDisplay?: string;
    role?: string | string[];
    createdBy?: string;
    name?: string;
    email?: string;
}

const MocUnitSchema = Yup.object().shape({
    unitId: Yup.string()
        .required('Unit is required')
        .notOneOf([''], 'Please select a unit'),

    departmentId: Yup.string()
        .required('Department is required')
        .notOneOf([''], 'Please select a department'),
});

const AddSafetyForm: React.FC<SafetyUnitWithAccordionProps> = ({
    initialData = {},
    onSubmit,
    isDisabled = false
}) => {

     const router = useRouter();
     const [isAlreadyPublished, setIsAlreadyPublished] = useState(false);
     
     const [isAuthorizedDept, setIsAuthorizedDept] = useState(true);
     const [tempValues, setTempValues] = useState<Record<string, string>>({});
     const [departmentsLoaded, setDepartmentsLoaded] = useState(false);

     const [isFatalTriggered, setIsFatalTriggered] = useState(false);
     const [isDSOorUser, setIsDSOorUser] = useState(false);
     const [isDraftToastShown, setIsDraftToastShown] = useState(false);
     const [deptLoading, setDeptLoading] = useState(false);
     const [showPublishConfirm, setShowPublishConfirm] = useState(false);
     const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  //  Draft ID State
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
//   const [isFormDisabled, setIsFormDisabled] = useState(false);
     const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
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
    const [applicable, setApplicable] = useState<Record<string, boolean>>({});
    const [values, setValues] = useState<Record<string, Record<string, number>>>({});
    const [totalScore, setTotalScore] = useState<string>('0');
    const [achievedScore, setAchievedScore] = useState<string>('0');
    const [resultScore, setResultScore] = useState<string>('-');
    const [isSelectionFrozen, setIsSelectionFrozen] = useState(false);
    const [selectedUnitOption, setSelectedUnitOption] = useState<SelectOptions | null>(null);
    const [selectedDepartmentOption, setSelectedDepartmentOption] = useState<SelectOptions | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedMonthOption, setSelectedMonthOption] = useState<SelectOptions | null>({
        value: String(new Date().getMonth() + 1),
        label: new Date().toLocaleString('default', { month: 'long' })
    });
    // const { user } = useSelector(
    //     (state: RootState) => state.auth as { user: any }
    // );

    const { user } = useSelector(
  (state: RootState) => state.auth as { user: UserData }
);

if (!user) return null;
const isDSO =
Array.isArray(user?.role)
    ? user.role.includes("DSO") || user.role.includes("Safety Incharge")
    : user?.role === "DSO" || user?.role === "Safety Incharge";
    console.log("isDSO:", isDSO);
    console.log("user", user)

// 🚫 Block non-DSO users completely
if (!isDSO) {
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
        🚫 You are not authorized to access this page!
      </h2>
    </div>
  );
}
    console.log()
    const token = useSelector(selectUserToken);
    const userRole = useSelector(selectUserRole);
    console.log("userRole:", userRole);
    const [createdById, setCreatedById] = useState<string>(user?.createdBy);
    const [createdByName, setCreatedByName] = useState<string>(user?.name);
    const [createdByEmail, setCreatedByEmail] = useState<string>(user?.email);
    
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
                 fetchSubmissionWindow(matchedUnit.value);
                // Fetch departments for the auto-selected unit
                fetchDepartments(matchedUnit.value);
            }
        }
    }, [unitOptions, user?.unitDisplay, initialData?.unitId]); 

    useEffect(() => {
  if (selectedUnitOption?.value) {
    fetchSubmissionWindow(selectedUnitOption.value);
  }
}, [selectedUnitOption]);

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
            setDepartmentsLoaded(true);
        }
    };

    useEffect(() => {
  if (departmentsLoaded && departmentOptions.length > 0 && user?.departmentDisplay) {
    const isMatch = departmentOptions.some(
      (option) => option.label === user.departmentDisplay
    );

    setIsAuthorizedDept(isMatch);
  }
}, [departmentOptions, user?.departmentDisplay]);
    

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
            fetchScorecard();
            setIsSelectionFrozen(true);
        }
    }, [selectedDepartmentOption]);

    const fetchSubmissionWindow = async (unitId: string) => {
    setIsSubmissionWindowLoading(true);
    try {
    const response = await serverRequest(
                     {},
                     FETCH_SAFETY_SCORE + `/submission-window/${Number(unitId)}`,
                     CONSTANTS.REQUEST_GET,
                     true,
                     true,
                     token
                 );

    // const data = response?.data;
    const data = response;
    console.log("Submission Window API Data:", data);

    setSubmissionWindow(data);
    } catch (error) {
    console.error("Error fetching submission window:", error);
    setSubmissionWindow(null);
    } finally {
    setIsSubmissionWindowLoading(false);
    }
    };

    const checkIfPublished = async () => {
  try {
    const payload = {
      unitId: Number(selectedUnitOption?.value),
      departmentId: Number(selectedDepartmentOption?.value),
      month: Number(selectedMonth),
      year: selectedYear,
    };

    const response = await serverRequest(
      { ...payload },
      FETCH_SAFETY_SCORE + `/dept-scorecard`,
      CONSTANTS.REQUEST_POST,
      true,
      true,
      token
    );

    if (response?.response?.status === "PUBLISHED") {
      setIsAlreadyPublished(true);
    } else {
      setIsAlreadyPublished(false);
    }
  } catch (err) {
    console.log("Check publish error", err);
    setIsAlreadyPublished(false);
  }
};

useEffect(() => {
  if (selectedUnitOption && selectedDepartmentOption && selectedMonth) {
    checkIfPublished();
  }
}, [selectedUnitOption, selectedDepartmentOption, selectedMonth]);

  const fetchScorecard = async () => {
    try {
    const response = await serverRequest(
                     {},
                     FETCH_SAFETY_SCORE + `/dept-scorecard-structure`,
                     CONSTANTS.REQUEST_GET,
                     true,
                     true,
                     token
                 );
                 console.log("response",response);
      const data = response;
      console.log("Scorecard Structure Response:", data);
    //    const data = response;
    if (!data) {
      setMainParameters([]);
      return;
    }
 const mappedParameters: MainParameter[] = data.map((header: any) => ({
      id: header.headerId.toString(),
      name: header.headerName,
      subtotal: Number(header.maxWeightage),
      subParams: header.lineItems.map((item: any) => ({
      id: item.lineItemId.toString(),
      name: item.lineItemName,
      weight: Number(item.weightage),
      rule: item.parameterType === "LAGGING" ? "negative" : "positive",
      uom: item.uom,
      type:
      item.parameterType === "LAGGING"
      ? "lagging"
      : item.parameterType === "CURRENT"
      ? "current"
      : item.parameterType === "LEADING"
      ? "leading"
      : null,

    decimalPrecision: item.decimalPrecision,
    maxValue: item.maxValue && item.maxValue > 0 ? item.maxValue : null,
    // maxValue: item.maxValue,
    achieved: 0,
}))
    }));

    setMainParameters(mappedParameters);

    // Default all parameters as applicable
    const applicableMap: Record<string, boolean> = {};
    mappedParameters.forEach((param) => {
      applicableMap[param.id] = true;
    });

    setApplicable(applicableMap);

  } catch (error) {
    console.error("Error fetching scorecard:", error);
  }
};

const fetchDraft = async () => {
  try {
  if (
      !selectedUnitOption ||
      !selectedDepartmentOption ||
      !selectedMonth
    ) {
      return;
    }
const response = await serverRequest(
                {},
                FETCH_SAFETY_SCORE + `/dept-draft/${createdById}`,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
                );
    //  const data = response?.data;
    const data = response;
    console.log("Draft Response:", data);
    if (!data) return;
    // store draftId
    setSavedDraftId(data.id);
   const valuesMap: Record<string, any> = {};
    let hasAnyValue = false;   
   data.headers.forEach((header: any) => {
    header.lineItems.forEach((item: any) => {
     const val = item.achievedValue;
     valuesMap[item.lineItemId] = {
          value: val
        };
    //  check if any value is filled
        if (val !== null && val !== undefined && val !== "") {
          hasAnyValue = true;
        }
});
    });
setValues(valuesMap);
//  SHOW TOAST ONLY IF DATA EXISTS
    if (hasAnyValue && !isDraftToastShown) {
      toast.success("Draft loaded");
      setIsDraftToastShown(true);
    }
} catch (error) {
    console.error("Draft fetch error:", error);
  }
};


 useEffect(() => {
    let overallAchieved = 0;
    let totalScoreSum = 0;
    let overallResultScore = 0;

    mainParameters.forEach((param) => {
//  Total Score (Static subtotal sum)
        totalScoreSum += Number(param.subtotal);
        param.subParams.forEach((sub) => {
       const achievedValue = values?.[sub.id]?.value;
        // Skip if blank
            if (
                achievedValue === undefined ||
                achievedValue === null
            ) {
                return;
            }
        const value = Number(achievedValue);
        //  Achieved Score
            overallAchieved += value * sub.weight;

            //  Result Score 
            if (value === 0) {
                overallResultScore += sub.weight;
            } else {
                overallResultScore += value * -sub.weight;
            }
        });
    });

    setAchievedScore(overallAchieved.toFixed(2));
    setTotalScore(totalScoreSum.toFixed(2));
    // setResultScore(overallResultScore.toFixed(2));

}, [values, mainParameters]);


useEffect(() => {
    if (savedDraftId) {
      console.log("Filters changed → Draft reset");
    }
    setSavedDraftId(null);
    setIsDraftToastShown(false);   
  }, [
    selectedUnitOption,
    selectedDepartmentOption,
    selectedMonth,
    selectedYear
  ]);


 useEffect(() => {
if (
    selectedUnitOption &&
    selectedDepartmentOption &&
    selectedMonth &&
    mainParameters.length > 0
  ) {
    fetchDraft();
  }

}, [
  selectedUnitOption,
  selectedDepartmentOption,
  selectedMonth,
  mainParameters
]);


useEffect(() => {
  const fatalParam = mainParameters
    .flatMap(p => p.subParams)
    .find(sub => sub.name.toLowerCase() === "fatal");

  if (fatalParam) {
    const fatalValue = values?.[fatalParam.id]?.value || 0;
    setIsFatalTriggered(fatalValue > 0);
  }
}, [values, mainParameters]);



const toggleMainParam = (paramId: string) => {
        setOpenMainParam((prev) => ({
            ...prev,
            [paramId]: !prev[paramId]
        }));
    };

    const toggleApplicable = (paramId: string) => {
        const isCurrentlyApplicable = applicable?.[paramId] ?? false;

        setApplicable((prev) => ({
            ...prev,
            [paramId]: !isCurrentlyApplicable
        }));

        if (isCurrentlyApplicable) {
            setOpenMainParam((prev) => ({
                ...prev,
                [paramId]: false
            }));
        }
    };


  const handleValueChange = (subParamId: string, value: string) => {

  setValues((prev) => ({
    ...prev,
    [subParamId]: { value: value === "" ? undefined : Number(value) },
  }));

  setFieldErrors((prev) => ({
    ...prev,
    [subParamId]: false
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

    
        const initialValues: SafetyBoardFormValues = {
        unitId: selectedUnitOption?.value || initialData?.unitId || '',
        departmentId: selectedDepartmentOption?.value || initialData?.departmentId || '',
        unitName: selectedUnitOption?.label || initialData?.unitName || '',
        departmentName: selectedDepartmentOption?.label || initialData?.departmentName || '',
        totalScore: totalScore,
        month: selectedMonth,
    };

    const saveSafetyDraft = async (param: any) => {
    setDeptLoading(true);

    let hasError = false;
    const newErrors: Record<string, boolean> = {};

    //  Validate all line items of that header
    param.subParams.forEach((sub: any) => {
        const value = values?.[sub.id]?.value;

        if (value === undefined || value === null ) {
            newErrors[sub.id] = true;
            hasError = true;
        }
    });

    //  If error found → show errors & stop save
    if (hasError) {
        setFieldErrors(newErrors);
        toast.error("Please fill all required fields");
        setDeptLoading(false);
        return;
    }

    
    setFieldErrors({});

    try {
        const payload = {
            draftId: savedDraftId,
            unitId: Number(selectedUnitOption?.value),
            unitName: selectedUnitOption?.label,
            departmentId: Number(selectedDepartmentOption?.value),
            departmentName: selectedDepartmentOption?.label,
            month: Number(selectedMonth),
            year: selectedYear,
            createdById,
            createdByName,
            createdByEmail,
            headers: [
                {
                    headerId: Number(param.id),
                    headerName: param.name,
                    lineItems: param.subParams.map((sub: any) => ({
                        lineItemId: Number(sub.id),
                        lineItemName: sub.name,
                        achievedValue: values?.[sub.id]?.value ?? null
                    })),
                },
            ],
        };

        const response = await serverRequest(
            { ...payload },
            FETCH_SAFETY_SCORE + `/dept-save-score`,
            CONSTANTS.REQUEST_POST,
            true,
            true,
            token
        );

        if (!savedDraftId && response.draftId) {
            setSavedDraftId(response.draftId);
        }

        toast.success("Draft Saved!");
    } catch (error) {
        console.error("Header Save Error:", error);
        toast.error("Error saving draft!");
    } finally {
        setDeptLoading(false);
    }
};

//     const saveSafetyDraft = async (param: any) => {
//     setDeptLoading(true);
//         try {
//         const payload = {
//         draftId: savedDraftId,  
//         unitId: Number(selectedUnitOption?.value),
//         unitName: selectedUnitOption?.label,
//         departmentId: Number(selectedDepartmentOption?.value),
//         departmentName: selectedDepartmentOption?.label,
//         month: Number(selectedMonth),
//         year: selectedYear,
//         createdById,
//         createdByName,
//         createdByEmail,
//          headers: [
//         {
//         headerId: Number(param.id),
//         headerName: param.name,
//         lineItems: param.subParams.map((sub: any) => ({
//         lineItemId: Number(sub.id),
//         lineItemName: sub.name,
//     //   achievedValue: values?.[sub.id]?.value || 0,
//         achievedValue: values?.[sub.id]?.value ?? null
//         })),
//     },
//     ],
//     };
//    console.log("Header Save Payload:", payload);
//     const response = await serverRequest(
//         {...payload},
//         FETCH_SAFETY_SCORE + `/dept-save-score`,
//         CONSTANTS.REQUEST_POST,
//         true,
//         true,
//         token
//       );
// console.log("Header Save Response:", response);
//  // Store draftId only first time
//             if (!savedDraftId && response.draftId) {
//             setSavedDraftId(response.draftId);
//             }
// toast.success(`Draft Save!`);
// } catch (error) {
//     console.error("Header Save Error:", error);
//     toast.error(`Error saving draft!`);
// }
//  finally {
//     setDeptLoading(false); 
//   }
// }

const handlePublishConfirm = async () => {
      setShowPublishConfirm(false);
      await executePublish();
    };

    const executePublish = async () => {
    setDeptLoading(true);
     try {
            // Validation: Check all applicable headers have values
            const newErrors: Record<string, boolean> = {};
            for (const param of mainParameters) {
                const showApplicableCheckbox =
                param.name === "Barrier Health Management" ||
                param.name === "Process Safety Management";

                const isApplicable = showApplicableCheckbox
                ? applicable?.[param.id] ?? false
                : true; // other headers always applicable

                // If applicable, check that all subParams have values
                if (isApplicable) {
                for (const sub of param.subParams) {
                    const value = values?.[sub.id]?.value;
                    if (value === undefined || value === null ) {
                    toast.error(
                        `All fields in "${param.name}" must have values before publishing.`
                    );
                    return;
                    }
                }
                }
            }

            const payload = {
                unitId: Number(selectedUnitOption?.value),
                unitName: selectedUnitOption?.label,
                departmentId: Number(selectedDepartmentOption?.value),
                departmentName: selectedDepartmentOption?.label,
                month: Number(selectedMonth),
                year: new Date().getFullYear(),
                createdById: createdById,
                createdByName: createdByName,
                createdByEmail: createdByEmail,
                headers: mainParameters.map((param) => ({
                headerId: Number(param.id),
                headerName: param.name,
                isApplicable: applicable[param.id] ?? true,
                lineItems: param.subParams.map((sub) => ({
                lineItemId: Number(sub.id),
                lineItemName: sub.name,
                // achievedValue: values?.[sub.id]?.value || 0,
                achievedValue: values?.[sub.id]?.value ?? null
                })),
                })),
            };
             console.log("Publish Payload:", payload);
            // await saveScoreApi(payload, "PUBLISH");
            const response = await serverRequest(
                    {...payload},
                FETCH_SAFETY_SCORE + `/dept-save-score/publish`,
                CONSTANTS.REQUEST_POST,
                true,
                true,
                token
            );


            if (!response || response.message) {
                toast.success(response?.message || "Error publishing scorecard!");
                return;
            }

            // toast.success(`Scorecard saved successfully!`);
            // router.push(APP_URL. SAFETY_SCORE_VIEW);
            // router.push("/safety-score/view-score");

            } catch (error) {
            console.error("Publish error:", error);
            toast.error(error?.message || "Error publishing scorecard!");
            
            // toast.error(`Error publishing scorecard!`);

            } finally {
              setDeptLoading(false);
              setTimeout(() => {
                router.push(APP_URL. SAFETY_SCORE_VIEW);;
              }, 2000);
            }
    }

    const savePublish = () => {
      setShowPublishConfirm(true);
    }  
    
    if (departmentsLoaded && !isAuthorizedDept) {
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
          🚫 You are not authorized to access this department!
        </h2>
      </div>
    );
  }

    return (
        <>
        <style jsx>{`
      .no-spinner::-webkit-outer-spin-button,
      .no-spinner::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
     }

    .no-spinner {
     appearance: textfield;
    }
    `}</style> 
        <Formik
            initialValues={initialValues}
            validationSchema={MocUnitSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
        >
         {({ isSubmitting, setFieldValue, values: formikValues,  errors  }) => (
            
            <div className='container-fluid p-4'>
                    <div className="admin-boxContainer d3">
                            <div className="adminAction">
                              <Link href={APP_URL.SAFETY_SCORE} className="adminAction__title">
                                <span className="icon">
                                  <img
                                    src="/images/svg/arrow-left-grey.svg"
                                    alt="back"
                                    width={15}
                                    height={15}
                                     />
                                </span>
                                 Save-Scorecard
                              </Link>
                            </div>
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
                                            fetchSubmissionWindow(String(selectedOption.value));
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
                                            if (formikValues.unitId) {
                                              fetchScorecard();
                                             setIsSelectionFrozen(true);
                                              }
                                            }}
                                        />
                                    </div>

                                    {submissionWindow?.isSubmissionOpen && (
                                        <> 
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
                                    {/* <div className="col-md-3 d-flex flex-column">
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
                                    </div> */}

                                     </>
                                    )} 

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
                                            }}
                                        />
                                    </div>
                                </div>
                            </Form>
                        </div>
                             <div className="mt-2">
                              {submissionWindow && !submissionWindow.isSubmissionOpen && (
                                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                                    <strong>Submission Window Closed</strong>
                                    <p className="mb-0">
                                        The submission window for this unit is currently closed. 
                                        <br/>
                                        <small>
                                      Start Date:{" "}
                                      {submissionWindow?.submissionStartDate
                                   ? new Date(submissionWindow.submissionStartDate).toLocaleDateString("en-GB")
                                   : "-"}
                                   <br />
                                   End Date:{" "}
                                    {submissionWindow?.submissionEndDate
                                  ? new Date(submissionWindow.submissionEndDate).toLocaleDateString("en-GB")
                                : "-"}
                                </small>
                                    </p>
                                </div>
                            )}
                            {submissionWindow?.isSubmissionOpen ? (  
                                <>
                                {isAlreadyPublished ? (
                             <div className="text-center py-5">
                             <h4 style={{ color: "#c62828" }}>
                            🚫 Scorecard is already published for this month
                            </h4>
                             </div>
                             ) : (
                              <>
                             <h5 className="mb-3">Safety Parameters</h5>
                            {mainParameters.map((param, index) => {
                                // const isApplicable = applicable?.[param.id] ?? false;
                                const showApplicableCheckbox =
                                    param.name === "Barrier Health Management" ||
                                    param.name === "Process Safety Management"; 

                                 const isApplicable = showApplicableCheckbox
                                 ? applicable?.[param.id] ?? false
                                 : true; // other headers always applicable
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
                                // borderRadius: "10px",
                                marginBottom: "10px",
                                cursor: isApplicable ? "pointer" : "default", 

                                }}
                                onClick={() => {
                                    if (isApplicable && !isFatalTriggered) {
                                        toggleMainParam(param.id);
                                    }
                                }}
                                >
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <span style={{ fontWeight: 500 }}>{index + 1}. {param.name}</span>
                                <span style={{ fontSize: "14px", background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "15px" }}>
                                    Weightage SubTotal: {calculateParameterSubtotal(param)}
                                </span>

                                {/* <span style={{ fontSize: "14px", background: "rgba(210, 155, 155, 0.2)", padding: "3px 10px", borderRadius: "15px" }}>
                                    
                                    Result Total: -
                                </span> */}

                                {/* Result Total: {calculateParameterResultTotal(param)} */}
                            </div>

                                    {/* <label onClick={(e) => e.stopPropagation()}>
                                        <input
                                            className="custom-checkbox me-2"
                                            type="checkbox"
                                            checked={isApplicable}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleApplicable(param.id);
                                            }}
                                        />
                                        Is Applicable
                                    </label> */}  

                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        {showApplicableCheckbox && (
                                        <label onClick={(e) => e.stopPropagation()}>
                                        <input
                                        className="custom-checkbox me-2"
                                        type="checkbox"
                                        checked={isApplicable}
                                        onChange={(e) => {
                                        e.stopPropagation();
                                        toggleApplicable(param.id);
                                        }}
                                        />
                                    Is Applicable
                                    </label>
                                    )}
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
                                        </div>
                                    {isOpen && isApplicable && (
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
                                                            {/* <th>Result</th> */}
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
                                                        <td>{sub.name}</td>
                                                        <td>{sub.weight}</td>
                                                        <td>{sub.uom}</td>
                                                        <td>
                                                        <InputField
                                                        type="text"
                                                        label=""
                                                        name=""
                                                        placeholder=""
                                                        maxLength={sub.maxValue ?? undefined}
                                                        disabled={isFatalTriggered}
                                                        step={1 / Math.pow(10, sub.decimalPrecision ?? 0)}
                                                        customClass="form-control text-center no-spinner"
                                                    // value={values?.[sub.id]?.value ?? ""}
                                                        value={
                                                        sub.decimalPrecision > 0
                                                            ? tempValues[sub.id] ?? values?.[sub.id]?.value ?? ""
                                                            : values?.[sub.id]?.value ?? ""
                                                        }
                                                    
                                                       onChange={(e) => {
                                                        let val = e.target.value;

                                                        const decimalPrecision = sub.decimalPrecision ?? 0;

                                                        // Allow empty
                                                        if (val === "") {
                                                            if (decimalPrecision > 0) {
                                                            setTempValues((prev) => ({ ...prev, [sub.id]: val }));
                                                            } else {
                                                            handleValueChange(sub.id, val);
                                                            }
                                                            return;
                                                        }

                                                        // Restrict negative
                                                        if (Number(val) < 0) return;

                                                        // DECIMAL CASE
                                                        if (decimalPrecision > 0) {
                                                            const regex = new RegExp(`^\\d*(\\.\\d{0,${decimalPrecision}})?$`);
                                                            if (regex.test(val)) {
                                                            
                                                            setTempValues((prev) => ({ ...prev, [sub.id]: val }));
                                                            }
                                                        } 
                                                        
                                                        else {
                                                            const regex = /^\d*$/;

                                                            if (regex.test(val)) {
                                                            if (sub.maxValue !== null && sub.maxValue !== undefined) {
                                                                if (Number(val) > sub.maxValue) {
                                                                toast.error(
                                                                    `Max allowed value of "${sub.name}" is ${sub.maxValue}`
                                                                );
                                                                return;
                                                                }
                                                            }

                                                            handleValueChange(sub.id, val);
                                                            }
                                                        }
                                                        }}

                                                    onBlur={() => {
                                                        const decimalPrecision = sub.decimalPrecision ?? 0;

                                                        if (decimalPrecision > 0) {
                                                            const val = tempValues[sub.id];

                                                            if (val === undefined || val === "") {
                                                            handleValueChange(sub.id, "");
                                                            return;
                                                            }

                                                            // Prevent invalid "." case
                                                            if (val === ".") return;

                                                            if (sub.maxValue !== null && sub.maxValue !== undefined) {
                                                            if (Number(val) > sub.maxValue) {
                                                                toast.error(
                                                                `Max allowed value of "${sub.name}" is ${sub.maxValue}`
                                                                );
                                                                return;
                                                            }
                                                            }

                                                            handleValueChange(sub.id, val);
                                                        }
                                                        }}
                                                    />
                                               {/* <input
                                                type="text"
                                                disabled={isFatalTriggered}
                                                className="form-control text-center no-spinner"
                                                value={values?.[sub.id]?.value ?? ""}
                                                max={sub.maxValue ?? undefined}
                                                step={1 / Math.pow(10, sub.decimalPrecision ?? 0)}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    if (val === "") {
                                                        handleValueChange(sub.id, val);
                                                        return;
                                                    }

                                                    const decimalPrecision = sub.decimalPrecision ?? 0;
                                                    if (Number(val) < 0) return;

                                                    const regex = new RegExp(
                                                        `^\\d*(\\.\\d{0,${decimalPrecision}})?$`
                                                    );

                                                    if (regex.test(val)) {
                                                        if (sub.maxValue !== null && sub.maxValue !== undefined) {
                                                        if (Number(val) > sub.maxValue) {
                                                            toast.error(
                                                            `Max allowed value of "${sub.name}" is ${sub.maxValue}`
                                                            );
                                                            return;
                                                        }
                                                        }

                                                        handleValueChange(sub.id, val);
                                                    }
                                                    }}
                                                    /> */}
                                                </td>
                                                </tr>
                                                ))}
                                            </tbody>
                                            </table>
                                            <div className="d-flex justify-content-end">
                                             <div className="d-flex justify-content-end mt-10">
                                            <button
                                            type="button"
                                            className="iconBtn green"
                                            disabled={isFatalTriggered}
                                            style={{ width: 120, height: 38, fontSize: 18, borderRadius: 5, fontWeight: 500 }}
                                            onClick={() => saveSafetyDraft(param)}
                                            >
                                            Save
                                        </button>
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
                       )}
                         </>
                            ) : (
                            <div className="text-center py-5">
                                {/* <p className="text-muted">Please select a unit to check the submission window status.</p> */}
                            </div>
                        )}  

                        {submissionWindow?.isSubmissionOpen && (   
                        <div className="d-flex justify-content-end mt-4">
                            <div className="d-flex justify-content-end mt-10">
                            <button
                            type="button"
                            style={{
                            width: "120px",
                            height: "38px",
                            fontSize: "18px",
                            borderRadius: "5px",
                            fontWeight: 500,
                                }}
                            className="iconBtn green"
                            // onClick={() => savePublish}
                            onClick={savePublish} 
                            disabled={isAlreadyPublished || isDisabled || isSubmitting}
                            >
                            {isSubmitting ? 'Publishing...' : 'Publish'}
                            </button>
                            </div>
                             </div>
                             )}
                        </div>
                    </div>
                </div>
            )}
                </Formik>
                <CustomModal
                isOpen={showPublishConfirm}
                onClose={() => setShowPublishConfirm(false)}
                title="Confirm Publish"
                modalSizeClassName="modal-lg"
                >
                <div style={{ padding: "65px 80px" }}>
                    <p style={{ marginBottom: "15px", fontSize: "20px" }}>Do you want to publish? Scorecard can not be updated once published.</p>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button
                    className="btn btn-secondary btn-md"
                    onClick={() => setShowPublishConfirm(false)}
                    >
                     No
                    </button>
                    <button
                    className="btn btn-success btn-md"
                    onClick={handlePublishConfirm}
                     disabled={deptLoading}
                    >
                    {deptLoading ? 'Publishing...' : 'Yes'}
                    </button>
                    </div>
                    </div>
                </CustomModal>

           <ToastContainer position="top-right" autoClose={3000}
            hideProgressBar={false} closeOnClick pauseOnHover />
            </>
        );
        };
           const AddSafetyPage = () => {
           const handleSubmit = (values: SafetyBoardFormValues, formikHelpers: FormikHelpers<SafetyBoardFormValues>) => {
           console.log('Form submitted with values:', values);
           };
           return (
            <AddSafetyForm
            initialData={{}}
            onSubmit={handleSubmit}
            isDisabled={false}
          />
        );
};
 export default ProtectedRoute (AddSafetyPage);
