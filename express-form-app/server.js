const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "form.html"));
});

// Handle form submission and save to JSON file
app.post("/submit", (req, res) => {
  const { name, email, message } = req.body;

  // File path for saving submissions
  const filePath = path.join(__dirname, "submissions.json");

  // Read existing data (if any)
  let submissions = [];
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, "utf8");
    if (fileData.trim() !== "") {
      submissions = JSON.parse(fileData);
    }
  }

  // Add new submission with timestamp
  const newSubmission = {
    name,
    email,
    message,
    submittedAt: new Date().toLocaleString(),
  };
  submissions.push(newSubmission);

  // Write updated data to JSON file
  fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));

  // Response message
  res.send(`
    <h2>Form Submitted Successfully!</h2>
    <p>Your data has been saved in <b>submissions.json</b>.</p>
    <a href="/">Go Back to Form</a>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
