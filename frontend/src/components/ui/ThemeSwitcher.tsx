import {
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";

import {
  useTheme,
  type Theme,
} from "../../context/ThemeContext";

const options: {
  value: Theme;
  label: string;
  icon: typeof Sun;
}[] = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
  },
  {
    value: "aurora",
    label: "Aurora",
    icon: Sparkles,
  },
];

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="theme-switcher"
      role="group"
      aria-label="Choose interface theme"
    >
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            className={
              theme === option.value
                ? "theme-option active"
                : "theme-option"
            }
            onClick={() => setTheme(option.value)}
            aria-pressed={theme === option.value}
          >
            <Icon size={15} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
