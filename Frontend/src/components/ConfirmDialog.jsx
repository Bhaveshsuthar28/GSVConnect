import { useEffect } from "react";

const noop = () => {};

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm = noop,
  onCancel = noop,
  confirmVariant = "danger", // "danger" | "primary"
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClassName =
    confirmVariant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
      : "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 dark:bg-slate-900 dark:border-slate-700"
      >
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {message}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 text-slate-800 hover:bg-slate-100 transition dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${confirmClassName}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
