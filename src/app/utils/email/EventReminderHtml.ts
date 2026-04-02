export const EventReminderHtml = (
  title: string,
  startTime: Date,
  link: string,
  minutesLeft: number,
) => `
<html>
  <body style="font-family:Arial; background:#f8f9fc; padding:20px;">
    <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;">
      <h2 style="color:#0f172a;">⏰ Event Reminder</h2>
      <p>Your event <strong>${title}</strong> will start in <strong>${minutesLeft} minutes</strong>.</p>

      <p><strong>Start Time:</strong> ${startTime.toUTCString()}</p>

      <a href="${link}" style="
        display:inline-block;
        margin-top:20px;
        padding:10px 20px;
        background:#2563eb;
        color:#fff;
        text-decoration:none;
        border-radius:5px;
      ">
        Join Event
      </a>

      <p style="margin-top:30px;color:#64748b;font-size:12px;">
        Please be ready on time.
      </p>
    </div>
  </body>
</html>
`;
