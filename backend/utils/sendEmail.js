const nodemailer = require('nodemailer');

const sendEmail = async (suggestion) => {
    try {
        let transporter;

        // Use Ethereal test account if credentials aren't provided
        if (!process.env.EMAIL_SERVICE_USER || !process.env.EMAIL_SERVICE_PASS) {
            console.log('Generating Ethereal test account...');
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
            console.log(`Using Ethereal Account: ${testAccount.user}`);
        } else {
            // Setup real transporter (e.g., Gmail)
            transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_SERVICE_USER,
                    pass: process.env.EMAIL_SERVICE_PASS,
                },
            });
        }

        // Determine destination email based on category
        let toEmail = process.env.GENERAL_EMAIL || 'general@campus.edu';
        switch (suggestion.category) {
            case 'Academics':
                toEmail = process.env.ACADEMICS_EMAIL || 'academics@campus.edu';
                break;
            case 'Facilities':
                toEmail = process.env.FACILITIES_EMAIL || 'facilities@campus.edu';
                break;
            case 'Events':
                toEmail = process.env.EVENTS_EMAIL || 'events@campus.edu';
                break;
            default:
                toEmail = process.env.GENERAL_EMAIL || 'general@campus.edu';
        }

        const ccEmails = [];
        if (suggestion.user && suggestion.user.email) {
            ccEmails.push(suggestion.user.email);
        }

        // Email options
        const mailOptions = {
            from: `"Campus Suggestion Box" <${process.env.EMAIL_SERVICE_USER || 'noreply@campus.edu'}>`,
            to: toEmail,
            cc: ccEmails,
            subject: `Action Taken: Suggestion Update in ${suggestion.category}`,
            html: `
                <h3>Suggestion Needs Action / Has Update</h3>
                <p>Hello ${suggestion.category} Team,</p>
                <p>A suggestion has been updated to: <b>${suggestion.status}</b></p>
                <hr />
                <p><b>From:</b> ${suggestion.name}</p>
                <p><b>Category:</b> ${suggestion.category}</p>
                <p><b>Message:</b> ${suggestion.message}</p>
                <p><b>Admin Note:</b> ${suggestion.adminReply || 'No additional notes provided.'}</p>
                ${suggestion.attachmentUrl ? `<p><b>Attachment:</b> <a href="${suggestion.attachmentUrl}">View Attachment</a></p>` : ''}
                <hr />
                <p>Please log in to the admin portal to take further action.</p>
            `,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('--- Email Sent Successfully ---');
        console.log('Message ID: %s', info.messageId);
        
        // Return URL for ethereal so we can click and view it in console during development
        if (nodemailer.getTestMessageUrl(info)) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

    } catch (error) {
        console.error('Email Dispatch Error:', error);
    }
};

module.exports = sendEmail;
