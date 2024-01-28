const router = require("express").Router();
const { Agents } = require("../model/user/agent.model");
const { Rows } = require("../model/user/row.model")
//const row = require("../controllers/user/row.controller")
const bcrypt = require("bcrypt");
require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    let agent = await Agents.findOne({ username: req.body.username });
    if (!agent) {
      // await checkEmployee(req, res);
      return res.status(404).send({ status: false, message: "User not found" });
      //console.log("ไม่ใช่แอดมิน");
    } else {
      const validatePasswordAgent = await bcrypt.compare(
        req.body.password,
        agent.password
      );
      if (!validatePasswordAgent) {
        return res
          .status(403)
          .send({ status: false, message: "Invalid password" });
      } else {
        const token = agent.generateAuthToken();
        //--hotfix
        //const row_user = await row.getRowById({ id: agent.row }, res);
        const row_user = await Rows.findById(agent.row);

        const ResponesData = {
          name: agent.name,
          username: agent.username,
          position: row_user.name || "unknown",
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

module.exports = router;
