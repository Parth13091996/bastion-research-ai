import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    { id: '1', username: 'johndoe', first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', role: 'user', isPremium: true, cameFromOAuth: false },
    { id: '2', username: 'janesmith', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', role: 'user', isPremium: false, cameFromOAuth: true },
    { id: '3', username: 'admin', first_name: 'Admin', last_name: 'User', email: 'admin@example.com', role: 'admin', isPremium: true, cameFromOAuth: false },
  ];
  res.status(200).json(dummyData);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const createUser = async (req: Request, res: Response) => {
  const { username, email, first_name, last_name, password, role } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { data, error } = await supabase
    .from('users')
    .insert([{
      username,
      email,
      first_name,
      last_name,
      password: hashedPassword,
      role: role || 'user',
      phone: '0000000000',
      address_1: 'N/A',
      pan_card_number: 'N/A',
      state: 'N/A',
      city: 'N/A',
      pin_code: 'N/A',
      date_of_birth: new Date(),
     }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, first_name, last_name } = req.body;
  const { data, error } = await supabase
    .from('users')
    .update({ username, email, first_name, last_name })
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};
