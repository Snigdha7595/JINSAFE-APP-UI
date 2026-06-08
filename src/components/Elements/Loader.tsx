import Image from 'next/image';

const Loader = (props: any) => {
  return (
    <>
      <div className={`u-loader ${props.cls !== undefined ? props.cls : 'd1'}`}>
        <div className="u-loader_overlay"></div>
        <div className="u-loader_container">
          <span className="loaderMain"></span>
        </div>
      </div>
    </>
  );
};

export default Loader;
