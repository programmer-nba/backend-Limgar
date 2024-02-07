const router = require("express").Router();
const delivery = require("../../controllers/delivery/delivery.controller");

router.post("/register", delivery.create);
router.get("/", delivery.getStockAll);
router.get("/:id", delivery.getStockById);
//router.get("/:id", stock.getStockByproduct_oid);
router.put("/:id", delivery.update);
router.delete("/:id", delivery.delete);

router.put("/request/:id", delivery.holdOrder);//--
//router.put("/request/:id/_:oid", delivery.holdOrderById);//--
//router.put("/confirm/:id", delivery.comfirm);
router.put("/cancel/:id", delivery.cancel);

module.exports = router;
