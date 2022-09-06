var express = require("express");
var router = express.Router();
const knex = require("../config/knex");
const {
  send,
  sendCancel,
  sendConfirm,
  sendUpdate,
} = require("../services/email");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
let session = require("express-session");

router.get("/admin", async (req, res, next) => {
  const list = await knex.knex("tenants");
  res.render("admin/index", { tenants: list, moment: moment });
});

router.get("/admin/tenants/create", async (req, res, next) => {
    res.render("admin/tenant/create");
  });

module.exports = router;
