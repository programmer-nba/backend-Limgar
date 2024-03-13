const Commission = require('../../controllers/commission/commission.controller');
const express = require('express');
const router = express.Router();
const authAdmin = require("../../lib/auth.admin");
const authAgent = require('../../lib/auth.agent');

// ตัดค่าคอมมิสชั่น
router.post("/cutoff", authAdmin, Commission.cutcommission);
//ดึงข้อมูลค่าคอมมิชชั่นทั้งหมด
router.get('/all', authAdmin, Commission.getcommission);
router.get("/receipt", authAdmin, Commission.getReciptCommission);
router.get("/receipt/:id", authAgent, Commission.getReciptCommissionAgent);
//ดึงข้อมูลค่าคอมมิชชั่นตาม id
router.get('/:id', authAdmin, Commission.getcommissionById);


module.exports = router;