import { Badge } from "@/components/ui/badge";
import { isOverdue } from "@/lib/format";

interface StatusBadgeProps {
  paid: boolean;
  dueDate: string;
}

export function StatusBadge({ paid, dueDate }: StatusBadgeProps) {
  if (paid) {
    return <Badge className="bg-success text-success-foreground hover:bg-success/90">Betalt</Badge>;
  }
  if (isOverdue(dueDate)) {
    return <Badge className="bg-overdue text-overdue-foreground hover:bg-overdue/90">Forfalt</Badge>;
  }
  return <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">Ubetalt</Badge>;
}
