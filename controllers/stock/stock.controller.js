const bcrypt = require("bcrypt");
const { Stocks, validate } = require("../../model/stock/stock.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const stockName = await Stocks.findOne({
      product_barcode_id: req.body.product_barcode_id,
    });
    if (stockName)
      return res.status(401).send({
        status: false,
        message: "มีชื่อสต็อกนี้ในระบบเเล้ว",
      });

    /* const salt = await bcrypt.genSalt(Number(process.env.SALT));
     const hashPassword = await bcrypt.hash(req.body.password, salt);*/
    await new Stocks({
      ...req.body,
      //--initial first transaction stock
      timestamp: Date.now(),
      balance: 0,
      reserved_qty: 0,
      transactions: {
        timestamp: Date.now(),
        branch_id: req.body.branch_id,
        branchName: req.body.branchName,
        isHqAdminOnly: req.body.isHqAdminOnly,
        product_barcode_id: req.body.product_barcode_id,
        product_name: req.body.product_name,
        stock_category: "",
        qty: 0,
        item_status: "received",
        requester_user: "mock_Admin",
        approver_user: "mock_Admin",
        remark: "-",
      }
    }).save();
    return res.status(200).send({ status: true, message: "ลงชื่อสต็อกสำเร็จ" });

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


exports.comfirm = async (req, res) => {
  try {

    const confirmStock = await Stocks.findOne({ _id: req.params.id });
    if (confirmStock) {
      confirmStock.transactions.push({
        ...req.body,
        //timestamp: Date.now(), // -- เวลาทับของเก่า
      });

      //-- คำนวณยอดคงเหลือหลังอนุมัติยอดสต็อก
      const item = req.body

      switch (item["item_status"]) {
        case "received":
          //-- รับเข้าสต๊อก
          confirmStock.balance += item.qty;
          break;
        case "reserved":
          //-- ติดจอง

          confirmStock.reserved_qty += item.qty;
          confirmStock.balance -= item.qty;

          break;
        case "encash":
          //-- จำหน่าย หรือ ส่งออกไปแล้ว
          confirmStock.reserved_qty -= item.qty;
          break;
      }

      confirmStock.save();
      return res.status(200).send({
        status: true,
        message: "อนุมัติรายการสต็อกสำเร็จ",
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
    const updateStatus = await Stocks.findOne({ _id: req.params.id });
    if (updateStatus) {
      updateStatus.transactions.pop({
        //timestamp: Date.now(),
      });

      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "ยกเลิกอนุมัติชื่อสต็อกสำเร็จ",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};