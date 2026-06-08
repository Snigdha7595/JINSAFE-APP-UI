"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import dayjs from "dayjs";
import { useFormik } from "formik";
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect } from "react";
import InputField from "@/components/Form/InputField";
import TextareaField from "@/components/Form/TextareaField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import RadioField from "@/components/Form/RadioField";
import { useDispatch, useSelector } from "react-redux";
import { emptySelector } from "@/config/config";
import { selectUserToken } from "@/store/slices/authSlice";
import { serverRequest } from "@/services/getServerSideRender";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { clearScheduleId, clearObjectId, setScheduleId, setObjectId } from "@/store/slices/siSlice";
import {
  FETCH_UNITS,
  FETCH_DEPARTMENTS,
  FETCH_SECTIONS,
  FETCH_LINEMANAGER,
  FETCH_SI,
} from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { ToastContainer, toast } from "react-toastify";

type FormValues = {
  unit: string;
  departments: string;
  sections: string;
  sectionhead: string;
  scheduledate: string;
  remark: string;
  createdby: string;
  updatedby: string;
 };

 const monthOptions = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const SISchedule = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState<boolean>(false);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState("");
  const [touched, setTouched] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Schedule");

  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const currentYear = String(new Date().getFullYear());
  const yearOptions = Array.from({ length: 3 }, (_, index) => {
    const year = Number(currentYear) - index;
    return { label: `${year}`, value: `${year}` };
  });
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [scheduleData, setScheduleData] = useState([]);
  const [unitOptions, setUnitOptions] = useState(emptySelector);
  const [unit, setUnit] = useState("");
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [departments, setDepartments] = useState("");
  const [sectionOptions, setSectionOptions] = useState(emptySelector);
  const [sections, setSections] = useState("");
  const [sectionhead, setSectionHead] = useState("");
  const [scheduledate, setScheduledate] = useState("");
  const [remark, setRemark] = useState("");

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
    // fetchSchedules(user.createdBy, year, month, event.target.value);
  };
  
