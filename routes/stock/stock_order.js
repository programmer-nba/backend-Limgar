const router = require("express").Router();
const stock_order = require("../../controllers/stock/stock_order.controller ");
const auth_admin = require("../../lib/auth.admin");

router.post("/add", stock_order.create);//ใช้แอดเข้าคลัง
router.post("/reserved", stock_order.create_B);//ใช้เทส ตัดของออกสต็อก

router.get("/", stock_order.getStockOrderAll);
router.get("/:id", stock_order.getStockByProduct_oid);
//router.put("/:id", stock_order.update);
//router.delete("/:id", stock_order.delete);

//router.put("/request/:id", stock.holdOrder);//--
//router.put("/request/:id/_:oid", stock.holdOrderById);//--
router.put("/confirm/:id", stock_order.comfirm);  //ใช้คอมเฟิร์ม ออเดอร์
//router.put("/cancel/:id", stock.cancel);

module.exports = router;
