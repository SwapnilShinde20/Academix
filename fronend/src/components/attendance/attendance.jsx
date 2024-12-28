import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import { MdOutlineAdd } from "react-icons/md";
import DragAndDropFileUpload from "../dragNdrop/DragNdrop.jsx";
import { useSelector } from "react-redux";
import { useState,useEffect } from "react";
import attendancelogo from "./attendancelogo.png";
import AttendanceCard from "./attendanceCard.jsx";
import axios from "axios";
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import classBackground from "../../assets/classCards/classbackground.jpg"; // Ensure you have this asset
import user from "../../assets/classCards/user.png"; // Ensure you have this asset
import Papa from 'papaparse';
import HighlightedCalendar from "./Calendar.jsx";
import DonutChart from "./DonutChart.jsx";
import ShowAttendance from "./ShowAttendace.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMediaQuery from "@mui/material/useMediaQuery";
import Loading from "../Loading.jsx"
const drawerWidth = 300;

const Main = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: "#f9f9f9",
  minHeight: "100vh",
}));
const StyledAppBar = styled(AppBar)({
  color: "#fff",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
});
export default function Attendance() {
  const userData = useSelector((state) => state.auth.userData);
  const defaultSelect = userData.role === "Teacher" ? "uploadAttendance" : null
  const [open, setOpen] = React.useState(false);
  const [classes, setClasses] = useState("");
  const [role, setRole] = useState(userData.role);
  const [dupRole, setDupRole] = useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [selectedClass, setSelectedClass] = useState(defaultSelect);
  const [createdClasses, setCreatedClasses] = React.useState([]);
  const [joinedClasses, setJoinedClasses] = React.useState([]);
  const [files, setFiles] = React.useState([]);
  const [myAttendance,setMyAttendance] = useState([]);
  const handleFilesUploaded = (files) => setUploadedFiles(files);
  const [selectedClassDates,setSelectedClassDates] = useState([])
const [processedUrls, setProcessedUrls] = useState([]);
const [loading,setLoading] = useState(false)
const baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;


const isSmallScreen = useMediaQuery("(max-width: 768px)"); // Use media query for small screens

const toggleDrawer = () => setOpen(!open); // Drawer toggle function

//  console.log(myAttendance);

const handleParseFromUrl = (csvUrl) => {
  // Check if the URL has already been processed
  if (!processedUrls.includes(csvUrl)) {
    setProcessedUrls((prevUrls) => [...prevUrls, csvUrl]);

    Papa.parse(csvUrl, {
      download: true, // Enables fetching from a remote URL
      header: true, // Adjust based on your CSV structure
      skipEmptyLines: true,
      complete: (results) => {
        const foundData = results.data.find(
          (item) => item.Name === userData.username.toLowerCase()
        );
        console.log("Found Data:", foundData);

        if (foundData) {
          // Add unique attendance record to the state
          setMyAttendance((prevAttendance) => {
            const isDuplicate = prevAttendance.some(
              (record) => record.Date === foundData.Date
            );
            return isDuplicate ? prevAttendance : [...prevAttendance, foundData];
          });
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  }
};

useEffect(() => {
  if (userData.role === "Student") {

    const selectedClassData = joinedClasses.find(
      (item) => item.classname === selectedClass?.toLowerCase()
    );

    if (selectedClassData && selectedClassData.attendance?.length > 0) {
      selectedClassData.attendance.forEach((item) => {
        if (item.createdAt) {
          // Extract the date in YYYY-MM-DD format
          const formattedDate = new Date(item.createdAt).toISOString().split("T")[0];

          // Add the date only if it doesn't already exist in the state
          setSelectedClassDates((prevDates) =>
            prevDates.includes(formattedDate) ? prevDates : [...prevDates, formattedDate]
          );
        }
      });

      selectedClassData.attendance.forEach((item) => {
        if (item.attachment) {
          handleParseFromUrl(item.attachment);
        }
      });
    }
  }
}, [selectedClass, joinedClasses, userData.role]);


useEffect(()=>{
  setSelectedClassDates([])
  setProcessedUrls([])
  setMyAttendance([])
},[selectedClass])

  const handleClassChange = (event) => setClasses(event.target.value);


  const handleClassClick = (className) => {
    if (className === "Upload Attendance") {
      setSelectedClass("uploadAttendance"); // Set this when "Upload Attendance" is clicked
    } else {
      setSelectedClass(className);
    }
    // Assuming you want to set this on click
  };
  const clearFields = () => {
    setUploadedFiles([]);
    setClasses("");
    setLoading(false)
    setFiles([])
    
  };
  const uploadAttendance = (e) => {
    e.preventDefault();
    if (!uploadedFiles || !classes) {
      toast.error("Class and files are required.", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }
    toast.info("Please be patient! Recording attendance may take a few moments as we process your images.", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    
    const classDetails = createdClasses.find(
      (item) => item.classname === classes.toLowerCase()
    );

    const formData = new FormData();
    formData.append("classCode", classDetails.classCode);
    uploadedFiles.forEach((image, index) => {
      formData.append("image", image);
    });

    axios
      .post("http://localhost:5001/face_recognition", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      .then((result) => {
        const message = result.data.message || "Attendance Uploaded"
        toast.success(message, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setSelectedClass(classes)
        clearFields()

      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Something went wrong!";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .finally(()=>{
        clearFields()
        setLoading(false)
      })
  };

  if (userData.role === "Teacher") {
    useEffect(() => {
      axios
        .get(`${baseURL}/api/class/created-classes`)
        .then((result) => {
          setCreatedClasses(result.data.data.classes);
        })
        .catch((err) => {
          console.log(err);
        });
    }, [createdClasses]);
  } else if (userData.role === "Student") {
    useEffect(() => {
      axios
        .get(`${baseURL}/api/class/joined-classes`)
        .then((result) => {
          setJoinedClasses(result.data.data.classArr);
        })
        .catch((err) => {
          console.log(err);
        });
    }, [joinedClasses]);
  }
  return (
    <Box sx={{ display: "grid" }}>
      
      <ToastContainer />
      <CssBaseline />
      
      <StyledAppBar position="fixed">
        <Toolbar sx={{ backgroundColor: "#253745" }}>
          {isSmallScreen && ( // Show toggle button only on small screens
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
           )} 
          <Typography variant="h4" sx={{ marginLeft: isSmallScreen ? "0" : "35%" }}>
            Attendance
          </Typography>
        </Toolbar>
      </StyledAppBar>
    

      <Drawer
        sx={{
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", paddingTop:"3.5rem" ,backgroundColor:"#eef0ef"},
          zIndex: 0,
        }}
        variant={isSmallScreen ? "temporary" : "permanent"} // Temporary drawer for small screens
        anchor="left"
        open={open}
        onClose={toggleDrawer} // Handle close for temporary drawer
      >
        <Divider />
        <List>
          {userData.role === "Teacher" ? (
            <>
              <ListItem onClick={()=>{isSmallScreen ?  toggleDrawer() : null }}>
                <Button
                 
                  className="cursor-pointer hover:bg-[#11212D]"
                  variant="contained"
                  onClick={() =>{ handleClassClick("Upload Attendance") , isSmallScreen ?  toggleDrawer() : null }}
                  sx={{ fontSize: "15px", backgroundColor: "#253745" }}
                >
                  Upload Attendance <MdOutlineAdd />
                </Button>
              </ListItem>
              <Typography
                variant="h6"
                className="text-[#253745]"
                sx={{ textAlign: "center", paddingTop: 2 }}
              >
                Your Classes
              </Typography>
              {createdClasses.map((item) => (
                <ListItem
                  key={item.classCode}
                  className="hover:bg-gray-100 cursor-pointer text-[#253745]"
                  onClick={() =>{
                    handleClassClick(item.classname.toUpperCase()),
                     isSmallScreen ?  toggleDrawer() : null 
                  }}
                >
                  <ListItemIcon className="mr-3">
                    <img
                      src={user}
                      alt="User Profile"
                      className="w-12 h-12 rounded-full mb-2 border solid white "
                    />
                  </ListItemIcon>
                  {item.classname.toUpperCase()}
                </ListItem>
              ))}
            </>
          ) : userData.role === "Student" ? (
            joinedClasses.map((item) => (
              <ListItem
                key={item.classCode}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() =>{
                  handleClassClick(item.classname.toUpperCase())
                  isSmallScreen ?  toggleDrawer() : null 
                }
                }
              >
                <ListItemIcon className="mr-3">
                  <img
                    src={user}
                    alt="User Profile"
                    className="w-12 h-12 rounded-full mb-2 border solid white "
                  />
                </ListItemIcon>
                {item.classname.toUpperCase()}
              </ListItem>
            ))
          ) : null}
        </List>
      </Drawer>

      <Main open={open}>
          <Box
            sx={{
              
              mt: 8,
              padding: "16px",
              marginLeft: isSmallScreen ? '0px': "300px", // Adjust marginLeft for small screens
              position: "relative", // Set relative for absolute child alignment if needed
              // width: "calc(100% - 300px)", // Adjust width to account for marginLeft
            }}
          >
            {selectedClass === "uploadAttendance" && (
              <div className={`flex ${isSmallScreen ? 'flex-col' : 'flex-row'} items-center justify-center mt-16 md:mt-8`}>
                <img
                  src={attendancelogo}
                  alt="Attendance Logo"
                  className={` ${isSmallScreen ? 'h-36 w-36' : 'h-100 w-100'}  mb-8`}
                />
                <div className="w-full max-w-md px-4">
                  <form
                    className="flex flex-col justify-center"
                    onSubmit={uploadAttendance}
                  >
                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                      <InputLabel id="select-class-label">Classes</InputLabel>
                      <Select
                        labelId="select-class-label"
                        id="select-class"
                        value={classes}
                        label="Select Class"
                        onChange={handleClassChange}
                        sx={{ width: "100%" }}
                      >
                        {createdClasses.map((item) => (
                          <MenuItem
                            key={item.classCode}
                            value={item.classname.toUpperCase()}
                          >
                            {item.classname.toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Select Images to Upload
                      </Typography>
                    </FormControl>
                    <DragAndDropFileUpload
                      onFilesUploaded={handleFilesUploaded}
                      files={files}
                      setFiles={setFiles}
                    />
                    <Loading show={loading} />

                    <Button
                    className="hover:bg-[#11212D]"
                      type="submit"
                      sx={{
                              width: '100%',          
                              marginTop: '2rem',    
                              color: 'white',         
                              fontSize: '0.875rem',  
                              backgroundColor: '#253745' 
                            }}
                    >
                      Upload Attendance
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {selectedClass !== "uploadAttendance" && (
  <div className={`flex ${isSmallScreen ? 'flex-wrap justify-between' : 'flex-wrap justify-start'} `}>
    {userData.role === "Teacher" ? (
      createdClasses.find(
        (item) => item.classname === selectedClass.toLowerCase()
      ) ? (
        createdClasses
          .find(
            (item) => item.classname === selectedClass.toLowerCase()
          )
          .attendance?.length > 0 ? (
            createdClasses
              .find(
                (item) => item.classname === selectedClass.toLowerCase()
              )
              .attendance.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              ) // Sorting by createdAt
              .map((item) => (
                <div
                  key={item.createdAt}
                  className={`p-2 ${isSmallScreen ? 'w-1/2' : 'w-1/5'}`}
                >
                  <AttendanceCard
                    name={selectedClass}
                    date={item.createdAt}
                    fileUrl={item.attachment}
                  />
                </div>
              ))
          ) : (
            <div className="col-span-2">No attendance found</div> // Centered message
          )
      ) : (
        <div className="col-span-2">Class not found</div> // Centered message
      )
                ) : userData.role === "Student" ? (
                  selectedClass !== null ? (

                  <div className="absolute inset-0 flex flex-col gap-8 md:gap-12 bg-gray-50 border border-gray-200 shadow-lg">

                        {/* Header Section */}
                        <h1 className="text-2xl font-bold text-center text-gray-800 py-4 bg-white border-b border-gray-300 shadow-sm">
                          {selectedClass} Attendance Dashboard
                        </h1>

                        {/* Top Section: Calendar and Donut Chart */}
                        <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 px-4">
                          
                          {/* Calendar Section */}
                          <div className="flex-1 bg-white rounded-md border border-gray-300 shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
                              Attendance Calendar
                            </h2>
                            <HighlightedCalendar highlightedDates={myAttendance} />
                          </div>

                          {/* Donut Chart Section */}
                          <div className="flex-1 bg-white rounded-md border border-gray-300 shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
                              Attendance Overview
                            </h2>
                            <DonutChart
                              myAttendance={myAttendance}
                              selectedClassDates={selectedClassDates.length}
                            />
                          </div>
                        </div>

                        {/* Bottom Section: Show Attendance */}
                        <div className="bg-white rounded-md border border-gray-300 shadow-md p-6 mx-4">
                          <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
                            Detailed Attendance Records
                          </h2>
                          <ShowAttendance dates={selectedClassDates} presentDates={myAttendance} />
                        </div>
                  </div>
                  ) :(
                    <div>Please select class from the drawer to view attendance</div>
                  )

                ) : null}
              </div>
            )}
          </Box>
        </Main>
            
    </Box>
  );
}
