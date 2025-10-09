"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "lucide-react";
import { toast } from "sonner";
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
}

export const IndividualRegistrationForm = ({ sportId, sportName }: IndividualRegistrationFormProps) => {
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<IndividualFormData>({
    resolver: zodResolver(individualSchema),
  });

  const onSubmit = (data: IndividualFormData) => {
    console.log("Individual Registration:", { ...data, sport: sportName });

    toast.success("Registration Successful! 🎉", {
      description: `${data.studentName} has been registered for ${sportName}`,
    });

    // Redirect after short delay
    setTimeout(() => router.push("/"), 2000);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Individual Registration Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentName">Full Name *</Label>
              <Input id="studentName" {...register("studentName")} placeholder="Enter your full name" className="mt-1" />
              {errors.studentName && <p className="text-destructive text-sm mt-1">{errors.studentName.message}</p>}
            </div>

            <div>
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input id="rollNumber" {...register("rollNumber")} placeholder="Enter your roll number" className="mt-1" />
              {errors.rollNumber && <p className="text-destructive text-sm mt-1">{errors.rollNumber.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select onValueChange={(value) => setValue("department", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="BBA">BBA</SelectItem>
                    <SelectItem value="BE">BE</SelectItem>
                    <SelectItem value="+2">+2</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-destructive text-sm mt-1">{errors.department.message}</p>}
              </div>

              <div>
                <Label htmlFor="semester">Semester *</Label>
                <Select onValueChange={(value) => setValue("semester", value)}>
                  <SelectTrigger className="mt-1">
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
                {errors.semester && <p className="text-destructive text-sm mt-1">{errors.semester.message}</p>}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 p-4 bg-gradient-card rounded-lg">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            
            <div>
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input id="contactNumber" {...register("contactNumber")} placeholder="10-digit mobile number" maxLength={10} className="mt-1" />
              {errors.contactNumber && <p className="text-destructive text-sm mt-1">{errors.contactNumber.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="your.email@example.com" className="mt-1" />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Skill Level */}
          <div className="space-y-3">
            <Label>Skill Level *</Label>
            <RadioGroup onValueChange={(value) => setValue("skillLevel", value as any)}>
              {["beginner", "intermediate", "advanced"].map((level) => (
                <div
                  key={level}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <RadioGroupItem value={level} id={level} />
                  <Label htmlFor={level} className="flex-1 cursor-pointer">
                    <div className="font-medium">{level.charAt(0).toUpperCase() + level.slice(1)}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.skillLevel && <p className="text-destructive text-sm">{errors.skillLevel.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/register")}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-lue-200" onClick={() => router.push("/register")}>
              Complete Registration
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
