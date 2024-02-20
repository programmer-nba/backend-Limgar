const Commission = require('../../controllers/commission/commission.controller');
const express = require('express');
const router = express.Router();
const authAdmin = require("../../lib/auth.admin");

// ตัดค่าคอมมิสชั่น
// router.post('/cutcommission', Commission.cutcommission);
//ดึงข้อมูลค่าคอมมิชชั่นทั้งหมด
router.get('/all', authAdmin, Commission.getcommission);
//ดึงข้อมูลค่าคอมมิชชั่นตาม id
router.get('/:id', authAdmin, Commission.getcommissionById);
//ลบข้อมูลค่าคอมมิชชั่น
// router.delete('/deletecommission/:id', Commission.deletecommission);
module.exports = router;