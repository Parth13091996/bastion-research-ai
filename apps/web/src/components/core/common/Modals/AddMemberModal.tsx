import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { useModalStore } from "@/stores/modal-store";
import { createUser } from "@/api/users-api";
import { getMembershipPlans } from "@/api/membership-api";

const RoleEnum = z.enum([
  "admin",
  "employee",
  "core_subscriber",
  "ipo_subscriber",
  "research_ally_subscriber",
]);

// SCHEMA - matched to AddUser.tsx (with confirmPassword and sendSignupEmail if desired)
const memberSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Passwords must match"),
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
    plan_id: z.string().optional().nullable(),
    subscription_start_date: z.string().optional().nullable(),
    subscription_end_date: z.string().optional().nullable(),
    sendSignupEmail: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type MemberFormValues = z.infer<typeof memberSchema>;

const AddMemberModal = () => {
  const queryClient = useQueryClient();
  const isOpen = useModalStore((s) => s.modals.addMember);
  const setOpen = useModalStore((s) => s.set);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { role: "employee" },
  });

  // Fetch membership plans (from AddUser)
  const { data: plans } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: () => getMembershipPlans(),
  });

  const subscriptionPlans =
    plans?.filter(
      (p: any) =>
        p?.plan_code === "freemium" ||
        p?.plan_code === "core" ||
        p?.plan_code === "core_annual"
    ) || [];

  const onClose = () => setOpen("addMember", false);

  const mutation = useMutation<unknown, Error, MemberFormValues>({
    mutationFn: (data) => {
      // Prepare form data for API
      const payload: any = { ...data };

      if (!payload.plan_id) {
        delete payload.plan_id;
      } else {
        payload.plan_id = String(payload.plan_id);
      }
      if (!payload.subscription_start_date) {
        delete payload.subscription_start_date;
      }
      if (!payload.subscription_end_date) {
        delete payload.subscription_end_date;
      }

      // Remove confirmPassword before sending to API
      delete payload.confirmPassword;
      // Optionally, remove sendSignupEmail if API does not need it:
      if (typeof payload.sendSignupEmail === "undefined")
        delete payload.sendSignupEmail;

      return createUser(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
      reset();
      // Show a success message (optional)
    },
  });

  const onSubmit = (data: MemberFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-4xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg overflow-y-auto z-[99999]">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Add New Member
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Fields marked with * are required.
          </Dialog.Description>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl"
          >
            <div className="col-span-1">
              <label htmlFor="username">Username *</label>
              <Input id="username" {...register("username")} />
              {errors.username && (
                <p className="text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div className="col-span-1">
              <label htmlFor="email">Email *</label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="first_name">First Name *</label>
              <Input id="first_name" {...register("first_name")} />
              {errors.first_name && (
                <p className="text-red-600">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name">Last Name *</label>
              <Input id="last_name" {...register("last_name")} />
              {errors.last_name && (
                <p className="text-red-600">{errors.last_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password">Password *</label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-600">{errors.confirmPassword.message}</p>
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
              {errors.role && (
                <p className="text-red-600">{errors.role.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone">Phone *</label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-red-600">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="pan_card_number">PAN Card Number *</label>
              <Input id="pan_card_number" {...register("pan_card_number")} />
              {errors.pan_card_number && (
                <p className="text-red-600">{errors.pan_card_number.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address_1">Address Line 1 *</label>
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
              <label htmlFor="state">State *</label>
              <Input id="state" {...register("state")} />
              {errors.state && (
                <p className="text-red-600">{errors.state.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="city">City *</label>
              <Input id="city" {...register("city")} />
              {errors.city && (
                <p className="text-red-600">{errors.city.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="pin_code">Pin Code *</label>
              <Input id="pin_code" {...register("pin_code")} />
              {errors.pin_code && (
                <p className="text-red-600">{errors.pin_code.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="date_of_birth">Date of Birth *</label>
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
            <div>
              <label htmlFor="plan_id">Subscription Plan</label>
              <select
                id="plan_id"
                {...register("plan_id")}
                className="w-full p-2 border rounded"
              >
                <option value="">No Plan</option>
                {subscriptionPlans.map((plan: any) => (
                  <option key={plan.plan_id} value={String(plan.plan_id)}>
                    {plan.plan_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subscription_start_date">
                Subscription Start Date
              </label>
              <Input
                id="subscription_start_date"
                type="date"
                {...register("subscription_start_date")}
              />
            </div>
            <div>
              <label htmlFor="subscription_end_date">
                Subscription End Date
              </label>
              <Input
                id="subscription_end_date"
                type="date"
                {...register("subscription_end_date")}
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Adding Member..." : "Add Member"}
              </Button>
            </div>
            {mutation.isError && (
              <p className="text-red-600 mt-2 md:col-span-2">
                {mutation.error.message}
              </p>
            )}
          </form>
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddMemberModal;
