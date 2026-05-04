import Nav from "@/components/nav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-100">
      <Nav
        user={{
          email: session.user.email ?? "",
          name: session.user.name ?? "User",
        }}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
