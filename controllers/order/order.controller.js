const bcrypt = require("bcrypt");
const { Orders, validate } = require("../../model/order/order.model");
const { Products } = require("../../model/product/product.model");
const { ProductsPrice } = require("../../model/product/product_price.model");
const { Agents } = require("../../model/user/agent.model");
const { Rows } = require("../../model/user/row.model");
const { Customers } = require("../../model/user/customer.model")
const { ProductStock } = require("../../model/stock/stock.product.model")
// const { StocksSummary } = require("../../model/stock/stock_summary.model");
const moment = require('moment');
const dayjs = require("dayjs");

var _ = require("lodash");

exports.create = async (req, res) => {
  try {
    const agent_id = req.decoded._id;
    const agent = await Agents.findOne({ _id: agent_id });
    if (!agent) {
      return res.status(403).send({ status: false, message: "ไม่พบตัวแทนขาย", });
    } else {
      let order = [];
      let product_price = 0;
      let product_cost = 0;
      let product_freight = 0;
      let amount = 0;
      if (agent.row === '') {
        return res.status(404)
          .send({ status: false, message: "ไม่พบ ข้อมูลระดับตัวแทนจำหน่าย" });
      } else {
        for (let item of req.body.product_detail) {
          const price = await ProductsPrice.findOne({
            _id: item.product_pack_id,
            product_id: item.product_id
          });
          if (price) {
            if (agent.row === 'ระดับ 1') {
              product_price += (price.price.price_one * item.quantity)
            } else if (agent.row === 'ระดับ 2') {
              product_price += (price.price.price_two * item.quantity)
            } else if (agent.row === 'ระดับ 3') {
              product_price += (price.price.price_three * item.quantity)
            } else if (agent.row === 'ระดับ 4') {
              product_price += (price.price.price_four * item.quantity)
            } else if (agent.row === 'ระดับ 5') {
              product_price += (price.price.price_five * item.quantity)
            } else {
              product_price += (price.price.price_one * item.quantity)
            }
            product_cost += (price.cost * item.quantity);
            amount += price.amount;
            order.push({
              product_id: item.product_id,
              quantity: item.quantity,
              price: product_price,
              cost: product_cost,
            });
          } else {
            return res
              .status(403)
              .send({ status: false, message: "ไม่พบข้อมูลราคาสินค้า" });
          }
        }
        if (req.body.payment_type === 'เงินโอน') {
          if (amount > 12) {
            product_freight = product_freight + 50;
          } else if (amount > 0 && amount < 12) {
            product_freight = 50;
          }
        } else if (req.body.payment_type === 'COD') {
          if (amount > 12) {
            product_freight = product_freight + 100;
          } else if (amount > 0 && amount < 12) {
            product_freight = 100;
          }
        }
        const totalprice = order.reduce(
          (accumulator, currentValue) => accumulator + currentValue.price, 0
        );
        const totalcost = order.reduce(
          (accumulator, currentValue) => accumulator + currentValue.cost, 0
        );

        //generate receipt number
        const receiptnumber = await genOrderNumber(agent_id);

        const customer = {
          customer_name: req.body.customer_name,
          customer_tel: req.body.customer_tel,
          customer_address: req.body.customer_address,
          customer_subdistrict: req.body.customer_subdistrict,
          customer_district: req.body.customer_district,
          customer_province: req.body.customer_province,
          customer_postcode: req.body.customer_postcode,
        };

        const new_data = {
          receiptnumber: receiptnumber,
          agent_id: agent_id,
          customer: customer,
          product_detail: order,
          total_cost: totalcost,
          total_price: totalprice,
          total_freight: product_freight,
          payment_type: req.body.payment_type,
          status: {
            name: "รอการตรวจสอบ",
            timestamp: dayjs(Date.now()).format(""),
          },
          timestamp: dayjs(Date.now()).format(""),
        };
        const order_product = new Orders(new_data);
        order_product.save();
        return res.status(200).send({ status: true, message: "สร้างออเดอร์สำเร็จ", data: order_product })
      }
    }
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
      (el) => el.agent_id === id,
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
      updateStatus.status.push({
        name: "อนุมัติการสั่งซื้อ",
        //  approver_user: "mock_admin",
        timestamp: dayjs(Date.now()).format(""),
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

exports.cutstock = async (req, res) => {
  try {
    const product_stock = await ProductStock.findOne({
      stock_id: req.body.stock_id,
      product_id: req.body.product_id,
    });
    if (!product_stock)
      return res.status(403).send({ status: false, message: "ไม่พบสินค้าในสต๊อกสินค้า" })
    const new_stock = product_stock.stock - req.body.quantity;
    product_stock.stock = new_stock
    product_stock.save()
    return res.status(200).send({ status: true, message: "ปรับสต๊อกสินค้าเรียบร้อย" })
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

exports.tracking = async (req, res) => {
  try {
    const updateStatus = await Orders.findOne({ _id: req.params.id });
    if (updateStatus) {
      updateStatus.status.push({
        name: "ดำเนินการส่งสินค้า",
        //  approver_user: "mock_admin",
        timestamp: dayjs(Date.now()).format(""),
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

exports.confirmShipping = async (req, res) => {
  try {
    
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

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

async function genOrderNumber(agent_id) {
  const pipeline = [
    {
      $match: { agent_id: agent_id }
    },
    {
      $group: { _id: 0, count: { $sum: 1 } },
    },
  ];
  const count = await Orders.aggregate(pipeline);
  const countValue = count.length > 0 ? count[0].count + 1 : 1;
  const data = `REP${dayjs(Date.now()).format("YYYYMMDD")}${countValue
    .toString()
    .padStart(5, "0")}`;
  return data;
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
