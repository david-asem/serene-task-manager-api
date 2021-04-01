const mailgun = require('mailgun-js');
const DOMAIN = "sandbox8531f4fcd40345d3b3e4d753e98c8d2c.mailgun.org";
const API_KEY = process.env.MAILGUN_API_KEY
const mg = mailgun({ apiKey:API_KEY, domain: DOMAIN });

const sendWelcomeEmail = (email, firstName) => {
    mg.messages().send({
        to: email,
        from: 'ddy.asem@gmail.com',
        subject: 'Thanks for choosing Serene Task Manager App!',
        text:`Welcome to the app, ${firstName}. I am so excited to have you onboard! Serene Task Manager app is the best on the market. It gets the job done, and done right! If along the way you encounter any challenges, please do not hesitate to reach out. I'll be more than happy to guide you  on how to have a great experience with the app!`
    })
}

const sendCancelationEmail = (email, firstName) => {
    mg.messages().send({
        to: email,
        from: 'ddy.asem@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Hi ${firstName}, I'm sorry to see you go so soon. Is there anything I could have done better? Would you like to share any feedback with me on the app? In any case, I am glad you joined! I hope to see you back sometime soon. Goodbye for now, ${firstName}`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}


