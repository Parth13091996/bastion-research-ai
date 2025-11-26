import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(8, "Phone number looks too short"),
  date_of_birth: z.string().optional(), // from <input type="date" /> => YYYY-MM-DD
  pan_card_number: z.string().optional(),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pin_code: z.string().optional(),
  company: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const EditProfile = () => {
  const { user, refetchUser, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      date_of_birth: "",
      pan_card_number: "",
      address_1: "",
      address_2: "",
      state: "",
      city: "",
      pin_code: "",
      company: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        // Ensure date fits input type="date" as YYYY-MM-DD
        date_of_birth: user.date_of_birth
          ? String(user.date_of_birth).split("T")[0]
          : "",
        pan_card_number: user.pan_card_number || "",
        address_1: user.address_1 || "",
        address_2: user.address_2 || "",
        state: user.state || "",
        city: user.city || "",
        pin_code: user.pin_code || "",
        company: user.company || "",
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: async (payload: ProfileFormValues) => {
      if (!user?.id) throw new Error("User not loaded");
      // Send only provided fields; backend already whitelists
      const res = await axiosInstance.put(`/api/users/${user.id}`, payload);
      return res.data;
    },
    onSuccess: async () => {
      toast.success("Profile updated successfully");
      await refetchUser();
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err?.message || "Update failed";
      toast.error(msg);
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    // Normalize date_of_birth to YYYY-MM-DD if present
    const payload = {
      ...data,
      date_of_birth: data.date_of_birth
        ? data.date_of_birth.split("T")[0]
        : undefined,
    } as ProfileFormValues;
    mutation.mutate(payload);
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const downloadDigioDocumentHandler = async () => {
    if (
      !user ||
      !user.digio_documents ||
      !Array.isArray(user.digio_documents) ||
      user.digio_documents.length === 0
    ) {
      return;
    }
    const documentId = user.digio_documents[0]?.document_id;
    if (!documentId) {
      return;
    }
    try {
      const response = await axiosInstance.get(
        `/api/digio/esign/${documentId}/download`,
        { responseType: "blob" }
      );
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to download Digio document.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
          <CardDescription>
            Update your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" {...register("first_name")} />
                {errors.first_name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" {...register("last_name")} />
                {errors.last_name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username")} />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register("date_of_birth")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pan_card_number">PAN Card Number</Label>
                <Input id="pan_card_number" {...register("pan_card_number")} />
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !user ||
                    !user.digio_documents ||
                    !Array.isArray(user.digio_documents) ||
                    user.digio_documents.length === 0
                  }
                  onClick={downloadDigioDocumentHandler}
                >
                  Download Digio Document
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register("company")} />
              </div>
              <div>
                <Label htmlFor="address_1">Address Line 1</Label>
                <Input id="address_1" {...register("address_1")} />
              </div>
              <div>
                <Label htmlFor="address_2">Address Line 2</Label>
                <Input id="address_2" {...register("address_2")} />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("state")} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
              </div>
              <div>
                <Label htmlFor="pin_code">PIN Code</Label>
                <Input id="pin_code" {...register("pin_code")} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={mutation.isPending}>
                {"Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  user &&
                  reset({
                    username: user.username || "",
                    email: user.email || "",
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    phone: user.phone || "",
                    date_of_birth: user.date_of_birth
                      ? String(user.date_of_birth).split("T")[0]
                      : "",
                    pan_card_number: user.pan_card_number || "",
                    address_1: user.address_1 || "",
                    address_2: user.address_2 || "",
                    state: user.state || "",
                    city: user.city || "",
                    pin_code: user.pin_code || "",
                    company: user.company || "",
                  })
                }
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
