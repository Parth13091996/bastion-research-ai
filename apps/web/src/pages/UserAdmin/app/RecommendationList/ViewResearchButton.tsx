import { Button } from "@/components/ui/button";
import { COLORS } from "./utils";
import PricingDialogModal from "@/components/core/common/Modals/PricingDialogModal";
import { Eye, EyeClosed } from "lucide-react";


const ViewResearchButton =({
    isPaid,
    showPricingModal,
    setShowPricingModal,
    onViewResearch,
  }: {
    isPaid: boolean;
    showPricingModal: boolean;
    setShowPricingModal: (x: boolean) => void;
    onViewResearch: () => void;
  }) =>{
    return (
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          className="w-full text-sm py-2 font-semibold relative overflow-hidden"
          style={{
            borderColor: COLORS.lightGray,
            color: COLORS.white,
            background: `linear-gradient(90deg, ${COLORS.deepBlue} 0%, ${COLORS.red} 100%)`,
            boxShadow: "0 6px 18px rgba(28,40,82,0.06)",
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.boxShadow = "0 10px 26px rgba(28,40,82,0.12)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.boxShadow = "0 6px 18px rgba(28,40,82,0.06)";
          }}
          onClick={() => {
            if (isPaid) {
              setShowPricingModal(true);
            } else {
              onViewResearch();
            }
          }}
        >
          {isPaid ? (
            <EyeClosed className="h-4 w-4 mr-2 inline-block" />
          ) : (
            <Eye className="h-4 w-4 mr-2 inline-block" />
          )}
          {isPaid ? `Locked` : `View Research`}
        </Button>
        <PricingDialogModal
          showPricing={showPricingModal}
          setShowPricing={setShowPricingModal}
        />
      </div>
    );
  }
  

  export default ViewResearchButton