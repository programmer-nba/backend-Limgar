const bcrypt = require("bcrypt");
const { Orders, validate } = require("../../model/order/order.model");
const { Invoices } = require("../../model/order/invoice.model");
const { Products } = require("../../model/product/product.model");
const { ProductsPrice } = require("../../model/product/product_price.model");
const { Agents } = require("../../model/user/agent.model");
const { Rows } = require("../../model/user/row.model");
const { Customers } = require("../../model/user/customer.model")
const { ProductStock } = require("../../model/stock/stock.product.model")
// const { StocksSummary } = require("../../model/stock/stock_summary.model");
const { Commission } = require("../../model/commission/commission.model")
const moment = require('moment');
const dayjs = require("dayjs");

const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-");
  },
});

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
            amount += (price.amount * item.quantity);
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
        if (req.body.payment_type === 'COD') {
          const count = amount / 12;
          if (count === 0) {
            product_freight = 100;
          } else {
            const counts = Math.round(count);
            product_freight = (counts * 50) + 50;
          }
        } else {
          const count = amount / 12;
          if (count === 0) {
            product_freight = 50;
          } else {
            const counts = Math.round(count);
            product_freight = counts * 50;
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
            name: "ค้างชำระ",
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
    const order = await Orders.findById(id);
    if (!order)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลออเดอร์ไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลออเดอร์สำเร็จ", data: order });
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

exports.updateSlip = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("slip_image");
    upload(req, res, async function (err) {
      if (!req.file) {
        res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
      } else {
        // const url = req.protocol + "://" + req.get("host");
        uploadFileCreate(req, res);
      }
    });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function uploadFileCreate(req, res) {
  const filePath = req.file.path;
  const order = await Orders.findOne({ _id: req.params.id });
  if (!order)
    return res.status(403).send({ status: false, message: "ไม่พบข้อมูลออเดอร์" });

  let fileMetaData = {
    name: req.originalname,
    parents: [process.env.GOOGLE_DRIVE_IMAGE_SLIP],
  };
  let media = {
    body: fs.createReadStream(filePath),
  };
  try {
    const response = await drive.files.create({
      resource: fileMetaData,
      media: media,
    });
    generatePublicUrl(response.data.id);
    order.image = response.data.id;
    order.status = {
      name: "รอตรวจสอบ",
      timestamp: dayjs(Date.now()).format(""),
    };
    order.save();
    return res.status(201).send({ message: "แนบสลิปโอนเงินสำเร็จ", status: true });
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function generatePublicUrl(res) {
  console.log("generatePublicUrl");
  try {
    const fileId = res;
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });
    // console.log(result.data);
  } catch (error) {
    return console.log(error.message);
  }
}


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
    const updateStatus = await Orders.findOne({ _id: req.params.id });
    if (!updateStatus)
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูลออเดอร์" });
    const agent = await Agents.findOne({ _id: updateStatus.agent_id });
    if (!agent)
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูลตัวแทนขาย" });
    updateStatus.status.push({
      name: "ส่งสินค้าสำเร็จ",
      timestamp: dayjs(Date.now()).format(""),
    });
    const profit = updateStatus.total_price - updateStatus.total_cost;
    const commission = (profit * req.body.percent) / 100;
    const vat = (commission * 3) / 100;
    const net = commission - vat;
    agent.commissiom = net;
    const data = {
      orderid: updateStatus.receiptnumber,
      agent_id: updateStatus.agent_id,
      commission: commission,
      vat: vat,
      net: net,
    };
    const new_commission = new Commission(data);
    updateStatus.save();
    agent.save();
    new_commission.save();
    return res.status(200).send({ status: true, message: 'จ่ายค่าคอมมิชชั่นสำเร็จ', data: new_commission })
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.cancelShipping = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Orders.findOne({ _id: id });
    if (!order)
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูลออเดอร์" });
    order.status.push({
      name: "สินค้าตีกลับ",
      timestamp: dayjs(Date.now()).format(""),
    });
    const invoice = order.total_freight * 2;
    const data = {
      agent_id: order.agent_id,
      receiptnumber: order.receiptnumber,
      total: invoice,
      status: {
        name: "รอดำเนินการโอนเงิน",
        timestamp: dayjs(Date.now()).format(""),
      },
    };
    const new_invoice = new Invoices(data);
    order.save();
    new_invoice.save();
    return res.status(200).send({ status: true, message: "สร้างใบแจ้งหนี้ สินค้าตีกลับสำเร็จ", data: new_invoice })
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
