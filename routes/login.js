const router = require("express").Router();

const { Admins } = require("../model/user/admin.model");
const { Agents } = require("../model/user/agent.model");
const { Employees } = require("../model/user/employee.model");

const bcrypt = require("bcrypt");
const Joi = require("joi");

const validate = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().label("username"),
    password: Joi.string().required().label("password"),
  });
  return schema.validate(data);
};

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    let admin = await Admins.findOne({ admin_username: req.body.username });
    if (!admin) {
      await checkAgent(req, res);  // ไปหาใน Agents
    } else {
      const validatePasswordAdmin = await bcrypt.compare(
        req.body.password,
        admin.admin_password
      );
      if (!validatePasswordAdmin) {
        return res
          .status(403)
          .send({ status: false, message: "รหัสผ่านไม่ถูกต้อง" });
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
          data: ResponesData,
          status: true,
        });
      }
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

async function checkAgent(req, res) {
  try {
    let agent = await Agents.findOne({
      username: req.body.username
    })
    if (!agent) {
      await checkEmplotee(req, res);
    } else {
      const validatePassword = await bcrypt.compare(
        req.body.password,
        agent.password
      );
      if (!validatePassword)
        return res.status(403).send({ status: false, message: "รหัสผ่านไม่ตรงกัน" });
      const token = agent.generateAuthToken();
      const data = {
        first_name: agent.first_name,
        last_name: agent.last_name,
        active: agent.active
      };
      return res.status(200).send({ status: true, message: 'เข้าสู่ระบบสำเร็จ', token: token, data: data });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error", status: false });
  }
}

async function checkEmplotee(req, res) {
  try {
    let employee = await Employees.findOne({
      username: req.body.username
    })
    if (!employee) {
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูลผู้ใช้งาน" })
    } else {
      const validatePassword = await bcrypt.compare(
        req.body.password,
        employee.password
      );
      if (!validatePassword)
        return res.status(403).send({ status: false, message: "รหัสผ่านไม่ตรงกัน" });
      const token = employee.generateAuthToken();
      const data = {
        first_name: employee.first_name,
        last_name: employee.last_name,
        active: employee.active,
        stock_id: employee.stock_id,
        row: 'employee'
      };
      return res.status(200).send({ status: true, message: 'เข้าสู่ระบบสำเร็จ', token: token, data: data });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error", status: false });
  }
}

module.exports = router;
