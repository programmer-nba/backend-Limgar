const router = require("express").Router();
const stock_summary = require("../../controllers/stock/stock_summary.controller");
const auth_admin = require("../../lib/auth.admin");

router.post("/register", stock_summary.create);
//router.post("/add", stock_summary.create_B);

router.get("/", stock_summary.getStockAll);
router.get("/branch/:id", stock_summary.getStockByBranch_oid);
//router.get("/:id", stock.getStockByproduct_oid);
router.put("/:id", stock_summary.update);
router.delete("/:id", auth_admin, stock_summary.delete);

//-- เดินรายการสต็อก
router.post("/add_stock/:id", stock_summary.add_stock);//--
//router.post("/income", stock_summary.income);//--
//router.put("/request/:id/_:oid", stock.holdOrderById);//--
//router.put("/confirm/:id", stock_summary.comfirm);
//router.put("/cancel/:id", stock_summary.cancel);
//ลบสต็อก
router.delete("/delete_stock/:id", stock_summary.delete_stock);

module.exports = router;
