const bcrypt = require("bcrypt");
const { StockOrders, validate } = require("../../model/stock/stock_order.model");
const { Stocks } = require("../../model/stock/stock.model");
const { Orders } = require("../../model/order/order.model");

exports.create = async (req, res) => {
  try {
    let data = req.body
    const { error } = validate(data);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });

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
      product_oid: stock_card.product_oid,
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

exports.comfirm = async (req, res) => {
  try {
    //const one_order = req.body;

    const wait_stockCard = await StockOrders.findById(req.params.id);
    const timestamp_1 = new Date().toISOString();

    // const alert_qty = confirm_stockCard.minimim_alert_qty || 0
    const alert_qty = 0
    let isPassCheck = false;
    const search_id = wait_stockCard.stock_info_oid;
    if (wait_stockCard) {
      const one_stock_list = await Stocks.findById(search_id);

      const balance = one_stock_list.balance
      //-- คำนวณยอดคงเหลือหลังขอยั๊ก สินค้าในสต็อก
      const item_status = wait_stockCard["item_status"]
      switch (item_status) {
        case "income":

          //-- รับเข้าสต๊อก
          one_stock_list.balance += wait_stockCard.qty;

          one_stock_list.timestamp = timestamp_1
          one_stock_list.save();
          isPassCheck = true;
          break;
        case "reserved":

          //-- ติดจอง
          //รีเควสของเกิน(สินค้าคงคลัง-สต็อกคงคลังขั้นต่ำ) ให้ดีดออก
          if ((balance - alert_qty) > wait_stockCard.qty) {

            // one_stock_list.reserved_qty += item.qty;
            one_stock_list.balance -= wait_stockCard.qty;

            one_stock_list.timestamp = timestamp_1
            one_stock_list.save();
            isPassCheck = true;

            break;
          } else {
            return res.status(403).send({ message: "เกิดข้อผิดพลาด reserved", item_qty: wait_stockCard.qty });
          }
        case "withdraw":
          //-- จำหน่าย หรือ ส่งออกไปแล้ว
          if ((balance - alert_qty) > wait_stockCard.qty) {
            one_stock_list.reserved_qty -= wait_stockCard.qty;
            //one_stock_list.transactions.push(newOrder);

            one_stock_list.timestamp = timestamp_1
            one_stock_list.save();
            isPassCheck = true;

            break;
          } else {
            return res.status(403).send({ message: "เกิดข้อผิดพลาด withdraw", item_qty: wait_stockCard.qty });
          }
        default:
          return res.status(403).send({ message: "เกิดข้อผิดพลาด:", item_status });
      }

      if (isPassCheck) {

        //-- ส่งไปเก็บใน stock_orders
        const stock_card = wait_stockCard;
        const item_log1 = {
          order_oid: stock_card.order_oid,
          stock_order_status: stock_card.stock_order_status,
          stock_order_id: stock_card.stock_order_id,
          branch_oid: stock_card.branch_oid,
          product_oid: stock_card.product_oid,
          stock_category: stock_card.stock_category,
          item_status: stock_card.item_status,
          qty: stock_card.qty,
          requester_user: stock_card.requester_user,
          remark: stock_card.remark,
        }
        await new StockOrders({
          ...item_log1,
          timestamp: Date.now(),
          stock_order_status: "approved",
          approver_user: req.body.approver_user || "mock_admin",
        }).save();

        /* if (!item)
           return res.status(403)
             .send({ status: false, message: "ส่งรายการบันทึกไม่สำเร็จ" });*/

        //-- push to order status
        const updateStatus = await Orders.findById(stock_card.order_oid);

        if (updateStatus) {
          updateStatus.update_status.push({
            stock_order_id: "order_test1",
            name: "แพ็คสินค้าลงกล่อง",
            approver_user: "mock_admin",
            timestamp: new Date().toISOString(),
          });
          updateStatus.save();


          return res.status(200)
            .send({
              status: true,
              message: "อนุมัติรายการสต็อกสำเร็จ ",

            });
        }
      }
    }
    else {
      return res.status(403)
        .send({ message: "เกิดข้อผิดพลาด_3", alert_qty: alert_qty });
    }
  } catch (err) {
    return res.status(500)
      .send({ message: "Internal Server Error" });
  }
};

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