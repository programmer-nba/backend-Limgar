const mongoose = require("mongoose");
const Joi = require("joi");

const StockSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  address: { type: String, required: true, },
  subdistrict: { type: String, required: true, },
  district: { type: String, required: true, },
  province: { type: String, required: true, },
  postcode: { type: String, required: true, },
  timestamp: { type: Date, required: false, default: Date.now() },
});

const Stocks = mongoose.model("stocks", StockSchema);

const validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label('กรอกชื่อคลังสินค้า'),
    address: Joi.string().required().label('กรอกที่อยู่คลังสินค้า'),
    subdistrict: Joi.string().required().label('กรอกตำบล'),
    district: Joi.string().required().label('กรอกอำเภอ'),
    province: Joi.string().required().label('กรอกจังหวัด'),
    postcode: Joi.string().required().label('กรอกรหัสไปรษณีย์'),
  });
  return schema.validate(data);
};

module.exports = { Stocks, validate };
