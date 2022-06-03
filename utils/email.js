const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // CREATE A TRANSPORTER
    const transporter = nodemailer.createTransport({
        // service: 'Gmail',
        // auth: {
        //     user: process.env.EMAIL_USERNAME,
        //     pasS: process.env.EMAIL_PASSWORD
        // }
        // Must activate in gmail "less secure app" option

        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // DEFINE THE EMAIL OPTIONS
    const mailOptions = {
        from: 'Shan Phyoe <shan.phyoe97@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // ACTUALLY SEND THE EMAIL
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
