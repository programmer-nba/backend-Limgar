const bcrypt = require("bcrypt");
const { Stocks } = require("../../model/stock/stock.model");
const { StocksSummary, validate } = require("../../model/stock/stock_summary.model");
//const stock_order = require("../../controllers/stock/stock_order.controller ");
const { StockOrders } = require("../../model/stock/stock_order.model");
const { Products } = require("../../test_SplitPriceAndProduct/model/product/product.model");
const { Orders } = require("../../model/order/order.model")
const { Branchs } = require("../../model/branch/branch.model");
var _ = require("lodash")

//--summary
exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const stock_info = await StocksSummary.findOne({
      branch_oid: req.body.branch_oid,
      product_oid: req.body.product_oid,
    });
    if (stock_info)
      return res.status(401).send({
        status: false,
        message: "มีสต็อกนี้ในคลังแล้ว",
      });

    await new StocksSummary({
      ...req.body,
      //--initial first transaction stock
      createdDatetime: Date.now(),
      balance: 0,
      reserved_qty: 0,
      total_product: 0

      //transactions: newOrder
    }).save().then((item) => {
      if (!item) {
        return res.status(404)
          .send({ status: false, message: "สร้างสต็อกไม่สำเร็จ" });
      }
      return res.status(200)
        .send({ status: true, message: "สร้างรายการรวมสต็อกสำเร็จ", data: item });
    });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.create_B = async (req, res) => {
  try {
    let data = req.body
    const { error } = validate(data);
    if (error)
      return res.status(403)
        .send({ message: error.details[0].message, status: false });

    if (data.qty === 0)
      return res.status(403)
        .send({ message: "จำนวนไม่ถูกต้อง", qty: data.qty, status: false });

    const one_order = data;
    const one_stock_list = await Stocks.findById(one_order.stock_info_oid);

    if (!one_stock_list)
      return res.status(404).send({
        status: false,
        message: "ไม่พบรายการสต็อกนี้",
      });

    //-- ส่งไปเก็บใน stock_orders
    const stock_card = one_stock_list;
    const item_log1 = {
      order_oid: one_order.order_oid,
      stock_info_oid: stock_card.id,
      branch_oid: stock_card.branch_oid,
      product_oid: one_order.product_oid,
      stock_category: stock_card.stock_category,
      //--- one order --
      item_status: "income",
      qty: one_order.qty,
      requester_user: one_order.requester_user,
      remark: one_order.remark,
    }
    await new StockOrders({
      ...item_log1,
      timestamp: Date.now(),
      stock_order_status: "waitting",
      approver_user: req.body.approver_user,
      status: {
        timestamp: Date.now(),
        name: "created-waitting",
      }
    }).save().then((item) => {
      if (!item)
        return res.status(403)
          .send({ status: false, message: "ส่งบันทึกไม่สำเร็จ" });

      return res.status(200)
        .send({ status: true, message: "บันทึกรายการเคลื่อนไหวสต็อกสำเร็จ", data: item });

    });

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

exports.getStockAll = async (req, res) => {
  try {
    const stock_summary_lists = await StocksSummary.find();
    // const stock_lists = await Stocks.find();
    /* const stock_order_lists = await StockOrders.find({
       stock_order_status: "approved"
     });*/
    // const product_lists = await Products.find()
    //const branch_lists = await Branchs.find()


    if (stock_summary_lists.length === 0)
      return res.status(404)
        .send({ status: false, message: "ไม่พบ รายการสต็อก" });

    return res.status(200)
      .send({ status: true, message: "ดึงข้อมูลรายการสต็อกสำเร็จ", data: stock_summary_lists });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getStockByBranch_oid = async (req, res) => {
  try {
    const id = req.params.id // "branch_oid"

    const stock_summary_lists = await StocksSummary.find({ branch_oid: id });
    /* const stock_lists = await Stocks.find({
       branch_oid: id
     });*/
    if (stock_summary_lists.length === 0)
      return res.status(404)
        .send({ status: false, message: "ไม่พบ รายการสต็อกในสาขานี้" });

    /*  const stock_order_lists = await StockOrders.find({
        stock_order_status: "approved"
      });*/
    //  const product_lists = await Products.find()
    // const branch_lists = await Branchs.find()


    /*  if (stock_order_lists.length === 0)
        return res.status(404)
          .send({ status: false, message: "ไม่พบการเดินรายการสต็อก" });*/

    return res.status(200)
      .send({ status: true, message: "ดึงข้อมูลรายการสต็อกสำเร็จ", data: stock_summary_lists });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งข้อมูลชื่อสต็อกผิดพลาด1" });
    const id = req.params.id;

    StocksSummary.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({ status: false, message: "แก้ไขข้อมูลชื่อสต็อกไม่สำเร็จ1" });
        return res
          .status(200)
          .send({ status: true, message: "แก้ไขข้อมูลชื่อสต็อกสำเร็จ" });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .send({ status: false, message: "มีบางอย่างผิดพลาด" + id });
      });

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    Stocks.findByIdAndDelete(id, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({ message: "ไม่สามารถลบข้อมูลชื่อสต็อกนี้ได้" });
        return res.status(200).send({ message: "ลบข้อมูลชื่อสต็อกสำเร็จ" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบข้อมูลชื่อสต็อกนี้ได้",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.holdOrderById = async (req, res) => {
  let a = req.params.oid

  try {

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.holdOrder = async (req, res) => {
  try {

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.comfirm = async (req, res) => {
  //--confirm order income
  try {


  } catch (err) {
    return res.status(500)
      .send({ message: "Internal Server Error" });
  }
};

exports.cancel = async (req, res) => {
  //--เก่า รอแก้
  const fillter_status = "waiting" //--ฟิลเตอณเฉพาะ รออนุมัติ
  try {
    const rejectOrder = await Stocks.findOne({
      _id: req.params.id,
      stock_order_status: fillter_status
    });
    if (rejectOrder) {
      /* rejectOrder.transactions.pop({
         //timestamp: Date.now(),
       });*/

      rejectOrder.transactions.push({
        ...req.body,
        timestamp: new Date().toISOString(),
        //approver_user: "mock_admin",
        stock_order_status: "rejected", //--  admin ไม่อนุมัติ
        remark: req.body.remark || "-",
        detail: req.body.detail || {}
      });
      newOrder.detail.stock_order_status = "rejected", //--  admin ไม่อนุมัติ

        stockCard.transactions.push(newOrder)
      stockCard.save();

      //-- ส่งไปเก็บใน stock_orders
      const item_log = req.body.detail
      await new StockOrders({
        ...item_log,
        timestamp: Date.now(),
        // stock_order_id: req.body.stock_order_id,
        branch_oid: "65aa1506f866895c9585e033",
        branchName: "HQ",
        isHqAdminOnly: true,
        approver_user: req.body.approver_user || "",
      }).save();

      rejectOrder.save();
      return res.status(200).send({
        status: true,
        message: "ยกเลิกคำขอสต็อกสำเร็จ",
        data: rejectOrder,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};