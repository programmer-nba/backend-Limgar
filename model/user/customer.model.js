const mongoose = require("mongoose");
const Joi = require("joi");

const CustomerSchema = new mongoose.Schema({
  agent_id: { type: String, required: true },
  name: { type: String, required: true },
  tel: { type: String, required: true },
  address: { type: String, required: true },
  subdistrict: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postcode: { type: String, required: true },
});


const Customers = mongoose.model("customer_info", CustomerSchema);

const validate = (data) => {
  const schema = Joi.object({
    agent_id: Joi.string().label("ไม่พบไอดีตัวแทนขาย"),
    name: Joi.string().label("ไม่พบชื่อลูกค้า"),
    tel: Joi.string().required().label("ไม่พบเบอร์โทร"),
    address: Joi.string().required().label("ไม่พบที่อยู่-บ้านเลขที่"),
    subdistrict: Joi.string().required().label("ไม่พบตำบล"),
    district: Joi.string().required().label("ไม่พบ เขต/อำเภอ"),
    province: Joi.string().required().label("ไม่พบจังหวัด"),
    postcode: Joi.string().required().label("ไม่พบรหัส ปณ."),
  });
  return schema.validate(data);
};

module.exports = { Customers, validate };
