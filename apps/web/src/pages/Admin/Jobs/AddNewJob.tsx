import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/api/axios';

const addJobSchema = z.object({
  job_title: z.string().min(3, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  expiry: z.string().optional(),
  team: z.string().optional(),
  experience: z.string().optional(),
  commitment: z.string().optional(),
  job_type: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  responsibilities: z.string().optional(), // newline-separated list
  requirements: z.string().optional(), // newline-separated list
  good_to_have: z.string().optional(), // newline-separated list
  benefits: z.string().optional(), // newline-separated list
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
    mutationFn: (data) => {
      const toList = (s?: string | null) =>
        s ? s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean) : [];

      const payload: any = {
        ...data,
        responsibilities: toList(data.responsibilities as any),
        requirements: toList(data.requirements as any),
        good_to_have: toList(data.good_to_have as any),
        benefits: toList(data.benefits as any),
      };
      return axiosInstance.post('/api/jobs', payload).then((res) => res.data);
    },
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
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
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
          <label htmlFor="team">Team</label>
          <Input id="team" placeholder="e.g. Core Research" {...register('team')} />
        </div>
        <div>
          <label htmlFor="experience">Experience</label>
          <Input id="experience" placeholder="e.g. 0-1 year" {...register('experience')} />
        </div>
        <div>
          <label htmlFor="commitment">Commitment</label>
          <Input id="commitment" placeholder="e.g. Full-time" {...register('commitment')} />
        </div>
        <div>
          <label htmlFor="job_type">Job Type</label>
          <Input id="job_type" placeholder="Full Time / Part Time / Contract" {...register('job_type')} />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <Input id="location" placeholder="Office / Hybrid / Work From Home" {...register('location')} />
        </div>
        <div>
          <label htmlFor="expiry">Expiry Date</label>
          <Input id="expiry" type="date" {...register('expiry')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description">Description</label>
          <textarea id="description" className="w-full p-2 border rounded" rows={4} {...register('description')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="responsibilities">What You'll Do (one per line)</label>
          <textarea id="responsibilities" className="w-full p-2 border rounded" rows={4} {...register('responsibilities')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="requirements">What We're Looking For (one per line)</label>
          <textarea id="requirements" className="w-full p-2 border rounded" rows={4} {...register('requirements')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="good_to_have">Good To Have (one per line)</label>
          <textarea id="good_to_have" className="w-full p-2 border rounded" rows={4} {...register('good_to_have')} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="benefits">What You'll Get (one per line)</label>
          <textarea id="benefits" className="w-full p-2 border rounded" rows={4} {...register('benefits')} />
        </div>

        <div className="md:col-span-2 mt-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding Job...' : 'Add Job'}
          </Button>
          {mutation.isError && (
            <p className="text-red-600 mt-2">{mutation.error.message}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddNewJob;
