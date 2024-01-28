const bcrypt = require("bcrypt");
const { StockOrders, validate } = require("../../model/stock/stock_order.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    /*const stockName = await StockOrders.find({
      id: req.body.id,
    });*/
    const stockName = undefined;
    if (stockName)
      return res.status(401).send({
        status: false,
        message: "รายการบันทึกสต็อกนี้ มีในระบบเเล้ว",
      });

    /* const salt = await bcrypt.genSalt(Number(process.env.SALT));
     const hashPassword = await bcrypt.hash(req.body.password, salt);*/
    await new StockOrders({
      ...req.body,
      timestamp: Date.now(),
      stock_order_id: req.body.stock_order_id,
      branch_oid: "65aa1506f866895c9585e033",
      branchName: "HQ",
      isHqAdminOnly: true,
      product_oid: req.body.product_oid,
      product_barcode: req.body.product_barcode,
      product_name: req.body.product_name,
      stock_category: req.body.stock_category || "-",
      item_status: req.body.item_status,
      qty: req.body.qty,
      requester_user: "mock_Admin",
      approver_user: "mock_Admin",
      stock_order_status: req.body.stock_order_status,
      remark: req.body.remark || "-",

    }).save();
    return res.status(200).send({ status: true, message: "บันทึกรายการเคลื่อนไหวสต็อกสำเร็จ" });

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getStockOrderAll = async (req, res) => {
  try {
    const agent = await StockOrders.find();
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงรายการเคลื่อนไหวสต็อกไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงรายการเคลื่อนไหวสต็อกสำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getStockById = async (req, res) => {
  try {
    const id = req.params.id;
    const agent = await StockOrders.findById(id);
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงรายการเคลื่อนไหวสต็อกไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงรายการเคลื่อนไหวสต็อกสำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งรายการเคลื่อนไหวสต็อกผิดพลาด1" });
    const id = req.params.id;
    if (!req.body.password) {
      StockOrders.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then((item) => {
          if (!item)
            return res
              .status(404)
              .send({ status: false, message: "แก้ไขรายการเคลื่อนไหวสต็อกไม่สำเร็จ1" });
          return res
            .status(200)
            .send({ status: true, message: "แก้ไขรายการเคลื่อนไหวสต็อกสำเร็จ" });
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
      StockOrders.findByIdAndUpdate(
        id,
        { ...req.body, password: hashPassword },
        { useFindAndModify: false }
      )
        .then((item) => {
          if (!item)
            return res
              .status(404)
              .send({ status: false, message: "แก้ไขรายการเคลื่อนไหวสต็อกไม่สำเร็จ2" });
          return res
            .status(200)
            .send({ status: true, message: "แก้ไขรายการเคลื่อนไหวสต็อกสำเร็จ" });
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
    StockOrders.findByIdAndDelete(id, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({ message: "ไม่สามารถลบรายการเคลื่อนไหวสต็อกนี้ได้" });
        return res.status(200).send({ message: "ลบรายการเคลื่อนไหวสต็อกสำเร็จ" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบรายการเคลื่อนไหวสต็อกนี้ได้",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

/*exports.holdOrder = async (req, res) => {
  try {

    const requestOrder = await StockOrders.findOne({ _id: req.params.id });
    if (requestOrder) {
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
        message: "ส่งคำขอรายการเคลื่อนไหวสต็อกสำเร็จ",
        data: requestOrder,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};*/
/*exports.holdOrderById = async (req, res) => {
  let a = req.params.oid

  try {
    let a = req.params.oid
    const requestOrder = await StockOrders.findOne({
      _id: req.params.id,
    });

    if (requestOrder) {
      // let b = requestOrder.transactions
      // let a = requestOrder.transactions[b.length - 1].detail.order_id
      debugger
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
        message: "ส่งคำขอรายการเคลื่อนไหวสต็อกสำเร็จ",
        data: requestOrder,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด " + a });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};*/

/*exports.comfirm = async (req, res) => {
  try {

    const confirmStock = await StockOrders.findOne({ _id: req.params.id });
    if (confirmStock) {
      confirmStock.transactions.push({
        ...req.body,
        timestamp: Date.now(),
        approver_user: "mock_admin",
        order_status: "approved", //--  admin อนุมัติ
        remark: req.body.remark,
      });

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
            //confirmStock.balance -= item.qty;

          break;
        case "encash":
          //-- จำหน่าย หรือ ส่งออกไปแล้ว
          confirmStock.reserved_qty -= item.qty;
          break;
      }

      confirmStock.save();
      return res.status(200).send({
        status: true,
        message: "อนุมัติรายการเคลื่อนไหวสต็อกสำเร็จ: " + item.item_status + item.qty,
        data: confirmStock,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};*/
/*exports.cancel = async (req, res) => {
  try {
    const rejectOrder = await StockOrders.findOne({ _id: req.params.id });
    if (rejectOrder) {
      /* rejectOrder.transactions.pop({
         //timestamp: Date.now(),
       });

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
  message: "ยกเลิกคำขอรายการเคลื่อนไหวสต็อกสำเร็จ",
  data: rejectOrder,
});
    } else {
  return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
}
  } catch (err) {
  return res.status(500).send({ message: "Internal Server Error" });
}
};*/