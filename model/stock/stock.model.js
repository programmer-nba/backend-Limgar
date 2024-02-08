const mongoose = require("mongoose");
const Joi = require("joi");

const StockSchema = new mongoose.Schema({
  timestamp: { type: Date, required: false, default: Date.now() },
  createdDatetime: { type: Date, required: false },
  approver_user: { type: String, required: false },
  //product_oid: { type: String, required: true },
  //  product_barcode: { type: String, required: true },
  //product_name: { type: String, required: false },
  stock_name: { type: String, required: false },
  stock_category: { type: String, required: false },
  branch_oid: { type: String, required: false },
  branch_name: { type: String, required: false },
  //  isHqAdminOnly: { type: Boolean, required: false },
  //product_cost: { type: Number, required: false },
  //product_net_weight: { type: Number, required: false },
  //minimim_alert_qty: { type: Number, required: false },
  //balance: { type: Number, required: false },
  total_qty: { type: Number, required: false },
  stock_count: { type: Number, required: false },
  //  reserved_qty: { type: Number, required: false },
  items: [],
});

const Stocks = mongoose.model("stocks", StockSchema);

const validate = (data) => {
  const schema = Joi.object({
    timestamp: Joi.date().default(Date.now()),
    approver_user: Joi.string().label("ใส่ชื่อผู้สร้างสต๊อกสินค้า"),
    //product_oid: Joi.string().required().label("ใส่oidสินค้า"),
    // product_barcode: Joi.string().required().label("ใส่บาร์โค๊ดสต๊อกสินค้า"),
    // product_name: Joi.string().required().label("ใส่ชื่อสต๊อกสินค้า"),
    stock_name: Joi.string().label("ใส่ชื่อคลังสต็อกสินค้า"),
    stock_category: Joi.string().label("ใส่แคตตาล็อกต๊อกสินค้า"),
    branch_oid: Joi.string().label("ใส่รหัสสาขา"),
    branchName: Joi.string().label("ใส่ชื่อสาขา"),
    total_qty: Joi.number().default(0),
    // isHqAdminOnly: Joi.boolean().default(true),
    // product_cost: Joi.number().required().default(0),
    // product_net_weight: Joi.number().required().default(0),
    // minimim_alert_qty: Joi.number().default(0),ห
  });
  return schema.validate(data);
};

module.exports = { Stocks, validate };
