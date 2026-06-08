import Image from 'next/image';
import { APPIMAGES } from '@/config/config';
import Link from "next/link";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleMenu, setMenuOpen } from '@/store/slices/menuSlice';
import { logout } from '@/store/slices/authSlice';
import SelectField from '../Form/SelectFields';
import UserHeaderInfo from './UserHeaderInfo'
import { APP_URL } from '@/config/constant';
import { useRouter } from 'next/navigation';
import DeleteModal from '../Modal/delete-modal';
import { useState } from 'react';
import CustomModal from './CustomModal';
import Button from '../Elements/Button';
interface User {
  name: string;    
  picture?: string;
  role?: string[];
  roleCode?: string;
  createdBy?: string;
  updatedBy?: string;
}



const Header = ({ setResponsiveSidebar }: any) => {
  const router = useRouter();
  const dispatch = useDispatch();
  // const isMenuOpen = useSelector((state: any) => state.menu.isOpen);
  const { user } = useSelector((state: RootState) => state.auth as { user: User });
  const [logoutConfirm, setLogoutConfirm] = useState<boolean>(false)
  const [dropdownValue, setDropdownValue] = useState<string>("");

  const handleLogout = () => {
  dispatch(logout());
  // localStorage.clear();
  sessionStorage.clear();
  router.push(APP_URL.DEFAULT_APP_PATH);
  }
  const handleMenuToggle = () => {
    dispatch(toggleMenu());
  };
  return (
    <>
      <header className="admin-header">
        <div className="admin-header_ls">
          <button
            className="admin-sidebar_arrowIcon"
            style={{ right: 'unset' }}
            onClick={handleMenuToggle}
          >
            {user?.picture? <img src={user.picture} width="30" />:<svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
                fill="#FFFFFF"
              />
            </svg>}
          </button>
        </div>
        <div className="admin-header_rs">
          <div className="admin-header_icons mx-3">
            <Link href="https://drive.google.com/drive/folders/1Xe__8IibKJr2h_aaYmGCoVRVhz5q9xza?usp=sharing" 
            target="_blank" className="adminAction__title">
              <span className="icon">
                <img
                  src="/images/svg/icons/Link.svg"
                  style={{top: '5px',right: '5px', width: '15px',height: '15px', background: 'orange' }}
                />
              </span>
              {' '} User Manuals
            </Link>
          </div>
          <div className="admin-header_icons mx-3">
            <Link href="https://ithelpdesk.jspl.com/ItSupport/jspl/auth/login" 
            target="_blank" className="adminAction__title">
              <span className="icon">
                <img
                  src="/images/svg/icons/Edit.svg"
                  style={{top: '5px',right: '5px', width: '15px',height: '15px', background: 'orange' }}
                />
              </span>
              {' '} HelpDesk
            </Link>
          </div>
           <div className="admin-header_icons mx-3">
            <Link href={APP_URL.MY_ACTION} className="adminAction__title">
              <span className="icon">
                <img
                  src="/images/svg/icons/play.svg"
                  style={{top: '5px',right: '5px', width: '15px',height: '15px' }}
                />
              </span>
              {' '} My Actions
            </Link>
          </div>
            <div className="admin-header_icons mx-3">
            <Link href={APP_URL.REPORT_DASHBOARD} className="adminAction__title">
              <span className="icon">
                <img
                  src="/images/svg/icons/Form.svg"
                  style={{top: '5px',right: '5px', width: '15px',height: '15px', background: 'orange'}}
                />
              </span>
              {' '} Reports
            </Link>
          </div>
          <div className="admin-header_rs--role">
            {/* <select className='option'>
              <option className='option__value'>Change Role</option>
            </select> */}
            {Array.isArray(user?.role) && (
              <SelectField
              label=""
              value={""}
              name="userRole"
              placeholder="Role List"
              options={user?.role?.map(role => ({
                value: role.toLowerCase().replace(/\s+/g, '-'),
                label: role
              }))}
              onChange={() => {}}
              onBlur={() => {}}
              cls='option'
            />
            )}
            {!Array.isArray(user?.role) && typeof user?.role === 'string' && (user.role as string).toLowerCase() === 'guest' && (
              <SelectField
              label=""
              value={"Guest"}
              name="userRole"
              placeholder="Guest"
               options={[{ label: "Guest", value: "Guest" }]}
              onChange={() => {}}
              onBlur={() => {}}
              cls='option'
              disabled={true}
            />
            )}
          </div>
          {/* <div className="admin-header_icons-item d-lg-none ms-2">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
              </svg>
            </span>
          </div> */}
          <div className="admin-header_rs--user ms-2 ms-lg-3">
            <Image
              width="30"
              height="30"
              alt="user icon"
              style={{borderRadius: "50%"}}
              src={user?.picture?`${user.picture}`:"/images/svg/userIcon.svg"}
              className='img-fluid u-image'
            />
            <select 
              value={dropdownValue} 
              className='user-option' 
              name="role" 
              onChange={(e) => {
                setDropdownValue(e.target.value);
                if (e.target.value === "logout") {
                  setLogoutConfirm(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && dropdownValue === "logout") {
                  setLogoutConfirm(true);
                  e.preventDefault();
                }
              }}
            >
              <option className='user-option__value' value="profile">{user.name || 'Guest User'}</option>
              <option className='user-option__value' value="logout">Logout</option>
            </select>
          </div>
        </div>
        {/* <UserHeaderInfo user={user} setLogoutConfirm={setLogoutConfirm} /> */}
      </header>
      <CustomModal isOpen={logoutConfirm} onClose={() => {setDropdownValue('');setLogoutConfirm(false)}} title="Delete Confirmation" modalSizeClassName="modal-sm">
        <>
          <div className="primaryHead">Are you sure you want to logout?</div>
          <div className="admin-card custom-flex-center cmt-20">
            <div className='d-flex'>
            <button
              className="iconBtn red v2"
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              className="iconBtn orange v2"
              onClick={() => {setDropdownValue('');setLogoutConfirm(false)}}
            >
              Cancel
            </button>
            </div>
          </div>
        </>
      </CustomModal>
    </>
  );
};
export default Header;