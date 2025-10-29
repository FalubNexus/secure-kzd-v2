const { generateDeviceID } = require("../utils/device");

exports.bindDevice = (req, res) => {
  const deviceID = generateDeviceID(req.body.deviceInfo);
  return res.json({ deviceID, status: "bound" });
};
