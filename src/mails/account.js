const { env } = process;
const sgMail = require('@sendgrid/mail');

const host = env.VERIFICATION_LINK_HOST + (env.MODE === 'prod' ? '' : ':4000');

sgMail.setApiKey(env.SENDGRID_API_KEY);

const sendWelcome = (email, name, token) => {
  const msg = {
    from: env.SENDGRID_VERIFIED_EMAIL,
    to: email,
    subject: 'Thanks for joining in!',
    text: `Welcome to Task Manager, ${name}.\n\nPlease verify your account by following this link:\n${host}/users/verify/${token}\n\nLink is valid only for one hour.`,
    html: `<b>Welcome to Task Manager, ${name}.</b><br><br>Please verify your account by following this link:<br>${host}/users/verify/${token}<br><br>Link is valid only for one hour.`
  };

  sgMail
  .send(msg)
  .then(() => {}, err => {
    console.log(err);

    if (err.response)
      console.log(err.response.body);
  });
}

const sendCancellation = (email, name) => {
  const msg = {
    from: env.SENDGRID_VERIFIED_EMAIL,
    to: email,
    subject: 'Sorry to see you go!',
    text: `Goodbye, ${name}.\n\nWe hope to see you back soon.`,
    html: `<b>Goodbye, ${name}.</b><br><br>We hope to see you back soon.`
  };

  sgMail
  .send(msg)
  .then(() => {}, err => {
    console.log(err);

    if (err.response)
      console.log(err.response.body);
  });
};

module.exports = {
  sendWelcome,
  sendCancellation
};
