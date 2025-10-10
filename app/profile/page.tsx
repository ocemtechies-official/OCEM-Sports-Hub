"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Star, 
  Phone, 
  Mail, 
  Edit, 
  Award, 
  TrendingUp, 
  Heart, 
  UserCheck, 
  CheckCircle,
  Crown,
  Gift,
  Target,
  Zap,
  Share2,
  Download,
  QrCode,
  MapPin,
  Clock,
  Users,
  MessageCircle,
  ThumbsUp,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Sparkles,
  Trophy,
  Flame,
  Diamond,
  Shield,
  BookOpen,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  RefreshCw,
  Settings,
  Bell,
  Globe,
  Lock,
  AlertTriangle,
  Users2,
  Medal,
  Activity,
  Dumbbell,
  Bike,
  Dumbbell as Football,
  Volleyball,
  Dumbbell as TableTennis,
  Brain as Chess,
  Brain,
  MousePointerClick
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, easeOut } from "framer-motion";
import { showToast } from "@/components/ui/toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Animation variants for smooth page transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1
  }
}

// Animation variants for individual cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0
  }
}

// Interface for comprehensive profile data
interface ProfileData {
  // Personal Insights & Analytics
  personalInsights: {
    sportPersonality: {
      primarySport: string;
      preferredTimeSlots: string[];
      averageParticipation: number;
      participationFrequency: 'low' | 'medium' | 'high';
      sportPreferences: string[];
    };
    participationPatterns: {
      monthlyAverage: number;
      highestParticipationMonth: string;
      favoriteSportType: string;
      skillDevelopmentFocus: 'low' | 'medium' | 'high';
    };
    behaviorAnalytics: {
      mostActiveDay: string;
      preferredRegistrationMethod: 'mobile' | 'desktop' | 'app';
      responseTime: number; // in hours
      cancellationRate: number;
    };
  };
  
  // Comprehensive Achievement System
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    category: 'participation' | 'performance' | 'social' | 'loyalty' | 'special';
    points: number;
    progress?: {
      current: number;
      total: number;
    };
  }[];
  
  // Social Features
  socialProfile: {
    profileVisibility: 'public' | 'private' | 'friends';
    socialStats: {
      profileViews: number;
      connections: number;
      reviewsReceived: number;
      helpfulVotes: number;
    };
    connections: {
      id: string;
      name: string;
      avatar: string;
      connectionType: 'friend' | 'teammate' | 'colleague';
      mutualSports: number;
      connectedAt: string;
    }[];
    recentConnections: {
      id: string;
      name: string;
      action: 'viewed' | 'connected' | 'shared';
      timestamp: string;
    }[];
  };
  
  // Personal Milestones & Goals
  milestones: {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    deadline?: string;
    category: 'participations' | 'performance' | 'reviews' | 'social';
    reward?: string;
  }[];
  
  // Profile Sharing & QR
  sharing: {
    profileUrl: string;
    qrCode: string;
    shareableLinks: {
      platform: string;
      url: string;
      icon: string;
    }[];
  };
  
  // Personal Recommendations
  recommendations: {
    sportSuggestions: {
      id: string;
      title: string;
      reason: string;
      confidence: number;
      category: string;
    }[];
    performanceTips: {
      id: string;
      tip: string;
      potentialImprovement: number;
      category: string;
    }[];
    profileImprovements: {
      id: string;
      suggestion: string;
      impact: 'low' | 'medium' | 'high';
      category: string;
    }[];
  };
}

/**
 * Achievement Badge Component
 * Displays individual achievement with rarity-based styling and progress tracking
 */
