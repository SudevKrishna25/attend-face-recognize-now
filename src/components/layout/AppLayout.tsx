
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  Calendar,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const NavItem = ({ href, icon: Icon, label, isActive }: NavItemProps) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 my-1 text-sidebar-foreground",
          isActive ? "bg-sidebar-accent text-accent-foreground" : "hover:bg-sidebar-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { href: '/', icon: Calendar, label: 'Dashboard' },
    { href: '/register', icon: User, label: 'Register' },
    { href: '/recognition', icon: Camera, label: 'Recognition' },
    { href: '/students', icon: Users, label: 'Students' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-4 flex items-center justify-between text-sidebar-foreground">
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-tight">Attend<span className="text-brand-500">Face</span></h1>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </Button>
        </div>
        <Separator className="bg-sidebar-border" />
        <div className="flex-1 overflow-auto p-2">
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.href}
              />
            ))}
          </nav>
        </div>
        <Separator className="bg-sidebar-border" />
        <div className="p-4">
          {!collapsed && (
            <p className="text-xs text-sidebar-foreground/60">
              AttendFace v1.0
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-auto bg-background text-foreground">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
