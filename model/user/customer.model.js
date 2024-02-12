const mongoose = require("mongoose");
const Joi = require("joi");

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: false },
  tel: { type: String, required: false },

  address: { type: String, required: true },
  address_moo: { type: String, required: true },
  address_byway: { type: String, required: true },
  address_street: { type: String, required: true },
  subdistrict: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postcode: { type: String, required: true },
  timestamp: { type: Date, required: true },

  active: { type: Boolean, require: true, default: false },
  customer_feedback: [{
    timestamp: { type: Date, required: false, default: Date.now() },
    writer: { type: String, require: false },
    topic: { type: String, require: false },
    detail: { type: String, require: false },
  }],
});


const Customers = mongoose.model("customer_info", CustomerSchema);

const validate = (data) => {
  const schema = Joi.object({

    name: Joi.string().label("ไม่พบชื่อเล่น"),
    tel: Joi.string().required().label("ไม่พบเบอร์โทร"),

    address: Joi.string().required().label("ไม่พบที่อยู่-บ้านเลขที่"),
    address_moo: Joi.string().required().label("ไม่พบที่อยู่-หมู่"),
    address_byway: Joi.string().label("ไม่พบที่อยู่-ซอย"),
    address_street: Joi.string().label("ไม่พบที่อยู่-ถนน"),
    subdistrict: Joi.string().required().label("ไม่พบตำบล"),
    district: Joi.string().required().label("ไม่พบ เขต/อำเภอ"),
    province: Joi.string().required().label("ไม่พบจังหวัด"),
    postcode: Joi.string().required().label("ไม่พบรหัส ปณ."),

    active: Joi.boolean().default(false),

  });
  return schema.validate(data);
};

module.exports = { Customers, validate };
