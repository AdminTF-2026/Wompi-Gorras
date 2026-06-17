import express from "express";
import cors from "cors";
import crypto from "crypto";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Wompi keys (NO las pongas hardcodeadas en el código; usa Railway env vars)
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;

// Endpoint para obtener signature
app.post("/api/wompi/signature", async (req, res) => {
  try {
    if (!WOMPI_PRIVATE_KEY) {
      return res.status(500).json({ error: "Missing WOMPI_PRIVATE_KEY" });
    }

    const { amountInCents, currency, reference } = req.body || {};
    if (!amountInCents || !currency || !reference) {
      return res.status(400).json({ error: "amountInCents, currency, reference are required" });
    }

    // Wompi signature: se calcula con tus credenciales.
    // OJO: el algoritmo exacto depende de la documentación vigente del SDK/Checkout.
    // En Wompi Checkout Widget, normalmente se usa HMAC SHA256 con PRIVATE_KEY.
    const signatureBase = `${amountInCents}${currency}${reference}`;
    const signature = crypto
      .createHmac("sha256", WOMPI_PRIVATE_KEY)
      .update(signatureBase)
      .digest("hex");

    // Respuesta esperada por frontend
    res.json({ signature, reference, amountInCents, currency, publicKey: WOMPI_PUBLIC_KEY });
  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({ error: "signature_error", details: String(err?.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
