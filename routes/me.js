const router = require("express").Router();
require("dotenv").config();

const { Admins } = require("../model/user/admin.model");
const { Agents } = require("../model/user/agent.model");
const { Rows } = require("../model/user/row.model")
const auth = require("../lib/auth.me");

router.post("/", auth, async (req, res) => {
  const { decoded } = req;
  try {

    const id = decoded._id;
    if (decoded && decoded.row === "admin") {
      const admin = await Admins.findOne({ _id: id })
      if (!admin) {
        return res.status(400)
          .send({ message: "มีบางอย่างผิดพลาด", status: false });
      } else {
        return res.status(200).send({
          name: admin.admin_name,
          username: admin.admin_username,
          level: "admin",
          position: admin.admin_position,
        });
      }
    }

    if (decoded && decoded.row === "agent") {
      const id = decoded._id;
      const agent = await Agents.findOne({ _id: id });
      if (!agent)
        return res.status(400)
          .send({ message: "Invalid Data", status: false });
      return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: agent });
    }

    else {
      console.log("User not found.");
      return res.status(404)
        .send({ status: false, message: "User not found." });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;