const { Employees, validate } = require("../../model/user/employee.model")
const dayjs = require("dayjs")
const bcrypt = require("bcrypt")

exports.create = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res
                .status(403)
                .send({ message: error.details[0].message, status: false });
        const employee = await Employees.findOne({
            first_name: req.body.first_name,
            username: req.body.username,
            tel: req.body.tel,
        });
        if (employee)
            return res.status(401).send({
                status: false,
                message: "มีชื่อผู้ใช้งานนี้ในระบบเเล้ว",
            });
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const data = {
            ...req.body,
            password: hashPassword,
            timestamp: dayjs(Date.now()).format(""),
        };
        const new_employee = new Employees(data);
        new_employee.save();
        return res.status(200).send({ status: true, message: "เพิ่มพนักงานสำเร็จ", data: new_employee });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getEmployeetAll = async (req, res) => {
    try {
        const employee = await Employees.find();
        if (!employee)
            return res
                .status(404)
                .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res
            .status(200)
            .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: employee });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const id = req.params.id;
        const employee = await Employees.findById(id);
        if (!employee)
            return res
                .status(404)
                .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res
            .status(200)
            .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: employee });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getEmployeeByStockId = async (req, res) => {
    try {
        const stock_id = req.params.id;
        const employee = await Employees.find();
        const employees = employee.filter(
            (el) => el.stock_id === stock_id
        );
        if (!employees)
            return res
                .status(404)
                .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
        return res
            .status(200)
            .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: employees });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.update = async (req, res) => {
    try {
        if (!req.body)
            return res.status(404).send({ status: false, message: "ส่งข้อมูลผิดพลาด" });
        const id = req.params.id;
        if (!req.body.password) {
            Employees.findByIdAndUpdate(
                id, req.body, { useFindAndModify: false }
            ).then((item) => {
                if (!item)
                    return res
                        .status(404)
                        .send({ status: false, message: "แก้ไขข้อมูลไม่สำเร็จ" });
                return res
                    .status(200)
                    .send({ status: true, message: "แก้ไขข้อมูลสำเร็จ" });
            }).catch((err) => {
                console.log(err);
                return res
                    .status(500)
                    .send({ status: false, message: "มีบางอย่างผิดพลาด" + id });
            });
        } else {
            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            const hashPassword = await bcrypt.hash(req.body.password, salt);
            Employees.findByIdAndUpdate(
                id,
                { ...req.body, password: hashPassword },
                { useFindAndModify: false }
            ).then((item) => {
                if (!item)
                    return res
                        .status(404)
                        .send({ status: false, message: "แก้ไขข้อมูลไม่สำเร็จ" });
                return res
                    .status(200)
                    .send({ status: true, message: "แก้ไขข้อมูลสำเร็จ" });
            }).catch((err) => {
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
        Employees.findByIdAndDelete(id, { useFindAndModify: false })
            .then((item) => {
                if (!item)
                    return res
                        .status(404)
                        .send({ message: "ไม่สามารลบข้อมูลพนักงานได้" });
                return res.status(200).send({ message: "ลบข้อมูลพนักงานสำเร็จ" });
            })
            .catch((err) => {
                res.status(500).send({
                    message: "ไม่สามารลบข้อมูลพนักงานได้",
                    status: false,
                });
            });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};