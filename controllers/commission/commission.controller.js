const { Agents } = require("../../model/user/agent.model");
const { Commission } = require("../../model/commission/commission.model");
const { CommissionAgents } = require("../../model/commission/receipot.commission.model");
const dayjs = require("dayjs");


//ดึงข้อมูลค่าคอมมิชชั่นทั้งหมด
exports.getcommission = async (req, res) => {
    try {
        const commission = await Commission.find();
        res.status(200).json({ message: "ดึงข้อมูลค่าคอมมิชชั่นสำเร็จ", status: true, data: commission });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
//ดึงข้อมูค่าคอมมิชชั่นตาม id
exports.getcommissionById = async (req, res) => {
    try {
        const id = req.params.id;
        const commission = await Commission.findById(id);
        res.status(200).json({ message: "ดึงข้อมูลค่าคอมมิชชั่นสำเร็จ", status: true, data: commission });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.cutcommission = async (req, res) => {
    try {
        const cutoff = await Commission.find({ cutoff: false });
        if (cutoff.length === 0) {
            return res.status(400).send({ message: "ไม่มีรายการค่าคอมมิชชั่น" });
        }
        //หาตัวแทนที่ยังไม่ได้จ่ายค่าคอมมิชชั่น
        const commission_arr = [...new Set(cutoff.map((obj) => obj.agent_id))];
        commission_arr.forEach(async (el) => {

            let receipt_detail = [];

            //หาค่าคอมมิชชั่นของตัวแทน
            const com = await cutoff.filter((po) => po.agent_id === el);
            com.forEach(async (c) => {

                const new_data = {
                    order_id: c.orderid,
                    agent_id: c.agent_id,
                    commission: c.commission,
                    vat: c.vat,
                    net: c.net,
                };

                receipt_detail.push(new_data)
            })

            const invoice = await invoiceNumber(el, dayjs(Date.now()).format());

            const recipt = {
                receipt_ref: invoice,
                receipt_agent_id: el,
                receipt_detail: receipt_detail,
                receipt_status: "ดำเนินการจ่ายค่าคอมมิชชั่น",
                receipt_timestamp: dayjs(Date.now()).format(),

            };

            await CommissionAgents.create(recipt);
            await Commission.updateMany(
                { agent_id: el },
                { $set: { cutoff: true } }
            );
        });
        return res.status(200).send({
            message: `ตัดยอดค่าคอมมิชชั่นเรียบร้อย จำนวน ${cutoff.length} คน`,
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: "Internal Server" })
    }
};

//ค้นหาและสร้างเลข invoice
async function invoiceNumber(agent_id, date) {
    const agent = await Agents.findById(agent_id);
    if (agent) {
        const order = await CommissionAgents.find({ receipt_agent_id: agent_id });
        let recipt_number = null;
        if (order.length !== 0) {
            let data = "";
            let num = 0;
            let check = null;
            do {
                num = num + 1;
                data =
                    `REC${dayjs(date).format("YYYYMM")}`.padEnd(12, "0") +
                    num;
                check = await CommissionAgents.find({ receipt_ref: data });
                if (check.length === 0) {
                    recipt_number =
                        `REC${dayjs(date).format("YYYYMM")}`.padEnd(
                            13,
                            "0"
                        ) + num;
                }
            } while (check.length !== 0);
        } else {
            recipt_number =
                `REC${dayjs(date).format("YYYYMM")}`.padEnd(12, "0") +
                "1";
        }
        console.log(recipt_number);
        return recipt_number;
    } else {
        return "0";
    }
};

exports.getReciptCommission = async (req, res) => {
    try {
        const receipt = await CommissionAgents.find();
        if (!receipt)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: receipt })
    } catch (err) {
        return res.status(500).send({ status: false, message: "Internal Server" })
    }
};

exports.getReciptCommissionAgent = async (req, res) => {
    try {
        const id = req.params.id;
        const receipt = await CommissionAgents.find();
        const receipt_all = receipt.filter(
            (el) => el.receipt_agent_id === id
        );
        if (!receipt_all) {
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        }
        return res.status(201).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: receipt_all })
    } catch (err) {
        return res.status(500).send({ status: false, message: "Internal Server" })
    }
};