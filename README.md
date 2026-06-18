# 🧢 Backend Wompi – Gorras Colombia

Servidor Node.js/Express que genera la firma de integridad SHA256 requerida por el Widget de Wompi.

---

## 📁 Estructura del proyecto

```
wompi-gorras-backend/
├── server.js           ← Servidor principal
├── package.json        ← Dependencias
├── railway.json        ← Configuración para Railway
├── .env.example        ← Plantilla de variables de entorno
├── .gitignore          ← Protege el .env y node_modules
└── README.md           ← Este archivo
```

---

## 🔑 Dónde obtener las claves de Wompi

1. Inicia sesión en [https://comercios.wompi.co](https://comercios.wompi.co)
2. Ve a **Configuración → Llaves de API**
3. Necesitas tres valores:

| Variable | Dónde encontrarla | Empieza con |
|---|---|---|
| `WOMPI_PUBLIC_KEY` | Panel Wompi → Llaves | `pub_test_` / `pub_prod_` |
| `WOMPI_PRIVATE_KEY` | Panel Wompi → Llaves | `prv_test_` / `prv_prod_` |
| `WOMPI_INTEGRITY_SECRET` | Panel Wompi → Llaves → **Secreto de integridad** | `test_integrity_` / `prod_integrity_` |

> ⚠️ El `WOMPI_INTEGRITY_SECRET` es diferente a la clave privada. Es una sección separada en el panel.

---

## 🚀 Despliegue en Railway (paso a paso)

### 1. Subir el código a GitHub

```bash
git init
git add .
git commit -m "feat: backend Wompi Gorras Colombia"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 2. Crear proyecto en Railway

1. Ve a [https://railway.app](https://railway.app) e inicia sesión
2. Clic en **New Project → Deploy from GitHub repo**
3. Selecciona tu repositorio
4. Railway detectará automáticamente que es Node.js y lo desplegará

### 3. Configurar variables de entorno en Railway

En tu proyecto de Railway, ve a **Variables** y agrega:

```
WOMPI_INTEGRITY_SECRET = test_integrity_XXXXXXXXXXXXXXX
WOMPI_PRIVATE_KEY      = prv_test_XXXXXXXXXXXXXXXXXXXXXXX
FRONTEND_URL           = https://pruebas.multiproyecto.com
```

> `PORT` lo gestiona Railway automáticamente, **no lo configures manualmente**.

### 4. Obtener la URL del backend

Una vez desplegado, Railway te dará una URL como:
```
https://wompi-gorras-production.up.railway.app
```

---

## ✏️ Configurar el frontend (index.html)

En tu `index.html`, ubica estas dos líneas y ajústalas:

```javascript
// Línea ~455: Clave PÚBLICA de Wompi (va en el frontend)
const WOMPI_PUBLIC_KEY = 'pub_test_XXXXXXXXXXXXXXXXXXXXXXXX';

// Línea ~456: URL de tu backend en Railway
const BACKEND_URL = 'https://TU-URL-EN-RAILWAY.up.railway.app';
```

---

## 🧪 Probar localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env a partir del ejemplo
cp .env.example .env
# Edita .env y completa tus claves reales

# 3. Iniciar el servidor
npm run dev

# 4. Probar el endpoint
curl -X POST http://localhost:3000/api/wompi/signature \
  -H "Content-Type: application/json" \
  -d '{"amountInCents": 6000000, "currency": "COP", "reference": "GORRACOL-TEST-001"}'
```

Respuesta esperada:
```json
{ "signature": "abc123...sha256hash..." }
```

---

## 🔁 Flujo completo del pago

```
Usuario hace clic en "Pagar con Wompi"
        ↓
Frontend valida el formulario
        ↓
POST /api/wompi/signature → Backend
  (amountInCents, currency, reference)
        ↓
Backend calcula SHA256(reference + amount + currency + integritySecret)
        ↓
Frontend recibe la firma y abre el Widget de Wompi
        ↓
Usuario paga → Wompi confirma → Frontend muestra resultado
        ↓
Si APPROVED → Abre WhatsApp con resumen del pedido
```

---

## ⚠️ Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `signature mismatch` en Wompi | `WOMPI_INTEGRITY_SECRET` incorrecto | Verifica que usas el **Secreto de integridad**, no la clave privada |
| `CORS error` | `FRONTEND_URL` mal configurado | Asegúrate que `FRONTEND_URL` coincide exactamente con la URL de tu landing |
| `500 Internal Server Error` | Falta `WOMPI_INTEGRITY_SECRET` en Railway | Revisa las Variables en Railway |
| Widget no carga | `WOMPI_PUBLIC_KEY` incorrecto en el frontend | Copia la clave pública desde el panel Wompi |
