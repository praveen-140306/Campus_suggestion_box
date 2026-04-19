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
            subject: `Update on Suggestion: ${suggestion.category}`,
            html: `
            <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 40px; text-align: center;">
                <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 40px; margin: 0 auto; text-align: left; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Campus Suggestion Box</h1>
                        <p style="color: #64748b; font-size: 15px; margin-top: 8px;">Automated Status Update</p>
                    </div>

                    <div style="border-top: 2px solid #f1f5f9; padding-top: 30px;">
                        <p style="color: #334155; font-size: 16px; margin-bottom: 24px; line-height: 1.6;">
                            Hello <strong style="color: #0f172a;">${suggestion.category} Team</strong>,<br/>
                            A suggestion submitted by <b>${suggestion.name}</b> has been updated:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; padding: 8px 16px; background-color: ${suggestion.status === 'Resolved' ? '#dcfce7' : '#fef9c3'}; color: ${suggestion.status === 'Resolved' ? '#166534' : '#854d0e'}; font-weight: 700; border-radius: 9999px; font-size: 14px; border: 1px solid ${suggestion.status === 'Resolved' ? '#bbf7d0' : '#fef08a'}; text-transform: uppercase; letter-spacing: 1px;">
                                Status: ${suggestion.status}
                            </span>
                        </div>
                    </div>

                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
                        <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Suggestion Details</h3>
                        <p style="margin: 0 0 12px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                            ${suggestion.message}
                        </p>
                        ${suggestion.attachmentUrl ? `<p style="margin: 0; font-size: 14px; margin-top: 16px;"><b>📎 Attachment:</b> <a href="${suggestion.attachmentUrl}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">Click to view file</a></p>` : ''}
                    </div>

                    ${suggestion.adminReply ? `
                    <div style="background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 0 12px 12px 0; margin-bottom: 30px;">
                        <h3 style="margin: 0 0 8px 0; color: #4f46e5; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Official Admin Response</h3>
                        <p style="margin: 0; color: #312e81; font-size: 15px; line-height: 1.6; font-weight: 500;">${suggestion.adminReply}</p>
                    </div>
                    ` : ''}

                    <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #f1f5f9;">
                        <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Please log in to the portal to take further action or review details.</p>
                        <a href="https://campus-suggestion-box-backend.vercel.app/" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 600; border-radius: 8px; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Open Dashboard</a>
                    </div>
                </div>
                <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
                    <p>© 2026 Campus Suggestion Box. All rights reserved.</p>
                </div>
            </div>
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
