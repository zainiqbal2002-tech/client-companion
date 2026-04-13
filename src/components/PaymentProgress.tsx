import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";

interface PaymentProgressProps {
  amount: number;
  amountPaid: number;
}

export function PaymentProgress({ amount, amountPaid }: PaymentProgressProps) {
  if (amountPaid <= 0) return null;
  const pct = Math.round((amountPaid / amount) * 100);

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={pct} className="h-2 flex-1" />
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{pct}%</span>
    </div>
  );
}
