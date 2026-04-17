import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export const sendResponseEmail = async (
  toEmail: string,
  toName: string,
  ticketId: string,
  subject: string,
  responseContent: string
): Promise<void> => {
  const firstName = toName.split(' ')[0]

  await transporter.sendMail({
    from: `"ComplaitIQ Support" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Re: [${ticketId}] ${subject}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1A1714;">
        <div style="background: #1A1714; padding: 24px 32px;">
          <span style="font-family: Georgia, serif; font-size: 22px; color: #fff; letter-spacing: -0.5px;">
            Compli<span style="color: #C84B2F;">IQ</span>
          </span>
        </div>

        <div style="padding: 36px 32px; background: #FDFCFA; border: 1px solid #E2DDD6; border-top: none;">
          <p style="font-size: 15px; margin-bottom: 8px;">Hi ${firstName},</p>
          <p style="font-size: 14px; color: #6B6560; margin-bottom: 24px;">
            We have an update regarding your complaint <strong style="color: #C84B2F;">${ticketId}</strong>.
          </p>

          <div style="background: #F5F2ED; border-left: 3px solid #C84B2F; border-radius: 4px; padding: 16px 20px; margin-bottom: 28px;">
            <p style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #6B6560; margin-bottom: 8px;">
              Our Response
            </p>
            <p style="font-size: 14px; line-height: 1.7; color: #1A1714; margin: 0;">
              ${responseContent}
            </p>
          </div>

          <p style="font-size: 13px; color: #6B6560; line-height: 1.6;">
            If you have further questions or concerns, please do not hesitate to reach back out.
            Keep your ticket ID <strong>${ticketId}</strong> for reference.
          </p>
        </div>

        <div style="padding: 20px 32px; background: #F5F2ED; border: 1px solid #E2DDD6; border-top: none; text-align: center;">
          <p style="font-size: 12px; color: #6B6560; margin: 0;">
            This is an automated message from ComplaitIQ. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    `,
  })
}