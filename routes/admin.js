const express = require("express");
const router = express.Router();
const knex = require("../config/knex");
const config = require('config');
const moment = require("moment");
let session = require("express-session");
const mysql = require("mysql2/promise");
let connection;

const connect = async () => {
  connection = await mysql.createConnection({
    host: "localhost",
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });
};

connect();

const getTenantStatus = (status) => {
  if (parseInt(status) === 1) return "Active";
  if (parseInt(status) === 0) return "Inactive";
};

router.get("/admin", async (req, res, next) => {
  session = req.session;
  if (!session.user_id) res.redirect("/login");
  const list = await knex.knex.raw(
    "select t.id, u.first_name, u.last_name, t.name, t.email, t.primary_contact, t.registered_on, t.is_active from tenants as t inner join users as u where u.tenant_id = t.id"
  );
  const json = JSON.parse(JSON.stringify(list[0]));
  res.render("admin/tenant/index", {
    tenants: json,
    moment: moment,
    title: "Billet App | Tenants",
    getTenantStatus: getTenantStatus,
  });
});

router.get("/admin/tenants/:id/view", async (req, res, next) => {
  session = req.session;
  if (!session.user_id) res.redirect("/login");
  const [tenants] = await connection.execute(
    "SELECT * FROM `tenants` WHERE `id` = ?",
    [req.params.id]
  );
  const [users] = await connection.execute(
    "SELECT * FROM `users` WHERE `tenant_id` = ?",
    [req.params.id]
  );
  const tenantJSON = JSON.parse(JSON.stringify(tenants[0]));
  const userJSON = JSON.parse(JSON.stringify(users[0]));
  const [services] = await connection.execute(
    "SELECT * from services where tenant_id = ?",
    [req.params.id]
  );
  const serviceJSON = JSON.parse(JSON.stringify(services));
  const [contacts] = await connection.execute(
    "SELECT * from contacts where tenant_id = ?",
    [req.params.id]
  );
  const contactJSON = JSON.parse(JSON.stringify(contacts));
  const [socials] = await connection.execute(
    "SELECT * from socials where tenant_id = ?",
    [req.params.id]
  );
  const socialJSON = JSON.parse(JSON.stringify(socials));
  const [hours] = await connection.execute(
    "SELECT * from hours where tenant_id = ?",
    [req.params.id]
  );
  const hourJSON = JSON.parse(JSON.stringify(hours));
  res.render("admin/tenant/view", {
    tenant: tenantJSON,
    user: userJSON,
    services: serviceJSON,
    contacts: contactJSON,
    socials: socialJSON,
    hours: hourJSON,
  });
});

router.get("/admin/tenants/create", async (req, res, next) => {
  session = req.session;
  if (!session.user_id) res.redirect("/login");
  res.render("admin/tenant/create");
});

module.exports = router;
