import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser } from "@/api/users-api";

const RoleEnum = z.enum([
  "admin",
  "employee",
  "core_subscriber",
  "ipo_subscriber",
  "research_ally_subscriber",
]);

const addUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: RoleEnum.default("employee"),
  phone: z.string().min(8, "Phone is required"),
  pan_card_number: z.string().min(5, "PAN is required"),
  address_1: z.string().min(1, "Address Line 1 is required"),
  address_2: z.string().optional().nullable(),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pin_code: z.string().min(4, "Pin code is required"),
  date_of_birth: z.string().min(4, "Date of birth is required"),
  company: z.string().optional().nullable(),
  status: z.string().optional(),
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
    defaultValues: { role: "employee" },
  });

  const mutation = useMutation<unknown, Error, AddUserFormValues>({
    mutationFn: (data) => createUser(data),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Optionally, show a success message
    },
  });

  const onSubmit = (data: AddUserFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New User</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl"
      >
        <div className="col-span-1">
          <label htmlFor="username">Username</label>
          <Input id="username" {...register("username")} />
          {errors.username && (
            <p className="text-red-600">{errors.username.message}</p>
          )}
        </div>
        <div className="col-span-1">
          <label htmlFor="email">Email</label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="first_name">First Name</label>
          <Input id="first_name" {...register("first_name")} />
          {errors.first_name && (
            <p className="text-red-600">{errors.first_name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="last_name">Last Name</label>
          <Input id="last_name" {...register("last_name")} />
          {errors.last_name && (
            <p className="text-red-600">{errors.last_name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            {...register("role")}
            className="w-full p-2 border rounded"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
            <option value="core_subscriber">Core Subscriber</option>
            <option value="ipo_subscriber">IPO Subscriber</option>
            <option value="research_ally_subscriber">
              Research Ally Subscriber
            </option>
          </select>
          {errors.role && <p className="text-red-600">{errors.role.message}</p>}
        </div>

        <div>
          <label htmlFor="phone">Phone</label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && (
            <p className="text-red-600">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="pan_card_number">PAN Card Number</label>
          <Input id="pan_card_number" {...register("pan_card_number")} />
          {errors.pan_card_number && (
            <p className="text-red-600">{errors.pan_card_number.message}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="address_1">Address Line 1</label>
          <Input id="address_1" {...register("address_1")} />
          {errors.address_1 && (
            <p className="text-red-600">{errors.address_1.message}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="address_2">Address Line 2</label>
          <Input id="address_2" {...register("address_2")} />
        </div>
        <div>
          <label htmlFor="state">State</label>
          <Input id="state" {...register("state")} />
          {errors.state && (
            <p className="text-red-600">{errors.state.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="city">City</label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-red-600">{errors.city.message}</p>}
        </div>
        <div>
          <label htmlFor="pin_code">Pin Code</label>
          <Input id="pin_code" {...register("pin_code")} />
          {errors.pin_code && (
            <p className="text-red-600">{errors.pin_code.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="date_of_birth">Date of Birth</label>
          <Input
            id="date_of_birth"
            type="date"
            {...register("date_of_birth")}
          />
          {errors.date_of_birth && (
            <p className="text-red-600">{errors.date_of_birth.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="company">Company</label>
          <Input id="company" {...register("company")} />
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            {...register("status")}
            className="w-full p-2 border rounded"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="md:col-span-2 mt-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Adding User..." : "Add User"}
          </Button>
          {mutation.isError && (
            <p className="text-red-600 mt-2">{mutation.error.message}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddUser;
