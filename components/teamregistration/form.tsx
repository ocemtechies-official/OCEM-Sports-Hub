"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Users, Plus, X, Loader2 } from "lucide-react";
import { FormLoadingSkeleton } from "@/components/ui/form-loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notifications } from "@/lib/notifications";

// ⚙️ Define team sports with min/max limits (same as in SportsGrid)
const teamLimits: Record<string, { min: number; max: number }> = {
  cricket: { min: 11, max: 15 },
  football: { min: 9, max: 11 },
  basketball: { min: 5, max: 8 },
  volleyball: { min: 6, max: 9 },
  "tug-of-war": { min: 8, max: 8 },
};

// ✅ Base schema (we'll refine members dynamically later)
const baseSchema = z.object({
  teamName: z.string().min(3, "Team name must be at least 3 characters"),
  department: z.string().min(1, "Please select a department"),
  semester: z.string().min(1, "Please select a semester"),
  gender: z.string().min(1, "Please select a gender"),
  captainName: z.string().min(2, "Captain name is required"),
  captainContact: z
    .string()
    .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
  members: z.array(z.string().min(2, "Member name is required")),
});

type TeamFormData = z.infer<typeof baseSchema>;

interface TeamRegistrationFormProps {
  sportId: string;
  sportName: string;
  onBackToSelection: () => void;
}

export const TeamRegistrationForm = ({
  sportId,
  sportName,
  onBackToSelection,
}: TeamRegistrationFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const limit = teamLimits[sportId] || { min: 1, max: 1 };
  const [members, setMembers] = useState<string[]>(Array(limit.min).fill(""));


  const schema = baseSchema.refine(
    (data) =>
      data.members.length >= limit.min && data.members.length <= limit.max,
    {
      message: `Team must have between ${limit.min} and ${limit.max} members.`,
      path: ["members"],
    }
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(schema),
    defaultValues: { members: Array(limit.min).fill("") },
  });

  const addMember = () => {
    if (members.length < limit.max) {
      const updated = [...members, ""];
      setMembers(updated);
      setValue("members", updated);
    } else {
      notifications.showWarning(`Maximum ${limit.max} members allowed.`);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > limit.min) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
      setValue("members", updated);
    } else {
      notifications.showWarning(`Minimum ${limit.min} members required.`);
    }
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
    setValue("members", updated);
  };

  const onSubmit = async (data: TeamFormData) => {
    setIsLoading(true);
    try {
      // Filter out empty members
      const validMembers = data.members.filter(member => member.trim() !== '');

      const response = await fetch('/api/registrations/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sportId: sportId,
          teamName: data.teamName,
          department: data.department,
          semester: data.semester,
          gender: data.gender,
          captainName: data.captainName,
          captainContact: data.captainContact,
          captainEmail: data.captainContact + '@example.com', // You might want to add email field
          members: validMembers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Team registration failed');
      }

      notifications.showSuccess({
        title: "Registration Complete ✅",
        description: `Team "${data.teamName}" registered for ${sportName}. Pending approval.`
      });

      // Clear form and go back to sports selection
      reset();
      setMembers(Array(limit.min).fill(""));
      setTimeout(() => {
        onBackToSelection();
      }, 1500);

    } catch (error) {
      console.error('Team registration error:', error);
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
        {/* Team Information Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Team Information</h3>
                <p className="text-sm text-gray-600">Basic team details and requirements</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-blue-700">
                {limit.min}-{limit.max} members
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="group">
              <Label htmlFor="teamName" className="text-sm font-semibold text-gray-700 mb-2 block">
                Team Name *
              </Label>
              <Input
                id="teamName"
                {...register("teamName")}
                placeholder="Enter your team name (e.g., Thunder Bolts, Fire Dragons)"
                className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm text-base"
              />
              {errors.teamName && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.teamName.message}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label htmlFor="department" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Department *
                </Label>
                <Select onValueChange={(v) => setValue("department", v)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 hover:border-gray-300 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="BCA" className="rounded-lg">Bachelor of Computer Applications</SelectItem>
                    <SelectItem value="BBA" className="rounded-lg">Bachelor of Business Administration</SelectItem>
                    <SelectItem value="BE" className="rounded-lg">Bachelor of Engineering</SelectItem>
                    <SelectItem value="+2" className="rounded-lg">Plus Two (+2)</SelectItem>
                    <SelectItem value="Other" className="rounded-lg">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.department.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="semester" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Semester *
                </Label>
                <Select onValueChange={(v) => setValue("semester", v)}>
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
                {errors.semester && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.semester.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Gender *
                </Label>
                <Select onValueChange={(v) => setValue("gender", v)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 hover:border-gray-300 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="male" className="rounded-lg">Male</SelectItem>
                    <SelectItem value="female" className="rounded-lg">Female</SelectItem>
                    <SelectItem value="other" className="rounded-lg">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.gender.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Captain Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
              <span className="text-yellow-600 text-xl">👑</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Captain Details</h3>
              <p className="text-sm text-gray-600">Team leader and primary contact</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50/80 to-orange-50/80 p-6 rounded-2xl border border-yellow-200/50 backdrop-blur-sm">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="group">
                <Label htmlFor="captainName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Captain Name *
                </Label>
                <Input
                  id="captainName"
                  {...register("captainName")}
                  placeholder="Enter captain's full name"
                  className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm"
                />
                {errors.captainName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.captainName.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="captainContact" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Captain Contact *
                </Label>
                <Input
                  id="captainContact"
                  {...register("captainContact")}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm"
                />
                {errors.captainContact && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.captainContact.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-100 to-teal-100 rounded-xl">
                <span className="text-green-600 text-xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
                <p className="text-sm text-gray-600">Add all team members ({members.length}/{limit.max})</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMember}
              disabled={members.length >= limit.max}
              className="rounded-full px-6 py-2 border-2 hover:bg-green-50 hover:border-green-300 transition-all duration-300 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          <div className="space-y-4">
            {members.map((member, index) => (
              <div key={index} className="group flex gap-4 items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-bold text-blue-600">
                  {index + 1}
                </div>
                <Input
                  placeholder={`Member ${index + 1} full name`}
                  value={member}
                  onChange={(e) => updateMember(index, e.target.value)}
                  className="flex-1 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                />
                {members.length > limit.min && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeMember(index)}
                    className="h-10 w-10 rounded-full border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {errors.members && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> {errors.members.message}
            </p>
          )}
          
          {/* Member count indicator */}
          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-blue-600 text-xl">ℹ️</span>
            <div className="text-sm">
              <span className="font-semibold text-blue-800">
                {members.length < limit.min ? 
                  `Add ${limit.min - members.length} more member${limit.min - members.length > 1 ? 's' : ''} (minimum required)` :
                  `Team complete! You can add ${limit.max - members.length} more member${limit.max - members.length !== 1 ? 's' : ''}.`
                }
              </span>
            </div>
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
            disabled={members.length < limit.min || isLoading}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Complete Team Registration 🏆"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
