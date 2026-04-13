import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { PaymentItem } from "@/types";

interface EditPaymentDialogProps {
  payment: PaymentItem;
  onSave: (updated: PaymentItem) => void;
}

export function EditPaymentDialog({ payment, onSave }: EditPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(payment.description);
  const [notes, setNotes] = useState(payment.notes ?? "");
  const [amount, setAmount] = useState(String(payment.amount));
  const [dueDate, setDueDate] = useState(payment.dueDate);
  const [type, setType] = useState(payment.type);

  const handleOpen = (o: boolean) => {
    if (o) {
      setDescription(payment.description);
      setNotes(payment.notes ?? "");
      setAmount(String(payment.amount));
      setDueDate(payment.dueDate);
      setType(payment.type);
    }
    setOpen(o);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = Number(amount);
    onSave({
      ...payment,
      description,
      notes: notes || undefined,
      amount: newAmount,
      amountPaid: Math.min(payment.amountPaid, newAmount),
      dueDate,
      type,
      paid: payment.amountPaid >= newAmount && newAmount > 0,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editDesc">Beskrivelse</Label>
            <Input id="editDesc" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editNotes">Tilleggsinformasjon (valgfritt)</Label>
            <Textarea id="editNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editAmount">Beløp (NOK)</Label>
            <Input id="editAmount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" />
            {payment.amountPaid > 0 && Number(amount) < payment.amountPaid && (
              <p className="text-xs text-overdue">Beløpet er lavere enn allerede betalt ({payment.amountPaid} kr). Betalt beløp justeres ned.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="editDue">Forfallsdato</Label>
            <Input id="editDue" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Månedlig</SelectItem>
                <SelectItem value="annual">Årlig</SelectItem>
                <SelectItem value="one-time">Engangs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Lagre endringer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
