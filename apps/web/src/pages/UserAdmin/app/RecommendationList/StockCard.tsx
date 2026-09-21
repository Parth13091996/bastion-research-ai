import { userCompanyAnalytics } from "@/api/recommendations-apis";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS, getBlurStyle, getGainPercent, getLossPercent, isExited } from "./utils";
import StockCardHeader from "./StockCardHeader";
import BandUpsidePills from "./BandsUpsidePills";
import ProgressBar from "./ProgressBar";
import ViewResearchButton from "./ViewResearchButton";
import { useSubscription } from "@/hooks/use-subscription";


const StockCard = ({ stock }: { stock: StockData }) => {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  // "Paid" logic: lock non-freemium stocks for users without an active premium subscription
  const isPaid = stock?.tags !== "freemium" && !subscription?.is_premium;
  const [showPricingModal, setShowPricingModal] = useState(false);
  const navigate = useNavigate();

  const exited = isExited(stock);

  // Helper to safely get exit price from performance array if available
  const getExitPriceFromPerf = () => {
    // Cast to any to access potential stock_performance_url if not in Type
    const perfData = (stock as any).stock_performance_url;
    if (Array.isArray(perfData)) {
      // Look for the first entry with a valid exit_price
      const exitItem = perfData.find((p: any) => p.exit_price && !isNaN(Number(p.exit_price)));
      if (exitItem) return Number(exitItem.exit_price);
    }
    return null;
  };

  const exitPriceFromPerf = getExitPriceFromPerf();

  // If exited, prefer: performance exit price > cmpOrExitPrice > cmp
  const effectiveCmp = exited
    ? (exitPriceFromPerf ?? (stock.cmpOrExitPrice ? Number(stock.cmpOrExitPrice) : Number(stock.cmp ?? 0)))
    : Number(stock.cmp ?? 0);

  const priceLabel = exited ? "Exit Price" : "CMP";

  const gainPercent = getGainPercent(
    effectiveCmp,
    Number(stock.entryPrice ?? 0),
    Number(stock.target1 ?? 0)
  );
  const lossPercent = getLossPercent(
    effectiveCmp,
    Number(stock.entryPrice ?? 0)
  );
  const blurStyle = getBlurStyle(isPaid);

  function handleViewResearch() {
    userCompanyAnalytics(stock.code, user?.id);
    navigate(`/user/app/view-research/${stock.code}`);
  }

  return (
    <div
      className="bg-white rounded-[20px] shadow-md border overflow-hidden transform transition-shadow hover:shadow-lg"
      style={{ borderColor: COLORS.lightGray, minHeight: 260 }}
    >
      <StockCardHeader stock={stock} blurStyle={blurStyle} />
      <BandUpsidePills stock={stock} />
      <ProgressBar
        stock={stock}
        gainPercent={gainPercent}
        lossPercent={lossPercent}
        blurStyle={blurStyle}
        currentPrice={effectiveCmp}
        priceLabel={priceLabel}
      />
      <ViewResearchButton
        isPaid={isPaid}
        showPricingModal={showPricingModal}
        setShowPricingModal={setShowPricingModal}
        onViewResearch={handleViewResearch}
      />
    </div>
  );
};

export default StockCard;
