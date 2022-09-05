
const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const knex = require('../config/knex');
let session = require('express-session');

router.post('/auth', async (req, res, next) => {
  const user = await knex.knex('users').where({email: req.body.email})
  if(user.length < 1){
    req.flash('info', 'Incorrect email or password entered.')
    return res.redirect('/login')
  }
  const result = await argon2.verify(user[0].password, req.body.password, {salt: user[0].salt});
  if(result === false){
    req.flash('info', 'Incorrect email or password entered.');
    return res.redirect('/login')
  }
  session = req.session;
  session.user_id = user[0].id;
  session.email = user[0].email;
  session.tenant_id = user[0].tenant_id;
  session.name = `${user[0].first_name} ${user[0].last_name}`
  return res.redirect(`/appointments/${user[0].tenant_id}`)
});

router.get('/login', (req, res, next) => {
    session = req.session;
    const message = req.flash('info')
    if(session.user_id)return res.redirect(`/appointments/${session.tenant_id}`)
    return res.render('login/login', {info: message});
});

router.get('/logout', async (req, res, next) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
