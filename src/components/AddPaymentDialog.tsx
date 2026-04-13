import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { PaymentItem } from "@/types";

interface AddPaymentDialogProps {
  customerId: string;
  onAdd: (item: Omit<PaymentItem, "id">) => void;
}

export function AddPaymentDialog({ customerId, onAdd }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<"monthly" | "annual" | "one-time">("one-time");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      customerId,
      description,
      amount: Number(amount),
      amountPaid: 0,
      date: new Date().toISOString().split("T")[0],
      dueDate,
      paid: false,
      type,
    });
    setDescription("");
    setAmount("");
    setDueDate("");
    setType("one-time");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Ny post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til ny post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="F.eks. Regnskap april" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Beløp (NOK)</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" required min="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Forfallsdato</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
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
          <Button type="submit" className="w-full">Legg til</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
