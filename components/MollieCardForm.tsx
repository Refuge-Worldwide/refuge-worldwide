import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useMollie, mollieInputStyles } from "@/hooks/useMollie";

interface MollieCardFormProps {
  onValidChange?: (isValid: boolean) => void;
  onError?: (error: string | null) => void;
  disabled?: boolean;
}

export interface MollieCardFormRef {
  createToken: () => Promise<{ token?: string; error?: { message: string } }>;
  isValid: boolean;
}

const MollieCardForm = forwardRef<MollieCardFormRef, MollieCardFormProps>(
  ({ onValidChange, onError, disabled = false }, ref) => {
    const { mollie, isLoaded, error: mollieError, createToken } = useMollie();
    const cardHolderRef = useRef<HTMLDivElement>(null);
    const cardNumberRef = useRef<HTMLDivElement>(null);
    const expiryDateRef = useRef<HTMLDivElement>(null);
    const verificationCodeRef = useRef<HTMLDivElement>(null);
    const [cardMounted, setCardMounted] = useState(false);
    const cardComponentsRef = useRef<any[]>([]);
    const [fieldStates, setFieldStates] = useState({
      cardHolder: { valid: false, touched: false, error: "" },
      cardNumber: { valid: false, touched: false, error: "" },
      expiryDate: { valid: false, touched: false, error: "" },
      verificationCode: { valid: false, touched: false, error: "" },
    });

    const isValid =
      fieldStates.cardHolder.valid &&
      fieldStates.cardNumber.valid &&
      fieldStates.expiryDate.valid &&
      fieldStates.verificationCode.valid;

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      createToken,
      isValid,
    }));

    // Notify parent of validity changes
    useEffect(() => {
      onValidChange?.(isValid);
    }, [isValid, onValidChange]);

    useEffect(() => {
      if (
        isLoaded &&
        mollie &&
        cardHolderRef.current &&
        cardNumberRef.current &&
        expiryDateRef.current &&
        verificationCodeRef.current &&
        !cardMounted
      ) {
        const componentOptions = { styles: mollieInputStyles };

        const cardHolder = mollie.createComponent(
          "cardHolder",
          componentOptions
        );
        const cardNumber = mollie.createComponent(
          "cardNumber",
          componentOptions
        );
        const expiryDate = mollie.createComponent(
          "expiryDate",
          componentOptions
        );
        const verificationCode = mollie.createComponent(
          "verificationCode",
          componentOptions
        );

        cardHolder.mount(cardHolderRef.current);
        cardNumber.mount(cardNumberRef.current);
        expiryDate.mount(expiryDateRef.current);
        verificationCode.mount(verificationCodeRef.current);

        const fields = [
          { component: cardHolder, name: "cardHolder" as const },
          { component: cardNumber, name: "cardNumber" as const },
          { component: expiryDate, name: "expiryDate" as const },
          { component: verificationCode, name: "verificationCode" as const },
        ];

        fields.forEach(({ component, name }) => {
          component.addEventListener("change", (event: any) => {
            setFieldStates((prev) => ({
              ...prev,
              [name]: {
                valid: !event.error && event.complete,
                touched: true,
                error: event.error?.message || "",
              },
            }));
            if (event.error) {
              onError?.(event.error.message);
            } else {
              onError?.(null);
            }
          });
        });

        cardComponentsRef.current = [
          cardHolder,
          cardNumber,
          expiryDate,
          verificationCode,
        ];
        setCardMounted(true);
      }

      return () => {
        if (cardComponentsRef.current.length > 0) {
          cardComponentsRef.current.forEach((component) => component.unmount());
          cardComponentsRef.current = [];
        }
      };
    }, [isLoaded, mollie, cardMounted, onError]);

    if (mollieError) {
      return (
        <div className="text-red text-small">
          Payment form unavailable: {mollieError}
        </div>
      );
    }

    if (!process.env.NEXT_PUBLIC_MOLLIE_PROFILE_ID) {
      return null;
    }

    return (
      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        {!isLoaded ? (
          <p className="text-small text-black/50">Loading payment form...</p>
        ) : (
          <div className="space-y-4">
            {/* Card Holder */}
            <div>
              <label className="mb-2 inline-block">Cardholder Name</label>
              <div ref={cardHolderRef} className="pill-input min-h-[3.5rem]" />
              {fieldStates.cardHolder.touched &&
                fieldStates.cardHolder.error && (
                  <p className="text-red text-small mt-1">
                    {fieldStates.cardHolder.error}
                  </p>
                )}
            </div>

            {/* Card Number */}
            <div>
              <label className="mb-2 inline-block">Card Number</label>
              <div ref={cardNumberRef} className="pill-input min-h-[3.5rem]" />
              {fieldStates.cardNumber.touched &&
                fieldStates.cardNumber.error && (
                  <p className="text-red text-small mt-1">
                    {fieldStates.cardNumber.error}
                  </p>
                )}
            </div>

            {/* Expiry Date and CVC in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 inline-block">Expiry Date</label>
                <div
                  ref={expiryDateRef}
                  className="pill-input min-h-[3.5rem]"
                />
                {fieldStates.expiryDate.touched &&
                  fieldStates.expiryDate.error && (
                    <p className="text-red text-small mt-1">
                      {fieldStates.expiryDate.error}
                    </p>
                  )}
              </div>
              <div>
                <label className="mb-2 inline-block">CVC</label>
                <div
                  ref={verificationCodeRef}
                  className="pill-input min-h-[3.5rem]"
                />
                {fieldStates.verificationCode.touched &&
                  fieldStates.verificationCode.error && (
                    <p className="text-red text-small mt-1">
                      {fieldStates.verificationCode.error}
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MollieCardForm.displayName = "MollieCardForm";
export default MollieCardForm;
