'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserRole } from '@/store/slices/authSlice';
import SidebarItems from './SidebarItems';
import { setMenuOpen } from '@/store/slices/menuSlice';
import { RootState } from '@/store/store';

const Sidebar = ({
  user,
  menu,
  sidebarState,
  responsiveSidebar,
  setResponsiveSidebar,
}: any) => {
  const [updatedMenu, setUpdatedMenu] = useState(menu);
  const dispatch = useDispatch();
  const isMenuOpen = useSelector((state: RootState) => state.menu.isOpen);
  const sidebarRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        dispatch(setMenuOpen(false));
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch, isMenuOpen]);

  return (
    <>
      {responsiveSidebar && (
        <div
          className="admin-sidebar_overlay"
          onClick={() => setResponsiveSidebar(false)}
        ></div>
      )}
      <div ref={sidebarRef} className={`admin-sidebar ${isMenuOpen ? 'active' : ''}`}>
        <button
          className="admin-sidebar_arrowIcon d-none d-lg-block"
          onClick={() => sidebarState((prev: any) => !prev)}
        >
          <svg
            // width="800px"
            // height="800px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
              fill="#FFFFFF"
            />
          </svg>
        </button>
        <div className="admin-sidebar_logo">
          <div className="admin-sidebar_logo_small">
           {/* <Image
              width={230}
              height={84}
              src="/images/svg/logo_white.svg"
              alt="logo icon"
              className="img-fluid u-image"
            /> */}
            <div className="admin-sidebar_title">Jinsafe</div>
          </div>

          <div className="admin-sidebar_logo_large">
            <Image
              width={230}
              height={84}
              src="/images/svg/logo_white.svg"
              alt="logo icon"
              className="img-fluid u-image"
            />
            <div className="admin-sidebar_title">Jinsafe</div>
          </div>
        </div>
        {/* <div className="adminProfile">
          <div className="adminProfile__media">
            <Image
              width={230}
              height={84}
              style={{borderRadius: "50%"}}
              src={user?.picture?user.picture:"/images/svg/userIcon.svg"}
              alt="logo icon"
              className="img-fluid u-image"
            />
          </div>
          <div className="adminProfile__title">
            {user.name}
          </div>
        </div> */}
        <div className="admin-sidebar_navigation admin-navigation_1">
          {updatedMenu != undefined && updatedMenu.length > 0 &&
            updatedMenu.map((item: any) => <SidebarItems item={item} key={item.id} />)}
        </div>
      </div>
    </>
  );
};
export default Sidebar;