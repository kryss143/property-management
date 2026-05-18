import { clsx } from "clsx";

const tones: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  paid: "bg-emerald-100 text-emerald-800",
  available: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  occupied: "bg-sky-100 text-sky-800",
  pending: "bg-amber-100 text-amber-800",
  partial: "bg-amber-100 text-amber-800",
  upcoming: "bg-violet-100 text-violet-800",
  open: "bg-rose-100 text-rose-800",
  urgent: "bg-rose-100 text-rose-800",
  high: "bg-orange-100 text-orange-800",
  in_progress: "bg-blue-100 text-blue-800",
  overdue: "bg-rose-100 text-rose-800",
  maintenance: "bg-orange-100 text-orange-800",
  expired: "bg-gray-200 text-gray-700",
  inactive: "bg-gray-200 text-gray-700",
  cancelled: "bg-gray-200 text-gray-700"
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        tones[value] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
