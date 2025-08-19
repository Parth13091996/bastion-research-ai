import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/api/axios';

const addUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

const AddUser = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
  });

  const mutation = useMutation<unknown, Error, AddUserFormValues>({
    mutationFn: (data) =>
      axiosInstance.post('/api/users', data).then((res) => res.data),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Optionally, show a success message
    },
  });

  const onSubmit = (data: AddUserFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New User</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="username">Username</label>
          <Input id="username" {...register('username')} />
          {errors.username && <p className="text-red-600">{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="first_name">First Name</label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name && <p className="text-red-600">{errors.first_name.message}</p>}
        </div>
        <div>
          <label htmlFor="last_name">Last Name</label>
          <Input id="last_name" {...register('last_name')} />
          {errors.last_name && <p className="text-red-600">{errors.last_name.message}</p>}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && <p className="text-red-600">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <select id="role" {...register('role')} className="w-full p-2 border rounded">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <p className="text-red-600">{errors.role.message}</p>}
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Adding User...' : 'Add User'}
        </Button>
        {mutation.isError && (
          <p className="text-red-600">{mutation.error.message}</p>
        )}
      </form>
    </div>
  );
};

export default AddUser;
