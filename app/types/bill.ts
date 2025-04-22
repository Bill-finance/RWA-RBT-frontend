export interface BillFormData {
  billNumber: string;
  amount: number;
  dueDate: string;
  status: string;
}

export interface NewBillFormData extends BillFormData {
  id: string;
}
