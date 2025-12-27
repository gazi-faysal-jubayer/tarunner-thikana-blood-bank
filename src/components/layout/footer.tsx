import Link from "next/link";
import { Droplet, Heart, Phone, Mail, MapPin, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-blood-950 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Droplet className="h-8 w-8 text-blood-400 fill-blood-400" />
                <Heart className="absolute -bottom-1 -right-1 h-4 w-4 text-blood-300 fill-blood-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">
                  তারুণ্যের ঠিকানা
                </span>
                <span className="text-xs text-blood-300">Blood Bank</span>
              </div>
            </div>
            <p className="text-sm text-blood-200">
              রক্তদান করুন, জীবন বাঁচান। আমরা রক্তদাতা এবং রোগীদের মধ্যে সেতুবন্ধন তৈরি করি।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">দ্রুত লিংক</h3>
            <ul className="space-y-2 text-sm text-blood-200">
              <li>
                <Link href="/request-blood" className="hover:text-white transition-colors">
                  রক্তের অনুরোধ করুন
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  রক্তদাতা হিসেবে নিবন্ধন করুন
                </Link>
              </li>
              <li>
                <Link href="/live-map" className="hover:text-white transition-colors">
                  লাইভ ম্যাপ দেখুন
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  অনুরোধ ট্র্যাক করুন
                </Link>
              </li>
            </ul>
          </div>

          {/* Blood Groups */}
          <div>
            <h3 className="font-semibold mb-4">রক্তের গ্রুপ</h3>
            <div className="grid grid-cols-4 gap-2">
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                <span
                  key={group}
                  className="text-center py-1 px-2 bg-blood-900 rounded text-xs font-medium"
                >
                  {group}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">যোগাযোগ</h3>
            <ul className="space-y-3 text-sm text-blood-200">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@tarunner-thikana.org</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="p-2 bg-blood-900 rounded-full hover:bg-blood-800 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-blood-900 rounded-full hover:bg-blood-800 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-blood-800 mt-8 pt-8 text-center text-sm text-blood-300">
          <p>© {new Date().getFullYear()} তারুণ্যের ঠিকানা Blood Bank। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
}


