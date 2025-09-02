import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Zod schema updated based on DB schema
const memberSchema = z.object({
  username: z.string().min(1, "Username is required"),
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().min(1, "Last Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  address_1: z.string().min(1, "Address is required"),
  address_2: z.string().optional(),
  pan_card_number: z.string().min(1, "PAN Card Number is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pin_code: z.string().min(1, "Pincode is required"),
  date_of_birth: z.string().min(1, "Date of Birth is required"),
  gst_number: z.string().optional(),
  company_name: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.string().optional(),
  status: z.string().optional(),
  sendSignupEmail: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMemberModal = ({ isOpen, onClose }: AddMemberModalProps) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
  });

  const mutation = useMutation({
    mutationFn: (newMember: MemberFormValues) => {
      return axiosInstance.post("/api/users", newMember);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
      reset();
    },
  });

  const onSubmit = (data: MemberFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-4xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg overflow-y-auto">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Add New Member
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Fields marked with * are required.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label>Username *</label><Input {...register("username")} />{errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}</div>
            <div><label>Email *</label><Input type="email" {...register("email")} />{errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}</div>
            <div><label>First Name *</label><Input {...register("first_name")} />{errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}</div>
            <div><label>Last Name *</label><Input {...register("last_name")} />{errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}</div>
            <div><label>Phone *</label><Input {...register("phone")} />{errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}</div>
            <div><label>PAN Card Number *</label><Input {...register("pan_card_number")} />{errors.pan_card_number && <p className="text-red-500 text-sm">{errors.pan_card_number.message}</p>}</div>
            <div><label>Address Line 1 *</label><Input {...register("address_1")} />{errors.address_1 && <p className="text-red-500 text-sm">{errors.address_1.message}</p>}</div>
            <div><label>Address Line 2</label><Input {...register("address_2")} /></div>
            <div><label>State *</label><Input {...register("state")} />{errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}</div>
            <div><label>City *</label><Input {...register("city")} />{errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}</div>
            <div><label>Pincode *</label><Input {...register("pin_code")} />{errors.pin_code && <p className="text-red-500 text-sm">{errors.pin_code.message}</p>}</div>
            <div><label>Date of Birth *</label><Input type="date" {...register("date_of_birth")} />{errors.date_of_birth && <p className="text-red-500 text-sm">{errors.date_of_birth.message}</p>}</div>
            <div><label>GST No.</label><Input {...register("gst_number")} /></div>
            <div><label>Company Name</label><Input {...register("company_name")} /></div>
            <div><label>Password *</label><Input type="password" {...register("password")} />{errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}</div>
            <div><label>Confirm Password *</label><Input type="password" {...register("confirmPassword")} />{errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}</div>

            <div className="md:col-span-1">
              <label>Role</label>
              <select {...register("role")} className="w-full p-2 border rounded"><option value="user">User</option><option value="admin">Admin</option></select>
            </div>
            <div className="md:col-span-1">
              <label>Member Status</label>
              <select {...register("status")} className="w-full p-2 border rounded"><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option></select>
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
              <input type="checkbox" id="sendEmail" {...register("sendSignupEmail")} />
              <label htmlFor="sendEmail">Send Signup Email Notification to User</label>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Adding Member..." : "Add Member"}
              </Button>
            </div>
            {mutation.isError && <p className="text-red-500 text-sm md:col-span-2">{mutation.error.message}</p>}
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
