const router = require("express").Router();
const term_con = require("../../controllers/user/term_con.controller");
// const authAdmin = require("../../lib/authAdmin");
const auth_agent = require("../../lib/auth.agent");

//router.post("/register", agent.create);
//router.get("/", agent.getAgentAll);
//router.get("/:id", term_con.getAgentById);
router.put("/:id", auth_agent, term_con.update);
//router.put("/:id", term_con.update_con2);
//router.delete("/:id", agent.delete);

router.put("/confirm/:id", auth_agent, term_con.comfirm);
//router.put("/cancel/:id", agent.cancel);

module.exports = router;
