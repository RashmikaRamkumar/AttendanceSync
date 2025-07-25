import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendURL = import.meta.env.VITE_BACKEND_URL;

function DutyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showGenerateMessageButton, setShowGenerateMessageButton] =
    useState(false);

  const [date, setDate] = useState(
    location.state?.selectedDate || new Date().toISOString().split("T")[0]
  );
  const [rollNumbers, setRollNumbers] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedRollNumbers, setSelectedRollNumbers] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [yearOfStudy, setYearOfStudy] = useState("nan");
  const [section, setSection] = useState("nan");
  const [branch, setBranch] = useState("nan");
  const [selectedCourse, setSelectedCourse] = useState("");

  // New state for distinct classes
  const [distinctClasses, setDistinctClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

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
      toast.error("Failed to load class options", { autoClose: 3000 });
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

  useEffect(() => {
    // Clear selected roll numbers whenever year, branch, section, or date changes
    setSelectedRollNumbers([]);

    console.log("Triggering immediate fetch...");
    if (
      yearOfStudy !== "nan" &&
      branch !== "nan" &&
      section !== "nan" &&
      date
    ) {
      fetchRollNumbers(yearOfStudy, branch, section, date);
    } else {
      setRollNumbers([]);
    }
  }, [yearOfStudy, branch, section, date]);

  const fetchRollNumbers = async (
    yearOfStudy,
    branch,
    section,
    selectedDate
  ) => {
    setSelectedCourse(`${yearOfStudy}-${branch}-${section}`);
    const url = `${backendURL}/api/students/remaining?yearOfStudy=${yearOfStudy}&branch=${branch}&section=${section}&date=${selectedDate}`;

    try {
      const response = await axios.get(url);
      const { students, totalStudents } = response.data;
      const formattedDate = formatDate(selectedDate);

      if (totalStudents === 0) {
        setMessage(
          `No record found for ${yearOfStudy} - ${branch} - ${section}.`
        );
        setRollNumbers([]);
        return;
      }

      if (students.length === 0) {
        setMessage(
          `For ${yearOfStudy} - ${branch} - ${section}, students attendance for ${formattedDate} has already been marked.`
        );
        setRollNumbers([]);
        return;
      }

      setMessage("");
      const fetchedRollNumbers = students.map((student) => ({
        rollNo: student.rollNo,
        name: student.name,
        isSelected: false,
      }));
      setRollNumbers(fetchedRollNumbers);
    } catch (error) {
      console.error("Error fetching roll numbers:", error);
      setMessage(
        "An error occurred while fetching roll numbers. Please try again later."
      );
      setRollNumbers([]);
      toast.error("Error fetching roll numbers. Please try again later.", {
        autoClose: 800,
      });
    }
  };

  const toggleSelection = (index) => {
    const rollNo = rollNumbers[index].rollNo;
    setRollNumbers((prevRollNumbers) =>
      prevRollNumbers.map((rollNumber, i) => {
        if (i === index) {
          const updatedSelection = !rollNumber.isSelected;

          setSelectedRollNumbers((prevSelected) => {
            if (updatedSelection) {
              if (!prevSelected.includes(rollNo)) {
                return [...prevSelected, rollNo];
              }
            } else {
              return prevSelected.filter((rollNoItem) => rollNoItem !== rollNo);
            }
            return prevSelected;
          });

          return { ...rollNumber, isSelected: updatedSelection };
        }
        return rollNumber;
      })
    );
  };

  const navigateToHome = () => {
    // Close the card before navigating
    navigate("/homePage"); // Navigate to home page
  };

  const handleConfirm = async () => {
    if (selectedRollNumbers.length === 0) {
      toast.info("0 Students are Marked as On Duty", {
        position: "top-right",
        autoClose: 800,
      });
      setShowGenerateMessageButton(true);
      setTimeout(() => {
        setIsConfirmed(false);
      }, 800);
      return;
    }

    const payload = {
      rollNumbers: selectedRollNumbers,
      date,
      yearOfStudy,
      branch,
      section,
    };

    try {
      const response = await axios.post(
        `${backendURL}/api/attendance/onDuty`,
        payload
      );
      if (response.status === 200) {
        toast.success(
          `${selectedRollNumbers.length} students marked as On Duty`,
          {
            autoClose: 800,
          }
        );
        setIsConfirmed(false);
        setSelectedRollNumbers([]);
        await fetchRollNumbers(yearOfStudy, branch, section, date);

        setShowGenerateMessageButton(true);
        // Clear selected roll numbers

        // Await the fetchRollNumbers function to ensure data is updated before proceeding

        setTimeout(() => {
          setIsConfirmed(false);
        }, 800);
      } else {
        toast.error("Failed to mark OD. Please try again.", {
          autoClose: 800,
        });
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("Error submitting OD. Please try again.", {
        autoClose: 800,
      });
    }
  };

  const handleClosePopup = () => {
    setIsConfirmed(false);
  };

  return (
    <div className="flex flex-col flex-1 items-center p-6 md:p-8 lg:p-12">
      <div className="p-6 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-semibold text-center text-white">
          ON DUTY
        </h1>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap gap-x-4 gap-y-4 justify-center mt-4 w-full">
          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label
              htmlFor="yearOfStudy"
              className="block text-lg font-medium text-white"
            >
              Year:
            </label>
            <select
              id="yearOfStudy"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              disabled={isLoadingClasses}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600 disabled:bg-gray-200"
            >
              <option value="nan">
                {isLoadingClasses ? "Loading..." : "Year"}
              </option>
              {getUniqueYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label
              htmlFor="branch"
              className="block text-lg font-medium text-white"
            >
              Branch:
            </label>
            <select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={isLoadingClasses}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600 disabled:bg-gray-200"
            >
              <option value="nan">
                {isLoadingClasses ? "Loading..." : "Branch"}
              </option>
              {getUniqueBranches().map((branchOption) => (
                <option key={branchOption} value={branchOption}>
                  {branchOption}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[100px] max-w-[150px]">
            <label
              htmlFor="section"
              className="block text-lg font-medium text-white"
            >
              Section:
            </label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              disabled={isLoadingClasses}
              className="px-4 py-2 w-full text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-600 disabled:bg-gray-200"
            >
              <option value="nan">
                {isLoadingClasses ? "Loading..." : "Section"}
              </option>
              {getUniqueSections().map((sectionOption) => (
                <option key={sectionOption} value={sectionOption}>
                  {sectionOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Selection */}
        <div className="flex justify-center items-center pb-5 mt-8">
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

      {/* Message Display */}
      {message && (
        <div className="p-4 mt-6 w-full max-w-lg text-lg text-center text-red-500">
          {message}
        </div>
      )}

      {/* Roll Numbers */}
      {rollNumbers.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6 w-full sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          {rollNumbers.map((rollNumber, index) => (
            <div
              key={index}
              onClick={() => toggleSelection(index)}
              className={`flex items-center justify-center p-6 text-white transition-all transform duration-500 text-xl font-semibold rounded-lg cursor-pointer shadow-md ${
                rollNumber.isSelected ? "bg-blue-600" : "bg-red-600"
              } hover:scale-110`}
            >
              {rollNumber.rollNo}
            </div>
          ))}
        </div>
      )}

      {selectedRollNumbers.length > 0 && (
        <div className="p-4 mt-6 w-full text-lg text-black">
          <h4 className="mb-10 text-3xl font-semibold text-center">
            Selected Roll Numbers:
          </h4>
          <div className="flex flex-col items-center space-y-4">
            {selectedRollNumbers.map((rollNo, index) => {
              const student = rollNumbers.find(
                (student) => student.rollNo === rollNo
              );
              return (
                <span key={index} className="text-xl font-bold text-center">
                  {" "}
                  {student ? `${student.rollNo} - ${student.name}` : rollNo}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsConfirmed(true)}
        disabled={
          yearOfStudy === "nan" || branch === "nan" || section === "nan"
        }
        className={`w-full px-6 py-3 mt-10 h-20 text-white transition-all text-2xl duration-500 transform rounded-lg lg:w-1/4 md:w-1/5 sm:w-1/2 ${
          yearOfStudy === "nan" || branch === "nan" || section === "nan"
            ? "bg-gray-400  cursor-not-allowed"
            : "bg-gray-800 hover:bg-gray-600 hover:scale-110"
        }`}
      >
        MARK OD
      </button>
      {
        <button
          onClick={() =>
            navigate("/message", {
              state: {
                yearOfStudy,
                branch,
                section,
                selectedDate: date,
                selectedCourse,
              },
            })
          }
          disabled={
            yearOfStudy === "nan" || branch === "nan" || section === "nan"
          }
          className={`w-full px-6 py-3 mt-5 h-20 text-white transition-all text-2xl duration-500 transform rounded-lg lg:w-1/4 md:w-1/5 sm:w-1/2 ${
            yearOfStudy === "nan" || branch === "nan" || section === "nan"
              ? "bg-gray-400  cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-600 hover:scale-110"
          }`}
        >
          Generate Message
        </button>
      }

      <button
        onClick={navigateToHome}
        className="px-6 py-3 mt-5 w-full h-20 text-2xl text-white bg-gray-800 rounded-lg transition-all duration-500 transform hover:bg-gray-600 hover:scale-110 lg:w-1/4 md:w-1/5 sm:w-1/2"
      >
        Home
      </button>

      {isConfirmed && (
        <div className="flex fixed inset-0 justify-center items-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
          <div className="p-8 w-96 bg-gray-800 rounded-lg shadow-lg transition-all duration-500 transform scale-110 animate-slideDown">
            <h2 className="mb-4 text-2xl font-semibold text-center text-white">
              Confirm Action
            </h2>
            <p className="mb-6 text-center text-white">
              {selectedRollNumbers.length > 0
                ? ` ${selectedRollNumbers.length} students are marked as On Duty`
                : "0 Students are marked as On Duty"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirm}
                className="px-6 py-3 w-32 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Yes
              </button>
              <button
                onClick={handleClosePopup}
                className="px-6 py-3 w-32 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default DutyPage;
