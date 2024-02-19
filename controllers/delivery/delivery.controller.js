//const bcrypt = require("bcrypt");
const { Deliverys, validate } = require("../../model/delivery/delivery.model");
//const stock_order = require("../../controllers/stock/stock_order.controller ");
//const { StockOrders } = require("../../model/stock/stock_order.model");
//const { Products } = require("../../test_SplitPriceAndProduct/model/product/product.model");
//const { Branchs } = require("../../model/branch/branch.model");
const { Orders } = require("../../model/order/order.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);

    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });

    const order_id = req.body.order_id;
    const rolling_order = await Orders.findOne({
      order_id: order_id
    })

    if (!rolling_order) {
      return res.status(404)
        .send({ status: false, message: "ไม่พบ ใบออเดอร์นี้" })
    }

    await new Deliverys({
      ...req.body,
      timestamp: Date.now(),
      createdDatetime: Date.now(),
      order_id: rolling_order.order_id,
      customer_info: rolling_order.customer_info,
      item_status: "สินค้ากำลังเดินทาง",
      status: {
        name: "รอตรวจสอบ",
        timestamp: Date.now()
      }
    }).save();
    return res.status(200)
      .send({ status: true, message: "ลงทะเบียนการจัดส่งสำเร็จ" });
  } catch (err) {
    return res.status(500)
      .send({ message: "Internal Server Error" });
  }
};

exports.getDeliveryAll = async (req, res) => {
  try {

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getStockById = async (req, res) => {
  try {

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {


  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.delete = async (req, res) => {
  try {

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.comfirm = async (req, res) => {
  try {
    const updateStatus = await Deliverys.findById({ _id: req.params.id });
    if (!updateStatus) {
      return res.status(404).send({ message: "ไม่พบ ใบจัดส่งนี้" });
    }

    if (updateStatus) {

      updateStatus.timestamp = Date.now()

      updateStatus.status.push({
        name: "อนุมัติ",
        timestamp: Date.now(),
      });
      await updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "อนุมัติ",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }

  } catch (err) {
    return res.status(500)
      .send({ message: "Internal Server Error" });
  }
};

exports.cancel = async (req, res) => {
  try {

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};