import { Customer, PaymentItem } from "@/types";

export const mockCustomers: Customer[] = [
  { id: "1", name: "Bergen Elektro AS", email: "post@bergenelektro.no", phone: "55 12 34 56", monthlyAmount: 3500, annualAmount: 8500, createdAt: "2024-01-15" },
  { id: "2", name: "Nordfjord Bygg", email: "kontor@nordfjordbygg.no", phone: "57 65 43 21", monthlyAmount: 5000, createdAt: "2024-03-01" },
  { id: "3", name: "Stavanger Rør & VVS", email: "faktura@stavangerror.no", monthlyAmount: 4200, annualAmount: 12000, createdAt: "2023-11-10" },
  { id: "4", name: "Tromsø Consulting", email: "regn@tromsoconsulting.no", phone: "77 88 99 00", monthlyAmount: 2800, createdAt: "2024-06-01" },
];

export const mockPayments: PaymentItem[] = [
  { id: "p1", customerId: "1", description: "Regnskap januar", amount: 3500, amountPaid: 3500, date: "2025-01-01", dueDate: "2025-01-31", paid: true, paidDate: "2025-01-28", type: "monthly" },
  { id: "p2", customerId: "1", description: "Regnskap februar", amount: 3500, amountPaid: 3500, date: "2025-02-01", dueDate: "2025-02-28", paid: true, paidDate: "2025-02-25", type: "monthly" },
  { id: "p3", customerId: "1", description: "Regnskap mars", amount: 3500, amountPaid: 1500, date: "2025-03-01", dueDate: "2025-03-31", paid: false, type: "monthly" },
  { id: "p4", customerId: "1", description: "Skattemelding 2024", amount: 8500, amountPaid: 0, date: "2025-03-15", dueDate: "2025-04-30", paid: false, type: "annual" },
  { id: "p5", customerId: "2", description: "Regnskap januar", amount: 5000, amountPaid: 5000, date: "2025-01-01", dueDate: "2025-01-31", paid: true, paidDate: "2025-01-20", type: "monthly" },
  { id: "p6", customerId: "2", description: "Regnskap februar", amount: 5000, amountPaid: 5000, date: "2025-02-01", dueDate: "2025-02-28", paid: true, paidDate: "2025-02-22", type: "monthly" },
  { id: "p7", customerId: "2", description: "Regnskap mars", amount: 5000, amountPaid: 5000, date: "2025-03-01", dueDate: "2025-03-31", paid: true, paidDate: "2025-03-28", type: "monthly" },
  { id: "p8", customerId: "2", description: "Regnskap april", amount: 5000, amountPaid: 2000, date: "2025-04-01", dueDate: "2025-04-30", paid: false, type: "monthly" },
  { id: "p9", customerId: "3", description: "Regnskap januar", amount: 4200, amountPaid: 4200, date: "2025-01-01", dueDate: "2025-01-31", paid: true, paidDate: "2025-01-30", type: "monthly" },
  { id: "p10", customerId: "3", description: "Regnskap februar", amount: 4200, amountPaid: 0, date: "2025-02-01", dueDate: "2025-02-28", paid: false, type: "monthly" },
  { id: "p11", customerId: "3", description: "Skattemelding 2024", amount: 12000, amountPaid: 0, date: "2025-02-01", dueDate: "2025-04-30", paid: false, type: "annual" },
  { id: "p12", customerId: "4", description: "Regnskap mars", amount: 2800, amountPaid: 0, date: "2025-03-01", dueDate: "2025-03-31", paid: false, type: "monthly" },
  { id: "p13", customerId: "4", description: "Regnskap april", amount: 2800, amountPaid: 0, date: "2025-04-01", dueDate: "2025-04-30", paid: false, type: "monthly" },
];
