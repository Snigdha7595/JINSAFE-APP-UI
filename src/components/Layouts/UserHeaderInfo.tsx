'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useRoles } from '@/components/helper';
import GenericDropdown from './GenericDropdown';

import { APP_URL } from '@/config/constant';
interface User {
  name: string;    
  picture?: string;
  role?: string[];
  roleCode?: string;
  createdBy?: string;
  updatedBy?: string;
}

const UserHeaderInfo = ({ user, setLogoutConfirm }: { user: User, setLogoutConfirm: (x: boolean) => void }) => {
    // const { hasBoardRole } = useRoles();
    const router = useRouter();
    const dropdownMenu = useRef<HTMLDivElement>(null);
    const [dropdownState, setDropdownState] = useState<boolean>(false);
    const [initialsValue] = useState(`GU`);
    return (
        <>
            <div className="admin-customDropdownWrap admin-userContainer">
                <div
                    className="admin-userWrap"
                    onClick={() => setDropdownState((prev) => !prev)}
                >
                    <div className="admin-userWrap_text d-none d-lg-flex align-items-end">
                        <h3 className="title w-auto">{ user?.name || 'Guest'}</h3>
                    </div>
                    <div className="admin-userWrap_initials">{initialsValue}</div>
                </div>
                <div className="position-relative dropdown_minWidth">
                    <GenericDropdown
                        dropdownState={dropdownState}
                        setDropdownState={setDropdownState}
                        dropdownRef={dropdownMenu}
                    >
                        <ul className="admin-navigation_2">
                            <li className="admin-navigation_item" onClick={() => {
                                router.push(APP_URL.DASHBOARD);
                                setDropdownState(false);
                            }}>
                                <span className="admin-navigation_item_label">
                                    Dashboard
                                </span>
                            </li>
                            <li className="admin-navigation_item_label">
                                Profile
                            </li>
                            <li className="admin-navigation_item" onClick={() => setLogoutConfirm(true)}>
                                <span className="admin-navigation_item_label">Logout</span>
                            </li>
                        </ul>
                    </GenericDropdown>
                </div>
            </div>
        </>
    );
};

export default UserHeaderInfo;