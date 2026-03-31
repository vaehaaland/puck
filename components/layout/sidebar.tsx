"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  PlayCircle,
  TrendingUp,
  Route,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types/database";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/programs", label: "Programs", icon: Dumbbell },
  { href: "/workout", label: "Workout", icon: PlayCircle },
  { href: "/runs", label: "Runs", icon: Route },
  { href: "/progress", label: "Progress", icon: TrendingUp },
];

const coachNavItems = [
  { href: "/athletes", label: "Athletes", icon: Users },
];

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const allNavItems = [
    ...navItems,
    ...(profile?.role === "coach" ? coachNavItems : []),
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r bg-card h-screen sticky top-0">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Puck</h1>
        {profile && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {profile.full_name}
          </p>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {allNavItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
