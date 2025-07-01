import { useState } from 'react';

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Modern clipboard API
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';  // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);

    return success;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const useClipboard = (timeout = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    setIsCopied(success);
    if (success) {
      setTimeout(() => setIsCopied(false), timeout);
    }
    return success;
  };

  return [isCopied, handleCopy] as const;
};
