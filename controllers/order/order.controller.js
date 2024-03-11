const bcrypt = require("bcrypt");
const { Orders, validate } = require("../../model/order/order.model");
const { OrderStocks } = require("../../model/order/order.stock.model");
const { HistoryProductStocks } = require("../../model/stock/stock.history.model");
const { Invoices } = require("../../model/order/invoice.model");
const { Products } = require("../../model/product/product.model");
const { ProductsPrice } = require("../../model/product/product_price.model");
const { Agents } = require("../../model/user/agent.model");
const { Rows } = require("../../model/user/row.model");
const { ProductStock } = require("../../model/stock/stock.product.model");
const { Commission } = require("../../model/commission/commission.model");
const { Customers } = require("../../model/user/customer.model");
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
      let product_freight = 0; // ค่าขนส่ง
      let product_service = 0; // ค่าบริการ
      let product_cod = 0; // COD
      let amount = 0;
      if (agent.row === '') {
        return res.status(404)
          .send({ status: false, message: "ไม่พบ ข้อมูลระดับตัวแทนจำหน่าย" });
      } else {
        let price = [];
        for (let item of req.body.product_detail) {
          price = await ProductsPrice.findOne({
            _id: item.product_pack_id,
            product_id: item.product_id
          });
          if (price) {
            if (agent.row === 'ระดับ 1') {
              product_cost += (price.cost.cost_one * item.quantity)
            } else if (agent.row === 'ระดับ 2') {
              product_cost += (price.cost.cost_two * item.quantity)
            } else if (agent.row === 'ระดับ 3') {
              product_cost += (price.cost.cost_three * item.quantity)
            } else if (agent.row === 'ระดับ 4') {
              product_cost += (price.cost.cost_four * item.quantity)
            } else if (agent.row === 'ระดับ 5') {
              product_cost += (price.cost.cost_five * item.quantity)
            } else {
              product_cost += (price.cost.cost_one * item.quantity)
            }
            product_price += (price.price * item.quantity);
            amount += (price.amount * item.quantity);
            order.push({
              product_id: item.product_id,
              product_pack_id: item.product_pack_id,
              quantity: amount,
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
          if (amount === 1) {
            product_service = 20;
            product_freight = price.freight_cod;
            product_cod = 30;
          } else {
            const count = amount / 12;
            if (count < 1) {
              product_service = 20;
              product_freight = price.freight_cod;
              product_cod = 50;
            } else {
              const counts = count.toFixed();
              product_service = (counts * 20);
              product_freight = (counts * price.freight_cod);
              product_cod = (counts * 50);
            }
          }
        } else if (req.body.payment_type === 'เงินโอน') {
          const count = amount / 12;
          if (count < 1) {
            product_service = 20;
            product_freight = price.freight;
          } else {
            const counts = count.toFixed();
            product_service = (counts * 20);
            product_freight = (counts * price.freight);
          }
        } else if (req.body.payment_type === 'เงินสด') {
          if (!req.body.customer) {
            product_service = 20;
          } else {
            const count = amount / 12;
            if (count < 1) {
              product_service = 20;
              product_freight = price.freight;
            } else {
              const counts = count.toFixed();
              product_service = (counts * 20);
              product_freight = (counts * price.freight);
            }
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

        const customer = await Customers.findOne({
          tel: req.body.customer.customer_tel
        });

        if (!customer) {
          const data = {
            agent_id: agent_id,
            name: req.body.customer.customer_name,
            tel: req.body.customer.customer_tel,
            address: req.body.customer.customer_address,
            subdistrict: req.body.customer.customer_subdistrict,
            district: req.body.customer.customer_district,
            province: req.body.customer.customer_province,
            postcode: req.body.customer.customer_postcode,
          };
          const customer = new Customers(data);
          customer.save();
        }

        let new_data;
        if (req.body.payment_type === 'เงินโอน') {
          new_data = {
            receiptnumber: receiptnumber,
            agent_id: agent_id,
            customer: req.body.customer,
            product_detail: order,
            total_cost: totalcost,
            total_price: totalprice,
            total_freight: product_freight,
            total_service: product_service,
            total_cod: product_cod,
            payment_type: req.body.payment_type,
            status: {
              name: "ค้างชำระ",
              timestamp: dayjs(Date.now("")).format(""),
            },
            timestamp: dayjs(Date.now("")).format(""),
          };
        } else {
          new_data = {
            receiptnumber: receiptnumber,
            agent_id: agent_id,
            customer: req.body.customer,
            product_detail: order,
            total_cost: totalcost,
            total_price: totalprice,
            total_freight: product_freight,
            total_service: product_service,
            total_cod: product_cod,
            payment_type: req.body.payment_type,
            status: {
              name: "รอตรวจสอบ",
              timestamp: dayjs(Date.now("")).format(""),
            },
            timestamp: dayjs(Date.now("")).format(""),
          };
        }
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
      timestamp: dayjs(Date.now("")).format("YYYY-MM-DD HH:mm:ss"),
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

exports.updateCutStock = async (req, res) => {
  try {
    const updateStatus = await Orders.findOne({
      _id: req.params.id
    });
    updateStatus.status.push({
      name: "รอจัดส่งสินค้า",
      timestamp: dayjs(Date.now("")).format(""),
    });
    updateStatus.save()
    return res.status(200).send({ status: true, message: "เพิ่มออเดอร์ไปยังสต๊อกเรียบร้อยแล้ว" })
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

exports.cutstock = async (req, res) => {
  try {
    const order = await Orders.findOne({
      _id: req.body.order_id,
    });
    const product_stock = await ProductStock.findOne({
      stock_id: req.body.stock_id,
      product_id: req.body.product_id,
    });
    const product_price = await ProductsPrice.findOne({
      _id: req.body.product_pack_id,
      product_id: req.body.product_id,
    });
    if (!product_stock && !product_price && !order)
      return res.status(403).send({ status: false, message: "ไม่พบสินค้า หรือ ราคาสินค้า หรือ ออเดอร์" });
    const product = {
      product_id: req.body.product_id,
      quantity: req.body.quantity,
    };
    const receiptnumber = await genOrderReiceptNumber(req.body.stock_id);
    const size = {
      weight: product_price.weight,
      width: product_price.size.width,
      height: product_price.size.height,
      length: product_price.size.length,
    };
    const data = {
      receiptnumber: receiptnumber,
      receiptnumber_ref: order.receiptnumber,
      order_ref_id: order._id,
      stock_id: req.body.stock_id,
      customer: order.customer,
      product_detail: product,
      size: size,
      net: req.body.net_cod,
      status: {
        name: "รอจัดส่งสินค้า",
        timestamp: dayjs(Date.now("")).format(""),
      },
      timestamp: dayjs(Date.now("")).format(""),
      remark: req.body.remark,
    };
    const order_stock = new OrderStocks(data);
    order_stock.save();
    return res.status(200).send({ status: true, message: "เพิ่มออเดอร์ไปยังสต๊อกเรียบร้อยแล้ว" })
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

exports.tracking = async (req, res) => {
  try {
    const updateStatus = await OrderStocks.findOne({ _id: req.params.id });
    if (!updateStatus)
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูลออเดอร์ในสาขา" })
    const id = updateStatus.order_ref_id;
    const order = await Orders.findOne({ _id: id });
    if (!order)
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูลออเดอร์จากสาขาหลัก" })
    const product_stock = await ProductStock.findOne({
      product_id: updateStatus.product_detail.product_id,
      stock_id: updateStatus.stock_id
    });
    product_stock.stock -= updateStatus.product_detail.quantity;
    updateStatus.status.push({
      name: "ดำเนินการจัดส่งสินค้า",
      timestamp: dayjs(Date.now()).format(""),
    });
    order.tracking_number.push({
      receipt: updateStatus.receiptnumber,
      tracking_number: req.body.tracking_number,
      status: "ดำเนินการจัดส่งสินค้า"
    });
    updateStatus.tracking_number = req.body.tracking_number;
    updateStatus.cut_off = true;
    updateStatus.emp = req.body.employee;
    order.status.push({
      name: "ดำเนินการจัดส่งสินค้า",
      timestamp: dayjs(Date.now()).format(""),
    });
    // order.tracking_number = req.body.tracking_number;
    const history = await new HistoryProductStocks({
      stock_id: updateStatus.stock_id,
      product_id: updateStatus.product_detail.product_id,
      name: `ตัดสต๊อกสินค้า`,
      amount: updateStatus.product_detail.quantity,
      detail: `ตัดสต๊อกสินค้าเพื่อจัดส่ง ใบเสร็จเลขที่ ${updateStatus.receiptnumber}`,
    });
    history.save();
    product_stock.save();
    order.save();
    updateStatus.save();
    return res.status(200).send({
      status: true,
      message: "จัดส่งสินค้าสำเร็จ",
    });
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
    agent.commissiom += req.body.net;
    const data = {
      orderid: updateStatus.receiptnumber,
      agent_id: updateStatus.agent_id,
      commission: req.body.commission,
      vat: req.body.vat,
      net: req.body.net,
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
    for (item of req.body) {
      const order_stock = await OrderStocks.findOne({ receiptnumber: item });
      order_stock.status.push({
        name: "สินค้าตีกลับ",
        timestamp: dayjs(Date.now()).format(""),
      });
      const bounce = order.tracking_number.find(
        (el) => el.receipt === item
      );
      bounce.status = "สินค้าตีกลับ";
      order_stock.save();
    }
    const amount1 = order.tracking_number.length;
    const amount2 = req.body.length;
    const agent = await Agents.findOne({ _id: order.agent_id });
    const net = (order.total_freight / amount1) * amount2;
    agent.commissiom -= net;
    const data = {
      orderid: order.receiptnumber,
      agent_id: order.agent_id,
      commission: -net,
      vat: 0,
      net: 0,
    };
    const new_commission = new Commission(data);
    new_commission.save();
    agent.save();
    order.save();
    return res.status(200).send({ status: true, message: "สินค้าตีกลับสำเร็จ" })
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
      $match: { agent_id: agent_id },
    },
    {
      $group: { _id: 0, count: { $sum: 1 } },
    },
  ];
  const count = await Orders.aggregate(pipeline);
  const countValue = count.length > 0 ? count[0].count + 1 : 1;
  const data = `REP${dayjs(Date.now()).format("YYYYMMDD")}${countValue.toString().padStart(5, "0")}`;
  return data;
};


async function genOrderReiceptNumber(stock_id) {
  const pipeline = [
    {
      $match: { stock_id: stock_id },
    },
    {
      $group: { _id: 0, count: { $sum: 1 } },
    },
  ];
  const count = await OrderStocks.aggregate(pipeline);
  const countValue = count.length > 0 ? count[0].count + 1 : 1;
  const data = `CC${dayjs(Date.now()).format("MMDD")}${countValue.toString().padStart(4, "0")}`;
  return data;
};