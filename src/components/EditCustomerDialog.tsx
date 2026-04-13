import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { Customer } from "@/types";

interface EditCustomerDialogProps {
  customer: Customer;
  onSave: (updated: Customer) => void;
}

export function EditCustomerDialog({ customer, onSave }: EditCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [monthlyAmount, setMonthlyAmount] = useState(String(customer.monthlyAmount));
  const [annualAmount, setAnnualAmount] = useState(String(customer.annualAmount ?? ""));

  const handleOpen = (o: boolean) => {
    if (o) {
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone ?? "");
      setMonthlyAmount(String(customer.monthlyAmount));
      setAnnualAmount(String(customer.annualAmount ?? ""));
    }
    setOpen(o);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...customer,
      name,
      email,
      phone: phone || undefined,
      monthlyAmount: Number(monthlyAmount),
      annualAmount: annualAmount ? Number(annualAmount) : undefined,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger kunde</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editCustName">Bedriftsnavn</Label>
            <Input id="editCustName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCustEmail">E-post</Label>
            <Input id="editCustEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editCustPhone">Telefon (valgfritt)</Label>
            <Input id="editCustPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="editMonthly">Månedlig beløp (NOK)</Label>
              <Input id="editMonthly" type="number" value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value)} required min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAnnual">Årlig tillegg (valgfritt)</Label>
              <Input id="editAnnual" type="number" value={annualAmount} onChange={(e) => setAnnualAmount(e.target.value)} min="0" />
            </div>
          </div>
          <Button type="submit" className="w-full">Lagre endringer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
