import nodemailer from 'nodemailer';
import config from '../../../configs';

export const sentEmailUtility = async (
  emailTo: string,
  EmailSubject: string,
  EmailHTML?: string,
) => {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: Number(config.smtp.port),
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  await transporter.verify(); // 🔍 debug helper

  const mailOptions = {
    from: config.smtp.from,
    to: emailTo,
    subject: EmailSubject,
    html: EmailHTML,
  };

  return await transporter.sendMail(mailOptions);
};
