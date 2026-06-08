import React from 'react';
import Image from 'next/image';
import InputField from '@/components/Form/InputField';

const RecordViewed = ({
  formik,
  recordViewed,
  setRecordViewed,
  addRecords,
  removeRecord,
  closeModal
}) => {
  return (
    <>
      <div className="filters">
        <div className="row form_grider d1">
          <div className="col-12">
            <InputField
              type="text"
              label="Record Viewed"
              value={recordViewed}
              name="recordViewed"
              onBlur={() => {}}
              placeholder=""
              onChange={(e) => setRecordViewed(e.target.value)}
              maxLength={300}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="btnWrapper">
              <button
                type="button"
                className="btnNoicon red"
                onClick={() => closeModal("AddRecordSection")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btnNoicon green"
                onClick={addRecords}
              >
                Add Details
              </button>
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
                      <th>S no</th>
                      <th>Record Viewed</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formik.values.recordSection && formik.values.recordSection.length > 0 ? (
                      formik.values.recordSection.map((member, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{member.recordViewed}</td>
                          <td className="u-icon">
                            <button
                              type="button"
                              className="tableBtn v2"
                              disabled={true}
                              onClick={() => removeRecord(index)}
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
                        <td colSpan={3} className="text-center">
                          No details added yet
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

export default RecordViewed;