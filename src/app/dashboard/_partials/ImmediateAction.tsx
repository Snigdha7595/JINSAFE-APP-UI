'use client';
import { useState } from 'react';
import { Formik } from 'formik';
import InputField from '@/components/Form/InputField';
import Button from '@/components/Elements/Button';
import * as Yup from 'yup';
import Modal from '@/components/Modal/Modal';
import { CONSTANTS } from '@/config/constant';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { serverRequest } from '@/services/getServerSideRender';
import { toast } from 'react-toastify';
import SelectField from '@/components/Form/SelectFields';
interface User {
  board: {
      name: string;
      code: string;
      type: string;
      ministry: string;
      guid: string | undefined;
  };
  api_auth_token: string;
}

const ImmediateAction = ({setPasswordAlt, guid}: { setPasswordAlt: (x:boolean) => void, guid: string }) => {
  console.log("guid", guid)
    const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };
    const [showPassword] = useState<boolean>(false)
    const [showConfirmPassword] = useState(false);
    const [initialValues] = useState({password: '', passwordConfirm: ''})
    const validationSchema = Yup.object({
          password: Yup.string()
            .nullable()
            .notRequired()
            .min(8, 'Password must be at least 8 characters long')
            .matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'
            ),
          passwordConfirm: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match').nullable()
            .notRequired(),
        });

  return (
    <>
      <Modal heading="Reset Password" action={() => setPasswordAlt(false)}>
        <div className="admin-boxContainer d1">
          <div className="row">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={async (
                values
              ) => {
                try {
                  const formdata = {
                    password: values.password,
                    confirm_password: values.passwordConfirm
                    }
                  const response = await serverRequest(
                      formdata,
                      `API url`,
                      'GET',
                      true,
                      true,
                      user?.api_auth_token
                  );
      
                  if (response && response.status === CONSTANTS.STATUS_FAILED) {
                      toast.error(response.message);
                      response.errors.forEach(function (error: Error) {
                          toast.error(error.message);
                      });
                  } else if (
                      response &&
                      response.status === CONSTANTS.STATUS_SUCCESS
                  ) {
                      toast.success(response.message);
                  }
              } catch (errors: unknown) {
                  toast.error('Something went wrong. Please try again.');
                  console.log(errors)
              }
              }}
            >
              {({
                values,
                touched,
                dirty,
                errors,
                handleChange,
                handleBlur,
                handleSubmit,
              }) => (
                <form onSubmit={handleSubmit}>
                  <div className="filters_wrapper_container">
                    <div className="form_grider d1 small w-100">
                      <div className="row">
                        <div className="col-12 col-lg-6 col-md-6 position-relative text-start">
                            <InputField
                              type={`${showPassword ? 'text' : 'password'}`}
                              label="Password"
                              value={values.password}
                              name={'password'}
                              placeholder="Enter password"
                              errors={errors.password}
                              touched={touched.password}
                              onBlur={handleBlur}
                              onChange={handleChange}
                            />
                        </div>
                        <div className="col-12 col-lg-6 col-md-6 position-relative text-start">
                            <InputField
                              type={`${showConfirmPassword ? 'text' : 'password'}`}
                              label="Confirm Password"
                              value={values.passwordConfirm}
                              name={'passwordConfirm'}
                              placeholder="Re-enter password"
                              errors={errors.passwordConfirm}
                              touched={touched.passwordConfirm}
                              onBlur={handleBlur}
                              onChange={handleChange}
                            />
                            <SelectField
                                                        value="random"
                                                        name="state"
                                                        placeholder="Import/Export"
                                                        options={{label: "Random", value: "random"}}
                                                        onChange={() => {}}
                                                    />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <Button
                      color="primary"
                      isDisabled={
                        !dirty ||
                        values.passwordConfirm !== values.password ||
                        !!Object.keys(errors).length
                      }
                      varient="solid"
                      radius="sm"
                      size="md"
                      type="submit"
                      customClass='me-2'
                    >
                      Submit
                    </Button>
                    <Button
                      color="primary"
                      clickHandler={() => setPasswordAlt(false)}
                      varient="solid"
                      radius="sm"
                      size="md"
                      type="submit"
                      customClass='ms-2'
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </Modal>
    </>
  );}
  export default ImmediateAction;