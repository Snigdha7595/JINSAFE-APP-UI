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
import { FETCH_COMMITTEES, FETCH_UNITS, FETCH_SAFETY_SCORE } from "@/config/apiConfig";   
import {APP_URL, CONSTANTS } from "@/config/constant";
import { emptySelector } from "@/config/config";
import { SelectOptions } from "@/components/interfaces";
import SelectField from "@/components/Form/SelectFields";
import InputField from "@/components/Form/InputField";
import { ToastContainer, toast } from "react-toastify";
import { saveScoreApi } from "@/services/fireSafety.service";
import { getSubmissionWindowApi } from "@/services/fireSafety.service";
import { getDraftApi } from "@/services/fireSafety.service";
import { getCommitteesApi } from "@/services/fireSafety.service";
import { getCommitteeStructureApi } from "@/services/fireSafety.service";
import { getCommitteeDraftApi } from "@/services/fireSafety.service";
import { saveCommitteeScoreApi } from "@/services/fireSafety.service";




interface SaveScoreResponse {
  message: string;
  draftId?: string;
}

interface SafetyBoardFormValues {
  unitId: string;
  committeeId: string;
  unitName?: string;
  committeeName?: string;
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
    committeeDisplay?: string;
}

const MocUnitSchema = Yup.object().shape({
    unitId: Yup.string()
        .required('Unit is required')
        .notOneOf([''], 'Please select a unit'),

    
    committeeId: Yup.string()
  .required('Committee is required')
  .notOneOf([''], 'Please select a committee'),
});

