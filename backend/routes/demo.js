
const express = require("express");

const router = express.Router();

router.post("/profile", (req, res) => {
  const { ign, introduction } = req.body ?? {};

  if (
    typeof ign !== "string" ||
    typeof introduction !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "IGN dan perkenalan harus berupa teks.",
    });
  }

  const cleanIgn = ign.trim();
  const cleanIntroduction = introduction.trim();

  if (cleanIgn.length < 3 || cleanIgn.length > 20) {
    return res.status(400).json({
      success: false,
      message: "IGN harus terdiri dari 3–20 karakter.",
    });
  }

  if (
    cleanIntroduction.length < 5 ||
    cleanIntroduction.length > 200
  ) {
    return res.status(400).json({
      success: false,
      message: "Perkenalan harus terdiri dari 5–200 karakter.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Data profil demo valid.",
    profile: {
      ign: cleanIgn,
      introduction: cleanIntroduction,
    },
  });
});

module.exports = router;
