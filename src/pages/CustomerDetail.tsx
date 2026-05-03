import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/SummaryCard";
import { StatusBadge } from "@/components/StatusBadge";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { PartialPaymentDialog } from "@/components/PartialPaymentDialog";
import { PaymentProgress } from "@/components/PaymentProgress";
import { EditPaymentDialog } from "@/components/EditPaymentDialog";
import { EditCustomerDialog } from "@/components/EditCustomerDialog";
import { mockCustomers, mockPayments } from "@/data/mockData";
import { formatCurrency, formatDate } from "@/lib/format";
import { PaymentItem, Customer } from "@/types";
import { ArrowLeft, Banknote, CheckCircle2, AlertTriangle, Mail, Phone, MoreVertical, Pencil, Trash2, MessageSquare, Undo2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CustomerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const initialCustomer = mockCustomers.find((c) => c.id === id);
  const [customer, setCustomer] = useState<Customer | undefined>(initialCustomer);
  const [payments, setPayments] = useState<PaymentItem[]>(
    mockPayments.filter((p) => p.customerId === id)
  );
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [deleteCustomerOpen, setDeleteCustomerOpen] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Kunde ikke funnet</p>
      </div>
    );
  }

  const outstanding = payments.filter((p) => !p.paid).reduce((s, p) => s + (p.amount - p.amountPaid), 0);
  const paid = payments.reduce((s, p) => s + p.amountPaid, 0);
  const overdueCount = payments.filter((p) => !p.paid && new Date(p.dueDate) < new Date()).length;

  const handlePartialPayment = (paymentId: string, partialAmount: number) => {
    const target = payments.find((p) => p.id === paymentId);
    if (!target) return;
    const remaining = target.amount - target.amountPaid;
    if (!Number.isFinite(partialAmount) || partialAmount <= 0) {
      toast({
        title: "Ugyldig beløp",
        description: "Beløpet må være større enn 0.",
        variant: "destructive",
      });
      return;
    }
    if (remaining <= 0) {
      toast({
        title: "Allerede betalt",
        description: "Denne posten er allerede fullt betalt.",
        variant: "destructive",
      });
      return;
    }
    if (partialAmount > remaining) {
      toast({
        title: "Beløpet overstiger gjenstående",
        description: `Maks ${formatCurrency(remaining)} kan registreres på denne posten.`,
        variant: "destructive",
      });
      return;
    }
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        const newPaid = p.amountPaid + partialAmount;
        const fullyPaid = newPaid >= p.amount;
        const today = new Date().toISOString().split("T")[0];
        const newPart = {
          id: `pp-${Date.now()}`,
          amount: Math.min(partialAmount, p.amount - p.amountPaid),
          date: today,
        };
        return {
          ...p,
          amountPaid: Math.min(newPaid, p.amount),
          paid: fullyPaid,
          paidDate: fullyPaid ? today : p.paidDate,
          partialPayments: [...(p.partialPayments ?? []), newPart],
        };
      })
    );
    toast({ title: "Betaling registrert", description: `${formatCurrency(partialAmount)} registrert.` });
  };

  const markAsUnpaid = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId ? { ...p, paid: false, paidDate: undefined, amountPaid: 0, partialPayments: [] } : p
      )
    );
    toast({ title: "Markert som ubetalt", description: "Posten er tilbakestilt." });
  };

  const addPayment = (item: Omit<PaymentItem, "id">) => {
    const newItem: PaymentItem = { ...item, id: `p-${Date.now()}` };
    setPayments((prev) => [newItem, ...prev]);
    toast({ title: "Post lagt til", description: item.description });
  };

  const updatePayment = (updated: PaymentItem) => {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    toast({ title: "Post oppdatert", description: updated.description });
  };

  const deletePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    toast({ title: "Post slettet", description: "Betalingsposten er fjernet." });
  };

  const deleteCustomer = () => {
    toast({ title: "Kunde slettet", description: customer.name });
    navigate("/");
  };

  const getSmsLink = (payment: PaymentItem) => {
    if (!customer.phone) return null;
    const remaining = formatCurrency(payment.amount - payment.amountPaid);
    const due = formatDate(payment.dueDate);
    const text = `Hei! Dette er en påminnelse om ubetalt faktura: "${payment.description}" på ${remaining} med forfall ${due}. Vennligst betal så snart som mulig. Mvh ${customer.name ? "din leverandør" : ""}`;
    const phone = customer.phone.replace(/\s/g, "");
    return `sms:${phone}?body=${encodeURIComponent(text)}`;
  };

  const unpaid = payments.filter((p) => !p.paid);
  const paidItems = payments.filter((p) => p.paid);
  const paymentToDelete = payments.find((p) => p.id === deletePaymentId);
  const paymentToEdit = payments.find((p) => p.id === editPaymentId);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-3 sm:px-4 py-3 sm:py-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">{customer.name}</h1>
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              {customer.email && (
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{customer.email}</span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{customer.phone}</span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditCustomerOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Rediger kunde
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeleteCustomerOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Slett kunde
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        customer={customer}
        open={editCustomerOpen}
        onOpenChange={setEditCustomerOpen}
        onSave={(updated) => {
          setCustomer(updated);
          toast({ title: "Kunde oppdatert", description: updated.name });
        }}
      />

      {/* Delete Customer Dialog */}
      <AlertDialog open={deleteCustomerOpen} onOpenChange={setDeleteCustomerOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett kunde</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette {customer.name}? Dette kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCustomer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Slett</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Payment Dialog */}
      {paymentToEdit && (
        <EditPaymentDialog
          payment={paymentToEdit}
          open={!!editPaymentId}
          onOpenChange={(o) => { if (!o) setEditPaymentId(null); }}
          onSave={(updated) => {
            updatePayment(updated);
            setEditPaymentId(null);
          }}
        />
      )}

      {/* Delete Payment Dialog */}
      <AlertDialog open={!!deletePaymentId} onOpenChange={(o) => { if (!o) setDeletePaymentId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett post</AlertDialogTitle>
            <AlertDialogDescription>Er du sikker på at du vil slette «{paymentToDelete?.description}»?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletePaymentId) deletePayment(deletePaymentId);
                setDeletePaymentId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <SummaryCard title="Utestående" value={formatCurrency(outstanding)} icon={Banknote} variant="warning" />
          <SummaryCard title="Forfalt" value={String(overdueCount)} icon={AlertTriangle} variant="overdue" />
          <SummaryCard title="Innbetalt" value={formatCurrency(paid)} icon={CheckCircle2} variant="success" />
        </div>

        {(customer.monthlyAmount > 0 || customer.annualAmount) && (
          <div className="text-xs sm:text-sm text-muted-foreground">
            Abonnement: {customer.monthlyAmount > 0 ? `${formatCurrency(customer.monthlyAmount)}/mnd` : ""}
            {customer.monthlyAmount > 0 && customer.annualAmount ? " + " : ""}
            {customer.annualAmount ? `${formatCurrency(customer.annualAmount)}/år` : ""}
          </div>
        )}

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
                  <div key={p.id} className="px-3 sm:px-5 py-3 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{p.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Forfall: {formatDate(p.dueDate)}
                          {p.amountPaid > 0 && ` · Betalt ${formatCurrency(p.amountPaid)} av ${formatCurrency(p.amount)}`}
                        </p>
                        {p.notes && <p className="text-xs text-muted-foreground mt-1 italic">{p.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <StatusBadge paid={false} dueDate={p.dueDate} />
                        <span className="text-sm font-semibold">{formatCurrency(p.amount - p.amountPaid)}</span>
                        <PartialPaymentDialog
                          amount={p.amount}
                          amountPaid={p.amountPaid}
                          onConfirm={(amt) => handlePartialPayment(p.id, amt)}
                          trigger={<Button size="sm" variant="outline" className="text-xs sm:text-sm">Registrer</Button>}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditPaymentId(p.id)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Rediger
                            </DropdownMenuItem>
                            {getSmsLink(p) && (
                              <DropdownMenuItem asChild>
                                <a href={getSmsLink(p)!}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Send SMS-påminnelse
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeletePaymentId(p.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Slett
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            <CardTitle className="text-base">Betalte poster ({paidItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paidItems.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Ingen betalte poster ennå</p>
            ) : (
              <div className="divide-y">
                {paidItems.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-5 py-3 opacity-70 gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p.description}</p>
                      <p className="text-xs text-muted-foreground">Betalt: {p.paidDate ? formatDate(p.paidDate) : "–"}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <StatusBadge paid={true} dueDate={p.dueDate} />
                      <span className="text-sm font-medium">{formatCurrency(p.amount)}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => markAsUnpaid(p.id)}>
                            <Undo2 className="h-4 w-4 mr-2" />
                            Angre betaling
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeletePaymentId(p.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Slett
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Betalingshistorikk ({payments.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Ingen poster registrert</p>
            ) : (
              <div className="divide-y">
                <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-3 px-5 py-2 text-xs font-medium text-muted-foreground">
                  <span>Beskrivelse</span>
                  <span>Dato</span>
                  <span>Status</span>
                  <span className="text-right">Beløp</span>
                </div>
                {[...payments]
                  .sort((a, b) => {
                    const aDate = a.paid && a.paidDate ? a.paidDate : a.dueDate;
                    const bDate = b.paid && b.paidDate ? b.paidDate : b.dueDate;
                    return new Date(bDate).getTime() - new Date(aDate).getTime();
                  })
                  .map((p) => {
                    const displayDate = p.paid && p.paidDate ? p.paidDate : p.dueDate;
                    const dateLabel = p.paid ? "Betalt" : "Forfall";
                    const partials = p.partialPayments ?? [];
                    const hasPartials = partials.length > 0;
                    const remaining = p.amount - p.amountPaid;
                    return (
                      <div key={p.id} className="px-3 sm:px-5 py-3">
                        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] items-center gap-2 sm:gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{p.description}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">
                              {dateLabel}: {formatDate(displayDate)}
                            </p>
                          </div>
                          <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(displayDate)}
                          </span>
                          <StatusBadge paid={p.paid} dueDate={p.dueDate} />
                          <span className="text-sm font-semibold text-right whitespace-nowrap">
                            {formatCurrency(p.amount)}
                          </span>
                        </div>

                        {hasPartials && (
                          <div className="mt-2 ml-2 sm:ml-4 border-l-2 border-border pl-3 space-y-1">
                            {[...partials]
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((part, idx) => (
                                <div
                                  key={part.id}
                                  className="flex items-center justify-between text-xs text-muted-foreground"
                                >
                                  <span>
                                    Delbetaling {partials.length - idx} · {formatDate(part.date)}
                                  </span>
                                  <span className="font-medium text-success">
                                    +{formatCurrency(part.amount)}
                                  </span>
                                </div>
                              ))}
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                              <span className="text-muted-foreground">
                                Sum betalt
                              </span>
                              <span className="font-semibold">
                                {formatCurrency(p.amountPaid)} av {formatCurrency(p.amount)}
                              </span>
                            </div>
                            {!p.paid && remaining > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Gjenstår</span>
                                <span className="font-semibold text-warning">
                                  {formatCurrency(remaining)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
