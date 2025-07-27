import React, { useState, useEffect } from "react";
import {
  Trash2,
  Users,
  User,
  AlertCircle,
  Database,
  Calendar,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Added axios import
const backendURL = import.meta.env.VITE_BACKEND_URL;

function DeleteStudents() {
  const navigate = useNavigate();
  const [isBulkMode, setIsBulkMode] = useState(true);
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [rollNoSearchResults, setRollNoSearchResults] = useState([]);
  const [showRollNoDropdown, setShowRollNoDropdown] = useState(false);

  // New state for distinct classes
  const [distinctClasses, setDistinctClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // Function to fetch distinct classes from backend
  const fetchDistinctClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const response = await axios.get(
        `${backendURL}/api/students/distinct-classes`
      );
      if (response.data.success) {
        setDistinctClasses(response.data.classes);
      } else {
        console.error(
          "Failed to fetch distinct classes:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Error fetching distinct classes:", error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // Extract unique values for dropdowns
  const getUniqueYears = () => {
    const years = [...new Set(distinctClasses.map((cls) => cls.yearOfStudy))];
    return years.sort();
  };

  const getUniqueBranches = () => {
    const branches = [...new Set(distinctClasses.map((cls) => cls.branch))];
    return branches.sort();
  };

  const getUniqueSections = () => {
    const sections = [...new Set(distinctClasses.map((cls) => cls.section))];
    return sections.sort();
  };

  // Fetch distinct classes on component mount
  useEffect(() => {
    fetchDistinctClasses();
  }, []);

  // Function to search students by roll number for suggestions
  const searchStudentsByRollNo = async (rollNo) => {
    if (!rollNo.trim()) {
      setRollNoSearchResults([]);
      setShowRollNoDropdown(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${backendURL}/api/students/search/rollno?rollNo=${encodeURIComponent(
          rollNo
        )}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setRollNoSearchResults(data.data);
        setShowRollNoDropdown(true);
      } else {
        setRollNoSearchResults([]);
        setShowRollNoDropdown(false);
      }
    } catch (error) {
      console.error("Error searching by roll number:", error);
      setRollNoSearchResults([]);
      setShowRollNoDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle roll number input change
  const handleRollNoChange = (e) => {
    const value = e.target.value.toUpperCase();
    setRollNo(value);

    // Debounce implementation for roll number search
    const debounceTimeout = setTimeout(() => {
      searchStudentsByRollNo(value);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  };

  // Handle selecting a student from roll number search results
  const handleSelectRollNoStudent = (student) => {
    setRollNo(student.rollNo);
    setShowRollNoDropdown(false);
    setRollNoSearchResults([]);
  };

  const handleBulkDelete = async () => {
    // Optimized validation - only Year is required
    if (!yearOfStudy) {
      setMessage({
        text: "Please select Year for bulk delete.",
        type: "error",
      });
      return;
    }

    // All other combinations are valid:
    // - Year="All" → Delete all students
    // - Year="I", Branch="All" → Delete all I-year students
    // - Year="I", Branch="CSE", Section="All" → Delete all I-CSE students
    // - Year="I", Branch="CSE", Section="A" → Delete I-CSE-A students

    try {
      const res = await fetch(`${backendURL}/api/students/bulk-delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearOfStudy, branch, section }),
      });
      const data = await res.json();
      setMessage({
        text: data.message,
        type: data.success ? "success" : "error",
      });
      // Clear form
      setYearOfStudy("");
      setBranch("");
      setSection("");
    } catch (err) {
      setMessage({ text: "Bulk delete failed.", type: "error" });
    }
  };

  const handleSingleDelete = async () => {
    if (!rollNo) {
      setMessage({
        text: "Roll No is required for single delete.",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(`${backendURL}/api/students/delete/${rollNo}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setMessage({
        text: data.message,
        type: data.success ? "success" : "error",
      });
      // Clear form
      setRollNo("");
      setRollNoSearchResults([]);
      setShowRollNoDropdown(false);
    } catch (err) {
      setMessage({ text: "Single delete failed.", type: "error" });
    }
  };

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate("/update-data")}
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Database size={16} />
              <span>Update Data</span>
            </button>
            <button
              onClick={() => navigate("/delete-student")}
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-800 text-white shadow-sm"
            >
              <Trash2 size={16} />
              <span>Delete Students</span>
            </button>
            <button
              onClick={() => navigate("/update-year")}
              className="px-3 py-1.5 rounded-md flex items-center space-x-2 text-sm transition-colors bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Calendar size={16} />
              <span>Update Year</span>
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="px-4 py-4 mb-6 text-white rounded-xl shadow-lg sm:px-6 sm:py-6 sm:mb-8 bg-slate-800">
          <h1 className="flex items-center text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
            <Trash2 className="mr-2 sm:mr-3" size={24} />
            <span className="sm:hidden">Delete Students</span>
            <span className="hidden sm:inline">Delete Students</span>
          </h1>
        </div>

        {/* Main Content */}
        <div className=" bg-white shadow-md rounded-xl min-h-[400px]">
          {/* Toggle Controls */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <span className="font-medium text-gray-700">Delete Mode:</span>
              <div className="flex overflow-hidden rounded-md border border-gray-300">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkMode(true);
                    setMessage({ text: "", type: "" });
                    setRollNoSearchResults([]);
                    setShowRollNoDropdown(false);
                  }}
                  className={`px-4 py-2 ${
                    isBulkMode
                      ? "text-white bg-slate-800"
                      : "text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  <Users className="inline-block mr-2 w-4 h-4" />
                  Bulk Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkMode(false);
                    setMessage({ text: "", type: "" });
                    setRollNoSearchResults([]);
                    setShowRollNoDropdown(false);
                  }}
                  className={`px-4 py-2 ${
                    !isBulkMode
                      ? "text-white bg-slate-800"
                      : "text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  <User className="inline-block mr-2 w-4 h-4" />
                  Single Delete
                </button>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {message.text && (
            <div
              className={`mx-6 my-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center">
                <AlertCircle className="mr-2 w-5 h-5" />
                <p>{message.text}</p>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="p-6">
            {isBulkMode ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Year of Study
                    </label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      disabled={isLoadingClasses}
                      className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-gray-200"
                    >
                      <option value="">
                        {isLoadingClasses ? "Loading..." : "Select Year"}
                      </option>
                      <option value="All">All Years</option>
                      {getUniqueYears().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={isLoadingClasses || yearOfStudy === "All"}
                      className={`px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                        isLoadingClasses || yearOfStudy === "All"
                          ? "bg-gray-200 cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <option value="">
                        {isLoadingClasses ? "Loading..." : "Select Branch"}
                      </option>
                      <option value="All">All Branches</option>
                      {getUniqueBranches().map((branchOption) => (
                        <option key={branchOption} value={branchOption}>
                          {branchOption}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Section
                    </label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      disabled={
                        isLoadingClasses ||
                        yearOfStudy === "All" ||
                        branch === "All"
                      }
                      className={`px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                        isLoadingClasses ||
                        yearOfStudy === "All" ||
                        branch === "All"
                          ? "bg-gray-200 cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <option value="">
                        {isLoadingClasses ? "Loading..." : "Select Section"}
                      </option>
                      <option value="All">All Sections</option>
                      {getUniqueSections().map((sectionOption) => (
                        <option key={sectionOption} value={sectionOption}>
                          {sectionOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleBulkDelete}
                    disabled={!yearOfStudy}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      !yearOfStudy
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <Trash2 className="inline-block mr-2 w-4 h-4" />
                    Delete Students
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative space-y-6">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={handleRollNoChange}
                    placeholder="Enter Roll Number"
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                {/* Roll number search dropdown - full width of card */}
                {showRollNoDropdown && rollNoSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 z-10 mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-[300px] w-full">
                    {rollNoSearchResults.map((student, index) => (
                      <div
                        key={index}
                        className="flex justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectRollNoStudent(student)}
                      >
                        <div>
                          <div className="text-base font-medium">
                            {student.rollNo}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {student.name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.yearOfStudy}-{student.branch}-
                          {student.section}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleSingleDelete}
                    disabled={!rollNo}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      !rollNo
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <Trash2 className="inline-block mr-2 w-4 h-4" />
                    Delete Student
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteStudents;
