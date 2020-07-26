const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcome = (email, name, token) => {
  const msg = {
    to: email,
    from: 'arjunshibu1999@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to our App, ${name}.\n\nPlease verify your account by following this link\nhttps://arjun-task-manager-api.herokuapp.com/users/verify/${token} \nLink is valid only for 1 hour.`,
    html: `<b>Welcome to our App, ${name}.</b><br><br>Please verify your account by following this link<br>https://arjun-task-manager-api.herokuapp.com/users/verify/${token}<br>Link is valid only for 1 hour.`
  };
  sgMail.send(msg);
}

const sendCancelation = (email, name) => {
  const msg = {
    to: email,
    from: 'arjunshibu1999@gmail.com',
    subject: 'Sorry to see you go!',
    text: `Goodbye, ${name}.\n\nWe hope to see you back sometime soon.`,
    html: `Goodbye, ${name}.<br><br>We hope to see you back sometime soon.`
  };
  sgMail.send(msg);
}

module.exports = {
  sendWelcome,
  sendCancelation
}
