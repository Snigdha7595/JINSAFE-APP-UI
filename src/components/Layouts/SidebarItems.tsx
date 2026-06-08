'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { selectUserRole, selectUserState, updateDrilldownState } from '@/store/slices/authSlice';
import { roleRestrictions } from '@/config/path';


const SidebarItems = ({ item }: any) => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const userRole = useSelector(selectUserRole);
  const userState = useSelector(selectUserState);
  const [open, setOpen] = useState<any>(null);
  const [getRoleBasedRes, setRoleBasedRes] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  useEffect(() => {
    if (userRole != null) {
      setRoleBasedRes(roleRestrictions[userRole] || []);
    }
  }, [userRole]);

  const handleClick = () => {
    dispatch(updateDrilldownState(userState?.currentStatus));
  };
  const toggleMenu = (id: string | number) => {
    setOpenMenuId(prevId => prevId === id ? null : id);
  };

  const checkAfterRestriction = item.children.filter((child: any) => !getRoleBasedRes.includes(child.link));
  if (checkAfterRestriction && checkAfterRestriction.length > 0) {
    return (
      <div className={`admin-navigation_list ${openMenuId === item.id ? 'open' : ''}`}>
        <div
          onClick={() => toggleMenu(item.id)}
          className={
            pathname.includes(item.link)
              ? 'admin-navigation_list active'
              : 'admin-navigation_list'
          }
        >
          <div className="admin-navigation_list_arrow">
            <svg
              width="800px"
              height="800px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
                fill="#ffffff"
              />
            </svg>
          </div>
          <Link href="#" className="admin-navigation_item">
            {item.icon != undefined && (
              <span className="admin-navigation_item_icon">
                <img width="25" height="25" alt="icon image" src={item.icon} className="img-fluid u-image" />
              </span>
            )}
            <span className={`admin-navigation_item_label`}>
              {item.label}
            </span>
          </Link>
        </div>

        {openMenuId === item.id && (
          <div className="sidebar-content">
            {item.children.map((child: any) => (
              <SidebarItems
                item={child}
                key={child.id}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
              />
            ))}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <>
        {item.children.length == 0 && !getRoleBasedRes.includes(item.link) && (
          <Link
            href={item.link}
            className={
              pathname.includes(item.link)
                ? 'admin-navigation_item active'
                : 'admin-navigation_item'
            }
          >
            {item.icon != undefined && (
              <span className="admin-navigation_item_icon">
                <img width="30" height="30" alt="icon image" src={item.icon} className="img-fluid u-image" />
              </span>
            )}
            <span
              onClick={() => {
                handleClick();
                setOpenMenuId(null); // Close any open menus when clicking a non-dropdown item
              }}
              className={`admin-navigation_item_label  ${pathname.includes(item.link) ? 'admin-navigation_item_label__active' : ''}`}
            >
              {item.label}
            </span>
          </Link>
        )}
      </>
    );
  }
};

export default SidebarItems;
