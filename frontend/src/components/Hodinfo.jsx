import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { toast } from "react-toastify";
import StudentDetailCard from "./StudentDetailCard";

const Hodinfo = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailCardOpen, setIsDetailCardOpen] = useState(false);

  const authToken = sessionStorage.getItem("authToken");

  if (!authToken) {
    toast.error("Authorization token is missing. Please log in again.", {
      autoClose: 800,
    });
    return null;
  }

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fetch all dashboard data in one optimized call
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const backendURL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(
        `${backendURL}/api/attendance/hod-dashboard`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: { date },
        }
      );

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError("Failed to fetch dashboard data");
        toast.error("Failed to load dashboard data", { autoClose: 800 });
      }
    } catch (err) {
      setError("Error fetching dashboard data");
      toast.error("Failed to load dashboard data", { autoClose: 800 });
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [date]);

  // Clear expanded state when date changes
  useEffect(() => {
    setExpandedIndex(null);
  }, [date]);

  const handleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const handleStudentClick = (student, course) => {
    setSelectedStudent({
      ...student,
      yearOfStudy: course.yearOfStudy,
      branch: course.branch,
      section: course.section,
    });
    setIsDetailCardOpen(true);
  };

  const closeDetailCard = () => {
    setIsDetailCardOpen(false);
    setSelectedStudent(null);
  };

  // Helper function to get card color based on leave count
  const getCardColor = (leaveCount) => {
    if (leaveCount >= 4) return "bg-red-600 hover:bg-red-700";
    if (leaveCount >= 2) return "bg-yellow-600 hover:bg-yellow-700";
    return "bg-green-600 hover:bg-green-700";
  };

  // Helper function to get badge color based on leave count
  const getBadgeColor = (leaveCount) => {
    if (leaveCount >= 4) return "bg-white text-red-600";
    if (leaveCount >= 2) return "bg-white text-yellow-600";
    return "bg-white text-green-600";
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-50">
      {/* Main HOD Information Box */}
      <div className="p-8 mb-6 w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center text-white">
          Dashboard
        </h1>

        {/* Date Selection */}
        <div className="flex justify-center items-center pb-5">
          <div className="w-full max-w-sm">
            <label
              htmlFor="date"
              className="block mb-2 text-lg font-medium text-center text-white"
            >
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-lg divide-y divide-gray-200 shadow">
          {isLoading ? (
            <div className="p-8 text-lg text-center text-gray-600">
              <div className="flex justify-center items-center space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-blue-500 animate-spin border-t-transparent"></div>
                <span>Loading dashboard data...</span>
              </div>
            </div>
          ) : dashboardData.length === 0 ? (
            <div className="p-8 text-lg text-center text-gray-600">
              No classes found.
            </div>
          ) : (
            dashboardData.map((course, idx) => (
              <div key={idx}>
                <div
                  className="flex justify-between items-center px-6 py-4 transition cursor-pointer hover:bg-gray-100"
                  onClick={() => handleExpand(idx)}
                >
                  <div className="text-lg font-semibold text-gray-800">
                    {course.yearOfStudy} - {course.branch} - {course.section}
                  </div>
                  <div className="flex gap-3 items-center">
                    {course.status === "not_marked" ? (
                      <div className="text-lg font-semibold text-red-500">
                        Not Marked
                      </div>
                    ) : (
                      <div className="flex gap-1 items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Count:
                        </span>
                        <span className="text-lg font-semibold text-gray-800">
                          {course.absentStudents.length}
                        </span>
                      </div>
                    )}
                    <div>
                      {expandedIndex === idx ? (
                        <BsChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <BsChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
                {expandedIndex === idx && (
                  <div className="px-2 pb-6 sm:px-8">
                    {course.status === "not_marked" ? (
                      <div className="py-4 font-semibold text-center text-red-500">
                        Attendance not marked for this class.
                      </div>
                    ) : course.absentStudents.length > 0 ? (
                      <div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-3 sm:gap-x-2 sm:gap-y-2 md:grid-cols-4 md:gap-x-2 md:gap-y-2 lg:grid-cols-5 lg:gap-x-2 lg:gap-y-2 xl:grid-cols-6 xl:gap-x-2 xl:gap-y-2 2xl:grid-cols-8 2xl:gap-x-2 2xl:gap-y-2">
                          {course.absentStudents.map((student, i) => (
                            <div
                              key={i}
                              onClick={() =>
                                handleStudentClick(student, course)
                              }
                              className={`relative flex justify-center items-center p-3 font-semibold text-white rounded-lg shadow-md transition-all duration-300 transform cursor-pointer hover:scale-105 w-full min-h-[80px] ${getCardColor(
                                student.leaveCount
                              )}`}
                            >
                              <div className="text-center">
                                <div className="text-sm font-bold">
                                  {student.name}
                                </div>
                                <div className="text-sm">{student.rollNo}</div>
                              </div>
                              <span
                                className={`absolute bottom-1 right-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getBadgeColor(
                                  student.leaveCount
                                )}`}
                              >
                                {student.leaveCount}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-500">
                        No absentees found for this class.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>

      {/* Student Detail Card */}
      <StudentDetailCard
        student={selectedStudent}
        isOpen={isDetailCardOpen}
        onClose={closeDetailCard}
      />
    </div>
  );
};

export default Hodinfo;
