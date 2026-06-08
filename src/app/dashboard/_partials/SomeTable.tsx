// import { APPIMAGES } from '@/config/config'
// import Image from 'next/image'
import React from 'react'

export default function SomeTable() {
  return (
    <div className="admin-table d2 table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>State Name</th>
                <th>District</th>
                <th>Medium</th>
                <th className="sticky-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Andaman and Nicobar Islands</td>
                <td>8</td>
                <td>5</td>
                <td className="sticky-right">
                  <div className="table-action">
                    <button className="table-action_icon">
                      {/* <Image
                        src={APPIMAGES.ICON_EYE_DARK}
                        alt="left arrow icon"
                        width={17}
                        height={17}
                      /> */}img1
                    </button>
                    <button className="table-action_icon">
                      {/* <Image
                        src={APPIMAGES.ICON_EDIT}
                        alt="left arrow icon"
                        width={17}
                        height={17}
                      /> */}
                      img2
                    </button>
                    <button className="table-action_icon">
                      {/* <Image
                        src={APPIMAGES.ICON_TRASH_DARK}
                        alt="left arrow icon"
                        width={17}
                        height={17}
                      /> */}img3
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>Arunachal Pradesh</td>
                <td>4</td>
                <td>3</td>
                <td className="sticky-right">
                  <div className="table-action">
                    <button className="table-action_icon">
                      {/* <Image
                        src={APPIMAGES.ICON_EYE_DARK}
                        alt="left arrow icon"
                        width={17}
                        height={17}
                      /> */}
                      img4
                    </button>
                    <button className="table-action_icon">
                      {/* <Image
                        src={APPIMAGES.ICON_EDIT}
                        alt="left arrow icon"
                        width={17}
                        height={17}
                      /> */}
                      img5
                    </button>
                    <button className="table-action_icon">
                      {/* <Image
                        src={APPIMAGES.ICON_TRASH_DARK}
                        alt="left arrow icon"
                        width={17}
                        height={17}
                      /> */}img6
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>Bihar</td>
                <td>12</td>
                <td>6</td>
                <td className="sticky-right">
                  <div className="table-action">
                    <button className="table-action_icon">
                      {/* <Image
                        src={APPIMAGES.ICON_EYE_DARK}
                        alt="left arrow icon"
                        width={17}
                        height={17}
                      /> */}img7
                    </button>
                    <button className="table-action_icon">
                      {/* <Image
                        src={APPIMAGES.ICON_EDIT}
                        alt="left arrow icon"
                        width={17}
                        height={17}
                      /> */}
                      img8
                    </button>
                    <button className="table-action_icon">
                      {/* <Image
                        src={APPIMAGES.ICON_TRASH_DARK}
                        alt="left arrow icon"
                        width={17}
                        height={17}
                      /> */}
                      img9
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  )
}
