import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();

// ─── CORS: permitir solo tu dominio de producción (y localhost en desarrollo) ──
app.use(cors({
  origin: [
    "https://pruebas.multiproyecto.com",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
  ]
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;

// ─── Variables de entorno (configúralas en Railway) ───────────────────────────
// WOMPI_INTEGRITY_KEY  → Desarrolladores > Secretos de integración técnica
//                        Tiene el prefijo test_integrity_... o prod_integrity_...
// WOMPI_PUBLIC_KEY     → pub_test_... o pub_prod_...
// (La PRIVATE_KEY NO se usa para la firma del widget)
const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY;
const WOMPI_PUBLIC_KEY    = process.env.WOMPI_PUBLIC_KEY;

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "wompi-backend" });
});

// ─── Endpoint: generar firma de integridad para el Widget ─────────────────────
// Wompi requiere: SHA256( reference + amountInCents + currency + INTEGRITY_KEY )
// NO es HMAC; es un hash SHA256 simple de la cadena concatenada.
app.post("/api/wompi/signature", (req, res) => {
  try {
    if (!WOMPI_INTEGRITY_KEY) {
      console.error("❌ Falta WOMPI_INTEGRITY_KEY en las variables de entorno.");
      return res.status(500).json({ error: "Missing WOMPI_INTEGRITY_KEY env var" });
    }
    if (!WOMPI_PUBLIC_KEY) {
      console.error("❌ Falta WOMPI_PUBLIC_KEY en las variables de entorno.");
      return res.status(500).json({ error: "Missing WOMPI_PUBLIC_KEY env var" });
    }

    const { amountInCents, currency, reference } = req.body || {};

    if (!amountInCents || !currency || !reference) {
      return res.status(400).json({
        error: "Faltan campos requeridos: amountInCents, currency, reference"
      });
    }

    // Algoritmo oficial Wompi:
    // SHA256( reference + amountInCents + currency + integrityKey )
    const stringToHash = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_KEY}`;

    const signature = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");

    console.log(`✅ Firma generada para referencia: ${reference} | monto: ${amountInCents} ${currency}`);

    return res.json({
      signature,
      reference,
      amountInCents,
      currency,
      publicKey: WOMPI_PUBLIC_KEY
    });

  } catch (err) {
    console.error("Error generando signature:", err);
    return res.status(500).json({
      error: "signature_error",
      details: String(err?.message || err)
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Wompi escuchando en el puerto ${PORT}`);
});
