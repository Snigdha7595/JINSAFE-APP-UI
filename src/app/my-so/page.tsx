"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHead from "@/components/Elements/PageHead";
import InputField from "@/components/Form/InputField";



const User = () => {
  return (
      <div className="container-fluid">
      <div className="admin-boxContainer d1">
        <div className="comingSoon">
          <div className="comingSoon__title">Coming Soon</div>
          <div className="comingSoon__media">
            <img
              width="500"
              height="500"
              alt="coming soon image"
              src="/images/svg/underconstruction.svg"
              className="img-fluid u-image"
            />
          </div>
          <div className="comingSoon__desc">
            Oops! We’re still building this page. Stay tuned!
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute(User);
