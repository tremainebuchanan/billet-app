
const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const knex = require('../config/knex');
const config = require('config');
const crypto = require("crypto");
let session = require('express-session');
const { v4: uuidv4 } = require("uuid");

router.post('/auth', async (req, res, next) => {
  const result = await knex.knex.raw('select u.id, u.email, u.password, u.salt, u.tenant_id, u.first_name, u.last_name, ut.title from users as u inner join usertypes as ut on ut.id = u.user_type_id where u.email = ?', [req.body.email])
  if(result.length < 1){
    req.flash('info', 'Incorrect email or password entered.')
    return res.redirect('/login')
  }
  const userJSON = JSON.parse(JSON.stringify(result[0]));
  const user = userJSON[0];
  const passwordVerified = await argon2.verify(user.password, req.body.password, {salt: user.salt});
  if(passwordVerified === false){
    req.flash('info', 'Incorrect email or password entered.');
    return res.redirect('/login')
  }
  session = req.session;
  session.user_id = user.id;
  session.email = user.email;
  session.tenant_id = user.tenant_id;
  session.name = `${user.first_name} ${user.last_name}`
  if(user.title === 'Super Admin') return res.redirect('/admin');
  return res.redirect(`/appointments/${user.tenant_id}`)
  
});

router.get('/login', (req, res, next) => {
    session = req.session;
    const message = req.flash('info');
    const appName = config.get('APP_NAME');
    const title = `Login | ${appName}`
    if(session.user_id) return res.redirect(`/appointments/${session.tenant_id}`)
    return res.render('login/login', {title: title, info: message});
});

router.get('/logout', async (req, res, next) => {
  req.session.destroy();
  res.redirect('/login');
});

router.post('/superadmin', async(req, res, next)=> {
  const salt = crypto.randomBytes(60).toString();
  
  const generatedPassword = await argon2.hash(req.body.password, {
    salt: Buffer.from(salt),
  });
  try{
    const result = await knex.knex('usertypes').select('id').where('title', 'Super Admin');
    const jsonResult = JSON.parse(JSON.stringify(result[0]));
    const usertypeid = jsonResult.id;
    const tenant = uuidv4();
    console.log(tenant)
    const user = {
      id: uuidv4(),
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      salt,
      password: generatedPassword,
      user_type_id: usertypeid,
      tenant_id: tenant
    };
    await knex.knex('users').insert(user)
    return res.json('admin created')
  }catch(e){
    console.log(e)
    res.status(400).json(e)
  }
})
router.get('/usertypes', async(req, res, next) => {
  try{
    await knex.knex('usertypes').insert([{
      id: uuidv4(),
      title: 'Super Admin'
    },{
      id: uuidv4(),
      title: 'Tenant'
    }])
    return res.json('user types created')
  }catch(e){
    res.status(400).json(e)
  }
 
})

module.exports = router;
