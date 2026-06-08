"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from 'next/link';
// import InvestigationTeamAccordion from "@/components/Form/InvestigationTeamAccordion";
import InvestigationTeamAccordion from "./_partials/InvestigationTeamAccordion";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { serverRequest } from "@/services/getServerSideRender";
import { SAVE_DRAFT_PIR } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { selectUserToken } from "@/store/slices/authSlice";
import Image from "next/image";
import { ToastContainer } from "react-toastify";
import { setPirId } from "@/store/slices/pirSlice";


const User = () => {
  const pirId = useSelector((state: RootState) => state.pir.pirId);
  const token = useSelector(selectUserToken);
  const [pirData, setPirData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (pirId) {
      fetchPirData(pirId);
    }
  }, [pirId]);

  useEffect(() => {
    return () => {
      dispatch(setPirId(pirId))
    }
  }, [])

  const fetchPirData = async (pirId: string) => {
    try {
      setLoading(true);
      const response = await serverRequest(
        {},
        SAVE_DRAFT_PIR + `/get-pir/${pirId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      
      if(response.success){
        const transformData = (response: any) => {
          const { pir, injuries, images, immediateActions } = response;

          // Transform images
          const transformedImages = images.map(img => ({
            fileId: img.mongoId,
            fileType: img.fileType,
            fileName: img.fileName,
            fileSize: img.fileSize,
            fileThumbnail: img.fileThumbnail,
            createdAt: img.createdAt,
            createdBy: img.createdBy
          }));

          // Transform injuries
          const transformedInjuries = injuries.map((injury: any) => {
            const bodyParts = injury.bodyPartList.map((bp: any) => bp.bodyPart).join(' || ');
            const natureOfInjuries = injury.bodyPartList.map((bp: any) => bp.natureOfInjury).join(' || ');

            return {
              employeeType: injury.employeeType,
              employeeId: injury.employeeId,
              injuredName: injury.injuredName,
              gender: injury.gender,
              address: injury.address,
              designation: injury.designation,
              jobType: injury.jobType,
              nameOfEmployer: injury.nameOfEmployer,
              flagInjuryId: injury.flagInjuryId,
              bodyParts,
              natureOfInjuries,
              irStatus: null,
              incidentLastDate: null,
              createdAt: injury.createdAt,
              createdBy: injury.createdBy,
              updatedAt: injury.createdAt,
              updatedBy: injury.createdBy,
              bodyPartList: injury.bodyPartList.map(bp => ({
                bodyPart: bp.bodyPart,
                employeeId: bp.employeeId,
                createdAt: bp.createdAt,
                createdBy: bp.createdBy,
                natureOfInjury: bp.natureOfInjury,
                flagInjuryId: bp.flagInjuryId,
                rowIndex: bp.rowIndex
              }))
            };
          });

          // Transform immediateActions
          const transformedImmediateActions = immediateActions.map(action => ({
            actiontaken: action.actiontaken,
            createdat: action.createdat,
            createdby: action.createdby,
            updatedat: action.createdat,
            updatedby: action.createdby,
            assignLinemanager: action.assignLinemanager,
            linemanagerName: action.linemanagerName,
            targetdate: action.targetdate,
            sections: action.sections,
            departments: action.departments,
            sectionhead: action.sectionhead,
            imSubmoduleName: action.imSubmoduleName,
            units: action.units,
            departmentHodName: '',
            flagId: '0',
            responsibleDepartmentName: action.responsibleDepartmentName,
            responsibleSectionName: action.responsibleSectionName,
            findingFlag: action.findingFlag
          }));

          // Create the main object
          const transformedData = {
            objectId: null,
            pirId: pir.pirId,
            unitId: pir.unitId,
            unitName: pir.unitName,
            departmentId: pir.departmentId,
            departmentName: pir.departmentName,
            sectionId: pir.sectionId,
            sectionName: pir.sectionName,
            exactLocation: pir.exactLocation,
            incidentDate: pir.incidentDate,
            incidentTime: pir.incidentTime,
            lineManager: pir.lineManager,
            sectionHead: pir.sectionHead,
            departmentHod: pir.departmentHod,
            incidentClassification: pir.incidentClassification,
            incidentCategory: pir.incidentCategory,
            personInjured: pir.personInjured,
            tier: pir.tier,
            remark: pir.remark,
            createdAt: pir.createdAt,
            createdBy: pir.createdBy,
            updatedAt: pir.updatedAt,
            updatedBy: pir.updatedBy,
            designationId: pir.designationId,
            designationName: pir.designationName,
            createdByUserRole: pir.createdByUserRole === 'USER' ? 'Employee' : pir.createdByUserRole,
            injuryHappened: pir.injuryHappened,
            whatHappened: pir.whatHappened,
            preliminaryFindings: pir.preliminaryFindings,
            hipoCase: pir.hipoCase,
            accordionIndex: 2,
            images: transformedImages,
            injuries: transformedInjuries,
            immediateActions: transformedImmediateActions
          };

          return transformedData;
        };

        const transformedData = transformData(response);
        setPirData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching PIR data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="admin-boxContainer d3">
          <div className="adminAction">
            <Link href={APP_URL.INCIDENT_DETAIL} className="adminAction__title">
              <span className="icon">
                <Image
                  width="15"
                  height="15"
                  alt="icon" 
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Investigation Team
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="admin-boxContainer d3">
        <div className="adminAction">
          <Link href="#" className="adminAction__title">
            <span className="icon">
              <Image
                width="15"
                height="15"
                alt="icon" 
                src="/images/svg/arrow-left-grey.svg"
                className="img-fluid u-image"
              />
            </span>
            Investigation Team
          </Link>
        </div>
      </div>
      <div className="admin-boxContainer d1 nobackground">
          <InvestigationTeamAccordion pirData={pirData} setPirData={setPirData} />
      </div>      
    <ToastContainer/>
    </div>
  );
};

export default ProtectedRoute(User);