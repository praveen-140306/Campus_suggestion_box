const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const testMail = async () => {
    try {
        console.log("User:", process.env.EMAIL_SERVICE_USER);
        const transporter = nodemailer.createTransport({
            service: 'gmail', // based on sendEmail.js
            auth: {
                user: process.env.EMAIL_SERVICE_USER,
                pass: process.env.EMAIL_SERVICE_PASS,
            },
        });

        const mailOptions = {
            from: `"Test Server" <${process.env.EMAIL_SERVICE_USER}>`,
            to: process.env.EMAIL_SERVICE_USER, // send to self
            subject: 'Test Email from Node Server',
            text: 'This is a test email to verify credentials.',
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('--- Email Sent Successfully ---');
        console.log('Message ID: %s', info.messageId);
    } catch (error) {
        console.error('Email Dispatch Error:', error);
    }
};

testMail();
