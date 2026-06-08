import { useRef, useState, useEffect } from 'react';
import PageHead from '@/components/Elements/PageHead';
import { Formik, Form } from 'formik';
// import { restrictAlphabets } from '@/config/globalUtils';
import * as Yup from 'yup';
// import Button from '@/components/Elements/Button';

import Image from 'next/image';

import InputField from '@/components/Form/InputField';
import DatePickerField from '@/components/Form/DatePickerField';
import SelectField from '@/components/Form/SelectFields';
// import { APPIMAGES } from '@/config/config';
import { ActionMeta, SelectInstance, SingleValue } from 'react-select';
// import { selectUserToken } from '@/store/slices/AuthSlice';
// import { useSelector } from 'react-redux';
import { serverRequest } from '@/services/getServerSideRender';
// import { ADMINISTRATOR_DETAIL, GET_OFFICIAL_DETAIL } from '@/config/apiConfig';
// import { BACKEND, CONSTANTS } from '@/config/constant';
// import { getMembersListByType, setDateFormat, convertToBoolean } from '@/components/helper';
import { toast, ToastContainer } from 'react-toastify';
// import Breadcrumb from './Breadcrumb';
// import { CourseItem } from '@/components/interfaces';
import Button from '@/components/Elements/Button';

interface SelectOptions {
    label: string;
    value: string | number;
}

