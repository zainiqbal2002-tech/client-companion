import { Customer, PaymentItem } from "@/types";

const MONTH_NAMES = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function buildMonthlyDescription(year: number, month: number): string {
  return `Månedsabonnement ${MONTH_NAMES[month]} ${year}`;
}

/**
 * Generates a monthly subscription PaymentItem for each customer with monthlyAmount > 0
 * for the given month/year. Skips customers that already have a payment with the
 * matching auto-generated description for that month.
 *
 * Due date is the 1st of the month. Issue date is also the 1st of the month.
 */
export function generateMonthlyPayments(
  customers: Customer[],
  existingPayments: PaymentItem[],
  year: number,
  month: number,
): PaymentItem[] {
  const description = buildMonthlyDescription(year, month);
  const dateStr = `${year}-${pad(month + 1)}-01`;

  const newItems: PaymentItem[] = [];
  for (const c of customers) {
    if (!c.monthlyAmount || c.monthlyAmount <= 0) continue;

    // Don't generate before the customer was created
    const created = new Date(c.createdAt);
    const periodStart = new Date(year, month, 1);
    if (created > new Date(year, month + 1, 0)) continue; // created after end of month

    const already = existingPayments.some(
      (p) => p.customerId === c.id && p.description === description,
    );
    if (already) continue;

    newItems.push({
      id: `auto-${c.id}-${year}-${pad(month + 1)}`,
      customerId: c.id,
      description,
      amount: c.monthlyAmount,
      amountPaid: 0,
      date: dateStr,
      dueDate: dateStr,
      paid: false,
      type: "monthly",
    });
  }
  return newItems;
}

/**
 * Generates monthly payments for every month from each customer's createdAt
 * up to and including the current month. Used to backfill on app load.
 */
export function generateAllDueMonthlyPayments(
  customers: Customer[],
  existingPayments: PaymentItem[],
): PaymentItem[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const generated: PaymentItem[] = [];
  let working = existingPayments;

  for (const c of customers) {
    if (!c.monthlyAmount || c.monthlyAmount <= 0) continue;
    const created = new Date(c.createdAt);
    let y = created.getFullYear();
    let m = created.getMonth();
    while (y < currentYear || (y === currentYear && m <= currentMonth)) {
      const items = generateMonthlyPayments([c], working, y, m);
      if (items.length) {
        generated.push(...items);
        working = working.concat(items);
      }
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
    }
  }
  return generated;
}