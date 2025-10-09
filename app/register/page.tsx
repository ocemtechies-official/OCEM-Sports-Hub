"use client";

import { Trophy, Target, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SportsGrid } from "@/components/sportgrid/sport";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Trophy, label: "Sports Events", value: "12+" },
            { icon: Users, label: "Participants", value: "500+" },
            { icon: Target, label: "Departments", value: "5" },
            { icon: Calendar, label: "Days", value: "7" },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-lg bg-gradient-card hover:shadow-lg transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sports Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Available Sports
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from a variety of team and individual sports. Click on any sport to register!
            </p>
          </div>
          
          <SportsGrid />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-card">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Compete?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Don't miss out on this exciting opportunity. Register your team or participate individually today!
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 font-semibold text-lg px-8 py-6"
            onClick={() => router.push('/register')}
          >
            Start Registration
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

