
const express = require("express");
const path = require("path");
const demoRouter = require("./routes/demo");

const app = express();
const PORT = 3000;

// Membaca request JSON
app.use(express.json());

// Menyajikan file frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Endpoint health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sakura Memories API berjalan dengan baik.",
  });
});

// Endpoint demo
app.use("/api/demo", demoRouter);

// Respons jika endpoint API tidak ditemukan
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint API tidak ditemukan.",
  });
});

// Penanganan error terpusat
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Format JSON pada request tidak valid.",
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server.",
  });
});

app.listen(PORT, () => {
  console.log(
    `Sakura Memories API berjalan di http://localhost:${PORT}`
  );
});
