import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "../Button"; // Custom button component
import Buttons from "@mui/material/Button";
import { MdOutlineAdd } from "react-icons/md";
import DragAndDropFileUpload from "../dragNdrop/DragNdrop.jsx";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import NoticeCard from "./NoticeCard.jsx";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../Loading.jsx"
import useMediaQuery from "@mui/material/useMediaQuery";

const drawerWidth = 320;

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

export default function Noticeboard() {
  const [loading,setLoading] = React.useState(false)
  const userData = useSelector((state) => state.auth.userData);
  const [open, setOpen] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [role, setRole] = React.useState(userData.role);
  const [classes, setClasses] = React.useState("");
  const [joinedClasses, setJoinedClasses] = React.useState([]);
  const [uploadFiles, setUploadedFiles] = React.useState([]);
  const [createdClasses, setCreatedClasses] = React.useState([]);
  const [files, setFiles] = React.useState([]);
  const baseURL = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials = true;


  const handleFilesUploaded = (files) => {  
    setUploadedFiles(files[0]);
  };
  const isSmallScreen = useMediaQuery("(max-width: 768px)"); // Use media query for small screens

  useEffect(() => {
    if (userData.role === "Teacher") {
      axios
        .get(`${baseURL}/api/class/created-classes`)
        .then((result) => {
          setCreatedClasses(result.data.data.classes);
        })
        .catch((err) => console.log(err));
    } else if (userData.role === "Student") {
      axios
        .get(`${baseURL}/api/class/joined-classes`  )
        .then((result) => {
          setJoinedClasses(result.data.data.classArr);
        })
        .catch((err) => console.log(err));
    }
  }, [createdClasses,joinedClasses]);

  const clearFields = () => {
    setDescription("");
    setUploadedFiles([]);
    setOpen(false)
    setClasses("");
    setFiles([])
    setLoading(false)
    
  };

  const handleChange = (event) => {
    setClasses(event.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!description || !classes) {
      toast.error("Description and Class are required.", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }
    const formData = new FormData();
    formData.append("description", description);
    formData.append("classname", classes);
    formData.append("attachment", uploadFiles);
    setLoading(true)
    axios
      .post(`${baseURL}/api/class/notice`, formData)
      .then((result) => {
        const message = result.data.message || "Notice Created"
        toast.success(message, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        const newNotice = result.data.data;
        
        // Update the state with the new notice
        if (role === "Teacher") {
          setCreatedClasses((prevClasses) => {
            return prevClasses.map((classInfo) =>
              classInfo.classname === classes
                ? { ...classInfo, notice: [newNotice, ...classInfo.notice] }
                : classInfo
            );
          });
        } else if (role === "Student") {
          setJoinedClasses((prevClasses) => {
            return prevClasses.map((classInfo) =>
              classInfo.classname === classes
                ? { ...classInfo, notice: [newNotice, ...classInfo.notice] }
                : classInfo
            );
          });
        }
      clearFields()
      })
      .catch((error) =>{
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
        setLoading(false)
      })
  };
  return (
    <Box sx={{height:"100%", display: "flex" ,backgroundColor:"#CCD0CF" }}>
      <ToastContainer/>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar sx={{  backgroundColor: "#253745" }}>
          {role === "Teacher" && (
            <IconButton
              color="inherit"
              aria-label="open right drawer"
              onClick={() => setOpen(!open)}
              edge="end"
            >
              <Buttons
              className="hover:bg-[#06141B]"
                variant="contained"
                sx={{ fontSize: "15px", backgroundColor: "#11212D" }}
              >
                Post Notice <MdOutlineAdd />
              </Buttons>
            </IconButton>
          )}
          <Typography variant="h4" sx={{ marginLeft: "35%" }}>
            Notice Board
          </Typography>
        </Toolbar>
      </AppBar>

      {role === "Teacher" && (
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              marginTop: isSmallScreen? '85px' : '64px',
            },
          }}
          variant="temporary"
          anchor="left"
          open={open}
          onClose={()=>setOpen(!open)}
        >
          <Divider />
          
          <form
            onSubmit={handleFormSubmit}
            className="pl-5 pr-5 pb-5 flex flex-col"
          >
            <Typography variant="h6" className="pt-2">
            Publish Notice
            </Typography>
            <TextField
              label="Description"
              margin="normal"
              value={description}
              multiline
              onChange={(e) => setDescription(e.target.value)}
            />
            <FormControl sx={{ marginBottom:1, minWidth: 120 }} size="large">
              <InputLabel id="demo-select-small-label">Classes</InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={classes}
                label="select class"
                onChange={handleChange}
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
            </FormControl>
            <DragAndDropFileUpload onFilesUploaded={handleFilesUploaded} files={files} setFiles={setFiles}/>
            <Loading show={loading}/>
            <Button
              type="submit"
              className="w-18 h-8 mt-4 text-white text-sm text-center bg-[#11212D] hover:bg-[#253745]"
            >
              Post Notice
            </Button>
          </form>
        </Drawer>
      )}

      <Main open={open}>
        <Box  sx={{
              mt: 8,
              padding: "16px",
              // Adjust marginLeft for small screens
              // width: "calc(100% - 300px)", // Adjust width to account for marginLeft
            }}>
          <div className="flex flex-col gap-2">
            {userData.role === "Teacher"
              ? createdClasses
                  .flatMap((classInfo) =>
                    classInfo.notice.map((notice) => ({
                      ...notice,
                      owner: classInfo.owner,
                      classname: classInfo.classname,
                    }))
                  )
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt (most recent first)
                  .map((sortedNotice) => (
                    <NoticeCard
                      key={sortedNotice.createdAt}
                      fileUrls={[sortedNotice.attachment]}
                      date={sortedNotice.createdAt}
                      from={sortedNotice.owner}
                      to={sortedNotice.classname}
                      desc={sortedNotice.description}
                    />
                  ))
              : joinedClasses
                  .flatMap((classInfo) =>
                    classInfo.notice.map((notice) => ({
                      ...notice,
                      owner: classInfo.owner,
                      classname: classInfo.classname,
                    }))
                  )
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt (most recent first)
                  .map((sortedNotice) => (
                    <NoticeCard
                      key={sortedNotice.createdAt}
                      fileUrls={[sortedNotice.attachment]}
                      date={sortedNotice.createdAt}
                      from={sortedNotice.owner}
                      to={sortedNotice.classname}
                      desc={sortedNotice.description}
                    />
                  ))}
          </div>
        </Box>
      </Main>
    </Box>
  );
}
