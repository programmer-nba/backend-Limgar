const mongoose = require("mongoose");
const Joi = require("joi");

const ProductPriceShema = new mongoose.Schema({
  product_oid: { type: String, required: true },
  product_price_oid: { type: String, required: false },
  product_barcode: { type: String, required: false },
  product_name: { type: String, required: false },
  branch_oid: { type: String, required: false },
  branchName: { type: String, required: false },
  isHqAdminOnly: { type: Boolean, required: false },
  amount: { type: Number, required: false },
  price: {
    price_one: { type: Number, required: false },
    price_two: { type: Number, required: false },
    price_three: { type: Number, required: false },
    price_four: { type: Number, required: false },
    price_five: { type: Number, required: false }
  },
  priceCOD: {
    price_one: { type: Number, required: false },
    price_two: { type: Number, required: false },
    price_three: { type: Number, required: false },
    price_four: { type: Number, required: false },
    price_five: { type: Number, required: false }
  },
  isExtraCOD: { type: Boolean, required: false }
});

const ProductsPrice = mongoose.model("product_price", ProductPriceShema);

const validate = (data) => {
  const schema = Joi.object({
    product_oid: Joi.string().required().label("กรอกoidสินค้า"),
    product_barcode: Joi.string().label("กรอกรหัสสินค้า"),
    product_name: Joi.string().label("กรอกชื่อสินค้า"),
    branch_oid: Joi.string().label("กรอกรหัสสาขา"),
    branchName: Joi.string().label("กรอกชื่อสาขา"),
    //isHqAdminOnly: Joi.boolean().required().default(true),
    amount: Joi.number().label("กรอกจำนวนสินค้า/แพ็ค"),
    price: {
      price_one: Joi.number().default(0),
      price_two: Joi.number().required().default(0),
      price_three: Joi.number().required().default(0),
      price_four: Joi.number().required().default(0),
      price_five: Joi.number().required().default(0)
    },
    priceCOD: {
      price_one: Joi.number().required().default(0),
      price_two: Joi.number().required().default(0),
      price_three: Joi.number().required().default(0),
      price_four: Joi.number().required().default(0),
      price_five: Joi.number().required().default(0)
    },
    isExtraCOD: Joi.boolean().default(false),
  });
  return schema.validate(data);
};

module.exports = { ProductsPrice, validate };
