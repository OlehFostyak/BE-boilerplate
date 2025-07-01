/**
 * SendGrid email service implementation
 */
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

/**
 * Interface for email data
 */
export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Interface for invite email data
 */
export interface InviteEmailData {
  email: string;
  inviteUrl: string;
}

/**
 * Send an email using SendGrid
 * @param emailData Email data to send
 * @returns Promise resolving to success status
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const msg = {
      to: emailData.to,
      from: 'o.fostyak@softonix.org',
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    };
    
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${emailData.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send an invite email to a new user
 * @param data Invite email data
 * @returns Promise resolving to success status
 */
export async function sendInviteEmail(data: InviteEmailData): Promise<boolean> {
  console.log('data.inviteUrl', data.inviteUrl);
  const subject = 'You have been invited to join our platform';
  
  const text = `
    Hello,

    You have been invited to join our platform. Please click the link below to complete your registration:
    ${data.inviteUrl}

    This invite link will expire in 24 hours.

    Best regards,
    The Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Our Platform</h2>
      <p>You have been invited to join our platform. Please click the button below to complete your registration:</p>
      <div style="margin: 30px 0;">
        <a href="${data.inviteUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Registration</a>
      </div>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;">${data.inviteUrl}</p>
      <p><strong>Note:</strong> This invite link will expire in 24 hours.</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `;
  
  return sendEmail({
    to: data.email,
    subject,
    text,
    html
  });
}
