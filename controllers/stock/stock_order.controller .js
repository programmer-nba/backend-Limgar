const bcrypt = require("bcrypt");
const { StockOrders, validate } = require("../../model/stock/stock_order.model");
const { Stocks } = require("../../model/stock/stock.model");
const { Orders } = require("../../model/order/order.model");
const { StocksSummary } = require("../../model/stock/stock_summary.model");
const { Products } = require("../../test_SplitPriceAndProduct/model/product/product.model");
const _ = require("lodash");

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

    const one_product = await Products.findById(one_order.product_oid);
    if (!one_product)
      return res.status(404).send({
        status: false,
        message: "ไม่พบชื่อสินค้านี้",
      });

    //-- ส่งไปเก็บใน stock_orders
    const stock_card = one_stock_list;
    const item_log1 = {
      order_oid: one_order.order_oid,
      stock_info_oid: stock_card.id,
      branch_oid: stock_card.branch_oid,
      product_oid: one_order.product_oid,
      product_name: one_product.product_name,
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

exports.create_reserved = async (req, res) => {
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
      item_status: "reserved",
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
  //--confirm order income

  try {
    //const one_order = req.body;

    const wait_stockCard = await StockOrders.findById(req.params.id);


    if (wait_stockCard) {
      const check_status = wait_stockCard.stock_order_status

      if (check_status != "waitting") {
        return res.status(403)
          .send({ status: false, message: "พบข้อผิดพลาด ", data: check_status });
      }

      //-- เรียก Summary_stock
      const summary_stockCard = await StocksSummary.findOne({
        branch_oid: wait_stockCard.branch_oid,
        stock_info_oid: wait_stockCard.stock_info_oid
      });

      if (!summary_stockCard) {
        return res.status(404)
          .send({ status: false, message: "ไม่พบสต็อก ", data: check_status });
      }

      //--- add รายการเปล่าก่อน
      let data_b = {

        timestamp: new Date().toISOString(),
        //stock_category: wait_stockCard.stock_category,
        product_oid: wait_stockCard.product_oid,
        product_name: wait_stockCard.product_name,
        qty: 0
      }
      if (summary_stockCard.items.length == 0) {

        summary_stockCard.items.push(data_b)
        await summary_stockCard.save();
      } else {

        let search_b = _.find(summary_stockCard.items, (one_item) => {
          return one_item.product_oid === wait_stockCard.product_oid
        })

        if (!search_b) {
          summary_stockCard.items.push(data_b)
          await summary_stockCard.save();
        } else {
          data_b = {
            timestamp: new Date().toISOString(),
            product_oid: search_b.product_oid,
            product_name: search_b.product_name,
            qty: search_b.qty,
          }
        }
      }

      //---  เริ่มปรับค่าในstock summary
      let data_a = summary_stockCard.balance;
      if (wait_stockCard.item_status === "income") {
        data_a = summary_stockCard.balance + wait_stockCard.qty
        data_b.qty += wait_stockCard.qty

      } else if (wait_stockCard.item_status === "reserved") {
        if (summary_stockCard.balance < wait_stockCard.qty) {
          return res.status(401)
            .send({ status: false, message: "รายการร้องขอไม่ถูกต้อง qty", request_qty: wait_stockCard.qty });
        }

        if (wait_stockCard.item_status === "reserved") {
          data_b.qty = data_b.qty - (wait_stockCard.qty)
        }

        //-- ตัดของออกสต๊อก
        data_a = summary_stockCard.balance - wait_stockCard.qty
      }

      //summary_stockCard.items.push(data_b)
      // await summary_stockCard.save();

      let data_c = []
      data_c.push(data_b)
      let data_d
      const id = summary_stockCard.id
      const wait_stockCard_2 = await StocksSummary.findById(id)
      if (wait_stockCard_2) {

        wait_stockCard_2.balance = data_a
        //wait_stockCard_2.items.push(data_b);

        data_d = wait_stockCard_2.items.map(obj => data_c.find(o => o.product_oid === obj.product_oid) || obj)

        //console.log(data_d)
        //});
        wait_stockCard_2.timestamp = new Date().toISOString()
        wait_stockCard_2.items = data_d
        wait_stockCard_2.total_product = wait_stockCard_2.items.length
      }
      wait_stockCard_2.save();

      if (wait_stockCard.item_status === "reserved") {

        //-- push update status to order status
        const updateStatus = await Orders.findById(wait_stockCard.order_oid);

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

      //-- update approved
      wait_stockCard.timestamp = Date.now()
      wait_stockCard.stock_order_status = "approved"

      wait_stockCard.status.push({
        name: "approved",
        timestamp: Date.now(),
      });
      await wait_stockCard.save();


      return res.status(200)
        .send({
          status: true,
          message: "อนุมัติรายการสต็อกสำเร็จ ", data: data_d,
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