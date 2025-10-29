const express = require("express");
const { bindDevice } = require("../controllers/bindingController");

const router = express.Router();
router.post("/bind", bindDevice);

module.exports = router;
