import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/api/axios';

const addJobSchema = z.object({
  job_title: z.string().min(3),
  author: z.string().min(1),
  expiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

type AddJobFormValues = z.infer<typeof addJobSchema>;

const AddNewJob = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddJobFormValues>({
    resolver: zodResolver(addJobSchema),
  });

  const mutation = useMutation<unknown, Error, AddJobFormValues>({
    mutationFn: (data) =>
      axiosInstance.post('/api/jobs', data).then((res) => res.data),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      // Optionally, show a success message
    },
  });

  const onSubmit = (data: AddJobFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Job</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="job_title">Job Title</label>
          <Input id="job_title" {...register('job_title')} />
          {errors.job_title && <p className="text-red-600">{errors.job_title.message}</p>}
        </div>
        <div>
          <label htmlFor="author">Author</label>
          <Input id="author" {...register('author')} />
          {errors.author && <p className="text-red-600">{errors.author.message}</p>}
        </div>
        <div>
          <label htmlFor="expiry">Expiry Date</label>
          <Input id="expiry" type="date" {...register('expiry')} />
          {errors.expiry && <p className="text-red-600">{errors.expiry.message}</p>}
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Adding Job...' : 'Add Job'}
        </Button>
        {mutation.isError && (
          <p className="text-red-600">{mutation.error.message}</p>
        )}
      </form>
    </div>
  );
};

export default AddNewJob;
