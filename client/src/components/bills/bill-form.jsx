import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertBillSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

export function BillForm({ tenantId, onSuccess }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tenant } = useQuery({
    queryKey: [`/api/tenants/${tenantId}`],
  });

  const currentMonth = format(new Date(), "yyyy-MM");

  const form = useForm({
    resolver: zodResolver(insertBillSchema),
    defaultValues: {
      tenantId,
      month: currentMonth,
      electricityReading: undefined,
    },
  });

  async function onSubmit(data) {
    try {
      setIsSubmitting(true);
      await apiRequest("POST", `/api/tenants/${tenantId}/bills`, data);
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/bills`] });
      toast({ title: "Success", description: "Bill added successfully" });
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function sendToWhatsapp(data) {
    if (!tenant) return;
    try {
      const message = `Dear tenant, your electricity reading for ${data.month} is ${data.electricityReading} units. Please clear your pending bills. Thank you.`;
      const whatsappUrl = `https://wa.me/${tenant.mobile}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      toast({ title: "Success", description: "Message sent to WhatsApp successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month</FormLabel>
              <FormControl>
                <Input type="month" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="electricityReading"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Electricity Reading</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : parseInt(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Add Bill
        </Button>
        {tenant && <Button onClick={() => sendToWhatsapp(form.getValues())} className="w-full mt-2">Send to WhatsApp</Button>}
      </form>
    </Form>
  );
}
