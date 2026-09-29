require("dotenv").config();
const app = require("./app");

// Fail fast with a clear message if critical security config is missing.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("replace_this")) {
  console.warn(
    "\n⚠️  WARNING: JWT_SECRET is not set (or still the default placeholder) in your .env file.\n" +
      "   Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n" +
      "   The server will still start, but this is NOT safe for production.\n"
  );
  process.env.JWT_SECRET = process.env.JWT_SECRET || "dev_only_insecure_secret_change_me";
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚕 SafarSaathi backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
