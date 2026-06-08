'use client'
import React from 'react'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'

const options = {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: ''
    },
    subtitle: {
        text: 'Gender Wise'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    colors: ['#6f58e9', '#94d13d'],
    yAxis: {
        labels: {
            display: false
        },
        gridLineWidth: 0
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    plotOptions: {
        pie: {
            allowPointSelect: false, // true
            // cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            showInLegend: true
        }
    },
    series: [{
        name: 'Brands',
        colorByPoint: true,
        data: [{
            name: 'Girls',
            y: 39,
            // sliced: true,
            // selected: true
        },  {
            name: 'Boys',
            y: 61
        }]
    }]
}

const GenderwiseChart = () =>{
    if (typeof Highcharts === 'object') {
        HighchartsExporting(Highcharts)
    }
    
    return (<HighchartsReact
        highcharts={Highcharts}
        options={options}
        />)
}

export default GenderwiseChart