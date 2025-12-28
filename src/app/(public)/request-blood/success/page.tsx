import Link from "next/link";
import { CheckCircle, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SuccessPageProps {
    searchParams: Promise<{ tracking_id?: string }>;
}

export default async function RequestSuccessPage(props: SuccessPageProps) {
    const searchParams = await props.searchParams;
    const trackingId = searchParams.tracking_id || "N/A";

    return (
        <div className="min-h-screen bg-blood-50/50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-700">
                        অনুরোধ সফলভাবে জমা হয়েছে!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        আপনার রক্তের অনুরোধ আমরা গ্রহণ করেছি। আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।
                    </p>

                    <div className="bg-muted p-4 rounded-lg border border-dashed border-blood-200">
                        <p className="text-sm font-medium text-muted-foreground mb-1">ট্র্যাকিং আইডি</p>
                        <p className="text-2xl font-mono font-bold text-blood-700 select-all">
                            {trackingId}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            (আইডিটি সংরক্ষণ করে রাখুন)
                        </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 text-left">
                        <p className="font-semibold mb-1">পরবর্তী ধাপ:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>অ্যাডমিন আপনার অনুরোধ যাচাই করবেন।</li>
                            <li>ভলান্টিয়ার বা ডোনার খুঁজে পাওয়া গেলে আপনাকে জানানো হবে।</li>
                            <li>জরুরি হলে আমাদের হেল্পলাইন নাম্বারে কল করুন: 16xxx</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            হোম পেজ
                        </Link>
                    </Button>
                    <Button asChild className="w-full bg-blood-600 hover:bg-blood-700">
                        <Link href={`/track-request?id=${trackingId}`}>
                            স্ট্যাটাস দেখুন
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
