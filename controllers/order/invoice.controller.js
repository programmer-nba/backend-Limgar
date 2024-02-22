const { Invoices } = require("../../model/order/invoice.model");
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

exports.getInvoiceAll = async (req, res) => {
    try {
        const invoice = await Invoices.find();
        if (!invoice)
            return res.status(404)
                .send({ status: false, message: "ดึงข้อมูลใบแจ้งหนี้ไม่สำเร็จ" });
        return res.status(200)
            .send({ status: true, message: "ดึงข้อมูลใบแจ้งหนี้สำเร็จ", data: invoice });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const id = req.params.id;
        const invoice = await Invoices.findById(id);
        if (!invoice)
            return res
                .status(404)
                .send({ status: false, message: "ดึงข้อมูลใบแจ้งหนี้ไม่สำเร็จ" });
        return res
            .status(200)
            .send({ status: true, message: "ดึงข้อมูลใบแจ้งหนี้สำเร็จ", data: invoice });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getByAgentId = async (req, res) => {
    try {
        const id = req.params.id;
        const invoice = await Invoices.find();
        const invoice_agent = invoice.find((el) => el.agent_id === id);
        if (!invoice_agent)
            return res
                .status(404)
                .send({ status: false, message: "ดึงข้อมูลใบแจ้งหนี้ไม่สำเร็จ" });
        return res
            .status(200)
            .send({ status: true, message: "ดึงข้อมูลใบแจ้งหนี้สำเร็จ", data: invoice_agent });
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
};

async function uploadFileCreate(req, res) {
    try {
        const filePath = req.file.path;
        const invoice = await Invoices.findOne({ _id: req.params.id });
        if (!invoice)
            return res.status(403).send({ status: false, message: "ไม่พบข้อมูลใบแจ้งหนี้" });
        let fileMetaData = {
            name: req.originalname,
            parents: [process.env.GOOGLE_DRIVE_IMAGE_SLIP],
        };
        let media = {
            body: fs.createReadStream(filePath),
        };
        const response = await drive.files.create({
            resource: fileMetaData,
            media: media,
        });
        generatePublicUrl(response.data.id);
        invoice.slip_image = response.data.id;
        invoice.status.push({
            name: "รอตรวจสอบ",
            timestamp: dayjs(Date.now()).format(""),
        });
        invoice.save();
        return res.status(200).send({ message: "แนบสลิปโอนเงินสำเร็จ", status: true });
    } catch (error) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

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
};

exports.updateInvoice = async (req, res) => {
    try {
        const updateInvoice = await Invoices.findOne({ _id: req.params.id });
        if (!updateInvoice)
            return res.status(403).send({ status: false, message: "ไม่พบข้อมูลใบแจ้งหนี้" });
        updateInvoice.status.push({
            name: "ตรวจสอบสำเร็จ",
            timestamp: dayjs(Date.now()).format(""),
        })
        updateInvoice.save();
        return res.status(200).send({ status: true, message: "ยืนยันการแนบสลิปสำเร็จ" });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};