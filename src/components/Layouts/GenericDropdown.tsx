'use client';
import { useEffect, RefObject } from 'react';
interface GenericDropdownProps {
  children: React.ReactNode;
  dropdownRef: RefObject<HTMLDivElement>;
  dropdownState: boolean;
  setDropdownState: React.Dispatch<React.SetStateAction<boolean>>;
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({
  children,
  dropdownRef,
  dropdownState,
  setDropdownState,
}) => {
  useEffect(() => {
    const handleClickDropdown = (e: MouseEvent) => {
      // <HTMLButtonElement>
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        // Element
        const isMainContainerClick = e.target as Element;
        if (!isMainContainerClick.closest('.admin-customDropdownWrap')) {
          dropdownRef.current.classList.remove('show');
          setDropdownState(false);
        }
      }
    };

    document.addEventListener('click', handleClickDropdown, false);
    return () => {
      document.removeEventListener('click', handleClickDropdown, false);
    };
  }, [dropdownRef, setDropdownState]);

  return (
    <>
      <div
        className={`dropdown_menu ${dropdownState ? 'show' : ''} `}
        ref={dropdownRef}
      >
        {children}
      </div>
    </>
  );
};

export default GenericDropdown;