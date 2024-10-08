import type { ReactNode } from "react";

type ProseProps = {
  children: ReactNode;
  lg?: boolean;
};

const Prose = ({ children, lg = true }: ProseProps) => {
  return (
    <div className={`prose max-w-none ${lg && "sm:prose-lg"}`}>{children}</div>
  );
};

export default Prose;
