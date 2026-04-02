export const contactSendMailHTML = (
  name: string,
  email: string,
  subject: string,
  message: string,
) => `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact Message</title>
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
      <!-- Header -->
      <tr>
        <td style="padding: 20px 20px 10px">
          <h1
            style="
              color: #0f172a;
              font-size: 24px;
              text-align: center;
              margin-bottom: 10px;
            "
          >
            New Contact Message
          </h1>
        </td>
      </tr>

      <!-- Main Content -->
      <tr>
        <td style="padding: 20px 20px 40px">
          <p
            style="
              color: #1e293b;
              font-size: 16px;
              line-height: 1.6;
              text-align: center;
              margin-bottom: 30px;
            "
          >
            You have received a new message from the contact form.
          </p>

          <table
            width="100%"
            cellpadding="10"
            cellspacing="0"
            border="0"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            "
          >
            <tr>
              <td style="color: #0f172a; font-size: 14px">
                <strong>Name:</strong> ${name}
              </td>
            </tr>
            <tr>
              <td style="color: #0f172a; font-size: 14px">
                <strong>Email:</strong> ${email}
              </td>
            </tr>
            <tr>
              <td style="color: #0f172a; font-size: 14px">
                <strong>Subject:</strong> ${subject}
              </td>
            </tr>
            <tr>
              <td
                style="
                  color: #1e293b;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                <strong>Message:</strong>
                <p style="margin: 10px 0 0 0">${message}</p>
              </td>
            </tr>
          </table>

          <p
            style="
              color: #64748b;
              font-size: 13px;
              text-align: center;
              margin-top: 30px;
            "
          >
            This email was generated automatically from your website contact
            form.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
