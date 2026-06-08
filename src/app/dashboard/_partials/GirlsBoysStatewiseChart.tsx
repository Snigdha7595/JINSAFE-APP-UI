'use client'
import React from 'react'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'

const indianStates = ["Himachal Pradesh", "Delhi", "Haryana", "Punjab", "Jammu and Kashmir", "Andhra Pradesh", "Uttar Pradesh", "Uttrakhand", "Chennai", "Gujrat", "Rajasthan", "Madhya Pradesh"]
const options = {
    chart: {
        type: 'column'
    },
    title: {
        text: ''
    },
    subtitle: {
        text: 'State Wise'
    },
    colors: ['#6f58e9', '#94d13d'],
    xAxis: {
        categories: indianStates,
        crosshair: true,
        accessibility: {
            description: 'Genders'
        }
    },
    yAxis: {
        min: 0,
        max: 100,
        tickInterval: 25,
        
        title: {
            text: ''
        }
    },
    tooltip: {
        // valueSuffix: ' (1000 MT)'
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [
        {
            name: 'Girls',
            data: [52, 49, 76, 18, 52, 23, 75, 97, 23, 96, 24, 82]
        },
        {
            name: 'Boys',
            data: [98, 73, 74, 52, 29, 23, 79, 52, 48, 51, 74, 56]
        }
    ],
}

const GirlsBoysStatewiseChart = () =>{
    if (typeof Highcharts === 'object') {
        HighchartsExporting(Highcharts)
    }
    
    return (<HighchartsReact
        highcharts={Highcharts}
        options={options}
        />)
}

export default GirlsBoysStatewiseChart