export function PaymentFailedNotice({
  onManage,
  isLoading,
}: {
  onManage: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="border-2 border-red bg-red/5 p-4 sm:p-6 mb-6">
      <p className="text-small font-medium text-red mb-2">Payment failed</p>
      <p className="text-small mb-4">
        We couldn&apos;t process your last payment. Update your payment method
        to keep your support active.
      </p>
      <button
        onClick={onManage}
        disabled={isLoading}
        className="bg-red text-white py-3 px-6 text-small hover:bg-red/80 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "Update Payment Method ↗"}
      </button>
    </div>
  );
}
