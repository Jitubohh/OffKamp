import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/nav/site-header";
import { BottomTabs } from "@/components/nav/bottom-tabs";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const role = profile?.role ?? null;

  return (
    <div className="min-h-dvh bg-white pb-20 sm:pb-0">
      <SiteHeader role={role} signedIn={!!user} />
      {children}
      <BottomTabs role={role} signedIn={!!user} />
    </div>
  );
}