import React from 'react';
import Image from 'next/image';
import InputField from '@/components/Form/InputField';
import DatePickerField from '@/components/Form/DatePickerField';

const Chronology = ({
  formik,
  chronology,
  // State values
  chronologyDate,
  setChronologyDate,
  chronologyTime,
  setChronologyTime,
  chronologyActivity,
  setChronologyActivity,
  chronologyRemark,
  setChronologyRemark,
  editChronologyDate,
  setEditChronologyDate,
  editChronologyTime,
  setEditChronologyTime,
  editChronologyActivity,
  setEditChronologyActivity,
  editChronologyRemark,
  setEditChronologyRemark,
  editingChronologyIndex,
  setEditingChronologyIndex,
  // Functions
  updateChronology,
  addChronology,
  removechronology,
  closeModal,
  resetChronologyFields
}) => {
  return (
    <>
      <div className="filters">
        <div className="row form_grider d1">
          <div className="col-12 col-md-3 col-lg-3">
            <DatePickerField
              label="Date"
              name="chronologyDate"
              value={editingChronologyIndex !== null ? editChronologyDate : chronologyDate}
              placeholder="choose a date"
              maxDate={new Date()}
              dateFormat="yyyy-MM-dd"
              onChange={(date) => editingChronologyIndex !== null ? setEditChronologyDate(date) : setChronologyDate(date)}
            />
          </div>
          <div className="col-12 col-md-3 col-lg-3">
            <DatePickerField
              label="Time"
              name="chronologyTime"
              placeholder="Select time"
              value={editingChronologyIndex !== null ? editChronologyTime : chronologyTime}
              onChange={(date) => editingChronologyIndex !== null ? setEditChronologyTime(date) : setChronologyTime(date)}
              showTimeSelect
              showTimeSelectOnly
              dateFormat="HH:mm"
              timeFormat="HH:mm"
              timeIntervals={15}
            />
          </div>
          <div className="col-12 col-md-3 col-lg-3">
            <InputField
              type="text"
              label="Activity"
              value={editingChronologyIndex !== null ? editChronologyActivity : chronologyActivity}
              name="chronologyActivity"
              placeholder=""
              errors={""}
              touched={""}
              onBlur={() => {}}
              onChange={(e) => editingChronologyIndex !== null ? setEditChronologyActivity(e.target.value) : setChronologyActivity(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="col-12 col-md-3 col-lg-3">
            <InputField
              type="text"
              label="Remarks"
              value={editingChronologyIndex !== null ? editChronologyRemark : chronologyRemark}
              name="chronologyRemark"
              placeholder=""
              errors={""}
              touched={""}
              onBlur={() => {}}
              onChange={(e) => editingChronologyIndex !== null ? setEditChronologyRemark(e.target.value) : setChronologyRemark(e.target.value)}
              maxLength={120}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="btnWrapper">
              <button
                type="button"
                className="btnNoicon red"
                onClick={() => {
                  closeModal("AddChronologyForm");
                  setEditingChronologyIndex(null);
                  resetChronologyFields();
                }}
              >
                Cancel
              </button>
              {editingChronologyIndex !== null ? (
                <button
                  type="button"
                  className="btnNoicon green"
                  onClick={() => updateChronology(editingChronologyIndex, formik.values, formik.setFieldValue)}
                  disabled={!editChronologyActivity.trim()}
                >
                  Update Details
                </button>
              ) : (
                <button
                  type="button"
                  className="btnNoicon green"
                  onClick={() => addChronology(formik.values, formik.setFieldValue)}
                  disabled={!chronologyActivity.trim()}
                >
                  Add Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="formTable">
            <div className="formTable__table">
              <div className="admin-table d3 table-responsive mt-3 noHover">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Activity</th>
                      <th>Remarks</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chronology && chronology.length > 0 ? (
                      chronology.map((member, index) => (
                        <tr key={index}>
                          <td>
                            {member.chronologyDate ? new Date(member.chronologyDate).toLocaleDateString() : ""}
                          </td>
                          <td>
                            {member.chronologyTime ? new Date(member.chronologyTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                          </td>
                          <td>{member.chronologyActivity}</td>
                          <td>{member.chronologyRemark}</td>
                          <td className="u-icon">
                            <button
                              type="button"
                              className="tableBtn v2"
                              onClick={() => {
                                setEditingChronologyIndex(index);
                                setEditChronologyDate(member.chronologyDate ? new Date(member.chronologyDate) : null);
                                setEditChronologyTime(member.chronologyTime ? new Date(member.chronologyTime) : null);
                                setEditChronologyActivity(member.chronologyActivity || "");
                                setEditChronologyRemark(member.chronologyRemark || "");
                              }}
                              title="Edit"
                            >
                              <span className="iconSecondary">
                                <Image
                                  width={15}
                                  height={15}
                                  alt="Edit"
                                  src="/images/svg/edit-icon-blue.svg"
                                  className="img-fluid u-image"
                                />
                              </span>
                            </button>
                            <button
                              type="button"
                              className="tableBtn v2"
                              onClick={() => removechronology(index, formik.values, formik.setFieldValue)}
                              disabled={true}
                              title="Delete"
                            >
                              <span className="iconSecondary">
                                <Image
                                  width={15}
                                  height={15}
                                  alt="Delete"
                                  src="/images/svg/delete-icon.svg"
                                  className="img-fluid u-image"
                                />
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center">
                          No Chronology of events added yet
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
    </>
  );
};

export default Chronology;