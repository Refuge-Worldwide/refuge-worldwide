import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { RxCopy } from "react-icons/rx";
import { IoMdCheckmark } from "react-icons/io";

type DiscountCode = { label?: string; code: string };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function DiscountsContent() {
  const { data, error, isLoading } = useSWR("/api/user/discounts", fetcher);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (label: string | undefined, code: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        toast.success(
          `${label ? `${label} discount code` : "Discount code"} copied`
        );
        setCopiedCode(code);
        setTimeout(
          () => setCopiedCode((current) => (current === code ? null : current)),
          2000
        );
      },
      () => {
        toast.error("Issue copying to clipboard");
      }
    );
  };

  return (
    <div>
      {isLoading && <p className="text-small">Loading discount codes...</p>}

      {error && <p className="text-small text-red">Error loading discounts</p>}

      {data?.discountCodes?.length === 0 && (
        <div className="max-w-md border-2 border-black p-8 text-center">
          <p>No discount codes available right now.</p>
        </div>
      )}

      {data?.discountCodes?.length > 0 && (
        <ul className="max-w-md space-y-3">
          {data.discountCodes.map((entry: DiscountCode, index: number) => (
            <li
              key={`${entry.code}-${index}`}
              className="border border-black py-4 px-6 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col">
                {entry.label && (
                  <span className="text-small font-medium">{entry.label}</span>
                )}
                <span className="text-small font-mono text-black/60">
                  Code: {entry.code}
                </span>
              </div>
              <button
                onClick={() => handleCopy(entry.label, entry.code)}
                aria-label={`Copy ${
                  entry.label ? `${entry.label} ` : ""
                }discount code`}
                className="flex-shrink-0 w-10 h-10 border border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                {copiedCode === entry.code ? (
                  <IoMdCheckmark className="w-5 h-5" />
                ) : (
                  <RxCopy className="w-5 h-5" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
