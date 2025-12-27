import { Metadata } from "next";
import { Droplet, Clock, Shield, CheckCircle } from "lucide-react";
import { BloodRequestForm } from "@/components/forms/blood-request-form";

export const metadata: Metadata = {
  title: "রক্তের অনুরোধ করুন | তারুণ্যের ঠিকানা Blood Bank",
  description:
    "জরুরি রক্তের প্রয়োজন? লগইন ছাড়াই রক্তের অনুরোধ করুন। আমরা আপনার পাশে আছি।",
};

const benefits = [
  {
    icon: Clock,
    title: "দ্রুত সেবা",
    description: "২৪/৭ জরুরি রক্তের অনুরোধ গ্রহণ করা হয়",
  },
  {
    icon: Shield,
    title: "নিরাপদ ও যাচাইকৃত",
    description: "সকল রক্তদাতা যাচাইকৃত",
  },
  {
    icon: CheckCircle,
    title: "বিনামূল্যে",
    description: "সম্পূর্ণ বিনামূল্যে সেবা",
  },
];

export default function RequestBloodPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blood-50/50 to-white">
      {/* Hero Section */}
      <section className="bg-blood-600 text-white py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Droplet className="h-5 w-5" />
              <span>লগইন ছাড়াই অনুরোধ করুন</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              জরুরি রক্তের অনুরোধ করুন
            </h1>
            <p className="text-lg opacity-90 mb-8">
              নিচের ফর্মটি পূরণ করুন। আমরা আপনার অনুরোধ যত দ্রুত সম্ভব প্রক্রিয়া করব।
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex flex-col items-center p-4 bg-white/10 rounded-xl"
                >
                  <benefit.icon className="h-8 w-8 mb-2" />
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm opacity-80">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <BloodRequestForm />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-muted/50">
        <div className="container max-w-4xl">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">গুরুত্বপূর্ণ তথ্য</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blood-600">•</span>
                আপনার অনুরোধ জমা দেওয়ার পর একটি ট্র্যাকিং আইডি দেওয়া হবে।
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blood-600">•</span>
                এই আইডি দিয়ে আপনি যেকোনো সময় আপনার অনুরোধের স্ট্যাটাস দেখতে পারবেন।
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blood-600">•</span>
                জরুরি অনুরোধের ক্ষেত্রে আমরা অগ্রাধিকার ভিত্তিতে প্রক্রিয়া করি।
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blood-600">•</span>
                আপনার দেওয়া মোবাইল নম্বরে SMS-এ আপডেট পাঠানো হবে।
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}


