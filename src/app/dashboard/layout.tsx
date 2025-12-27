"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Droplet,
  Heart,
  Menu,
  Bell,
  Settings,
  LogOut,
  User,
  Loader2,
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
import { RoleBasedSidebar } from "@/components/dashboard/RoleBasedSidebar";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = "admin" | "volunteer" | "donor";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  bloodGroup?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      
      if (!response.ok) {
        // If 401, just redirect to login without throwing
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.user) {
        router.push("/login");
        return;
      }

      // Get additional data (blood group for donors)
      let bloodGroup: string | undefined;
      if (data.role === "donor") {
        const { data: donorData } = await supabase
          .from("donors")
          .select("blood_group")
          .eq("user_id", data.user.id)
          .single();
        bloodGroup = (donorData as any)?.blood_group;
      }

      setUser({
        id: data.user.id,
        name: data.user.name || data.user.email,
        email: data.user.email,
        role: data.role as UserRole,
        avatar: null,
        bloodGroup,
      });
    } catch (error) {
      console.error("Error loading user:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "লগআউট সফল",
        description: "আপনি সফলভাবে লগআউট করেছেন",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "লগআউট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "অ্যাডমিন ড্যাশবোর্ড";
      case "volunteer":
        return "স্বেচ্ছাসেবক ড্যাশবোর্ড";
      case "donor":
        return "রক্তদাতা ড্যাশবোর্ড";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blood-600 mx-auto mb-4" />
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
      <RoleBasedSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

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
            <h1 className="text-lg font-semibold">{getRoleTitle(user.role)}</h1>
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
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-blood-100 text-blood-700 text-sm">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="h-4 w-4 mr-2" />
                    প্রোফাইল
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      সেটিংস
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
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
