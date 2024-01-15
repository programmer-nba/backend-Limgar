const { Rows, validate } = require("../../model/user/row.model")

exports.create = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(403)
                .send({ message: error.details[0].message, status: false });

        const row = await Rows.findOne({
            name: req.body.name
        });
        if (row)
            return res.status(401).send({
                status: false,
                message: "มีระดับนี้ในระบบแล้ว",
            });
        await new Rows({
            ...req.body,
        }).save();
        return res.status(200).send({ status: true, message: "เพิ่มระดับสมาชิกสำเร็จ" });
    } catch {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getRowAll = async (req, res) => {
    try {
        const row = await Rows.find();
        if (!row)
            return res
                .status(404)
                .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res
            .status(200)
            .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: row });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getRowById = async (req, res) => {
    try {
        const id = req.params.id;
        const row = await Rows.findById(id);
        if (!row)
            return res
                .status(404)
                .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res
            .status(200)
            .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: row });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.update = async (req, res) => {
    try {
        if (!req.body)
            return res.status(404).send({ status: false, message: "ส่งข้อมูลผิดพลาด" });
        const id = req.params.id;
        Rows.findByIdAndUpdate(id, req.body, { useFindAndModify: false }).then((item) => {
            if (!item)
                return res
                    .status(404)
                    .send({ status: false, message: "แก้ไขข้อมูลไม่สำเร็จ" });
            return res
                .status(200)
                .send({ status: true, message: "แก้ไขข้อมูลสำเร็จ" });
        }).catch((err) => {
            return res
                .status(500)
                .send({ status: false, message: "มีบางอย่างผิดพลาด" + id });
        })
    } catch {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        Rows.findByIdAndDelete(id, { useFindAndModify: false })
            .then((item) => {
                if (!item)
                    return res
                        .status(404)
                        .send({ message: "ไม่สมารถลบระดับตัวแทนขายนี้ได้" });
                return res.status(200).send({ message: "ลบระดับตัวแทนขายสำเร็จ" });
            })
            .catch((err) => {
                res.status(500).send({
                    message: "ไม่สมารถลบระดับตัวแทนขายนี้ได้",
                    status: false,
                });
            });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
