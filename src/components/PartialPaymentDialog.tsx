import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";

interface PartialPaymentDialogProps {
  amount: number;
  amountPaid: number;
  onConfirm: (partialAmount: number) => void;
  trigger: React.ReactNode;
}

export function PartialPaymentDialog({ amount, amountPaid, onConfirm, trigger }: PartialPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const remaining = amount - amountPaid;
  const [value, setValue] = useState(String(remaining));

  const numValue = Number(value) || 0;
  const isValid = numValue > 0 && numValue <= remaining;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onConfirm(numValue);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setValue(String(remaining)); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrer betaling</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-secondary p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Totalt</span><span className="font-medium">{formatCurrency(amount)}</span></div>
            {amountPaid > 0 && (
              <div className="flex justify-between"><span className="text-muted-foreground">Allerede betalt</span><span className="font-medium text-success">{formatCurrency(amountPaid)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Gjenstår</span><span className="font-semibold">{formatCurrency(remaining)}</span></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="partialAmount">Beløp som betales (NOK)</Label>
            <Input
              id="partialAmount"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="1"
              max={remaining}
              required
            />
            {numValue > 0 && numValue <= remaining && (
              <p className="text-xs text-muted-foreground">
                {Math.round((numValue / remaining) * 100)}% av gjenstående · {Math.round(((amountPaid + numValue) / amount) * 100)}% av totalt
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setValue(String(remaining)); }}>
              Betal alt
            </Button>
            <Button type="submit" className="flex-1" disabled={!isValid}>
              Bekreft
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
