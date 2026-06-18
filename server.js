require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARES ───────────────────────────────────────────────────────────────
app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL,       // ej: https://pruebas.multiproyecto.com
  'http://localhost',
  'http://127.0.0.1',
  'null',                         // about:blank y archivos locales (file://)
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permite peticiones sin origin (Postman, curl, etc.) y orígenes en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueado para origen: ${origin}`);
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Wompi Gorras Colombia activo ✅' });
});

// ─── ENDPOINT: FIRMA DE INTEGRIDAD WOMPI ──────────────────────────────────────
// El frontend llama a POST /api/wompi/signature con { amountInCents, currency, reference }
// El backend responde con la firma SHA256 calculada con la clave de integridad de Wompi
app.post('/api/wompi/signature', async (req, res) => {
  const { amountInCents, currency, reference } = req.body;

  // Validación de campos requeridos
  if (!amountInCents || !currency || !reference) {
    return res.status(400).json({
      error: 'Faltan campos requeridos: amountInCents, currency, reference',
    });
  }

  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

  if (!integritySecret) {
    console.error('❌ WOMPI_INTEGRITY_SECRET no está definido en las variables de entorno.');
    return res.status(500).json({
      error: 'El servidor no tiene configurada la clave de integridad de Wompi.',
    });
  }

  try {
    // Formato requerido por Wompi para el hash de integridad:
    // reference + amountInCents + currency + integritySecret
    const cadena = `${reference}${amountInCents}${currency}${integritySecret}`;
    const signature = crypto.createHash('sha256').update(cadena).digest('hex');

    console.log(`✅ Firma generada para referencia: ${reference} | Monto: ${amountInCents} ${currency}`);

    return res.json({ signature });
  } catch (err) {
    console.error('Error generando firma Wompi:', err);
    return res.status(500).json({ error: 'Error interno al generar la firma.' });
  }
});

// ─── INICIO DEL SERVIDOR ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
