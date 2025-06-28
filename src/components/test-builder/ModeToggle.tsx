// src/components/test-builder/ModeToggle.tsx
type ModeToggleProps = {
  theme: string;
  setTheme: (theme: string) => void;
};

export function ModeToggle({ theme, setTheme }: ModeToggleProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
      <input
        type="checkbox"
        checked={theme === "dark"}
        onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
        className="form-checkbox h-4 w-4"
      />
      🌙 Dark Mode
    </label>
  );
}
