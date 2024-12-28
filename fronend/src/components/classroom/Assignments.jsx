import React, { useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Announcements({ classData, assignment }) {
  const [fileType, setFileType] = useState("");
  const baseURL = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials = true;


  const formattedDate = new Date(assignment.createdAt).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  useEffect(() => {
    const extension = assignment.attachment.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension)) {
      setFileType("image");
    } else if (["pdf"].includes(extension)) {
      setFileType("pdf");
    } else if (["mp4", "webm", "ogg"].includes(extension)) {
      setFileType("video");
    } else {
      setFileType("unknown");
    }
  }, [assignment.attachment]);

  const downloadFile = () => {
    axios
      .post(`${baseURL}/api/class/download-assignment`, {
        url: assignment.attachment,
      })
      .then(() => {
        toast.success("File downloaded successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
      })
      .catch(() => {
        toast.error("Failed to download the file.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
      });
  };

  const renderPreview = () => {
    switch (fileType) {
      case "image":
        return (
          <img
            className="cursor-pointer h-20 w-20 rounded-lg object-cover"
            onClick={downloadFile}
            src={assignment.attachment}
            alt="Preview"
          />
        );
      case "pdf":
        return (
          <div
            className="cursor-pointer h-36 w-36 relative border rounded-lg overflow-hidden"
            onClick={downloadFile}
          >
            <iframe
              src={assignment.attachment}
              className="absolute top-0 left-0 h-full w-full pointer-events-none"
              title="PDF Preview"
            />
          </div>
        );
      case "video":
        return (
          <video
            className="h-36 w-36 rounded-lg object-cover"
            controls
            src={assignment.attachment}
          />
        );
      case "unknown":
        return <p className="text-gray-500">File format not supported</p>;
      default:
        return null;
    }
  };

  return (
    <div className="mt-4">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-transform transform hover:scale-105">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Avatar
              className="w-12 h-12"
              alt={classData.owner}
              src="/static/images/avatar/1.jpg" // Replace with actual avatar URL
            />
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-800">
                {classData.owner.toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500">Posted an assignment</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">{formattedDate}</div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="text-xl font-medium text-gray-800 mb-3">
            {assignment.title}
          </h4>
          {assignment.attachment && renderPreview()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Class Code: <span className="font-semibold">{classData.classCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Announcements;
