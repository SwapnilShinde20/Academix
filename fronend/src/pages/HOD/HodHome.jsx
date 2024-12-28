import React, { useState } from 'react';
import Card from '../../components/Card'; 
import { useDispatch, useSelector } from 'react-redux';
import {
  teacherAttendance, ClassListLogo, CreateClass, TimetableLogo,
NotifyLogo, ResultLogo, ProfileLogo, BookLogo ,sideBarLogo,studentAttendance
} from '../../assets/HodHomePageLogo';
import AcademixLogo from "../../assets/academixLogo.png"; // Add your logo image here
import { useNavigate } from 'react-router';
import "boxicons/css/boxicons.min.css";
import { RxCross2 } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import axios from 'axios';
import { IoCameraOutline, IoCloseSharp } from "react-icons/io5";
import {Input} from "@nextui-org/react";
import { FaUserEdit } from "react-icons/fa";
import { login, logout } from '../../store/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false); // State for right drawer
  const userData = useSelector(state => state.auth.userData);
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState({ username: false, email: false });
  const [formData, setFormData] = useState({
    username: userData.username,
    email: userData.email,
  });
  const baseURL = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials = true;



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const updateProfile = (e)=>{
    const profile = e.target.files[0]
    const setProfileEndpoint =
    userData.role === "Student" ? "student/profile" : userData.role === "Teacher" ? "faculty/profile" : null;
    const form=new FormData();
    form.append("profile",profile)
    if (profile) {
      axios
        .patch(`${baseURL}/api/${setProfileEndpoint}`, 
            form
        )
        .then((result) => {
          if (result.data?.data) {
            const  user  = result.data.data;
            const message = result.data.message;
            toast.success(message,{autoClose:1500})
            dispatch(login(user))
          }
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.message || "Something went wrong!";
          toast.error(errorMessage,{autoClose:1500})
 
        })
    }

  }
  const handleSubmit = (e) => {
    e.preventDefault();
    const updateEndpoint =
      userData.role === "Student" ? "student/update-account" : userData.role === "Teacher" ? "faculty/update-account" : null;

    if (!updateEndpoint) {
      toast.error("Please select a valid role before logging in.", { autoClose: 3000 });
      return;
    }

    axios
      .patch(`${baseURL}/api/${updateEndpoint}`, {
        username: formData.username.toLowerCase(),
        email:formData.email,
      })
      .then((result) => {
        if (result.data?.data) {
          const  user = result.data.data;
          const message = result.data.message || "Profile updated";
          toast.success(message,{autoClose:1500})
          dispatch(login(user))
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Something went wrong!";
        toast.error(errorMessage,{autoClose:1500})
      })      
      .finally(()=>{
        setIsEditing((prev) => ({ ...prev, username: false,email:false }))
      })
  };

  const navItems = [
    { name: "Create Class", slug: "/classroom", logo: CreateClass, active: true, roles: ["Teacher"] },
    { name: "Join Class", slug: "/classroom", logo: CreateClass, active: true, roles: ["Student"] },
    { name: "Class List", slug: "/classroom", logo: ClassListLogo, active: true, roles: ["Teacher", "Student"] },
    { name: "Attendance", slug: "/attendance", logo: userData.role ==="Teacher" ? teacherAttendance : studentAttendance, active: true, roles: ["Teacher", "Student"] },
    // { name: "Exam", slug: "/exam", logo: ExamLogo, active: true, roles: ["Teacher", "Student"] },
    { name: "Timetable", slug: "/timetable", logo: TimetableLogo, active: true, roles: ["Teacher", "Student"] },
    // { name: "Homework", slug: "/homework", logo: HomeworkLogo, active: true, roles: ["Teacher", "Student"] },
    { name: "Notice", slug: "/notice", logo: NotifyLogo, active: true, roles: ["Teacher", "Student"] },
    { name: "Test Result", slug: "/exam-result", logo: ResultLogo, active: true, roles: ["Teacher", "Student"] },
  ];

  const renderArr = userData && userData.role
    ? navItems.filter(item => item.roles.includes(userData.role))
    : [];

  const handleLogout = () => {
    const endpoint = userData.role === "Student" ? '/student/logout' : '/faculty/logout';
    axios.post(`${baseURL}/api${endpoint}`)
      .then(result => {
        console.log(result);
        dispatch(logout())
        navigate('/');
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#9BA8AB] md:flex-row">
      <ToastContainer/>
      {/* Sidebar Toggle Button for Mobile */}
      <button
        className={`md:hidden p-4 text-gray-600 focus:outline-none ml-${setDrawerOpen == true ? '20' : 0 }`}
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        
      >
        <img src={sideBarLogo} alt="Menu" className="w-8 h-8" />
      </button>

      {/* Sidebar */}
      {isDrawerOpen ? null : 
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#11212D] min-h-screen shadow-2xl transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:translate-x-0`}
      >
        {/* Sidebar Header */}
       
        <div className="flex px-4 pt-4 justify-between">
          <div className='flex items-center'>
            <img className="w-8 h-8 md:w-12 md:h-12 mr-3" src={AcademixLogo} alt="College Logo" />
            <h1 className="text-[#eef0ef] font-bold text-lg md:text-xl">ACADEMIX</h1>
          </div>
          <button className='md:hidden' onClick={() => setSidebarOpen(false)}>
            <RxCross2 className="text-white w-8 h-8 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"/>
          </button>
        </div>
      

        {/* Navigation Menu */}
        <nav className="mt-6">
          <ul className="space-y-2">
            {renderArr.map((item) =>
              item.active ? (
                <li
                  key={item.name}
                  className="flex items-center px-4 md:px-6 py-3 text-[#eef0ef] transition-transform transform hover:scale-105 hover:bg-gray-700 hover:shadow-md rounded-lg cursor-pointer"
                  onClick={() => {
                    navigate(item.slug);
                    setSidebarOpen(false);  // Close sidebar on navigation
                  }}
                >
                  <img className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4" src={item.logo} alt={`${item.name}-logo`} />
                  <span className="text-sm md:text-md font-medium">{item.name}</span>
                </li>
              ) : null
            )}
          </ul>
        </nav>
      </div>
      }
      
      {/* Main Content Section */}
      <div className="flex flex-col w-full p-4 md:p-6">
        
        {/* Header Section */}
        <div className="bg-[#eef0ef] rounded-lg shadow-md p-4 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-gray-700">{userData?.role || "Guest"}</h1>
            <h2 className="text-md md:text-lg text-gray-500">{userData?.username.toUpperCase() || "Guest User"}</h2>
          </div>
          <div className="flex items-center gap-x-3 md:gap-x-4 mt-4 md:mt-0">
            <img
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#9BA8AB] cursor-pointer hover:scale-105 transition-transform duration-200 object-cover"
              src={userData.profile || ProfileLogo}  
              alt="profile"
              onClick={() => setDrawerOpen(!isDrawerOpen)}  // Toggle drawer
            />
            <FiLogOut onClick={handleLogout} className="cursor-pointer w-6 h-6 md:w-8 md:h-8 opacity-70 hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {renderArr.map((item, index) =>
            item.active ? (
              <Card
                key={index}
                label={item.name}
                logo={item.logo}
                slug={item.slug}
                className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center justify-center 
                          transform transition-transform hover:scale-105 hover:shadow-2xl duration-200"
              />
            ) : null
          )}
        </div>
      </div>

      {/* Right Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-64 bg-white shadow-2xl transition-transform duration-300 transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
            <div className="p-4">
            <IoCloseSharp className='text-[#4A5C6A] hover:text-[#253745] cursor-pointer' size={25} onClick={()=>setDrawerOpen(!isDrawerOpen)} />
              <h2 className="text-xl font-bold text-[#4A5C6A] ml-9">  Profile Settings</h2>
              <div className="flex justify-center flex-col items-center mt-4 relative">
              {/* Profile Image with Hover Icon */}
              <div className="relative group w-36 h-36">
                <img
                  src={userData.profile || ProfileLogo} // Use a default image if none is set
                  alt="your profile"
                  className="w-36 h-36 rounded-full border border-[#253745] shadow-lg object-cover"
                />
                <p className="text-[#4A5C6A] font-bold text-lg mt-0 ml-4 mt-2">{userData?.username.toUpperCase()}</p>
                {/* Update Icon on Hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ">
                  <label className="text-white cursor-pointer">
                    <IoCameraOutline size={24} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={updateProfile}

                    />
                  </label>
                </div>
              </div>

                <form 
                action="" 
                className="mt-14 space-y-4"
                onSubmit={handleSubmit}
              >
                {/* Username Section */}
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    {isEditing.username ? (
                      <Input
                        type="text"
                        variant="underlined"
                        label="Change Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    ) : (
                          <Input
                              isReadOnly
                              type="text"
                              label="Username"
                              variant="bordered"
                              className="max-w-xs"
                              value={userData.username}
                          />          
                        )}

                  </div>
                  <button
                    type="button"
                    className="text-[#4A5C6A] hover:text-[#253745] focus:outline-none"
                    onClick={() => setIsEditing((prev) => ({ ...prev, username: !prev.username }))}
                  >
                    <FaUserEdit size={20} />
                  </button>
                </div>

                {/* Email Section */}
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    {isEditing.email ? (
                      <Input
                        type="email"
                        variant="underlined"
                        label="Change Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    ) : (
                      <Input
                              isReadOnly
                              type="text"
                              label="Email"
                              variant="bordered"
                              className="max-w-xs"
                              value={userData.email}
                          /> 
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-[#4A5C6A] hover:text-[#253745] focus:outline-none"
                    onClick={() => setIsEditing((prev) => ({ ...prev, email: !prev.email }))}
                  >
                    <FaUserEdit size={20} />
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-4">
                  <button
                    type="submit"
                    className="bg-[#4A5C6A] text-white px-4 py-2 rounded-md hover:bg-[#253745] focus:outline-none"
                  >
                    Update
                  </button>
                </div>
              </form>


            </div>
            
          </div>
      </div>
    </div>
  );
}

export default Home;
