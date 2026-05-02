export interface PartialPayment {
  id: string;
  amount: number;
  date: string;
}

export interface PaymentItem {
  id: string;
  customerId: string;
  description: string;
  amount: number;
  amountPaid: number;
  date: string;
  dueDate: string;
  paid: boolean;
  paidDate?: string;
  type: "monthly" | "annual" | "one-time";
  notes?: string;
  partialPayments?: PartialPayment[];
  paymentRequestStatus?: "pending" | "approved" | "rejected";
  paymentRequestDate?: string;
  paymentRequestAmount?: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  monthlyAmount: number;
  annualAmount?: number;
  createdAt: string;
}
