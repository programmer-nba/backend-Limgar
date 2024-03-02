const mongoose = require("mongoose");
const Joi = require("joi");

const OrderSchema = new mongoose.Schema({
  receiptnumber: { type: String, required: true },
  agent_id: { type: String, required: true },
  customer: {
    customer_name: { type: String, required: false, default: "ไม่มี" },
    customer_tel: { type: String, required: false, default: "ไม่มี" },
    customer_address: { type: String, required: false, default: "ไม่มี" },
    customer_subdistrict: { type: String, required: false, default: "ไม่มี" },
    customer_district: { type: String, required: false, default: "ไม่มี" },
    customer_province: { type: String, required: false, default: "ไม่มี" },
    customer_postcode: { type: String, required: false, default: "ไม่มี" },
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
    customer: Joi.object({
      customer_name: Joi.string().default("ไม่มี"),
      customer_tel: Joi.string().default("ไม่มี"),
      customer_address: Joi.string().default("ไม่มี"),
      customer_subdistrict: Joi.string().default("ไม่มี"),
      customer_district: Joi.string().default("ไม่มี"),
      customer_province: Joi.string().default("ไม่มี"),
      customer_postcode: Joi.string().default("ไม่มี"),
    }),
    product_id: Joi.string().required().label('กรอกไอดีสินค้า'),
    quantity: Joi.number().required().label("กรอกจำนวนสินค้า"),
    tracking_number: Joi.string().default(""),
    image: Joi.string().default(""),
    payment_type: Joi.string().required().label('กรอกวิธีชำระเงิน')
  });
  return schema.validate(data);
};

module.exports = { Orders, validate };
