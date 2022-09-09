var express = require("express");
var router = express.Router();
const knex = require("../config/knex");
const argon2 = require("argon2");
const crypto = require("crypto");
const randomstring = require("randomstring");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/data/uploads/')
  },
  filename: function (req, file, cb) {
    const id = uuidv4();
    const [filename, ext] = file.originalname.split(".");
    cb(null, `${id}.${ext}`)
  }
})

const upload = multer({ storage: storage })
let session = require("express-session");

router.post("/tenants", upload.single('file'), async (req, res, next) => {
  session = req.session;
  if (session.user_id) {
    const request = JSON.parse(req.body.tenant);
    const id = uuidv4();
    const randomBytes = crypto.randomBytes(60).toString();
    //const randomPassword = randomstring.generate(16);
    const randomPassword = 'H1gh53cur1ty';
    const generatedPassword = await argon2.hash(randomPassword, {
      salt: Buffer.from(randomBytes),
    });
    const [filename, ext] = req.file.filename.split(".");
    const tenant = {
      id,
      name: request.name,
      email: request.email,
      primary_contact: request.primary_contact,
      description: request.description,
      tag_line: request.tagline,
      street_address: request.street_address,
      address_line: request.address_line,
      district_town_city: request.district_town_city,
      parish: request.parish,
      logo: filename,
    };
    const result = await knex
      .knex("usertypes")
      .select("id")
      .where("title", "Tenant");
    const jsonResult = JSON.parse(JSON.stringify(result[0]));
    const usertypeid = jsonResult.id;
    const user = {
      id: uuidv4(),
      first_name: request.admin_first_name,
      last_name: request.admin_last_name,
      email: request.admin_email,
      salt: randomBytes,
      password: generatedPassword,
      user_type_id: usertypeid,
    };
    
    const services = request.services;
    let serviceItem = {};
    let serviceList = [];
    services.forEach((service) => {
      (serviceItem.id = uuidv4()), (serviceItem.title = service);
      serviceItem.tenant_id = id;
      serviceList.push(serviceItem);
      serviceItem = {};
    });

    const contacts = request.contacts;
    let contactItem = {};
    let contactList = [];
    contacts.forEach((contact) => {
      (contactItem.id = uuidv4()),
        (contactItem.phone = contact),
        (contactItem.tenant_id = id);
      contactList.push(contactItem);
      contactItem = {};
    });

    const socialMedia = request.socialMedia;
    let socialMediaItem = {};
    let socialMediaList = [];
    socialMedia.forEach((social) => {
      socialMediaItem.id = uuidv4();
      socialMediaItem.handle = social;
      socialMediaItem.tenant_id = id;
      socialMediaList.push(socialMediaItem);
      socialMediaItem = {};
    });

    const hours = request.hours;
    let hourItem = {};
    let hourList = [];
    hours.forEach((hour) => {
      hourItem.id = uuidv4();
      hourItem.open_at = hour.open_at;
      hourItem.close_at = hour.close_at;
      hourItem.dayofweek = hour.dayofweek;
      hourItem.tenant_id = id;
      hourList.push(hourItem);
      hourItem = {};
    });
    tenant.id = id;
    user.tenant_id = id;
    try {
      await knex.knex("tenants").insert(tenant);
      await knex.knex("users").insert(user);
      await knex.knex("services").insert(serviceList);
      await knex.knex("contacts").insert(contactList);
      await knex.knex("socials").insert(socialMediaList);
      await knex.knex("hours").insert(hourList);
      return res.json({
        message: "Tenant successfully created",
        success: true,
      });
    } catch (e) {
      console.log("Error", e);
      return res
        .status(400)
        .json({
          message: "An error has occurred while creating tenant",
          success: false,
        });
    }
  } else {
    res.redirect("/login");
  }
});

router.delete("/tenants/:id", async (req, res, next) => {
  const id = req.params.id;
  const result = await knex.knex.raw("select id from tenants where id = ?", [
    id,
  ]);
  const tenantJSON = JSON.parse(JSON.stringify(result[0]));
  if (tenantJSON.length === 0) {
    return res
      .status(400)
      .json({
        message: "An error occurred while deleted the tenant",
        success: false,
      });
  }
  try {
    await knex.knex.raw("delete from tenants where id = ?", [id]);
    await knex.knex.raw("delete from socials where tenant_id = ?", [id]);
    await knex.knex.raw("delete from hours where tenant_id = ?", [id]);
    await knex.knex.raw("delete from contacts where tenant_id = ?", [id]);
    await knex.knex.raw("delete from users where tenant_id = ?", [id]);
    await knex.knex.raw("delete from services where tenant_id = ?", [id]);
    res.json({ message: "Tenant successfully removed.", success: true });
  } catch (e) {
    res
      .status(400)
      .json({
        message: "An error occurred while deleting tenant.",
        success: false,
      });
  }
});

module.exports = router;
