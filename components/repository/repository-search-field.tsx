import { cx } from "@/lib/utils";

interface RepositorySearchFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  wrapperClassName?: string;
  inputClassName?: string;
}

export function RepositorySearchField({
  id,
  label,
  value,
  placeholder,
  onChange,
  wrapperClassName,
  inputClassName,
}: RepositorySearchFieldProps) {
  return (
    <label
      className={cx("flex flex-col gap-2.5", wrapperClassName)}
      htmlFor={id}
    >
      <span className="text-primary-label">{label}</span>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cx("input-base pl-9", inputClassName)}
        />
      </div>
    </label>
  );
}
