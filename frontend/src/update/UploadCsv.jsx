import React, { useState, useRef } from "react";
import { Upload, AlertCircle, CheckCircle, Download, X } from "lucide-react";

function UploadCsv() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [showLoader, setShowLoader] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setMessageType("");
    setShowResult(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setMessage("");
      setMessageType("");
      setShowResult(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setMessage("");
    setMessageType("");
    setShowResult(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    setShowLoader(true);
    setShowResult(false);
    const formData = new FormData();
    formData.append("csvfile", file);
    try {
      const res = await fetch(`${backendURL}/api/upload/add-student`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }
      setMessage(data.message);
      setMessageType("success");
      setShowResult(true);
      setTimeout(() => setShowResult(false), 4000);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setMessage(
        err.message || "Upload failed. Please check your file and try again."
      );
      setMessageType("error");
      setShowResult(true);
    } finally {
      setIsUploading(false);
      setShowLoader(false);
    }
  };

  const handleDownloadMockData = () => {
    // Create a mock CSV data matching the full schema and using real student data
    const mockData =
      "rollNo,name,hostellerDayScholar,gender,yearOfStudy,branch,section,parentMobileNo,studentMobileNo,superPacc\n" +
      "24ALL065,PRADEEP V,HOSTEL,MALE,II YEAR,AIML,NIL,8925643127,8056668519,NO\n" +
      "24ALL066,VISSSAL BAARATH C J,DAY SCHOLAR,MALE,II YEAR,AIML,NIL,8248556809,9842395858,NO\n" +
      "24ALR001,ABISHEK M,DAY SCHOLAR,MALE,II YEAR,AIML,NIL,7397178036,9952827705,NO\n" +
      "24ALR002,ADHITHYA N,HOSTEL,MALE,II YEAR,AIML,NIL,9751555227,9659515277,NO\n" +
      "24ALR003,ADITHYAN S A,HOSTEL,MALE,II YEAR,AIML,NIL,9952476186,8122343145,NO\n" +
      "24ALR004,BHARAT HARI S,HOSTEL,MALE,II YEAR,AIML,NIL,9443715859,9443725157,NO\n" +
      "24ALR005,BHARATH S,HOSTEL ,MALE,II YEAR,AIML,NIL,7639892278,9361512278,NO\n" +
      "24ALR006,BHOOMIKA J,DAY SCHOLAR,FEMALE ,II YEAR,AIML,NIL,9789553243,9842553243,NO\n" +
      "24ALR007,DHANISHA P,DAY SCHOLAR ,FEMALE ,II YEAR,AIML,NIL,9500237371,9566979426,NO\n" +
      "24ALR008,DHANUSHIYAA S,DAY SCHOLAR ,FEMALE,II YEAR,AIML,NIL,9385976412,7373191929,NO\n" +
      "24ALR009,DHARSHINI B,HOSTEL,FEMALE,II YEAR,AIML,NIL,6369505522,9486676045,NO\n" +
      "24ALR010,DHARSHINI P R,DAY SCHOLAR ,FEMALE,II YEAR,AIML,NIL,6379625204,9600580880,NO";
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
    <div className="flex relative flex-col min-h-[400px]">
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div
          className={`flex justify-center items-center w-full h-32 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
            file ? "bg-blue-50 border-blue-400" : "border-slate-300 bg-slate-50"
          } hover:border-slate-400 group relative`}
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
              ref={fileInputRef}
              disabled={isUploading}
            />
          </label>
          {file && (
            <button
              type="button"
              className="absolute top-2 right-2 p-1 bg-white rounded-full border hover:bg-red-100 border-slate-200"
              onClick={handleRemoveFile}
              tabIndex={-1}
              disabled={isUploading}
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
        {file && (
          <div className="flex justify-between items-center px-2 text-xs text-slate-600">
            <span>
              Selected: <b>{file.name}</b> ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <span className="italic text-slate-400">Ready to upload</span>
          </div>
        )}
        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={!file || isUploading}
            className={`flex-1 px-4 py-2 rounded-md text-sm text-white transition-colors ${
              !file || isUploading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-600 shadow-sm"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload CSV"}
          </button>
          <button
            type="button"
            onClick={handleDownloadMockData}
            className="flex items-center px-4 py-2 text-sm text-white rounded-md transition-colors bg-slate-600 hover:bg-slate-500"
            disabled={isUploading}
          >
            <Download className="mr-2 w-4 h-4" />
            Mock Data
          </button>
        </div>
      </form>
      {/* Upload result message */}
      {showResult && message && (
        <div
          className={`mt-4 p-3 rounded-md flex items-center gap-2 transition-all duration-300 ${
            messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-100 animate-fade-in"
              : "bg-red-50 text-red-700 border border-red-100 animate-fade-in"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-500 animate-pop-in" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 animate-pop-in" />
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
    </div>
  );
}

// Loader animation CSS
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
    .animate-fade-in {
      animation: fadeIn 0.5s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-pop-in {
      animation: popIn 0.3s;
    }
    @keyframes popIn {
      0% { transform: scale(0.7); opacity: 0; }
      80% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

export default UploadCsv;
