import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/SummaryCard";
import { mockCustomers, mockPayments } from "@/data/mockData";
import { formatCurrency } from "@/lib/format";
import { Users, Banknote, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  const [payments] = useState(mockPayments);
  const customers = mockCustomers;

  const totalOutstanding = payments.filter((p) => !p.paid).reduce((s, p) => s + p.amount, 0);
  const totalPaid = payments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0);
  const overdueCount = payments.filter((p) => !p.paid && new Date(p.dueDate) < new Date()).length;

  const getCustomerBalance = (id: string) =>
    payments.filter((p) => p.customerId === id && !p.paid).reduce((s, p) => s + p.amount, 0);

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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alle kunder</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {customers.map((c) => {
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
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
