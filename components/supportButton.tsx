import { ReactNode, useState } from "react";
import { SupportModal } from "./supportModal";

export function SupportButton({
  className,
  children,
  showFindOutMoreLink = true,
}: {
  className?: string;
  children?: ReactNode;
  /** Set to false when this button already lives on the /support page. */
  showFindOutMoreLink?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children ?? "Become a supporter"}
      </button>
      <SupportModal
        open={open}
        onOpenChange={setOpen}
        showFindOutMoreLink={showFindOutMoreLink}
      />
    </>
  );
}
