import { Home, Users, Receipt, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/tenants", icon: Users, label: "Tenants" },
    { href: "/bills", icon: Receipt, label: "Bills" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="flex justify-around items-center h-16">
        {links.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <a
              className={cn(
                "flex flex-col items-center gap-1 text-xs",
                location === href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </a>
          </Link>
        ))}
        <button
          onClick={() => logoutMutation.mutate()}
          className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
