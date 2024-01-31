const router = require("express").Router();

const { Admins } = require("../model/user/admin.model");
const { Agents } = require("../model/user/agent.model");

const authMe = require("../lib/auth.me");
const bcrypt = require("bcrypt");
const { decode } = require("jsonwebtoken");
require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    let admin = await Admins.findOne({ admin_username: req.body.username });
    if (!admin) {
      return await checkAgent(req, res);  // ไปหาใน Agents
      //return res.status(404).send({ status: false, message: "User not found" });
      //console.log("ไม่ใช่แอดมิน");
    } else {
      const validatePasswordAdmin = await bcrypt.compare(
        req.body.password,
        admin.admin_password
      );
      if (!validatePasswordAdmin) {
        return res
          .status(403)
          .send({ status: false, message: "Invalid password 1 " });
      } else {
        const token = admin.generateAuthToken();
        const ResponesData = {
          name: admin.admin_name,
          username: admin.admin_username,
          position: admin.admin_position,
        };
        return res.status(200).send({
          token: token,
          message: "เข้าสู่ระบบสำเร็จ",
          result: ResponesData,
          status: true,
        });
      }
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

const checkAgent = async (req, res) => {
  try {
    const agent = await Agents.findOne({
      username: req.body.username
    });
    if (!agent) {
      console.log("User not found.");
      return res.status(404)
        .send({ status: false, message: "User not found." });

    }

    // ตรวจสอบรหัสผ่าน
    const validatePasswordAdmin = await bcrypt.compare(
      req.body.password,
      agent.password
    );
    if (!validatePasswordAdmin) {
      return res.status(403)
        .send({ status: false, message: "Invalid password 1 " });
    } else {
      const token = agent.generateAuthToken();
      const ResponesData = {
        name: agent.name,
        username: agent.username,
        // position: admin.admin_position,
      };
      return res.status(200).send({
        token: token,
        message: "เข้าสู่ระบบสำเร็จ",
        result: ResponesData,
        level: "agent",
        position: agent.row,
        status: true,
      });
    }


  } catch (err) {
    return res.status(500)
      .send({ message: "Internal Server Error", status: false });
  }
}

/*router.get("/me", authMe, async (req, res) => {
  try {
    const { decodeed } = req;

    if (decodeed && decodeed.row === "admin") {
      const id = decode.id;
      const admin = await Admins.findOne({ _id: id });
      if (!admin) {
        return res.status(400)
          .send({ message: "Invalid Data", status: false });
      } else {
        return res.status(200)
          .send({
            name: admin.admin_name,
            username: admin.admin_username,
            position: "admin",
            level: admin.admin_position,
          });
      }
    }
    if (decodeed && decodeed.row === "agent") {
      const id = decode.id;
      const agent = await Agents.findOne({ _id: id });
      if (!agent) {
        return res.status(400)
          .send({ message: "Invalid Data", status: false });
      } else {
        return res.status(200)
          .send({
            name: agent.agent_name,
            username: agent.agent_username,
            position: "agent",
            level: agent.agent_position,
          });
      }
    }

  }
  catch (err) {
    return res.status(500)
      .send({ message: "Internal Server Error", status: false });
  }
})
*/
module.exports = router;
