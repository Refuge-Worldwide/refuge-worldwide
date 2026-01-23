import React from "react";

interface TocItem {
  text: string;
  id: string;
}

interface TableOfContentsProps {
  items: TocItem[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  if (!items.length) return null;
  return (
    <nav className="mb-8 p-4 bg-gray-50 border">
      <h2 className="font-bold mb-2 text-lg">Table of Contents</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-blue-600 hover:underline">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
