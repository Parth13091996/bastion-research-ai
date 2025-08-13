import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import twilio from 'twilio';

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

if (!accountSid || !authToken || !twilioFromNumber) {
  console.error('Twilio credentials are not set in the environment variables.');
  // We don't throw an error here to allow the app to start, but OTP will fail.
}

const twilioClient = twilio(accountSid, authToken);

/**
 * Generates a 6-digit random OTP.
 */
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  if (!twilioClient) {
      return res.status(500).json({ message: 'Twilio client is not configured.' });
  }

  try {
    // 1. Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 2. Generate OTP and expiration
    const otp = generateOtp();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 3. Save OTP to the user's record
    const { error: updateError } = await supabase
      .from('users')
      .update({ otp, otp_expires_at })
      .eq('id', user.id);

    if (updateError) {
      console.error('OTP update error:', updateError);
      return res.status(500).json({ message: 'Failed to save OTP.' });
    }

    // 4. Send the OTP via Twilio
    try {
      await twilioClient.messages.create({
        body: `Your verification code is: ${otp}`,
        from: twilioFromNumber,
        to: user.phone,
      });
      res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (twilioError) {
      console.error('Twilio sending error:', twilioError);
      res.status(500).json({ message: 'Failed to send OTP.' });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    // 1. Find the user and their stored OTP
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, otp, otp_expires_at')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 2. Verify the OTP
    if (!user.otp || !user.otp_expires_at) {
        return res.status(400).json({ message: 'No OTP found for this user. Please request one.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // 3. Clear the OTP from the database after successful verification
    const { error: updateError } = await supabase
      .from('users')
      .update({ otp: null, otp_expires_at: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('OTP clear error:', updateError);
      // Don't block the user, but log the error
    }

    res.status(200).json({ message: 'OTP verified successfully.' });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error while verifying OTP.' });
  }
};
