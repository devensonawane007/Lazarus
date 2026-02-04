const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const router = express.Router();

router.post("/sign", async (req, res) => {
  const { name, role, signature } = req.body;

  const id = uuid();
  const pdfPath = path.join(__dirname, `../mous/${id}.pdf`);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(18).text("Lazarus Agentic AI MOU", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Name: ${name}`);
  doc.text(`Role: ${role}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);

  doc.moveDown();
  doc.text(
    "This document confirms acceptance of Agentic AI assisted decision making, compliance, and ethical usage."
  );

  doc.moveDown();

  const base64 = signature.replace(/^data:image\/png;base64,/, "");
  const sigPath = path.join(__dirname, `../mous/${id}.png`);
  fs.writeFileSync(sigPath, base64, "base64");

  doc.image(sigPath, { width: 200 });

  doc.end();

  res.json({
    success: true,
    pdfUrl: `http://localhost:5000/mous/${id}.pdf`,
  });
});

module.exports = router;
