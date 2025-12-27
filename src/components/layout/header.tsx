"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Droplet, MapPin, Heart, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "হোম", labelEn: "Home" },
  { href: "/request-blood", label: "রক্ত চাই", labelEn: "Request Blood" },
  { href: "/live-map", label: "লাইভ ম্যাপ", labelEn: "Live Map" },
  { href: "/track", label: "ট্র্যাক করুন", labelEn: "Track" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <Droplet className="h-8 w-8 text-blood-600 fill-blood-600" />
            <Heart className="absolute -bottom-1 -right-1 h-4 w-4 text-blood-500 fill-blood-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-blood-700">
              তারুণ্যের ঠিকানা
            </span>
            <span className="text-xs text-muted-foreground">Blood Bank</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blood-600",
                pathname === item.href
                  ? "text-blood-600"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <User className="h-4 w-4 mr-2" />
              লগইন
            </Link>
          </Button>
          <Button variant="blood" size="sm" asChild>
            <Link href="/register">রক্তদাতা হন</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-blood-50 text-blood-600"
                    : "hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-4 px-4">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/login">লগইন</Link>
              </Button>
              <Button variant="blood" className="flex-1" asChild>
                <Link href="/register">রক্তদাতা হন</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}


