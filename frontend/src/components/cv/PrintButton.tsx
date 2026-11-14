"use client";

import { DownloadIcon } from "@/components/ui/icons";

export default function PrintButton() {
  function handlePrint() {
    const previousTitle = document.title;
    document.title = "Milchis_Catalin-Marian_CV";

    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  }

  return (
    <button type="button" onClick={handlePrint} className="btn btn-primary cv-print-btn" aria-label="Save CV as PDF">
      <DownloadIcon />
      <span className="cv-print-btn__label">Save as PDF</span>
    </button>
  );
}
