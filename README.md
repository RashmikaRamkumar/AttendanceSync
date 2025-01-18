# AttendanceSync: A Full-Stack MERN Application for Attendance Management

## Project Overview
AttendanceSync is a comprehensive web application designed to simplify and automate attendance tracking and reporting processes in academic institutions. Developed using the MERN (MongoDB, Express.js, React.js, Node.js) stack, it is currently being used in real-time in my college to save time and reduce manual effort in attendance tracking.

## Key Features
1. **Attendance Management:**
   - Faculty can mark attendance for students, categorized as Present, Absent, On-Duty, or Superpacc (specific for third- and fourth-year students).
   - Admins have the ability to modify already marked attendance records if needed.

2. **Automated Reporting:**
   - Generate detailed and customizable reports for analysis by HODs and faculty.
   - Create daily absentee lists in Excel format for sharing with hostel staff.

3. **Communication Tools:**
   - Automatically generate messages and emails containing absentee details for efficient communication.

4. **User Roles and Security:**
   - Role-based access ensures secure data handling for administrators, faculty, and students.
   - Secure authentication and authorization implemented with JWT tokens.

5. **User-Friendly Interface:**
   - Intuitive and responsive frontend built with React.js and styled using Tailwind CSS.
   - Optimized for seamless use across devices.

6. **Real-Time Insights:**
   - Generate reports to analyze attendance trends and patterns, aiding better decision-making.

## Technical Stack
- **Frontend:** React.js, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Deployment:** AWS EC2 with Docker Image (Both Frontend and Backend), GitHub Actions (CI/CD)

---

## Running the Application Locally

Follow these steps to set up and run the application:

### Prerequisites
- **Node.js** and **npm** installed
- **MongoDB** running locally or accessible via a cloud service
- **Git** installed

### Commands

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/rashmikaramkumar/attendancesync.git
   cd rashmikaramkumar-attendancesync.git
   ```

2. **Backend Setup:**
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file and configure the following variables:
     ```env
     PORT=5000
     MONGO_URI=your_mongo_database_connection_string
     JWT_SECRET=your_secret_key
     JWT_EXPIRE=7d
     COOKIE_EXPIRE=7
     ```
   - Start the backend server:
     ```bash
     node server.js
     ```

3. **Frontend Setup:**
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file and configure the following variable:
     ```env
     VITE_BACKEND_URL=http://localhost:5000
     ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```

4. **Access the Application:**
   - Open your browser and navigate to `http://localhost:5173` for the frontend.
   - The backend will run on `http://localhost:5000`.

---

## Current Impact
AttendanceSync is revolutionizing attendance management in academic institutions. By automating routine tasks like attendance marking, report generation, and communication, it significantly reduces the workload for faculty, allowing them to focus on academic responsibilities. Its ability to modify already marked attendance ensures flexibility and accuracy in record-keeping. The application is deployed on AWS EC2 with Docker images for both the frontend and backend, ensuring robust and scalable real-time usage.

---
