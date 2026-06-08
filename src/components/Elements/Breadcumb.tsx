import React, { useEffect, useState } from 'react';
import { CapitalizedFunction } from '@/config/globalUtils';

const Breadcumb = ({
  breadcumb,
  setLevel,
  updateBreadcrumbs,
  setReverseState,
  captialize
}: any) => {
  const [breadcumbList, setBreadcumbList] = useState(breadcumb);

  useEffect(() => {
    setBreadcumbList(breadcumb);
  }, [breadcumb]);

  const handleBreadcrumbClick = (item: any) => {
    const levelMap: any = {
      state: 'national',
      district: 'state',
      block: 'district',
      village: 'block',
      school: 'village',
    };

    // Update the level based on the clicked item's level
    const nextLevel = levelMap[item.level];

    if (nextLevel) {
      setLevel(nextLevel);
      updateBreadcrumbs(item.level, item, true);
    }

    // If the item is a school, set the reverse state
    if (item.level === 'school') {
      setReverseState('school');
    }
  };
  return (
    <>
      {breadcumb && breadcumbList.length > 0 && (
        <ol className="breadcrumb">
          {breadcumbList.map((item: any, index: number) => {
            return (
              <li
                key={item.id}
                data-key={item.id}
                className={`breadcrumb-item ${breadcumbList.length === index + 1 ? 'active' : ''}`}
                onClick={() => handleBreadcrumbClick(item)}
              >
                {captialize != undefined && captialize == false ?
                  item.label
                  :
                  CapitalizedFunction(item.label)
                }

              </li>
            );
          })}
        </ol>
      )}
    </>
  );
};

export default Breadcumb;
