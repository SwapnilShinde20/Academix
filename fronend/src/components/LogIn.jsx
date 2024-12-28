import React, { useState, useEffect } from "react";
import "boxicons/css/boxicons.min.css";
import StudentLogo from "../assets/studentsImg.png";
import FacultyLogo from "../assets/Faculty.png";
import backgroundImage from "../assets/background2.jpg";
import AcademixLogo from "../assets/academixLogo.png"; // Add your logo image here
import axios from "axios";
import Cookies from "universal-cookie";
import "aos/dist/aos.css";
import AOS from "aos";
import { Link, useNavigate } from "react-router-dom";
import Input from "./Input";
import Button from "./Button";
import { login } from "../store/authSlice";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Loading";
function LogIn() {
  const baseURL = import.meta.env.VITE_BACKEND_URL;
  
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("Student");
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const clearFields = () => {
    setUsername("");
    setPassword("");
  };

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

  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const loginEndpoint =
      role === "Student" ? "student/login" : role === "Teacher" ? "faculty/login" : null;

    if (!loginEndpoint) {
      toast.error("Please select a valid role before logging in.", { autoClose: 3000 });
      setLoading(false);
      return;
    }

    if (!username || !password) {
      toast.error("All fields are required.", { autoClose: 1500 });
      setLoading(false);
      return;
    }

    axios
      .post(`${baseURL}/api/${loginEndpoint}`, {
        username: username.toLowerCase(),
        password,
      })
      .then((result) => {
        if (result.data?.data) {
          const { user } = result.data.data;
          const message = result.data.message;
          toast.success(message || "Login successful!", { autoClose: 1500 });
          dispatch(login(user));
          setTimeout(() => navigate("/home"), 1500);
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Something went wrong!";
        toast.error(errorMessage, { autoClose: 1500 });
      })
      .finally(() => {
        setLoading(false);
        clearFields();
      });
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-[#CCD0CF]">
      <ToastContainer />
      {/* Left Section for Desktop */}
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
          {/* Header with Logo and Name */}
          <div className="text-center mb-8">
            <img src={AcademixLogo} alt="Academix Logo" className="w-16 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-[#4A5C6A]">Academix</h1>
          </div>

          <h2 className="text-2xl font-semibold text-center text-[#4A5C6A] mb-6">{role} Login</h2>
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

            {/* Username Input */}
            <div className="relative">
              <i className="bx bx-user absolute left-3 top-3 text-gray-400"></i>
              <Input
                type="text"
                placeholder="Username"
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CCD0CF]"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <i className="bx bx-lock-alt absolute left-3 top-3 text-gray-400"></i>
              <Input
                type="password"
                placeholder="Password"
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#CCD0CF]"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="text-right">
              <button type="button" className="text-[#4A5C6A] text-sm hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div>
              <Loading show={loading} />
              <Button
                type="submit"
                className="w-full bg-[#4A5C6A] text-white py-2 rounded-md hover:bg-[#253745]"
              >
                Login
              </Button>
            </div>
          </form>

          

          {/* Signup Link */}
          <div className="text-center mt-6">
            <Link to="/signup" className="text-[#4A5C6A] hover:underline">
              Don’t have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogIn;
