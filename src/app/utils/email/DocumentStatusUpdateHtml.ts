export const DocumentStatusUpdateHtml = (
  role: 'LAWYER' | 'FIRM',
  documentType: string,
  reason?: string,
) => `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document Rejected</title>
  </head>

  <body style="margin:0;padding:0;font-family:Arial,sans-serif;">
    <table
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
      width="100%"
      style="max-width:600px;margin:0 auto;background-color:#f8f9fc;padding:20px;"
    >
      <tr>
        <td style="padding:20px;text-align:center;">
          <h1 style="color:#dc2626;font-size:24px;margin-bottom:20px;">
            Document Rejected
          </h1>

          <p style="color:#1e293b;font-size:16px;line-height:1.6;">
            Dear ${role === 'LAWYER' ? 'Lawyer' : 'Firm'},
          </p>

          <p style="color:#1e293b;font-size:15px;line-height:1.6;margin-top:10px;">
            We regret to inform you that the following document submitted for
            verification has been <strong style="color:#dc2626;">rejected</strong>.
          </p>

          <div
            style="
              margin:30px 0;
              padding:20px;
              background-color:#fff;
              border-radius:8px;
              border:1px solid #e5e7eb;
            "
          >
            <p style="font-size:14px;color:#475569;margin:0;">
              <strong>Role:</strong> ${role}
            </p>
            <p style="font-size:14px;color:#475569;margin:8px 0 0;">
              <strong>Document Type:</strong> ${documentType}
            </p>
            ${
              reason
                ? `<p style="font-size:14px;color:#475569;margin:8px 0 0;">
                     <strong>Rejection Reason:</strong> ${reason}
                   </p>`
                : ''
            }
          </div>

          <p style="color:#1e293b;font-size:14px;line-height:1.6;">
            Please review the reason carefully and re-upload the correct document
            for verification.
          </p>

          <p style="color:#64748b;font-size:13px;margin-top:30px;">
            If you believe this was a mistake, feel free to contact our support team.
          </p>

          <p style="color:#1e293b;font-size:14px;margin-top:20px;">
            Thank you,<br />
            <strong>Your Verification Team</strong>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
