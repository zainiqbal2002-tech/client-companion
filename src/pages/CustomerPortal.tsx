import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/SummaryCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PartialPaymentDialog } from "@/components/PartialPaymentDialog";
import { PaymentProgress } from "@/components/PaymentProgress";
import { mockCustomers, mockPayments } from "@/data/mockData";
import { formatCurrency, formatDate } from "@/lib/format";
import { Banknote, AlertTriangle, ArrowLeft, Send, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { PaymentItem } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function CustomerPortal() {
  const customer = mockCustomers[0];
  const [payments, setPayments] = useState<PaymentItem[]>(
    mockPayments.filter((p) => p.customerId === customer.id)
  );

  const outstanding = payments.filter((p) => !p.paid).reduce((s, p) => s + (p.amount - p.amountPaid), 0);
  const overdueCount = payments.filter((p) => !p.paid && new Date(p.dueDate) < new Date()).length;

  const unpaid = payments.filter((p) => !p.paid);
  const paidItems = payments.filter((p) => p.paid);

  const sendPaymentRequest = (paymentId: string, requestAmount: number) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, paymentRequestStatus: "pending" as const, paymentRequestDate: new Date().toISOString().split("T")[0], paymentRequestAmount: requestAmount }
          : p
      )
    );
    toast({ title: "Forespørsel sendt", description: `Meldt inn ${formatCurrency(requestAmount)} – venter på godkjenning.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-3 sm:px-4 py-3 sm:py-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Min oversikt</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{customer.name}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <SummaryCard title="Skyldig" value={formatCurrency(outstanding)} icon={Banknote} variant={outstanding > 0 ? "warning" : "default"} />
          <SummaryCard title="Forfalt" value={String(overdueCount)} icon={AlertTriangle} variant={overdueCount > 0 ? "overdue" : "default"} />
        </div>

        {outstanding > 0 && (
          <div className="rounded-lg border border-overdue/30 bg-overdue/5 p-3 sm:p-4 text-center">
            <p className="text-base sm:text-lg font-bold text-overdue">{formatCurrency(outstanding)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Totalt utestående</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ubetalte poster ({unpaid.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {unpaid.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Alt er betalt! 🎉</p>
            ) : (
              <div className="divide-y">
                {unpaid.map((p) => (
                  <div key={p.id} className="px-3 sm:px-5 py-3 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{p.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Forfall: {formatDate(p.dueDate)}
                          {p.amountPaid > 0 && ` · Betalt ${formatCurrency(p.amountPaid)} av ${formatCurrency(p.amount)}`}
                        </p>
                        {p.notes && <p className="text-xs text-muted-foreground mt-1 italic">{p.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <StatusBadge paid={false} dueDate={p.dueDate} />
                        <span className="text-sm font-semibold">{formatCurrency(p.amount - p.amountPaid)}</span>
                        {p.paymentRequestStatus === "pending" ? (
                          <Badge variant="outline" className="gap-1 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3" />
                            Venter ({formatCurrency(p.paymentRequestAmount ?? 0)})
                          </Badge>
                        ) : (
                          <PartialPaymentDialog
                            amount={p.amount}
                            amountPaid={p.amountPaid}
                            onConfirm={(amt) => sendPaymentRequest(p.id, amt)}
                            trigger={
                              <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                                <Send className="mr-1 h-3.5 w-3.5" />
                                Meld betalt
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </div>
                    <PaymentProgress amount={p.amount} amountPaid={p.amountPaid} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Betalingshistorikk ({paidItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paidItems.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Ingen betalinger ennå</p>
            ) : (
              <div className="divide-y">
                {paidItems.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-5 py-3 opacity-70 gap-1">
                    <div>
                      <p className="text-sm font-medium">{p.description}</p>
                      <p className="text-xs text-muted-foreground">Betalt: {p.paidDate ? formatDate(p.paidDate) : "–"}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <StatusBadge paid={true} dueDate={p.dueDate} />
                      <span className="text-sm font-medium">{formatCurrency(p.amount)}</span>
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
