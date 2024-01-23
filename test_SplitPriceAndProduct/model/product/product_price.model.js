const mongoose = require("mongoose");
const Joi = require("joi");

const ProductPriceShema = new mongoose.Schema({
  product_oid: { type: String, required: true },
  product_barcode: { type: String, required: false },
  product_name: { type: String, required: true },
  branch_oid: { type: String, required: true },
  branchName: { type: String, required: true },
  isHqAdminOnly: { type: Boolean, required: true },
  amount: { type: Number, required: false },
  price: {
    price_one: { type: Number, required: true },
    price_two: { type: Number, required: false },
    price_three: { type: Number, required: false },
    price_four: { type: Number, required: false },
    price_five: { type: Number, required: false }
  },
  priceCOD: {
    price_one: { type: Number, required: true },
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
    product_barcode: Joi.string().required().label("กรอกรหัสสินค้า"),
    product_name: Joi.string().required().label("กรอกชื่อสินค้า"),
    branch_oid: Joi.string().required().label("กรอกรหัสสาขา"),
    branchName: Joi.string().required().label("กรอกชื่อสาขา"),
    //isHqAdminOnly: Joi.boolean().required().default(true),
    amount: Joi.number().required().default(1),
    price: {
      price_one: Joi.number().required().default(0),
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
