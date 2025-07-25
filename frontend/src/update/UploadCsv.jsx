import React, { useState } from "react";
import { Upload, AlertCircle, CheckCircle, Download } from "lucide-react";

function UploadCsv() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // Add a state for controlling the full-page loader
  const [showLoader, setShowLoader] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(""); // Clear message when new file is selected
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setMessage(""); // Clear message when new file is dropped
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setShowLoader(true); // Show loader
    const formData = new FormData();
    formData.append("csvfile", file);

    try {
      const res = await fetch(`${backendURL}/api/upload/add-student`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setMessage(data.message);
      setMessageType(data.success ? "success" : "error");
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Upload failed. Please check your file and try again.");
      setMessageType("error");
    } finally {
      setIsUploading(false);
      setShowLoader(false); // Hide loader
      setFile(null);
    }
  };

  const handleDownloadMockData = () => {
    // Create a mock CSV data
    const mockData =
      "rollNo,name,hostellerDayScholar,gender,yearOfStudy,branch,section,parentMobileNo,studentMobileNo,superPacc\n" +
      "21PA1A0501,John Doe,HOSTELLER,MALE,II,CSE,A,9876543210,9123456780,YES\n" +
      "21PA1A0502,Jane Smith,DAY SCHOLAR,FEMALE,II,CSE,A,9876543211,9123456781,NO\n" +
      "21PA1A0503,Bob Johnson,HOSTELLER,MALE,II,CSE,A,9876543212,9123456782,YES";

    // Create blob and download
    const blob = new Blob([mockData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mock_student_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex relative flex-col">
      {/* Full-page loading overlay */}
      {showLoader && (
        <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/30">
          <div className="flex flex-col items-center">
            <div className="mb-4 loader" />
            <span className="text-lg font-semibold text-white animate-pulse">
              Uploading...
            </span>
          </div>
        </div>
      )}
      {/* Main content */}
      <div
        className="flex justify-center items-center w-full h-32 rounded-lg border-2 border-dashed transition-colors cursor-pointer border-slate-300 hover:border-slate-400 bg-slate-50 group"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <label className="flex flex-col justify-center items-center w-full h-full transition-colors cursor-pointer group-hover:bg-slate-100">
          <Upload className="mb-2 w-8 h-8 text-slate-400 group-hover:text-slate-500" />
          <span className="text-sm text-slate-600">
            {file ? file.name : "Drag & Drop CSV or Click to Select"}
          </span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={!file || isUploading}
          className={`flex-1 px-4 py-2 rounded-md text-sm text-white transition-colors ${
            !file || isUploading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-700 shadow-sm"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload CSV"}
        </button>

        <button
          onClick={handleDownloadMockData}
          className="flex items-center px-4 py-2 text-sm text-white rounded-md transition-colors bg-slate-600 hover:bg-slate-500"
        >
          <Download className="mr-2 w-4 h-4" />
          Mock Data
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md flex items-center ${
            messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle className="mr-2 w-4 h-4" />
          ) : (
            <AlertCircle className="mr-2 w-4 h-4" />
          )}
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
}

// Add CSS for the loader animation
// You can add this in the same file using a <style> tag or in your global CSS
// Here, we'll use a style tag for simplicity

// For Vite/CRA, you can use a style tag in the component file for quick prototyping
// Or move to a CSS file for production
if (
  typeof document !== "undefined" &&
  !document.getElementById("upload-csv-loader-style")
) {
  const style = document.createElement("style");
  style.id = "upload-csv-loader-style";
  style.innerHTML = `
    .loader {
      border: 6px solid #e5e7eb;
      border-top: 6px solid #2563eb;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      animation: spin 1s linear infinite;
      box-shadow: 0 0 16px #2563eb44;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default UploadCsv;
