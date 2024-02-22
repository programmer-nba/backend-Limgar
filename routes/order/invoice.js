const router = require("express").Router();
const invoice = require("../../controllers/order/invoice.controller");
const authAdmin = require("../../lib/auth.admin");
const authAgent = require("../../lib/auth.agent");

router.get("/", authAdmin, invoice.getInvoiceAll);
router.get("/:id", invoice.getInvoiceById);
router.get("/agent/:id", authAgent, invoice.getByAgentId);

router.put("/slip/:id", authAgent, invoice.updateSlip);
router.put("/confirm/:id", authAdmin, invoice.updateInvoice);

module.exports = router;