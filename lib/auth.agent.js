require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = checkToken = async (req, res, next) => {
  let token = req.headers["token"];
  //if (!token)
  //  return res.status(401).send({ status: false, message: "Invalid token" });
  if (token) {
    jwt.verify(token, process.env.JWTPRIVATEKEY, (err, decoded) => {
      req.user = decoded;
      if (err)
        return res.status(408).json({
          success: false,
          message: "หมดเวลาใช้งานแล้ว",
          logout: true,
          description: "Request Timeout",
        });
      req.decoded = decoded;

      if (decoded.row !== "agent") {
        return res.status(401).json({
          success: false,
          message: "ไม่มีสิทธิใช้งานฟังก์ชั่นนี้ agent only",
          logout: true,
          description: "Unauthorized",
        })
      }
      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Token not provided Token ไม่ถูกต้อง",
      logout: false,
      description: "Unauthorized",
    });
  }
};
