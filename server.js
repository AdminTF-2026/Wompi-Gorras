import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;

app.post("/api/wompi/signature", (req, res) => {
  try {
    if (!WOMPI_PRIVATE_KEY) {
      return res.status(500).json({ error: "Missing WOMPI_PRIVATE_KEY" });
    }

    const { amountInCents, currency, reference } = req.body || {};

    if (typeof amountInCents !== "number" && typeof amountInCents !== "string") {
      return res.status(400).json({ error: "amountInCents must be provided" });
    }
    if (!currency || !reference) {
      return res.status(400).json({ error: "currency and reference are required" });
    }

    const amount = String(amountInCents);
    const curr = String(currency).toUpperCase();
    const ref = String(reference);

    // Ajusta si Wompi te pide otro formato, pero este es el más común
    const signatureBase = `${amount}${curr}${ref}`;

    const signature = crypto
      .createHmac("sha256", WOMPI_PRIVATE_KEY)
      .update(signatureBase)
      .digest("hex");

    return res.json({
      signature,
      reference: ref,
      amountInCents: Number(amount),
      currency: curr,
      publicKey: WOMPI_PUBLIC_KEY,
    });
  } catch (e) {
    return res.status(500).json({
      error: "signature_error",
      details: String(e?.message || e),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
