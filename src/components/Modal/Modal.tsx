'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface TimerProps {
  status: boolean;
  url: string;
  time: number;
}

interface ModalProps {
  cls?: string;
  heading: string;
  children: React.ReactNode;
  action: () => void;
  timer?: TimerProps;
}

const Modal: React.FC<ModalProps> = ({ cls, heading, children, action, timer }) => {
  const router = useRouter();
  useEffect(() => {
    if(timer && timer.status == true) {
      setTimeout(() => {
        router.push(timer.url);
      },timer.time);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  const modalClass = cls != undefined && cls != '' ? cls : 'd1';
  return (
    <>
      <div className={`u-loader ${modalClass}`}>
        <div className="u-loader_overlay" onClick={() => action()}></div>
        <div className="u-loader_container">
          <div className="u-loader_head">
            <button className="u-loader_close" onClick={() => action()}>
              <Image 
              src={`/${process.env.NEXT_PUBLIC_SUB_PATH}/images/icons/close.svg`}
              width={30}
              height={30}
              alt="close icon" 
              className="img-fluid" />
            </button>
            <div className="hw d2">
              <div className="hw__title">{heading}</div>
            </div>
          </div>
          <div className="u-loader_body">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
