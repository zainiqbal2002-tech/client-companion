import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/SummaryCard";
import { StatusBadge } from "@/components/StatusBadge";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { mockCustomers, mockPayments } from "@/data/mockData";
import { formatCurrency, formatDate } from "@/lib/format";
import { PaymentItem } from "@/types";
import { ArrowLeft, Banknote, CheckCircle2, AlertTriangle, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const customer = mockCustomers.find((c) => c.id === id);
  const [payments, setPayments] = useState<PaymentItem[]>(
    mockPayments.filter((p) => p.customerId === id)
  );

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Kunde ikke funnet</p>
      </div>
    );
  }

  const outstanding = payments.filter((p) => !p.paid).reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0);
  const overdueCount = payments.filter((p) => !p.paid && new Date(p.dueDate) < new Date()).length;

  const markAsPaid = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId ? { ...p, paid: true, paidDate: new Date().toISOString().split("T")[0] } : p
      )
    );
    toast({ title: "Markert som betalt", description: "Posten er oppdatert." });
  };

  const addPayment = (item: Omit<PaymentItem, "id">) => {
    const newItem: PaymentItem = { ...item, id: `p-${Date.now()}` };
    setPayments((prev) => [newItem, ...prev]);
    toast({ title: "Post lagt til", description: item.description });
  };

  const unpaid = payments.filter((p) => !p.paid);
  const paidItems = payments.filter((p) => p.paid);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{customer.name}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {customer.email && (
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{customer.email}</span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{customer.phone}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard title="Utestående" value={formatCurrency(outstanding)} icon={Banknote} variant="warning" />
          <SummaryCard title="Forfalt" value={String(overdueCount)} icon={AlertTriangle} variant="overdue" />
          <SummaryCard title="Innbetalt" value={formatCurrency(paid)} icon={CheckCircle2} variant="success" />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Abonnement: {formatCurrency(customer.monthlyAmount)}/mnd{customer.annualAmount ? ` + ${formatCurrency(customer.annualAmount)}/år` : ""}</span>
        </div>

        {/* Unpaid */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Ubetalte poster ({unpaid.length})</CardTitle>
            <AddPaymentDialog customerId={customer.id} onAdd={addPayment} />
          </CardHeader>
          <CardContent className="p-0">
            {unpaid.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Ingen ubetalte poster 🎉</p>
            ) : (
              <div className="divide-y">
                {unpaid.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p.description}</p>
                      <p className="text-xs text-muted-foreground">Forfall: {formatDate(p.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge paid={false} dueDate={p.dueDate} />
                      <span className="text-sm font-semibold w-24 text-right">{formatCurrency(p.amount)}</span>
                      <Button size="sm" variant="outline" onClick={() => markAsPaid(p.id)}>
                        Merk betalt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Betalte poster ({paidItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paidItems.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Ingen betalte poster ennå</p>
            ) : (
              <div className="divide-y">
                {paidItems.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 opacity-70">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p.description}</p>
                      <p className="text-xs text-muted-foreground">Betalt: {formatDate(p.paidDate!)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge paid={true} dueDate={p.dueDate} />
                      <span className="text-sm font-medium w-24 text-right">{formatCurrency(p.amount)}</span>
                      <Button size="sm" variant="ghost" onClick={() => markAsUnpaid(p.id)} className="text-muted-foreground">
                        Angre
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
