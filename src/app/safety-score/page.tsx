"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
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
import CustomModal from "@/components/Layouts/CustomModal";
import { selectUserRole } from "@/store/slices/authSlice";
import { ToastContainer, toast } from "react-toastify";

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
  achieved: number;
  result: number;
  OverallDepartmentScore?: number;
  OverallCommitteeScore?: number;
  OverallSiteSafetyScore?: number;
  OverallSiteSafetyPercentage?: number;
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
}
const MocUnitSchema = Yup.object().shape({
  unitId: Yup.string()
    .required('Unit is required')
    .notOneOf([''], 'Please select a unit'),

  departmentId: Yup.string()
    .required('Department is required')
    .notOneOf([''], 'Please select a department'),
});

const SafetyUnitWithAccordion: React.FC<SafetyUnitWithAccordionProps> = ({
  initialData = {},
  onSubmit,
  isDisabled = false
}) => {
  const router = useRouter();
  const [deptBreakdown, setDeptBreakdown] = useState<any[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [committeeBreakdown, setCommitteeBreakdown] = useState<any[]>([]);
  const [committeeLoading, setCommitteeLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<any[]>([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [selectedCommitteeLocation, setSelectedCommitteeLocation] = useState("");
  const [filteredUnitOption, setFilteredUnitOption] = useState<SelectOptions[]>([]);
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
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // const [filteredUnitOption, setFilteredUnitOption] = useState<SelectOptions | null>(null);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: UserData }
  );
  const token = useSelector(selectUserToken);
  const userRole = useSelector(selectUserRole);
  const handleDeptScoreClick = (item: any) => {
    if (!item?.unitId) return;
    // setSelectedLocation(item.unitName);
    setSelectedLocation(item?.unitName ?? "");
    setShowDeptModal(true);

    fetchDepartmentBreakdown(item.unitId); 
  };

const closeDeptModal = () => {
  setShowDeptModal(false);
};
const handleCommitteeScoreClick = (item: any) => {
  if (!item?.unitId) return;
  // setSelectedCommitteeLocation(item.unitName);
  setSelectedCommitteeLocation(item?.unitName ?? "");
  setShowCommitteeModal(true);

  fetchCommitteeBreakdown(item.unitId); 
};

const closeCommitteeModal = () => {
  setShowCommitteeModal(false);
};

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

  const fetchDepartments = async (unitId: string) => {
    setLoading(prev => ({ ...prev, departments: true }));
    try {
      setDepartmentOptions(emptySelector);
      setDepartments([]);
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${unitId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      console.log("fetchDepartments response for unitId", unitId, ":", response);
      if (response && response.length > 0) {
        const options = response.map((dept: DepartmentData) => ({
          value: dept?.departmentid?.toString(),
          label: dept?.departmentname,
        }));
        setDepartmentOptions(options);
        setDepartments(response);
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

//   const fetchUnitSafetyOverview = async (UnitIds: number[], month: number, year: number) => {
//   setOverviewData([]);
//    try {
//       const response = await serverRequest(
//         {},
//         FETCH_SAFETY_SCORE + `/unit-safety-overview?UnitId=${UnitIds}&month=${Number(month)}&year=${Number(selectedYear)}`,
//         CONSTANTS.REQUEST_GET,
//         true,
//         true,
//         token
//       );
//       if (response.success) {
//         setOverviewData(response);
        
//       }
//       else {
//        toast.error(response?.message)
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
// }

const fetchUnitSafetyOverview = async (
  unitIds: number[],
  month: number,
  year: number
) => {
  setOverviewData([]);

  try {
    const response = await serverRequest(
      {
        unitIds,
        month,
        year,
      },
      FETCH_SAFETY_SCORE + `/unit-safety-overview`,
      CONSTANTS.REQUEST_POST,
      true,
      true,
      token
    );

    console.log("API response:", response);
    const data = response?.response;

    if (Array.isArray(data)) {
      setOverviewData(data);
    } else {
      setOverviewData([]);
    }

  } catch (error) {
    console.error("Error fetching overview:", error);
    setOverviewData([]);
  }
};


// const fetchUnitSafetyOverview = async (unitIds: number[], month: string) => {
//   try {
//     const { data } = await getUnitSafetyOverviewApi({
//       unitId: unitIds,
//       month: Number(month),
//       year: Number(selectedYear),
//     });

//     setOverviewData(data || []);
//   } catch (error) {
//     console.error("Error fetching overview:", error);
//     setOverviewData([]);
//   }
// };


// const fetchDepartmentBreakdown = async (unitId: number) => {
//   setDeptLoading(true);
//   try {
//     const { data } = await getDepartmentBreakdownApi({
//       unitId,
//       month: Number(selectedMonth),
//       year: Number(selectedYear),
//     });

//     console.log("Dept Breakdown:", data);
//     setDeptBreakdown(data || []);
//   } catch (err) {
//     console.error("Error fetching dept breakdown:", err);
//     setDeptBreakdown([]);
//   } finally {
//     setDeptLoading(false);
//   }
// };
// const fetchDepartmentBreakdown = async (unitId: number) => {
 
//   setDeptLoading(true);
//    try {
   
//       const response = await serverRequest(
//         {},
//         FETCH_SAFETY_SCORE + `/department-breakdown?month=${Number(selectedMonth)}&year=${Number(selectedYear)}&unitId=${unitId}`,
//         CONSTANTS.REQUEST_GET,
//         true,
//         true,
//         token
//       );

//       // const data = response?.data;
//       const data = response;
//       console.log("Dept Breakdown:", data);
//       setDeptBreakdown(data || []);
      
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }

//     finally {
//     setDeptLoading(false);   
//   }
// }

const fetchDepartmentBreakdown = async (unitId: number) => {
  setDeptLoading(true);

  try {
    const response = await serverRequest(
      {
        unitId: unitId,
        month: Number(selectedMonth),
        year: Number(selectedYear),
      },
      FETCH_SAFETY_SCORE + `/department-breakdown`,
      CONSTANTS.REQUEST_POST,   
      true,
      true,
      token
    );

    console.log("Dept Breakdown API:", response);

    
    const data = response?.response;

    if (Array.isArray(data)) {
      setDeptBreakdown(data);
    } else {
      setDeptBreakdown([]);
    }

  } catch (error) {
    console.error("Error fetching dept breakdown:", error);
    setDeptBreakdown([]);
  } finally {
    setDeptLoading(false);
  }
};


// const fetchCommitteeBreakdown = async (unitId: number) => {
//   setCommitteeLoading(true);
//   try {
//     const { data } = await getCommitteeBreakdownApi({
//       unitId,
//       month: Number(selectedMonth),
//       year: Number(selectedYear),
//     });

//     console.log("Committee Breakdown:", data);
//     setCommitteeBreakdown(data || []);
//   } catch (err) {
//     console.error("Error fetching committee breakdown:", err);
//     setCommitteeBreakdown([]);
//   } finally {
//     setCommitteeLoading(false);
//   }
// };

// const fetchCommitteeBreakdown = async (unitId: number) => {
  
//    setCommitteeLoading(true);
//    try {
   
//       const response = await serverRequest(
//         {},
//         FETCH_SAFETY_SCORE + `/committee-breakdown?month=${Number(selectedMonth)}&year=${Number(selectedYear)}&unitId=${unitId}`,
//         CONSTANTS.REQUEST_GET,
//         true,
//         true,
//         token
//       );

//       // const data = response?.data;
//       const data = response;
//       console.log("Committee Breakdown:", data);
//       setCommitteeBreakdown(data || []);
      
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//     finally {
//     setCommitteeLoading(false);
//   }
// }


const fetchCommitteeBreakdown = async (unitId: number) => {
  setCommitteeLoading(true);

  try {
    const response = await serverRequest(
      {
        unitId: unitId,
        month: Number(selectedMonth),
        year: Number(selectedYear),
      },
      FETCH_SAFETY_SCORE + `/committee-breakdown`,
      CONSTANTS.REQUEST_POST,   
      true,
      true,
      token
    );

    console.log("Committee Breakdown API:", response);

    const data = response?.response;

    if (Array.isArray(data)) {
      setCommitteeBreakdown(data);
    } else {
      setCommitteeBreakdown([]);
    }

  } catch (error) {
    console.error("Error fetching committee breakdown:", error);
    setCommitteeBreakdown([]);
  } finally {
    setCommitteeLoading(false);
  }
};

// const handleApplyFilter = async () => {
//   setOverviewData([]);
//   // const unitIds = filteredUnitOption.map(u => Number(u.value));
//   const unitIds = (filteredUnitOption || []).map((u: any) => Number(u.value));
//    try {
//       const response = await serverRequest(
//         {},
//         FETCH_SAFETY_SCORE + `/unit-safety-overview?UnitId=${unitIds}&month=${Number(selectedMonth)}&year=${Number(selectedYear)}`,
//         CONSTANTS.REQUEST_GET,
//         true,
//         true,
//         token
//       );
//       // const data = response?.data;
//       const data = response;
//       setOverviewData(Array.isArray(data) && data.length > 0 ? data : []);
//       setIsFilterOpen(false);
//       } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//     finally {
//     setIsFilterOpen(false)
//   }
// }

const handleApplyFilter = async () => {
const unitIds = (filteredUnitOption || []).map((u: any) => Number(u?.value));

  if (unitIds.length === 0) {
    toast.error("Please select at least one unit");
    return;
  }

  await fetchUnitSafetyOverview(
    unitIds,
    Number(selectedMonth),
    Number(selectedYear)
  );

  setIsFilterOpen(false);
};


// const handleApplyFilter = async () => {
//   if (filteredUnitOption.length > 0) {

//     const unitIds = filteredUnitOption.map(u => Number(u.value));

//     const { data } = await getUnitSafetyOverviewApi({
//       unitId: unitIds,   //  multiple ids
//       month: Number(selectedMonth),
//       year: Number(selectedYear),
//     });

    // setOverviewData(data || []);
    // setIsFilterOpen(false);
//   }
// };


useEffect(() => {
  if (selectedUnitOption) {
    fetchUnitSafetyOverview(
      [Number(selectedUnitOption.value)],
      Number(selectedMonth),
      Number(selectedYear)
    );
  }
}, [selectedUnitOption, selectedMonth, selectedYear]);


// useEffect(() => {
//   if (selectedUnitOption) {
//     fetchUnitSafetyOverview(
//       selectedUnitOption.value,
//       selectedMonth
//     );
//   }
// }, [selectedUnitOption, selectedMonth]);


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

      // Calculation of result score (sum of all parameter result totals)
      // const resultTotal = parseFloat(calculateParameterResultTotal(param));
      // overallResultScore += resultTotal;
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

  
const handleValueChange = (subParamId: string, value: string) => {
    console.log("Value changed for", subParamId, "New value:", value, "values", values);
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


 const initialValues: SafetyBoardFormValues = {
    unitId: initialData?.unitId || '',
    departmentId: initialData?.departmentId || '',
    unitName: initialData?.unitName || '',
    departmentName: initialData?.departmentName || '',
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
      {({ isSubmitting, setFieldValue, values }) => (
         <div className='container-fluid p-4'>
          <div className="admin-boxContainer d3">
            <div className="adminAction">
              <Link href={APP_URL.DASHBOARD} className="adminAction__title">
                <span className="icon">
                  <img
                    src="/images/svg/arrow-left-grey.svg"
                    alt="back"
                    width={15}
                    height={15}
                   />
                </span>
                 Dashboard
              </Link>
            </div>
          </div>
           <div className="admin-boxContainer d2 mb-0">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div />
              <div className="adminFilters align-items-center">
                <div className="adminFilters__list" style={{ justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="adminFilters__btn"
                    onClick={() => setIsFilterOpen(true)}
                  >
                    <img
                      width="20"
                      height="20"
                      alt="filter"
                      src="/images/svg/filter-icon.svg"
                      className="img-fluid u-image"
                    />
                  </button>
                  <button type="button"
                    className="iconBtn green w100"
                     onClick={() => router.push(APP_URL.SAFETY_SCORE_VIEW)}
                    >
                    <span>Department Score</span>
                    <img width="20" height="20" alt="Add" src="/images/svg/icons/Add.svg" className="white-icon" />
                  </button>
                   <button
                    className="iconBtn green w100"
                    // onClick={() => router.push("/safety-score/committee-view")}
                    onClick={() => router.push(APP_URL.SAFETY_SCORE_COMMITTEE_SCORE_VIEW)}
                      // disabled={userRole !== "Site Admin" && userRole !== "Safety Incharge"}
                    //   disabled={userRole !== "Site Admin" && userRole !== "Safety Incharge" && userRole !== "USER"}
                    // title={userRole !== "Site Admin" && userRole !== "Safety Incharge" ? "Only Site Admin or Safety Incharge can access this" : ""}
                  >
                    <span>Committee Score</span>
                    <img width="20" height="20" alt="Add" src="/images/svg/icons/Add.svg" className="white-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <CustomModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter">
            <div className="modal-scrollable-content px-2 py-3">
              <div className="row g-3">
                <div className="form_grider d1 row g-2">
                  <div className="col-md-4">
                    <SelectField
                      label="Unit"
                      value={filteredUnitOption}
                      name="filteredUnit"
                      placeholder="Select Unit"
                      options={unitOptions}
                       isMulti   //  important
                       onChange={(selectedOption: any) => {
                      if (Array.isArray(selectedOption)) {
                        setFilteredUnitOption(selectedOption);
                      } else if (selectedOption) {
                        setFilteredUnitOption([selectedOption]); // wrap single into array
                      } else {
                        setFilteredUnitOption([]);
                      }
                    }}
                       />
                  </div>
                   <div className="col-md-4">
                    <SelectField
                      label="Month"
                      value={selectedMonthOption}
                      name="filteredMonth"
                      placeholder="Select Month"
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
                      onChange={(selectedOption: any) => {
                        setSelectedMonthOption(selectedOption);
                        setSelectedMonth(selectedOption.value);
                      }}
                    />
                  </div>
                   <div className="col-md-4">
                  <div className="form-group d-flex flex-column">
                   <label className="form-label mb-1">Year</label>
                  <DatePicker
                 selected={selectedYear ? new Date(Number(selectedYear), 0) : null}
                 onChange={(date: Date | null) => {
                 if (date) {
                 setSelectedYear(date.getFullYear().toString());
                 }
                }}
                showYearPicker
                dateFormat="yyyy"
                className="form-control"
                placeholderText="Select Year"
                />
                </div>
                </div>
                   <div className="row mt-3">
                    <div className="col-12">
                      <div className="btnWrapper d-flex justify-content-end" style={{ gap: 8 }}>
                        <button
                          type="button"
                          className="btnNoicon green"
                          onClick={handleApplyFilter}
                        >
                          Apply
                        </button>
                           <button
                          type="button"
                          className="btnNoicon red"
                          onClick={() => {
                            // setFilteredUnitOption(null);
                            setFilteredUnitOption([]);
                            setSelectedMonth(String(new Date().getMonth() + 1));
                            setSelectedMonthOption({
                              value: String(new Date().getMonth() + 1),
                              label: new Date().toLocaleString('default', { month: 'long' })
                            });
                            setSelectedYear(String(new Date().getFullYear()));
                            setIsFilterOpen(false);
                          }}
                        >
                         Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CustomModal>
          <div className="card shadow rounded-4 px-4 pb-4 pt-0">
             <div className="mt-2">
              <div style={{ marginBottom: 15 }}>
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
                                <th>Unit</th>
                                <th style={{ width: "25%" }}>Overall Deptartment Score</th>  
                                <th style={{ width: "25%" }}>Overall Committee Score</th>  
                                <th style={{ width: "25%" }}>Overall Site Safety Score</th>
                                <th style={{ width: "25%" }}>Overall Site Safety %</th>
                             </tr>
                            </thead>
                           <tbody>
                                { overviewData && overviewData?.length > 0 ? (
                                overviewData?.map((item, index) => (
                               <tr key={index} className="text-center">
                               <td>{index + 1}</td>
                               {/* <td>{item.unitName}</td> */}
                               <td>{item?.unitName ?? "-"}</td>
                               <td>
                               <span
                               style={{
                               cursor: "pointer",
                               fontWeight: 600,
                               color: "#0d6efd",
                               textDecoration: "underline"
                               }}
                               onClick={() => handleDeptScoreClick(item)}
                              >
                             View Department Score
                             </span>
                             </td>
                             <td>
                            <span
                              style={{
                              cursor: "pointer",
                              fontWeight: 600,
                              color: "#0d6efd",
                              textDecoration: "underline"
                             }}
                          onClick={() => handleCommitteeScoreClick(item)}
                             >
                             View Committee Score
                             </span>
                             </td>
                            {/* <td>{item.overallSiteSafetyScore}</td>
                            <td>{item.overallSiteSafetyPercentage}%</td> */}
                            <td>{item?.overallSiteSafetyScore ?? 0}</td>
                            <td>{item?.overallSiteSafetyPercentage ?? 0}%</td>
                            </tr>
                           ))
                           ) : (
                          <tr>
                         <td colSpan={6} className="text-center">
                         No Data Available
                         </td>
                        </tr>
                        )}
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
                      </div>
                    {showDeptModal && (
                    <div
                    className="modal fade show"
                  style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
                  >
                 <div className="modal-dialog  modal-dialog-centered"
                 style={{ maxWidth: "350px" }} >
                 <div className="modal-content">
                 <div className="modal-header py-2">
                   <h5 className="modal-title">
                    Department Scores - {selectedLocation}
                   </h5>
                      <button
                      type="button"
                      className="btn-close"
                       onClick={closeDeptModal}
                       >
                       </button>
                       </div>
                     <div className="modal-body p-2">
                     <table className="table table-bordered text-center">
                      <thead style={{ background: "#D4DDE8", color: "black" }}>
                        <tr>
                        <th style={{ width: "50px" }}>Sr No</th>
                         <th style={{ width: "80px" }}>Department</th>
                         <th style={{ width: "80px" }}>Total Weightage</th>
                         <th style={{ width: "80px" }}>Total Calculated Score</th>
                         <th style={{ width: "80px" }}>Department Safety Rating %</th>
                         </tr>
                         </thead>
                         <tbody>
                        {deptLoading ? (
                        <tr>
                        <td colSpan={4}>Loading...</td>
                        </tr>
                        ) : deptBreakdown.length > 0 ? (
                       deptBreakdown.map((dept, index) => (
                      <tr key={index}>
                     <td>{index + 1}</td>
                     <td>{dept?.departmentName ?? "-"}</td>
                    <td>{dept?.totalWeightage ?? 0}</td>
                    <td>{dept?.totalCalculatedScore ?? 0}</td>
                    <td>{dept?.departmentSafetyRating ?? 0}%</td>
                     {/* <td>{dept.departmentName}</td>
                     <td>{dept.totalWeightage}</td>
                     <td>{dept.totalCalculatedScore}</td>
                      <td>{dept.departmentSafetyRating}%</td> */}
                     </tr>
                     ))
                     ) : (
                    <tr>
                    <td colSpan={4}>No Data</td>
                    </tr>
                    )}
                   </tbody>
                   </table>
                    </div>
                   </div>
                  </div>
                </div>
              )}
            {showCommitteeModal && (
               <div
               className="modal fade show"
               style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
              >
              <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "350px" }}
              >
               <div className="modal-content">
               <div className="modal-header py-2">
               <h5 className="modal-title">
                Committee Scores - {selectedCommitteeLocation}
                </h5>
                <button
              type="button"
              className="btn-close"
              onClick={closeCommitteeModal}
              >
            </button>
            </div>
            <div className="modal-body p-2">
             <table className="table table-bordered text-center">
              <thead style={{ background: "#D4DDE8", color: "black" }}>
                <tr>
                 <th style={{ width: "50px" }}>Sr No</th>
                  <th style={{ width: "80px" }}>Committee</th>
                  <th style={{ width: "80px" }}>Total Weightage</th>
                  <th style={{ width: "80px" }}>Total Calculated Score</th>
                </tr>
              </thead>
             <tbody>
             {committeeLoading ? (
             <tr>
             <td colSpan={4}>Loading...</td>
             </tr>
             ) : committeeBreakdown.length > 0 ? (
             committeeBreakdown.map((item, index) => (
            <tr key={index}>
            <td>{index + 1}</td>
            <td>{item?.committeeName ?? "-"}</td>
            <td>{item?.totalWeightage ?? 0}</td>
            <td>{item?.totalCalculatedScore ?? 0}</td>
            {/* <td>{item.committeeName}</td>
            <td>{item.totalWeightage}</td>
            <td>{item.totalCalculatedScore}</td> */}
            </tr>
            ))
            ) : (
            <tr>
            <td colSpan={4}>No Data</td>
            </tr>
           )}
          </tbody>
          </table>
        </div>
       </div>
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
export default ProtectedRoute (SafetyUnitWithAccordion);