import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Customer } from "@/types";

interface AddCustomerDialogProps {
  onAdd: (customer: Customer) => void;
}

export function AddCustomerDialog({ onAdd }: AddCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [annualAmount, setAnnualAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `c-${Date.now()}`,
      name,
      email,
      phone: phone || undefined,
      monthlyAmount: Number(monthlyAmount),
      annualAmount: annualAmount ? Number(annualAmount) : undefined,
      createdAt: new Date().toISOString().split("T")[0],
    });
    setName(""); setEmail(""); setPhone(""); setMonthlyAmount(""); setAnnualAmount("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Ny kunde
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til ny kunde</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Bedriftsnavn</Label>
            <Input id="customerName" value={name} onChange={(e) => setName(e.target.value)} placeholder="F.eks. Oslo Regnskap AS" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">E-post</Label>
            <Input id="customerEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="post@bedrift.no" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Telefon (valgfritt)</Label>
            <Input id="customerPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="22 33 44 55" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="monthlyAmt">Månedlig beløp (NOK)</Label>
              <Input id="monthlyAmt" type="number" value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value)} placeholder="0" required min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualAmt">Årlig tillegg (valgfritt)</Label>
              <Input id="annualAmt" type="number" value={annualAmount} onChange={(e) => setAnnualAmount(e.target.value)} placeholder="0" min="0" />
            </div>
          </div>
          <Button type="submit" className="w-full">Legg til kunde</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
