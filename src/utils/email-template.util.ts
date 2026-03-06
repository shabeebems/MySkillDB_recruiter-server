export interface PasswordResetEmailParams {
  resetUrl: string;
  userName?: string;
}

export const getPasswordResetEmailTemplate = (params: PasswordResetEmailParams): string => {
  const { resetUrl, userName } = params;
  const greeting = userName ? `Hello ${userName},` : 'Hello,';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px 12px 0 0;">
                  <div style="display: flex; width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; align-items: center; justify-content: center; margin: 0 auto 16px;">
                    <span style="font-size: 32px; color: #ffffff;">🔒</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Password Reset Request</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                    ${greeting}
                  </p>
                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    You have requested a password reset for your MySkillDB account. Please click the button below to reset your password:
                  </p>
                  
                  <!-- Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                    <tr>
                      <td align="center" style="padding: 0;">
                        <a href="${resetUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3); transition: all 0.3s ease;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Alternative Link -->
                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 8px 0 0; color: #4f46e5; font-size: 14px; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #4f46e5; text-decoration: underline;">${resetUrl}</a>
                  </p>
                  
                  <!-- Warning -->
                  <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                      <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
                    </p>
                  </div>
                  
                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you did not request this password reset, please ignore this email. Your account remains secure.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-align: center;">
                    This is an automated email from MySkillDB. Please do not reply to this email.
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} MySkillDB. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

