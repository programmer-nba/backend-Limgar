require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const concention = require("./config/db");
concention();

app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());

// login
app.use("/Limgar/login", require("./routes/login"));
//app.use("/Limgar/login_agent", require("./routes/login_agent"));

//กดยอมรับ หนังสือยินยอม1,หนังสือยินยอม2
app.use("/Limgar/term", require("./routes/user/term_con"));

// me
app.use("/Limgar/me", require("./routes/me"));
//app.use("/Limgar/me_agent", require("./routes/me_agent"));

// user
app.use("/Limgar/admin", require("./routes/user/admin"));
app.use("/Limgar/agent", require("./routes/user/agent"));
//user-customer
app.use("/Limgar/customer", require("./routes/user/customer"));

app.use("/Limgar/channels", require("./routes/more/channels"));

//delivery
app.use("/Limgar/delivery", require("./routes/delivery/delivery"));

// Porduct
app.use("/Limgar/product", require("./routes/product/product"));
app.use("/Limgar/product/image", require("./controllers/product/uploadfile"));
app.use("/Limgar/product_price", require("./routes/product/product_price"));

//stock
app.use("/Limgar/stock", require("./routes/stock/stock"));
// app.use("/Limgar/stock_summary", require("./routes/stock/stock_summary"));
app.use("/Limgar/stock/product", require("./routes/stock/stock_product"));

//stock_log
app.use("/Limgar/stock_order", require("./routes/stock/stock_order"));

//order
app.use("/Limgar/order", require("./routes/order/order"));
app.use("/Limgar/invoice", require("./routes/order/invoice"));

// Function
app.use("/Limgar/function", require("./routes/more/function"));

// Delete Image
app.use("/Limgar/delete/image", require("./routes/more/deleteImage"));
// UPLOAD FILE COLLECTION
app.use("/Limgar/image/collection", require("./routes/more/uploadfile"));

// Commission
app.use("/Limgar/commission", require("./routes/commission/commission"));

const port = process.env.PORT || 7474;
app.listen(port, () => {
    console.log(`\n-- Listening on port ${port}  --\n`)
});