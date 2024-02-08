const bcrypt = require("bcrypt");
const { Stocks, validate } = require("../../model/stock/stock.model");
//const stock_order = require("../../controllers/stock/stock_order.controller ");
const { StockOrders } = require("../../model/stock/stock_order.model");
const { Products } = require("../../test_SplitPriceAndProduct/model/product/product.model");
const { Orders } = require("../../model/order/order.model")
const { Branchs } = require("../../model/branch/branch.model");
var _ = require("lodash")

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const stock_info = await Stocks.findOne({
      branch_oid: req.body.branch_oid,
      stock_name: req.body.stock_name,
    });
    if (stock_info)
      return res.status(401).send({
        status: false,
        message: "มีคลังสต็อกนี้ในระบบเเล้ว",
      });

    await new Stocks({
      ...req.body,
      //--initial first transaction stock
      createdDatetime: Date.now(),

      //transactions: newOrder
    }).save().then((item) => {
      if (!item) {
        return res.status(404)
          .send({ status: false, message: "สร้างสต็อกไม่สำเร็จ" });
      }
      return res.status(200)
        .send({ status: true, message: "สร้างคลังสต็อกสำเร็จ", data: item });
    });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getStockAll = async (req, res) => {
  try {

    const stock_lists = await Stocks.find();
    const stock_order_lists = await StockOrders.find({
      stock_order_status: "approved"
    });
    const product_lists = await Products.find()
    const branch_lists = await Branchs.find()

    if (!stock_lists)
      return res.status(404)
        .send({ status: false, message: "ดึงข้อมูลชื่อสต็อกไม่สำเร็จ" });
    if (stock_order_lists.length === 0)
      return res.status(404)
        .send({ status: false, message: "ไม่พบการเดินรายการสต็อก" });

    //-- เอาไปใส่ใน items
    _.forEach(stock_lists, (val1, index1) => {
      const search_a = val1.stock_category
      //---ดึง branch name
      const search_c = _.find(branch_lists, (item) => {
        if (item.id === val1.branch_oid) {
          return item.name
        }
      })
      //-- initial for items
      val1.branch_name = search_c.name
      val1.total_qty = 0
      val1.stock_count = 0


      let summary_one_product = _.reduce(stock_order_lists, (result, val2, key2) => {

        //----เช็คstock_category มันต้องตรงกัน
        if (search_a === val2.stock_category) {

          //ถ้าเป็น จองของ เบิกออก กลับค่าเป็น ลบ
          let count = val2.qty
          if (val2.item_status == "reserved" || val2.item_status == "witdraw") {
            count = -Math.abs(count)
          }

          //-- รวมยอดproduct ในสต็อก
          if (!result[val2.product_oid]) {

            let search_b = _.find(product_lists, (item) => {
              if (item.id === val2.product_oid) {
                return item.product_name
              }

            })

            result[val2.product_oid] = {
              product_oid: val2.product_oid,
              product_name: search_b.product_name || "",
              qty: count
            }
            return result
          }
          result[val2.product_oid].qty += count;

          //          result = data_a
          //result.push(data_a)
          return result
        }

      }, {})

      //--- ดึงใส้ใน reduceออกมาใช้
      _.forEach(summary_one_product, (val3, index1) => {
        val1.items.push(val3)
        val1.total_qty += val3.qty
        val1.stock_count++
      })

    })

    return res.status(200)
      .send({ status: true, message: "ดึงข้อมูลรายการสต็อกสำเร็จ", data: stock_lists });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getStockByBranch_oid = async (req, res) => {
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
        // approver_user: "mock_admin",
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
        //requester_user: "mock_Admin",
        // approver_user: "mock_Admin",
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
          approver_user: req.body.approver_user,
        }).save().then((item) => {

          if (!item)
            return res.status(403)
              .send({ status: false, message: "ส่งรายการบันทึกไม่สำเร็จ" });

          return res.status(200)
            .send({
              status: true,
              message: "อนุมัติรายการสต็อกสำเร็จ ",
              data: item,
            });
        });
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