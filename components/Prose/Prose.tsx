import type { ReactNode } from "react";

type ProseProps = {
  children: ReactNode;
};

const Prose = ({ children }: ProseProps) => {
  return <div className="prose max-w-none sm:prose-lg">{children}</div>;
};

export default Prose;
