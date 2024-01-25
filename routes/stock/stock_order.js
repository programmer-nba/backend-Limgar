const router = require("express").Router();
const stock_order = require("../../controllers/stock/stock_order.controller ");

router.post("/add", stock_order.create);
router.get("/", stock_order.getStockOrderAll);
router.get("/:id", stock_order.getStockById);
router.put("/:id", stock_order.update);
//router.delete("/:id", stock_order.delete);

//router.put("/request/:id", stock.holdOrder);//--
/*router.put("/request/:id/_:oid", stock.holdOrderById);//--
router.put("/confirm/:id", stock.comfirm);
router.put("/cancel/:id", stock.cancel);*/

module.exports = router;
