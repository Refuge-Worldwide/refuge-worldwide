import { useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    Mollie: (
      profileId: string,
      options?: { locale?: string; testmode?: boolean }
    ) => MollieInstance;
  }
}

interface MollieStyles {
  base?: {
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    "::placeholder"?: { color?: string };
  };
  valid?: { color?: string };
  invalid?: { color?: string };
}

interface MollieInstance {
  createComponent: (
    type:
      | "card"
      | "cardNumber"
      | "cardHolder"
      | "expiryDate"
      | "verificationCode",
    options?: { styles?: MollieStyles }
  ) => MollieComponent;
  createToken: () => Promise<{ token?: string; error?: { message: string } }>;
}

interface MollieComponent {
  mount: (selector: string | HTMLElement) => void;
  unmount: () => void;
  addEventListener: (event: string, callback: (state: any) => void) => void;
}

// Styles that match the site's pill-input design
export const mollieInputStyles: MollieStyles = {
  base: {
    color: "#000000",
    fontSize: "1.25rem",
    fontFamily:
      "Visuelt, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "300",
    "::placeholder": {
      color: "rgba(0, 0, 0, 0.4)",
    },
  },
  valid: {
    color: "#000000",
  },
  invalid: {
    color: "#ff0000",
  },
};

export function useMollie() {
  const [mollie, setMollie] = useState<MollieInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profileId = process.env.NEXT_PUBLIC_MOLLIE_PROFILE_ID;

    if (!profileId) {
      console.warn("NEXT_PUBLIC_MOLLIE_PROFILE_ID is not set");
      return;
    }

    // Check if script is already loaded
    if (window.Mollie) {
      const instance = window.Mollie(profileId, {
        locale: "en_US",
        testmode: process.env.NODE_ENV !== "production",
      });
      setMollie(instance);
      setIsLoaded(true);
      return;
    }

    // Load Mollie.js script
    const script = document.createElement("script");
    script.src = "https://js.mollie.com/v1/mollie.js";
    script.async = true;

    script.onload = () => {
      if (window.Mollie) {
        const instance = window.Mollie(profileId, {
          locale: "en_US",
          testmode: process.env.NODE_ENV !== "production",
        });
        setMollie(instance);
        setIsLoaded(true);
      }
    };

    script.onerror = () => {
      setError("Failed to load Mollie.js");
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const createToken = useCallback(async () => {
    if (!mollie) {
      return { error: { message: "Mollie not initialized" } };
    }
    return mollie.createToken();
  }, [mollie]);

  return { mollie, isLoaded, error, createToken };
}
