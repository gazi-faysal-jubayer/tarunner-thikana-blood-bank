"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplet,
  Heart,
  Menu,
  X,
  Home,
  User,
  MapPin,
  Bell,
  Settings,
  LogOut,
  Users,
  ClipboardList,
  BarChart3,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock user data - in production, get from auth context
const mockUser = {
  name: "মোহাম্মদ রাহিম",
  email: "rahim@example.com",
  role: "donor" as const,
  avatar: null,
  bloodGroup: "A+",
};

const roleNavItems = {
  donor: [
    { href: "/dashboard/donor", label: "ড্যাশবোর্ড", icon: Home },
    { href: "/dashboard/donor/profile", label: "প্রোফাইল", icon: User },
    { href: "/dashboard/donor/requests", label: "অনুরোধ", icon: ClipboardList },
    { href: "/dashboard/donor/history", label: "ইতিহাস", icon: BarChart3 },
  ],
  volunteer: [
    { href: "/dashboard/volunteer", label: "ড্যাশবোর্ড", icon: Home },
    { href: "/dashboard/volunteer/requests", label: "অনুরোধ", icon: ClipboardList },
    { href: "/dashboard/volunteer/donors", label: "রক্তদাতা", icon: Users },
    { href: "/dashboard/volunteer/map", label: "ম্যাপ", icon: MapPin },
  ],
  admin: [
    { href: "/dashboard/admin", label: "ড্যাশবোর্ড", icon: Home },
    { href: "/dashboard/admin/requests", label: "অনুরোধ", icon: ClipboardList },
    { href: "/dashboard/admin/volunteers", label: "স্বেচ্ছাসেবক", icon: Users },
    { href: "/dashboard/admin/donors", label: "রক্তদাতা", icon: Heart },
    { href: "/dashboard/admin/analytics", label: "বিশ্লেষণ", icon: BarChart3 },
    { href: "/dashboard/admin/settings", label: "সেটিংস", icon: Settings },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine role from pathname
  const role = pathname.includes("/admin")
    ? "admin"
    : pathname.includes("/volunteer")
    ? "volunteer"
    : "donor";

  const navItems = roleNavItems[role];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <Droplet className="h-8 w-8 text-blood-600 fill-blood-600" />
              <Heart className="absolute -bottom-1 -right-1 h-4 w-4 text-blood-500 fill-blood-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-blood-700">
                তারুণ্যের ঠিকানা
              </span>
              <span className="text-xs text-muted-foreground">Blood Bank</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Role badge */}
        <div className="p-4 border-b">
          <Badge
            variant={role === "admin" ? "destructive" : role === "volunteer" ? "default" : "secondary"}
            className="w-full justify-center py-1"
          >
            <Shield className="h-3 w-3 mr-1" />
            {role === "admin"
              ? "অ্যাডমিন"
              : role === "volunteer"
              ? "স্বেচ্ছাসেবক"
              : "রক্তদাতা"}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-blood-50 text-blood-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={mockUser.avatar || undefined} />
              <AvatarFallback className="bg-blood-100 text-blood-700">
                {mockUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{mockUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {mockUser.email}
              </p>
            </div>
            {mockUser.bloodGroup && (
              <Badge variant="outline" className="shrink-0">
                {mockUser.bloodGroup}
              </Badge>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 lg:ml-0 ml-4">
            <h1 className="text-lg font-semibold">
              {role === "admin"
                ? "অ্যাডমিন ড্যাশবোর্ড"
                : role === "volunteer"
                ? "স্বেচ্ছাসেবক ড্যাশবোর্ড"
                : "রক্তদাতা ড্যাশবোর্ড"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blood-600 rounded-full" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mockUser.avatar || undefined} />
                    <AvatarFallback className="bg-blood-100 text-blood-700 text-sm">
                      {mockUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{mockUser.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {mockUser.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  প্রোফাইল
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  সেটিংস
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  লগআউট
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}


