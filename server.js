import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();

app.use(cors({
  origin: [
    "https://pruebas.multiproyecto.com",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
  ]
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;
const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "wompi-backend" });
});

app.post("/api/wompi/signature", (req, res) => {
  try {
    if (!WOMPI_INTEGRITY_KEY) {
      return res.status(500).json({ error: "Missing WOMPI_INTEGRITY_KEY env var" });
    }
    if (!WOMPI_PUBLIC_KEY) {
      return res.status(500).json({ error: "Missing WOMPI_PUBLIC_KEY env var" });
    }

    const { amountInCents, currency, reference } = req.body || {};
    if (!amountInCents || !currency || !reference) {
      return res.status(400).json({
        error: "Faltan campos requeridos: amountInCents, currency, reference"
      });
    }

    const stringToHash = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_KEY}`;
    const signature = crypto.createHash("sha256").update(stringToHash).digest("hex");

    return res.json({
      signature,
      reference,
      amountInCents,
      currency,
      publicKey: WOMPI_PUBLIC_KEY
    });
  } catch (err) {
    return res.status(500).json({
      error: "signature_error",
      details: String(err?.message || err)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Wompi escuchando en el puerto ${PORT}`);
});
