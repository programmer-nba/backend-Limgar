const router = require("express").Router();
const order = require("../../controllers/order/order.controller");

router.post("/add", order.create);
router.get("/", order.getOrderAll);
router.get("/:id", order.getOrderById);
router.put("/:id", order.update);
router.delete("/:id", order.delete);

//router.put("/request/:id", order.holdOrder);//--
/*router.put("/request/:id/_:oid", order.holdOrderById);//--
router.put("/confirm/:id", order.comfirm);
router.put("/cancel/:id", order.cancel);*/

module.exports = router;
