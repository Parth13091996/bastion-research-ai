import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/api/axios';

// Schema based on the backend's required fields in `completeGoogleProfile`
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address_1: z.string().min(5, 'Please enter a valid address'),
  address_2: z.string().optional(),
  pan_card_number: z.string().length(10, 'PAN card must be 10 characters').toUpperCase(),
  state: z.string().min(2, 'Please enter a valid state'),
  city: z.string().min(2, 'Please enter a valid city'),
  pin_code: z.string().length(6, 'Pin code must be 6 digits'),
  date_of_birth: z.string().refine((dob) => new Date(dob).toString() !== 'Invalid Date', {
    message: 'Please enter a valid date of birth',
  }),
  gst_number: z.string().optional(),
  company: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refetchUser } = useAuth();
  const tempToken = searchParams.get('temp_token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!tempToken) {
      navigate('/login?error=invalid_session');
    }
  }, [tempToken, navigate]);

  const mutation = useMutation<any, Error, ProfileFormValues>({
    mutationFn: (data) =>
      axiosInstance.post('/api/auth/google/complete-profile', {
        ...data,
        temp_token: tempToken,
      }).then((res) => res.data),
    onSuccess: async () => {
      // The cookie is set by the backend, now we refetch user data
      await refetchUser();
      navigate('/dashboard');
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Complete Your Profile</h1>
        <p className="text-center text-gray-600">
          Welcome! Please fill in the details below to finish setting up your account.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* We can map over an array to reduce boilerplate here, but for clarity: */}
          <Input placeholder="Username" {...register('username')} />
          {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}

          <Input placeholder="Phone Number" {...register('phone')} />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}

          <Input placeholder="Address Line 1" {...register('address_1')} />
          {errors.address_1 && <p className="text-sm text-red-600">{errors.address_1.message}</p>}

          <Input placeholder="Address Line 2 (Optional)" {...register('address_2')} />

          <Input placeholder="PAN Card Number" {...register('pan_card_number')} />
          {errors.pan_card_number && <p className="text-sm text-red-600">{errors.pan_card_number.message}</p>}

          <Input placeholder="State" {...register('state')} />
          {errors.state && <p className="text-sm text-red-600">{errors.state.message}</p>}

          <Input placeholder="City" {...register('city')} />
          {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}

          <Input placeholder="Pin Code" {...register('pin_code')} />
          {errors.pin_code && <p className="text-sm text-red-600">{errors.pin_code.message}</p>}

          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-500">Date of Birth</label>
            <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
            {errors.date_of_birth && <p className="text-sm text-red-600">{errors.date_of_birth.message}</p>}
          </div>

          <Input placeholder="GST Number (Optional)" {...register('gst_number')} />
          <Input placeholder="Company (Optional)" {...register('company')} />

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Saving...' : 'Complete Profile'}
          </Button>
          {mutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              An error occurred: {mutation.error.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
