const router = require("express").Router();
const order = require("../../controllers/order/order.controller");
const auth_admin = require("../../lib/auth.admin");
const auth_agent = require("../../lib/auth.agent");

router.post("/add", auth_agent, order.create);
router.get("/", auth_admin, order.getOrderAll);
router.get("/:id", order.getOrderById);
//router.get("/:id", order.getOrderByAgentOid);
router.put("/:id", auth_admin, order.update);
router.delete("/:id", auth_admin, order.delete);

//router.put("/request/:id", order.holdOrder);//--
//router.put("/request/:id/_:oid", order.holdOrderById);//--
router.put("/confirm/:id", auth_admin, order.comfirm);
router.put("/cancel/:id", auth_admin, order.cancel);

module.exports = router;
