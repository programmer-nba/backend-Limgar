const mongoose = require("mongoose");
const Joi = require("joi");

const StockOrderSchema = new mongoose.Schema({
  timestamp: { type: Date, required: false, default: Date.now() },
  order_oid: { type: String, required: false },
  product_oid: { type: String, required: false },
  stock_order_status: { type: String, required: false },
  stock_info_oid: { type: String, required: false },
  branch_oid: { type: String, required: false },
  product_oid: { type: String, required: false },
  stock_category: { type: String, required: false },
  item_status: { type: String, required: false },
  qty: { type: Number, required: false },
  requester_user: { type: String, required: false },
  approver_user: { type: String, required: false },
  remark: { type: String, required: false },
  status: [{
    timestamp: { type: Date, required: false, default: Date.now() },
    name: { type: String, required: false },
  }]
});

const StockOrders = mongoose.model("stock_orders", StockOrderSchema);

const validate = (data) => {
  const schema = Joi.object({
    timestamp: Joi.date().default(Date.now()),
    order_oid: Joi.string().label("ใส่ order oid"),
    stock_info_oid: Joi.string().label("ใส่ stock info oid"),
    //stock_order_status: Joi.string().label("ใส่สถานะการยืนยันบันทึกสต๊อกสินค้า"),
    product_oid: Joi.string().label("ใส่oidสินค้า"),
    //product_barcode: Joi.string().required().label("ใส่บาร์โค๊ดสต๊อกสินค้า"),
    //product_name: Joi.string().required().label("ใส่ชื่อสต๊อกสินค้า"),
    stock_category: Joi.string().label("ใส่แคตตาล็อกต๊อกสินค้า"),
    //branch_oid: Joi.string().label("ใส่รหัสสาขา"),
    //branchName: Joi.string().label("ใส่ชื่อสาขา"),
    //isHqAdminOnly: Joi.boolean().default(true),
    item_status: Joi.string().required().label("ใส่สถานะการดำเนินการสต๊อกสินค้า"),
    qty: Joi.number().required().label("ใส่จำนวน"),
    requester_user: Joi.string().required().label("ใส่ชื่อคนดำเนินการ"),
    remark: Joi.string().default(""),
  });
  return schema.validate(data);
};

module.exports = { StockOrders, validate };
