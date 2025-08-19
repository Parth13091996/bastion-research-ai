import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getMembershipPlans = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('membership_plans').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    { plan_id: 1, plan_name: 'Gold', plan_type: 'Subscription', members: 0, wp_role: 'gold_member', price_amount: 99.99, currency: 'USD', duration_months: 12 },
    { plan_id: 2, plan_name: 'Silver', plan_type: 'Subscription', members: 0, wp_role: 'silver_member', price_amount: 49.99, currency: 'USD', duration_months: 12 },
  ];
  res.status(200).json(dummyData);
};

export const getSubscriptions = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('subscriptions').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    { membership_id: 1, username: 'johndoe', name: 'John Doe', start_date: '2023-01-15', expire_next_renewal: '2024-01-15', amount: 99.99, currency: 'USD', payment_type: 'Stripe', transaction_id: 12345, status: 'Active' },
    { membership_id: 2, username: 'janesmith', name: 'Jane Smith', start_date: '2023-03-20', expire_next_renewal: '2024-03-20', amount: 49.99, currency: 'USD', payment_type: 'PayPal', transaction_id: 67890, status: 'Active' },
  ];
  res.status(200).json(dummyData);
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('payment_history').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    { transaction_id: 'txn_123', invoice_id: 'inv_123', user_id: 'usr_123', user_email: 'john.doe@example.com', membership: 'Gold', payment_gateway: 'Stripe', payment_type: 'Card', payer_email: 'john.doe@example.com', transaction_status: 'Completed' },
    { transaction_id: 'txn_456', invoice_id: 'inv_456', user_id: 'usr_456', user_email: 'jane.smith@example.com', membership: 'Silver', payment_gateway: 'PayPal', payment_type: 'PayPal', payer_email: 'jane.smith@example.com', transaction_status: 'Completed' },
  ];
  res.status(200).json(dummyData);
};
