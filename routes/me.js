const router = require("express").Router();
require("dotenv").config();
const {Admins} = require("../model/user/admin.model");
const auth = require("../lib/auth");

router.post("/", auth, async (req, res) => {
  const {decoded} = req;
  try {
    const id = decoded._id;
    if (decoded && decoded.row === "admin") {
      Admins.findOne({_id: id})
        .then((item) => {
          return res.status(200).send({
            name: item.admin_name,
            username: item.admin_username,
            level: "admin",
            position: item.admin_position,
          });
        })
        .catch(() => {
          res.status(409).send({message: "มีบางอย่างผิดพลาด", status: false});
        });
    } else {
      console.log("Admins not found");
    }
  } catch (err) {
    return res.status(500).send({message: "Internal Server Error"});
  }
});

module.exports = router;
