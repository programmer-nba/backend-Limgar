const router = require("express").Router();
const stock = require("../../controllers/stock/stock.controller");

router.post("/register", stock.create);
router.get("/", stock.getStockAll);
router.get("/:id", stock.getStockById);
router.put("/:id", stock.update);
router.delete("/:id", stock.delete);

//router.put("/request/:id", stock.holdOrder);//--
router.put("/request/:id/_:oid", stock.holdOrderById);//--
router.put("/confirm/:id", stock.comfirm);
router.put("/cancel/:id", stock.cancel);

module.exports = router;
