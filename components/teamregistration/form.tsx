"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Users, Plus, X } from "lucide-react";
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
import { toast } from "sonner";

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
}

export const TeamRegistrationForm = ({
  sportId,
  sportName,
}: TeamRegistrationFormProps) => {
  const router = useRouter();

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
      toast.warning(`Maximum ${limit.max} members allowed.`);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > limit.min) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
      setValue("members", updated);
    } else {
      toast.warning(`Minimum ${limit.min} members required.`);
    }
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
    setValue("members", updated);
  };

  const onSubmit = (data: TeamFormData) => {
    toast.success("Registration Successful! 🎉", {
      description: `Team "${data.teamName}" registered for ${sportName}`,
    });
    console.log("✅ Registered Team:", { ...data, sport: sportName });
    setTimeout(() => router.push("/"), 2000);
  };

  return (
    <Card className="animate-fade-in border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary">
          <Users className="h-7 w-7" />
          {sportName} – Team Registration
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-1">
          Minimum: {limit.min} | Maximum: {limit.max} members allowed
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-8">
        {/* 🏷️ Team Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="teamName" className="text-lg font-medium">
              Team Name *
            </Label>
            <Input
              id="teamName"
              {...register("teamName")}
              placeholder="Enter your team name"
              className="mt-2 text-base h-12"
            />
            {errors.teamName && (
              <p className="text-destructive text-sm mt-1">
                {errors.teamName.message}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="department" className="text-lg font-medium">
                Department *
              </Label>
              <Select onValueChange={(v) => setValue("department", v)}>
                <SelectTrigger className="mt-2 h-12 text-base">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="BBA">BBA</SelectItem>
                  <SelectItem value="BE">BE</SelectItem>
                  <SelectItem value="+2">+2</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-destructive text-sm mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="semester" className="text-lg font-medium">
                Semester *
              </Label>
              <Select onValueChange={(v) => setValue("semester", v)}>
                <SelectTrigger className="mt-2 h-12 text-base">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.semester && (
                <p className="text-destructive text-sm mt-1">
                  {errors.semester.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 🧢 Captain Details */}
        <div className="bg-muted/30 p-6 rounded-2xl space-y-4 border border-muted">
          <h3 className="text-xl font-semibold text-foreground">
            Captain Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="captainName">Captain Name *</Label>
              <Input
                id="captainName"
                {...register("captainName")}
                placeholder="Enter captain's full name"
                className="mt-2 h-12 text-base"
              />
              {errors.captainName && (
                <p className="text-destructive text-sm mt-1">
                  {errors.captainName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="captainContact">Captain Contact *</Label>
              <Input
                id="captainContact"
                {...register("captainContact")}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="mt-2 h-12 text-base"
              />
              {errors.captainContact && (
                <p className="text-destructive text-sm mt-1">
                  {errors.captainContact.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 👥 Team Members */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">
              Team Members
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMember}
              disabled={members.length >= limit.max}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </div>

          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={index} className="flex gap-3">
                <Input
                  placeholder={`Member ${index + 1} full name`}
                  value={member}
                  onChange={(e) => updateMember(index, e.target.value)}
                  className="flex-1 h-12 text-base"
                />
                {members.length > limit.min && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeMember(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {errors.members && (
            <p className="text-destructive text-sm mt-1">
              {errors.members.message}
            </p>
          )}
        </div>

        {/* 📝 Submit Section */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 py-3 text-base"
            onClick={() => router.push("/register")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 py-3 text-base bg-primary hover:bg-primary/90"
            onClick={handleSubmit(onSubmit)}
          >
            Complete Registration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
