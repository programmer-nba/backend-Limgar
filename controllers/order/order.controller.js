const bcrypt = require("bcrypt");
const { Orders, validate } = require("../../model/order/order.model");
const { Products } = require("../../model/product/product.model");
const { ProductsPrice } = require("../../model/product/product_price.model");
const { Agents } = require("../../model/user/agent.model");
const { Rows } = require("../../model/user/row.model");
const { Customers } = require("../../model/user/customer.model")
const { StocksSummary } = require("../../model/stock/stock_summary.model");
const moment = require('moment');

var _ = require("lodash");

exports.create = async (req, res) => {
  var run_order_id = 0;
  try {
    const agent_order_oid = req.decoded._id
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });

    //ค้นหาออเดอรซ้ำ
    //const orderlists = await Orders.find({})

    const agent_order_one = await Agents.findOne({ _id: req.decoded._id })

    let agent_level = ""  //สมมติว่า ส่งมาเป็น Lv1
    if (!agent_order_one.row || agent_order_one.row === "") {
      return res.status(404)
        .send({ status: false, message: "ไม่พบ ข้อมูลระดับตัวแทนจำหน่าย" });
    }
    const agent_row = await Rows.findOne({ _id: agent_order_one.row })

    if (agent_row) {
      agent_level = agent_row.level_name  //สมมติว่า ส่งมาเป็น Lv1
    }

    //let agent_level = req.body.agent_info.level || "price_one"
    const orderlists = await Orders.find().sort({ $natural: -1 }).limit(5); //The 1 will sort ascending (oldest to newest) and -1 will sort descending (newest to oldest.)

    //รัน เลขออเดอร์

    //const orderCard = orderlists.slice(-1)[0]  //get lastest order desc
    const orderCard = orderlists[0]  //get lastest order asc

    const lastest_order_id = orderCard.order_id
    let next_order_id = "";

    if (isNaN(lastest_order_id) || lastest_order_id === "") {
      console.log("Invalid input")
    } else {
      next_order_id = genOrderNumber(lastest_order_id);
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
          dealerPrice = "price_one"  //ปรับเป็นราคาหน้าร้าน
      }

    } else {
      dealerPrice = "price_one"  //ปรับเป็นราคาหน้าร้าน
    }
    const one_customer = await Customers.findOne({
      tel: req.body.customer_info.tel
    });
    const priceLists = await ProductsPrice.find();
    const product_name_lists = await Products.find();
    let newPriceLists = _.reduce(priceLists, (result, priceList, key4) => {
      //let c = val4
      let b = _.find(product_name_lists, (product_name, index8) => {
        return product_name.id == priceList.product_oid
      })
      /*   if (!b) {
           return res.status(404)
             .send({ status: false, message: "ไม่พบข้อมูลสินค้า" });
         }*/

      result[priceList.id] = {
        product_price_oid: priceList.id,
        product_oid: b.id,
        product_name: b.product_name,
        amount: priceList.amount,
        price: priceList.price[dealerPrice]
      }
      return result;
    }, {})

    //summary product order
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
      ...req.body,
      order_id: next_order_id,
      //--hotfix
      //agent_oid: agent_order_one.id,
      agent_oid: agent_order_oid,  //hotfix
      update_status: {
        name: "รอตรวจสอบ",
        timestamp: new Date().toISOString(),
      },
      payment_type: req.body.payment_type,
      customer_info: req.body.customer_info,

      products_total: sum_total_price,
      packages: newData,
      remark: "-"
    }).save().then((item) => {
      if (!item)
        return res.status(403)
          .send({ status: false, message: "ส่งข้อมูลออเดอร์ไม่สำเร็จ" });
      return res.status(200)
        .send({ status: true, message: "ลงออเดอร์สำเร็จ", data: item });

    });

    /*const newOrderCard = await Orders.findOne({
      order_id: next_order_id,
    });
    return res.status(200).send({ status: true, message: "ลงออเดอร์สำเร็จ", data: newOrderCard });*/

  } catch (err) {
    return res.status(500).send({ message: err.message });
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

exports.getOrderByAgentId = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Orders.find();
    const agent_order = order.filter(
      (el) => el.agent_oid === id,
    );
    // const order = await Orders.findOne({
    //   agent_oid: id,
    // });
    // console.log(order);
    if (!agent_order)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลออเดอร์ไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลออเดอร์สำเร็จ", data: agent_order });
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
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};


exports.comfirm = async (req, res) => {
  //--วิ่งไปตัดของในคลังได้เลย
  try {
    const updateStatus = await Orders.findOne({ _id: req.params.id });
    if (updateStatus) {
      updateStatus.update_status.push({
        name: "อนุมัติการสั่งซื้อ",
        //  approver_user: "mock_admin",
        timestamp: new Date().toISOString(),
      });
      updateStatus.save();
      updateStatus.packages.forEach(async (element) => {
        const amount = element.product_price_info.amount
        const product_id = element.product_price_info.product_oid

        // ส่วนสินค้าราคา
        const deleteproduct = await ProductsPrice.findOneAndDelete({ product_oid: product_id, amount: amount });
        // ส่วนสต็อก
        const stock = await StocksSummary.find({ items: { $elemMatch: { product_oid: product_id } } });
        stock.forEach(async (element) => {
          element.items.forEach(async (item) => {
            if (item.product_oid === product_id) {
              item.qty -= amount
              element.save();
            }
          });
        });

      });
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

exports.tracking = async (req, res) => {
  try {
    const updateStatus = await Orders.findOne({ _id: req.params.id });
    if (updateStatus) {
      updateStatus.update_status.push({
        name: "ดำเนินการส่งสินค้า",
        //  approver_user: "mock_admin",
        timestamp: new Date().toISOString(),
      });
      updateStatus.tracking_number = req.body.tracking_number,
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
        //approver_user: "mock_admin",
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

//------------------- utility function ---------------------//

function genOrderNumber(order_id) {

  let old_order_number = order_id.slice(-5); //แกะเลข 5 หลักท้าย
  let old_date = order_id.substring(0, 6); //แกะเลขวันเดือนปี 6 หลักหน้า

  let currentDate = moment().format('YY-MM-DD'); // ดึงวันที่ปัจจุบัน

  let newDay = parseInt(moment().format('YYMMDD'), 10);
  let lastestDay = parseInt(moment(old_date, "YYMMDD").format('YYMMDD'), 10);

  if (newDay > lastestDay) {
    old_order_number = "0" //reset order number
  }

  const orderNumber = addOneToStringNumber(old_order_number);
  const fullOrderNumber = currentDate.replace(/-/g, '') + orderNumber.padStart(5, '0');// รวมวันที่และหมายเลขออเดอร์

  return fullOrderNumber;
};

function addOneToStringNumber(inputString) {
  const parsedNumber = parseInt(inputString, 10);

  // ตรวจสอบว่า inputString เป็นตัวเลขหรือไม่
  if (isNaN(parsedNumber)) {
    return 'Invalid input';
  } else {
    let result = (parsedNumber + 1).toString();
    return result
  }
};
