const express = require("express");
const router = express.Router();
const { ask } = require("../controllers/aiController");

router.post("/ask", ask);

module.exports = router;
