export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  date: Date;
  categoryId: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
}
