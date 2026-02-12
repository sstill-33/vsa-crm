export interface StageColorPreset {
  label: string;
  bg: string;
  text: string;
  border: string;
}

// All class names appear literally so Tailwind JIT picks them up
export const STAGE_COLOR_PRESETS: StageColorPreset[] = [
  { label: "Slate",   bg: "bg-slate-100",   text: "text-slate-700",   border: "border-slate-300" },
  { label: "Sky",     bg: "bg-sky-50",      text: "text-sky-700",     border: "border-sky-300" },
  { label: "Blue",    bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-300" },
  { label: "Indigo",  bg: "bg-indigo-50",   text: "text-indigo-700",  border: "border-indigo-300" },
  { label: "Violet",  bg: "bg-violet-50",   text: "text-violet-700",  border: "border-violet-300" },
  { label: "Purple",  bg: "bg-purple-50",   text: "text-purple-700",  border: "border-purple-300" },
  { label: "Fuchsia", bg: "bg-fuchsia-50",  text: "text-fuchsia-700", border: "border-fuchsia-300" },
  { label: "Amber",   bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-300" },
  { label: "Emerald", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-300" },
  { label: "Red",     bg: "bg-red-50",      text: "text-red-700",     border: "border-red-300" },
  { label: "Gray",    bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-300" },
  { label: "Rose",    bg: "bg-rose-50",     text: "text-rose-700",    border: "border-rose-300" },
  { label: "Teal",    bg: "bg-teal-50",     text: "text-teal-700",    border: "border-teal-300" },
  { label: "Cyan",    bg: "bg-cyan-50",     text: "text-cyan-700",    border: "border-cyan-300" },
  { label: "Lime",    bg: "bg-lime-50",     text: "text-lime-700",    border: "border-lime-300" },
  { label: "Orange",  bg: "bg-orange-50",   text: "text-orange-700",  border: "border-orange-300" },
];

export const DEFAULT_STAGE_COLORS = {
  bg: "bg-slate-100",
  text: "text-slate-700",
  border: "border-slate-300",
};
