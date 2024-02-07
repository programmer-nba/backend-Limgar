const bcrypt = require("bcrypt");
const { StockOrders, validate } = require("../../model/stock/stock_order.model");
const { Stocks } = require("../../model/stock/stock.model");
const { Orders } = require("../../model/order/order.model");

exports.create = async (req, res) => {
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
      item_status: one_order.item_status,
      qty: one_order.qty,
      requester_user: one_order.requester_user,
      remark: one_order.remark,
    }
    await new StockOrders({
      ...item_log1,
      timestamp: Date.now(),
      stock_order_status: "waitting",
      approver_user: req.body.approver_user || "mock_admin",
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

exports.getStockByProduct_oid = async (req, res) => {
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

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};*/
/*exports.holdOrderById = async (req, res) => {
  let a = req.params.oid

  try {
   
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};*/

exports.comfirm = async (req, res) => {
  try {
    //const one_order = req.body;

    const wait_stockCard = await StockOrders.findById(req.params.id);

    if (wait_stockCard) {
      const check_status = wait_stockCard.stock_order_status

      if (check_status != "waitting") {
        return res.status(403)
          .send({ status: false, message: "พบข้อผิดพลาด ", data: check_status });
      }

      wait_stockCard.timestamp = Date.now()
      wait_stockCard.stock_order_status = "approved"

      wait_stockCard.status.push({
        name: "approved",
        timestamp: Date.now(),
      });
      wait_stockCard.save();

      if (wait_stockCard.item_status === "reserved") {

        //-- push update status to order status
        const updateStatus = await Orders.findById(stock_card.order_oid);

        if (updateStatus) {
          updateStatus.update_status.push({
            stock_order_id: wait_stockCard.id,
            name: "แพ็คสินค้าลงกล่อง",
            approver_user: "mock_admin",
            timestamp: new Date().toISOString(),
          });
          updateStatus.save();
        }
      }

      return res.status(200)
        .send({
          status: true,
          message: "อนุมัติรายการสต็อกสำเร็จ ",
        });

    } else {
      return res.status(404).send({ message: "ไม่พบ รายการสต๊อกนี้" });
    }

  } catch (err) {
    return res.status(500)
      .send({ message: "Internal Server Error" });
  }
};

/*exports.cancel = async (req, res) => {
  try {
    
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