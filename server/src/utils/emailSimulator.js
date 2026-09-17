/**
 * Email Simulator for verification links and password reset tokens
 * Stores simulated outgoing emails so evaluators/users can inspect them,
 * and prints clearly formatted terminal notifications with active links.
 */

class EmailSimulator {
  constructor() {
    this.simulatedEmails = [];
  }

  sendVerificationEmail(email, token, name) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const mailItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      to: email,
      recipientName: name,
      subject: 'Verify your KudosWall Account',
      type: 'VERIFICATION',
      token,
      actionUrl: verifyUrl,
      sentAt: new Date().toISOString(),
      message: `Hi ${name}, please verify your email to activate your KudosWall account using the token below.`
    };

    this.simulatedEmails.unshift(mailItem);
    if (this.simulatedEmails.length > 50) this.simulatedEmails.pop();

    console.log('\n================ [SIMULATED EMAIL: VERIFICATION] ================');
    console.log(`To: ${name} <${email}>`);
    console.log(`Subject: Verify your KudosWall Account`);
    console.log(`Verification Token: ${token}`);
    console.log(`Verification URL: ${verifyUrl}`);
    console.log('=================================================================\n');

    return mailItem;
  }

  sendPasswordResetEmail(email, token, name) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const mailItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      to: email,
      recipientName: name,
      subject: 'Reset your KudosWall Password',
      type: 'PASSWORD_RESET',
      token,
      actionUrl: resetUrl,
      sentAt: new Date().toISOString(),
      message: `Hi ${name}, you requested a password reset. Use the token below to set your new password.`
    };

    this.simulatedEmails.unshift(mailItem);
    if (this.simulatedEmails.length > 50) this.simulatedEmails.pop();

    console.log('\n================ [SIMULATED EMAIL: PASSWORD RESET] ================');
    console.log(`To: ${name} <${email}>`);
    console.log(`Subject: Reset your KudosWall Password`);
    console.log(`Reset Token: ${token}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('===================================================================\n');

    return mailItem;
  }

  getSimulatedEmails() {
    return this.simulatedEmails;
  }

  clear() {
    this.simulatedEmails = [];
  }
}

const emailSimulator = new EmailSimulator();
module.exports = emailSimulator;
