import React from 'react';
import Image from 'next/image';
import InputField from '@/components/Form/InputField';

const KeyFindings = ({
  formik,
  finding,
  setFinding,
  editFinding,
  setEditFinding,
  editingIndex,
  setEditingIndex,
  updateFacts,
  addFacts,
  removefacts,
  closeModal
}) => {
  return (
    <>
      <div className="filters">
        <div className="row form_grider d1">
          <div className="col-12">
            <InputField
              type="text"
              label="Findings"
              value={editingIndex !== null ? editFinding : finding}
              onBlur={() => {}}
              name="finding"
              placeholder=""
              onChange={(e) => editingIndex !== null ? setEditFinding(e.target.value) : setFinding(e.target.value)}
              maxLength={300}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="btnWrapper">
              {editingIndex !== null ? (
                <button
                  type="button"
                  className="btnNoicon green"
                  onClick={() => updateFacts(editingIndex, editFinding, formik.values, formik.setFieldValue)}
                  disabled={!editFinding}
                >
                  Update Details
                </button>
              ) : (
                <button
                  type="button"
                  className="btnNoicon green"
                  onClick={() => addFacts(formik.values, formik.setFieldValue)}
                  disabled={!finding}
                >
                  Add Details
                </button>
              )}
              <button
                type="button"
                className="btnNoicon red"
                onClick={() => {
                  closeModal("AddKey");
                  setEditingIndex(null);
                  setEditFinding("");
                }}
              >
                Cancel
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
                      <th>Finding</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formik.values.keyFindings && formik.values.keyFindings.length > 0 ? (
                      formik.values.keyFindings.map((member, index) => (
                        <tr key={index}>
                          <td>
                            {editingIndex === index ? (
                              <input
                                type="text"
                                value={editFinding}
                                onChange={(e) => setEditFinding(e.target.value)}
                                className="form-control"
                                maxLength={80}
                              />
                            ) : (
                              member.keyFinding
                            )}
                          </td>
                          <td className="u-icon">
                            {editingIndex === index ? (
                              <>
                                <button
                                  type="button"
                                  className="btnNoicon green me-2"
                                  onClick={() => updateFacts(index, editFinding, formik.values, formik.setFieldValue)}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="btnNoicon red"
                                  onClick={() => {
                                    setEditingIndex(null);
                                    setEditFinding("");
                                  }}
                                  title="Cancel"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="tableBtn v2"
                                  onClick={() => {
                                    setEditingIndex(index);
                                    setEditFinding(member.keyFinding);
                                  }}
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
                                  onClick={() => removefacts(index, formik.values, formik.setFieldValue)}
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
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center">
                          No findings added yet
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

export default KeyFindings;
