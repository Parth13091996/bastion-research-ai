import { userCompanyAnalytics } from "@/api/recommendations-apis";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS, getBlurStyle, getGainPercent, getLossPercent } from "./utils";
import StockCardHeader from "./StockCardHeader";
import BandUpsidePills from "./BandsUpsidePills";
import ProgressBar from "./ProgressBar";
import ViewResearchButton from "./ViewResearchButton";


const StockCard = ({ stock }: { stock: StockData }) => {
  const { user } = useAuth();
  // "Paid" logic: locked if not on free plan and not tagged "freemium"
  const isPaid =
    stock?.tags !== "freemium" && (!user?.plan_id || user?.plan_id === 1);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const navigate = useNavigate();

  const gainPercent = getGainPercent(
    Number(stock.cmp ?? 0), 
    Number(stock.entryPrice ?? 0), 
    Number(stock.target1 ?? 0)
  );
  const lossPercent = getLossPercent(
    Number(stock.cmp ?? 0),
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
