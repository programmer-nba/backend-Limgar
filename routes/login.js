const router = require("express").Router();
const { Admins } = require("../model/user/admin.model");
const bcrypt = require("bcrypt");
require("dotenv").config();

router.post("/", async (req, res) => {
    try {
        let admin = await Admins.findOne({ admin_username: req.body.username });
        if (!admin) {
            // await checkEmployee(req, res);
            console.log("ไม่ได้เป็นแอดมิน")
        } else {
            const validatePasswordAdmin = await bcrypt.compare(
                req.body.password,
                admin.admin_password
            );
            if (!validatePasswordAdmin) {
                return res
                    .status(403)
                    .send({ status: false, message: "Invalid password" });
            } else {
                const token = admin.generateAuthToken();
                const ResponesData = {
                    name: admin.admin_name,
                    username: admin.admin_username,
                    position: admin.admin_position,
                };
                return res.status(200).send({
                    token: token,
                    message: "เข้าสู่ระบบสำเร็จ",
                    result: ResponesData,
                    level: "admin",
                    status: true,
                });
            }
        }
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
