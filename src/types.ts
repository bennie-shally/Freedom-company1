/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserData {
  uid: string;
  username: string;
  email: string;
  balance: number;
  totalEarnings: number;
  referralCode: string;
  referredBy?: string;
  referredByUid?: string | null;
  role: 'user' | 'admin';
  createdAt: any;
}

export interface Investment {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  profit: number;
  totalReturn: number;
  startedAt: any;
  endsAt: any;
  status: 'running' | 'completed';
}

export interface Deposit {
  id: string;
  userId: string;
  username: string;
  amount: number;
  proofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  reviewedAt?: any;
}

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  fee: number;
  netAmount: number;
  bankDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface SystemSettings {
  gcashName: string;
  gcashNumber: string;
  withdrawalFeePercent: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  referralBonus: number;
  whatsappAdmin: string;
  whatsappGroup: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  profitAmount: number;
  durationHours?: number;
  durationDays?: number;
}

export interface LoanApplication {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  bankName: string;
  accountNumber: string;
  monthlyIncome: number;
  amountRequested: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  createdAt: any;
}
