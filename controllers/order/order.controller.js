const bcrypt = require("bcrypt");
const { Orders, validate } = require("../../model/order/order.model");
const { ProductsPrice } = require("../../test_SplitPriceAndProduct/model/product/product_price.model");
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

    let agent_level = "dealerLv1"  //สมมติว่า ส่งมาเป็น Lv1
    //let agent_level = req.body.agent_info.level || "price_one"
    const orderlists = await Orders.find().sort({ $natural: -1 }).limit(3); //The 1 will sort ascending (oldest to newest) and -1 will sort descending (newest to oldest.)


    /*if (orderCard)
      return res.status(401).send({
        status: false,
        message: "มีออเดอร์นี้ในระบบเเล้ว",
      });*/

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
    const newData = [];
    let sum_total_price = 0;
    const priceLists = await ProductsPrice.find();
    _.forEach(product_orders, (val, key) => {
      let a = val

      let dealerLevel //set defalt
      if (agent_level) {
        dealerLevel = "price_one"  //สมมติว่า Lv1
      }

      _.forEach(priceLists, (value2, key2) => {
        if (value2.id == a.product_price_info.product_price_oid) {
          let newData2 = {
            product_price_info: {
              product_price_oid: value2.id,
              product_oid: value2.product_oid,
              amount: value2.amount,
              price: value2.price[dealerLevel]
            },
            count: a.count
          };

          sum_total_price += newData2.product_price_info.price * newData2.count
          newData.push(newData2);
        }
      })
    })

    //await ProductsPrice.findById(pricelists[].product_price_oid);

    await new Orders({
      ...req.body,
      order_id: run_order_id,
      agent_info: {
        name: "mock_agent01", //mock
        level: "dealerLv1"
      },
      update_status: {
        name: "รอตรวจสอบ",
        timestamp: new Date().toISOString(),
      },
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

/*exports.comfirm = async (req, res) => {
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
  message: "อนุมัติรายการสต็อกสำเร็จ: " + item.item_status + item.qty,
  data: confirmStock,
});
    } else {
  return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
}
  } catch (err) {
  return res.status(500).send({ message: "Internal Server Error" });
}
};*/

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