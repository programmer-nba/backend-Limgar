const router = require("express").Router();
const order = require("../../controllers/order/order.controller");
const auth_admin = require("../../lib/auth.admin");
const auth_agent = require("../../lib/auth.agent");
const auth_employee = require("../../lib/auth.employee")

router.post("/add", auth_agent, order.create);
//router.get("/", auth_admin, order.getOrderAll);
//router.get("/:id", order.getOrderById);
//router.get("/:id", order.getOrderByAgentOid);
//router.put("/:id", auth_admin, order.update);
//router.delete("/:id", auth_admin, order.delete);

//--unlock auth 
//router.post("/add", order.create);
router.get("/", order.getOrderAll);
router.get("/:id", order.getOrderById);
router.get("/agent/:id", order.getOrderByAgentId);
//router.get("/:id", order.getOrderByAgentOid);
router.put("/:id", order.update);
router.put("/slip/:id", order.updateSlip);
router.delete("/:id", order.delete);

//router.put("/request/:id", order.holdOrder);//--
//router.put("/request/:id/_:oid", order.holdOrderById);//--
router.put("/confirm/:id", auth_admin, order.comfirm);
router.put("/cut/stock/:id", order.cutstock);
router.put("/tracking/:id", auth_employee, order.tracking);
router.put("/cancel/:id", auth_admin, order.cancel);

router.put("/confirm/shipping/:id", auth_employee, order.confirmShipping);
router.put("/cancel/shopping/:id", order.cancelShipping);


module.exports = router;
