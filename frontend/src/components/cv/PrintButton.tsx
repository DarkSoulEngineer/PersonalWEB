"use client";


export default function PrintButton() {
  function handlePrint() {
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;

    const previousTitle = document.title;
    document.title = `Milchis_Resume_${stamp}.pdf`;

    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);

    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="btn btn-sm print-button"
    >
      Save PDF<span className="print-button__long">&nbsp;or print</span>
    </button>
  );
}
