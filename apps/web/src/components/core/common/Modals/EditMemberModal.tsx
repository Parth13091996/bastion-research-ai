import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../../api/axios";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { useEffect } from "react";
import { useEditMemberStore } from "@/stores/edit-member-store";
import { endpoints } from "@/api/endpoints";

const editMemberSchema = z.object({
  username: z.string().min(1, "Username is required"),
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().min(1, "Last Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  address_1: z.string().min(1, "Address is required"),
  address_2: z.string().optional().nullable(),
  pan_card_number: z.string().min(1, "PAN Card Number is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pin_code: z.string().min(1, "Pincode is required"),
  date_of_birth: z.string().min(1, "Date of Birth is required"),
  company_name: z.string().optional().nullable(),
  role: z.string().optional(),
  status: z.string().optional(),
});

type EditMemberValues = z.infer<typeof editMemberSchema>;

const EditMemberModal = () => {
  const queryClient = useQueryClient();
  const { isOpen, member, close } = useEditMemberStore((s) => s);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditMemberValues>({
    resolver: zodResolver(editMemberSchema),
    values: {
      username: member?.username ?? "",
      email: member?.email ?? "",
      first_name: member?.first_name ?? "",
      last_name: member?.last_name ?? "",
      phone: member?.phone ?? "",
      pan_card_number: member?.pan_card_number ?? "",
      address_1: member?.address_1 ?? "",
      address_2: member?.address_2 ?? "",
      state: member?.state ?? "",
      city: member?.city ?? "",
      pin_code: member?.pin_code ?? "",
      date_of_birth: member?.date_of_birth ?? "",
      company_name: member?.company_name ?? "",
      role: member?.role ?? "employee",
      status: member?.status ?? "active",
    },
  });

  useEffect(() => {
    if (member) {
      reset({
        username: member.username ?? "",
        email: member.email ?? "",
        first_name: member.first_name ?? "",
        last_name: member.last_name ?? "",
        phone: member.phone ?? "",
        pan_card_number: member.pan_card_number ?? "",
        address_1: member.address_1 ?? "",
        address_2: member.address_2 ?? "",
        state: member.state ?? "",
        city: member.city ?? "",
        pin_code: member.pin_code ?? "",
        date_of_birth: member.date_of_birth ?? "",
        company_name: member.company_name ?? "",
        role: member.role ?? "employee",
        status: member.status ?? "active",
      });
    }
  }, [member, reset]);

  const mutation = useMutation({
    mutationFn: (values: EditMemberValues) => {
      if (!member?.id) return Promise.reject(new Error("Missing member id"));
      return axiosInstance.put(endpoints.users.byId(member.id), values);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      close();
    },
  });

  const onSubmit = (data: EditMemberValues) => {
    mutation.mutate(data);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) close();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-4xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg overflow-y-auto">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Edit Member
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Update member details. Fields marked with * are required.
          </Dialog.Description>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label>Username *</label>
              <Input {...register("username")} />
              {errors.username && (
                <p className="text-red-500 text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label>Email *</label>
              <Input type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label>First Name *</label>
              <Input {...register("first_name")} />
              {errors.first_name && (
                <p className="text-red-500 text-sm">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div>
              <label>Last Name *</label>
              <Input {...register("last_name")} />
              {errors.last_name && (
                <p className="text-red-500 text-sm">
                  {errors.last_name.message}
                </p>
              )}
            </div>
            <div>
              <label>Phone *</label>
              <Input {...register("phone")} />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label>PAN Card Number *</label>
              <Input {...register("pan_card_number")} />
              {errors.pan_card_number && (
                <p className="text-red-500 text-sm">
                  {errors.pan_card_number.message}
                </p>
              )}
            </div>
            <div>
              <label>Address Line 1 *</label>
              <Input {...register("address_1")} />
              {errors.address_1 && (
                <p className="text-red-500 text-sm">
                  {errors.address_1.message}
                </p>
              )}
            </div>
            <div>
              <label>Address Line 2</label>
              <Input {...register("address_2")} />
            </div>
            <div>
              <label>State *</label>
              <Input {...register("state")} />
              {errors.state && (
                <p className="text-red-500 text-sm">{errors.state.message}</p>
              )}
            </div>
            <div>
              <label>City *</label>
              <Input {...register("city")} />
              {errors.city && (
                <p className="text-red-500 text-sm">{errors.city.message}</p>
              )}
            </div>
            <div>
              <label>Pincode *</label>
              <Input {...register("pin_code")} />
              {errors.pin_code && (
                <p className="text-red-500 text-sm">
                  {errors.pin_code.message}
                </p>
              )}
            </div>
            <div>
              <label>Date of Birth *</label>
              <Input type="date" {...register("date_of_birth")} />
              {errors.date_of_birth && (
                <p className="text-red-500 text-sm">
                  {errors.date_of_birth.message}
                </p>
              )}
            </div>
            <div>
              <label>Company Name</label>
              <Input {...register("company_name")} />
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
            <div className="md:col-span-1">
              <label>Member Status</label>
              <select
                {...register("status")}
                className="w-full p-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
              <Button type="button" variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            {mutation.isError && (
              <p className="text-red-500 text-sm md:col-span-2">
                {(mutation.error as any)?.message ?? "Failed to update"}
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

export default EditMemberModal;
