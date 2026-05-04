import Sidebar from "@/components/sidebar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id!;

  const projects = await prisma.project.findMany({
    where: { memberships: { some: { userId } } },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "248px 1fr",
        height: "100vh",
        overflow: "hidden",
        background: "var(--ink-0)",
      }}
    >
      <Sidebar
        user={{
          name: session.user.name ?? "User",
          email: session.user.email ?? "",
        }}
        projects={projects}
      />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}
