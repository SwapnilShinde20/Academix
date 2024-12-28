import * as React from "react";
import { useState , useEffect } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText,  useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Buttons from "@mui/material/Button";
import { MdOutlineAdd } from "react-icons/md";
import { useSelector } from "react-redux";
import { Select, SelectItem } from "@nextui-org/react";
import user from "../../assets/classCards/user.png";
import AttendanceCard from "../attendance/attendanceCard.jsx";
import {Input} from "@nextui-org/react";
import {Checkbox} from "@nextui-org/react";
import {Button} from "@nextui-org/react";
import axios from "axios";
import Papa from 'papaparse';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



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
  })
);

export default function Timetable() {
  const userData = useSelector((state) => state.auth.userData);
  const [open, setOpen] = React.useState(true);
  const [role] = React.useState(userData.role);
  const [selectedClass ,setselectedClass] = React.useState('')
  const [files, setFiles] = React.useState([]);
  const [createdClasses, setCreatedClasses] = React.useState([]);
  const [joinedClasses, setJoinedClasses] = React.useState([]);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const[tableName , setTableName] = React.useState('')
  const [myIndex , setMyIndex] = React.useState(0)
  const [classes, setClasses] = React.useState("");
  const [parsedData, setParsedData] = React.useState([]); // State to store parsed CSV data
  const [timeSlots , setTimeSlots] = React.useState([]);
const [processedUrls, setProcessedUrls] = useState([]);
const [currentClass,setCurrentClass] = useState('')
const baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;


  const handleClassChange = (event) => setClasses(event.target.value);
  const toggleDrawer = () => setOpen(!open);

  const [config, setConfig] =React.useState({
    lectureDuration: "",
    practicalDuration: "",
    breakDuration: "",
    breakTime: "",
    dayDuration: "",
    includeSaturday: false,
    startTime: "",
  });


  const [subjects, setSubjects] = React.useState([
    { name: "", lectureHours: "", practicalHours: "", teacher: "" },
  ]);

  const clearFields = ()=>{
    setFiles([])
    setTableName('')
    setClasses('')
    setConfig({
      lectureDuration: "",
      practicalDuration: "",
      breakDuration: "",
      breakTime: "",
      dayDuration: "",
      includeSaturday: false,
      startTime: "",
    })
    setSubjects([
      { name: "", lectureHours: "", practicalHours: "", teacher: "" },
    ])
    setselectedClass('classes')
  }
  const handleAddSubject = () => {
    setSubjects([...subjects, { name: "", lectureHours: "", practicalHours: "", teacher: "" }]);
  };

  const handleParseFromUrl = (csvUrl) => {
    if (!processedUrls.includes(csvUrl)) {
      setProcessedUrls((prevUrls) => [...prevUrls, csvUrl]);

    Papa.parse(csvUrl, {
      download: true, // Enable fetching from a remote URL
      header: true, // Assuming your CSV has a header row
      skipEmptyLines: true,
      complete: (results) => {
        const parsedRows = results.data;
        let v = '10:00 - 11:00'

        // Check if the data exists and structure it
        if (parsedRows && parsedRows.length > 0) {
           setTimeSlots(Object.keys(parsedRows[0]).filter(key => key !== 'timeSlots'))
          // Set the parsed data
           setParsedData(results.data);
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
        (item) => item.classCode === currentClass?.toLowerCase()
      );
  
      if (selectedClassData && selectedClassData.timetable?.length > 0) {
        selectedClassData.timetable.forEach((item) => {
          if (item.attachment) {
            handleParseFromUrl(item.attachment);
          }
        });
      }
    }
  }, [joinedClasses,currentClass]);

  useEffect(()=>{
    
    setTimeSlots([])
    setParsedData([])
    setProcessedUrls([])
  },[currentClass])

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
    React.useEffect(() => {
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

  const handleSubmit = () => {
    if (!tableName || !classes) {
      toast.error("Class and files are required.", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }
    axios
      .post(`${baseURL}/api/class/genrate-timetable`, {config,subjects,title:tableName,classCode:classes})
      .then((result) => {
        const message = result.data.message || "Timetable Generated"
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
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

 

  const renderContent = () => {
    if ( selectedClass ==='upload') {
      return (
        <div
        className={`flex justify-center items-center w-full align-middle mt-0 ${
          window.innerWidth < 768 ? "flex-col" : "flex-row"
        }`}
      >
        {/* <img
          src={TimetableImg}
          alt="Timetable"
          className={` ${window.innerWidth < 768 ? "h-42 w-42" : "h-40 w-40"}`}
        /> */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-6 flex flex-col gap-10 mt-16 border rounded-xl"
        >
          <p className="text-center text-lg">Fill All The Fields</p>
  
          {/* Config Fields */}
          <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-3">
            <Input
                  label="Time Table Name" 
                  placeholder="Enter Name"
                  value={tableName}
                  onChange={ (e)=>setTableName(e.target.value) }
              />
                
              <Select 
              label="Your Class" 
              placeholder="Select Class" 
              className="w-full" 
              color="" 
              defaultValue="CS" 
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
          </div>
            <div className="flex flex-row gap-3">
          {/* select options */}
              <Input
                label="Lecture Duration"
                placeholder="Enter duration"
                value={config.lectureDuration}
                onChange={(e) => setConfig({ ...config, lectureDuration: e.target.value })}
              />
              <Input
                label="Practical Duration"
                placeholder="Enter duration"
                value={config.practicalDuration}
                onChange={(e) => setConfig({ ...config, practicalDuration: e.target.value })}
              />
            </div>
            <div className="flex flex-row gap-3">
              <Input
                label="Break Duration"
                placeholder="Enter duration"
                value={config.breakDuration}
                onChange={(e) => setConfig({ ...config, breakDuration: e.target.value })}
              />
              <Input
                label="Break Time"
                placeholder="Enter time"
                value={config.breakTime}
                onChange={(e) => setConfig({ ...config, breakTime: e.target.value })}
              />
            </div>
            <div className="flex flex-row gap-3">
              <Input
                label="Day Duration"
                placeholder="Enter duration"
                value={config.dayDuration}
                onChange={(e) => setConfig({ ...config, dayDuration: e.target.value })}
              />
              <Input
                label="Start Time"
                placeholder="Enter start time"
                value={config.startTime}
                onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
              />
            </div>
            <div className="flex flex-row gap-3">
              <label>
                Include Saturday 
                <Checkbox defaultSelected color="success"
                  type="checkbox"
                  checked={config.includeSaturday}
                  onChange={(e) => setConfig({ ...config, includeSaturday: e.target.checked })}
                />
              </label>
            </div>
          </div>
  
          {/* Subject Fields */}
          <div className="flex flex-col gap-6">
            {subjects.map((subject, index) => (
                
              <div key={index} className="flex flex-row gap-3">
                <Input
                  label="Subject Name"
                  placeholder="Enter subject name"
                  value={subject.name}
                  onChange={(e) => {
                    setMyIndex(index)
                    const updatedSubjects = [...subjects];
                    updatedSubjects[index].name = e.target.value;
                    setSubjects(updatedSubjects);
                  }}
                />
                <Input
                  label="Lecture Hours"
                  placeholder="Enter hours"
                  value={subject.lectureHours}
                  onChange={(e) => {
                    const updatedSubjects = [...subjects];
                    updatedSubjects[index].lectureHours = e.target.value;
                    setSubjects(updatedSubjects);
                  }}
                />
                <Input
                  className={`${isSmallScreen ? 'text-sm' : null} `}
                  label="Practical Hours"
                  placeholder="Enter hours"
                  value={subject.practicalHours}
                  onChange={(e) => {
                    const updatedSubjects = [...subjects];
                    updatedSubjects[index].practicalHours = e.target.value;
                    setSubjects(updatedSubjects);
                  }}
                />
                <Input
                  label="Teacher Name"
                  placeholder="Enter teacher name"
                  value={subject.teacher}
                  onChange={(e) => {                   
                    const updatedSubjects = [...subjects];
                    updatedSubjects[index].teacher = e.target.value;
                    setSubjects(updatedSubjects);
                  }}
                />
              </div>
            ))}
            <div className=" flex-row gap-2x">
                <Button color="success"  className="w-fit mr-4" onClick={handleAddSubject} >
                Add Subject
                </Button>

                <Button
                color="danger"
                onClick={() => removeSubject(myIndex)}
                >
                Remove
                </Button>
            </div>
          </div>
  
          {/* Submit Button */}
          <div className=" flex w-full justify-center ">
            <Button type="submit" className="mt-2 w-fit items-center bg-[#253745] text-white hover:bg-[#11212D]">
                Generate Timetable
            </Button>
          </div>
        </form>
      </div>
      );
    } 
    if (role === "Student" ) {
      if(!currentClass){
        return <div>Please select class to view timetable</div>
      }
      if(parsedData.length < 1 && currentClass){
        return <div>No Timetable Available</div>
      }
      return (
        <div className="p-10">
            <table className="min-h-[400px] w-full bg-white p-4 shadow-lg rounded-lg border border-gray-200">
                <thead className="border">
                  <tr >
                    {timeSlots.map((item) => (
                      <th key={item} className="px-4 py-2 text-left border">{item}</th> // Table headers
                    ))}
                  </tr>
                </thead>
                <tbody >
                  {parsedData.map((item, index) => (
                    <tr key={index} className="border">
                      {timeSlots.map((row) => (
                        <td key={row} className="px-4 py-2 border">{item[row]}</td> // Table data cells
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
      );
    }
    
     if (selectedClass === "classes") {
      return (
        <div className={`flex flex-wrap mt-7 ${isSmallScreen ? 'grid grid-cols-2' : 'grid grid-cols-5'}`}>
            
                <div className="p-2">
                  {
                    createdClasses.map((item)=>(
                      item.timetable.map((urls)=>(
                        <AttendanceCard
                      name={item.classname}
                      date={urls.createdAt}
                      fileUrl={urls.attachment}
                      />
                      ))
                    ))
                  }
                </div>
         </div>


      );
    }
  
    // Fallback for invalid role or unhandled states
    return <div>Please select an action or class from the sidebar.</div>;
  };
  
  return (
    <Box sx={{ display: "flex" }}>
      <ToastContainer/>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ backgroundColor: "#253745" }}>
          {isSmallScreen && (
            <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h4"  sx={{ marginLeft: isSmallScreen ? '22%' : '40%' }}>
            Time Table
          </Typography>
        </Toolbar>
      </AppBar>
     
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            marginTop: isSmallScreen ? "56px" : "64px",
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
                Generate Timetable <MdOutlineAdd />
              </Buttons>
            </ListItem>
          )}
          <Typography variant="h6" sx={{ textAlign: "center", paddingTop: 2 }}>
            Your Classes
          </Typography>
          {role === "Teacher" ?
          <ListItem className="hover:bg-gray-100 cursor-pointer" onClick={()=>{ setselectedClass('classes'), isSmallScreen? toggleDrawer() :null}}>
            <ListItemIcon>
              <img src={user} alt="User Profile" className="w-12 h-12 rounded-full" />
            </ListItemIcon>
            <ListItemText primary="View Timetable" />
          </ListItem>:null}

          {joinedClasses.map((item) => (

               
                <ListItem
                  key={item.classCode}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() =>{
                    setCurrentClass(item.classCode.toLowerCase())
                    setselectedClass('classes')
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
      

      <Main open={open}>
        <Box sx={{ mt: 8 }}>{renderContent()}</Box>
      </Main>
    </Box>
  );
}
