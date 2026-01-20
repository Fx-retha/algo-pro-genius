import { Moon, Sun, Monitor, Zap, Minus, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemePreference, themeOptions, ThemeOption } from "@/hooks/useThemePreference";

const iconMap = {
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  zap: Zap,
  minus: Minus,
  circle: Circle,
};

export function ThemeToggle() {
  const { theme, setTheme } = useThemePreference();

  const getCurrentIcon = () => {
    const currentTheme = themeOptions.find(t => t.value === theme);
    if (currentTheme?.icon === 'zap') return <Zap className="h-4 w-4" />;
    if (currentTheme?.icon === 'minus') return <Minus className="h-4 w-4" />;
    if (currentTheme?.icon === 'circle') return <Circle className="h-4 w-4" />;
    return (
      <>
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        {themeOptions.map((option) => {
          const Icon = iconMap[option.icon as keyof typeof iconMap];
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={theme === option.value ? "text-primary" : ""}
            >
              <Icon className="mr-2 h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
