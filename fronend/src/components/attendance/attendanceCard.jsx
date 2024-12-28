import React from "react";
import filelogo from "../noticeboard/filelogo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import { MdOutlineFileDownload } from "react-icons/md";

function AttendanceCard({ date, name, fileUrl }) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const baseURL = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials = true;


  const downloadFile = () => {
    axios
      .post(`${baseURL}/api/class/download-assignment`, {
        url: fileUrl,
      })
      .then((result) => {
        if (result.data.data) {
          toast.success("File downloaded successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
          // window.open(fileUrl);
        }
      })
      .catch(() => {
        toast.error("Failed to download the file.", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <>
    <ToastContainer />
    <Card      
      sx={{
        maxWidth: 200,
        margin: 2,
        boxShadow: 3,
        cursor: "pointer",
        "&:hover": { boxShadow: 6, transform: "scale(1.05)" },
      }}
    >
     
      <CardMedia
        component="img"
        image={filelogo}
        alt="File Logo"
        
        sx={{ height: 80, objectFit: "contain", padding: 2 }}
      />
      
      <CardContent>
        <Typography variant="h6" align="center">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Date: {formattedDate}
        </Typography>
      </CardContent>
      <div className=" flex justify-center border" onClick={downloadFile}>
      <MdOutlineFileDownload className=" w-8 h-8"  />
      </div>
    </Card>
    </>

  );
}

export default AttendanceCard;
