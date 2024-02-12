const bcrypt = require("bcrypt");
const { Stocks } = require("../../model/stock/stock.model");
const { StocksSummary, validate } = require("../../model/stock/stock_summary.model");
//const stock_order = require("../../controllers/stock/stock_order.controller ");
const { StockOrders } = require("../../model/stock/stock_order.model");
const { Products } = require("../../model/product/product.model");
const { ProductsPrice } = require("../../model/product/product_price.model");
const { Orders } = require("../../model/order/order.model")
const { Branchs } = require("../../model/branch/branch.model");
var _ = require("lodash");
const { Schema } = require("mongoose");

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

    if (stock_summary_lists.length === 0)
      return res.status(404)
        .send({ status: false, message: "ไม่พบ รายการสต็อกในสาขานี้" });

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

exports.add_stock = async (req, res) => {
  try {

    let data = req.body
    const { error } = validate(data);
    if (error)
      return res.status(403)
        .send({ message: error.details[0].message, status: false });

    /*  if (data.qty === 0)
        return res.status(403)
          .send({ message: "จำนวนไม่ถูกต้อง", qty: data.qty, status: false });*/

    const one_order = data;
    const one_stock_list = await Stocks.findById(one_order.stock_info_oid);

    if (!one_stock_list)
      return res.status(404).send({
        status: false,
        message: "ไม่พบคลังสต็อกนี้",
      });

    /* const one_product_price = await ProductsPrice.findById(one_order.product_price_oid);
     if (!one_product_price)
       return res.status(404).send({
         status: false,
         message: "ไม่พบแพ็กราคาสินค้านี้",
       });*/

    /* const one_product = await Products.findById(one_order.product_oid);
     if (!one_product)
       return res.status(404).send({
         status: false,
         message: "ไม่พบชื่อสินค้านี้",
       });*/

    //-- หาทั้งหมด
    const product_list = await Products.find();
    if (!product_list)
      return res.status(404).send({
        status: false,
        message: "ไม่พบรายชื่อสินค้า",
      });


    //-- สร้างobjเก็บคำสั่ง
    const one_stockCard = new Schema({
      order_oid: { type: String },
      stock_info_oid: { type: String },
      branch_oid: { type: String },
      product_oid: [{ type: String }],
      product_price_oid: { type: String },
      unit_perPack: { type: Number },
      product_name: { type: String },
      stock_category: { type: String },
      //--- one order --
      item_status: { type: String },
      qty: { type: Number },
      total_count: { type: Number },
      // requester_user: { type: String },
      approver_user: { type: String },
      remark: { type: String },
    })

    //-- เรียก Summary_stock
    const summary_stockCard = await StocksSummary.findOne({
      branch_oid: one_stock_list.branch_oid,
      stock_info_oid: one_stock_list.id
    });

    if (!summary_stockCard) {
      return res.status(404)
        .send({ status: false, message: "ไม่พบสต็อก " });
    }

    // _.forIn(one_order.product_oid, async (val1, key1) => {
    for (let val1 of one_order.product_oid) {

      let one_product = _.find(product_list, (one_item) => {
        return one_item.id === val1
      })

      one_stockCard.stock_info_oid = one_stock_list.id
      one_stockCard.branch_oid = one_stock_list.branch_oid
      one_stockCard.product_oid = one_product.id
      one_stockCard.product_name = one_product.product_name || "-"
      one_stockCard.stock_category = one_stock_list.stock_category || "-"

      //one_stockCard.product_price_oid = one_order.product_price_oid
      //one_stockCard.unit_perPack = one_order.amount
      one_stockCard.remark = one_order.remark || "-"
      one_stockCard.item_status = "Created"

      one_stockCard.qty = 0
      // one_stockCard.total_count = 0
      //--

      const wait_stockCard = one_stockCard

      //-- เรียก Summary_stock
      /*  const summary_stockCard = await StocksSummary.findOne({
          branch_oid: wait_stockCard.branch_oid,
          stock_info_oid: wait_stockCard.stock_info_oid
        });
  
        if (!summary_stockCard) {
          return res.status(404)
            .send({ status: false, message: "ไม่พบสต็อก ", data: check_status });
        }*/

      //--- add รายการเปล่าก่อน
      let data_b = {

        timestamp: new Date().toISOString(),
        stock_category: wait_stockCard.stock_category,
        product_price_oid: wait_stockCard.product_price_oid,
        product_oid: val1,
        product_name: wait_stockCard.product_name,
        unit_perPack: wait_stockCard.unit_perPack,
        // total_count: 0,
        qty: 0
      }
      /*  // -- หารายการสต๊อกซ้ำ 
        let search_b = _.find(summary_stockCard.items, (one_item) => {
          return one_item.product_price_oid === wait_stockCard.product_price_oid
        })*/

      // -- หารายการสต๊อกซ้ำ 
      let search_b = _.find(summary_stockCard.items, (one_item) => {
        return one_item.product_oid === val1
      })

      /*if (search_b) {
        return res.status(403)
          .send({ status: false, message: "มีรายการสต็อกนี้แล้ว" });
      }*/

      // -- ไม่มีidซ้ำ ใส่เข้าsummary_stockCard
      if (!search_b) {
        summary_stockCard.items.push(data_b)
        await summary_stockCard.save();

        //-- ใส่กลับเข้าไปใน items
        let data_c = []
        data_c.push(data_b)
        let data_d
        const id = summary_stockCard.id
        const wait_stockCard_2 = await StocksSummary.findById(id)
        if (wait_stockCard_2) {

          //wait_stockCard_2.balance = data_a

          // -- map by product_price_oid
          // data_d = wait_stockCard_2.items.map(obj => data_c.find(o => o.product_price_oid === obj.product_price_oid) || obj)

          // -- map by product_oid
          data_d = wait_stockCard_2.items.map(obj => data_c.find(o => o.product_oid === obj.product_oid) || obj)

          //console.log(data_d)
          wait_stockCard_2.timestamp = new Date().toISOString()
          wait_stockCard_2.items = data_d
          wait_stockCard_2.total_product = wait_stockCard_2.items.length
        }
        await wait_stockCard_2.save();

        //-- เก็บgเข้า Stock Log
        await new StockOrders({
          ...one_stockCard,
          product_oid: val1,
          timestamp: Date.now(),
          // approver_user: req.body.approver_user || "mock_admin",
          status: {
            timestamp: Date.now(),
            name: "approved",
          }
        }).save();

      }

    }

    return res.status(200)
      .send({ status: true, message: "บันทึกรายการเคลื่อนไหวสต็อกสำเร็จ" });

  }
  catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.income = async (req, res) => {
  try {
    let data = req.body
    const { error } = validate(data);
    if (error)
      return res.status(403)
        .send({ message: error.details[0].message, status: false });

    /*  if (data.qty === 0)
        return res.status(403)
          .send({ message: "จำนวนไม่ถูกต้อง", qty: data.qty, status: false });*/

    const one_order = data;
    const one_stock_list = await Stocks.findById(one_order.stock_info_oid);

    if (!one_stock_list)
      return res.status(404).send({
        status: false,
        message: "ไม่พบคลังสต็อกนี้",
      });

    const product_price_list = await ProductsPrice.find();
    if (!product_price_list)
      return res.status(404).send({
        status: false,
        message: "ไม่พบแพ็กราคาสินค้านี้",
      });

    /* const one_product = await Products.findById(one_order.product_oid);
     if (!one_product)
       return res.status(404).send({
         status: false,
         message: "ไม่พบชื่อสินค้านี้",
       });*/

    //-- หาทั้งหมด
    const product_list = await Products.find();
    if (!product_list)
      return res.status(404).send({
        status: false,
        message: "ไม่พบรายชื่อสินค้า",
      });


    //-- สร้างobjเก็บคำสั่ง
    const one_stockCard = new Schema({
      order_oid: { type: String },
      stock_info_oid: { type: String },
      branch_oid: { type: String },
      product_oid: [{ type: String }],
      product_price_oid: { type: String },
      unit_perPack: { type: Number },
      product_name: { type: String },
      stock_category: { type: String },
      //--- one order --
      item_status: { type: String },
      qty: { type: Number },
      total_count: { type: Number },
      // requester_user: { type: String },
      approver_user: { type: String },
      remark: { type: String },
    })

    //-- เรียก Summary_stock
    const summary_stockCard = await StocksSummary.findOne({
      branch_oid: one_stock_list.branch_oid,
      stock_info_oid: one_stock_list.id
    });

    if (!summary_stockCard) {
      return res.status(404)
        .send({ status: false, message: "ไม่พบสต็อก " });
    }

    // _.forIn(one_order.product_oid, async (val1, key1) => {
    for (let val1 of one_order.product_price_oid) {


      let one_product_price = _.find(product_price_list, (one_item) => {
        return one_item.id === val1
      })

      let one_product = _.find(product_list, (one_item) => {
        return one_item.id === one_product_price.product_oid
      })

      one_stockCard.stock_info_oid = one_stock_list.id
      one_stockCard.branch_oid = one_stock_list.branch_oid
      one_stockCard.product_oid = one_product_price.product_oid
      one_stockCard.product_name = one_product.product_name || "-"
      one_stockCard.stock_category = one_stock_list.stock_category || "-"

      //one_stockCard.product_price_oid = one_order.product_price_oid
      //one_stockCard.unit_perPack = one_order.amount
      one_stockCard.remark = one_order.remark || "-"
      one_stockCard.item_status = "income"

      one_stockCard.qty = one_product_price.amount
      // one_stockCard.total_count = 0
      //--

      const wait_stockCard = one_stockCard

      //-- เรียก Summary_stock
      /*  const summary_stockCard = await StocksSummary.findOne({
          branch_oid: wait_stockCard.branch_oid,
          stock_info_oid: wait_stockCard.stock_info_oid
        });
  
        if (!summary_stockCard) {
          return res.status(404)
            .send({ status: false, message: "ไม่พบสต็อก ", data: check_status });
        }*/

      //--- add รายการเปล่าก่อน
      let data_b = {

        timestamp: new Date().toISOString(),
        stock_category: wait_stockCard.stock_category,
        // product_price_oid: wait_stockCard.product_price_oid,
        product_oid: wait_stockCard.product_oid,
        product_name: wait_stockCard.product_name,
        //unit_perPack: wait_stockCard.unit_perPack,
        // total_count: 0,
        qty: wait_stockCard.qty
      }
      /*  // -- หารายการสต๊อกซ้ำ 
        let search_b = _.find(summary_stockCard.items, (one_item) => {
          return one_item.product_price_oid === wait_stockCard.product_price_oid
        })*/

      // -- หารายการสต๊อกซ้ำ 
      /*  let search_b = _.find(summary_stockCard.items, (one_item) => {
          return one_item.product_oid === one_product.id
        })*/

      /*if (search_b) {
        return res.status(403)
          .send({ status: false, message: "มีรายการสต็อกนี้แล้ว" });
      }*/

      // -- ไม่มีidซ้ำ ใส่เข้าsummary_stockCard
      // if (search_b) {
      //let data_a = search_b.qty


      //summary_stockCard.items.push(data_b)
      //await summary_stockCard.save();

      //-- ใส่กลับเข้าไปใน items
      let data_c = []
      data_c.push(data_b)
      let data_d
      const id = summary_stockCard.id
      const wait_stockCard_2 = await StocksSummary.findById(id)
      if (wait_stockCard_2) {

        let search_b = _.find(wait_stockCard_2.items, (one_item) => {
          return one_item.product_oid === one_product.id
        })

        let data_a = data_b.qty

        data_b.qty += search_b.qty
        wait_stockCard_2.balance += data_a

        // -- map by product_price_oid
        // data_d = wait_stockCard_2.items.map(obj => data_c.find(o => o.product_price_oid === obj.product_price_oid) || obj)

        // -- map by product_oid
        data_d = wait_stockCard_2.items.map(obj => data_c.find(o => o.product_oid === obj.product_oid) || obj)

        //console.log(data_d)
        wait_stockCard_2.timestamp = new Date().toISOString()
        wait_stockCard_2.items = data_d
        wait_stockCard_2.total_product = wait_stockCard_2.items.length
        await wait_stockCard_2.save();

        //-- เก็บgเข้า Stock Log
        await new StockOrders({
          ...one_stockCard,
          product_oid: one_product.product_name,
          timestamp: Date.now(),
          // approver_user: req.body.approver_user || "mock_admin",
          status: {
            timestamp: Date.now(),
            name: "approved",
          }
        }).save();

      }




      // } else {
      //return res.status(403).send({ message: "เกิดข้อผิดพลาด search:", search_b });
      //  }

    }

    return res.status(200)
      .send({ status: true, message: "บันทึกรายการเคลื่อนไหวสต็อกสำเร็จ" });

  }
  catch (err) {
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