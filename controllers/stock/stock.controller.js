const bcrypt = require("bcrypt");
const { Stocks, validate } = require("../../model/stock/stock.model");
const stock_order = require("../../controllers/stock/stock_order.controller ");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const stockName = await Stocks.findOne({
      product_barcode: req.body.product_barcode,
    });
    if (stockName)
      return res.status(401).send({
        status: false,
        message: "มีชื่อสต็อกนี้ในระบบเเล้ว",
      });

    /* const salt = await bcrypt.genSalt(Number(process.env.SALT));
     const hashPassword = await bcrypt.hash(req.body.password, salt);*/
    /* const newData = {
       timestamp: Date.now(),
       stock_order_status: "created",
       stock_order_id: "0",
       branch_oid: "65aa1506f866895c9585e033",
       branchName: "HQ",
       isHqAdminOnly: true,
       product_oid: req.body.product_oid,
       product_barcode: req.body.product_barcode,
       product_name: req.body.product_name,
       stock_category: "-",
       item_status: "created",
       qty: 0,
       requester_user: "mock_Admin",
       approver_user: "mock_Admin",
       remark: req.body.remark || "-"
     }*/

    const newOrder = {
      timestamp: new Date().toISOString(),
      stock_order_status: "created",
      requester_user: "mock_Admin",
      approver_user: "mock_Admin",
      remark: req.body.remark || "-",
      detail: {}
    }
    await new Stocks({
      ...req.body,
      //--initial first transaction stock
      createdDatetime: Date.now(),
      balance: 0,
      reserved_qty: 0,
      transactions: newOrder
    }).save();
    return res.status(200).send({ status: true, message: "ลงรายการชื่อสต็อกสำเร็จ" });

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getStockAll = async (req, res) => {
  try {
    const agent = await Stocks.find();
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลชื่อสต็อกไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลชื่อสต็อกสำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getStockById = async (req, res) => {
  try {
    const id = req.params.id;
    const agent = await Stocks.findById(id);
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลชื่อสต็อกไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลชื่อสต็อกสำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งข้อมูลชื่อสต็อกผิดพลาด1" });
    const id = req.params.id;
    if (!req.body.password) {
      Stocks.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
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
    } else {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      Stocks.findByIdAndUpdate(
        id,
        { ...req.body, password: hashPassword },
        { useFindAndModify: false }
      )
        .then((item) => {
          if (!item)
            return res
              .status(404)
              .send({ status: false, message: "แก้ไขข้อมูลชื่อสต็อกไม่สำเร็จ2" });
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
    }
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

exports.holdOrder = async (req, res) => {
  try {
    const request_qty = req.body.detail.qty
    const stockCard = await Stocks.findOne({ _id: req.params.id });

    const item = req.body.detail
    const alert_qty = stockCard.minimim_alert_qty

    const newOrder = {
      timestamp: new Date().toISOString(),
      stock_order_status: "waiting",
      requester_user: "mock_Admin",
      approver_user: "mock_Admin",
      remark: req.body.remark || "-",
      detail: req.body.detail || {}
    }

    //รีเควสของเกินคลัง ดีดออก
    if (alert_qty < item.qty) {
      /* requestOrder.transactions.push({
         ...req.body,
         timestamp: Date.now(),
         approver_user: "mock_admin",
         stock_order_status: "waiting", //-- รอ admin อนุมัติ
         remark: req.body.remark,
         detail: req.body
       });*/


      //สมมติว่าเป็นbody
      /* const mock_order = { body: req.body.detail }
       await stock_order.create(req);*/
      //-- คำนวณยอดคงเหลือหลังขอยั๊ก สินค้าในสต็อก

      switch (item["item_status"]) {
        case "income":
          //-- รับเข้าสต๊อก
          //requestOrder.balance += item.qty;

          stockCard.transactions.push(newOrder);

          break;
        case "reserved":
          //-- ติดจอง

          stockCard.transactions.push(newOrder);

          stockCard.reserved_qty += item.qty;
          stockCard.balance -= item.qty;

          break;
        case "encash":
          //-- จำหน่าย หรือ ส่งออกไปแล้ว
          //requestOrder.reserved_qty -= item.qty;
          stockCard.transactions.push(newOrder);
          break;
        //default: ;
      }

      stockCard.save();
      return res.status(200).send({
        status: true,
        message: "ส่งคำขอรายการสต็อกสำเร็จ",
        data: stockCard,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด", alert_qty: alert_qty });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
exports.holdOrderById = async (req, res) => {
  let a = req.params.oid

  try {
    let a = req.params.oid
    const requestOrder = await Stocks.findOne({
      _id: req.params.id,
    });

    if (requestOrder) {
      // let b = requestOrder.transactions
      // let a = requestOrder.transactions[b.length - 1].detail.order_id
      //debugger
      requestOrder.transactions.push({
        ...req.body,
        timestamp: Date.now(),
        approver_user: "mock_admin",
        order_status: "waiting", //-- รอ admin อนุมัติ
        remark: req.body.remark,
      });

      //-- คำนวณยอดคงเหลือหลังขอยั๊ก สินค้าในสต็อก
      const item = req.body.detail

      switch (item["item_status"]) {
        case "income":
          //-- รับเข้าสต๊อก
          //requestOrder.balance += item.qty;
          break;
        case "reserved":
          //-- ติดจอง

          requestOrder.reserved_qty += item.qty;
          requestOrder.balance -= item.qty;

          break;
        case "encash":
          //-- จำหน่าย หรือ ส่งออกไปแล้ว
          //requestOrder.reserved_qty -= item.qty;
          break;
        //default: ;
      }

      requestOrder.save();
      return res.status(200).send({
        status: true,
        message: "ส่งคำขอรายการสต็อกสำเร็จ",
        data: requestOrder,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด " + a });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.comfirm = async (req, res) => {
  try {

    const confirmStock = await Stocks.findOne({ _id: req.params.id });
    if (confirmStock) {
      const newOrder = {
        timestamp: new Date().toISOString(),
        stock_order_status: "approved", //adminอนุมัติ
        requester_user: "mock_Admin",
        approver_user: "mock_Admin",
        remark: req.body.remark || "-",
        detail: req.body.detail || {}
      }

      /* confirmStock.transactions.push({
         ...req.body,
         timestamp: Date.now(),
         approver_user: "mock_admin",
         order_status: "approved", //--  admin อนุมัติ
         remark: req.body.remark,
       });*/
      confirmStock.transactions.push(newOrder)

      //-- คำนวณยอดคงเหลือหลังอนุมัติยอดสต็อก
      const item = req.body.detail

      switch (item["item_status"]) {
        case "income":
          //-- รับเข้าสต๊อก
          confirmStock.balance += item.qty;
          break;
        case "reserved":
          //-- ติดจอง

          /*  confirmStock.reserved_qty += item.qty;
            confirmStock.balance -= item.qty;*/

          break;
        case "encash":
          //-- จำหน่าย หรือ ส่งออกไปแล้ว
          confirmStock.reserved_qty -= item.qty;
          break;
      }

      confirmStock.save();
      return res.status(200).send({
        status: true,
        message: "อนุมัติรายการสต็อกสำเร็จ: " + item.item_status + item.qty,
        data: confirmStock,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.cancel = async (req, res) => {
  try {
    const rejectOrder = await Stocks.findOne({ _id: req.params.id });
    if (rejectOrder) {
      /* rejectOrder.transactions.pop({
         //timestamp: Date.now(),
       });*/

      rejectOrder.transactions.push({
        ...req.body,
        timestamp: Date.now(),
        approver_user: "mock_admin",
        order_status: "rejected", //--  admin ไม่อนุมัติ
        remark: req.body.remark,
      });

      //-- คำนวณยอดคงเหลือหลังอนุมัติยอดสต็อก
      const item = req.body.detail

      switch (item["item_status"]) {
        case "income":
          //-- รับเข้าสต๊อก
          //rejectOrder.balance += item.qty;
          break;
        case "reserved":
          //-- คืนของเข้าสต็อก
          rejectOrder.reserved_qty -= item.qty;
          rejectOrder.balance += item.qty;

          break;
        case "encash":
          //-- จำหน่าย หรือ ส่งออกไปแล้ว
          //rejectOrder.reserved_qty -= item.qty;
          break;
      }

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