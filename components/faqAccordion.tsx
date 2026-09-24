import { ReactNode, useRef } from "react";
import { BiPlus, BiMinus } from "react-icons/bi";

export default function FaqAccordion({
  question,
  children,
}: {
  question: ReactNode;
  children: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    const content = contentRef.current;

    if (details.open) {
      content!.style.height = `${content!.scrollHeight}px`;
      setTimeout(() => {
        content!.style.height = "auto";
      }, 300);
    } else {
      content!.style.height = `${content!.scrollHeight}px`;
      setTimeout(() => {
        content!.style.height = "0px";
      }, 0);
    }
  };

  return (
    <li className="block border-b border-black">
      <details className="group faq-accordion" onToggle={handleToggle}>
        <summary className="py-5 flex items-center justify-between gap-6 cursor-pointer list-none">
          <p className="font-medium text-smedium md:text-small">{question}</p>
          <div className="flex-none">
            <BiPlus className="group-open:hidden text-medium md:text-base" />
            <BiMinus className="hidden group-open:block text-medium md:text-base" />
          </div>
        </summary>
        <div
          ref={contentRef}
          className="overflow-hidden transition-height duration-200 ease-in-out"
          style={{ height: "0px" }}
        >
          <div className="pb-6">{children}</div>
        </div>
      </details>
    </li>
  );
}
