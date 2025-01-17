const mongoose = require('mongoose');

// Define the Student Schema
const studentSchema = new mongoose.Schema({
    rollNo: String,
    name: String,
    hostellerDayScholar: String,
    gender: String,
    yearOfStudy: String,
    branch: String,
    section: String,
    parentMobileNo: String,
    studentMobileNo: String,
    superPacc : String,
});

// Create and export the Student model
const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
