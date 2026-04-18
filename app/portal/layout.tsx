import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PortalChrome from "@/app/portal/PortalChrome";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/portal");
  }
  return <PortalChrome email={session.user.email}>{children}</PortalChrome>;
}
