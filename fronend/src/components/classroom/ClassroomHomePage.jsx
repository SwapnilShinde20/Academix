import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  CssBaseline,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { MdOutlineAdd } from "react-icons/md";
import { styled } from "@mui/system";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClassCard from "./ClassCard";
import { addClass } from "../../store/classSlice";
import user from "../../assets/classCards/user.png";
import classBackground from "../../assets/classCards/classbackground.jpg"; // Ensure you have this asset


const drawerWidth = 240;

const StyledAppBar = styled(AppBar)({
  backgroundColor: "#fff",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
});

const Main = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: "100vh",
}));

const focusedOutlineStyle = {
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#11212D",
        borderWidth: "3px",
      },
    },
  },
};

export default function ClassroomHomePage() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  const [open, setOpen] = useState(false);
  const [joinDrawerOpen, setJoinDrawerOpen] = useState(false);
  const [classname, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");
  const [year, setYear] = useState("");
  const [joinId, setJoinId] = useState("");
  const [classes, setClasses] = useState([]);
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const endpoint =
          userData.role === "Teacher"
            ? `${baseURL}/api/class/created-classes`
            : `${baseURL}/api/class/joined-classes`;
        const { data } = await axios.get(endpoint);
        setClasses(data.data.classes || data.data.classArr);
        dispatch(addClass(data.data.classes || data.data.classArr));
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, [userData.role, dispatch]);

  const clearFields = () => {
    setClassName("");
    setSubject("");
    setSection("");
    setYear("");
    setJoinId("");
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!classname || !subject || !section || !year) {
      toast.error("All fields are required!",{autoClose:1500});
      return;
    }

    try {
      const { data } = await axios.post(
        `${baseURL}/api/class/create-class`,
        {
          classname,
          subject,
          section,
          year,
        }
      );
      setClasses((prev) => [...prev, data.data]);
      toast.success(data.message || "Class created!",{autoClose:1500});
      clearFields();
      setJoinDrawerOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create class!",{autoClose:1500});
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinId) {
      toast.error("Class ID is required!",{autoClose:1500});
      return;
    }

    try {
      const { data } = await axios.post(
        `${baseURL}/api/class/join-class`,

        {
          classCode: joinId,
        }
      );
      setClasses((prev) => [...prev, data.data.classroom]);
      toast.success(data.message || "Joined class!",{autoClose:1500});
      clearFields();
      setJoinDrawerOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join class!",{autoClose:1500});
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <ToastContainer />
      <StyledAppBar position="fixed">
        <Toolbar
          sx={{
            backgroundColor: "#253745",
            zIndex: 1,
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpen(!open)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            StudyRoom
          </Typography>
          <Button
          className="hover:bg-[#06141B]"
            variant="contained"
            color="primary"
            sx={{ backgroundColor: "#11212D" }}
            onClick={() => setJoinDrawerOpen(true)}
            startIcon={<MdOutlineAdd />}
          >
            {userData.role === "Teacher" ? "Create Class" : "Join Class"}
          </Button>
        </Toolbar>
      </StyledAppBar>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" ,backgroundColor:"#eef0ef"},
          zIndex: 0,
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {classes.map((cls) => (
            <ListItem key={cls.classCode} disablePadding>
              <ListItemButton
                onClick={() => navigate(`/class/${cls.classCode}`)}
              >
                <ListItemIcon className="mr-3">
                  <img
                    src={user}
                    alt="User Profile"
                    className="w-12 h-12 rounded-full mb-2  border solid white "
                  />
                </ListItemIcon>
                <ListItemText className="text-[#253745]" primary={cls.classname.toUpperCase()} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Main 
      
      sx={{
        backgroundImage: `url(${classBackground})`,
        // backgroundSize: "cover",
        // backgroundPosition: "center",
        
      }}
      >
        <Toolbar />
        <Typography variant="h4" sx={{ marginBottom: 2 }}>
          Welcome,
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 2,
          }}
        >
          {classes.map((cls) => (
            <ClassCard key={cls.classCode} classData={cls} image={user} />
          ))}
        </Box>
      </Main>

      <Drawer
        anchor="right"
        open={joinDrawerOpen}
        onClose={() => setJoinDrawerOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 320, padding: 2 } }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          {userData.role === "Teacher" ? "Create Class" : "Join Class"}
        </Typography>
        <form
          onSubmit={
            userData.role === "Teacher" ? handleCreateClass : handleJoinClass
          }
        >
          {userData.role === "Teacher" && (
            <>
              <TextField
                
                fullWidth
                label="Class Name"
                margin="normal"
                value={classname}
                onChange={(e) => setClassName(e.target.value)}
                sx={focusedOutlineStyle}
              />
              <TextField
                fullWidth
                label="Subject"
                margin="normal"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={focusedOutlineStyle}
              />
              <TextField
                fullWidth
                label="Section"
                margin="normal"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                sx={focusedOutlineStyle}
              />
              <TextField
                fullWidth
                label="Year"
                margin="normal"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                sx={focusedOutlineStyle}
              />
            </>
          )}
          {userData.role === "Student" && (
            <TextField
              fullWidth
              label="Class Code"
              margin="normal"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              sx={{
              "& .MuiOutlinedInput-root": {
                  "&.Mui-focused": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#11212D",
                  borderWidth: "3px",
                },            
            }}}}
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              marginTop: 2,
              backgroundColor: "#253745",
              "&:hover": {
                backgroundColor: "#11212D",
              },
            }}
          >
            {userData.role === "Teacher" ? "Create" : "Join"}
          </Button>
        </form>
      </Drawer>
    </Box>
  );
}
