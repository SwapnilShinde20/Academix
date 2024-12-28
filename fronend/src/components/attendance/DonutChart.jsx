import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts'; // Correct import for the React wrapper
import { useSelector } from 'react-redux';

function DonutChart({ myAttendance, selectedClassDates }) {
  const [lecturesCount, setLecturesCount] = useState(0);
  const userData = useSelector((state) => state.auth.userData);

  // console.log(userData.username);
  

  // console.log("my attendance" , myAttendance);
  // console.log("selected class dates" , selectedClassDates);
  
  

  // Function to count the number of "Present" entries in the myAttendance array
  const countAttendance = (attendanceArray) => {
    return attendanceArray.filter((item) => item.Name === userData.username).length;
  };

  useEffect(() => {
    if (myAttendance && myAttendance.length > 0) {
      const presentCount = countAttendance(myAttendance);
      setLecturesCount(presentCount); // Set the lecturesCount to the present count
    }
  }, [myAttendance]);

  const options = {
    chart: {
      type: 'donut',
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'gradient',
    },
    dataLabels: {
      
      enabled: true,
      formatter: function (val) {
        const present =  countAttendance(myAttendance);
        return present > 0 ? val.toFixed(2) + "%": 0 +"%"
      },
      
    },
    
    legend: {
      position: 'bottom',
      formatter: function (val, opts) {
        // Get the count of "Present" and "Absent" days
        const presentCount = countAttendance(myAttendance);
        const absentCount = selectedClassDates - presentCount; // Absent count is total - present count          
        
        // Use opts.seriesIndex to check the index of the series
        if (opts.seriesIndex === 0) {
          return `Present - ${presentCount} days`;
          // Display present days count
        } else if (opts.seriesIndex === 1) {
          return ` Absent - ${absentCount} days` ;
          // Display absent days count
        }
        return '';
      },
    },
    responsive: [
      {
        breakpoint: 768, // For tablets and smaller devices
        options: {
          chart: {
            width: 280,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
      {
        breakpoint: 480, // For mobile devices
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  // Assuming selectedClassDates is a count of total class dates
  const series = [lecturesCount, selectedClassDates - lecturesCount]; // Remaining lectures = total - present

  return (
    <div
      id="chart"
      className=" flex-col rounded-lg flex items-center justify-center h-full w-full p-4"
    >
    { selectedClassDates >0 ? <>
      <Chart options={options} series={series} type="donut" width="100%" />
      Total - {selectedClassDates} Lectures
      </>:
      <div>
        THIS CLASS DOESNT CONDUCT ANY  LECTURES
      </div>
    }
    </div>
  );
}

export default DonutChart;
