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
      if (!agent) {
        return res.status(400)
          .send({ message: "Invalid Data", status: false });
      } else {
        //--ไปหาRow 
        const row = await Rows.findById(agent.row)
        if (!row) {
          return res.status(400)
            .send({ message: "Invalid Data (no row)", status: false });
        }
        //else {
        return res.status(200)
          .send({
            name: agent.name,
            username: agent.username,
            //level: row.position,
            level_name: row.level_name,
            position: row.position,
            agent_oid: agent.id,
            active: agent.active,
            allow_term_con: {
              step1: agent.allow_term_con.step1,
              step2: agent.allow_term_con.step2
            },
            agent_info: {
              prefix_name: agent.prefix_name,
              first_name: agent.first_name,
              last_name: agent.last_name,
              tel: agent.tel,
              address: agent.address,
              address_moo: agent.address_moo,
              address_byway: agent.address_byway,
              address_street: agent.address_street,
              subdistrict: agent.subdistrict,
              district: agent.district,
              province: agent.province,
              postcode: agent.postcode,
              person_id: agent.iden.number,
            }
          });
      }
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