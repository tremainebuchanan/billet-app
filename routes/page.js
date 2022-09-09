var express = require("express");
var router = express.Router();
const knex = require("../config/knex");
const config = require("config");

const { getServiceList, buildAptTime } = require("../services/utils");
let session = require("express-session");

router.get("/pages", async (req, res, next) => {
  const q = req.query;
  const result = await knex.knex("tenants").where({ id: q.tenant_id });
  console.log(result)
  const services = await knex.knex.raw('select * from services where tenant_id = ?', [q.tenant_id])
  const serviceJson = JSON.parse(JSON.stringify(services[0]));
  const contacts = await knex.knex.raw('select * from contacts where tenant_id = ?', [q.tenant_id])
  const contactJson = JSON.parse(JSON.stringify(contacts[0]));
  const hours = await knex.knex.raw('select * from hours where tenant_id = ?', [q.tenant_id])
  const hoursJson = JSON.parse(JSON.stringify(hours[0]));
  const socials = await knex.knex.raw('select * from socials where tenant_id = ?', [q.tenant_id])
  const socialJson = JSON.parse(JSON.stringify(socials[0]));
  const times = buildAptTime();
  const title = `${result[0].name} | Book Appointment`;
  const og_title = title;
  const og_image = `/images/logo.png`;
  const domain = config.get("DOMAIN");
  const og_url = `${domain}/pages?tenant_id=${result[0].id}`;
  const configs = {
    name: session.name,
    tenant: result,
    times: times,
    services: serviceJson,
    contacts: contactJson,
    hours: hoursJson,
    socials: socialJson,
    title: title,
    og_image: og_image,
    og_title: og_title,
    og_url: og_url
  };
  if (q.tenant_id !== "" && q.booked === "true") {
    return res.render("appointment/tenant-booked", {
      tenant: result,
      title: title,
    });
  } else {
    return res.render("appointment/tenant", configs);
  }
});

module.exports = router;
