"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { showToast } from "@/components/ui/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Save, 
  Camera,
  Shield,
  Key,
  Lock,
  Phone,
  MapPin,
  GraduationCap,
  Target,
  Bell,
  Globe,
  Eye,
  EyeOff,
  Edit,
  UserCheck,
  Crown,
  Settings as SettingsIcon,
  Palette,
  PaletteIcon,
  Monitor,
  Smartphone,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Navigation,
  CreditCard,
  Building,
  Calendar,
  Users,
  Heart,
  Star,
  Award,
  Zap,
  Trophy,
  BookOpen,
  MessageCircle,
  Share2,
  QrCode,
  Download,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Trash,
  UserCircle,
  Languages,
  Clock,
  Image as ImageIcon
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile settings
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  // Preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showActivity: true,
    allowMessaging: true
  });
  
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("");
  
  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Account
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [sessions, setSessions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form with user data
  useEffect(() => {
    // Always set loading to false after a short delay to prevent infinite loading
    // If user or profile is missing, we'll show an error state instead
    setLoading(true);
    
    const initializeForm = async () => {
      // Add a small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!user || !profile) {
        // If we don't have user or profile data, show error after a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
        return;
      }
      
      setFullName(profile.full_name || "");
      setEmail(user.email || "");
      setAvatarUrl(profile.avatar_url || "");
      setStudentId(profile.student_id || "");
      setDepartment(profile.department || "");
      setSemester(profile.semester || "");
      setContactNumber(profile.contact_number || "");
      setBio(profile.bio || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setDateOfBirth(profile.date_of_birth || "");
      setLoading(false);
    };
    
    initializeForm();
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          avatar_url: avatarUrl,
          student_id: studentId,
          department: department,
          semester: semester,
          contact_number: contactNumber,
          bio: bio,
          address: address,
          city: city,
          date_of_birth: dateOfBirth
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      showToast.success({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Refresh the page to update the profile context
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast.error({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);
    
    try {
      // In a real app, you would upload to a storage service like Supabase Storage
      // For now, we'll just show a placeholder
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);
        setImagePreview(result);
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
      
      showToast.success({
        title: "Avatar Updated",
        description: "Your avatar has been updated.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showToast.error({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
      });
      setAvatarUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSavePreferences = () => {
    showToast.success({
      title: "Preferences Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleSaveSecurity = () => {
    if (newPassword !== confirmPassword) {
      showToast.error({
        title: "Password Mismatch",
        description: "New passwords do not match.",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      showToast.error({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }
    
    showToast.success({
      title: "Security Updated",
      description: "Your security settings have been updated.",
    });
    
    // Reset password fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast.error({
        title: "Please fill all fields",
        description: "All password fields are required.",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast.error({
        title: "Password Mismatch",
        description: "New passwords do not match.",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      showToast.error({
        title: "Password too short",
        description: "Use at least 8 characters for your new password.",
      });
      return;
    }
    
    try {
      setSaving(true);
      // In a real app, you would call an API to change the password
      showToast.success({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showToast.error({
        title: "Failed to update password",
        description: error.message || "An error occurred while updating your password.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      showToast.success({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      });
      signOut();
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state if we don't have user data
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">Please sign in to access your settings.</p>
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
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="rounded-xl p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 mb-2 leading-tight pb-1">
                Settings
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl" style={{ lineHeight: '1.4' }}>
                Manage your account settings and preferences.
              </p>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <TabsList className="bg-muted/50 p-1 rounded-xl shadow-sm w-full md:w-auto">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-muted/80 hover:shadow-md px-4 py-2 font-medium"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-muted/80 hover:shadow-md px-4 py-2 font-medium"
                >
                  Preferences
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-muted/80 hover:shadow-md px-4 py-2 font-medium"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-muted/80 hover:shadow-md px-4 py-2 font-medium"
                >
                  Security
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="transition-all duration-300 hover:shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 pb-6">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription>
                      Update your personal information and profile picture.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-8">
                      <div className="flex flex-col items-center space-y-6">
                        <motion.div 
                          className="relative group"
                          whileHover={{ scale: 1.03 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div 
                            className="relative h-32 w-32 rounded-full transition-all duration-300 group-hover:scale-105 p-[3px] bg-gradient-to-r from-indigo-500/50 to-purple-500/50 group-hover:from-indigo-500 group-hover:to-purple-500 dark:from-indigo-400/50 dark:to-purple-400/50 dark:group-hover:from-indigo-400 dark:group-hover:to-purple-400 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] cursor-pointer"
                            onClick={handleImageClick}
                          >
                            <div className="relative h-full w-full rounded-full overflow-hidden bg-background">
                              <Avatar className="h-full w-full">
                                <AvatarImage src={imagePreview || avatarUrl || "/placeholder.svg"} alt={fullName || "User"} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                                  {fullName?.split(" ").map(n => n[0]).join("") || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Camera className="h-8 w-8 text-white drop-shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>
                          {avatarUploading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          )}
                        </motion.div>
                        <motion.p 
                          className="text-sm text-muted-foreground transition-colors group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 dark:group-hover:from-indigo-400 dark:group-hover:to-purple-400"
                          whileHover={{ y: -2 }}
                        >
                          Click to upload new profile picture
                        </motion.p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <Label htmlFor="fullName" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-500" />
                            Full Name
                          </Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 rounded-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-indigo-500" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            className="opacity-90 rounded-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                        >
                          <Label htmlFor="studentId" className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-indigo-500" />
                            Student ID
                          </Label>
                          <Input
                            id="studentId"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="Enter your student ID"
                            className="transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 rounded-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                        >
                          <Label htmlFor="contactNumber" className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-indigo-500" />
                            Phone Number
                          </Label>
                          <Input
                            id="contactNumber"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="Enter your phone number"
                            className="transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 rounded-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 }}
                        >
                          <Label htmlFor="department" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-indigo-500" />
                            Department
                          </Label>
                          <Input
                            id="department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Enter your department"
                            className="transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 rounded-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.7 }}
                        >
                          <Label htmlFor="semester" className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-indigo-500" />
                            Semester
                          </Label>
                          <Input
                            id="semester"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            placeholder="Enter your semester"
                            className="transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 rounded-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2 md:col-span-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.8 }}
                        >
                          <Label htmlFor="bio" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-500" />
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 rounded-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.9 }}
                        >
                          <Label htmlFor="address" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-indigo-500" />
                            Address
                          </Label>
                          <Input
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your address"
                            className="transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 rounded-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.95 }}
                        >
                          <Label htmlFor="city" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-indigo-500" />
                            City
                          </Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Enter your city"
                            className="transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 rounded-lg"
                          />
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 1.0 }}
                        >
                          <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            Date of Birth
                          </Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="transition-all duration-300 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 rounded-lg"
                          />
                        </motion.div>
                      </div>

                      <motion.div 
                        className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center pt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 1.1 }}
                      >
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setFullName(profile?.full_name || "");
                            setEmail(user?.email || "");
                            setAvatarUrl(profile?.avatar_url || "");
                            setStudentId(profile?.student_id || "");
                            setDepartment(profile?.department || "");
                            setSemester(profile?.semester || "");
                            setContactNumber(profile?.contact_number || "");
                            setBio(profile?.bio || "");
                            setAddress(profile?.address || "");
                            setCity(profile?.city || "");
                            setDateOfBirth(profile?.date_of_birth || "");
                            setImagePreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          disabled={saving}
                          className="hover:shadow-md transition-all duration-300 rounded-lg group"
                        >
                          <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                          Reset Changes
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={saving} 
                          className="min-w-[140px] hover:shadow-lg transition-all duration-300 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          {saving ? (
                            <>
                              <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="preferences">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 pb-6">
                    <CardTitle className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize your app experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <motion.div 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-amber-500" />
                          Theme
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Choose between light and dark mode
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button" 
                          variant={theme === 'light' ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setTheme('light')} 
                          className="gap-1 transition-all duration-300 hover:shadow-md rounded-lg"
                        >
                          <Sun className="h-4 w-4" /> Light
                        </Button>
                        <Button 
                          type="button" 
                          variant={theme === 'dark' ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setTheme('dark')} 
                          className="gap-1 transition-all duration-300 hover:shadow-md rounded-lg"
                        >
                          <Moon className="h-4 w-4" /> Dark
                        </Button>
                        <Button 
                          type="button" 
                          variant={theme === 'system' ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setTheme('system')} 
                          className="gap-1 transition-all duration-300 hover:shadow-md rounded-lg"
                        >
                          <RefreshCw className="h-4 w-4" /> System
                        </Button>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Languages className="h-4 w-4 text-blue-500" />
                          Language
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred language
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Languages className="h-4 w-4" />
                        <select 
                          className="form-select rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800" 
                          value={language} 
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          Timezone
                        </Label>
                        <p className="text-sm text-muted-foreground">Set your local timezone</p>
                      </div>
                      <input
                        className="form-input rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full sm:w-auto transition-all duration-300 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-200 dark:focus:ring-purple-800"
                        placeholder="e.g., Asia/Kathmandu"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      />
                    </motion.div>

                    <motion.div 
                      className="flex justify-end gap-3 pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="hover:shadow-md transition-all duration-300 rounded-lg group"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-500`} />
                        Refresh
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleSavePreferences} 
                        disabled={saving}
                        className="min-w-[140px] hover:shadow-lg transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      >
                        {saving ? (
                          <>
                            <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2"/>
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 pb-6">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>
                      Choose what notifications you want to receive.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <motion.div 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-500" />
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.email} 
                        onCheckedChange={(checked) => setNotifications({...notifications, email: checked})} 
                        className="data-[state=checked]:bg-blue-500 transition-all duration-300"
                      />
                    </motion.div>

                    <motion.div 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-purple-500" />
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.push} 
                        onCheckedChange={(checked) => setNotifications({...notifications, push: checked})} 
                        className="data-[state=checked]:bg-purple-500 transition-all duration-300"
                      />
                    </motion.div>

                    <motion.div 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-amber-500" />
                          SMS Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive text messages
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.sms} 
                        onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})} 
                        className="data-[state=checked]:bg-amber-500 transition-all duration-300"
                      />
                    </motion.div>

                    <motion.div 
                      className="space-y-4 p-4 rounded-xl bg-muted/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-500" />
                        Notification Types
                      </Label>
                      <div className="space-y-3">
                        <motion.div 
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300 cursor-pointer"
                          whileHover={{ x: 5 }}
                          onClick={() => setNotifications({...notifications, email: !notifications.email})}
                        >
                          <input 
                            type="checkbox" 
                            id="bookings" 
                            className="rounded h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                            checked={notifications.email} 
                            onChange={() => {}} 
                          />
                          <label htmlFor="bookings" className="cursor-pointer">Booking updates</label>
                        </motion.div>
                        <motion.div 
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300 cursor-pointer"
                          whileHover={{ x: 5 }}
                          onClick={() => setNotifications({...notifications, push: !notifications.push})}
                        >
                          <input 
                            type="checkbox" 
                            id="messages" 
                            className="rounded h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                            checked={notifications.push} 
                            onChange={() => {}} 
                          />
                          <label htmlFor="messages" className="cursor-pointer">New messages</label>
                        </motion.div>
                        <motion.div 
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300 cursor-pointer"
                          whileHover={{ x: 5 }}
                          onClick={() => setNotifications({...notifications, sms: !notifications.sms})}
                        >
                          <input 
                            type="checkbox" 
                            id="promotions" 
                            className="rounded h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                            checked={notifications.sms} 
                            onChange={() => {}} 
                          />
                          <label htmlFor="promotions" className="cursor-pointer">Promotions and offers</label>
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex justify-end gap-3 pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="hover:shadow-md transition-all duration-300 rounded-lg group"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-500`} />
                        Refresh
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleSavePreferences} 
                        disabled={saving}
                        className="min-w-[140px] hover:shadow-lg transition-all duration-300 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {saving ? (
                          <>
                            <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2"/>
                            Save Notifications
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="transition-all duration-300 hover:shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 pb-6">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your password and security preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    <motion.div 
                      className="space-y-6 p-5 rounded-xl bg-muted/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Key className="h-5 w-5 text-amber-500" />
                        Change Password
                      </h3>
                      <div className="grid gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-rose-500" />
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input 
                              id="currentPassword" 
                              type={showPasswords.current ? 'text' : 'password'} 
                              placeholder="Enter your current password" 
                              value={currentPassword} 
                              onChange={(e)=>setCurrentPassword(e.target.value)} 
                              className="transition-all duration-300 hover:border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-800 rounded-lg pr-10"
                            />
                            <button 
                              type="button" 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => togglePasswordVisibility('current')}
                            >
                              {showPasswords.current ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-amber-500" />
                            New Password
                          </Label>
                          <div className="relative">
                            <Input 
                              id="newPassword" 
                              type={showPasswords.new ? 'text' : 'password'} 
                              placeholder="Enter your new password" 
                              value={newPassword} 
                              onChange={(e)=>setNewPassword(e.target.value)} 
                              className="transition-all duration-300 hover:border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 rounded-lg pr-10"
                            />
                            <button 
                              type="button" 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => togglePasswordVisibility('new')}
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-emerald-500" />
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Input 
                              id="confirmPassword" 
                              type={showPasswords.confirm ? 'text' : 'password'} 
                              placeholder="Confirm your new password" 
                              value={confirmPassword} 
                              onChange={(e)=>setConfirmPassword(e.target.value)} 
                              className="transition-all duration-300 hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 rounded-lg pr-10"
                            />
                            <button 
                              type="button" 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => togglePasswordVisibility('confirm')}
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </button>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleChangePassword} 
                          disabled={saving}
                          className="min-w-[160px] hover:shadow-lg transition-all duration-300 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        >
                          {saving ? (
                            <>
                              <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4 mr-2"/>
                              Update Password
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="space-y-6 p-5 rounded-xl bg-muted/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        Two-Factor Authentication
                      </h3>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <Label className="flex items-center gap-2">
                            Enable 2FA
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={twoFactorEnabled ? 'default' : 'outline'}
                            className={twoFactorEnabled ? "bg-gradient-to-r from-green-500 to-emerald-500" : ""}
                          >
                            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} 
                            className="gap-2 hover:shadow-md transition-all duration-300 rounded-lg group"
                          >
                            {twoFactorEnabled ? (
                              <>
                                <Lock className="h-4 w-4"/>
                                Disable
                              </>
                            ) : (
                              <>
                                <Key className="h-4 w-4"/>
                                Enable
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="space-y-6 p-5 rounded-xl bg-muted/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-purple-500" />
                        Active Sessions
                      </h3>
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="h-4 w-4 mr-2 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                          Loading sessions...
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}