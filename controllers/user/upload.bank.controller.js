const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const { Agents } = require("../../model/user/agent.model");
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

exports.upload = async (req, res) => {
    try {
        let upload = multer({ storage: storage }).single("bank_image");
        upload(req, res, async function (err) {
            if (!req.file) {
                return res.status(403).send({ message: "ไม่พบรูปภาพ", status: false });
            } else if (err instanceof multer.MulterError) {
                return res.send(err);
            } else if (err) {
                return res.send(err);
            } else {
                uploadFileCreate(req, res);
            }
        });
        async function uploadFileCreate(req, res) {
            const filePath = req.file.path;

            const agent = await Agents.findOne({
                _id: req.params.id,
            });
            if (!agent)
                return res.status(409).send({
                    status: false,
                    message: "ไม่พบข้อมูลตัวแทนขายในระบบ",
                });

            let fileMetaData = {
                name: req.file.originalname,
                parents: [process.env.GOOGLE_DRIVE_IMAGE_BANK],
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
                agent.bank.image = response.data.id;
                agent.bank.name = req.body.name;
                agent.bank.number = req.body.number;
                agent.save();
                return res.status(201).send({ message: "แก้ไขข้อมูลตัวแทนเรียบร้อย", status: true });
            } catch (error) {
                return res.status(500).send({ message: "Internal Server Error", status: false });
            }
        }
    } catch (err) {
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
}

async function generatePublicUrl(res) {
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
        console.log(error.message);
    }
}
