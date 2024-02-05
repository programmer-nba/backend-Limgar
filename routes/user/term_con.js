const router = require("express").Router();
const term_con = require("../../controllers/user/agent.controller");
// const authAdmin = require("../../lib/authAdmin");

//router.post("/register", agent.create);
//router.get("/", agent.getAgentAll);
router.get("/:id", term_con.getAgentById);
router.put("/:id", term_con.update);
//router.delete("/:id", agent.delete);

router.put("/confirm/:id", term_con.comfirm);
//router.put("/cancel/:id", agent.cancel);

module.exports = router;
