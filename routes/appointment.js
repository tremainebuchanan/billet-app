var express = require('express');
var router = express.Router();
const knex = require('../config/knex');
const { send, sendCancel, sendConfirm, sendUpdate } = require('../services/email');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
let session = require('express-session');
const { getServiceList, buildAptTime } = require('../services/utils');

const getStatusColor = (status) => {
  if(status == 'Pending Confirmation') return 'is-warning';
  if(status == 'Confirmed') return 'is-primary';
  if(status == 'Cancelled') return 'is-danger';
}

router.post('/api/appointments', async (req, res, next) => {
  session = req.session;
  //if(session.user_id){
    const request = req.body;
    const services = getServiceList();
    const service = services.find(x => x.id === parseInt(request.service))
    const tenant = await knex.knex('tenants').select().where({id: request.tenant_id});
    const tenantJSON = JSON.parse(JSON.stringify(tenant[0]));
    const id = uuidv4();
    const apt = await knex.knex('appointments').insert({
      id,
      first_name: request.first_name,
      last_name: request.last_name,
      email: request.email,
      contact: request.contact,
      tenant_id: request.tenant_id,
      service: service.title,
      start_date: moment(request.start_date).format("YYYY-MM-DD"),
      start_time: request.start_time,
      status: 'Pending Confirmation'
    });
    const domain = "http://localhost:3001";
    const configs = {
      to: request.email,
      name: request.first_name + " " + request.last_name,
      service: service.title,
      date: moment(request.start_date).format('Do MMMM, YYYY'),
      time: request.start_time,
      url: domain + "/confirm/" + id,
      social: "@tenanttwitter",
      template: "appointment_confirmation_v2",
      tenant: tenantJSON.name,
      subject: `Appointment Confirmation`
    }
    send(configs);
    res.json({message: 'item created'})
});

router.get('/appointments/:id', async(req, res, next) => {
  session = req.session;
  if(session.user_id){
    const list = await knex.knex('appointments').where({tenant_id: req.params.id});
    const aptTimes = buildAptTime();
    const services = getServiceList();
  res.render('appointment/index', { appointments: list, moment: moment, name: session.name, times: aptTimes, services, tenant: req.params.id, getStatusColor: getStatusColor });
  }else{
    return res.redirect('/login');
  }
});

router.get('/api/appointments/:id', async(req, res, next) => {
  const appointment = await knex.knex('appointments').where({id: req.params.id});
  return res.json(appointment[0]);
});

router.patch('/api/appointments/:id', async(req, res, next) => {
  const id = req.params.id;
  const services = getServiceList();
  const apt = await knex.knex('appointments').where('id', id);
  const aptJson = JSON.parse(JSON.stringify(apt[0]))
  let request = req.body;
  request.service = aptJson[0].service;
  const appointment = await knex.knex('appointments').where('id', id).update(request);
  const configs = {
    to: request.email,
    name: request.first_name,
    service: request.service,
    start_date: moment(request.start_date).format('Do MMMM, YYYY'),
    time: request.start_time,
    template: "appointment_updated",
    tenant: request.name,
    subject: `Appointment Updated`
  }
  sendUpdate(configs);
  return res.json(appointment);
});

router.put('/api/appointments/:id', async(req, res, next) => {
  const id = req.params.id;
  const appointment = await knex.knex('appointments').where('id', id).update({
    status: req.body.status
  });
  const apt = await knex.knex.raw('select a.first_name, a.last_name, a.email, a.start_date, a.start_time, t.name, a.service from appointments as a inner join tenants as t on a.tenant_id = t.id where a.id = ?', [id]); 
  const aptJSON = JSON.parse(JSON.stringify(apt[0]))
  const result = aptJSON[0];
  console.log(result)
  const configs = {
    to: result.email,
    name: result.first_name,
    service: result.service,
    start_date: moment(result.start_date).format('Do MMMM, YYYY'),
    time: result.start_time,
    template: "appointment_cancelled",
    tenant: result.name,
    subject: `Appointment Cancelled`
  }
  sendCancel(configs);
  return res.json(appointment);
});

router.get('/confirm/:id', async(req, res, next) => {
  const id = req.params.id;
  const appointment = await knex.knex('appointments').where('id', id).update({
    status: 'Confirmed'
  });
  const apt = await knex.knex.raw('select a.first_name, a.last_name, a.email, a.start_date, a.start_time, t.name, a.service from appointments as a inner join tenants as t on a.tenant_id = t.id where a.id = ?', [id]); 
  const aptJSON = JSON.parse(JSON.stringify(apt[0]))
  const result = aptJSON[0];
  const configs = {
    to: result.email,
    name: result.first_name,
    service: result.service,
    start_date: moment(result.start_date).format('Do MMMM, YYYY'),
    time: result.start_time,
    template: "customer_appointment_confirmation",
    tenant: result.name,
    subject: `Appointment Confirmed`
  }
  sendConfirm(configs);
  res.redirect('/confirmed')
});

router.get('/confirmed', (req, res, next) => {
  res.render('appointment/confirm')
})

router.get('/appointments/:tenant_id/:id/edit', async (req, res, next) => {
  session = req.session;
  const aptTimes = buildAptTime();
  const services = getServiceList();
  const tenant_id = req.params.tenant_id;
  const id = req.params.id;
  const appointment = await knex.knex.raw('select * from appointments where id = ?', [id]);
  const aptJSON = JSON.parse(JSON.stringify(appointment[0]));
  res.render('appointment/edit', {name: session.name, times: aptTimes, services, tenant: tenant_id, appointment: aptJSON[0], moment: moment})
})


module.exports = router;
