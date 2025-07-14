import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import toastify
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS

function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Add your sign-up logic here (e.g., API call to create a new user)
    
    // Show success toast
    toast.success("Sign up successful!", {
        autoClose: 800, // Timeout duration set to 2 seconds
      });

    // Wait for 2 seconds, then navigate to the SignIn page
    setTimeout(() => {
      navigate("/signin");
    }, 800); // 2-second delay before redirecting
  };

  return (
    <div className="flex items-center justify-center h-screen transition-transform duration-1000">
      <div className="w-full max-w-md p-6 space-y-8 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white">Sign Up</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 text-xl text-white transition-transform duration-1000 bg-gray-700 rounded-lg focus:outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 text-xl text-white transition-transform duration-1000 bg-gray-700 rounded-lg focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 text-xl text-white transition-transform duration-1000 bg-gray-700 rounded-lg focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-3 text-xl font-bold text-white transition-transform duration-1000 bg-blue-600 rounded-lg hover:bg-blue-500"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-white">
          Already have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/signin")}
          >
            Click here to Sign In
          </span>
        </p>
      </div>

      {/* Toast Container to show notifications */}
    
    </div>
  );
}

export default SignUp;
