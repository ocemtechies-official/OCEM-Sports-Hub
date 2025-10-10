"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Loader2 } from "lucide-react";
import { FormLoadingSkeleton } from "@/components/ui/form-loading-skeleton";
import { notifications } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Zod Schema
const individualSchema = z.object({
  studentName: z.string().min(2, "Name must be at least 2 characters"),
  rollNumber: z.string().min(1, "Roll number is required"),
  department: z.string().min(1, "Please select a department"),
  semester: z.string().min(1, "Please select a semester"),
  gender: z.string().min(1, "Please select a gender"),
  contactNumber: z.string().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
  email: z.string().email("Please enter a valid email address"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your skill level",
  }),
});

type IndividualFormData = z.infer<typeof individualSchema>;

interface IndividualRegistrationFormProps {
  sportId: string;
  sportName: string;
  onBackToSelection: () => void;
}

export const IndividualRegistrationForm = ({ sportId, sportName, onBackToSelection }: IndividualRegistrationFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<IndividualFormData>({
    resolver: zodResolver(individualSchema),
  });

  const onSubmit = async (data: IndividualFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/registrations/individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sportId: sportId,
          studentName: data.studentName,
          rollNumber: data.rollNumber,
          department: data.department,
          semester: data.semester,
          gender: data.gender,
          contactNumber: data.contactNumber,
          email: data.email,
          skillLevel: data.skillLevel,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      notifications.showSuccess({
        title: "Registration Complete ✅",
        description: `You're registered for ${sportName}. Pending approval.`
      });

      // Clear form and go back to sports selection
      reset();
      setTimeout(() => {
        onBackToSelection();
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      notifications.showError({
        title: "Registration Failed ❌",
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-600">Basic details for registration</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div className="group">
              <Label htmlFor="studentName" className="text-sm font-semibold text-gray-700 mb-2 block">
                Full Name *
              </Label>
              <Input 
                id="studentName" 
                {...register("studentName")} 
                placeholder="Enter your full name" 
                className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm" 
              />
              {errors.studentName && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.studentName.message}
              </p>}
            </div>

            <div className="group">
              <Label htmlFor="rollNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                Roll Number *
              </Label>
              <Input 
                id="rollNumber" 
                {...register("rollNumber")} 
                placeholder="Enter your roll number" 
                className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm" 
              />
              {errors.rollNumber && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.rollNumber.message}
              </p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label htmlFor="department" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Department *
                </Label>
                <Select onValueChange={(value) => setValue("department", value)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 hover:border-gray-300 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="BCA" className="rounded-lg">Bachelor of Computer Applications</SelectItem>
                    <SelectItem value="BBA" className="rounded-lg">Bachelor of Business Administration</SelectItem>
                    <SelectItem value="BE" className="rounded-lg">Bachelor of Engineering</SelectItem>
                    <SelectItem value="+2" className="rounded-lg">Plus Two (+2)</SelectItem>
                    <SelectItem value="OTHER" className="rounded-lg">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.department.message}
                </p>}
              </div>

              <div className="group">
                <Label htmlFor="semester" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Semester *
                </Label>
                <Select onValueChange={(value) => setValue("semester", value)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 hover:border-gray-300 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()} className="rounded-lg">
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.semester && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.semester.message}
                </p>}
              </div>

              <div className="group">
                <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Gender *
                </Label>
                <Select onValueChange={(value) => setValue("gender", value)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 hover:border-gray-300 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="male" className="rounded-lg">Male</SelectItem>
                    <SelectItem value="female" className="rounded-lg">Female</SelectItem>
                    <SelectItem value="other" className="rounded-lg">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.gender.message}
                </p>}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-3 bg-gradient-to-r from-green-100 to-teal-100 rounded-xl">
              <span className="text-green-600 text-xl">📞</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
              <p className="text-sm text-gray-600">How we can reach you</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div className="group">
              <Label htmlFor="contactNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                Contact Number *
              </Label>
              <Input 
                id="contactNumber" 
                {...register("contactNumber")} 
                placeholder="10-digit mobile number" 
                maxLength={10} 
                className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm" 
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.contactNumber.message}
              </p>}
            </div>

            <div className="group">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                Email Address *
              </Label>
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                placeholder="your.email@example.com" 
                className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm" 
              />
              {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.email.message}
              </p>}
            </div>
          </div>
        </div>

        {/* Skill Level Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Skill Assessment</h3>
              <p className="text-sm text-gray-600">Help us understand your experience level</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Skill Level *</Label>
            <RadioGroup onValueChange={(value) => setValue("skillLevel", value as any)} className="space-y-3">
              {[
                { value: "beginner", label: "Beginner", desc: "New to the sport, learning basics", icon: "🌱" },
                { value: "intermediate", label: "Intermediate", desc: "Some experience, comfortable with rules", icon: "⚡" },
                { value: "advanced", label: "Advanced", desc: "Experienced player, strong skills", icon: "🏆" }
              ].map((level) => (
                <div
                  key={level.value}
                  className="group relative flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer"
                >
                  <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                  <Label htmlFor={level.value} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl">{level.icon}</span>
                      <span className="font-semibold text-gray-900">{level.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{level.desc}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.skillLevel && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> {errors.skillLevel.message}
            </p>}
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline"
            className="flex-1 h-12 rounded-xl font-semibold border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 transition-all duration-300 hover:scale-105" 
            onClick={onBackToSelection}
          >
            Cancel Registration
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Complete Registration 🎉"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
