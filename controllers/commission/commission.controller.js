const { Agents } = require("../../model/user/agent.model");
const { Commission } = require("../../model/commission/commission.model");
// ตัดยอดค่าคอมมิชชั่น เมื่อกดตัดยอด
exports.cutcommission = async (req, res) => {
    try {
        const startDate = new Date(new Date().setHours(0, 0, 0, 0)); // เริ่มต้นของวันนี้
        const endDate = new Date(new Date().setHours(23, 59, 59, 999)); // สิ้นสุดของวันนี้
        const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const referenceNumber = String(await Commission.find({ createdAt: { $gte: startDate, $lte: endDate } }).countDocuments()).padStart(5, '0');
        const refno = `${currentDate}${referenceNumber}`;
        const date = Date.now();
        const agent = await Agents.find();
        const list_agent = [];
        agent.forEach(async (element) => {
            if(element.commissiom>0){
                const data = {
                    agentid: element._id,
                    agentname: element.name,
                    amount: element.commissiom  
                }
                list_agent.push(data);
                const update = await Agents.findByIdAndUpdate(element._id, { commissiom: 0 });
            }
        })
        const commission = new Commission({
            refno: refno,
            date: date,
            Commissiondetail: list_agent
        });
        const add = await commission.save();
        res.status(200).json({ message: "ตัดยอดค่าคอมมิชชั่นสำเร็จ" ,status:true,data:add});
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};

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

//ลบข้อมูลค่าคอมมิชชั่น
exports.deletecommission = async (req, res) => {
    try {
        const id = req.params.id;
        const commission = await Commission.findByIdAndDelete(id);
        res.status(200).json({ message: "ลบข้อมูลค่าคอมมิชชั่นสำเร็จ", status: true, data: commission });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}