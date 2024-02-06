const bcrypt = require("bcrypt");
const { Stocks, validate } = require("../../model/stock/stock.model");
//const stock_order = require("../../controllers/stock/stock_order.controller ");
const { StockOrders } = require("../../model/stock/stock_order.model");

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

    //const salt = await bcrypt.genSalt(Number(process.env.SALT));
    //sconst hashPassword = await bcrypt.hash(req.body.password, salt);

    //const timestamp_1 = new Date().toISOString()
    /*  const newOrder = {
        timestamp: timestamp_1,
        stock_order_status: "created",
        requester_user: "mock_Admin",
        approver_user: "mock_Admin",
        remark: req.body.remark || "-",
        //detail: {}
      }*/
    await new Stocks({
      ...req.body,
      //--initial first transaction stock
      createdDatetime: Date.now(),
      balance: 0,
      //reserved_qty: 0,
      //transactions: newOrder
    }).save();
    return res.status(200).send({ status: true, message: "ลงรายการชื่อสต็อกสำเร็จ" });

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getStockAll = async (req, res) => {
  try {
    const stock_lists = await Stocks.find();
    if (!stock_lists)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลชื่อสต็อกไม่สำเร็จ" });


    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลชื่อสต็อกสำเร็จ", data: stock_lists });
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

exports.holdOrder = async (req, res) => {
  try {
    const stockCard = await Stocks.findOne({ _id: req.params.id });
    if (stockCard) {
      const newOrder = {
        timestamp: new Date().toISOString(),
        stock_order_status: "waiting", //รอ admin
        requester_user: "mock_Admin",
        approver_user: "mock_Admin",
        remark: req.body.remark || "-",
        detail: req.body.detail || {}
      }
      newOrder.detail.stock_order_status = "waiting", //รอ admin

        stockCard.transactions.push(newOrder)
      stockCard.save();

      /* const salt = await bcrypt.genSalt(Number(process.env.SALT));
       const hashPassword = await bcrypt.hash(req.body.password, salt);*/

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

      return res.status(200).send({
        status: true,
        message: " ส่งคำขอรายการสต็อกสำเร็จ : " + item_log.item_status + item_log.qty,
        data: stockCard,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.comfirm = async (req, res) => {
  try {
    //const request_qty = req.body.detail.qty
    const wait_stockCard = await StockOrders.findById(req.params.id);
    const timestamp_1 = new Date().toISOString();

    //const item = req.body
    // const alert_qty = confirm_stockCard.minimim_alert_qty || 0
    const alert_qty = 0
    let isPassCheck = false;

    if (wait_stockCard) {
      const one_stock_list = await Stocks.findById(wait_stockCard.stock_order_id);

      const balance = one_stock_list.balance
      //-- คำนวณยอดคงเหลือหลังขอยั๊ก สินค้าในสต็อก

      switch (wait_stockCard["item_status"]) {
        case "income":
          //-- รับเข้าสต๊อก
          one_stock_list.balance += wait_stockCard.qty;

          // confirm_stockCard.transactions.push(newOrder);

          one_stock_list.timestamp = timestamp_1
          one_stock_list.save();
          isPassCheck = true;
          break;
        case "reserved":
          //-- ติดจอง
          //รีเควสของเกิน(สินค้าคงคลัง-สต็อกคงคลังขั้นต่ำ) ให้ดีดออก
          if ((balance - alert_qty) > wait_stockCard.qty) {
            //if (alert_qty < item.qty) {
            // confirm_stockCard.transactions.push(newOrder);

            // one_stock_list.reserved_qty += item.qty;
            one_stock_list.balance -= wait_stockCard.qty;

            one_stock_list.timestamp = timestamp_1
            one_stock_list.save();
            isPassCheck = true;

            break;
          } else {
            return res.status(403).send({ message: "เกิดข้อผิดพลาด reserved", item_qty: wait_stockCard.qty });
          }

        // break;
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
        //default: ;
      }

      if (isPassCheck) {
        //-- ส่งไปเก็บใน stock_orders
        //        const item_log1 = req.body.detail
        const item_log1 = wait_stockCard
        await new StockOrders({
          ...wait_stockCard,
          timestamp: Date.now(),
          // stock_order_id: req.body.stock_order_id,
          // branch_oid: "65aa1506f866895c9585e033",
          // branchName: "HQ",
          //isHqAdminOnly: true,
          stock_order_status: "approved",
          approver_user: req.body.approver_user || "",
        }).save();

        //one_stock_list = await Stocks.findById(wait_stockCard.stock_order_id);
        return res.status(200).send({
          status: true,
          message: "อนุมัติรายการสต็อกสำเร็จ ",
          // data: one_stock_list,
        });

      }
      /* await new StockOrders({
         ...item,
         timestamp: Date.now(),
         stock_order_status: "approved",
         approver_user: "mock_admin"
       })*/



      /* const newOrder = {
         timestamp: new Date().toISOString(),
         stock_order_status: "approved", //adminอนุมัติ
         requester_user: "mock_Admin",
         approver_user: "mock_Admin",
         remark: req.body.remark || "-",
         detail: req.body.detail || {}
       }
       newOrder.detail.stock_order_status = "approved"  //ปรับ status adminอนุมัติ
   */
    }
    else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด_3", alert_qty: alert_qty });
    }

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
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
        approver_user: "mock_admin",
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