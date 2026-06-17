+const express = require("express");
+const cors = require("cors");
+const crypto = require("crypto");
+
+const app = express();
+app.use(cors());
+app.use(express.json());
+
+const PORT = process.env.PORT || 3000;
+
+const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
+const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
+
+app.post("/api/wompi/signature", (req, res) => {
+  try {
+    if (!WOMPI_PRIVATE_KEY) {
+      return res.status(500).json({ error: "Missing WOMPI_PRIVATE_KEY" });
+    }
+
+    const { amountInCents, currency, reference } = req.body || {};
+    if (!amountInCents || !currency || !reference) {
+      return res.status(400).json({
+        error: "amountInCents, currency, reference are required"
+      });
+    }
+
+    const signatureBase = `${amountInCents}${currency}${reference}`;
+    const signature = crypto
+      .createHmac("sha256", WOMPI_PRIVATE_KEY)
+      .update(signatureBase)
+      .digest("hex");
+
+    return res.json({
+      signature,
+      reference,
+      amountInCents,
+      currency,
+      publicKey: WOMPI_PUBLIC_KEY
+    });
+  } catch (e) {
+    return res.status(500).json({
+      error: "signature_error",
+      details: String(e && e.message ? e.message : e)
+    });
+  }
+});
+
+app.listen(PORT, () => {
+  console.log(`Listening on port ${PORT}`);
+});
