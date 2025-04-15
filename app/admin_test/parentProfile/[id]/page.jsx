"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { parentsData } from "../../data/parentsData";

export default function ParentProfile({ params }) {
  const { id } = params;
  const router = useRouter();
  const parent = parentsData.find((p) => p.key === id);

  if (!parent) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center bg-background">
        <Card className="bg-background border-border shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-text text-2xl">
              Parent Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShadcnButton
              onClick={() => router.push("/admin_test/parents")}
              className="bg-secondary hover:bg-accent text-background transition-all duration-300"
            >
              Back to Parents
            </ShadcnButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Unique styling based on ID
  const isEvenId = parseInt(id) % 2 === 0;
  const accentColor =
    parseInt(id) % 3 === 0
      ? "#1ABC9C"
      : parseInt(id) % 3 === 1
      ? "#4FD1C5"
      : "#F59E0B";
  const layoutClass = isEvenId
    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
    : "space-y-6";

  return (
    <div className="p-4 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-text animate-fade-in">
          Parent Profile
        </h1>
        <Card className="bg-background border-border shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="relative">
            <div
              className="h-32 w-full"
              style={{
                background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}55)`,
              }}
            />
            <Avatar className="absolute top-16 left-6 w-24 h-24 border-4 border-background shadow-lg transform transition-all duration-300 hover:scale-105">
              <AvatarImage
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                alt={parent.name}
              />
              <AvatarFallback className="bg-secondary text-background text-2xl">
                {parent.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardHeader className="pt-16">
            <CardTitle className="text-2xl font-semibold text-text">
              {parent.name}
            </CardTitle>
          </CardHeader>
          <CardContent className={layoutClass}>
            <div className="space-y-4 animate-slide-up">
              <div>
                <span className="font-semibold text-text">Email:</span>
                <p className="text-text mt-1">{parent.email}</p>
              </div>
              <div>
                <span className="font-semibold text-text">Phone:</span>
                <p
                  className="text-text mt-1 font-bold"
                  style={{ color: accentColor }}
                >
                  {parent.phone}
                </p>
              </div>
            </div>
            <div
              className="space-y-4 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div>
                <span className="font-semibold text-text">Address:</span>
                <p className="text-text mt-1">{parent.address}</p>
              </div>
            </div>
          </CardContent>
          <CardContent>
            <ShadcnButton
              onClick={() => router.push("/admin_test/parents")}
              className="bg-secondary hover:bg-accent text-background transition-all duration-300 transform hover:scale-105"
            >
              Back to Parents
            </ShadcnButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
