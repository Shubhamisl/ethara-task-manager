import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: { name: "Demo Admin", passwordHash },
    create: { email: "admin@demo.com", name: "Demo Admin", passwordHash },
  });
  const alice = await prisma.user.upsert({
    where: { email: "alice@demo.com" },
    update: { name: "Alice", passwordHash },
    create: { email: "alice@demo.com", name: "Alice", passwordHash },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@demo.com" },
    update: { name: "Bob", passwordHash },
    create: { email: "bob@demo.com", name: "Bob", passwordHash },
  });

  await prisma.project.deleteMany({
    where: { name: "Launch website", ownerId: admin.id },
  });

  const project = await prisma.project.create({
    data: {
      name: "Launch website",
      description: "Marketing site rewrite",
      ownerId: admin.id,
      memberships: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: alice.id, role: "MEMBER" },
          { userId: bob.id, role: "MEMBER" },
        ],
      },
      tasks: {
        create: [
          {
            title: "Hero copy",
            status: "IN_PROGRESS",
            priority: "HIGH",
            assigneeId: alice.id,
            createdById: admin.id,
            dueDate: new Date(Date.now() + 86400000 * 2),
          },
          {
            title: "Footer redesign",
            status: "TODO",
            priority: "MEDIUM",
            assigneeId: bob.id,
            createdById: admin.id,
          },
          {
            title: "Set up analytics",
            status: "TODO",
            priority: "LOW",
            createdById: admin.id,
            dueDate: new Date(Date.now() - 86400000),
          },
          {
            title: "Domain DNS",
            status: "DONE",
            priority: "MEDIUM",
            assigneeId: admin.id,
            createdById: admin.id,
          },
        ],
      },
    },
  });

  console.log("Seeded project:", project.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
