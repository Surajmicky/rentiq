import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, MessageCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function BillList({ tenant }) {
  const { toast } = useToast();
  const { data: bills = [] } = useQuery({
    queryKey: [`/api/tenants/${tenant.id}/bills`],
  });

  async function markAsPaid(billId, type) {
    try {
      await apiRequest("PATCH", `/api/bills/${billId}`, {
        [type === "rent" ? "rentPaid" : "electricityPaid"]: true,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenant.id}/bills`] });
      toast({ title: "Success", description: "Payment marked as received" });
      sendPaymentConfirmation(bills.find(b => b.id === billId), type);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function deleteBill(billId) {
    try {
      await apiRequest("DELETE", `/api/bills/${billId}`);
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenant.id}/bills`] });
      toast({ title: "Success", description: "Bill deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  function sendWhatsAppMessage(bill) {
    const message = `Bill details for ${format(new Date(bill.month), "MMM yyyy")}:\n` +
      `Rent: ₹${tenant.rentAmount} - ${bill.rentPaid ? "Paid" : "Pending"}\n` +
      `Electricity: ${bill.electricityReading ? `₹${bill.electricityAmount} - ${bill.electricityPaid ? "Paid" : "Pending"}` : "No reading"}`;
    const whatsappUrl = `https://wa.me/${tenant.mobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  function sendPaymentConfirmation(bill, type) {
    const message = `Thank you for paying your ${type} bill for ${format(new Date(bill.month), "MMM yyyy")}. Payment received successfully.`;
    const whatsappUrl = `https://wa.me/${tenant.mobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead>Rent (₹{tenant.rentAmount})</TableHead>
            <TableHead>Electricity</TableHead>
            <TableHead className="w-40">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>{format(new Date(bill.month), "MMM yyyy")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {bill.rentPaid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {!bill.rentPaid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsPaid(bill.id, "rent")}
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {bill.electricityReading ? (
                    <>
                      ₹{bill.electricityAmount}
                      {bill.electricityPaid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {!bill.electricityPaid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsPaid(bill.id, "electricity")}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </>
                  ) : (
                    "No reading"
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendWhatsAppMessage(bill)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Bill
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteBill(bill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
