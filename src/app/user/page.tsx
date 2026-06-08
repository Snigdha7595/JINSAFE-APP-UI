'use client';
import ProtectedRoute from "@/components/ProtectedRoute";
import Breadcumb from '@/components/Elements/Breadcumb';
import PageHead from '@/components/Elements/PageHead';
import InputField from "@/components/Form/InputField";

const breadcrumb = [
  {
    id: 1,
    label: 'Dashboard',
    link: '/dashboard',
  },
  {
    id: 2,
    label: 'Feedback',
    link: '#',
  },
];

const User = () => {
  return (
    <div className="container-fluid">
      <Breadcumb breadcumb={breadcrumb} />
      <div className="admin-boxContainer d1">
        <div className="admin-pageWrapper">
          <div className="admin-pageWrapper_box">
            <div className="admin-pageWrapper__item">
              <PageHead title="Feedback" />
            </div>
          </div>
        </div>
      </div>
      <div className="pb-4">
        <div className="admin-boxContainer d1 ">
          <div className="row">
            <div className="col-12">
              <div className="filters">
                <div className="row form_grider d1">
                  <div className="col-12 col-md-6">
                    <InputField
                      type="text"
                      label="Meta Title"
                      value={""}
                      name="meta_title"
                      placeholder="Enter Meta Title"
                      errors={""}
                      touched={""}
                      onBlur={() => { }}
                      onChange={() => { }}
                      maxLength={30}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <InputField
                      type="text"
                      label="Meta Title"
                      value={""}
                      name="meta_title"
                      placeholder="Enter Meta Title"
                      errors={""}
                      touched={""}
                      onBlur={() => { }}
                      onChange={() => { }}
                      maxLength={30}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-table d3 table-responsive mt-3 noHover">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="s-no"> S.NO</th>
                      <th>State/UT Name</th>
                      <th>Total Learners</th>
                      <th>Tagged Learners</th>
                      <th>Untagged Learners</th>
                      <th>Total VTs</th>
                      <th>Tagged VTs</th>
                      <th>Untagged VTs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Andaman And Nicobar Islands</td>
                      <td>11</td>
                      <td>6</td>
                      <td>5</td>
                      <td>34</td>
                      <td>0</td>
                      <td>34</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Andhra Pradesh</td>
                      <td>10</td>
                      <td>9</td>
                      <td>1</td>
                      <td>37</td>
                      <td>0</td>
                      <td>37</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Arunachal Pradesh</td>
                      <td>3</td>
                      <td>2</td>
                      <td>1</td>
                      <td>21</td>
                      <td>0</td>
                      <td>21</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>Assam</td>
                      <td>3</td>
                      <td>3</td>
                      <td>0</td>
                      <td>32</td>
                      <td>0</td>
                      <td>32</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>Bihar</td>
                      <td>43</td>
                      <td>9</td>
                      <td>34</td>
                      <td>51</td>
                      <td>0</td>
                      <td>51</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>Chandigarh</td>
                      <td>2</td>
                      <td>2</td>
                      <td>0</td>
                      <td>9</td>
                      <td>0</td>
                      <td>9</td>
                    </tr>
                    <tr>
                      <td>7</td>
                      <td>Chhattisgarh</td>
                      <td>2</td>
                      <td>2</td>
                      <td>0</td>
                      <td>5</td>
                      <td>0</td>
                      <td>5</td>
                    </tr>
                    <tr>
                      <td>8</td>
                      <td>Dadra And Nagar Haveli And Daman And Diu</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>1</td>
                      <td>0</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>9</td>
                      <td>Delhi</td>
                      <td>70</td>
                      <td>46</td>
                      <td>24</td>
                      <td>110</td>
                      <td>0</td>
                      <td>110</td>
                    </tr>
                    <tr>
                      <td>10</td>
                      <td>Goa</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>1</td>
                      <td>0</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>11</td>
                      <td>Gujarat</td>
                      <td>1</td>
                      <td>0</td>
                      <td>1</td>
                      <td>1</td>
                      <td>0</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>12</td>
                      <td>Haryana</td>
                      <td>10</td>
                      <td>8</td>
                      <td>2</td>
                      <td>35</td>
                      <td>0</td>
                      <td>35</td>
                    </tr>
                    <tr>
                      <td>13</td>
                      <td>Himachal Pradesh</td>
                      <td>2</td>
                      <td>1</td>
                      <td>1</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td>14</td>
                      <td>Jammu And Kashmir</td>
                      <td>1</td>
                      <td>1</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td>15</td>
                      <td>Jharkhand</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td>16</td>
                      <td>Karnataka</td>
                      <td>4</td>
                      <td>2</td>
                      <td>2</td>
                      <td>2</td>
                      <td>0</td>
                      <td>2</td>
                    </tr>
                    <tr>
                      <td>17</td>
                      <td>Kerala</td>
                      <td>1</td>
                      <td>0</td>
                      <td>1</td>
                      <td>1</td>
                      <td>0</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>18</td>
                      <td>Ladakh</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td>19</td>
                      <td>Lakshadweep</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>1</td>
                      <td>0</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>20</td>
                      <td>Madhya Pradesh</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>1</td>
                      <td>0</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>-</td>
                      <td>Total</td>
                      <td>163</td>
                      <td>91</td>
                      <td>72</td>
                      <td>342</td>
                      <td>0</td>
                      <td>342</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProtectedRoute(User);