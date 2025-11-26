import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service connection failed:', error);
    } else {
        console.log('✅ Email service is ready to send emails');
    }
});

// Send email
export const sendEmail = async (to, subject, html, text = '') => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@car-rental.com',
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Strip HTML if no text provided
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
};

// Send 2FA code email
export const send2FAEmail = async (email, code, username) => {
    const subject = '2FA Verification Code - Car Rental Platform';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Two-Factor Authentication</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${username}</strong>,</p>
                    <p>You have requested to enable Two-Factor Authentication for your account.</p>
                    <p>Your verification code is:</p>
                    <div class="code-box">
                        <div class="code">${code}</div>
                    </div>
                    <p>This code will expire in <strong>10 minutes</strong>.</p>
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email and ensure your account is secure.
                    </div>
                    <p>Thank you for using our platform!</p>
                </div>
                <div class="footer">
                    <p>Car Rental Platform - Secure Authentication System</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return await sendEmail(email, subject, html);
};

// Send password reset email
export const sendPasswordResetEmail = async (email, newPassword, username) => {
    const subject = 'Password Reset - Car Rental Platform';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .password-box { background: white; border: 2px solid #f5576c; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                .password { font-size: 24px; font-weight: bold; color: #f5576c; letter-spacing: 2px; font-family: monospace; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
                .action-box { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔑 Password Reset</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${username}</strong>,</p>
                    <p>Your password has been successfully reset. Here is your new temporary password:</p>
                    <div class="password-box">
                        <div class="password">${newPassword}</div>
                    </div>
                    <div class="action-box">
                        <strong>📝 Next Steps:</strong>
                        <ol>
                            <li>Log in using this temporary password</li>
                            <li>Go to your profile settings</li>
                            <li>Change your password to something memorable and secure</li>
                        </ol>
                    </div>
                    <div class="warning">
                        <strong>⚠️ Important Security Information:</strong>
                        <ul>
                            <li>This password is temporary and should be changed immediately</li>
                            <li>If you didn't request this reset, contact support immediately</li>
                            <li>Never share your password with anyone</li>
                        </ul>
                    </div>
                    <p>For security reasons, we recommend changing this password as soon as you log in.</p>
                </div>
                <div class="footer">
                    <p>Car Rental Platform - Secure Authentication System</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return await sendEmail(email, subject, html);
};

// Send login notification email
export const sendLoginNotificationEmail = async (email, username, loginInfo) => {
    const { ipAddress, device, location, timestamp } = loginInfo;
    const subject = '🔔 New Login Detected - Car Rental Platform';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; border-left: 4px solid #4facfe; padding: 15px; margin: 20px 0; }
                .info-row { display: flex; margin: 10px 0; }
                .info-label { font-weight: bold; min-width: 120px; color: #555; }
                .info-value { color: #333; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔔 New Login Detected</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${username}</strong>,</p>
                    <p>We detected a new login to your account. Here are the details:</p>
                    <div class="info-box">
                        <div class="info-row">
                            <span class="info-label">📅 Time:</span>
                            <span class="info-value">${new Date(timestamp).toLocaleString()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">🌐 IP Address:</span>
                            <span class="info-value">${ipAddress || 'Unknown'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">💻 Device:</span>
                            <span class="info-value">${device || 'Unknown'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">📍 Location:</span>
                            <span class="info-value">${location || 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="warning">
                        <strong>⚠️ Was this you?</strong><br>
                        If you don't recognize this login, please secure your account immediately by changing your password and enabling two-factor authentication.
                    </div>
                </div>
                <div class="footer">
                    <p>Car Rental Platform - Secure Authentication System</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
};

// Send KYC status email
export const sendKycStatusEmail = async (email, username, status, message) => {
    const subject = `KYC Status Update - Car Rental Platform`;
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 KYC Status Update</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${username}</strong>,</p>
                    <div class="status-box">
                        <p>${message}</p>
                    </div>
                    <p>You can check your KYC status anytime in your dashboard.</p>
                    <p>Thank you for using our platform!</p>
                </div>
                <div class="footer">
                    <p>Car Rental Platform - Identity Verification System</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
};

// Send KYC approval email
export const sendKycApprovalEmail = async (email, username) => {
    const subject = '🎉 KYC Approved - Welcome to Premium Services!';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-box { background: white; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; }
                .benefits-list { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .benefit-item { margin: 10px 0; padding-left: 20px; position: relative; }
                .benefit-item:before { content: "✅"; position: absolute; left: 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Congratulations!</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${username}</strong>,</p>
                    <div class="success-box">
                        <h2 style="color: #28a745; margin-top: 0;">✅ Your KYC Verification Has Been Approved!</h2>
                        <p>You now have access to all premium features and services on our platform.</p>
                    </div>

                    <div class="benefits-list">
                        <h3>🚀 New Benefits Unlocked:</h3>
                        <div class="benefit-item">Unlimited car reservations</div>
                        <div class="benefit-item">Priority customer support</div>
                        <div class="benefit-item">Exclusive discounts on premium vehicles</div>
                        <div class="benefit-item">Extended rental periods available</div>
                        <div class="benefit-item">VIP airport pickup service</div>
                        <div class="benefit-item">Free cancellation up to 24 hours</div>
                    </div>

                    <p>Thank you for completing your identity verification. Your trust and security are our top priorities.</p>
                    <p>Start exploring our premium services today!</p>
                </div>
                <div class="footer">
                    <p>Car Rental Platform - Identity Verification System</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
};

// Send KYC rejection email
export const sendKycRejectionEmail = async (email, username, rejectionReason) => {
    const subject = 'KYC Verification Update - Car Rental Platform';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .rejection-box { background: white; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; }
                .reason-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .steps-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .step-item { margin: 10px 0; padding-left: 20px; position: relative; }
                .step-item:before { content: "📋"; position: absolute; left: 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 KYC Verification Update</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${username}</strong>,</p>
                    <div class="rejection-box">
                        <h2 style="color: #dc3545; margin-top: 0;">❌ KYC Verification Requires Attention</h2>
                        <p>After reviewing your submitted documents, we need some additional information or corrections.</p>
                    </div>

                    <div class="reason-box">
                        <h3>📝 Reason for Review:</h3>
                        <p><strong>${rejectionReason}</strong></p>
                    </div>

                    <div class="steps-box">
                        <h3>🔄 Next Steps:</h3>
                        <div class="step-item">Review the reason above and prepare corrected documents</div>
                        <div class="step-item">Log in to your dashboard</div>
                        <div class="step-item">Go to "Identity Verification" section</div>
                        <div class="step-item">Upload corrected or additional documents</div>
                        <div class="step-item">Submit for re-review</div>
                    </div>

                    <p>If you have any questions about this decision or need assistance, please contact our support team.</p>
                    <p>We appreciate your patience and cooperation in completing the verification process.</p>
                </div>
                <div class="footer">
                    <p>Car Rental Platform - Identity Verification System</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
};

export default {
    sendEmail,
    send2FAEmail,
    sendPasswordResetEmail,
    sendLoginNotificationEmail,
    sendKycStatusEmail,
    sendKycApprovalEmail,
    sendKycRejectionEmail
};
