import React, { useState, useEffect } from "react";
import "boxicons/css/boxicons.min.css";
import StudentLogo from "../assets/studentsImg.png";
import FacultyLogo from "../assets/Faculty.png";
import backgroundImage from "../assets/background2.jpg";
import AcademixLogo from "../assets/academixLogo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Input from "./Input";
import Button from "./Button";
import Loading from "./Loading";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login } from "../store/authSlice";

function SignUp() {
  const [role, setRole] = useState("Student");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [images, setImages] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials = true;


  const switchImage = () => {
    switch (role) {
      case "Teacher":
        return FacultyLogo;
      case "Student":
        return StudentLogo;
      default:
        return StudentLogo;
    }
  };

  const handleImages = (e) => {
    setImages(Array.from(e.target.files));
  };

  const clearFields = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setImages([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true)
    if (role === "Student") {
      setLoading(true);
      if (!username || !email || !password || !images) {
        toast.error("All fields are required.", {
          position: "top-right",
          autoClose: 1500,
        });
        setLoading(false);
        return;
      }
      toast.info("Please be patient! Registration may take a few moments as we process your images.", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      const formData = new FormData();
      formData.append("username", username.toLowerCase());
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);

      images.forEach((image, index) => {
        formData.append("photo", image);
      });
      axios
        .post(`${baseURL}/api/student/register`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result) => {
          
          if (result.data.data) {
            
            toast.success(result.data.message, {
              position: "top-right",
              autoClose: 1500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });

            setTimeout(() => {
              dispatch(login(result.data.data));
              navigate("/home");
            }, 1500);
          }
        })
        .catch((error) => {
          // Display error toast
          const errorMessage =
            error.response?.data?.message || "Something went wrong!";
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
        .finally(() => {
          setLoading(false);
          clearFields();
        });
    } else if (role === "Teacher") {
      setLoading(true);
      if (!username || !email || !password) {
        toast.error("All fields are required.", {
          position: "top-right",
          autoClose: 1500,
        });
        setLoading(false);
        return;
      }

      axios
        .post(`${baseURL}/api/faculty/register`, {
          username: username.toLowerCase(),
          email: email,
          password: password,
          role,
        })
        .then((result) => {
          if (result.data.data) {
            toast.success(result.data.message, {
              position: "top-right",
              autoClose: 1500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setTimeout(() => {
              dispatch(login(result.data.data));
              navigate("/home");
            }, 1500);
          }
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.message || "Something went wrong!";
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
        .finally(() => {
          setLoading(false);
          clearFields();
        });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-[#CCD0CF]">
      <ToastContainer />
      {/* Left Section */}
      <div
        className="hidden lg:flex w-1/3 flex-col justify-center items-center bg-cover bg-center bg-white shadow-md"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <img src={switchImage()} alt={role} className="w-2/3 mb-6" />
        <div className="flex flex-col space-y-4">
          {["Student", "Teacher"].map((item) => (
            <button
              key={item}
              className={`px-6 py-2 rounded-full border ${
                role === item
                  ? "bg-[#253745] text-white border-[#06141B]"
                  : "bg-[#CCD0CF] text-gray-600 border-[#06141B]"
                } hover:bg-[#4A5C6A] hover:text-white`}
              onClick={() => setRole(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-2/3 xl:w-1/2">
          <div className="text-center mb-8">
            <img src={AcademixLogo} alt="Academix Logo" className="w-16 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-[#4A5C6A]">Academix</h1>
          </div>

          <h2 className="text-2xl font-semibold text-center text-[#4A5C6A] mb-6">
            {role} Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
           {/* Role Selection for Mobile */}
           <div className="lg:hidden space-y-2">
              <label htmlFor="role" className="block text-gray-600 text-sm font-medium">
                Select Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>
            {/* Username */}
            <div className="relative">
              <i className="bx bx-user absolute left-3 top-3 text-gray-400"></i>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CCD0CF]"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <i className="bx bx-envelope absolute left-3 top-3 text-gray-400"></i>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CCD0CF]"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <i className="bx bx-lock-alt absolute left-3 top-3 text-gray-400"></i>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CCD0CF]"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Image Upload for Students */}
            {role === "Student" && (
              <div>
                <label
                  htmlFor="images"
                  className="block text-[#4A5C6A] text-sm font-medium mb-2"
                >
                  Upload at least 3 images
                </label>
                <Input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none"
                  onChange={handleImages}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="w-16 h-16 object-cover border rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <Loading show={loading} />
              <Button
                type="submit"
                className="w-full bg-[#4A5C6A] text-white py-2 rounded-md hover:bg-[#253745]"
              >
                Register
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center text-[#4A5C6A] mt-6">
            <p>
              Already have an account?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-[#253745] cursor-pointer hover:underline"
              >
                Log in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
