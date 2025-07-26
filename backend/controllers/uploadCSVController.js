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

        // Filter valid records and prepare data
        const validRecords = [];
        const invalidRecords = [];

        for (const row of results) {
          const {
            rollNo,
            name,
            hostellerDayScholar,
            gender,
            yearOfStudy,
            branch,
            section,
            parentMobileNo,
            studentMobileNo,
            superPacc,
          } = row;

          if (!rollNo || !name) {
            invalidRecords.push({
              rollNo,
              name,
              reason: "Missing rollNo or name",
            });
            continue;
          }

          validRecords.push({
            rollNo,
            name,
            hostellerDayScholar,
            gender,
            yearOfStudy,
            branch,
            section,
            parentMobileNo,
            studentMobileNo,
            superPacc,
          });
        }

        if (validRecords.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No valid records found in CSV file",
          });
        }

        // Extract all roll numbers for batch query
        const rollNumbers = validRecords.map((record) => record.rollNo);

        // Batch fetch existing students
        const existingStudents = await Student.find({
          rollNo: { $in: rollNumbers },
        }).select(
          "rollNo name hostellerDayScholar gender yearOfStudy branch section parentMobileNo studentMobileNo superPacc"
        );

        // Create a map for quick lookup
        const existingStudentsMap = new Map();
        existingStudents.forEach((student) => {
          existingStudentsMap.set(student.rollNo, student);
        });

        // Separate records into new, updated, and unchanged
        const newRecords = [];
        const updateOperations = [];
        const unchangedRecords = [];

        for (const record of validRecords) {
          const existingStudent = existingStudentsMap.get(record.rollNo);

          if (!existingStudent) {
            // New student
            newRecords.push(record);
          } else {
            // Check if any field has changed
            const hasChanges =
              existingStudent.name !== record.name ||
              existingStudent.hostellerDayScholar !==
                record.hostellerDayScholar ||
              existingStudent.gender !== record.gender ||
              existingStudent.yearOfStudy !== record.yearOfStudy ||
              existingStudent.branch !== record.branch ||
              existingStudent.section !== record.section ||
              existingStudent.parentMobileNo !== record.parentMobileNo ||
              existingStudent.studentMobileNo !== record.studentMobileNo ||
              existingStudent.superPacc !== record.superPacc;

            if (hasChanges) {
              // Prepare update operation
              updateOperations.push({
                updateOne: {
                  filter: { rollNo: record.rollNo },
                  update: { $set: record },
                },
              });
            } else {
              // No changes
              unchangedRecords.push({
                rollNo: record.rollNo,
                name: record.name,
                reason: "Duplicate (no changes)",
              });
            }
          }
        }

        // Perform bulk operations
        let insertedCount = 0;
        let updatedCount = 0;

        // Bulk insert new records
        if (newRecords.length > 0) {
          const insertResult = await Student.insertMany(newRecords, {
            ordered: false, // Continue even if some fail
          });
          insertedCount = insertResult.length;
        }

        // Bulk update existing records
        if (updateOperations.length > 0) {
          const updateResult = await Student.bulkWrite(updateOperations, {
            ordered: false, // Continue even if some fail
          });
          updatedCount = updateResult.modifiedCount || updateOperations.length;
        }

        const skippedCount = invalidRecords.length + unchangedRecords.length;
        const allSkippedRows = [...invalidRecords, ...unchangedRecords];

        res.json({
          success: true,
          message: `${insertedCount} new student(s) inserted, ${updatedCount} updated, ${skippedCount} skipped (duplicates or missing data).`,
          details: {
            insertedCount,
            updatedCount,
            skippedCount,
            skippedRows: allSkippedRows,
          },
        });
      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({
          success: false,
          message: "Failed to upload to MongoDB.",
          error: err.message,
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
