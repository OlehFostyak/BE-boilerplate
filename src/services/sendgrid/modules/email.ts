import sgMail, { MailDataRequired } from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function sendInviteEmail(email: string, inviteUrl: string): Promise<boolean> {
  console.log('Invite URL:', inviteUrl);

  const expireHours = 24;

  // Base text for cases when HTML is not supported
  const text = `
    Hello,

    You have been invited to join our platform. Please click the link below to complete your registration:
    ${inviteUrl}

    This invite link will expire in ${expireHours} hours.

    Best regards,
    The Team
  `;

  const msg: MailDataRequired = {
    to: email,
    from: 'o.fostyak@softonix.org',
    subject: 'You have been invited to join our platform',
    templateId: process.env.SENDGRID_INVITE_TEMPLATE_ID,
    dynamicTemplateData: {
      inviteUrl,
      expireHours
    },
    text
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
