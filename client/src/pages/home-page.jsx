import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/nav/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();
  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/tenants"],
  });

  return (
    <div className="pb-20">
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.username}!</h1>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Total Tenants: {tenants.length}</p>
              <p>
                Total Rent Collection: ₹
                {tenants.reduce((sum, tenant) => sum + tenant.rentAmount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/tenants">
              <a className="block">
                <Card className="hover:bg-accent cursor-pointer transition-colors">
                  <CardContent className="pt-6">
                    <p className="text-xl font-semibold">Add Tenant</p>
                  </CardContent>
                </Card>
              </a>
            </Link>
            <Link href="/bills">
              <a className="block">
                <Card className="hover:bg-accent cursor-pointer transition-colors">
                  <CardContent className="pt-6">
                    <p className="text-xl font-semibold">Record Bill</p>
                  </CardContent>
                </Card>
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
