const nodemailer = require('nodemailer');
require('dotenv').config(); // Make sure dotenv is installed: npm install dotenv

const testEmail = async () => {
    // Replace this with your generated app password
    const emailPass = process.env.GMAIL_APP_PASSWORD || 'YOUR_APP_PASSWORD_HERE'; 

    if (!emailPass || emailPass === 'YOUR_APP_PASSWORD_HERE') {
        console.error('❌ Error: Please provide a valid Gmail App Password.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'enigma.vssut@gmail.com',
            pass: emailPass
        }
    });

    const mailOptions = {
        from: 'enigma.vssut@gmail.com',
        to: 'enigma.vssut@gmail.com',
        subject: `Test Email from Enigma Website`,
        text: `This is a test email to verify that the email sender is working correctly.`
    };

    try {
        console.log('Attempting to send email...');
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email successfully sent! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
};

testEmail();
