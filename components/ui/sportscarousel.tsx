"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Circle, 
  Target, 
  Zap, 
  Square, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Pause, 
  Play 
} from 'lucide-react';

const SportsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const sportsData = [
    {
      id: 'football',
      name: 'Football',
      icon: Circle,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop&crop=center',
      description: 'Experience the thrill of competitive football with live match tracking and real-time score updates.',
      stats: {
        teams: 12,
        matches: 45,
        players: 180,
        viewers: '2.4K'
      },
      upcomingMatches: [
        { team1: 'Eagles FC', team2: 'Hawks United', time: '15:30', venue: 'Main Ground' },
        { team1: 'Lions XI', team2: 'Tigers CC', time: '17:00', venue: 'Secondary Ground' }
      ],
      color: 'bg-green-600'
    },
    {
      id: 'cricket',
      name: 'Cricket',
      icon: Target,
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&h=400&fit=crop&crop=center',
      description: 'Follow every ball, every run, and every wicket with comprehensive cricket coverage and live commentary.',
      stats: {
        teams: 8,
        matches: 32,
        players: 120,
        viewers: '1.8K'
      },
      upcomingMatches: [
        { team1: 'Sharks XI', team2: 'Wolves CC', time: '14:00', venue: 'Cricket Ground' },
        { team1: 'Panthers', team2: 'Raptors', time: '16:30', venue: 'Practice Ground' }
      ],
      color: 'bg-blue-600'
    },
    {
      id: 'basketball',
      name: 'Basketball',
      icon: Circle,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop&crop=center',
      description: 'Fast-paced basketball action with quarter-by-quarter scoring and player performance analytics.',
      stats: {
        teams: 10,
        matches: 38,
        players: 80,
        viewers: '1.5K'
      },
      upcomingMatches: [
        { team1: 'Thunder', team2: 'Lightning', time: '18:00', venue: 'Indoor Court A' },
        { team1: 'Storm', team2: 'Cyclone', time: '19:30', venue: 'Indoor Court B' }
      ],
      color: 'bg-orange-600'
    },
    {
      id: 'badminton',
      name: 'Badminton',
      icon: Zap,
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center',
      description: 'Precision and agility in badminton tournaments with set-by-set tracking and match highlights.',
      stats: {
        teams: 16,
        matches: 52,
        players: 64,
        viewers: '980'
      },
      upcomingMatches: [
        { team1: 'Smashers', team2: 'Shuttlers', time: '16:00', venue: 'Badminton Hall 1' },
        { team1: 'Aces', team2: 'Rackets', time: '17:30', venue: 'Badminton Hall 2' }
      ],
      color: 'bg-purple-600'
    },
    {
      id: 'chess',
      name: 'Chess',
      icon: Square,
      image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&h=400&fit=crop&crop=center',
      description: 'Strategic chess battles with move-by-move analysis and tournament bracket tracking.',
      stats: {
        teams: 20,
        matches: 64,
        players: 40,
        viewers: '750'
      },
      upcomingMatches: [
        { team1: 'Knights', team2: 'Bishops', time: '14:30', venue: 'Chess Arena' },
        { team1: 'Rooks', team2: 'Pawns', time: '16:00', venue: 'Strategy Room' }
      ],
      color: 'bg-slate-600'
    },
    {
      id: 'quiz',
      name: 'Quiz Competition',
      icon: Trophy,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=center',
      description: 'Mind-bending quiz competitions with real-time scoring and knowledge category breakdowns.',
      stats: {
        teams: 24,
        matches: 48,
        players: 96,
        viewers: '1.2K'
      },
      upcomingMatches: [
        { team1: 'Brainiacs', team2: 'Scholars', time: '15:00', venue: 'Auditorium' },
        { team1: 'Geniuses', team2: 'Masterminds', time: '17:00', venue: 'Conference Hall' }
      ],
      color: 'bg-indigo-600'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sportsData?.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, sportsData?.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % sportsData?.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + sportsData?.length) % sportsData?.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentSport = sportsData?.[currentIndex];

  return (
    <section className="py-16 bg-blue-50/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sports Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore all sports with detailed statistics, upcoming matches, and live tracking
          </p>
        </motion.div>

        {/* Main Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`relative ${currentSport?.color} min-h-[500px] md:min-h-[400px]`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 opacity-20">
                  <img 
                    src={currentSport?.image} 
                    alt={currentSport?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-12 text-white">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left Content */}
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <currentSport.icon size={24} className="text-white" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold">{currentSport?.name}</h3>
                      </div>
                      
                      <p className="text-lg text-white/90 mb-6 leading-relaxed">
                        {currentSport?.description}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{currentSport?.stats?.teams}</div>
                          <div className="text-sm text-white/70">Teams</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{currentSport?.stats?.matches}</div>
                          <div className="text-sm text-white/70">Matches</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{currentSport?.stats?.players}</div>
                          <div className="text-sm text-white/70">Players</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{currentSport?.stats?.viewers}</div>
                          <div className="text-sm text-white/70">Viewers</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        <Button
                          variant="default"
                          className="bg-white text-gray-900 hover:bg-white/90"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          View Fixtures
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Follow Teams
                        </Button>
                      </div>
                    </div>

                    {/* Right Content - Upcoming Matches */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <h4 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                        <Clock size={20} />
                        <span>Upcoming Matches</span>
                      </h4>
                      <div className="space-y-4">
                        {currentSport?.upcomingMatches?.map((match, index) => (
                          <div key={index} className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-sm">
                                {match?.team1} vs {match?.team2}
                              </div>
                              <div className="text-sm text-white/70">{match?.time}</div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-white/60">
                              <MapPin size={12} />
                              <span>{match?.venue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            {sportsData?.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' :'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Auto-play Control */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center space-x-2 px-4 py-2 bg-card rounded-full border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
            >
              {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isAutoPlaying ? 'Pause' : 'Play'} Auto-scroll</span>
            </button>
          </div>
        </div>

        {/* Quick Access Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12"
        >
          {sportsData?.map((sport, index) => (
            <button
              key={sport?.id}
              onClick={() => goToSlide(index)}
              className={`p-4 rounded-xl border transition-all ${
                index === currentIndex
                  ? 'bg-primary text-white border-primary shadow-lg'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <sport.icon size={24} className="mx-auto mb-2" />
              <div className="text-sm font-medium">{sport?.name}</div>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SportsCarousel;