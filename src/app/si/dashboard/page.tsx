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

const si_dashboard = () => {
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
        <div className="admin-boxContainer d2 mb-0">
          <div className="adminFilters align-items-center">
            <h4>SI Compliance</h4>

            <div className="adminFilters__list">
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
            </div>
          </div>

          <hr className="d-block my-4 border border-dark w-100" />

          <div className="d-flex flex-row gap-2 p-0">
            <button className="iconBtn orange w100 p-2 m-0">
              <span>Week </span>
              <span className="badge text-bg-secondary fs-6 p-1">1</span>
            </button>

            <button className="iconBtn orange w100 p-2">
              <span>Week </span>
              <span className="badge text-bg-secondary fs-6 p-1">2</span>
            </button>

            <button className="iconBtn orange w100 p-2">
              <span>Week </span>
              <span className="badge text-bg-secondary fs-6 p-1">3</span>
            </button>
            <button className="iconBtn orange w100 p-2">
              <span>Week </span>
              <span className="badge text-bg-secondary fs-6 p-1">4</span>
            </button>
            <button className="iconBtn orange w100 p-2">
              <span>Week </span>
              <span className="badge text-bg-secondary fs-6 p-1">5</span>
            </button>
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
                        <th>Month</th>
                        <th>SI Planned</th>
                        <th>SI Completed</th>
                        <th>Percentage Completion</th>
                        <th>Compiled</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>January</td>
                        <td>12 Installations</td>
                        <td>10 Completed</td>
                        <td>83.3%</td>
                        <td>Compiled by QA</td>
                      </tr>
                      <tr>
                        <td>February</td>
                        <td>15 Installations</td>
                        <td>14 Completed</td>
                        <td>93.3%</td>
                        <td>Compiled by Team Lead</td>
                      </tr>
                      <tr>
                        <td>March</td>
                        <td>18 Installations</td>
                        <td>16 Completed</td>
                        <td>88.9%</td>
                        <td>Compiled by Operations</td>
                      </tr>
                      <tr>
                        <td>April</td>
                        <td>20 Installations</td>
                        <td>18 Completed</td>
                        <td>90%</td>
                        <td>Compiled by Audit</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* <div className="pagination_container">
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
                </div> */}

                <div className="d-flex flex-row justify-content-end gap-2 p-0 align-items-end p-3">
                  <Link href="/si/si-org-schedule-plan">
                    <button className="iconBtn green w100">
                      <span>View Organization Schedule Plan</span>
                      <img
                        width="15"
                        height="15"
                        alt="icon"
                        src="/images/svg/icons/organization.svg"
                        className="img-fluid u-image"
                      />
                    </button>
                  </Link>
                  <Link href="/si/si-schedule">
                    <button className="iconBtn green w100">
                      <span>Make Your Schedule</span>
                      <img
                        width="15"
                        height="15"
                        alt="icon"
                        src="/images/svg/calendar.svg"
                        className="img-fluid u-image white-icon"
                      />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block 1 */}
        <div className="admin-boxContainer d2 mb-0">
          <div className="adminFilters align-items-center">
            <h4>View Safety Interactions</h4>
            <div className="adminFilters__list">
              <Link href="#">
                <button
                  className="iconBtn grey w100 gap-1"
                  onClick={() => setIsOpen(true)}
                >
                  <span>Filter</span>
                  <img
                    width="20"
                    height="20"
                    alt="Filter"
                    src="/images/svg/icons/Filter.svg"
                    className="white-icon"
                  />
                </button>
              </Link>

              <Link href="/si/si-new">
                <button className="iconBtn orange w100">
                  <span>Add New SI</span>
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

        {/* Block 3 */}
        <div className="pb-4">
          <div className="admin-boxContainer d1 ">
            <div className="row">
              <div className="col-12">
                <div className="admin-table d3 table-responsive noHover">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>SI Planned</th>
                        <th>SI Completed</th>
                        <th>Percentage Completion</th>
                        <th>Compiled</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="row form_grider d1">
                            <InputField
                              type="text"
                              label=""
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
                        </td>
                        <td>
                          <div className="row form_grider d1">
                            <InputField
                              type="text"
                              label=""
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
                        </td>
                        <td>
                          <div className="row form_grider d1">
                            <InputField
                              type="text"
                              label=""
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
                        </td>
                        <td>
                          <div className="row form_grider d1">
                            <InputField
                              type="text"
                              label=""
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
                        </td>
                        <td>
                          <div className="row form_grider d1">
                            <SelectField
                              label=""
                              value={"Select"}
                              name="state"
                              placeholder=""
                              options={options}
                              onChange={() => {}}
                              onBlur={() => {}}
                            />
                          </div>
                        </td>
                      </tr>
                      {
                        <tr>
                          <td>February</td>
                          <td>15 Installations</td>
                          <td>14 Completed</td>
                          <td>93.3%</td>
                          <td>Compiled by Team Lead</td>
                        </tr>
                        /*  <tr>
                        <td>March</td>
                        <td>18 Installations</td>
                        <td>16 Completed</td>
                        <td>88.9%</td>
                        <td>Compiled by Operations</td>
                      </tr>
                      <tr>
                        <td>April</td>
                        <td>20 Installations</td>
                        <td>18 Completed</td>
                        <td>90%</td>
                        <td>Compiled by Audit</td>
                      </tr> */
                      }
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

export default ProtectedRoute(si_dashboard);