useEffect(() => {
    fetchSchedules(user.createdBy, year, month, selectedOption);
  }, [user?.createdBy, year, month, selectedOption]);

  useEffect(() => {
    fetchUnits();
  }, []);
 const handleNextClick = (scheduleData: any) => {
    dispatch(setObjectId(null));
    dispatch(setScheduleId(scheduleData?.scheduleid));
    router.push(APP_URL.SAFETY_SI_NEW)
  };

  const fetchSchedules = async (id, year, month, option) => {
    setScheduleData([]);
    let url = "";
    if (option === "Schedule") {
      url = FETCH_SI + `/Schedule/${id}/${year}/${month}/scheduled`;
    } else {
      url = FETCH_SI + `/Schedule/${id}/${year}/${month}/unscheduled`;
      }
    try {
      const response = await serverRequest(
        {},
        url,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.length > 0) {
         setScheduleData(response);
      } else {
        setScheduleData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const fetchSections = async (departmentId) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/get-sections/${departmentId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((value) => ({
          value: value?.sectionid,
          label: value?.sectionname,
        }));
        setSectionOptions(options);
       }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
   const fetchSectionHead = async (unitid, departmentId, sectionid) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/${unitid}` + `/${departmentId}` + `/${sectionid}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response?.sectionHead != null) {
        setSectionHead(response?.sectionHead?.linemanagerName);
        formik.setFieldValue("sectionhead", response?.sectionHead?.linemanagerName);
        // formik.setFieldvalue((prev) => ({
        //   ...prev,
        //   sectionhead: response?.sectionHead?.linemanagerName,
        // }));
      } else {
        setSectionHead("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const saveNewSchedule = async (payload) => {
    try {
      const response = await serverRequest(
        { ...payload },
        FETCH_SI + `/Schedule/`,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response != null) {
        // setSaveResponse(response);
        console.log("saveNewSchedule response:", response);
        setIsAddScheduleOpen(false);
        window.location.reload();
        } else {
        // setSaveResponse({});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const formik = useFormik<FormValues>({
    initialValues: {
    unit: user?.empUnit || "",
    departments: "",
    sections: "",
    sectionhead: "",
    scheduledate: "",
    createdby: user?.createdBy || "",
    updatedby: user?.updatedBy || "",
    remark: "",
    },
    onSubmit: (values) => {
      console.log("Submit Value-", JSON.stringify(values));
      saveNewSchedule(values);
      formik.resetForm();
      // alert(JSON.stringify(values, null, 2));
    },
  });
  return (
     <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="container-fluid">
        <div className="c-accordion overflow-visible">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">
              SI List Schedule / Unschedule
            </div>
          </div>
          <div className="bg-white p-3">
            <div className="row align-items-center">
              {/* Radio buttons on the left */}
              <div className="col-12 col-md-4">
                 <label className="styled-radio me-3">
                 <input
                  type="radio"
                  name="Schedule"
                  value="Schedule"
                  checked={selectedOption === "Schedule"}
                  onChange={handleChange}
                 />
                <span className="custom-radio"></span>
                    Schedule
                  </label>
               <label className="styled-radio me-3">
               <input
                  type="radio"
                  name="Unschedule"
                  value="Unschedule"
                  checked={selectedOption === "Unschedule"}
                  onChange={handleChange}
                 />
                 <span className="custom-radio"></span>
                    Unschedule
                  </label>
              </div>
              {/* Select fields on the right */}
              <div
                className="col-12 col-md-8">
                <div className="row align-items-center mb-0 gap-0">
                  <div className="col-12 col-md-4 col-lg-4">
                    <SelectField
                    name="month"
                    placeholder="Choose Month"
                    options={monthOptions}
                    value={monthOptions.find((opt) => opt.value === month)}
                    onChange={(option) => setMonth(option.value)}
                  />
                  </div>
                  <div className="col-12 col-md-4 col-lg-4">
                    <SelectField
                      name="year"
                      placeholder="Choose Year"
                      options={yearOptions}
                      value={yearOptions.find((opt) => opt.value === year)}
                      onChange={(option) => setYear(option.value)}
                    />
                  </div>
                  <div className="col-12 col-md-4 col-lg-4 gap-1 px-2 py-1" style={{ marginTop: "-17px" }}>
                    <Link href="#">
                      <button
                        className="iconBtn orange w100"
                        onClick={() => setIsAddScheduleOpen(true)}
                      >
                        <span>Add New Schedule</span>
                        <img
                          width="20"
                          height="20"
                          alt="Button1"
                          src="/images/svg/icons/Add.svg"
                          className="white-icon"
                        />
                      </button>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Block 2 */}
        <div className="pb-4">
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>SI No.</th>
                        <th>Schedule Date</th>
                        <th>Unit</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Section Head</th>
                        <th>Remark</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleData?.length > 0 ? (
                            scheduleData.map((row: any, index: number) => (
                              <tr key={row?.scheduleid || index}>
                                <td>{row?.siNo}</td>
                                <td>{row?.scheduledate}</td>
                                <td>{row?.unit}</td>
                                <td>{row?.departments}</td>
                                <td>{row?.sections}</td>
                                <td>{row?.sectionhead}</td>
                                <td>{row?.remark}</td>
                                <td>
                                {(row?.schedulestatus === "Schedule" && row?.siNo == null) && (
                                    <button className="tableBtn mx-auto d-block" type="button"
                                    onClick={() => handleNextClick(row)}
                                    >
                                      <img
                                        width="20"
                                        height="20"
                                        alt="icon"
                                        style={{
                                          filter:
                                            "invert(45%) sepia(33%) saturate(4285%) hue-rotate(340deg) brightness(101%) contrast(101%)",
                                        }}
                                        src="/images/svg/icons/Next.svg"
                                      />
                                    </button>
                                  )}
                                </td>
                                </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="text-center">
                                No data added yet
                              </td>
                            </tr>
                          )}
                    </tbody>
                  </table>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    <CustomModal
      isOpen={isAddScheduleOpen}
      onClose={() => setIsAddScheduleOpen(false)}
      title="Add New Schedule "
    >
      <div className="filters px-2 py-3">
        {" "}
        {/* consistent padding all around */}
        <div className="row g-3">
          {" "}
          <div className="col-12">
            
          </div>
          {/* Modal Body START */}
          <div className="form_grider d1 row g-2">
            <div className="col-md-3">
                <DatePickerField
                label="Schedule Date"
                name="scheduledate"
                placeholder="Select Date"
                errors={formik.errors.scheduledate}
                    touched={formik.touched.scheduledate}
                    value={
                      formik.values.scheduledate
                        ? new Date(formik.values.scheduledate)
                        : null
                    }
                     onChange={(date: Date | null) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        formik.setFieldValue(
                          "scheduledate",
                          `${year}-${month}-${day}`
                        );
                      } else {
                        formik.setFieldValue("scheduledate", "");
                      }
                    }}
                minDate={new Date()}
                // maxDate={today}
                dateFormat="YYYY-MM-dd"
                // errors={errors.scheduledate}
                // touched={touched.scheduledate}
               />
              </div>
              <div className="col-md-3">
                 <SelectField
                  label="Unit"
                  // value={unitOptions?.find((option) => option.value == user?.empUnit)}
                  value={unit}
                  name="unit"
                  placeholder="Select Unit"
                  options={unitOptions}
                  onChange={(value) => {
                    setUnit(value);
                    formik.setFieldValue("unit", value?.value);
                    fetchDepartments(value?.value);
                  }}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="col-md-3">
               <SelectField
                  label="Department"
                  // value={departmentOptions.find(
                  //   (option) => option.value == user.empDepartment
                  // )}
                  value={departments}
                  name="departments"
                  placeholder="Select Departments"
                  options={departmentOptions}
                  onChange={(value) => {
                    setDepartments(value);
                    formik.setFieldValue("departments", value?.value);
                    fetchSections(value?.value);
                  }}
                />
              </div>
              <div className="col-md-3">
                <SelectField
                  label="Section"
                  value={sections}
                  name="sections"
                  placeholder="Select Section"
                  options={sectionOptions}
                  onChange={(value) => {
                    setSections(value);
                    formik.setFieldValue("sections", value?.value);
                     fetchSectionHead(
                              formik.values.unit,
                              formik.values.departments,
                              value?.value
                            );
                  }}
                />
              </div>
              <div className="col-md-3">
               <InputField
                type="text"
                label="Section Head"
                value={formik.values.sectionhead}
                name="sectionhead"
                placeholder="Section Head"
                disabled={true}
                errors={formik.errors.sectionhead}
                touched={formik.touched.sectionhead}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
              </div>

              <div className="col-md-9">
                <InputField
                  type="text"
                  label="Remark"
                  value={formik.values.remark}
                  name="remark"
                  placeholder="Remark"
                  errors={formik.errors.remark}
                  touched={formik.touched.remark}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
              </div>
            </div>
            {/* Modal Body END */}
            {/* Footer */}
            <div className="col-12">
              <div className="d-flex flex-wrap justify-content-end gap-0 pt-3 border-top mt-2">
                <Link href="#">
                  <button type="button" className="iconBtn green w100 gap-2"
                  onClick={() => {
                  if (!formik.values.unit && !formik.values.departments && !formik.values.sections && !formik.values.sectionhead && !formik.values.scheduledate && !formik.values.remark) {
                    toast.error("Please fill all required fields!");
                    return;
                  }
                  formik.handleSubmit();
                  
                  }}
                  >
                    <img
                      width="20"
                      height="20"
                      alt="Save"
                      src="/images/svg/icons/Save.svg"
                      className="white-icon"
                    />
                    <span>Create Schedule</span>
                  </button>
                </Link>

                <Link href="#">
                  <button
                    className="iconBtn grey d-flex align-items-center gap-2"
                    onClick={() => setIsAddScheduleOpen(false)}
                  >
                    <img
                      width="20"
                      height="20"
                      alt="Cancel"
                      src="/images/svg/icons/Cancle.svg"
                      className="white-icon"
                    />
                    <span>Cancel</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
      <ToastContainer pauseOnHover={false} />
    </form>
  );
};

export default SISchedule;