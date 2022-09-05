
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const config = require('config');
const key = config.get('MAILGUN_API_KEY');
const SANDBOX = config.get('MAILGUN_DOMAIN');
const FROM = config.get('EMAIL_FROM')
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: "api", key, });

const sendToMailGun = (configs) => {
    return 'Unimplemented'
}

const sendUpdate = (configs) => {
  const name =  configs.name;
  const start_date = configs.start_date;
  const start_time = configs.time;
  const service = configs.service;
  const tenant = configs.tenant

}

const sendConfirm = (configs) => {
  const name =  configs.name;
  const start_date = configs.start_date;
  const start_time = configs.time;
  const service = configs.service;
  mg.messages
      .create(SANDBOX, {
        from: FROM,
        to: configs.to,
        subject: configs.subject,
        template: configs.template,
        "t:variables": JSON.stringify({
          name,
          start_date,
          start_time,
          service
        }),
      })
      .then((msg) => {
        console.log(`email sent to ${configs.to}`);
      })
      .catch((err) => console.log(err));
}

const sendCancel = (configs) => {
  const name =  configs.name;
  const start_date = configs.start_date;
  const time = configs.time;
  const service =  configs.service;
  const tenant = configs.tenant;

  mg.messages
      .create(SANDBOX, {
        from: FROM,
        to: configs.to,
        subject: configs.subject,
        template: configs.template,
        "t:variables": JSON.stringify({
          name,
          service,
          start_date,
          time,
          service,
          tenant
        }),
      })
      .then((msg) => {
        console.log(`email sent to ${configs.to}`);
      })
      .catch((err) => console.log(err));
}
const send = (configs) => {
    const name = configs.name;
    const service = configs.service;
    const appointment_date = configs.date;
    const appointment_time = configs.time;
    const tenant_url = configs.url;
    const tenant_name = configs.tenant;
    const tenant_twitter = configs.social;

    mg.messages
      .create(SANDBOX, {
        from: FROM,
        to: configs.to,
        subject: configs.subject,
        template: configs.template,
        "t:variables": JSON.stringify({
          name,
          service,
          appointment_date,
          appointment_time,
          tenant_url,
          tenant_name,
          tenant_twitter,
        }),
      })
      .then((msg) => {
        console.log(`email sent to ${configs.to}`);
      })
      .catch((err) => console.log(err));
}

module.exports = { send, sendCancel, sendConfirm, sendUpdate };