const nodemailer = require('nodemailer');

// 📌 יצירת טרנספורטר עבור שליחת מיילים
const transporter = nodemailer.createTransport({
  service: 'gmail', // ניתן לשנות לפי ספק המייל שלך (SendGrid, Mailgun וכו')
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * 📩 פונקציה כללית לשליחת אימייל
 * @param {string} to - כתובת אימייל של הנמען
 * @param {string} subject - נושא האימייל
 * @param {string} text - תוכן האימייל בפורמט טקסט פשוט
 * @param {string} html - תוכן האימייל בפורמט HTML (אופציונלי)
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"TicketTrust" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text // אם לא סופק HTML, ישתמש בטקסט כמות שהוא
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
    throw new Error('Email sending failed');
  }
};

/**
 * 🔐 שליחת קוד OTP לאימות דו-שלבי (2FA)
 * @param {string} email - כתובת אימייל של המשתמש
 * @param {string} otp - הקוד OTP שנשלח
 */
const sendOTP = async (email, otp) => {
  const subject = 'Your OTP Code for TicketTrust';
  const text = `Your OTP code is: ${otp}. It will expire in 5 minutes.`;

  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2 style="color: #4CAF50;">TicketTrust - OTP Verification</h2>
      <p>Your OTP code is:</p>
      <h3 style="color: #000; background: #f2f2f2; padding: 10px; display: inline-block; border-radius: 5px;">
        ${otp}
      </h3>
      <p>This code will expire in <b>5 minutes</b>. If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail(email, subject, text, html);
};

/**
 * 🔄 שליחת אימייל לאיפוס סיסמה
 * @param {string} email - כתובת אימייל של המשתמש
 * @param {string} resetToken - טוקן לאיפוס סיסמה
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const text = `To reset your password, click the link below:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2 style="color: #ff9800;">TicketTrust - Password Reset</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #ff9800; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail(email, subject, text, html);
};

/**
 * 📢 שליחת התראות מערכת למשתמשים
 * @param {string} email - כתובת אימייל של המשתמש
 * @param {string} message - תוכן ההתראה
 */
const sendSystemNotification = async (email, message) => {
  const subject = 'Important Notification from TicketTrust';
  const text = message;

  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2 style="color: #007bff;">TicketTrust - Notification</h2>
      <p>${message}</p>
    </div>
  `;

  await sendEmail(email, subject, text, html);
};

module.exports = {
  sendEmail,
  sendOTP,
  sendPasswordResetEmail,
  sendSystemNotification
};
