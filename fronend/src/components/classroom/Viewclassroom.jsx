import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import axios from "axios";
import "boxicons/css/boxicons.min.css";
import { Avatar, Button, TextField } from "@mui/material";
import Announcements from "./Assignments";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import user from "../../assets/classCards/user.png";

function Viewclassroom() {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [active, setActive] = useState("assignment");
  const [students, setStudents] = useState([]);
  const { classId } = useParams();
  const classData = useSelector((state) => state.class.classData);
  const userData = useSelector((state) => state.auth.userData);
  const [classInfo, setClassInfo] = useState({});
  const baseURL = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials = true;


  useEffect(() => {
    if (classData && classData.length > 0) {
      const classDetails = classData.find((item) => item.classCode === classId);
      setClassInfo(classDetails || {});
    }
  }, [classData, classId]);

  useEffect(() => {
    axios
      .post(`${baseURL}/api/class/joined-students`, { classCode: classId })
      .then((result) => {
        setStudents(result.data.data.students);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Something went wrong!";
        toast.error(errorMessage, { autoClose: 1500 });
      });
  }, [classId]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("title", inputValue);
    formData.append("classCode", classId);
    formData.append("attachment", image);

    axios
      .post(`${baseURL}/api/class/post-assignment`, formData)
      .then((result) => {
        const message = result.data.data.message
        // toast.success(message || "Assignment Posted!",
        //   { 
        //   position: "top-right",
        //   autoClose: 1500,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,});
        setClassInfo(result.data.data);
      })
      .catch((error) => {
        // const errorMessage = error.response?.data?.message || "Something went wrong!";
        // toast.error(errorMessage, { autoClose: 1500 });
      });
    setShowInput(false);
    setImage(null);
    setInput("");
  };

  const renderComponent = () => {
    switch (active) {
      case "assignment":
        return (
          <div className="mt-4">
            {userData.role === "Teacher" && (
              <div className="shadow-md rounded-md overflow-hidden mb-6">
                <div className="p-5 bg-white">
                  {showInput ? (
                    <form className="flex flex-col gap-4">
                      <TextField
                        label="Announce Something to Class"
                        variant="filled"
                        multiline
                        value={inputValue}
                        onChange={(e) => setInput(e.target.value)}
                      />
                      <div className="flex justify-between items-center gap-4">
                        <input type="file" onChange={handleChange} />
                        <div className="flex gap-2">
                          <Button onClick={() => setShowInput(false)}>Cancel</Button>
                          <Button onClick={handleUpload} color="primary" variant="contained">
                            Post
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => setShowInput(true)}
                    >
                      <Avatar />
                      <div className="ml-4 font-medium text-gray-600">Post Assignment</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {classInfo.assignment  &&
              [...classInfo.assignment]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((item, index) => (
                  <Announcements key={index} assignment={item} classData={classInfo} />
                ))}
          </div>
        );
      case "students":
        return (
          <div className=" justify-around bg-white rounded-lg shadow p-6 max-h-96 overflow-y-auto mt-4">
            <div className=" flex flex-col  items-center ">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Teacher</h2>
              <ul className=" pl-5 mb-4">
                <div className="flex justify-start  gap-2 items-center">
                  <img src={user} alt="" className=" rounded-full h-10 w-10 border border-stone-950" />
                  <li>{classInfo.owner?.toUpperCase()}</li>
                </div>
              </ul>
            </div>
            <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Students</h2>
                  <ul className="grid grid-cols-4 gap-4">
                    {students.map(
                      (student) =>
                        student && (
                          <div
                            key={student?.username}
                            className="flex gap-2 mt-1 items-center border rounded-xl border-stone-500 bg-[#253745] text-white p-2"
                          >
                            <img
                              src={user}
                              alt=""
                              className="rounded-full h-10 w-10 border border-stone-950"
                            />
                            <li>{student?.username.toUpperCase()}</li>
                          </div>
                        )
                    )}
                  </ul>
                </div>

            </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
    <ToastContainer/>
    <div className="bg-[#CCD0CF] min-h-screen">
      <nav className="w-full bg-[#4A5C6A] shadow-lg py-4 px-6">
        
          <span className="text-[#eef0ef] font-bold text-2xl">StudyRoom</span>
        
      </nav>

      <div className="max-w-5xl mx-auto mt-8 p-4">
        <div className="bg-[#4A5C6A] text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-semibold">{classInfo.classname?.toUpperCase()}</h1>
          <p className="text-lg">{classInfo.section?.toUpperCase()}</p>
          <p className="text-sm mt-2">
            Class Code: <span className="font-mono">{classInfo.classCode}</span>
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex gap-12 justify-center">
              <span
                className={`cursor-pointer ${
                  active === "assignment" ? "font-bold text-[#4A5C6A]" : "text-gray-500"
                }`}
                onClick={() => setActive("assignment")}
              >
                <i className="bx bx-clipboard mr-2"></i>Assignment
              </span>
              <span
                className={`cursor-pointer ${
                  active === "students" ? "font-bold text-[#4A5C6A]" : "text-gray-500"
                }`}
                onClick={() => setActive("students")}
              >
                <i className="bx bxs-user mr-2"></i>Students
              </span>
            </div>
          </div>
        </div>
          {renderComponent()}
      </div>
    </div>
    </>

  );
}

export default Viewclassroom;
