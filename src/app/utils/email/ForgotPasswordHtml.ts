export const ForgotPasswordHtml = (h1: string, resetCode: string) => `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>

  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif">
    <table
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
      width="100%"
      style="
        max-width: 600px;
        margin: 0 auto;
        background-color: #f8f9fc;
        padding: 20px;
      "
    >
      <!-- Header with Logo -->
      <tr>
        <td style="padding: 20px 20px 10px">
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td
                style="width: 50%; text-align: center; vertical-align: middle"
              >
                <table cellspacing="0" cellpadding="0" border="0">
                  <tr></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Content -->
      <tr>
        <td style="padding: 20px 20px 40px">
          <h1
            style="
              color: #0f172a;
              font-size: 24px;
              text-align: center;
              margin-bottom: 30px;
            "
          >
            ${h1}
          </h1>

          <p style="
            color: #1e293b;
            font-size: 16px;
            line-height: 1.6;
            text-align: center;
            margin: 20px 0 40px 0;
          ">
            We received a request to reset your password. Use the code below to set a new password for your account:
          </p>

          <div style="text-align: center; margin: 30px 0">
            <div
              style="
                font-size: 36px;
                font-weight: bold;
                color: #0f172a;
                letter-spacing: 5px;
              "
            >
              ${resetCode}
            </div>
          </div>

          <p
            style="
              color: #6b21a8;
              font-size: 14px;
              text-align: center;
              margin-bottom: 30px;
            "
          >
            <strong>Note:</strong> This password reset code is valid for 10 minutes.
          </p>

          <p
            style="
              color: #1e293b;
              font-size: 14px;
              margin-bottom: 0px;
              text-align: center;
            "
          >
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
