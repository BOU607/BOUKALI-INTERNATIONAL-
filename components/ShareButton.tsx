"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/components/LanguageProvider";

type ShareButtonProps = {
  title: string;
  url: string;
  text?: string;
  className?: string;
};

export function ShareButton({ title, url, text, className = "" }: ShareButtonProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined" && url.startsWith("/") ? window.location.origin + url : url;
  const shareText = text || title;

  const handleClick = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: fullUrl,
        });
        setOpen(false);
        return;
      } catch {
        /* fall through to dropdown */
      }
    }
    setOpen((o) => !o);
  }, [title, shareText, fullUrl]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullUrl]);

  const shareWhatsApp = useCallback(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + fullUrl)}`, "_blank", "noopener");
    setOpen(false);
  }, [shareText, fullUrl]);

  const shareFacebook = useCallback(() => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, "_blank", "noopener");
    setOpen(false);
  }, [fullUrl]);

  const shareTwitter = useCallback(() => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
      "_blank",
      "noopener"
    );
    setOpen(false);
  }, [title, fullUrl]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        className="btn-ghost text-sm inline-flex items-center gap-2"
        aria-label={t("share.label")}
      >
        <span aria-hidden className="text-lg">⎘</span>
        {t("share.share")}
      </button>
      {open && (
        <>
          <div className="absolute top-full left-0 mt-1 z-20 rounded-xl border border-ink-800 bg-ink-950 shadow-xl p-2 min-w-[180px]">
            <button
              type="button"
              onClick={copyLink}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-200 hover:bg-ink-800"
            >
              {copied ? t("share.copied") : t("share.copyLink")}
            </button>
            <button
              type="button"
              onClick={shareWhatsApp}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-200 hover:bg-ink-800"
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={shareFacebook}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-200 hover:bg-ink-800"
            >
              Facebook
            </button>
            <button
              type="button"
              onClick={shareTwitter}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-200 hover:bg-ink-800"
            >
              X (Twitter)
            </button>
          </div>
          <button
            type="button"
            className="fixed inset-0 z-10"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
        </>
      )}
    </div>
  );
}
