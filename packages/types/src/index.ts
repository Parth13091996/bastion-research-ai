export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  address_2?: string | null;
  pan_card_number: string;
  state: string;
  city: string;
  pin_code: string;
  date_of_birth: string; // Or Date, but string is safer for serialization
  gst_number?: string | null;
  company?: string | null;
  password?: string | null; // Null for OAuth users
  role?: 'user' | 'admin'; // Assuming possible roles
  cameFromOAuth?: boolean;
  created_at?: string;
}
