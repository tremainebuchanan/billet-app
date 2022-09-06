var express = require('express');
var router = express.Router();
const knex = require('../config/knex');


const { getServiceList, buildAptTime } = require('../services/utils');
let session = require('express-session');

router.get('/pages', async(req, res, next)=>{
    const q = req.query;
    const result = await knex.knex('tenants').where({id: q.tenant_id});
    const services = getServiceList();
    const times = buildAptTime();
    res.render('appointment/tenant', { name: session.name, tenant: result, times: times, services: services});
});

module.exports = router;