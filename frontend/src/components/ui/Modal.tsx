import { X } from "lucide-react";

export function Modal({
  title,
  children,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-gray-950/40 p-0 sm:items-center sm:justify-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white shadow-soft sm:max-w-2xl sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="focus-ring grid h-10 w-10 place-items-center rounded-lg" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
