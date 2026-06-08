'use client';
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import Accessibility from 'highcharts/modules/accessibility';

Accessibility(Highcharts);

const options = {
  chart: {
    type: 'spline',
  },

  title: {
    text: '',
    // align: 'left'
  },

  subtitle: {
    text: 'Chart 1 Title',
    // align: 'left'
  },

  yAxis: {
    title: {
        text: ''
    },
    min: 0,
    max: 100,
    tickInterval: 25,
  },

  xAxis: {
    categories: [
      'Category 1',
      'Category 2',
      'Category 3',
      'Category 4',
      'Category 5',
      'Category 6',
    ],
    accessibility: {
      rangeDescription: 'Range of categories',
    },
  },

  legend: {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle',
  },

  plotOptions: {
    series: {
      label: {
        connectorAllowed: false,
      },
      // pointStart: 0
    },
  },

  series: [
    {
      name: 'Item 1',
      data: [80, 50, 52, 95, 36, 58],
    },
    {
      name: 'Item 2',
      data: [54, 47, 18, 27, 31, 56],
    },
  ],
  colors: ['#94d13d', '#6f58e9'],

  responsive: {
    rules: [
      {
        condition: {
          maxWidth: 500,
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
          },
        },
      },
    ],
  },
};

const RenameThisChart = () => {
  if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default RenameThisChart;
