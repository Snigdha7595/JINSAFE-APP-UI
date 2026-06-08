'use client';
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import Accessibility from 'highcharts/modules/accessibility';

Accessibility(Highcharts);

const options = {
  chart: {
    type: 'bar',
  },
  title: {
    text: '',
  },
  subtitle: {
    text: 'Stacked Bar Chart Title',
  },
  colors: ['#6f58e9', '#94d13d'],
  xAxis: {
    categories: [
      'Category 1',
      'Category 2',
      'Category 3',
      'Category 4',
      'Category 5',
      'Category 6',
    ],
  },
  yAxis: {
    min: 0,
    // max: 200,
    tickInterval: 50,
    title: {
      text: '',
    },
  },
  legend: {
    reversed: true,
  },
  plotOptions: {
    series: {
      stacking: 'normal',
      dataLabels: {
        enabled: true,
      },
    },
  },
  series: [
    {
      name: 'Item 1',
      data: [103, 20, 50, 35, 59, 30],
    },
    {
      name: 'Item 2',
      data: [52, 75, 25, 20, 96, 10],
    },
  ]
};

const StackedBarchart = () => {
  if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default StackedBarchart;

// 'use client';
// import React, { useEffect } from 'react';
// import Highcharts from 'highcharts';
// import HighchartsExporting from 'highcharts/modules/exporting';
// import HighchartsAccessibility from 'highcharts/modules/accessibility';
// import HighchartsReact from 'highcharts-react-official';

// // Initialize modules
// if (typeof Highcharts === 'object') {
//   HighchartsExporting(Highcharts);
//   HighchartsAccessibility(Highcharts);
// }

// const StackedBarchart = () => {
//   const options = {
//     chart: {
//       type: 'bar',
//     },
//     title: {
//       text: '',
//     },
//     subtitle: {
//       text: 'Stacked Bar Chart Title',
//     },
//     colors: ['#6f58e9', '#94d13d'],
//     xAxis: {
//       categories: [
//         'Category 1',
//         'Category 2',
//         'Category 3',
//         'Category 4',
//         'Category 5',
//         'Category 6',
//       ],
//     },
//     yAxis: {
//       min: 0,
//       // max: 200,
//       tickInterval: 50,
//       title: {
//         text: '',
//       },
//     },
//     legend: {
//       reversed: true,
//     },
//     plotOptions: {
//       series: {
//         stacking: 'normal',
//         dataLabels: {
//           enabled: true,
//         },
//       },
//     },
//     series: [
//       {
//         name: 'Item 1',
//         data: [103, 20, 50, 35, 59, 30],
//       },
//       {
//         name: 'Item 2',
//         data: [52, 75, 25, 20, 96, 10],
//       },
//     ]
//   };

//   return <HighchartsReact highcharts={Highcharts} options={options} />;
// };

// export default StackedBarchart;
