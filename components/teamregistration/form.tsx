"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Users, Plus, X, Loader2 } from "lucide-react";
import { FormLoadingSkeleton } from "@/components/ui/form-loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notifications } from "@/lib/notifications";

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
  captainEmail: z.string().email("Please enter a valid email address"),
  members: z.array(z.string()).min(1, "At least one member is required"),
});

type TeamFormData = z.infer<typeof baseSchema>;

interface TeamRegistrationFormProps {
  sportId: string;
  sportName: string;
  onBackToSelection: () => void;
}

interface SportLimits {
  min: number;
  max: number;
}

export const TeamRegistrationForm = ({
  sportId,
  sportName,
  onBackToSelection,
}: TeamRegistrationFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sportLimits, setSportLimits] = useState<SportLimits>({ min: 1, max: 1 });
  const [members, setMembers] = useState<string[]>([""]);
  const [isFetchingLimits, setIsFetchingLimits] = useState(true);

  // Fetch sport limits from database
  useEffect(() => {
    const fetchSportLimits = async () => {
      try {
        setIsFetchingLimits(true);
        const response = await fetch(`/api/sports?id=${sportId}&active_only=true`);
        if (response.ok) {
          const data = await response.json();
          if (data.sports && data.sports.length > 0) {
            const sport = data.sports[0];
            const limits = {
              min: sport.min_players || 1,
              max: sport.max_players || 1
            };
            setSportLimits(limits);
            setMembers(Array(limits.min).fill(""));
          } else {
            // Fallback to default values if sport not found
            const defaultLimits = { min: 1, max: 1 };
            setSportLimits(defaultLimits);
            setMembers(Array(defaultLimits.min).fill(""));
          }
        } else {
          // Fallback to default values if API fails
          const defaultLimits = { min: 1, max: 1 };
          setSportLimits(defaultLimits);
          setMembers(Array(defaultLimits.min).fill(""));
        }
      } catch (error) {
        console.error("Error fetching sport limits:", error);
        // Fallback to default values if API fails
        const defaultLimits = { min: 1, max: 1 };
        setSportLimits(defaultLimits);
        setMembers(Array(defaultLimits.min).fill(""));
      } finally {
        setIsFetchingLimits(false);
      }
    };

    if (sportId) {
      fetchSportLimits();
    } else {
      setIsFetchingLimits(false);
    }
  }, [sportId]);

  // Define schema and form after state initialization to avoid hook order issues
  const schema = baseSchema.refine(
    (data) => {
      const validMembers = data.members.filter(member => member.trim() !== '');
      return validMembers.length >= sportLimits.min && validMembers.length <= sportLimits.max;
    },
    {
      message: `Team must have between ${sportLimits.min} and ${sportLimits.max} members.`,
      path: ["members"],
    }
  ).refine(
    (data) => {
      // Ensure all members have valid names (at least 2 characters)
      const validMembers = data.members.filter(member => member.trim() !== '');
      return validMembers.every(member => member.trim().length >= 2);
    },
    {
      message: "All member names must be at least 2 characters long.",
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
    defaultValues: { members: Array(sportLimits.min).fill("") },
  });

  // Wait for sport limits to be loaded
  if (isFetchingLimits) {
    return <FormLoadingSkeleton />;
  }

  const addMember = () => {
    if (members.length < sportLimits.max) {
      const updated = [...members, ""];
      setMembers(updated);
      setValue("members", updated);
    } else {
      notifications.showWarning(`Maximum ${sportLimits.max} members allowed.`);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > sportLimits.min) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
      setValue("members", updated);
    } else {
      notifications.showWarning(`Minimum ${sportLimits.min} members required.`);
    }
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
    setValue("members", updated);
  };

  const onSubmit = async (data: TeamFormData) => {
    console.log('Form data submitted:', data); // Debug log
    setIsLoading(true);
    try {
      // Filter out empty members
      const validMembers = data.members.filter(member => member.trim() !== '');
      console.log('Valid members:', validMembers); // Debug log

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
          captainEmail: data.captainEmail,
          members: validMembers,
        }),
      });

      const result = await response.json();
      console.log('API Response:', result); // Debug log

      if (!response.ok) {
        throw new Error(result.error || 'Team registration failed');
      }

      notifications.showSuccess({
        title: "Registration Complete ✅",
        description: `Team "${data.teamName}" registered for ${sportName}. Pending approval.`
      });

      // Clear form and go back to sports selection
      reset();
      setMembers(Array(sportLimits.min).fill(""));
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
                {sportLimits.min}-{sportLimits.max} members
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
              
              <div className="group">
                <Label htmlFor="captainEmail" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Captain Email *
                </Label>
                <Input
                  id="captainEmail"
                  type="email"
                  {...register("captainEmail")}
                  placeholder="Enter captain's email address"
                  className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm"
                />
                {errors.captainEmail && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.captainEmail.message}
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
                <p className="text-sm text-gray-600">Add all team members including captain ({members.length}/{sportLimits.max})</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMember}
              disabled={members.length >= sportLimits.max}
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
                {members.length > sportLimits.min && (
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
                {members.length < sportLimits.min ? 
                  `Add ${sportLimits.min - members.length} more member${sportLimits.min - members.length > 1 ? 's' : ''} (minimum required)` :
                  `Team complete! You can add ${sportLimits.max - members.length} more member${sportLimits.max - members.length !== 1 ? 's' : ''}.`
                }
              </span>
              <p className="text-blue-700 mt-1">
                Note: The captain is included in the member count. You need a total of {sportLimits.min}-{sportLimits.max} team members.
              </p>
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
            disabled={members.length < sportLimits.min || isLoading}
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