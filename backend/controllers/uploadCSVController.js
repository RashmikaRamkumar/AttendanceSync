const fs = require("fs");
const csv = require("csv-parser");
const Student = require("../models/Student");

exports.addStudent = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const results = [];
  const filePath = req.file.path;

  let isFirstRow = true;
  fs.createReadStream(filePath)
    .pipe(
      csv([
        "rollNo",
        "name",
        "hostellerDayScholar",
        "gender",
        "yearOfStudy",
        "branch",
        "section",
        "parentMobileNo",
        "studentMobileNo",
        "superPacc",
      ])
    )
    .on("data", (data) => {
      // Skip the first row (header row)
      if (isFirstRow) {
        isFirstRow = false;
        return;
      }
      results.push(data);
    })
    .on("end", async () => {
      try {
        if (results.length === 0) {
          return res.status(400).json({
            success: false,
            message: "CSV file is empty or invalid format",
          });
        }

        let insertedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        let skippedRows = [];

        for (const row of results) {
          const {
            rollNo,
            name,
            hostellerDayScholar,
            gender,
            yearOfStudy,
            branch,
            section,
          } = row;
          if (!rollNo || !name) {
            skippedCount++;
            skippedRows.push({
              rollNo,
              name,
              reason: "Missing rollNo or name",
            });
            continue;
          }

          const existingStudent = await Student.findOne({ rollNo });
          if (!existingStudent) {
            // Insert new student
            await Student.create({
              rollNo,
              name,
              hostellerDayScholar,
              gender,
              yearOfStudy,
              branch,
              section,
            });
            insertedCount++;
          } else if (existingStudent.name === name) {
            // Duplicate (same rollNo and name)
            skippedCount++;
            skippedRows.push({
              rollNo,
              name,
              reason: "Duplicate (same rollNo and name)",
            });
          } else {
            // Update existing student (same rollNo, different name)
            existingStudent.name = name;
            existingStudent.hostellerDayScholar = hostellerDayScholar;
            existingStudent.gender = gender;
            existingStudent.yearOfStudy = yearOfStudy;
            existingStudent.branch = branch;
            existingStudent.section = section;
            await existingStudent.save();
            updatedCount++;
          }
        }

        res.json({
          success: true,
          message: `${insertedCount} new student(s) inserted, ${updatedCount} updated, ${skippedCount} skipped (duplicates or missing data).`,
          details: { insertedCount, updatedCount, skippedCount, skippedRows },
        });
      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({
          success: false,
          message: "Failed to upload to MongoDB.",
        });
      } finally {
        // Cleanup temp file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    })
    .on("error", (error) => {
      console.error("CSV parsing error:", error);
      res.status(400).json({
        success: false,
        message: "Error parsing CSV file. Please check the file format.",
      });
    });
};
