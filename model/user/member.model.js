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

const MemberSchema = new mongoose.Schema({
  profile_image: { type: String, required: false, default: "" },
  prefix_name: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  name: { type: String, required: true },
  tel: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  position: { type: String, required: false },
  address: { type: String, required: true },
  address_moo: { type: String, required: true },
  address_byway: { type: String, required: true },
  address_street: { type: String, required: true },
  subdistrict: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postcode: { type: String, required: true },
  row: { type: String, required: false, default: "" },
  agent_referrent: { type: String, required: false },
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
  //commissiom: { type: Number, required: false, default: 0 },
  timestamp: { type: Date, required: true },
  /*allow_term_con: {
    step1: { type: Boolean, require: false, default: false },
    step2: { type: Boolean, require: false, default: false }

  },*/
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
      name: this.agent_name,
      position: this.agent_position,
      row: "member",
      active: this.active,
    },
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "30d",
    }
  );
  return token;
};

const Members = mongoose.model("agent", MemberSchema);

const validate = (data) => {
  const schema = Joi.object({
    prefix_name: Joi.string().required().label("ไม่พบคำนำหน้าชื่อ"),
    first_name: Joi.string().required().label("ไม่พบชื่อหลัก"),
    last_name: Joi.string().required().label("ไม่พบชื่อสกุล"),
    //name: Joi.string().required().label("ไม่พบชื่อเล่น"),
    tel: Joi.string().required().label("ไม่พบเบอร์โทร"),
    username: Joi.string().required().label("ไม่พบชื่อผู้ใช้งาน"),
    password: passwordComplexity(complexityOptions)
      .required()
      .label("agent_password"),
    address: Joi.string().required().label("ไม่พบที่อยู่-บ้านเลขที่"),
    address_moo: Joi.string().required().label("ไม่พบที่อยู่-หมู่"),
    address_byway: Joi.string().label("ไม่พบที่อยู่-ซอย"),
    address_street: Joi.string().label("ไม่พบที่อยู่-ถนน"),
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
    // commissiom: Joi.number().default(0),
    active: Joi.boolean().default(false),
    status: [{
      name: Joi.string().default(""),
      timestamp: Joi.date().default(Date.now()),
    }],
  });
  return schema.validate(data);
};

module.exports = { Members, validate };