const AchievementBadge = ({ achievement }: { achievement: ProfileData['achievements'][0] }) => {
  const rarityColors = {
    common: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
    rare: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600',
    epic: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600',
    legendary: 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-600'
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Award className="h-4 w-4" />;
      case 'rare': return <Star className="h-4 w-4" />;
      case 'epic': return <Trophy className="h-4 w-4" />;
      case 'legendary': return <Diamond className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="relative group cursor-pointer"
    >
      <Card className={`p-4 hover:shadow-xl transition-all duration-300 border-2 ${rarityColors[achievement.rarity]}`}>
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${rarityColors[achievement.rarity]} shadow-lg`}>
            {getRarityIcon(achievement.rarity)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{achievement.title}</h4>
              <Badge variant="secondary" className="text-xs">
                +{achievement.points} pts
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
            {achievement.progress && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress.current}/{achievement.progress.total}</span>
                </div>
                <Progress 
                  value={(achievement.progress.current / achievement.progress.total) * 100} 
                  className="h-1"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * Milestone Progress Component
 * Displays personal milestones with progress tracking and rewards
 */
const MilestoneCard = ({ milestone }: { milestone: ProfileData['milestones'][0] }) => {
  const progress = (milestone.current / milestone.target) * 100
  const isCompleted = milestone.current >= milestone.target

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className={`p-4 transition-all duration-300 ${
        isCompleted 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
          : 'hover:shadow-lg'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">{milestone.title}</h4>
          </div>
          {isCompleted && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{milestone.current}/{milestone.target}</span>
          </div>
          <Progress value={progress} className="h-2" />
          {milestone.reward && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              Reward: {milestone.reward}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * Social Connection Component
 * Displays individual social connections with mutual service information
 */
const ConnectionCard = ({ connection }: { connection: ProfileData['socialProfile']['connections'][0] }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={connection.avatar || ''} />
            <AvatarFallback>{(connection.name || 'User').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{connection.name || 'User'}</h4>
            <p className="text-xs text-muted-foreground capitalize">{connection.connectionType || 'Connection'}</p>
            <p className="text-xs text-muted-foreground">
              {connection.mutualSports || 0} mutual sports
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Connected {new Date(connection.connectedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * Customer Profile Page Component
 */
export default function CustomerProfilePage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("insights");
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string>("");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [individualRegistrations, setIndividualRegistrations] = useState<any[]>([]);
  const [teamRegistrations, setTeamRegistrations] = useState<any[]>([]);

  // Load profile data and registrations
  useEffect(() => {
    const loadData = async () => {
      // Always set loading to false after a short delay to prevent infinite loading
      // If user or profile is missing, we'll show an error state instead
      setIsLoading(true);
      
      try {
        // Add a small delay to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!user || !profile) {
          // If we don't have user or profile data, show error after a delay
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsLoading(false);
          return;
        }
        
        const supabase = getSupabaseBrowserClient();
        
        // Fetch individual registrations
        const { data: individualData } = await supabase
          .from('individual_registrations')
          .select('*')
          .eq('user_id', user.id);
        
        // Fetch team registrations
        const { data: teamData } = await supabase
          .from('team_registrations')
          .select('*')
          .eq('user_id', user.id);
        
        setIndividualRegistrations(individualData || []);
        setTeamRegistrations(teamData || []);
        
        // Calculate profile data based on fetched information
        const totalRegistrations = (individualData?.length || 0) + (teamData?.length || 0);
        const approvedIndividual = individualData?.filter((reg: any) => reg.status === 'approved').length || 0;
        const approvedTeam = teamData?.filter((reg: any) => reg.status === 'approved').length || 0;
        const approvedRegistrations = approvedIndividual + approvedTeam;
        
        // Get unique sports count
        const individualSports = individualData?.map((reg: any) => reg.sport_id) || [];
        const teamSports = teamData?.map((reg: any) => reg.sport_id) || [];
        const allSports = [...new Set([...individualSports, ...teamSports])];
        const uniqueSportsCount = allSports.length;
        
        // Create profile URL
        const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const profileUrl = `${appBaseUrl}/profile/${user.id}`;
        
        // Mock data for demonstration
        const mockProfileData: ProfileData = {
          personalInsights: {
            sportPersonality: {
              primarySport: 'Chess',
              preferredTimeSlots: ['Evening (5-8)', 'Weekend'],
              averageParticipation: 3,
              participationFrequency: 'medium',
              sportPreferences: ['Chess', 'Quiz', 'Table Tennis']
            },
            participationPatterns: {
              monthlyAverage: 2,
              highestParticipationMonth: 'March',
              favoriteSportType: 'Mental Sports',
              skillDevelopmentFocus: 'high'
            },
            behaviorAnalytics: {
              mostActiveDay: 'Saturday',
              preferredRegistrationMethod: 'mobile',
              responseTime: 1.5,
              cancellationRate: 2
            }
          },
          achievements: [
            {
              id: '1',
              title: 'First Participation',
              description: 'Registered for your first event',
              icon: 'calendar',
              unlockedAt: new Date().toISOString(),
              rarity: 'common',
              category: 'participation',
              points: 10
            },
            {
              id: '2',
              title: 'Quiz Master',
              description: 'Completed 5+ quizzes',
              icon: 'brain',
              unlockedAt: new Date().toISOString(),
              rarity: 'rare',
              category: 'performance',
              points: 50
            },
            {
              id: '3',
              title: 'Team Player',
              description: 'Joined 3+ teams',
              icon: 'users',
              unlockedAt: new Date().toISOString(),
              rarity: 'epic',
              category: 'social',
              points: 100
            },
            {
              id: '4',
              title: 'Champion',
              description: 'Won 2+ tournaments',
              icon: 'trophy',
              unlockedAt: new Date().toISOString(),
              rarity: 'legendary',
              category: 'performance',
              points: 200
            }
          ],
          socialProfile: {
            profileVisibility: 'public',
            socialStats: {
              profileViews: 142,
              connections: 12,
              reviewsReceived: 8,
              helpfulVotes: 24
            },
            connections: [
              {
                id: '1',
                name: 'Alex Johnson',
                avatar: '',
                connectionType: 'teammate',
                mutualSports: 3,
                connectedAt: '2024-01-15'
              },
              {
                id: '2',
                name: 'Sarah Chen',
                avatar: '',
                connectionType: 'friend',
                mutualSports: 2,
                connectedAt: '2024-02-20'
              },
              {
                id: '3',
                name: 'Mike Wilson',
                avatar: '',
                connectionType: 'colleague',
                mutualSports: 1,
                connectedAt: '2024-01-10'
              }
            ],
            recentConnections: [
              {
                id: '1',
                name: 'Emma Thompson',
                action: 'viewed',
                timestamp: new Date(Date.now() - 3600000).toISOString()
              },
              {
                id: '2',
                name: 'James Brown',
                action: 'connected',
                timestamp: new Date(Date.now() - 7200000).toISOString()
              }
            ]
          },
          milestones: [
            {
              id: '1',
              title: 'Sport Explorer',
              description: 'Participate in 5 different sports',
              target: 5,
              current: 3,
              category: 'participations',
              reward: 'Special badge'
            },
            {
              id: '2',
              title: 'Quiz Champion',
              description: 'Complete 10 quizzes',
              target: 10,
              current: 7,
              category: 'performance',
              reward: 'Priority registration'
            },
            {
              id: '3',
              title: 'Social Connector',
              description: 'Connect with 20 friends',
              target: 20,
              current: 12,
              category: 'social',
              reward: 'Exclusive event access'
            },
            {
              id: '4',
              title: 'Performance Master',
              description: 'Achieve top 3 in 3 events',
              target: 3,
              current: 1,
              category: 'performance',
              reward: 'Free merchandise'
            }
          ],
          sharing: {
            profileUrl: profileUrl,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`,
            shareableLinks: [
              {
                platform: 'WhatsApp',
                url: `https://wa.me/?text=${encodeURIComponent('Check out my OCEM Sports Hub profile: ' + profileUrl)}`,
                icon: 'whatsapp'
              },
              {
                platform: 'Facebook',
                url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
                icon: 'facebook'
              },
              {
                platform: 'Twitter',
                url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}`,
                icon: 'twitter'
              }
            ]
          },
          recommendations: {
            sportSuggestions: [
              {
                id: '1',
                title: 'Advanced Chess Tactics',
                reason: 'Based on your chess performance',
                confidence: 85,
                category: 'Strategy Games'
              },
              {
                id: '2',
                title: 'Speed Quiz Challenge',
                reason: 'Popular among users with similar quiz scores',
                confidence: 72,
                category: 'Knowledge Games'
              }
            ],
            performanceTips: [
              {
                id: '1',
                tip: 'Practice chess puzzles daily for 30 minutes',
                potentialImprovement: 15,
                category: 'Skill Development'
              },
              {
                id: '2',
                tip: 'Join study groups for quiz preparation',
                potentialImprovement: 20,
                category: 'Knowledge Building'
              }
            ],
            profileImprovements: [
              {
                id: '1',
                suggestion: 'Add a profile bio to increase connection requests',
                impact: 'medium',
                category: 'Social'
              },
              {
                id: '2',
                suggestion: 'Upload a profile picture for better recognition',
                impact: 'high',
                category: 'Profile'
              }
            ]
          }
        };

        setProfileData(mockProfileData);
      } catch (error) {
        showToast.error({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          duration: 5000
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, profile]);

  const openQrModal = () => {
    setQrModalOpen(true);
    setQrImageDataUrl("");
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My OCEM Sports Hub Profile',
          text: 'Check out my sports profile on OCEM Sports Hub!',
          url: profileData?.sharing.profileUrl
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(profileData?.sharing.profileUrl || '');
      showToast.success({
        title: "Profile URL copied!",
        description: "Share this link with your friends",
        duration: 3000
      });
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrImageDataUrl || profileData?.sharing.qrCode || '';
    link.download = `ocem-sports-profile-${user?.id}.png`;
    link.click();
  };

  // Show loading state while checking auth and loading profile data
  if (isLoading) {
    return (
      <div className="container py-6 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </motion.div>
      </div>
    )
  }
  
  // Show error state if we don't have user data
  if (!user) {
    return (
      <div className="container py-6 max-w-7xl mx-auto px-4">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state if profile data failed to load
  if (!profileData) {
    return (
      <div className="container py-6 max-w-7xl mx-auto px-4">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load profile</h3>
          <p className="text-muted-foreground mb-4">There was an error loading your profile data.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container py-6 max-w-7xl mx-auto px-4"
    >
      {/* Enhanced Profile Header with Social Features */}
      <motion.div variants={cardVariants} className="mb-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-muted ring-4 ring-offset-4 ring-offset-background ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                      {profile.full_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg">
                  <UserCheck className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {profile.full_name || "User"}
                      </h1>
                      <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30">
                        <Crown className="h-3 w-3 mr-1 text-blue-500" />
                        {profileData.socialProfile.profileVisibility} Profile
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-6 text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {profile.contact_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{profile.contact_number || "Not provided"}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{profileData.socialProfile.socialStats.profileViews} profile views</span>
                      </div>
                    </div>

                    {/* Social Stats */}
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{profileData.socialProfile.socialStats.connections}</span>
                        <span className="text-muted-foreground">connections</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{profileData.socialProfile.socialStats.reviewsReceived}</span>
                        <span className="text-muted-foreground">reviews</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{profileData.socialProfile.socialStats.helpfulVotes}</span>
                        <span className="text-muted-foreground">helpful votes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={handleShareProfile} className="gap-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                      <Share2 className="h-4 w-4" />
                      Share Profile
                    </Button>
                    <Button variant="outline" onClick={openQrModal} className="gap-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                      <QrCode className="h-4 w-4" />
                      Show QR
                    </Button>
                    <Link href="/settings">
                      <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Personal Insights</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="goals">Goals & Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sport Personality */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Sport Personality
                </CardTitle>
                <CardDescription>Your unique sports preferences and patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Primary Sport</span>
                    <Badge variant="outline">{profileData.personalInsights.sportPersonality.primarySport}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Participation Frequency</span>
                    <Badge variant="secondary" className="capitalize bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      {profileData.personalInsights.sportPersonality.participationFrequency}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Participation</span>
                    <span className="font-semibold">{profileData.personalInsights.sportPersonality.averageParticipation} events/month</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Preferred Time Slots</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.personalInsights.sportPersonality.preferredTimeSlots.map((slot, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Sport Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.personalInsights.sportPersonality.sportPreferences.map((pref, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participation Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Participation Patterns
                </CardTitle>
                <CardDescription>Your participation behavior and performance insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Monthly Average</span>
                    <span className="font-semibold">{profileData.personalInsights.participationPatterns.monthlyAverage} events</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Most Active Month</span>
                    <Badge variant="outline">{profileData.personalInsights.participationPatterns.highestParticipationMonth}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Favorite Sport Type</span>
                    <span className="text-sm">{profileData.personalInsights.participationPatterns.favoriteSportType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Skill Focus</span>
                    <Badge variant="secondary" className="capitalize bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                      {profileData.personalInsights.participationPatterns.skillDevelopmentFocus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Behavior Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Behavior Analytics
                </CardTitle>
                <CardDescription>Your platform usage patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Most Active Day</span>
                    <Badge variant="outline">{profileData.personalInsights.behaviorAnalytics.mostActiveDay}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Preferred Registration Method</span>
                    <Badge variant="secondary" className="capitalize bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                      {profileData.personalInsights.behaviorAnalytics.preferredRegistrationMethod}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <span className="text-sm">{profileData.personalInsights.behaviorAnalytics.responseTime} hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cancellation Rate</span>
                    <span className="text-sm">{profileData.personalInsights.behaviorAnalytics.cancellationRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-amber-500" />
                  Personal Recommendations
                </CardTitle>
                <CardDescription>Tailored suggestions just for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Sport Suggestions</p>
                  <div className="space-y-2">
                    {profileData.recommendations.sportSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{suggestion.title}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.confidence}% match
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Performance Tips</p>
                  <div className="space-y-2">
                    {profileData.recommendations.performanceTips.map((tip) => (
                      <div key={tip.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{tip.tip}</p>
                            <p className="text-xs text-muted-foreground">Potential improvement: {tip.potentialImprovement}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Your Achievements
              </CardTitle>
              <CardDescription>Badges and milestones you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileData.achievements.map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Social Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Social Statistics
                </CardTitle>
                <CardDescription>Your social engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{profileData.socialProfile.socialStats.profileViews}</p>
                    <p className="text-sm text-muted-foreground">Profile Views</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{profileData.socialProfile.socialStats.connections}</p>
                    <p className="text-sm text-muted-foreground">Connections</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">{profileData.socialProfile.socialStats.reviewsReceived}</p>
                    <p className="text-sm text-muted-foreground">Reviews Received</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <ThumbsUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{profileData.socialProfile.socialStats.helpfulVotes}</p>
                    <p className="text-sm text-muted-foreground">Helpful Votes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  Your Connections
                </CardTitle>
                <CardDescription>People you're connected with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileData.socialProfile.connections.map((connection) => (
                    <ConnectionCard key={connection.id} connection={connection} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Personal Goals & Milestones
              </CardTitle>
              <CardDescription>Track your progress towards personal goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.milestones.map((milestone) => (
                  <MilestoneCard key={milestone.id} milestone={milestone} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Preview Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile QR Code</DialogTitle>
          </DialogHeader>
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <div className="bg-white p-4 rounded-lg">
              <Image 
                src={profileData.sharing.qrCode} 
                alt="Profile QR Code" 
                width={200} 
                height={200} 
                className="rounded-lg"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code to view {profile.full_name}'s profile
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleDownloadQR} className="gap-2">
              <Download className="h-4 w-4" /> Download QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}