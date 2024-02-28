const mongoose = require("mongoose");
const Joi = require("joi");

const OrderSchema = new mongoose.Schema({
  receiptnumber: { type: String, required: true },
  agent_id: { type: String, required: true },
  customer: {
    type: {
      customer_name: { type: String, required: true },
      customer_tel: { type: String, required: true },
      customer_address: { type: String, required: true },
      customer_subdistrict: { type: String, required: true },
      customer_district: { type: String, required: true },
      customer_province: { type: String, required: true },
      customer_postcode: { type: String, required: true },
    }
  },
  product_detail: {
    type: [
      {
        product_id: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        cost: { type: Number, required: true },
      },
    ],
  },
  total_cost: { type: Number, required: false, default: 0 },
  total_price: { type: Number, required: false, default: 0 },
  total_freight: { type: Number, required: false, default: 0 },
  vat: { type: Number, required: false, default: 0 },
  discount: { type: Number, required: false, default: 0 },
  payment_type: {
    type: String,
    enum: ["เงินสด", "เงินโอน", "COD"],
    required: true,
  },
  tracking_number: { type: String, required: false, default: "" },
  image: { type: String, required: false, default: "" },
  remark: { type: String, required: false },
  status: { type: Array, required: true },

});

const Orders = mongoose.model("orders", OrderSchema);

const validate = (data) => {
  const schema = Joi.object({
    customer_name: Joi.string().required().label('กรอกชื่อลูกค้า'),
    customer_tel: Joi.string().required().label('กรอกเบอร์โทรลูกค้า'),
    customer_address: Joi.string().required().label('กรอกที่อยู่ลูกค้า'),
    customer_subdistrict: Joi.string().required().label('ตำบล'),
    customer_district: Joi.string().required().label('อำเภอ'),
    customer_province: Joi.string().required().label('จังหวัด'),
    customer_postcode: Joi.string().required().label('รหัสไปรษณีย์'),
    product_id: Joi.string().required().label('กรอกไอดีสินค้า'),
    quantity: Joi.number().required().label("กรอกจำนวนสินค้า"),
    tracking_number: Joi.string().default(""),
    image: Joi.string().default(""),
    payment_type: Joi.string().required().label('กรอกวิธีชำระเงิน')
  });
  return schema.validate(data);
};

module.exports = { Orders, validate };
