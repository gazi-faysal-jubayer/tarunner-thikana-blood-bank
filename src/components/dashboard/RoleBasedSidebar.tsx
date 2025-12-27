"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplet,
  Heart,
  Home,
  ClipboardList,
  Users,
  UserCheck,
  MapPin,
  BarChart3,
  Settings,
  Link2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserRole = "admin" | "volunteer" | "donor";

interface UserData {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  bloodGroup?: string;
}

interface RoleBasedSidebarProps {
  user: UserData;
  isOpen: boolean;
  onClose: () => void;
}

// Menu configuration for each role
const menuConfig: Record<UserRole, Array<{ href: string; label: string; icon: any }>> = {
  admin: [
    { href: "/dashboard", label: "ড্যাশবোর্ড", icon: Home },
    { href: "/dashboard/requests", label: "সব অনুরোধ", icon: ClipboardList },
    { href: "/dashboard/donors", label: "রক্তদাতা", icon: Users },
    { href: "/dashboard/volunteers", label: "স্বেচ্ছাসেবক", icon: UserCheck },
    { href: "/dashboard/assignments", label: "অ্যাসাইনমেন্ট", icon: Link2 },
    { href: "/dashboard/map", label: "ম্যাপ ভিউ", icon: MapPin },
    { href: "/dashboard/statistics", label: "বিশ্লেষণ", icon: BarChart3 },
    { href: "/dashboard/settings", label: "সেটিংস", icon: Settings },
  ],
  volunteer: [
    { href: "/dashboard", label: "ড্যাশবোর্ড", icon: Home },
    { href: "/dashboard/requests", label: "আমার অনুরোধ", icon: ClipboardList },
    { href: "/dashboard/donors", label: "রক্তদাতা", icon: Users },
    { href: "/dashboard/assignments", label: "অ্যাসাইনমেন্ট", icon: Link2 },
    { href: "/dashboard/map", label: "ম্যাপ ভিউ", icon: MapPin },
    { href: "/dashboard/statistics", label: "আমার পরিসংখ্যান", icon: BarChart3 },
  ],
  donor: [
    { href: "/dashboard", label: "ড্যাশবোর্ড", icon: Home },
    { href: "/dashboard/requests", label: "অ্যাসাইন অনুরোধ", icon: ClipboardList },
    { href: "/dashboard/map", label: "ম্যাপ ভিউ", icon: MapPin },
    { href: "/dashboard/statistics", label: "আমার ইতিহাস", icon: BarChart3 },
    { href: "/dashboard/profile", label: "প্রোফাইল", icon: User },
  ],
};

const roleLabels: Record<UserRole, string> = {
  admin: "অ্যাডমিন",
  volunteer: "স্বেচ্ছাসেবক",
  donor: "রক্তদাতা",
};

const roleBadgeVariants: Record<UserRole, "destructive" | "default" | "secondary"> = {
  admin: "destructive",
  volunteer: "default",
  donor: "secondary",
};

export function RoleBasedSidebar({ user, isOpen, onClose }: RoleBasedSidebarProps) {
  const pathname = usePathname();
  const menuItems = menuConfig[user.role] || menuConfig.donor;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
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
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Role badge */}
      <div className="p-4 border-b">
        <Badge
          variant={roleBadgeVariants[user.role]}
          className="w-full justify-center py-1"
        >
          {roleLabels[user.role]}
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="bg-blood-100 text-blood-700">
              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          {user.bloodGroup && (
            <Badge variant="outline" className="shrink-0">
              {user.bloodGroup}
            </Badge>
          )}
        </div>
      </div>
    </aside>
  );
}


