"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamRegistrationForm } from "@/components/teamregistration/form";
import { IndividualRegistrationForm } from "@/components/individualregistration/form";

const RegisterPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sportId, setSportId] = useState<string | null>(null);
  const [sportType, setSportType] = useState<'team' | 'individual' | null>(null);

  useEffect(() => {
    const sport = searchParams.get('sport');
    const type = searchParams.get('type') as 'team' | 'individual' | null;
    setSportId(sport);
    setSportType(type);
  }, [searchParams]);

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

  return (
    <div className="min-h-screen  bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-blue-600 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Register for {getSportName(sportId)}
          </h1>
          <p className="text-white mt-2">
            {sportType === 'team' ? 'Team Registration' : 'Individual Registration'}
          </p>
        </div>
      </header>

      {/* Form Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {!sportId ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-6">
                Please select a sport from the home page to register.
              </p>
              <Button onClick={() => router.push('/')}>
                Go to Home
              </Button>
            </div>
          ) : sportType === 'team' ? (
            <TeamRegistrationForm sportId={sportId} sportName={getSportName(sportId)} />
          ) : (
            <IndividualRegistrationForm sportId={sportId} sportName={getSportName(sportId)} />
          )}
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;