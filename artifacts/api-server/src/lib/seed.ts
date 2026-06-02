import bcrypt from "bcryptjs";
import { db, adminCredentialsTable, technologiesTable, smtpSettingsTable, quotesTable } from "@workspace/db";

const defaultTechnologies = [
  { name: "HTML5", iconKey: "SiHtml5", displayOrder: 1 },
  { name: "CSS3", iconKey: "SiCss3", displayOrder: 2 },
  { name: "JavaScript", iconKey: "SiJavascript", displayOrder: 3 },
  { name: "TypeScript", iconKey: "SiTypescript", displayOrder: 4 },
  { name: "React", iconKey: "SiReact", displayOrder: 5 },
  { name: "Next.js", iconKey: "SiNextdotjs", displayOrder: 6 },
  { name: "Node.js", iconKey: "SiNodedotjs", displayOrder: 7 },
  { name: "Python", iconKey: "SiPython", displayOrder: 8 },
  { name: "PHP", iconKey: "SiPhp", displayOrder: 9 },
  { name: "Laravel", iconKey: "SiLaravel", displayOrder: 10 },
  { name: "PostgreSQL", iconKey: "SiPostgresql", displayOrder: 11 },
  { name: "MySQL", iconKey: "SiMysql", displayOrder: 12 },
  { name: "MongoDB", iconKey: "SiMongodb", displayOrder: 13 },
  { name: "Tailwind CSS", iconKey: "SiTailwindcss", displayOrder: 14 },
  { name: "Docker", iconKey: "SiDocker", displayOrder: 15 },
  { name: "Git", iconKey: "SiGit", displayOrder: 16 },
];

export async function seedDatabase() {
  const [existingAdmin] = await db.select().from(adminCredentialsTable).limit(1);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await db.insert(adminCredentialsTable).values({ username: "admin", passwordHash });
    console.log("Admin credentials seeded. Username: admin, Password: admin123");
  }

  const existingTechs = await db.select().from(technologiesTable).limit(1);
  if (existingTechs.length === 0) {
    await db.insert(technologiesTable).values(defaultTechnologies);
    console.log("Default technologies seeded.");
  }

  const existingSmtp = await db.select().from(smtpSettingsTable).limit(1);
  if (existingSmtp.length === 0) {
    await db.insert(smtpSettingsTable).values({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      user: "",
      password: "",
      fromEmail: "",
      toEmail: "",
    });
    console.log("SMTP settings row created.");
  }

  const existingQuotes = await db.select().from(quotesTable).limit(1);
  if (existingQuotes.length === 0) {
    await db.insert(quotesTable).values([
      {
        text: "Herhangi bir aptal kod yazabilir; bunu bir insan anlayabilecek şekilde yazmak ise yetenek gerektirir.",
        author: "Martin Fowler",
        title: "Yazılım Mühendisi & Yazar",
        displayOrder: 1,
        isActive: true,
      },
      {
        text: "Basitlik, güvenilirliğin ön koşuludur.",
        author: "Edsger W. Dijkstra",
        title: "Bilgisayar Bilimcisi",
        displayOrder: 2,
        isActive: true,
      },
      {
        text: "Önce çalışmasını sağla, ardından doğru yap, sonra hızlı yap.",
        author: "Kent Beck",
        title: "Yazılım Mühendisi",
        displayOrder: 3,
        isActive: true,
      },
    ]);
    console.log("Default quotes seeded.");
  }
}