const CommitteeScorePage: React.FC<SafetyUnitWithAccordionProps> = ({
    initialData = {},
    onSubmit,
    isDisabled = false
}) => {
     const router = useRouter();
     const [tempValues, setTempValues] = useState<Record<string, string>>({});
     const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [isDraftToastShown, setIsDraftToastShown] = useState(false);
    const [committeeLoading, setCommitteeLoading] = useState(false);
  //  Draft ID State
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
//   const [isFormDisabled, setIsFormDisabled] = useState(false);

    const [units, setUnits] = useState<DropdownOption[]>([]);
    const [unitOptions, setUnitOptions] = useState<SelectOptions[]>(emptySelector);
    const [committeeOptions, setCommitteeOptions] = useState<SelectOptions[]>(emptySelector);
    const [selectedCommitteeOption, setSelectedCommitteeOption] = useState<SelectOptions | null>(null);
    const [committeeList, setCommitteeList] = useState([]);
    
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
    const { user } = useSelector(
        (state: RootState) => state.auth as { user: any }
    );
    console.log()
    const token = useSelector(selectUserToken);
    const [createdById, setCreatedById] = useState<string>(user?.createdBy || "JSPL0001");
    const [createdByName, setCreatedByName] = useState<string>(user?.name || "User");
    const [createdByEmail, setCreatedByEmail] = useState<string>(user?.email  );
    console.log("createdById", createdById);
    console.log("createdByName", createdByName);
    console.log("createdByEmail", createdByEmail);
    
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

                // Fetch committees for the auto-selected unit
                fetchCommittees(matchedUnit.value);
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

    


    const fetchCommittees = async (unitid: string) => {
        try {
          const response = await serverRequest(
            {},
            FETCH_COMMITTEES + `/get-committees/${unitid}`,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            token
          );
          if (response.length > 0) {
            const options = response.map((committe: any) => ({
                value: committe?.committeId?.toString(),
                label: committe?.committeName,
            }));
            setCommitteeOptions(options);
            } else {
            setCommitteeList([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

    // Initialize selectedCommitteeOption from user state or initial data when committeeOptions are loaded
    useEffect(() => {
        if (committeeOptions && committeeOptions.length > 0 && !selectedCommitteeOption) {
            let matchedCommittee = null;
            
            // First try to match from user's committeeDisplay
            if (user?.committeeDisplay) {
                matchedCommittee = committeeOptions.find(
                    (option) => option.label === user.committeeDisplay
                );
            }
            
            // If not found, try from initial data
            if (!matchedCommittee && initialData?.committeeId) {
                matchedCommittee = committeeOptions.find(
                    (option) => option.value === initialData.committeeId
                );
            }
            
            if (matchedCommittee) {
                setSelectedCommitteeOption(matchedCommittee);
            }
        }
    }, [committeeOptions, user?.committeeDisplay, initialData?.committeeId]);

    // Trigger fetchCommitteeStructure when committee is auto-selected
    useEffect(() => {
        if (selectedUnitOption && selectedCommitteeOption) {
            fetchCommitteeStructure();
            setIsSelectionFrozen(true);
        }
    }, [selectedCommitteeOption]);

    


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


const fetchCommitteeStructure = async () => {
  try {
    const response = await serverRequest(
                         {},
                         FETCH_SAFETY_SCORE + `/committee_structure`,
                         CONSTANTS.REQUEST_GET,
                         true,
                         true,
                         token
                     );
    
    // const data = response?.data;
     const data = response;
    if (!data) {
      setMainParameters([]);
      return;
    }

    const mappedParameters: MainParameter[] = [
      {
        id: "committee",
        name: "Committee",
        subtotal: data.reduce((sum: number, item: any) => sum + Number(item.weightage), 0),

        subParams: data.map((item: any) => ({
          id: item.parameterId.toString(),
          name: item.parameterName,
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
        //   maxValue: null,
          maxValue: item.maxValue && item.maxValue > 0 ? item.maxValue : null,
          achieved: 0
        }))
      }
    ];

    setMainParameters(mappedParameters);

    //  OPEN HEADER BY DEFAULT
    setOpenMainParam({
      committee: true
    });

    const applicableMap: Record<string, boolean> = {};

mappedParameters.forEach((param) => {
  param.subParams.forEach((sub) => {
    applicableMap[sub.id] = true;   // default applicable
  });
});

setApplicable(applicableMap);


  } catch (error) {
    console.error("Error fetching committee structure:", error);
  }
};







const fetchDraft = async () => {
  try {
    if (!selectedUnitOption || !selectedCommitteeOption || !selectedMonth) {
      return;
    }
const response = await serverRequest(
                    {},
                    FETCH_SAFETY_SCORE + `/committee-draft/${createdById}`,
                    CONSTANTS.REQUEST_GET,
                    true,
                    true,
                    token
                );
    // const data = response?.data;
    const data = response;
    console.log("Draft Response:", data);
     if (!data) return;
     setSavedDraftId(data.id);
     const valuesMap: Record<string, any> = {};
    const applicableMap: Record<string, boolean> = {};
    data.parameters.forEach((param: any) => {
      valuesMap[param.parameterId] = {
        value: param.achievedValue
      };
   applicableMap[param.parameterId] = param.isApplicable;
    });
   setValues(valuesMap);
    setApplicable(applicableMap);
   //  ADD THIS
    if (!isDraftToastShown) {
      toast.success("Draft Loaded");
      setIsDraftToastShown(true);
    }
 } catch (error) {
    console.error("Draft fetch error:", error);
  }
};



 const saveCommitteeDraft = async (param: any) => {
    setCommitteeLoading(true);
    try {
    if (!selectedUnitOption || !selectedCommitteeOption || !selectedMonth) {
       alert("Please select Unit, Committee and Month");
       return;
         }
        const payload = {
        unitId: Number(selectedUnitOption.value),
         unitName: selectedUnitOption.label,
         month: Number(selectedMonth),
         year: selectedYear,
        createdById,
        createdByName,
        createdByEmail,

        committees: [
       {
      committeeId: Number(selectedCommitteeOption.value),
      committeeName: selectedCommitteeOption.label,

      parameters: param.subParams.map((sub: any) => ({
      parameterId: Number(sub.id),
      parameterName: sub.name,
      isApplicable: applicable?.[sub.id] ?? true,
    //   achievedValue: values?.[sub.id]?.value || 0
       achievedValue: values?.[sub.id]?.value ?? null
     }))
     }
     ]
     };
  console.log("SAVE Payload:", payload);
   const response = await serverRequest(
                    {...payload},
                    FETCH_SAFETY_SCORE + `/committee-save-score`,
                    CONSTANTS.REQUEST_POST,
                    true,
                    true,
                    token
                );
    // const data = response?.data;
    const data = response;
   console.log("Save Response:", response);
     // Store draftId only first time
          if (!savedDraftId && response.draftId) {
          setSavedDraftId(response.draftId);
          }
//   alert(response.message);
         toast.success(`Draft Save!`);
     } catch(error) {
          console.error("Header Save Error:", error);
        //   alert("Error saving header");
         toast.error(`Error saving draft!`);
          }
        }

const saveCommitteePublish = async () => {
    setCommitteeLoading(true);
    try {
        const payload = {
        unitId: Number(selectedUnitOption.value),
        unitName: selectedUnitOption.label,  
        month: Number(selectedMonth),
        year: selectedYear,
        createdById,
        createdByName,
        createdByEmail,

        committees: [
        {
       committeeId: Number(selectedCommitteeOption.value),
       committeeName: selectedCommitteeOption.label,

       parameters: mainParameters
      .flatMap((param) => param.subParams)
      .map((sub: any) => ({
       parameterId: Number(sub.id),
        parameterName: sub.name, 
       isApplicable: applicable?.[sub.id] ?? true,
    //   achievedValue: values?.[sub.id]?.value || 0
       achievedValue: values?.[sub.id]?.value ?? null
     }))
    }
    ]
    };
    console.log("PUBLISH Payload:", payload);
    const response = await serverRequest(
                {...payload},
                FETCH_SAFETY_SCORE + `/committee-save-score/PUBLISH`,
                CONSTANTS.REQUEST_POST,
                true,
                true,
                token
            );
    // const data = response?.data;
    const data = response;
toast.success("Committee Published Successfully");
// router.push("/safety-score/committee-view");
 router.push(APP_URL.SAFETY_SCORE_COMMITTEE_SCORE_VIEW);
} catch (error) {
    console.error("Publish error:", error);
    toast.error(`Error publishing scorecard!`);
    }
    }
     


const validateAchievedInputs = () => {

  const newErrors: Record<string, boolean> = {};
  let hasError = false;

  mainParameters.forEach((param) => {
    param.subParams.forEach((sub) => {

      const isApplicableParam = applicable?.[sub.id] ?? true;
      const achievedValue = values?.[sub.id]?.value;

      if (
        isApplicableParam &&
        (achievedValue === undefined || achievedValue === null)
      ) {
        newErrors[sub.id] = true;
        hasError = true;
      }

    });
  });

  setErrors(newErrors);

  if (hasError) {
    toast.error("Please enter Achieved value for required fields");
    return false;
  }

  return true;
};


  

useEffect(() => {
    let overallAchieved = 0;
    let totalScoreSum = 0;
    let overallResultScore = 0;

    mainParameters.forEach((param) => {

        totalScoreSum += Number(param.subtotal);

        param.subParams.forEach((sub) => {

            
            if (!(applicable?.[sub.id] ?? true)) return;

            const achievedValue = values?.[sub.id]?.value;

            if (
                achievedValue === undefined ||
                achievedValue === null
            ) {
                return;
            }

            const value = Number(achievedValue);

            overallAchieved += value * sub.weight;

            if (value === 0) {
                overallResultScore += sub.weight;
            } else {
                overallResultScore += value * -sub.weight;
            }
        });
    });

    setAchievedScore(overallAchieved.toFixed(2));
    setTotalScore(totalScoreSum.toFixed(2));

}, [values, mainParameters, applicable]);  //  add applicable here



useEffect(() => {
    if (savedDraftId) {
      console.log("Filters changed → Draft reset");
    }
    setSavedDraftId(null);
    setIsDraftToastShown(false); 
  }, [
    selectedUnitOption,
    selectedCommitteeOption,
    selectedMonth,
    selectedYear
  ]);



  useEffect(() => {

  if (
    selectedUnitOption &&
    selectedCommitteeOption &&
    selectedMonth &&
    mainParameters.length > 0
  ) {
    fetchDraft();
  }

}, [
  selectedUnitOption,
  selectedCommitteeOption,
  selectedMonth,
  mainParameters
]);


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
  committeeId: selectedCommitteeOption?.value || initialData?.committeeId || '',
  unitName: selectedUnitOption?.label || initialData?.unitName || '',
  committeeName: selectedCommitteeOption?.label || initialData?.committeeName || '',
  totalScore: totalScore,
  month: selectedMonth,
};
    return (
        <>
        <Formik
            initialValues={initialValues}
            validationSchema={MocUnitSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
        >
            {/* {({ isSubmitting, setFieldValue, values }) => ( */}
            {({ isSubmitting, setFieldValue, values: formikValues }) => (
                
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
                                 Save-Committeescore
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
                                            setFieldValue("committeeId", "");     
                                            setFieldValue('committeeName', '');
                                            setSelectedCommitteeOption(null);
                                                  
                                            // fetchDepartments(String(selectedOption.value));
                                            fetchCommittees(String(selectedOption.value));
                                            fetchSubmissionWindow(String(selectedOption.value));
                                            }}
                                        />
                                    </div>

                                    {/* Committee Dropdown */}
                                    
                                       <div className="col-md-3">
                                         <SelectField
                                          label="Committee"
                                          value={selectedCommitteeOption}
                                          name="committeeId"
                                          placeholder="Select Committee"
                                          options={committeeOptions}
                                        //   disabled={isSelectionFrozen}
                                          onChange={(selectedOption: SelectOptions) => {
                                            setSelectedCommitteeOption(selectedOption);  //  label store
                                            setFieldValue("committeeId", selectedOption.value);
                                            setFieldValue('committeeName', selectedOption.label);

                                            if (formikValues.unitId) {
                                              fetchCommitteeStructure();
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
                                            
                                            onClick={() => {
                                                if (isApplicable) toggleMainParam(param.id); 
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                                {/* <span style={{ fontWeight: 500 }}>{index + 1}. {param.name}</span>
                                                <span style={{ fontSize: "14px", background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "15px" }}>
                                                    Sub Total: {calculateParameterSubtotal(param)}
                                                </span> */}

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
                                                                        <th>Is Applicable</th>
                                                                        <th>Parameter Type</th>
                                                                        <th style={{ width: "25%" }}>Sub Parameter</th>  
                                                                        <th>Weightage</th>
                                                                        <th>UOM</th>
                                                                        <th style={{ width: "15%" }}>Achieved</th>         
                                                                        {/* <th>Result</th> */}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {param.subParams.map((sub, subIndex) => (
                                                                        <tr key={sub.id} className="text-center">
                                                                            <td>{subIndex + 1}</td>
                                                                            <td>
                                                                            <input
                                                                             type="checkbox"
                                                                            checked={applicable?.[sub.id] ?? true}
                                                                            onChange={(e) => {
                                                                            const checked = e.target.checked;

                                                                          setApplicable((prev) => ({
                                                                          ...prev,
                                                                          [sub.id]: checked
                                                                           }));

                                                                         if (!checked) {
                                                                         handleValueChange(sub.id, "");
                                                                         }
                                                                        }}
                                                                        />
                                                                       </td>

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
                                                        max={sub.maxValue ?? undefined}
                                                        disabled={!(applicable?.[sub.id] ?? true)}
                                                        step={1 / Math.pow(10, sub.decimalPrecision ?? 0)}
                                                        customClass={`form-control text-center no-spinner ${errors[sub.id] ? "border border-danger" : ""}`}
                                                    //    value={values?.[sub.id]?.value ?? ""}
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
                                                             // clear error
                                                            setErrors((prev) => ({
                                                            ...prev,
                                                            [sub.id]: false,
                                                            }));
                                                        }
                                                        }}
                                                    
                                                   
                                                  
                                                    />
                                                                            {/* <input
                                                                            type="number"
                                                                            className={`form-control text-center no-spinner ${
                                                                                errors[sub.id] ? "border border-danger" : ""
                                                                            }`}
                                                                            value={values?.[sub.id]?.value ?? ""}
                                                                            disabled={!(applicable?.[sub.id] ?? true)}

                                                                            // Apply max only if exists
                                                                            max={sub.maxValue ?? undefined}

                                                                            // Decimal precision control
                                                                            step={1 / Math.pow(10, sub.decimalPrecision ?? 0)}

                                                                            onChange={(e) => {
                                                                                let inputValue = e.target.value;

                                                                                // Allow empty
                                                                                if (inputValue === "") {
                                                                                handleValueChange(sub.id, "");
                                                                                return;
                                                                                }

                                                                                // Convert to number
                                                                                let numericValue = Number(inputValue);

                                                                                //  Decimal precision restriction
                                                                                if (sub.decimalPrecision !== undefined) {
                                                                                const decimalPart = inputValue.split(".")[1];
                                                                                if (decimalPart && decimalPart.length > sub.decimalPrecision) {
                                                                                    return; // stop extra decimal input
                                                                                }
                                                                                }

                                                                                // Max value restriction (ONLY if exists)
                                                                                if (sub.maxValue !== null && sub.maxValue !== undefined) {
                                                                                if (numericValue > sub.maxValue) {
                                                                                    toast.error(
                                                                                    `Max allowed value of "${sub.name}" is ${sub.maxValue}`
                                                                                    );
                                                                                    return;
                                                                                }
                                                                                }

                                                                                handleValueChange(sub.id, inputValue);

                                                                                // clear error
                                                                                setErrors((prev) => ({
                                                                                ...prev,
                                                                                [sub.id]: false,
                                                                                }));
                                                                            }}
                                                                            /> */}
                                                                             </td>

                                                                          

                                                                 {/* <input
                                                                type="number"
                                                            //   className="form-control text-center no-spinner"
                                                                className={`form-control text-center no-spinner ${
                                                                errors[sub.id] ? "border border-danger" : ""
                                                                }`}
                                                              value={values?.[sub.id]?.value ?? ""}
                                                              disabled={!(applicable?.[sub.id] ?? true)}
                                                              max={sub.maxValue ?? undefined}
                                                             step={1 / Math.pow(10, sub.decimalPrecision ?? 0)}
                                                            
                                                              onChange={(e) => {
                                                            handleValueChange(sub.id, e.target.value);

                                                            setErrors((prev) => ({
                                                            ...prev,
                                                            [sub.id]: false
                                                            }));
                                                            }}
                                                            />  */}  

                                                                     </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>

                                                            <div className="d-flex justify-content-end">
                                                                <div className="d-flex justify-content-end mt-10">
                                                                     <button
                                                                        type="button"
                                                                        className="iconBtn green"
                                                                        // disabled={isFormDisabled}
                                                                        style={{ width: 120, height: 38, fontSize: 18, borderRadius: 5, fontWeight: 500 }}
                                                                        
                                                                         onClick={() => saveCommitteeDraft(param)}
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
                                            // onClick={() => saveCommitteePublish}
                                             onClick={saveCommitteePublish}
                                       
                                             disabled={isDisabled || isSubmitting}
                                            
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
        <CommitteeScorePage
            initialData={{}}
            onSubmit={handleSubmit}
            isDisabled={false}
        />
    );
};

export default ProtectedRoute (CommitteeScorePage);