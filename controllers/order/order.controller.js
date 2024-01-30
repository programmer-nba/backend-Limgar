const bcrypt = require("bcrypt");
const { Orders, validate } = require("../../model/order/order.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const orderCard = await Orders.findOne({
      product_barcode_id: req.body.product_barcode_id,
    });
    if (orderCard)
      return res.status(401).send({
        status: false,
        message: "มีออเดอร์นี้ในระบบเเล้ว",
      });

    /* const salt = await bcrypt.genSalt(Number(process.env.SALT));
     const hashPassword = await bcrypt.hash(req.body.password, salt);*/
    await new Orders({
      ...req.body,


    }).save();
    return res.status(200).send({ status: true, message: "ลงออเดอร์สำเร็จ" });

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getOrderAll = async (req, res) => {
  try {
    const agent = await Orders.find();
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลออเดอร์ไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลออเดอร์สำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const agent = await Orders.findById(id);
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลออเดอร์ไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลออเดอร์สำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งข้อมูลออเดอร์ผิดพลาด1" });
    const id = req.params.id;
    if (!req.body.password) {
      Orders.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then((item) => {
          if (!item)
            return res
              .status(404)
              .send({ status: false, message: "แก้ไขข้อมูลออเดอร์ไม่สำเร็จ1" });
          return res
            .status(200)
            .send({ status: true, message: "แก้ไขข้อมูลออเดอร์สำเร็จ" });
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
      Orders.findByIdAndUpdate(
        id,
        { ...req.body, password: hashPassword },
        { useFindAndModify: false }
      )
        .then((item) => {
          if (!item)
            return res
              .status(404)
              .send({ status: false, message: "แก้ไขข้อมูลออเดอร์ไม่สำเร็จ2" });
          return res
            .status(200)
            .send({ status: true, message: "แก้ไขข้อมูลออเดอร์สำเร็จ" });
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
    Orders.findByIdAndDelete(id, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({ message: "ไม่สามารถลบข้อมูลออเดอร์นี้ได้" });
        return res.status(200).send({ message: "ลบข้อมูลออเดอร์สำเร็จ" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบข้อมูลออเดอร์นี้ได้",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.holdOrder = async (req, res) => {
  try {

    const requestOrder = await Orders.findOne({ _id: req.params.id });
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
        message: "ส่งคำขอรายการสต็อกสำเร็จ",
        data: requestOrder,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
exports.holdOrderById = async (req, res) => {
  let a = req.params.oid

  try {
    let a = req.params.oid
    const requestOrder = await Orders.findOne({
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

    const confirmStock = await Orders.findOne({ _id: req.params.id });
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
    const rejectOrder = await Orders.findOne({ _id: req.params.id });
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