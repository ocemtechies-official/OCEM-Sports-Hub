"use client";

import { useState, useEffect } from "react";
import { Trophy, Target, Users, Calendar, Sparkles, Award, ArrowLeft, ArrowRight, LogIn, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SportsGrid } from "@/components/sportgrid/sport";
import { TeamRegistrationForm } from "@/components/teamregistration/form";
import { IndividualRegistrationForm } from "@/components/individualregistration/form";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { notifications } from "@/lib/notifications";
import RegisterLoading from "./loading";

const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'selection' | 'registration'>('selection');
  const [sportId, setSportId] = useState<string | null>(null);
  const [sportType, setSportType] = useState<'team' | 'individual' | null>(null);

  useEffect(() => {
    // Check if coming from URL params (direct link to registration)
    const sport = searchParams.get('sport');
    const type = searchParams.get('type') as 'team' | 'individual' | null;
    
    if (sport && type && user) {
      setSportId(sport);
      setSportType(type);
      setCurrentStep('registration');
    }
  }, [searchParams, user]);

  const getSportName = (id: string | null) => {
    const sportNames: Record<string, string> = {
      'cricket': 'Cricket',
      'football': 'Football', 
      'basketball': 'Basketball',
      'volleyball': 'Volleyball',
      'tug-of-war': 'Tug of War',
      'table-tennis': 'Table Tennis',
      'badminton': 'Badminton',
      'chess': 'Chess',
      'quiz': 'Quiz',
    };
    return id ? sportNames[id] : 'Unknown Sport';
  };

  const handleSportSelection = (selectedSport: { id: string; type: 'team' | 'individual' }) => {
    // Check authentication before proceeding to registration
    if (!user) {
      notifications.showError({
        title: "Authentication Required",
        description: "Please login to register for sports events."
      });
      handleLogin();
      return;
    }

    setSportId(selectedSport.id);
    setSportType(selectedSport.type);
    setCurrentStep('registration');
    // Update URL without page reload
    window.history.pushState({}, '', `/register?sport=${selectedSport.id}&type=${selectedSport.type}`);
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
    setSportId(null);
    setSportType(null);
    // Update URL without page reload
    window.history.pushState({}, '', '/register');
  };

  const handleLogin = () => {
    router.push('/auth/login?redirect=/register');
  };

  // Show loading state
  if (loading) {
    return <RegisterLoading />;
  }

  // Show authentication notice if not logged in (but still allow access)
  const showAuthNotice = !user && !loading;

  // Render registration form if sport is selected
  if (currentStep === 'registration' && sportId && sportType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
        {/* Enhanced Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-green-400/20 to-teal-400/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-yellow-300/15 to-orange-300/15 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-gradient-to-br from-pink-300/15 to-rose-300/15 blur-3xl animate-float" style={{ animationDelay: '6s' }}></div>
        </div>

        {/* Small Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="group hover:bg-white/90 transition-all duration-300 rounded-full p-2 backdrop-blur-sm border border-gray-200/50 shadow-sm"
            onClick={handleBackToSelection}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
          </Button>
        </div>

        {/* Enhanced Form Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Form container with enhanced styling */}
            <div className="relative">
              {/* Background decoration for form */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-white/90 to-purple-50/80 rounded-3xl blur-3xl transform -rotate-1"></div>
              
              <Card className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-lg rounded-3xl overflow-hidden">
                {/* Card header decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                <CardContent className="p-8 lg:p-12">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-4">
                      <Sparkles className="h-4 w-4" />
                      Registration Form
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
                      Complete Your Registration
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Fill in the details below to secure your spot in {getSportName(sportId)}. 
                      All fields are required for a successful registration.
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {sportType === 'team' ? (
                    <TeamRegistrationForm 
                      sportId={sportId} 
                      sportName={getSportName(sportId)} 
                      onBackToSelection={handleBackToSelection}
                    />
                  ) : (
                    <IndividualRegistrationForm 
                      sportId={sportId} 
                      sportName={getSportName(sportId)} 
                      onBackToSelection={handleBackToSelection}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { icon: "🔒", title: "Secure Registration", desc: "Your data is protected" },
                { icon: "⚡", title: "Instant Confirmation", desc: "Get notified immediately" },
                { icon: "🎯", title: "Easy Process", desc: "Simple 3-step registration" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Render sports selection page (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
            <Sparkles className="h-4 w-4" />
            OCEM Sports Hub 2025
            <Award className="h-4 w-4" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 animate-fade-in-up delay-100">
            Join the Ultimate
            <br className="hidden sm:block" />
            <span className="text-primary">Sports Experience</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up delay-200">
            Register for exciting team and individual sports competitions. Show your skills, compete with the best, and make unforgettable memories!
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Trophy, label: "Sports Events", value: "12+", color: "from-yellow-400 to-orange-500" },
            { icon: Users, label: "Participants", value: "500+", color: "from-blue-400 to-indigo-500" },
            { icon: Target, label: "Departments", value: "5", color: "from-green-400 to-teal-500" },
            { icon: Calendar, label: "Days", value: "7", color: "from-purple-400 to-pink-500" },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="group relative text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`relative w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <stat.icon className="h-8 w-8 text-white drop-shadow-sm" />
              </div>
              <div className="relative text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{stat.value}</div>
              <div className="relative text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">{stat.label}</div>
              
              {/* Sparkle effect on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sports Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <Trophy className="h-4 w-4" />
              Choose Your Sport
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-6">
              Available Sports
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Choose from a variety of team and individual sports. Each sport offers unique challenges and opportunities to showcase your skills.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>
          
          {/* Authentication Notice */}
          {showAuthNotice && (
            <div className="mb-8 animate-fade-in-up">
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <LogIn className="h-5 w-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-amber-900">Login Required for Registration</h3>
                  </div>
                  <p className="text-amber-800 mb-4">
                    You can browse available sports, but you'll need to login to submit registrations.
                  </p>
                  <Button 
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50 rounded-3xl -z-10"></div>
            <SportsGrid onSportSelect={handleSportSelection} />
          </div>
        </div>
      </section>


    </div>
  );
};

export default RegisterPage;

