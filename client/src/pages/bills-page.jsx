import { BottomNav } from "@/components/nav/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BillForm } from "@/components/bills/bill-form";
import { BillList } from "@/components/bills/bill-list";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export default function BillsPage() {
  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/tenants"],
  });
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="pb-20">
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Bills & Payments</h1>

        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <CardTitle>{tenant.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <BillList tenant={tenant} />

                <Dialog open={dialogOpen && selectedTenant?.id === tenant.id} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) setSelectedTenant(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      Add Reading
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Bill for {tenant.name}</DialogTitle>
                    </DialogHeader>
                    <BillForm 
                      tenantId={tenant.id} 
                      onSuccess={() => {
                        setDialogOpen(false);
                        setSelectedTenant(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
