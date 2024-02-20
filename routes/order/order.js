const router = require("express").Router();
const order = require("../../controllers/order/order.controller");
const auth_admin = require("../../lib/auth.admin");
const auth_agent = require("../../lib/auth.agent");

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
router.delete("/:id", order.delete);

//router.put("/request/:id", order.holdOrder);//--
//router.put("/request/:id/_:oid", order.holdOrderById);//--
router.put("/confirm/:id", auth_admin, order.comfirm);
router.put("/cut/stock", auth_admin, order.cutstock);
router.put("/tracking/:id", order.tracking);
router.put("/cancel/:id", auth_admin, order.cancel);



module.exports = router;
