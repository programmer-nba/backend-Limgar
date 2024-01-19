const mongoose = require("mongoose");
const Joi = require("joi");

const BranchSchema = new mongoose.Schema({
  profile_image: { type: String, required: false, default: "" },
  timestamp: { type: Date, required: true },
  name: { type: String, required: true },
  tel: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  subdistrict: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postcode: { type: String, required: true },
  pinMap_url: { type: String, required: true },
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

  isActive: { type: Boolean, require: true, default: false },
  status: [{
    name: { type: String, require: false },
    timestamp: { type: Date, required: false, default: Date.now() }
  }],
});

const Branchs = mongoose.model("branchs", BranchSchema);

const validate = (data) => {
  const schema = Joi.object({
    // timestamp: Joi.date().default(Date.now()),
    name: Joi.string().required().label("ไม่พบชื่อสาขา"),
    tel: Joi.string().required().label("ไม่พบเบอร์โทรสาขา"),
    email: Joi.string().required().label("ไม่พบอีเมลสาขา"),
    address: Joi.string().required().label("ไม่พบที่อยู่สาขา"),
    subdistrict: Joi.string().required().label("ไม่พบตำบลสาขา"),
    district: Joi.string().required().label("ไม่พบ เขต/อำเภอสาขา"),
    province: Joi.string().required().label("ไม่พบจังหวัดสาขา"),
    postcode: Joi.string().required().label("ไม่พบรหัส ปณ.สาขา"),
    pinMap_url: Joi.string().required().default("-"),
    channels: {
      name: Joi.string().default("-"),
      detail: Joi.string().default("-"),
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
    isActive: Joi.boolean().default(false),
    status: [{
      name: Joi.string().default(""),
      timestamp: Joi.date().default(Date.now()),
    }],
  });
  return schema.validate(data);
};

module.exports = { Branchs, validate };
