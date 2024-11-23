import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function AbsenteesPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // State variables
  const [selectedCourse, setSelectedCourse] = useState(location.state?.selectedCourse || "Select a course");
  const [date, setDate] = useState(location.state?.selectedDate || "");
  const [rollNumbers, setRollNumbers] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false); // For Confirm button state
  const [showBackPopup, setShowBackPopup] = useState(false); // For Back button confirmation popup
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false); // For Confirm button confirmation popup
  const [showMarkPresentPopup, setShowMarkPresentPopup] = useState(false); // For Mark Present button confirmation popup
  const [popupMessage, setPopupMessage] = useState(""); // To dynamically update popup messages
  const [popupColor, setPopupColor] = useState(""); // To dynamically update popup colors

  useEffect(() => {
    if (selectedCourse && date) {
      fetchRollNumbers(selectedCourse, date);
    }
  }, [selectedCourse, date]);

  // Fetch roll numbers when selectedCourse or date changes
  const fetchRollNumbers = async (course, selectedDate) => {
    const [yearOfStudy, branch, section] = course.split(" - ");
    const url = `http://localhost:5000/api/students/rollnumbers?yearOfStudy=${yearOfStudy}&branch=${branch}&section=${section}&date=${selectedDate}`;
    try {
      const response = await axios.get(url);
      const fetchedRollNumbers = response.data.students.map((student) => ({
        rollNo: student,
        isSelected: false,
      }));
      setRollNumbers(fetchedRollNumbers);
    } catch (error) {
      console.error("Error fetching roll numbers:", error);
      setRollNumbers([]);
    }
  };

  // Toggle selection of roll numbers
  const toggleSelection = (index) => {
    setRollNumbers((prevRollNumbers) =>
      prevRollNumbers.map((rollNumber, i) =>
        i === index
          ? { ...rollNumber, isSelected: !rollNumber.isSelected }
          : rollNumber
      )
    );
  };

  // Handle confirming the absentee list
  const handleConfirm = () => {
    setIsConfirmed(true);
    setPopupMessage("Are you sure you want to confirm the attendance?");
    setPopupColor("bg-red-600"); // Red for Confirm button
    setShowConfirmationPopup(true); // Show confirmation pop-up
  };

  // Handle the "Mark Present" action
  const handleMarkPresent = () => {
    setPopupMessage("Are you sure you want to mark the selected students as present?");
    setPopupColor("bg-gray-600"); // Default color for Mark Present
    setShowMarkPresentPopup(true); // Show Mark Present confirmation pop-up
  };

  // Handle the "Back" button action
  const handleBackButton = () => {
    setPopupMessage("Are you sure you want to go back to the Duty page?");
    setPopupColor("bg-blue-600"); // Blue for Back button
    setShowBackPopup(true); // Show Back button confirmation pop-up
  };

  // Confirm action for "Mark Present"
  const handleMarkPresentConfirm = () => {
    // Logic to mark the selected roll numbers as present
    console.log("Marking selected students as present");
    setShowMarkPresentPopup(false); // Close the "Mark Present" confirmation pop-up
  };

  // Navigate back to the Duty Page
  const handleBackConfirm = () => {
    setShowBackPopup(false); // Close the back confirmation popup
    navigate("/duty", {
      state: { selectedCourse, selectedDate: date }, // Passing the course and date back
    });
  };

  const handleBackCancel = () => {
    setShowBackPopup(false); // Close the back confirmation popup without navigating
  };

  // Handle the "OK" click in the confirmation popup
  const handleConfirmationPopupOk = () => {
    setShowConfirmationPopup(false); // Close the confirmation popup
  };

  return (
    <div className="flex flex-col items-center flex-1 p-6 md:p-8 lg:p-12">
      {/* Title and Selected Course Display */}
      <div className="p-4 text-center text-black">
        <h1 className="text-4xl font-semibold">{selectedCourse}</h1>
        <h3 className="text-2xl font-semibold">Absentees Page</h3>
        <h3 className="mt-2 text-xl font-semibold">{date}</h3>
      </div>

      {/* Roll Number Buttons */}
      <div className="grid w-full grid-cols-2 gap-4 mt-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
        {rollNumbers.map((rollNumber, index) => (
          <div
            key={index}
            onClick={() => toggleSelection(index)}
            className={`flex items-center justify-center p-6 text-white transition-transform transform text-xl font-semibold rounded-lg cursor-pointer shadow-md
              ${rollNumber.isSelected ? "bg-blue-600" : "bg-gray-700"} hover:scale-110`}
          >
            {rollNumber.rollNo}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center mt-8 space-y-4">
        {/* Back Button */}
        <button
          onClick={handleBackButton}
          className="w-full max-w-xs px-6 py-3 text-white transition-all duration-300 ease-in-out transform bg-blue-600 rounded-lg hover:bg-blue-700 hover:scale-110"
        >
          Back
        </button>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className="w-full max-w-xs px-6 py-3 text-white transition-all duration-300 ease-in-out transform bg-red-600 rounded-lg hover:bg-red-700 hover:scale-110"
        >
          Mark Absent
          
        </button>

        {/* Mark Present Button */}
        <button
          onClick={handleMarkPresent}
          className={`w-full max-w-xs px-6 py-3 text-white rounded-lg focus:outline-none focus:ring-4 transition-all duration-300 ease-in-out transform hover:scale-110
            ${isConfirmed
              ? "bg-green-600 hover:bg-green-700 focus:ring-green-300 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
            }`}
          disabled={!isConfirmed}
        >
          Mark Present
        </button>
      </div>

      {/* Animated Custom Popup for Confirming Mark Attendance */}
      {showConfirmationPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
          <div className="p-8 transition-all duration-500 transform scale-90 bg-gray-800 rounded-lg shadow-lg animate-slideDown">
            <h2 className="mb-4 text-2xl font-semibold text-center text-white">
              Confirm Action
            </h2>
            <p className="mb-6 text-center text-white">{popupMessage}</p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={handleConfirmationPopupOk}
                className="px-6 py-3 text-lg font-semibold text-white transition-all bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                OK
              </button>
              <button
                onClick={() => setShowConfirmationPopup(false)}
                className="px-6 py-3 text-lg font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Custom Popup for Back Button Confirmation */}
      {showBackPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
          <div className="p-8 transition-all duration-500 transform scale-90 bg-gray-800 rounded-lg shadow-lg animate-slideDown">
            <h2 className="mb-4 text-2xl font-semibold text-center text-white">
              Confirm Going Back
            </h2>
            <p className="mb-6 text-center text-white">{popupMessage}</p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={handleBackConfirm}
                className="px-6 py-3 text-lg font-semibold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Yes
              </button>
              <button
                onClick={handleBackCancel}
                className="px-6 py-3 text-lg font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Custom Popup for Mark Present Confirmation */}
      {showMarkPresentPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
          <div className="p-8 transition-all duration-500 transform scale-90 bg-gray-800 rounded-lg shadow-lg animate-slideDown">
            <h2 className="mb-4 text-2xl font-semibold text-center text-white">
              Confirm Marking Present
            </h2>
            <p className="mb-6 text-center text-white">{popupMessage}</p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={handleMarkPresentConfirm}
                className="px-6 py-3 text-lg font-semibold text-white transition-all bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                Yes
              </button>
              <button
                onClick={() => setShowMarkPresentPopup(false)}
                className="px-6 py-3 text-lg font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AbsenteesPage;
