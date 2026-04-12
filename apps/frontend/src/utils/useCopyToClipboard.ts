import { useState } from "react";

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const useCopyToClipboard = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const handleCopy = (e: React.MouseEvent, id: number, url: string) => {
    e.stopPropagation();
    copyToClipboard(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return { handleCopy, copiedId };
};
