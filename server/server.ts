import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the React app (after frontend build)
// In development, Vite handles serving frontend. This is for production build.
// app.use(express.static(path.join(__dirname, "../client/dist")));

// Basic API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend API!" });
});

// All other GET requests not handled by the API should return the React app
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
// });


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

