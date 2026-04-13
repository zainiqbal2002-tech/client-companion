import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SummaryCard } from "@/components/SummaryCard";
import { AddCustomerDialog } from "@/components/AddCustomerDialog";
import { mockCustomers, mockPayments } from "@/data/mockData";
import { formatCurrency, formatDate } from "@/lib/format";
import { PaymentItem, Customer } from "@/types";
import { Users, Banknote, AlertTriangle, CheckCircle2, ChevronRight, Inbox, Check, X, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [payments, setPayments] = useState<PaymentItem[]>(mockPayments);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState("");

  const totalOutstanding = payments.filter((p) => !p.paid).reduce((s, p) => s + (p.amount - p.amountPaid), 0);
  const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0);
  const overdueCount = payments.filter((p) => !p.paid && new Date(p.dueDate) < new Date()).length;

  const pendingRequests = payments.filter((p) => p.paymentRequestStatus === "pending");

  const getCustomerBalance = (id: string) =>
    payments.filter((p) => p.customerId === id && !p.paid).reduce((s, p) => s + (p.amount - p.amountPaid), 0);

  const getCustomerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? "Ukjent";

  const approveRequest = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        const requestAmt = p.paymentRequestAmount ?? (p.amount - p.amountPaid);
        const newPaid = p.amountPaid + requestAmt;
        const fullyPaid = newPaid >= p.amount;
        return {
          ...p,
          amountPaid: Math.min(newPaid, p.amount),
          paid: fullyPaid,
          paidDate: fullyPaid ? new Date().toISOString().split("T")[0] : p.paidDate,
          paymentRequestStatus: "approved" as const,
          paymentRequestAmount: undefined,
        };
      })
    );
    toast({ title: "Godkjent", description: "Betalingen er registrert." });
  };

  const rejectRequest = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, paymentRequestStatus: "rejected" as const }
          : p
      )
    );
    toast({ title: "Avvist", description: "Forespørselen er avvist." });
  };

  const addCustomer = (customer: Customer) => {
    setCustomers((prev) => [...prev, customer]);
    toast({ title: "Kunde opprettet", description: customer.name });
  };

  const q = search.toLowerCase();
  const filteredCustomers = q
    ? customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    : customers;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">Kundeoversikt</h1>
            <p className="text-sm text-muted-foreground">Admin dashboard</p>
          </div>
          <Link to="/portal" className="text-sm text-primary hover:underline">
            Kundeportal →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard title="Kunder" value={String(customers.length)} icon={Users} />
          <SummaryCard title="Utestående" value={formatCurrency(totalOutstanding)} icon={Banknote} variant="warning" />
          <SummaryCard title="Forfalt" value={String(overdueCount)} icon={AlertTriangle} variant="overdue" />
          <SummaryCard title="Innbetalt" value={formatCurrency(totalPaid)} icon={CheckCircle2} variant="success" />
        </div>

        {pendingRequests.length > 0 && (
          <Card className="border-primary/30">
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
              <Inbox className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Betalingsforespørsler ({pendingRequests.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {pendingRequests.map((p) => {
                  const reqAmt = p.paymentRequestAmount ?? (p.amount - p.amountPaid);
                  const pct = Math.round((reqAmt / p.amount) * 100);
                  const isPartial = reqAmt < (p.amount - p.amountPaid);
                  return (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{p.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCustomerName(p.customerId)} · {formatDate(p.paymentRequestDate!)}
                          {isPartial && ` · Delvis betaling`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-sm font-semibold">{formatCurrency(reqAmt)}</span>
                          {isPartial && (
                            <p className="text-xs text-muted-foreground">{pct}% av {formatCurrency(p.amount)}</p>
                          )}
                        </div>
                        <Button size="sm" variant="default" onClick={() => approveRequest(p.id)} className="gap-1">
                          <Check className="h-3.5 w-3.5" />
                          Godkjenn
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => rejectRequest(p.id)} className="text-muted-foreground">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Alle kunder</CardTitle>
            <AddCustomerDialog onAdd={addCustomer} />
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Søk etter kunde..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="divide-y">
              {filteredCustomers.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">Ingen kunder funnet</p>
              ) : (
                filteredCustomers.map((c) => {
                  const balance = getCustomerBalance(c.id);
                  const paidCount = payments.filter((p) => p.customerId === c.id && p.paid).length;
                  const unpaidCount = payments.filter((p) => p.customerId === c.id && !p.paid).length;

                  return (
                    <Link
                      key={c.id}
                      to={`/admin/customer/${c.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{c.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(c.monthlyAmount)}/mnd · {paidCount} betalt · {unpaidCount} ubetalt
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {balance > 0 && (
                          <span className="text-sm font-semibold text-overdue">
                            {formatCurrency(balance)}
                          </span>
                        )}
                        {balance === 0 && (
                          <span className="text-sm font-medium text-success">À jour</span>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
