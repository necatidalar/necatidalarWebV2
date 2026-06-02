import nodemailer from "nodemailer";
import { db, smtpSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function getSmtpSettings() {
  const rows = await db.select().from(smtpSettingsTable).limit(1);
  return rows[0] ?? null;
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const settings = await getSmtpSettings();
  if (!settings || !settings.user || !settings.password || !settings.toEmail) {
    return { ok: false, reason: "SMTP ayarları eksik." };
  }

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.user,
      pass: settings.password,
    },
  });

  try {
    await transporter.sendMail({
      from: settings.fromEmail || settings.user,
      to: settings.toEmail,
      subject: `[Portfolio İletişim] ${data.subject}`,
      html: `
        <h2>Yeni İletişim Formu Mesajı</h2>
        <p><strong>Ad Soyad:</strong> ${data.name}</p>
        <p><strong>E-posta:</strong> ${data.email}</p>
        <p><strong>Konu:</strong> ${data.subject}</p>
        <hr/>
        <p><strong>Mesaj:</strong></p>
        <p>${data.message.replace(/\n/g, "<br/>")}</p>
      `,
      replyTo: data.email,
    });
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: message };
  }
}
