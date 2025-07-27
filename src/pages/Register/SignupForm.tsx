import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";
// import { useNavigate } from 'react-router-dom'
import { CreditCard, Mail, MapPin, Phone, User } from "lucide-react";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
];

const SignupForm = () => {
  const { signUp, setActive } = useSignUp();
  const { toast } = useToast();
  // const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    emailAddress: "",
    address1: "",
    address2: "",
    panCardNumber: "",
    state: "",
    city: "",
    pinCode: "",
    dateOfBirth: "",
    gstNumber: "",
    company: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setLoading(true);
    try {
      // Create user with Clerk
      const result = await signUp.create({
        emailAddress: formData.emailAddress,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        // Store additional user data in Supabase
        const { error } = await supabase.from("users").insert({
          clerk_user_id: result.createdUserId,
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          email: formData.emailAddress,
          address_1: formData.address1,
          address_2: formData.address2,
          pan_card_number: formData.panCardNumber,
          state: formData.state,
          city: formData.city,
          pin_code: formData.pinCode,
          date_of_birth: formData.dateOfBirth,
          gst_number: formData.gstNumber || null,
          company: formData.company || null,
        });

        if (error) {
          console.error("Error storing user data:", error);
          toast({
            title: "Warning",
            description:
              "Account created but profile data could not be saved. Please update your profile.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account Created",
            description: "Your account has been successfully created!",
          });
        }

        // navigate('/')
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.errors?.[0]?.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl mx-auto !shadow-xl border-0 bg-white !rounded-xl">
        <CardHeader className="text-center pb-8 pt-8">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Please Signup
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
                required
              />
            </div>

            {/* First Name */}
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
                required
              />
            </div>

            {/* Last Name */}
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
                required
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
                required
              />
            </div>

            {/* Email Address */}
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="emailAddress"
                type="email"
                placeholder="Email Address"
                value={formData.emailAddress}
                onChange={(e) =>
                  handleInputChange("emailAddress", e.target.value)
                }
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
                required
              />
            </div>

            {/* PAN Card Number */}
            <div className="relative">
              <CreditCard className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="panCardNumber"
                placeholder="Enter PAN Card Number"
                value={formData.panCardNumber}
                onChange={(e) =>
                  handleInputChange("panCardNumber", e.target.value)
                }
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
                required
              />
            </div>

            {/* Address Line 1 */}
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="address1"
                placeholder="Address Line 1"
                value={formData.address1}
                onChange={(e) => handleInputChange("address1", e.target.value)}
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
                required
              />
            </div>

            {/* Address Line 2 */}
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="address2"
                placeholder="Address Line 2"
                value={formData.address2}
                onChange={(e) => handleInputChange("address2", e.target.value)}
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
              />
            </div>

            {/* State Dropdown */}
            <Select
              value={formData.state}
              onValueChange={(value) => handleInputChange("state", value)}
            >
              <SelectTrigger className="h-14 !text-lg border-gray-200 rounded-lg focus:border-primary">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="!w-full">
                {indianStates.map((state) => (
                  <SelectItem className=" !text-lg" key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City */}
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
                required
              />
            </div>

            {/* PIN Code */}
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="pinCode"
                placeholder="PIN Code"
                value={formData.pinCode}
                onChange={(e) => handleInputChange("pinCode", e.target.value)}
                className="pl-10 h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
                required
              />
            </div>

            {/* Date of Birth */}
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
              required
            />

            {/* GST Number */}
            <Input
              id="gstNumber"
              placeholder="GST Number (Optional)"
              value={formData.gstNumber}
              onChange={(e) => handleInputChange("gstNumber", e.target.value)}
              className="h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
            />

            {/* Company */}
            <Input
              id="company"
              placeholder="Company (Optional)"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className="h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
            />

            {/* Password */}
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="h-14 !text-lg border-gray-200 rounded-lg focus:border-primary"
              required
            />

            <Button
              type="submit"
              variant="default"
              className="w-full h-12 text-lg font-medium rounded-lg mt-6"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
