import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/email';

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
  const {
    username,
    email,
    first_name,
    last_name,
    password,
    role,
    phone,
    pan_card_number,
    address_1,
    address_2,
    state,
    city,
    pin_code,
    date_of_birth,
    gst_number,
    company_name,
    status,
  } = req.body;

  // Validate and parse the date of birth
  if (!date_of_birth || isNaN(Date.parse(date_of_birth))) {
    return res.status(400).json({ message: 'A valid date of birth is required.' });
  }
  const dob = new Date(date_of_birth);

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
      phone,
      pan_card_number,
      address_1,
      address_2,
      state,
      city,
      pin_code,
      date_of_birth: dob,
      gst_number,
      company_name,
      status: status || 'active',
     }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Send signup email notification
  if (req.body.sendSignupEmail) {
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Bastion Research!',
        text: `Hello ${first_name},\n\nWelcome to Bastion Research! Your account has been created successfully.\n\nYour username is: ${username}\n\nYou can now log in with the password you set.\n\nBest regards,\nThe Bastion Research Team`,
        html: `<p>Hello ${first_name},</p><p>Welcome to Bastion Research! Your account has been created successfully.</p><p>Your username is: <strong>${username}</strong></p><p>You can now log in with the password you set.</p><p>Best regards,<br>The Bastion Research Team</p>`,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Do not block the response for email failure.
      // The user is created, but we should log the email error.
    }
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