const SomeForm = function () {

    const [initialValues, setInitialValues] = useState({
        finalExamCommencementDate: '',
        finalExamCompletionDate: '',
        supExamCommencementDate: '',
        supExamCompletionDate: '',
        governmentSchool: '',
        government12School: '',
        governmentAidedSchool: '',
        government12AidedSchool: '',
        privateUnaidedSchool: '',
        private12UnaidedSchool: '',
        totalSchool: '',
        total12School: '',
        followsNcertSyllabus: '',
        topicsMoreThanNcert: '',
        otherSyllabusFollowed: '',
        supplementaryExamSysExists: '',
        concernedOfficer: '',
        chairmanSecretaryOfBoard: '',
    });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const commonSchema = Yup.object().shape({
        finalExamCommencementDate: Yup.date().required(
            'Final Exam Commencement Date is required'
        ),
        finalExamCompletionDate: Yup.date()
            .required('Final Exam Completion Date is required')
            .min(
                Yup.ref('finalExamCommencementDate'),
                'Must be after commencement date'
            ),
        supExamCommencementDate: Yup.date()
            .nullable()
            .when('supplementaryExamSysExists', {
                is: 'Yes',
                then: (schema) =>
                    schema.required('Supplementary Exam Commencement Date is required'),
                otherwise: (schema) => schema.notRequired(),
            }),
        supExamCompletionDate: Yup.date()
            .nullable()
            .when('supplementaryExamSysExists', {
                is: 'Yes',
                then: (schema) =>
                    schema
                        .required('Supplementary Exam Completion Date is required')
                        .min(
                            Yup.ref('supExamCommencementDate'),
                            'Must be after commencement date'
                        ),
                otherwise: (schema) => schema.notRequired(),
            }),
            followsNcertSyllabus: Yup.string().required(
                'Follows NCERT Syllabus field is required'
            ),
            topicsMoreThanNcert: Yup.string()
                .nullable()
                .when('followsNcertSyllabus', {
                    is: 'Yes',
                    then: (schema) => schema.required('Topics Covered field is required'),
                    otherwise: (schema) => schema.notRequired(),
                }),
            otherSyllabusFollowed: Yup.string()
                .nullable()
                .when('followsNcertSyllabus', {
                    is: 'Yes',
                    then: (schema) =>
                        schema.required('Other Syllabus Followed field is required'),
                    otherwise: (schema) => schema.notRequired(),
                }),
            supplementaryExamSysExists: Yup.string().required(
                'Supplementary Exam System Exists field is required'
            ),
    
            concernedOfficer: Yup.string().test('is-required-if-empty', 'Concerned Officer is required', (value) => {
                return value !== '';
            }),
    
            chairmanSecretaryOfBoard: Yup.string().test('is-required-if-empty', 'Chairman/Secretary Of Board field is required', (value) => {
                return value !== '';
            }),
        });
    
    // const secondarySpecificSchema = Yup.object().shape({
    //     governmentSchool: Yup.number().required(
    //         'Government School Count is required'
    //     ),
    //     governmentAidedSchool: Yup.number().required(
    //         'Government Aided School Count is required'
    //     ),
    //     privateUnaidedSchool: Yup.number().required(
    //         'Private Unaided School Count is required'
    //     ),
    // });
    
    const seniorSecondarySpecificSchema = Yup.object().shape({
        government12School: Yup.number().required(
            'Government School Count is required'
        ),
        government12AidedSchool: Yup.number().required(
            'Government Aided School Count is required'
        ),
        private12UnaidedSchool: Yup.number().required(
            'Private Unaided School Count is required'
        ),
    });
    
    // const validationSchemaSecondary = commonSchema.concat(secondarySpecificSchema);
    const validationSchemaSeniorSecondary = commonSchema.concat(seniorSecondarySpecificSchema);
    // const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
    //     restrictAlphabets(event.nativeEvent, ref, isMob);
    // };

    const [
        //alertMsg
        , setAlertMsg] = useState('');
    const [oldData] = useState({ // setOldData
        finalExamCommencementDate: '',
        finalExamCompletionDate: '',
        supExamCommencementDate: '',
        supExamCompletionDate: '',
        governmentSchool: '',
        government12School: '',
        governmentAidedSchool: '',
        government12AidedSchool: '',
        privateUnaidedSchool: '',
        private12UnaidedSchool: '',
        totalSchool: '',
        total12School: '',
        followsNcertSyllabus: '',
        topicsMoreThanNcert: '',
        otherSyllabusFollowed: '',
        supplementaryExamSysExists: '',
        concernedOfficer: '',
        chairmanSecretaryOfBoard: '', })
    // const [isOtherCourseFilled, setIsOtherCourseFilled] = useState<boolean>(false);
    // const [otherResponse, setOtherResponse] = useState({
    //   start_date: '',
    //   end_date: '',
    //   supplement_exam_start_date: '',
    //   supplement_exam_end_date: '',
    //   x_govt_school: '',
    //   xii_govt_school: '',
    //   x_govt_aided_school: '',
    //   xii_govt_aided_school: '',
    //   x_pvt_unaided_school: '',
    //   xii_pvt_unaided_school: '',
    //   is_ncert_syllabus: '',
    //   ncert_syllabus_part: '',
    //   is_other_syllabus: '',
    //   is_supplementary: '',
    //   respondant: '',
    //   chairman: '',
    // });
    // const token = useSelector(selectUserToken);
    // const [selectedCourseId] = useState(Number(localStorage.getItem('selectedCourseId')))
    // const [chairmanOptions, setChairmanOptions] = useState<any[]>([]);
    // const [respondantOptions, setRespondantOptions] = useState<any[]>([]);
    const supplementaryExamSysExistsRef = useRef<SelectInstance<SelectOptions, false> | null>(null);
    const otherSyllabusFollowedRef = useRef<SelectInstance<SelectOptions, false> | null>(null);
    const topicsMoreThanNcertRef = useRef<SelectInstance<SelectOptions, false> | null>(null);
    const followsNcertSyllabusRef = useRef<SelectInstance<SelectOptions, false> | null>(null);
    // const chairmanSecretaryOfBoardRef = useRef<SelectInstance<SelectOptions, false> | null>(null);
    // const concernedOfficerRef = useRef<SelectInstance<SelectOptions, false> | null>(null);
    const governmentSchoolRef = useRef<HTMLInputElement | null>(null);
    const government12SchoolRef = useRef<HTMLInputElement | null>(null);
    const governmentAidedSchoolRef = useRef<HTMLInputElement | null>(null);
    const government12AidedSchoolRef = useRef<HTMLInputElement | null>(null);
    const privateUnaidedSchoolRef = useRef<HTMLInputElement | null>(null);
    const private12UnaidedSchoolRef = useRef<HTMLInputElement | null>(null);
    const [errorsExist, setErrorsExist] = useState<boolean>(false);
    const [supplementaryExamSysExists, setSupplementaryExamSysExists] =
        useState<SelectOptions | null>(null);
    const [followsNcertSyllabus, setFollowsNcertSyllabus] = useState<SelectOptions | null>(null);
    const [topicsMoreThanNcert, setTopicsMoreThanNcert] = useState<SelectOptions | null>(null);
    const [otherSyllabusFollowed, setOtherSyllabusFollowed] = useState<SelectOptions | null>(null);
    const [concernedOfficer, setConcernedOfficer] = useState();
    const [concernedOfficerId, setConcernedOfficerId] = useState();
    const [chairmanSecretaryOfBoard, setChairmanSecretaryOfBoard] = useState();
    const [chairmanSecretaryOfBoardId, setChairmanSecretaryOfBoardId] = useState();
    const [guid] = useState(''); // setGuid
    // const breadcrumbOfficialDetail: boolean = true; // or false
    // const breadcrumbResult: boolean = false; // or false
    useEffect(() => {
        if (errorsExist) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        //Get Member List
        const getMembersList = async () => {
            try {
                const req = await serverRequest(
                    {},
                    "API URL",
                    'GET',
                    true,
                    true,
                    'toke blabla'
                );

                if (req && req.status == "success") {
                    setConcernedOfficerId(req.data.members[1].id)
                    setConcernedOfficer(req.data.members[1].full_name)
                    setChairmanSecretaryOfBoard(req.data.members[0].full_name)
                    setChairmanSecretaryOfBoardId(req.data.members[0].id)
                    // const chairman = getMembersListByType(req.data.members, 'chairman');
                    // const respondant = getMembersListByType(req.data.members, 'respondant');

                    // setChairmanOptions(chairman); // Store in state
                    // setRespondantOptions(respondant);
                }
            } catch (error) {
                console.log(error);
            }
        }
        //Get Member List
        const loadResultData = async () => {
            try {
                const req = await serverRequest(
                    {},
                    `API URL`,
                    'Get method or whichever',
                    true,
                    true,
                    'token identifier'
                );

                if (req && req.status == "success") {
                   console.log("success Code here")
                }
            } catch (error) {
                console.log(error);
            }
        }

        getMembersList();
        loadResultData();
    }, []); // token, errorsExist
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    return (
        <>
            {/* <Breadcrumb breadcrumbOfficialDetail={breadcrumbOfficialDetail} breadcrumbResult={breadcrumbResult} /> */}
            <div className="container-fluid">
                <div className="admin-boxContainer d1">
                    <div className="admin-pageWrapper">
                        <div className="admin-pageWrapper_box">
                            <div className="admin-pageWrapper__item w-100">
                                <PageHead title="Official Details" />
                                {true &&  <div className="d-flex">
                                    <label className="d-flex align-items-center" style={{cursor: 'pointer'}}><input type="checkbox" style={{cursor: 'pointer'}} onChange={(e) => {
                                    if(e.target.checked){
                                        // setInitialValues({
                                        //     finalExamCommencementDate: otherResponse.hasOwnProperty("start_date") ? otherResponse.start_date : '',
                                        //     finalExamCompletionDate: otherResponse.hasOwnProperty("end_date") ? otherResponse.end_date : '',
                                        //     supExamCommencementDate: otherResponse.hasOwnProperty("supplement_exam_start_date") && otherResponse.supplement_exam_start_date !== null ? otherResponse.supplement_exam_start_date : '',
                                        //     supExamCompletionDate: otherResponse.hasOwnProperty("supplement_exam_end_date") && otherResponse.supplement_exam_end_date !== null ? otherResponse.supplement_exam_end_date : '',
                                        //     governmentSchool: otherResponse.hasOwnProperty("x_govt_school") && (selectedCourseId == BACKEND.SECONDARY) ? otherResponse.x_govt_school : '',
                                        //     government12School: otherResponse.hasOwnProperty("xii_govt_school") && (selectedCourseId == BACKEND.HIGHER_SECONDARY) ? otherResponse.xii_govt_school : '',
                                        //     governmentAidedSchool: otherResponse.hasOwnProperty("x_govt_aided_school") && (selectedCourseId == BACKEND.SECONDARY) ? otherResponse.x_govt_aided_school : '',
                                        //     government12AidedSchool: otherResponse.hasOwnProperty("xii_govt_aided_school") && (selectedCourseId == BACKEND.HIGHER_SECONDARY) ? otherResponse.xii_govt_aided_school : '',
                                        //     privateUnaidedSchool: otherResponse.hasOwnProperty("x_pvt_unaided_school") && (selectedCourseId == BACKEND.SECONDARY) ? otherResponse.x_pvt_unaided_school : '',
                                        //     private12UnaidedSchool:otherResponse.hasOwnProperty("xii_pvt_unaided_school") && (selectedCourseId == BACKEND.HIGHER_SECONDARY) ? otherResponse.xii_pvt_unaided_school : '',
                                        //     totalSchool: otherResponse.hasOwnProperty("response.x_govt_school") && (selectedCourseId == BACKEND.SECONDARY) ? (otherResponse.x_govt_school + otherResponse.x_govt_aided_school + otherResponse.x_pvt_unaided_school) : '',
                                        //     total12School: otherResponse.hasOwnProperty("xii_govt_school") && (selectedCourseId == BACKEND.HIGHER_SECONDARY) ? (otherResponse.xii_govt_school + otherResponse.xii_govt_aided_school + otherResponse.xii_pvt_unaided_school) : '',
                                        //     followsNcertSyllabus: otherResponse.hasOwnProperty("is_ncert_syllabus") ? (otherResponse.is_ncert_syllabus) ? 'Yes' : 'No' : '',
                                        //     topicsMoreThanNcert: otherResponse.hasOwnProperty("ncert_syllabus_part") && otherResponse.ncert_syllabus_part !== null ? otherResponse.ncert_syllabus_part.toString() : '',
                                        //     otherSyllabusFollowed: otherResponse.hasOwnProperty("is_other_syllabus") ? (otherResponse.is_other_syllabus) ? 'Yes' : 'No' : '',
                                        //     supplementaryExamSysExists: otherResponse.hasOwnProperty("is_supplementary") ? (otherResponse.is_supplementary) ? 'Yes' : 'No' : '',
                                        //     concernedOfficer: otherResponse.hasOwnProperty("respondant") ? otherResponse.respondant.toString() : '',
                                        //     chairmanSecretaryOfBoard: otherResponse.hasOwnProperty("chairman") ? otherResponse.chairman.toString() : '',
                                        // })
                                    } else {
                                        setInitialValues(oldData)
                                    }          
                                    }} />
                                    {/* {isOtherCourseFilled && <span className="m-0 ms-1">Same as {selectedCourseId == BACKEND.SECONDARY ? 'Senior Secondary Course Details' : 'Secondary Course Details'}</span>} */}
                                    </label></div>}
                            </div>
                        </div>
                        <div className="mobFilterOpen">
                            <div className="filters_wrapper">
                                <div
                                    className="d-flex justify-content-between rounded-3 px-3 py-2"
                                    style={{ background: '#0585d1' }}
                                >
                                    <span className="fw-bolder text-white fs-5">Block O-1</span>
                                    <span className="admin-navigation_item_icon">
                                        {/* <Image
                                            src=""
                                            alt="left arrow"
                                            width={10}
                                            height={10}
                                            style={{ marginTop: '0px' }} /> */}
                                    </span>
                                </div>
                                <div>
                                    <Formik
                                        initialValues={initialValues}
                                        enableReinitialize={true}
                                        validationSchema={validationSchemaSeniorSecondary}
                                        validateOnChange={true}
                                        validateOnBlur={true}
                                        onSubmit={async (values, { setSubmitting }) => {
                                            const {
                                                // finalExamCommencementDate, finalExamCompletionDate, supplementaryExamSysExists, supExamCommencementDate, supExamCompletionDate, followsNcertSyllabus, topicsMoreThanNcert, otherSyllabusFollowed, governmentSchool, governmentAidedSchool, privateUnaidedSchool, government12School, government12AidedSchool, private12UnaidedSchool, concernedOfficer, chairmanSecretaryOfBoard
                                            } = values;
                                            const payload = {
                                                // official_detail: {
                                                //     course_id: selectedCourseId,
                                                //     start_date: finalExamCommencementDate ? setDateFormat(new Date(finalExamCommencementDate)) : '', // format it into "yyyy-mm-dd"
                                                //     end_date: finalExamCompletionDate ? setDateFormat(new Date(finalExamCompletionDate)) : '', // format it into "yyyy-mm-dd"
                                                //     is_supplementary: convertToBoolean(supplementaryExamSysExists),
                                                //     supplement_exam_start_date: convertToBoolean(supplementaryExamSysExists) ? setDateFormat(new Date(supExamCommencementDate)) : null, // format it into "yyyy-mm-dd"
                                                //     supplement_exam_end_date: convertToBoolean(supplementaryExamSysExists) ? setDateFormat(new Date(supExamCompletionDate)) : null, // format it into "yyyy-mm-dd"
                                                //     is_ncert_syllabus: convertToBoolean(followsNcertSyllabus),
                                                //     ncert_syllabus_part: (convertToBoolean(followsNcertSyllabus)) ? Number(topicsMoreThanNcert) : 0,
                                                //     is_other_syllabus: (convertToBoolean(followsNcertSyllabus) && convertToBoolean(otherSyllabusFollowed)) ? convertToBoolean(otherSyllabusFollowed) : false,
                                                //     x_govt_school: Number(governmentSchool),
                                                //     x_govt_aided_school: Number(governmentAidedSchool),
                                                //     x_pvt_unaided_school: Number(privateUnaidedSchool),
                                                //     xii_govt_school: Number(government12School),
                                                //     xii_govt_aided_school: Number(government12AidedSchool),
                                                //     xii_pvt_unaided_school: Number(private12UnaidedSchool),
                                                // },
                                                team_member: {
                                                    chairman_id: chairmanSecretaryOfBoardId,
                                                    respondant_id: concernedOfficerId,
                                                },
                                            };

                                            try {
                                                type DynamicObject = Record<string, any>;
                                                let response: DynamicObject = {};
                                                if (guid) {
                                                    response = await serverRequest(
                                                        payload,
                                                        "api url",
                                                        "Method name",
                                                        true,
                                                        true,
                                                        "token"
                                                    );
                                                }
                                                else {
                                                    response = await serverRequest(
                                                        payload,
                                                        "API URL iDEntifier",
                                                        "CONSTANTS.REQUEST_POST",
                                                        true,
                                                        true,
                                                        "token"
                                                    );
                                                }

                                                if (response && response.status === "faile\d") {
                                                    setAlertMsg(response.message);
                                                    toast.error(response.message);
                                                    response.errors.forEach(function (error: Error) {
                                                        toast.error(error.message);
                                                    });
                                                } else if (response &&
                                                    response.status === "CONSTANTS.STATUS_SUCCESS") {
                                                    toast.success(response.message);
                                                    timeoutRef.current = setTimeout(() => {
                                                        // handleContinue();
                                                    }, 1000);
                                                }
                                            } catch (errors: unknown) {
                                                toast.error('Something went wrong. Please try again.');
                                                console.log(errors);
                                            }

                                            setSubmitting(false);
                                        }}
                                    >
                                        {({
                                            values, touched, errors, handleChange, handleBlur, handleSubmit,
                                            // isValid,
                                            // dirty,
                                            validateForm, setFieldValue, setTouched,
                                        }) => {
                                            return (
                                                <Form
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' &&
                                                            document.activeElement !==
                                                            e.currentTarget.querySelector(
                                                                "button[type='submit']"
                                                            )) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onSubmit={handleSubmit}
                                                >
                                                    <div className="filters_wrapper_container pt-3">
                                                        <div className="form_grider d1 small w-100">
                                                            <div className="row">
                                                                <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-6">
                                                                    <DatePickerField
                                                                        // required={true}
                                                                        // bgColor={errors.finalExamCommencementDate &&
                                                                        //     touched.finalExamCommencementDate ?
                                                                        //     'bg-danger bg-opacity-25' : undefined}
                                                                        label="Date of commencement of Final Exam"
                                                                        name={'finalExamCommencementDate'}
                                                                        placeholder={values.finalExamCommencementDate ||
                                                                            'Select Date'}
                                                                        errors={errors.finalExamCommencementDate}
                                                                        touched={touched.finalExamCommencementDate}
                                                                        value={values.finalExamCommencementDate ? new Date(values.finalExamCommencementDate) : undefined}
                                                                        minDate={new Date()}
                                                                        // onBlur={handleBlur}
                                                                        onChange={(date: Date | null) => {
                                                                            setFieldValue(
                                                                                'finalExamCommencementDate',
                                                                                date
                                                                            );
                                                                        }} />
                                                                </div>
                                                                <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-6">
                                                                    <DatePickerField
                                                                        // required={true}
                                                                        // bgColor={errors.finalExamCompletionDate &&
                                                                        //     touched.finalExamCompletionDate ?
                                                                        //     'bg-danger bg-opacity-25' : undefined}
                                                                        label="Date of completion of Final Exam"
                                                                        name={'finalExamCompletionDate'}
                                                                        placeholder={values.finalExamCompletionDate ||
                                                                            'Select Date'}
                                                                        errors={errors.finalExamCompletionDate}
                                                                        touched={touched.finalExamCompletionDate}
                                                                        value={values.finalExamCompletionDate ? new Date(values.finalExamCompletionDate) : undefined}
                                                                        minDate={new Date()}
                                                                        // onBlur={handleBlur}
                                                                        onChange={(date: Date | null) => {
                                                                            setFieldValue(
                                                                                'finalExamCompletionDate',
                                                                                date
                                                                            );
                                                                        }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mobFilterOpen">
                                                        <div className="filters_wrapper_container pt-3">
                                                            <div className="form_grider d1 small w-100">
                                                                <div className="row">
                                                                    <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-6">
                                                                        <SelectField
                                                                            // bgColor={errors.supplementaryExamSysExists &&
                                                                            //     touched.supplementaryExamSysExists
                                                                            //     ? '#f6ccd0'
                                                                            //     : 'inherit'}
                                                                            // required={true}
                                                                            label="Whether System of Supplementary Examination exists"
                                                                            value={typeof supplementaryExamSysExists == 'boolean' ? null :
                                                                                supplementaryExamSysExists ||
                                                                                values.supplementaryExamSysExists}
                                                                            reference={supplementaryExamSysExistsRef}
                                                                            name="supplementaryExamSysExists"
                                                                            placeholder="Select"
                                                                            options={[
                                                                                { label: 'Yes', value: 'Yes' },
                                                                                { label: 'No', value: 'No' },
                                                                            ]}
                                                                            onChange={(selectedOption: SingleValue<SelectOptions>, actionMeta: ActionMeta<SelectOptions>) => {
                                                                                void actionMeta;
                                                                                setSupplementaryExamSysExists(
                                                                                    selectedOption
                                                                                );
                                                                                setFieldValue(
                                                                                    'supplementaryExamSysExists',
                                                                                    selectedOption?.value ?? ''
                                                                                );
                                                                            }}
                                                                            onBlur={() => handleBlur({
                                                                                target: {
                                                                                    name: 'supplementaryExamSysExists',
                                                                                    value: true,
                                                                                },
                                                                            })}
                                                                            errors={errors.supplementaryExamSysExists}
                                                                            touched={touched.supplementaryExamSysExists} />
                                                                    </div>
                                                                    <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-6">
                                                                        <DatePickerField
                                                                            // required={values.supplementaryExamSysExists == 'Yes' ? true : false}
                                                                            disabled={values.supplementaryExamSysExists == 'Yes'? false : true}
                                                                            // bgColor={errors.supExamCommencementDate &&
                                                                            //     touched.supExamCommencementDate ?
                                                                            //     'bg-danger bg-opacity-25' : undefined}
                                                                            label="Date of commencement of Supplementary Exam"
                                                                            name={'supExamCommencementDate'}
                                                                            placeholder={values.supExamCommencementDate ||
                                                                                'Select Date'}
                                                                            errors={errors.supExamCommencementDate}
                                                                            touched={touched.supExamCommencementDate}
                                                                            value={values.supExamCommencementDate ? new Date(values.supExamCommencementDate) : undefined}
                                                                            minDate={new Date()}
                                                                            // onBlur={handleBlur}
                                                                            onChange={(date: Date | null) => {
                                                                                setFieldValue(
                                                                                    'supExamCommencementDate',
                                                                                    date
                                                                                );
                                                                            }} />
                                                                    </div>
                                                                    <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-6">
                                                                        <DatePickerField
                                                                            // required={values.supplementaryExamSysExists == 'Yes' ? true : false}
                                                                            disabled={values.supplementaryExamSysExists == 'Yes'? false : true}
                                                                            // bgColor={errors.supExamCompletionDate &&
                                                                            //     touched.supExamCompletionDate ?
                                                                            //     'bg-danger bg-opacity-25' : undefined}
                                                                            label="Date of completion of Supplementary Exam"
                                                                            name={'supExamCompletionDate'}
                                                                            placeholder={values.supExamCompletionDate ||
                                                                                'Select Date'}
                                                                            errors={errors.supExamCompletionDate}
                                                                            touched={touched.supExamCompletionDate}
                                                                            value={values.supExamCompletionDate ? new Date(values.supExamCompletionDate) : undefined}
                                                                            minDate={new Date()}
                                                                            // onBlur={handleBlur}
                                                                            onChange={(date: Date | null) => {
                                                                                setFieldValue(
                                                                                    'supExamCompletionDate',
                                                                                    date
                                                                                );
                                                                            }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mobFilterOpen">
                                                        <div className="filters_wrapper_container pt-3">
                                                            <div className="form_grider d1 small w-100">
                                                                <div className="row">
                                                                    <div className="col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-6">
                                                                        <SelectField
                                                                            // required={true}
                                                                            // bgColor={errors.followsNcertSyllabus &&
                                                                            //     touched.followsNcertSyllabus
                                                                            //     ? '#f6ccd0'
                                                                            //     : 'inherit'}
                                                                            label="As per Board's Own Assessment the syllabus followed by the Board/Council is as per NCERT Syllabus"
                                                                            value={typeof followsNcertSyllabus == 'boolean' ? null :
                                                                                followsNcertSyllabus ||
                                                                                values.followsNcertSyllabus}
                                                                            reference={followsNcertSyllabusRef}
                                                                            name="followsNcertSyllabus"
                                                                            placeholder="Select"
                                                                            options={[
                                                                                { label: 'Yes', value: 'Yes' },
                                                                                { label: 'No', value: 'No' },
                                                                            ]}
                                                                            onChange={(selectedOption: SingleValue<SelectOptions>, actionMeta: ActionMeta<SelectOptions>) => {
                                                                                void actionMeta;
                                                                                setFollowsNcertSyllabus(selectedOption);
                                                                                setFieldValue(
                                                                                    'followsNcertSyllabus',
                                                                                    selectedOption?.value ?? ''
                                                                                );
                                                                            }}
                                                                            onBlur={() => handleBlur({
                                                                                target: {
                                                                                    name: 'followsNcertSyllabus',
                                                                                    value: true,
                                                                                },
                                                                            })}
                                                                            errors={errors.followsNcertSyllabus}
                                                                            touched={touched.followsNcertSyllabus} />
                                                                    </div>
                                                                    <div className="col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-6">
                                                                        <SelectField
                                                                            // required={ values.followsNcertSyllabus === 'Yes' ? true : false}
                                                                            // bgColor={errors.topicsMoreThanNcert &&
                                                                            //     touched.topicsMoreThanNcert
                                                                            //     ? '#f6ccd0'
                                                                            //     : 'inherit'}
                                                                            label="Topics covered by Board is more as compare to NCERT Syllabus"
                                                                            value={typeof topicsMoreThanNcert == 'boolean' ? null :
                                                                                topicsMoreThanNcert ||
                                                                                values.topicsMoreThanNcert}
                                                                            reference={topicsMoreThanNcertRef}
                                                                            name="topicsMoreThanNcert"
                                                                            placeholder="Select"
                                                                            options={[
                                                                                { label: 'Topics covered by Board is more as compare to NCERT Syllabus', value: '2' },
                                                                                { label: 'Topics covered by Board is less as compare to NCERT Syllabus', value: '1' },
                                                                                { label: 'Topics covered by Board is equal as compare to NCERT Syllabus', value: '0' },
                                                                            ]}
                                                                            onChange={(selectedOption: SingleValue<SelectOptions>, actionMeta: ActionMeta<SelectOptions>) => {
                                                                                void actionMeta;
                                                                                setTopicsMoreThanNcert(
                                                                                    selectedOption
                                                                                );
                                                                                setFieldValue(
                                                                                    'topicsMoreThanNcert',
                                                                                    selectedOption?.value ?? ''
                                                                                );
                                                                            }}
                                                                            onBlur={() => handleBlur({
                                                                                target: {
                                                                                    name: 'topicsMoreThanNcert',
                                                                                    value: true,
                                                                                },
                                                                            })}
                                                                            errors={errors.topicsMoreThanNcert}
                                                                            touched={touched.topicsMoreThanNcert} />
                                                                    </div>

                                                                    <div className="col-12 col-xxl-4 col-xl-4 col-lg-4 col-md-6">
                                                                        <SelectField
                                                                            // required={ values.followsNcertSyllabus === 'Yes' ? true : false}
                                                                            // bgColor={errors.otherSyllabusFollowed &&
                                                                            //     touched.otherSyllabusFollowed
                                                                            //     ? '#f6ccd0'
                                                                            //     : 'inherit'}
                                                                            label="Any other syllabus is followed"
                                                                            value={typeof otherSyllabusFollowed == 'boolean' ? null :
                                                                                otherSyllabusFollowed ||
                                                                                values.otherSyllabusFollowed}
                                                                            reference={otherSyllabusFollowedRef}
                                                                            name="otherSyllabusFollowed"
                                                                            placeholder="Select"
                                                                            options={[
                                                                                { label: 'Yes', value: 'Yes' },
                                                                                { label: 'No', value: 'No' },
                                                                            ]}
                                                                            onChange={(selectedOption: SingleValue<SelectOptions>, actionMeta: ActionMeta<SelectOptions>) => {
                                                                                void actionMeta;
                                                                                setOtherSyllabusFollowed(
                                                                                    selectedOption
                                                                                );
                                                                                setFieldValue(
                                                                                    'otherSyllabusFollowed',
                                                                                    selectedOption?.value ?? ''
                                                                                );
                                                                            }}
                                                                            onBlur={() => handleBlur({
                                                                                target: {
                                                                                    name: 'otherSyllabusFollowed',
                                                                                    value: true,
                                                                                },
                                                                            })}
                                                                            errors={errors.otherSyllabusFollowed}
                                                                            touched={touched.otherSyllabusFollowed} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="fw-bolder h5">
                                                            Total Number Of Schools Under The Jurridiction Of
                                                            The Board
                                                        </p>
                                                        { true && ( <div className="mobFilterOpen">
                                                            <p className="fs-6">
                                                                <i>Having Grade X At Their Highest Level</i>
                                                            </p>
                                                            <div className="form_grider d1">
                                                                <div className="row">
                                                                    <div className="col-3">
                                                                        <InputField
                                                                            type="text"
                                                                            // required={true}
                                                                            // bgColor={errors.governmentSchool && touched.governmentSchool ? '#f6ccd0' : undefined}
                                                                            label="Government"
                                                                            value={values.governmentSchool}
                                                                            name={'governmentSchool'}
                                                                            placeholder="250"
                                                                            errors={errors.governmentSchool}
                                                                            touched={touched.governmentSchool}
                                                                            onBlur={handleBlur}
                                                                            onChange={handleChange}
                                                                            reference={governmentSchoolRef}
                                                                            // onKeyDown={(e) => keyDownFunc(e, governmentSchoolRef, false)}
                                                                             />
                                                                    </div>
                                                                    <div className="col-3">
                                                                        <InputField
                                                                            type="text"
                                                                            // required={true}
                                                                            // bgColor={errors.governmentAidedSchool &&
                                                                            //     touched.governmentAidedSchool ?
                                                                            //     '#f6ccd0' : undefined}
                                                                            label="Government Aided"
                                                                            value={values.governmentAidedSchool}
                                                                            name={'governmentAidedSchool'}
                                                                            placeholder="270"
                                                                            errors={errors.governmentAidedSchool}
                                                                            touched={touched.governmentAidedSchool}
                                                                            onBlur={handleBlur}
                                                                            onChange={handleChange}
                                                                            reference={governmentAidedSchoolRef}
                                                                            // onKeyDown={(e) => keyDownFunc(
                                                                            //     e,
                                                                            //     governmentAidedSchoolRef,
                                                                            //     false
                                                                            // )} 
                                                                            />
                                                                    </div>
                                                                    <div className="col-3">
                                                                        <InputField
                                                                            type="text"
                                                                            // required={true}
                                                                            // bgColor={errors.privateUnaidedSchool &&
                                                                            //     touched.privateUnaidedSchool ?
                                                                            //     '#f6ccd0' : undefined}
                                                                            label="Government Unaided"
                                                                            value={values.privateUnaidedSchool}
                                                                            name={'privateUnaidedSchool'}
                                                                            placeholder="100"
                                                                            errors={errors.privateUnaidedSchool}
                                                                            touched={touched.privateUnaidedSchool}
                                                                            onBlur={handleBlur}
                                                                            onChange={handleChange}
                                                                            reference={privateUnaidedSchoolRef}
                                                                            // onKeyDown={(e) => keyDownFunc(
                                                                            //     e,
                                                                            //     privateUnaidedSchoolRef,
                                                                            //     false
                                                                            // )}
                                                                             />
                                                                    </div>
                                                                    <div className="col-3">
                                                                        <InputField
                                                                            type="text"
                                                                            label="Total"
                                                                            // color="#7c7d7c"
                                                                            value={(values.totalSchool = `${Number(values.governmentSchool) +
                                                                                Number(values.governmentAidedSchool) +
                                                                                Number(values.privateUnaidedSchool)}`)}
                                                                            name={'totalSchool'}
                                                                            disabled={true}
                                                                            placeholder={values.totalSchool || ''}
                                                                            errors={errors.totalSchool}
                                                                            touched={touched.totalSchool}
                                                                            onBlur={handleBlur}
                                                                            onChange={handleChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>)}
                                                        { true && (
                                                        <div className="mobFilterOpen">
                                                            <p className="fs-6">
                                                                <i>Having Grade XII At Their Highest Level</i>
                                                            </p>
                                                            <div className="form_grider d1">
                                                                <div className="row">
                                                                    <div className="col-3">
                                                                        <InputField
                                                                            type="text"
                                                                            // required={true}
                                                                            // bgColor={errors.government12School &&
                                                                            //     touched.government12School ?
                                                                            //     '#f6ccd0' : undefined}
                                                                            label="Government"
                                                                            value={values.government12School}
                                                                            name={'government12School'}
                                                                            placeholder="250"
                                                                            errors={errors.government12School}
                                                                            touched={touched.government12School}
                                                                            onBlur={handleBlur}
                                                                            onChange={handleChange}
                                                                            reference={government12SchoolRef}
                                                                            // onKeyDown={(e) => keyDownFunc(
                                                                            //     e,
                                                                            //     government12SchoolRef,
                                                                            //     false
                                                                            // )}
                                                                             />
                                                                    </div>
                                                                    <div className="col-3">
                                                                        <InputField
                                                                            type="text"
                                                                            // required={true}
                                                                            // bgColor={errors.government12AidedSchool &&
                                                                            //     touched.government12AidedSchool ?
                                                                            //     '#f6ccd0' : undefined}
                                                                            label="Government Aided"
                                                                            value={values.government12AidedSchool}
                                                                            name={'government12AidedSchool'}
                                                                            placeholder="270"
                                                                            errors={errors.government12AidedSchool}
                                                                            touched={touched.government12AidedSchool}
                                                                            onBlur={handleBlur}
                                                                            onChange={handleChange}
                                                                            reference={government12AidedSchoolRef}
                                                                            // onKeyDown={(e) => keyDownFunc(
                                                                            //     e,
                                                                            //     government12AidedSchoolRef,
                                                                            //     false
                                                                            // )}
                                                                             />
                                                                    </div>
                                                                    <div className="col-3">
                                                                        <InputField
                                                                            type="text"
                                                                            // required={true}
                                                                            // bgColor={errors.private12UnaidedSchool &&
                                                                            //     touched.private12UnaidedSchool ?
                                                                            //     '#f6ccd0' : undefined}
                                                                            label="Government Unaided"
                                                                            value={values.private12UnaidedSchool}
                                                                            name={'private12UnaidedSchool'}
                                                                            placeholder="100"
                                                                            errors={errors.private12UnaidedSchool}
                                                                            touched={touched.private12UnaidedSchool}
                                                                            onBlur={handleBlur}
                                                                            onChange={handleChange}
                                                                            reference={private12UnaidedSchoolRef}
                                                                            // onKeyDown={(e) => keyDownFunc(
                                                                            //     e,
                                                                            //     private12UnaidedSchoolRef,
                                                                            //     false
                                                                            // )}
                                                                             />
                                                                    </div>
                                                                    <div className="col-3">
                                                                        <InputField
                                                                            type="text"
                                                                            disabled={true}
                                                                            label="Total"
                                                                            value={(values.total12School = `${Number(values.government12School) +
                                                                                Number(values.government12AidedSchool) +
                                                                                Number(values.private12UnaidedSchool)}`
                                                                            )}
                                                                            name={'total12School'}
                                                                            placeholder={values.total12School || ''}
                                                                            errors={errors.total12School}
                                                                            touched={touched.total12School}
                                                                            onBlur={handleBlur}
                                                                            onChange={handleChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        )}
                                                        <div className="mobFilterOpen">
                                                            <p className="fw-bolder h5">
                                                                Concerned Officer / Chairman / Secretary Of The
                                                                Board
                                                            </p>
                                                            <div className="mobFilterOpen">
                                                                <div className="filters_wrapper_container pt-3">
                                                                    <div className="form_grider d1 small w-100">
                                                                        <div className="row">
                                                                            <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-6">
                                                                            <InputField
                                                                                type="text"
                                                                                // required={true}
                                                                                // bgColor={
                                                                                //     errors.concernedOfficer && touched.concernedOfficer ? '#f6ccd0': undefined
                                                                                // }
                                                                                label="Concerned Officer"
                                                                                value={concernedOfficer || values.concernedOfficer}
                                                                                disabled={true}
                                                                                name={'concernedOfficer'}
                                                                                placeholder="Concerned Officer"
                                                                                errors={errors.concernedOfficer}
                                                                                touched={touched.concernedOfficer}
                                                                                onBlur={handleBlur}
                                                                                onChange={handleChange}
                                                                                />
                                                                            </div>
                                                                            <div className="col-12 col-xxl-3 col-xl-4 col-lg-4 col-md-6">
                                                                            <InputField
                                                                                type="text"
                                                                                // required={true}
                                                                                // bgColor={
                                                                                //     errors.chairmanSecretaryOfBoard && touched.chairmanSecretaryOfBoard ? '#f6ccd0': undefined
                                                                                // }
                                                                                label="Chairman/Secretary of the Board"
                                                                                value={chairmanSecretaryOfBoard || values.chairmanSecretaryOfBoard}
                                                                                disabled={true}
                                                                                name={'chairmanSecretaryOfBoard'}
                                                                                placeholder="Concerned Officer"
                                                                                errors={errors.chairmanSecretaryOfBoard}
                                                                                touched={touched.chairmanSecretaryOfBoard}
                                                                                onBlur={handleBlur}
                                                                                onChange={handleChange}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mobFilterOpen container mt-5">
                                                            <div className="ms-auto d-flex justify-content-between">
                                                                <div className="me-1">
                                                                <Button
                                                                    color="secondary"
                                                                    varient="solid"
                                                                    radius="sm"
                                                                    size="sm"
                                                                    type="submit"
                                                                    // clickHandler={handleBack}
                                                                // isDisabled={disabled}
                                                                >
                                                                    <span className="admin-navigation_item_icon">
                                                                        {/* <Image
                                                                            src={""}
                                                                            alt="dashboard"
                                                                            width={10}
                                                                            height={10}
                                                                            style={{ marginTop: '-2px' }}
                                                                        /> */}
                                                                    </span>
                                                                    Back
                                                                </Button>
                                                                </div>
                                                                <div className="me-1">
                                                                    <button
                                                                        type="submit"
                                                                        onClick={(e: React.FormEvent) => {
                                                                            // disabled={!isValid || !dirty}
                                                                            e.preventDefault();
                                                                            validateForm().then((errors) => {
                                                                                if (Object.keys(errors).length > 0) {
                                                                                    setTouched({
                                                                                        finalExamCommencementDate: true,
                                                                                        finalExamCompletionDate: true,
                                                                                        supExamCommencementDate: true,
                                                                                        supExamCompletionDate: true,
                                                                                        governmentSchool: true,
                                                                                        government12School: true,
                                                                                        governmentAidedSchool: true,
                                                                                        government12AidedSchool: true,
                                                                                        privateUnaidedSchool: true,
                                                                                        private12UnaidedSchool: true,
                                                                                        totalSchool: true,
                                                                                        total12School: true,
                                                                                        followsNcertSyllabus: true,
                                                                                        topicsMoreThanNcert: true,
                                                                                        otherSyllabusFollowed: true,
                                                                                        supplementaryExamSysExists: true,
                                                                                        concernedOfficer: true,
                                                                                        chairmanSecretaryOfBoard: true,
                                                                                    });
                                                                                } else {
                                                                                    handleSubmit(); // handle API call to save data of first stepper
                                                                                    console.log(
                                                                                        'API request made indicator'
                                                                                    );
                                                                                }
                                                                            });
                                                                            setErrorsExist(errors ? true : false);
                                                                        }}
                                                                        className="u-button primary size-sm radius-sm"
                                                                    >
                                                                        Save & Continue
                                                                        <span className="admin-navigation_item_icon">
                                                                            {/* <Image
                                                                                src={"APPIMAGES.ICON_LEFT_ARROW"}
                                                                                alt="dashboard"
                                                                                width={10}
                                                                                height={10}
                                                                                style={{ marginTop: '-2px' }} /> */}
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Form>
                                            );
                                        }}
                                    </Formik>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ToastContainer pauseOnHover={false} />
            </div></>
    );
};

export default SomeForm;
