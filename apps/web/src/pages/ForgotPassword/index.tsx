import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppRoutes } from '@/routes/app-routes';
import { motion } from 'framer-motion';

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', data);
      console.log(response, 'respnse')
      if(response?.data?.sentStatus === 'failed') {
        setError(response?.data?.message || "Mail sending failed")
      }
      setSent(true);
    } catch (e) {
      // Intentionally ignore errors to avoid user enumeration
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-navy-600/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password</h1>
              <p className="text-gray-600 mb-6">Enter your email, and we'll send a reset link.</p>

              {sent ? (
                <div>
                  <div className={`rounded-lg  ${error ? "bg-red-50 text-red-700": "bg-green-50 text-green-700"}  p-3 mb-6`}>
                    {error ? error : "A password reset link has been sent."}
                  </div>
                  <Button className="w-full" onClick={() => navigate(AppRoutes.login())}>Back to Login</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link to={AppRoutes.login()} className="text-sm text-red-600 hover:underline">Back to login</Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;

