import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { IconButton, List, ListItem, ListItemIcon, ListItemText, useMediaQuery } from "@mui/material";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "../Button"; // Custom button component
import Buttons from "@mui/material/Button";
import { MdOutlineAdd } from "react-icons/md";
import DragAndDropFileUpload from "../dragNdrop/DragNdrop.jsx";
import { useSelector } from "react-redux";
import { Select, SelectItem } from "@nextui-org/react";
import user from "../../assets/classCards/user.png";
import examimg from './examimg.jpg';
import AttendanceCard from "../attendance/attendanceCard.jsx";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState,useEffect } from "react";
import Papa from 'papaparse';

const drawerWidth = 320;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    
    [theme.breakpoints.down("sm")]: {
      marginLeft: "0", // Override for small screens
    },
  })
);

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
   
    marginLeft: open ? `${drawerWidth}px` : "0",
    [theme.breakpoints.down("sm")]: {
      width: "100%", // Full width for small screens
      marginLeft: "0", // No margin for small screens
    },
    zIndex:1
  })
);

export default function ExamPage() {
  const userData = useSelector((state) => state.auth.userData);
  const [open, setOpen] = React.useState(true);
const [processedUrls, setProcessedUrls] = useState([]);

  const [role] = React.useState(userData.role);
  const [selectedClass ,setselectedClass] = React.useState('')
  const [files, setFiles] = React.useState([]);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [createdClasses, setCreatedClasses] = React.useState([]);
  const [joinedClasses, setJoinedClasses] = React.useState([]);
  const [classes, setClasses] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const handleFilesUploaded = (files) => setUploadedFiles(files);
  const [myMarks,setMarks] = useState([])
  const toggleDrawer = () => setOpen(!open);
  const [currentClass,setCurrentClass] = useState('')

  const baseURL = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials = true;


  const clearFields = ()=>{
    setFiles([])
    setClasses("")

  }
  const handleParseFromUrl = (csvUrl,subject) => {
    // Check if the URL has already been processed
    if (!processedUrls.includes(csvUrl)) {
      setProcessedUrls((prevUrls) => [...prevUrls, csvUrl]);
      Papa.parse(csvUrl, {
        download: true, // Enables fetching from a remote URL
        header: true, // Adjust based on your CSV structure
        skipEmptyLines: true,
        complete: (results) => {
          console.log(results.data);
          
          const foundData = results.data.find(
            (item) => item.EnrollmentNumber === "FS22CO005"
          );
          console.log("Found Data:", foundData);
          foundData.classname = subject
          
          if (foundData) {
            setMarks((prevData)=>{
              return [...prevData,foundData]
            })
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    }
  };
  // console.log(myMarks);
  if(userData.role === "Student"){
    useEffect(()=>{
      joinedClasses.map((item)=>(
        item.result?.map((resUrl)=>(
        handleParseFromUrl(resUrl.attachment,item.classname)
        ))
      ))
    },[joinedClasses])
  }

  if (userData.role === "Teacher") {
    React.useEffect(() => {
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

  const handleClassChange = (event) => setClasses(event.target.value);
  
      const uploadResult=(e)=>{
      e.preventDefault();
      if (!files || !classes) {
        toast.error("Class and files are required.", {
          position: "top-right",
          autoClose: 1500,
        });
        return;
      }
    
    const formData = new FormData();
    formData.append("classcode", classes);
    uploadedFiles.forEach((files, index) => {
      formData.append("attachment", files);
    });
    
    axios
      .post(`${baseURL}/api/class/result`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      .then((result) => {
        const message = result.data.message || "Result Uploaded"
        console.log(message)
        toast.success(message, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setselectedClass("classes")
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
      })
  };

  const renderContent = () => {
    if ( selectedClass ==='upload') {
      
      return (
        <div className={`flex justify-center items-center w-full align-middle ${isSmallScreen ? 'flex-col' : 'flex-row'}`}>
    <ToastContainer/>

          <img src={examimg} alt="Exam" className={` ${isSmallScreen ? 'h-42 w-42' : "h-46 w-46"}`} />
          <form className="p-6 flex flex-col gap-10 mt-16" onSubmit={uploadResult}>
            <p className="text-center text-lg">Upload Students' Marks File</p>
            <Select 
              label="Your Class" 
              placeholder="Select Class" 
              className="w-full z-0" 
              color="success"
              onChange={handleClassChange}
            >
              {createdClasses.map((item) => (
                          <SelectItem
                            key={item.classCode}
                            value={item.classname.toUpperCase()}
                          >
                            {item.classname.toUpperCase()}
                          </SelectItem>
                        ))}
            </Select>
            <DragAndDropFileUpload
                      onFilesUploaded={handleFilesUploaded}
                      files={files}
                      setFiles={setFiles}
                    />
            <Button type="submit" className="w-18 h-8 mt-4 text-white text-sm text-center bg-[#253745] hover:bg-[#11212D]">
              Upload Result
            </Button>
          </form>
        </div>
      );
    } 
     if (role === "Student") {
  
      return (
        <div className=" p-10">
          <Table
            aria-label="Student Results"
            className=" w-full h-fit bg-white p-4  rounded-lg border-gray-200"
          >
            <TableHeader>
              <TableColumn>Subject</TableColumn>
              <TableColumn>Marks</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody>
              {
              myMarks.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.classname}</TableCell>
                  <TableCell >{item.Marks}</TableCell>
                  <TableCell className={`${item.Marks < 7 ? 'text-red-400' : 'text-green-400' }`}>{item.Marks > 7 ? "Pass" : "Fail"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    } 
     if (selectedClass === "classes") {
      const findClass = createdClasses?.find((item)=>{
        return item.classCode === currentClass.toLowerCase()
      })
      return (
        <div className={`flex flex-wrap mt-7 ${isSmallScreen ? 'grid grid-cols-2' : 'grid grid-cols-5'}`}>
                <div className="p-2">
                {
                  findClass?.result !== null ? (
                    findClass?.result?.map((urls)=>(
                      <AttendanceCard
                      name={findClass.classname}
                      date={urls.createdAt}
                      fileUrl={urls.attachment}
                      />
                    ))
                  ) : (
                    <div>No results yet</div>
                  )
                }
                </div>  
         </div>
      );
    }
  
    // Fallback for invalid role or unhandled states
    return <div>Please select an action or class from the sidebar.</div>;
  };
  
  return (
    <>
    <ToastContainer/>
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ backgroundColor: "#253745" }}>
          {isSmallScreen && role==="Teacher" && (
            <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h4" sx={{ marginLeft: isSmallScreen ? '30%':"45%" }}>
            Result
          </Typography>
        </Toolbar>
      </AppBar>
      {role === "Teacher" ?
      <Drawer
        sx={{
          zIndex:0,
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            paddingTop: isSmallScreen ? "56px" : "64px",
            backgroundColor:"#eef0ef"
          },
        }}
        variant={isSmallScreen ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
      >
        <Divider />
        <List>
          {role === "Teacher" && (
            <ListItem>
              <Buttons
                className="cursor-pointer hover:bg-[#11212D]"
                variant="contained"
                onClick={() => { setselectedClass('upload'), isSmallScreen? toggleDrawer() :null }}
                sx={{ fontSize: "15px", backgroundColor: "#253745" }}
              >
                Upload Result <MdOutlineAdd />
              </Buttons>
            </ListItem>
          )}
          <Typography variant="h6" sx={{ textAlign: "center", paddingTop: 2 }}>
            Your Classes
          </Typography>
          {createdClasses.map((item) => (
                <ListItem
                  key={item.classCode}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() =>{
                    setselectedClass('classes')
                    setCurrentClass(item.classCode.toLowerCase()),
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
        </List>
      </Drawer>
      :null}

      <Main open={open}>
        <Box sx={{ mt: 8 }}>{renderContent()}</Box>
      </Main>
    </Box>
    </>
  );
}
