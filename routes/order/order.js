const router = require("express").Router();
const order = require("../../controllers/order/order.controller");
const auth_admin = require("../../lib/auth.admin");

router.post("/add", auth_admin, order.create);
router.get("/", auth_admin, order.getOrderAll);
router.get("/:id", order.getOrderById);
router.put("/:id", auth_admin, order.update);
router.delete("/:id", auth_admin, order.delete);

//router.put("/request/:id", order.holdOrder);//--
//router.put("/request/:id/_:oid", order.holdOrderById);//--
router.put("/confirm/:id", auth_admin, order.comfirm);
router.put("/cancel/:id", auth_admin, order.cancel);

module.exports = router;
