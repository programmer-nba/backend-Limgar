const bcrypt = require("bcrypt");
const { Orders, validate } = require("../../model/order/order.model");
const { Products } = require("../../test_SplitPriceAndProduct/model/product/product.model");
const { ProductsPrice } = require("../../test_SplitPriceAndProduct/model/product/product_price.model");
const { Agents } = require("../../model/user/agent.model");
const { Rows } = require("../../model/user/row.model");

var _ = require("lodash");

exports.create = async (req, res) => {
  var run_order_id = 0;
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });


    //ค้นหาออเดอรซ้ำ
    //const orderlists = await Orders.find({})

    const agent_order_one = await Agents.findOne({ _id: req.decoded._id })

    let agent_level = ""  //สมมติว่า ส่งมาเป็น Lv1
    const agent_row = await Rows.findOne({ _id: agent_order_one.row })

    if (agent_row) {
      agent_level = agent_row.level_name  //สมมติว่า ส่งมาเป็น Lv1
    }

    //let agent_level = req.body.agent_info.level || "price_one"
    const orderlists = await Orders.find().sort({ $natural: -1 }).limit(5); //The 1 will sort ascending (oldest to newest) and -1 will sort descending (newest to oldest.)

    /* const salt = await bcrypt.genSalt(Number(process.env.SALT));
     const hashPassword = await bcrypt.hash(req.body.password, salt);*/

    //รัน เลขออเดอร์

    //const orderCard = orderlists.slice(-1)[0]  //get lastest order desc
    const orderCard = orderlists[0]  //get lastest order asc

    if (!orderCard) {
      run_order_id = 0
    } else {
      run_order_id = orderCard.order_id + 1;
    }

    const product_orders = req.body.packages;
    //--hotfix send new update into response
    let newData = [];
    let sum_total_price = 0;

    let dealerPrice //set defalt
    if (agent_level) {
      switch (agent_level.level_name) {
        case "agent_Lv1":
          dealerPrice = "price_one"  //สมมติว่า Lv1
          break;
        case "agent_Lv2":
          dealerPrice = "price_two"  //สมมติว่า Lv1
          break;
        case "agent_Lv3":
          dealerPrice = "price_three"  //สมมติว่า Lv1
          break;
        default:
          dealerPrice = "price_one"  //สมมติว่า Lv1
      }

    }

    const priceLists = await ProductsPrice.find();
    const product_name_lists = await Products.find();
    let newPriceLists = _.reduce(priceLists, (result, val4, key4) => {
      let c = val4
      let b = _.find(product_name_lists, (product_name, index8) => {
        return product_name.id = val4.id
      })
      result[val4.id] = {
        product_price_oid: val4.id,
        product_oid: b.id,
        product_name: b.product_name,
        amount: val4.amount,
        price: val4.price[dealerPrice]
      }
      return result;
    }, {})


    _.forEach(product_orders, async (val, key) => {
      let one_product = val

      let one_in_order = one_product.product_price_info
      let find_one = _.find(newPriceLists, (priceList, index2) => {
        return priceList.product_price_oid == one_in_order.product_price_oid;
      });

      let newData2 = {
        product_price_info: find_one,
        total_amount: 0,
        count: one_product.count,
        sum_product_price: 0
      };

      newData2.total_amount = find_one.amount * one_product.count
      newData2.sum_product_price = newData2.product_price_info.price * one_product.count

      sum_total_price += newData2.product_price_info.price * newData2.count

      newData.push(newData2);

    })

    await new Orders({
      //...req.body,
      order_id: run_order_id,
      agent_oid: agent_order_one._id,
      update_status: {
        name: "รอตรวจสอบ",
        timestamp: new Date().toISOString(),
      },
      payment_type: req.body.payment_type,
      products_total: sum_total_price,
      packages: newData
    }).save();

    const newOrderCard = await Orders.findOne({
      order_id: run_order_id,
    });
    return res.status(200).send({ status: true, message: "ลงออเดอร์สำเร็จ", data: newOrderCard });

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getOrderAll = async (req, res) => {
  try {
    const agent = await Orders.find();
    if (!agent)
      return res.status(404)
        .send({ status: false, message: "ดึงข้อมูลออเดอร์ไม่สำเร็จ" });
    return res.status(200)
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
/*exports.holdOrderById = async (req, res) => {
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
};*/

exports.comfirm = async (req, res) => {
  try {
    const updateStatus = await Orders.findOne({ _id: req.params.id });
    if (updateStatus) {
      updateStatus.update_status.push({
        name: "อนุมัติ",
        approver_user: "mock_admin",
        timestamp: new Date().toISOString(),
      });
      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "อนุมัติออเดอร์สำเร็จ",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.cancel = async (req, res) => {
  //const fillter_status = "waiting" //--ฟิลเตอณเฉพาะ รออนุมัติ
  try {
    const rejectOrder = await Orders.findOne({
      _id: req.params.id,
      //update_status: fillter_status
    });
    if (rejectOrder) {
      /* rejectOrder.transactions.pop({
         //timestamp: Date.now(),
       });*/

      rejectOrder.transactions.push({
        ...req.body,
        timestamp: Date.now(),
        approver_user: "mock_admin",
        name: "rejected", //--  admin ไม่อนุมัติ
        remark: req.body.remark,
      });

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