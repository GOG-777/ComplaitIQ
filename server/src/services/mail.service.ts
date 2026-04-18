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

export const sendConfirmationEmail = async (
    toEmail: string,
    toName: string,
    ticketId: string,
    subject: string,
    autoResponse: string
): Promise<void> => {
    const firstName = toName.split(' ')[0]

    await transporter.sendMail({
        from: `"ComplaitIQ Support" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: `Complaint Received [${ticketId}]`,
        html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1A1714;">
        <div style="background: #1A1714; padding: 24px 32px;">
          <span style="font-family: Georgia, serif; font-size: 22px; color: #fff; letter-spacing: -0.5px;">
            Compli<span style="color: #C84B2F;">IQ</span>
          </span>
        </div>

        <div style="padding: 36px 32px; background: #FDFCFA; border: 1px solid #E2DDD6; border-top: none;">
          <p style="font-size: 15px; margin-bottom: 8px;">Hi ${firstName},</p>
          <p style="font-size: 14px; color: #6B6560; margin-bottom: 24px; line-height: 1.6;">
            We have received your complaint and it has been logged in our system.
            Your ticket ID is below. Keep it safe as you will need it to track your complaint.
          </p>

          <div style="text-align: center; margin-bottom: 28px;">
            <div style="display: inline-block; background: #F5F2ED; border: 2px dashed #E2DDD6; border-radius: 8px; padding: 12px 32px;">
              <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6B6560; margin: 0 0 4px;">Your Ticket ID</p>
              <p style="font-size: 22px; font-weight: 700; color: #C84B2F; letter-spacing: 0.1em; margin: 0;">${ticketId}</p>
            </div>
          </div>

          <div style="background: #F5F2ED; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
            <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #6B6560; margin: 0 0 6px;">Subject</p>
            <p style="font-size: 14px; color: #1A1714; margin: 0;">${subject}</p>
          </div>

          <div style="background: #E9EFF9; border-left: 3px solid #2F6BC8; border-radius: 4px; padding: 16px 20px; margin-bottom: 28px;">
            <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #2F6BC8; margin: 0 0 8px;">
              Initial Response
            </p>
            <p style="font-size: 14px; line-height: 1.7; color: #1A1714; margin: 0;">
              ${autoResponse}
            </p>
          </div>

          <p style="font-size: 13px; color: #6B6560; line-height: 1.6;">
            You can track the progress of your complaint at any time by visiting our
            <a href="${process.env.CLIENT_URL}/track" style="color: #2F6BC8; text-decoration: none; font-weight: 600;">
              ticket tracker
            </a>
            and entering your ticket ID.
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