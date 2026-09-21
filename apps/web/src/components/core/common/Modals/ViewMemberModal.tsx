import * as Dialog from "@radix-ui/react-dialog";
import { X, FileText, Star, Loader2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { useViewMemberStore } from "@/stores/view-member-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { Badge } from "@/components/ui/badge";
import { getMembershipPlans } from "@/api/membership-api";

const formatDateForDisplay = (value?: string | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
};

const ReadOnlyField = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <div className="mt-1 p-2 bg-gray-50 border rounded text-gray-900 text-sm min-h-[38px]">
      {value || "N/A"}
    </div>
  </div>
);

const ViewMemberModal = () => {
  const { isOpen, member, close } = useViewMemberStore((s) => s);

  const { data: plans } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: () => getMembershipPlans(),
    enabled: isOpen,
  });

  const { data: pageVisits, isLoading: loadingPages } = useQuery({
    queryKey: ["user-page-visits", member?.id],
    queryFn: () =>
      member?.id
        ? axiosInstance
          .get(`/api/admin/users/${member.id}/page-visits`)
          .then((res) => res.data)
        : Promise.resolve([]),
    enabled: !!member?.id && isOpen,
  });

  const { data: recVisits, isLoading: loadingRecs } = useQuery({
    queryKey: ["user-recommendation-visits", member?.id],
    queryFn: () =>
      member?.id
        ? axiosInstance
          .get(`/api/admin/users/${member.id}/recommendation-visits`)
          .then((res) => res.data)
        : Promise.resolve([]),
    enabled: !!member?.id && isOpen,
  });

  if (!member) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[99]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-4xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg overflow-y-auto z-[99999]">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-gray-900">
              Member Details: {member.username}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                onClick={close}
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField label="First Name" value={member.first_name} />
                <ReadOnlyField label="Last Name" value={member.last_name} />
                <ReadOnlyField label="Email" value={member.email} />
                <ReadOnlyField label="Phone" value={member.phone} />
                <ReadOnlyField label="Role" value={member.role} />
                <ReadOnlyField label="Status" value={member.status} />
                <ReadOnlyField label="Company Name" value={member.company_name} />
                <ReadOnlyField label="Date of Birth" value={formatDateForDisplay(member.date_of_birth)} />
                <ReadOnlyField label="PAN Card Number" value={member.pan_card_number} />
                <ReadOnlyField label="Address Line 1" value={member.address_1} />
                <ReadOnlyField label="Address Line 2" value={member.address_2} />
                <ReadOnlyField label="City" value={member.city} />
                <ReadOnlyField label="State" value={member.state} />
                <ReadOnlyField label="Pincode" value={member.pin_code} />

                <div className="md:col-span-2 mt-4 pt-4 border-t">
                  <h3 className="font-semibold mb-2">Subscription Details</h3>
                </div>

                <ReadOnlyField
                  label="Plan"
                  value={
                    !plans && isOpen ? "Loading..." :
                      plans?.find((p: any) => String(p.plan_id) === String(member.plan_id))?.plan_name ||
                      (member.plan_id ? `ID: ${member.plan_id}` : "N/A")
                  }
                />
                <ReadOnlyField label="Start Date" value={formatDateForDisplay(member.subscription_start_date)} />
                <ReadOnlyField label="End Date" value={formatDateForDisplay(member.subscription_end_date)} />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* We can potentially add summary cards here if we pass that data in or fetch it */}
              </div>

              <div className="space-y-4">
                {/* Page Visits Section */}
                <div className="border rounded-md p-4">
                  <h3 className="flex items-center text-lg font-semibold mb-3">
                    <FileText className="mr-2 h-5 w-5" />
                    Page Visits
                  </h3>
                  {loadingPages ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : pageVisits && pageVisits.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {/* @ts-ignore */}
                      {pageVisits.map((visit, idx) => (
                        <div
                          key={`${visit.path}-${idx}`}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div className="flex-1 min-w-0 mr-2">
                            <div className="font-medium truncate">{visit.title || visit.path}</div>
                            <div className="text-xs text-gray-500 truncate">{visit.path}</div>
                          </div>
                          <Badge variant="secondary">{visit.visits}x</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No page visits recorded.</p>
                  )}
                </div>

                {/* Recommendation Visits Section */}
                <div className="border rounded-md p-4">
                  <h3 className="flex items-center text-lg font-semibold mb-3">
                    <Star className="mr-2 h-5 w-5" />
                    Recommendation Visits
                  </h3>
                  {loadingRecs ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : recVisits && recVisits.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {/* @ts-ignore */}
                      {recVisits.map((visit) => (
                        <div
                          key={visit.recommendation_id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium truncate flex-1 mr-2">
                            {visit.recommendation_title}
                          </span>
                          <Badge variant="secondary">{visit.visits}x</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No recommendations accessed.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={close}>Close</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ViewMemberModal;
