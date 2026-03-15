import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useThemePreference } from '@/hooks/useThemePreference';
import { 
  LayoutDashboard, 
  Code, 
  Key, 
  Monitor, 
  User, 
  Palette, 
  Globe,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Users,
  TrendingUp,
  Smile,
  SlidersHorizontal,
  RefreshCw,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuSections = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'licenses', label: 'Generate Key', icon: Key },
      { id: 'manage-eas', label: 'Manage EAs', icon: Smile },
      { id: 'mentor-applications', label: 'Key Stats', icon: TrendingUp },
      { id: 'setup-methods', label: 'Control Bot', icon: SlidersHorizontal },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { id: 'profile', label: 'My Users', icon: Users },
      { id: 'appearance', label: 'Theme', icon: Palette },
      { id: 'user-management', label: 'Licences', icon: Shield },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { id: 'my-website', label: 'My Website', icon: Globe },
    ],
  },
];

export function AdminSidebar({ activeTab, onTabChange, isOpen, onToggle }: AdminSidebarProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useThemePreference();
  const navigate = useNavigate();

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-background border-r border-border z-50 transition-transform duration-300",
        "w-72 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-lg">Code Base</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggle}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {menuSections.map((section, sIdx) => (
              <div key={sIdx}>
                {section.label && (
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{section.label}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                        activeTab === item.id
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border">
            <div className="mb-3">
              <p className="font-medium text-foreground">{getDisplayName()}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <Button 
        variant="outline" 
        size="icon"
        className="fixed top-4 right-4 z-30 lg:hidden"
        onClick={onToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}
