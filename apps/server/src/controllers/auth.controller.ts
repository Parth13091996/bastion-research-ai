import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@repo/types';

const generateToken = (id: string, email: string, expiresIn: string = '1d') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return jwt.sign({ id, email }, secret, { expiresIn: expiresIn as any });
};

const generateTemporaryToken = (payload: object) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined.');
  }
  // This token is short-lived, just for completing the profile.
  return jwt.sign(payload, secret, { expiresIn: '15m' });
};

const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:3003'}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured');
  }
  return new OAuth2Client({ clientId, clientSecret, redirectUri });
};


// --- Standard Authentication ---

export const register = async (req: Request, res: Response) => {
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
        return res.status(400).json({ message: 'Email, phone, and password are required.' });
    }

    try {
        const { data: existingUser, error: existingUserError } = await supabase
            .from('users')
            .select('email, phone')
            .or(`email.eq.${email},phone.eq.${phone}`);

        if (existingUserError) throw existingUserError;

        if (existingUser && existingUser.length > 0) {
            return res.status(409).json({ message: 'User with this email or phone number already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const username = email.split('@')[0];

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                email,
                phone,
                password: hashedPassword,
                username: username,
            })
            .select('id, email, phone')
            .single();

        if (insertError) throw insertError;
        if (!newUser) throw new Error('User not created');

        res.status(201).json({
            message: 'User registered successfully. Please verify your OTP.',
            user: { id: newUser.id, email: newUser.email },
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


export const completeProfile = async (req: Request, res: Response) => {
    const {
        email,
        first_name, last_name,
        pan_card_number, date_of_birth,
        aadhar_card_number, bank_account_number, ifsc_code
    } = req.body;

    if (!email || !first_name || !last_name || !pan_card_number || !date_of_birth) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
                first_name,
                last_name,
                pan_card_number,
                date_of_birth,
                aadhar_card_number,
                bank_account_number,
                ifsc_code,
                status: 'active'
            })
            .eq('id', user.id)
            .select('id, username, email')
            .single();

        if (updateError) throw updateError;
        if (!updatedUser) throw new Error('User profile not completed');

        const token = generateToken(updatedUser.id, updatedUser.email);

        res.status(200).json({
            message: 'User profile completed successfully',
            token,
            user: { id: updatedUser.id, username: updatedUser.email, email: updatedUser.email },
        });
    } catch (error) {
        console.error('Complete profile error:', error);
        res.status(500).json({ message: 'Server error during profile completion.' });
    }
};

export const signIn = async (req: Request, res: Response) => {
  // ... (keeping existing signIn function as it is correct)
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user.id, user.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'strict', // Or 'lax'
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: 'Signed in successfully',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Server error during sign in.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  // ... (keeping existing forgotPassword function)
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address.' });
  }

  console.log(`Password reset requested for: ${email}`);
  res.status(200).json({
    message: 'If an account with this email exists, a password reset link has been sent.',
  });
};

// --- Google OAuth ---

export const googleOAuthStart = async (req: Request, res: Response) => {
  try {
    const client = getGoogleClient();
    const url = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['openid', 'email', 'profile'],
    });
    res.redirect(url);
  } catch (error) {
    console.error('Google OAuth start error:', error);
    res.status(500).json({ message: 'Failed to start Google OAuth flow.' });
  }
};

export const googleOAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=google_oauth_failed`);
  }

  try {
    const client = getGoogleClient();
    const { tokens } = await client.getToken(code as string);
    const idToken = tokens.id_token;

    if (!idToken) {
      throw new Error('No ID token received from Google.');
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error('Invalid Google token payload.');
    }

    const { email, name, sub: googleId } = payload;
    const [firstName, ...lastNameParts] = (name || '').split(' ');
    const lastName = lastNameParts.join(' ');

    // Check if user already exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = 'exact one row not found'
      throw error;
    }

    if (user) {
      // User exists, sign them in by setting a cookie
      const loginToken = generateToken(user.id, user.email);
      res.cookie('token', loginToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      return res.redirect(`${frontendUrl}/dashboard`); // Redirect to a protected route
    } else {
      // User is new, redirect to complete profile with a temporary token
      const tempTokenPayload = { email, googleId, firstName, lastName };
      const tempToken = generateTemporaryToken(tempTokenPayload);
      return res.redirect(`${frontendUrl}/complete-profile?temp_token=${tempToken}`);
    }

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.redirect(`${frontendUrl}/login?error=google_oauth_failed`);
  }
};

export const completeGoogleProfile = async (req: Request, res: Response) => {
  const { temp_token, username, phone, address_1, address_2, pan_card_number, state, city, pin_code, date_of_birth, gst_number, company } = req.body;

  if (!temp_token) {
    return res.status(400).json({ message: 'Temporary token is required.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');

    const decoded = jwt.verify(temp_token, secret) as { email: string, firstName: string, lastName: string };
    const { email, firstName, lastName } = decoded;

    // All other fields are required as per the original signUp logic
    if (!username || !phone || !address_1 || !pan_card_number || !state || !city || !pin_code || !date_of_birth) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username, first_name: firstName, last_name: lastName, phone, email, address_1, address_2,
        pan_card_number, state, city, pin_code, date_of_birth, gst_number, company,
        password: null, // No password for OAuth users
        cameFromOAuth: true
      })
      .select('id, username, email')
      .single();

    if (insertError) throw insertError;
    if (!newUser) throw new Error('Failed to create user profile.');

    const loginToken = generateToken(newUser.id, newUser.email);

    res.cookie('token', loginToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({
      message: 'User profile completed and created successfully.',
      user: newUser,
    });

  } catch (error: any) {
    console.error('Complete Google Profile error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired temporary token.' });
    }
    res.status(500).json({ message: 'Server error during profile completion.' });
  }
};


export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');

    const decoded = jwt.verify(token, secret) as { id: string, email: string };

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, role') // Make sure to select the 'role'
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });

  } catch (error) {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
