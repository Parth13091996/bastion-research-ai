import { Link } from "react-router-dom";
import Modal from "../../Modal";

const PricingDialogModal = ({ showPricing, setShowPricing }) => {
  return (
    <Modal
      open={showPricing}
      onOpenChange={setShowPricing}
      title={"Premium Access"}
      className="max-w-md"
    >
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Upgrade Required
        </h3>
        <p className="text-sm text-gray-600">
          Access all recommendations and premium research by subscribing to
          Bastion Research Core.
        </p>
        <Link
          to="/user/app/account/subscription"
          className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-full"
        >
          View Plans / Subscribe
        </Link>
      </div>
    </Modal>
  );
};

export default PricingDialogModal;
