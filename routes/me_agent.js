const router = require("express").Router();
require("dotenv").config();
const { Agents } = require("../model/user/agent.model");
const auth = require("../lib/auth");

router.post("/", auth, async (req, res) => {
  const { decoded } = req;
  try {
    const id = decoded._id;
    if (decoded && decoded.row === "agent") {
      Agents.findOne({ _id: id })
        .then((item) => {
          return res.status(200).send({
            name: item.name,
            username: item.username,
            level: "agent",
            position: "mock_agentLv1",
          });
        })
        .catch(() => {
          res.status(409).send({ message: "มีบางอย่างผิดพลาด", status: false });
        });
    } else {
      console.log("user not found");
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
