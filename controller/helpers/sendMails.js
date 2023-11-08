const nodemailer = require('nodemailer');
const SMTPTransport = require('nodemailer/lib/smtp-transport');

const emailSender = async (to, subject, html) => {
//   console.log("cred =====", SMTP_MAIL, SMTP_PASSWORD);
  try {
    // const smtpTransport = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
    //   port: 587,
    //   secure: false,
    //   requireTLS: true,
    //   auth: {
    //     user: "rkdeveloper011@gmail.com",
    //     pass: "zcupzlskajwftptc",
    //   },
    // });
    
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "f39ae1e4f58dad",
          pass: "ab1a3fa7143df2"
        }
      });
    
    const mailOptions = {
      from: `archit123@gmail.com`,
      to,
      subject,
      html,
    };
    let info = await transport.sendMail(mailOptions);
    console.log("mail send info ======", info.response);
    return info;
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  sendEmail: emailSender,
  sendOTP: async (to, subject) => {
    try {
      var otp = Math.floor(1000 + Math.random() * 9000);
      console.log("details ======>", to, subject);
      console.log(otp,">>>>>>>>>>>>>>>>>otp>>>>>>>>>>>>>>>>>>")
      const html = `<h1>Your OTP is : - ${otp}</h1>`;
      const res = await emailSender(to, subject, html);
      return otp;
    } catch (err) {
      throw err;
    }
  },
};