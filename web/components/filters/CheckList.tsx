"use client";

type CheckListProps = {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** ใช้ในแผ่นล่างบนมือถือ: แถวสูงขึ้นให้แตะง่าย */
  large?: boolean;
};

export function CheckList({ options, selected, onChange, large = false }: CheckListProps) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);

  return (
    <ul className={large ? "" : "max-h-64 overflow-y-auto"}>
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <li key={opt}>
            <label
              className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 transition-colors hover:bg-surface-2 ${
                large ? "min-h-11 py-2" : "min-h-9 py-1.5"
              } ${checked ? "text-ink" : "text-ink-2"}`}
            >
              <input type="checkbox" checked={checked} onChange={() => toggle(opt)} className="h-4 w-4 shrink-0 accent-brand" />
              <span className="leading-5">{opt}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
