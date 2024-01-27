const mongoose = require("mongoose");
const Joi = require("joi");

const StockOrderSchema = new mongoose.Schema({
  timestamp: { type: Date, required: false, default: Date.now() },
  stock_order_status: { type: String, required: false },
  stock_order_id: { type: String, required: false },
  branch_oid: { type: String, required: false },
  branchName: { type: String, required: false },
  isHqAdminOnly: { type: Boolean, required: false },
  product_oid: { type: String, required: false },
  product_barcode: { type: String, required: false },
  product_name: { type: String, required: false },
  stock_category: { type: String, required: false },
  item_status: { type: String, required: false },
  qty: { type: Number, required: false },
  requester_user: { type: String, required: false },
  approver_user: { type: String, required: false },
  remark: { type: String, required: false }
});

const StockOrders = mongoose.model("stock_orders", StockOrderSchema);

const validate = (data) => {
  const schema = Joi.object({
    timestamp: Joi.date().default(Date.now()),
    stock_order_id: Joi.string().default("0").label("ใส่รหัสบันทึกสต๊อกสินค้า"),
    stock_order_status: Joi.string().label("ใส่สถานะการยืนยันบันทึกสต๊อกสินค้า"),
    product_oid: Joi.string().required().label("ใส่oidสต๊อกสินค้า"),
    product_barcode: Joi.string().required().label("ใส่บาร์โค๊ดสต๊อกสินค้า"),
    product_name: Joi.string().required().label("ใส่ชื่อสต๊อกสินค้า"),
    stock_category: Joi.string().label("ใส่แคตตาล็อกต๊อกสินค้า"),
    //branch_oid: Joi.string().label("ใส่รหัสสาขา"),
    //branchName: Joi.string().label("ใส่ชื่อสาขา"),
    //isHqAdminOnly: Joi.boolean().default(true),
    item_status: Joi.string().required().label("ใส่สถานะการดำเนินการสต๊อกสินค้า"),
    qty: Joi.number().required().label("ใส่จำนวน"),
    remark: Joi.string().default(""),
  });
  return schema.validate(data);
};

module.exports = { StockOrders, validate };
