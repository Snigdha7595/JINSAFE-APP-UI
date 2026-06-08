"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
// import PageHead from "@/components/Elements/PageHead";
// import SelectField from "@/components/Form/SelectFields";
// import InputField from "@/components/Form/InputField";
import Link from "next/link";
import CustomModal from "@/components/Layouts/CustomModal";
import { useState } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
];

const SiOrgSchedulePlan = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <div className="container-fluid">
        <div className="admin-boxContainer d3 ">
          <div className="adminAction">
            <Link href="/si/dashboard" className="adminAction__title">
              <span className="icon">
                <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage SI
            </Link>
          </div>
        </div>

        {/* Block 1 */}
        <div className="admin-boxContainer d2">
          <div className="adminFilters align-items-center">
            <h4>View Organization Schedule</h4>

            {/* <div className="adminFilters__list">
              <div className="adminFilters__list--title">Short by Date:</div>
              <select className="adminFilters__list--option w100">
                <option className="value">Descending</option>
                <option className="value">Ascending</option>
              </select>
              <button className="iconBtn orange w100">
                <span>View Graph</span>
                <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/bar-chart-2.svg"
                  className="img-fluid u-image"
                />
              </button>
            </div> */}
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
                        <th>Unit</th>
                        <th>Department Name</th>
                        <th>Monthly Schedule</th>
                        <th>Compiled</th>
                        <th style={{ width: "130px" }}>View Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Steel Plant - East</td>
                        <td>Mechanical Maintenance</td>
                        <td>Week 1 - Structural Check</td>
                        <td>Completed</td>
                        <td>
                          <Link href="incident-details">
                            <button className="tableBtn">
                              View
                              <span>
                                <img
                                  width="15"
                                  height="15"
                                  alt="icon"
                                  src="/images/svg/eyeicon.svg"
                                  className="img-fluid u-image"
                                />
                              </span>
                              <CustomModal
                                isOpen={isOpen}
                                onClose={() => setIsOpen(false)}
                                title="Details"
                              >
                                <>test</>
                              </CustomModal>
                            </button>
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Steel Plant - West</td>
                        <td>Electrical Maintenance</td>
                        <td>Week 2 - Power Audit</td>
                        <td>Pending</td>
                        <td>
                          <Link href="incident-details">
                            <button className="tableBtn">
                              View
                              <span>
                                <img
                                  width="15"
                                  height="15"
                                  alt="icon"
                                  src="/images/svg/eyeicon.svg"
                                  className="img-fluid u-image"
                                />
                              </span>
                              <CustomModal
                                isOpen={isOpen}
                                onClose={() => setIsOpen(false)}
                                title="Details"
                              >
                                <>test</>
                              </CustomModal>
                            </button>
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Power Division</td>
                        <td>Instrumentation</td>
                        <td>Week 3 - Sensor Calibration</td>
                        <td>In Progress</td>
                        <td>
                          <Link href="incident-details">
                            <button className="tableBtn">
                              View
                              <span>
                                <img
                                  width="15"
                                  height="15"
                                  alt="icon"
                                  src="/images/svg/eyeicon.svg"
                                  className="img-fluid u-image"
                                />
                              </span>
                              <CustomModal
                                isOpen={isOpen}
                                onClose={() => setIsOpen(false)}
                                title="Details"
                              >
                                <>test</>
                              </CustomModal>
                            </button>
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Rolling Mill</td>
                        <td>Production</td>
                        <td>Week 4 - Output Analysis</td>
                        <td>Completed</td>
                        <td>
                          <Link href="incident-details">
                            <button className="tableBtn">
                              View
                              <span>
                                <img
                                  width="15"
                                  height="15"
                                  alt="icon"
                                  src="/images/svg/eyeicon.svg"
                                  className="img-fluid u-image"
                                />
                              </span>
                              <CustomModal
                                isOpen={isOpen}
                                onClose={() => setIsOpen(false)}
                                title="Details"
                              >
                                <>test</>
                              </CustomModal>
                            </button>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="pagination_container">
                  <div className="recordsWrapper">
                    <select name="" id="" className="recordsWrapper__list">
                      <option className="recordsWrapper__item">
                        25 Records
                      </option>
                      <option className="recordsWrapper__item">
                        50 Records
                      </option>
                      <option className="recordsWrapper__item">
                        75 Records
                      </option>
                      <option className="recordsWrapper__item">
                        100 Records
                      </option>
                    </select>
                    <span className="recordsWrapper__value">
                      1-25 of 303 records
                    </span>
                  </div>
                  <nav className="pagination_wrapper">
                    <ul className="pagination">
                      <li className="page-item">
                        <button className="page-link actionBtns">
                          <img
                            width="15"
                            height="15"
                            alt="icon"
                            src="/images/svg/arrow-left-small.svg"
                            className="img-flui u-image"
                          />
                        </button>
                      </li>
                      <li className="page-item">
                        <button className="page-link active">1</button>
                      </li>
                      <li className="page-item">
                        <button className="page-link ">2</button>
                      </li>
                      <li className="page-item">
                        <button className="page-link ">3</button>
                      </li>
                      <li className="page-item">
                        <button className="page-link ">4</button>
                      </li>
                      <li className="page-item">
                        <button className="page-link ">5</button>
                      </li>
                      <li className="page-item">
                        <button className="page-link ">6</button>
                      </li>
                      <li className="page-item">
                        <button className="page-link ">
                          <img
                            width="15"
                            height="15"
                            alt="icon"
                            src="/images/svg/arrow-right-small.svg"
                            className="img-flui u-image"
                          />
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter"
      >
        <>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="Type of Observation"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Observation Category"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Observation Sub-Category"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Risk Potential"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Assign Line Manager"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <div className="dateFlield">
                  <DatePickerField
                    label="From"
                    name="fromDate"
                    placeholder="choose a date"
                    errors={""}
                    touched={""}
                    value={new Date()}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    onChange={() => {}}
                  />
                  <span className="dateFlield__icon">
                    {/* <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/calendar.svg"
                  className="img-fluid u-image"
                  /> */}
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <div className="dateFlield">
                  <DatePickerField
                    label="To"
                    name="fromDate"
                    placeholder="choose a date"
                    errors={""}
                    touched={""}
                    value={new Date()}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    onChange={() => {}}
                  />
                  <span className="dateFlield__icon">
                    {/* <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/calendar.svg"
                  className="img-fluid u-image"
                  /> */}
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="btnWrapper">
                    <button className="btnNoicon green">Apply</button>
                    <button className="btnNoicon red">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </CustomModal>
    </>
  );
};

export default ProtectedRoute(SiOrgSchedulePlan);
