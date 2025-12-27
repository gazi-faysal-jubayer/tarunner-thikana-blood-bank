import Link from "next/link";
import {
  Droplet,
  Heart,
  MapPin,
  Clock,
  Users,
  Shield,
  ArrowRight,
  Phone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const stats = [
  { label: "রক্তদাতা", value: "১০,০০০+", icon: Users },
  { label: "সফল অনুরোধ", value: "৫,০০০+", icon: Heart },
  { label: "জেলা", value: "৬৪", icon: MapPin },
  { label: "২৪/৭", value: "সেবা", icon: Clock },
];

const features = [
  {
    title: "জরুরি রক্তের অনুরোধ",
    description: "লগইন ছাড়াই জরুরি রক্তের অনুরোধ জমা দিন। আমরা আপনার পাশে আছি।",
    icon: Droplet,
    href: "/request-blood",
    color: "bg-blood-100 text-blood-700",
  },
  {
    title: "লাইভ ম্যাপ",
    description: "রিয়েল-টাইম ম্যাপে সক্রিয় রক্তের অনুরোধ এবং রক্তদাতাদের দেখুন।",
    icon: MapPin,
    href: "/live-map",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "অনুরোধ ট্র্যাক করুন",
    description: "আপনার রক্তের অনুরোধের স্ট্যাটাস ট্র্যাকিং আইডি দিয়ে দেখুন।",
    icon: Search,
    href: "/track",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "রক্তদাতা হন",
    description: "নিবন্ধন করুন এবং জীবন বাঁচাতে সাহায্য করুন। প্রতিটি ফোঁটা গুরুত্বপূর্ণ।",
    icon: Heart,
    href: "/register",
    color: "bg-purple-100 text-purple-700",
  },
];

const recentRequests = [
  {
    bloodGroup: "A+",
    location: "ঢাকা মেডিকেল কলেজ",
    urgency: "critical" as const,
    timeAgo: "৫ মিনিট আগে",
  },
  {
    bloodGroup: "O-",
    location: "স্কয়ার হাসপাতাল, ঢাকা",
    urgency: "urgent" as const,
    timeAgo: "১৫ মিনিট আগে",
  },
  {
    bloodGroup: "B+",
    location: "চট্টগ্রাম মেডিকেল কলেজ",
    urgency: "normal" as const,
    timeAgo: "৩০ মিনিট আগে",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blood-50 via-white to-blood-100">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blood-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blood-300 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="container relative py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blood-100 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blood-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blood-600"></span>
                </span>
                <span className="text-sm font-medium text-blood-700">
                  ২৪/৭ জরুরি রক্ত সেবা
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-blood-600">রক্তদান</span> করুন,
                <br />
                <span className="text-foreground">জীবন বাঁচান</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                বাংলাদেশের সবচেয়ে বড় রক্তদান প্ল্যাটফর্ম। জরুরি রক্তের প্রয়োজনে আমরা আপনার
                পাশে। লগইন ছাড়াই রক্তের অনুরোধ করুন।
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="blood" size="xl" asChild>
                  <Link href="/request-blood">
                    <Droplet className="h-5 w-5 mr-2" />
                    রক্ত চাই
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="bloodOutline" size="xl" asChild>
                  <Link href="/register">
                    <Heart className="h-5 w-5 mr-2" />
                    রক্তদাতা হন
                  </Link>
                </Button>
              </div>

              {/* Quick Track */}
              <div className="flex items-center gap-2 max-w-md">
                <Input
                  placeholder="ট্র্যাকিং আইডি (যেমন: BLD-20241226-A1B2)"
                  className="flex-1"
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Blood Groups Grid */}
            <div className="relative">
              <div className="grid grid-cols-4 gap-3">
                {bloodGroups.map((group, index) => (
                  <div
                    key={group}
                    className="aspect-square flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg border border-blood-100 hover:border-blood-300 hover:shadow-xl transition-all cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative">
                      <Droplet className="h-8 w-8 text-blood-600 fill-blood-100 group-hover:fill-blood-200 transition-colors" />
                    </div>
                    <span className="mt-2 font-bold text-lg text-blood-700">
                      {group}
                    </span>
                  </div>
                ))}
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border animate-bounce">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">নিরাপদ ও বিশ্বস্ত</p>
                    <p className="text-xs text-muted-foreground">১০০% যাচাইকৃত</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-blood-600">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center text-white"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">আমাদের সেবাসমূহ</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              রক্তদাতা এবং রোগীদের মধ্যে সেতুবন্ধন তৈরি করতে আমরা প্রতিশ্রুতিবদ্ধ
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Requests Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">সাম্প্রতিক অনুরোধ</h2>
              <p className="text-muted-foreground">
                এই মুহূর্তে যেসব রক্তের অনুরোধ সক্রিয় আছে
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/live-map">
                সব দেখুন
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentRequests.map((request, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className="w-20 bg-blood-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {request.bloodGroup}
                      </span>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={request.urgency}>
                          {request.urgency === "critical"
                            ? "জরুরি"
                            : request.urgency === "urgent"
                            ? "দ্রুত"
                            : "সাধারণ"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {request.timeAgo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{request.location}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blood-600 to-blood-700">
        <div className="container text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            আজই রক্তদাতা হিসেবে যোগ দিন
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            প্রতিটি রক্তদান তিনটি জীবন বাঁচাতে পারে। আপনার একটি ছোট পদক্ষেপ কারো জীবন
            বদলে দিতে পারে।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="bg-white text-blood-600 hover:bg-blood-50"
              asChild
            >
              <Link href="/register">
                <Heart className="h-5 w-5 mr-2" />
                রক্তদাতা হন
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/request-blood">
                <Phone className="h-5 w-5 mr-2" />
                জরুরি সাহায্য
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}



