import { useEffect, useState } from "react";

export interface UserRole {
  unitId: string;
  departmentId: string | number;
  userRole: string;
}

export interface RolePermissions {
  isUnitDisabled: boolean;
  isDeptDisabled: boolean;
  isSectionDisabled: boolean;
  unitId: string;
  departmentId: string;
  shouldPreloadDepartments: boolean;
}

export const useRolePermissions = (userRolesRaw: UserRole[]): RolePermissions => {
  const [isUnitDisabled, setIsUnitDisabled] = useState(false);
  const [isDeptDisabled, setIsDeptDisabled] = useState(false);
  const [isSectionDisabled, setIsSectionDisabled] = useState(false);
  const [unitId, setUnitId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [shouldPreloadDepartments, setShouldPreloadDepartments] = useState(false);

  useEffect(() => {
    if (!userRolesRaw || userRolesRaw.length === 0) return;

    const roles = userRolesRaw.map((r) => r.userRole);
    const findRole = (roleName: string) =>
      userRolesRaw.find((r) => r.userRole === roleName);

    if (roles.includes("Super Admin")) {
      setIsUnitDisabled(false);
      setIsDeptDisabled(false);
      setIsSectionDisabled(false);
      setShouldPreloadDepartments(false);
      return;
    }

    if (roles.includes("Site Admin")) {
      const role = findRole("Site Admin");
      setUnitId(role?.unitId || "");
      setIsUnitDisabled(true);
      setIsDeptDisabled(false);
      setIsSectionDisabled(false);
      setShouldPreloadDepartments(true);
      return;
    }

    if (roles.includes("Department Admin")) {
      const role = findRole("Department Admin");
      setUnitId(role?.unitId || "");
      setDepartmentId(role?.departmentId?.toString() || "");
      setIsUnitDisabled(true);
      setIsDeptDisabled(true);
      setIsSectionDisabled(false);
      setShouldPreloadDepartments(true);
      return;
    }

    const fallbackRole = userRolesRaw.find((r) =>
      ["Line Manager", "Safety Incharge", "Employee"].includes(r.userRole)
    );

    if (fallbackRole) {
      setUnitId(fallbackRole.unitId);
      setDepartmentId(fallbackRole.departmentId.toString());
      setIsUnitDisabled(true);
      setIsDeptDisabled(true);
      setIsSectionDisabled(true);
      setShouldPreloadDepartments(true);
    }
  }, [userRolesRaw]);

  return {
    isUnitDisabled,
    isDeptDisabled,
    isSectionDisabled,
    unitId,
    departmentId,
    shouldPreloadDepartments,
  };
};