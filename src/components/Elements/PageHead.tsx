type pageHeadTypo = {
  title: string;
  cls?: string;
};

const PageHead = ({ title, cls }: pageHeadTypo) => {
  return (
    <>
      <div className="admin-pageHead">
        <div className="hw d2">
          <h2 className={`hw__title ${cls != undefined ? cls : ''}`}>
            {title}
          </h2>
        </div>
      </div>
    </>
  );
};

export default PageHead;
