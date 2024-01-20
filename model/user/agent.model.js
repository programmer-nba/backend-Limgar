const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const complexityOptions = {
  min: 6,
  max: 30,
  lowerCase: 0,
  upperCase: 0,
  numeric: 0,
  symbol: 0,
  requirementCount: 2,
};

const AgentSchema = new mongoose.Schema({
  profile_image: { type: String, required: false, default: "" },
  name: { type: String, required: true },
  tel: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  subdistrict: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postcode: { type: String, required: true },
  row: { type: String, required: false, default: "" },
  channels: {
    name: { type: String, require: false, default: "" },
    detail: { type: String, require: false, default: "" }
  },
  bank: {
    name: { type: String, required: false, default: "-" },
    number: { type: String, required: false, default: "-" },
    image: { type: String, required: false, default: "-" },
    status: { type: Boolean, required: false, default: false },
    remark: { type: String, required: false, default: "-" }, // อยู่ระหว่างการตรวจสอบ, ไม่ผ่านการตรวจสอบ, ตรวจสอบสำเร็จ
  },
  iden: {
    number: { type: String, required: false, default: "-" },
    image: { type: String, required: false, default: "-" },
    status: { type: Boolean, required: false, default: false },
    remark: { type: String, required: false, default: "-" }, // อยู่ระหว่างการตรวจสอบ, ไม่ผ่านการตรวจสอบ, ตรวจสอบสำเร็จ
  },
  commissiom: { type: Number, required: false, default: 0 },
  timestamp: { type: Date, required: true },
  active: { type: Boolean, require: true, default: false },
  status: [{
    name: { type: String, require: false },
    timestamp: { type: Date, required: false, default: Date.now() }
  }],
});

AgentSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.admin_name,
      position: this.admin_position,
      row: "admin",
    },
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "4h",
    }
  );
  return token;
};

const Agents = mongoose.model("agent", AgentSchema);

const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("ไม่พบชื่อ"),
    tel: Joi.string().required().label("ไม่พบเบอร์โทร"),
    username: Joi.string().required().label("ไม่พบชื่อผู้ใช้งาน"),
    password: passwordComplexity(complexityOptions)
      .required()
      .label("admin_password"),
    address: Joi.string().required().label("ไม่พบที่อยู่"),
    subdistrict: Joi.string().required().label("ไม่พบตำบล"),
    district: Joi.string().required().label("ไม่พบ เขต/อำเภอ"),
    province: Joi.string().required().label("ไม่พบจังหวัด"),
    postcode: Joi.string().required().label("ไม่พบรหัส ปณ."),
    channels: {
      name: Joi.string().default(""),
      detail: Joi.string().default(""),
    },
    bank: {
      name: Joi.string().default("-"),
      number: Joi.string().default("-"),
      image: Joi.string().default("-"),
      status: Joi.boolean().default(false),
      remark: Joi.string().default("-"),
    },
    iden: {
      number: Joi.string().default("-"),
      image: Joi.string().default("-"),
      status: Joi.boolean().default(false),
      remark: Joi.string().default("-"),
    },
    commissiom: Joi.number().default(0),
    active: Joi.boolean().default(false),
    status: [{
      name: Joi.string().default(""),
      timestamp: Joi.date().default(Date.now()),
    }],
  });
  return schema.validate(data);
};

module.exports = { Agents, validate };