import { useSubscription } from "@/hooks/use-subscription";
import { getBlurStyle } from "../RecommendationList/utils";
import StockCardHeader from "../RecommendationList/StockCardHeader";
import BandUpsidePills from "../RecommendationList/BandsUpsidePills";
import TacticalProgressBar from "./ProgressBar";
import { COLORS } from "../RecommendationList/utils";

const TacticalStockCard = ({ stock }: { stock: StockData }) => {
  const { data: subscription } = useSubscription();
  const isPaid = stock?.tags !== "freemium" && !subscription?.is_premium;
  const blurStyle = getBlurStyle(isPaid);

  return (
    <div
      className="bg-white rounded-[20px] shadow-md border overflow-hidden transform transition-shadow hover:shadow-lg"
      style={{ borderColor: COLORS.lightGray, minHeight: 260 }}
    >
      <StockCardHeader stock={stock} blurStyle={blurStyle} />
      <BandUpsidePills stock={stock} />
      <TacticalProgressBar stock={stock} blurStyle={blurStyle} />
    </div>
  );
};

export default TacticalStockCard;

