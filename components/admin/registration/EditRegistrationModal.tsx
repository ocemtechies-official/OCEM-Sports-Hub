"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Users, 
  Save, 
  RefreshCw,
  Edit3,
  Clock,
  Hash,
  VenetianMask,
  Building,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { notifications } from "@/lib/notifications";

interface Sport {
  id: string;
  name: string;
  icon: string | null;
  is_team_sport: boolean;
  is_active: boolean;
}

interface RegistrationSetting {
  id: string;
  sport_id: string;
  registration_open: boolean;
  registration_start: string | null;
  registration_end: string | null;
  min_team_size: number | null;
  max_team_size: number | null;
  allow_mixed_gender: boolean;
  allow_mixed_department: boolean;
  requires_approval: boolean;
  max_registrations_per_sport: number | null;
  sport?: Sport;
}

interface EditRegistrationModalProps {
  setting: RegistrationSetting | null;
  sports: Sport[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedSetting: RegistrationSetting) => void;
}

export function EditRegistrationModal({
  setting,
  sports,
  open,
  onOpenChange,
  onSave
}: EditRegistrationModalProps) {
  const [saving, setSaving] = useState(false);
  const [editedSetting, setEditedSetting] = useState<RegistrationSetting | null>(null);

  // Initialize edited setting when modal opens
  useEffect(() => {
    if (setting && open) {
      setEditedSetting({ ...setting });
    }
  }, [setting, open]);

  const getSportName = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    return sport ? sport.name : 'Unknown Sport';
  };

  const isTeamSport = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    return sport?.is_team_sport || false;
  };

  const handleSave = async () => {
    if (!editedSetting) return;
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/registration/settings/${editedSetting.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedSetting),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update registration setting');
      }
      
      const updatedSetting = await response.json();
      onSave(updatedSetting);
      
      notifications.showSuccess({
        title: "Setting Updated ✅",
        description: "Registration setting has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      notifications.showError({
        title: "Update Failed ❌",
        description: "Failed to update registration setting"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!editedSetting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-xl">
        <>
          {/* Header with enhanced gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white rounded-t-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-4 text-3xl font-bold">
                <Edit3 className="h-8 w-8" />
                <div>
                  <div>Edit {getSportName(editedSetting.sport_id)} Registration</div>
                  <div className="text-xl font-normal opacity-90 mt-1">
                    Modify registration settings
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-3 text-lg">
                Update the registration settings for {getSportName(editedSetting.sport_id)}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          {/* Content with improved spacing and layout */}
          <div className="p-6 space-y-6 bg-gray-50">
            {/* Registration Period Card */}
            <Card className="border-0 shadow-lg rounded-xl">
              <CardHeader className="pb-4 border-b bg-white rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Registration Period
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 bg-white rounded-b-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="start-date" className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      Start Date & Time
                    </Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      value={editedSetting.registration_start ? 
                        new Date(editedSetting.registration_start).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditedSetting({
                        ...editedSetting,
                        registration_start: e.target.value || null
                      })}
                      className="p-3 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      End Date & Time
                    </Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={editedSetting.registration_end ? 
                        new Date(editedSetting.registration_end).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditedSetting({
                        ...editedSetting,
                        registration_end: e.target.value || null
                      })}
                      className="p-3 text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Registration Status Card */}
            <Card className="border-0 shadow-lg rounded-xl">
              <CardHeader className="pb-4 border-b bg-white rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  Registration Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 bg-white rounded-b-xl">
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border">
                  <Label htmlFor="registration-open" className="text-base font-medium flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    Registration Open
                  </Label>
                  <Switch
                    id="registration-open"
                    checked={editedSetting.registration_open}
                    onCheckedChange={(checked) => setEditedSetting({
                      ...editedSetting,
                      registration_open: checked
                    })}
                    className="scale-125"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Team Configuration Card (only for team sports) */}
            {isTeamSport(editedSetting.sport_id) && (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardHeader className="pb-4 border-b bg-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <Users className="h-6 w-6 text-blue-600" />
                    Team Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 bg-white rounded-b-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="min-team-size" className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4" />
                        Minimum Team Size
                      </Label>
                      <Input
                        id="min-team-size"
                        type="number"
                        min="1"
                        value={editedSetting.min_team_size || ''}
                        onChange={(e) => setEditedSetting({
                          ...editedSetting,
                          min_team_size: e.target.value ? parseInt(e.target.value) : null
                        })}
                        className="p-3 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-team-size" className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4" />
                        Maximum Team Size
                      </Label>
                      <Input
                        id="max-team-size"
                        type="number"
                        min="1"
                        value={editedSetting.max_team_size || ''}
                        onChange={(e) => setEditedSetting({
                          ...editedSetting,
                          max_team_size: e.target.value ? parseInt(e.target.value) : null
                        })}
                        className="p-3 text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Registration Options Card */}
            <Card className="border-0 shadow-lg rounded-xl">
              <CardHeader className="pb-4 border-b bg-white rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  Registration Options
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 bg-white rounded-b-xl space-y-4">
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border">
                  <Label htmlFor="mixed-gender" className="text-base font-medium flex items-center gap-3">
                    <VenetianMask className="w-5 h-5 text-gray-600" />
                    Allow Mixed Gender Teams
                  </Label>
                  <Switch
                    id="mixed-gender"
                    checked={editedSetting.allow_mixed_gender}
                    onCheckedChange={(checked) => setEditedSetting({
                      ...editedSetting,
                      allow_mixed_gender: checked
                    })}
                    className="scale-125"
                  />
                </div>
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border">
                  <Label htmlFor="mixed-department" className="text-base font-medium flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-600" />
                    Allow Mixed Department Teams
                  </Label>
                  <Switch
                    id="mixed-department"
                    checked={editedSetting.allow_mixed_department}
                    onCheckedChange={(checked) => setEditedSetting({
                      ...editedSetting,
                      allow_mixed_department: checked
                    })}
                    className="scale-125"
                  />
                </div>
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border">
                  <Label htmlFor="requires-approval" className="text-base font-medium flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    Requires Admin Approval
                  </Label>
                  <Switch
                    id="requires-approval"
                    checked={editedSetting.requires_approval}
                    onCheckedChange={(checked) => setEditedSetting({
                      ...editedSetting,
                      requires_approval: checked
                    })}
                    className="scale-125"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 py-3 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-md"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
}