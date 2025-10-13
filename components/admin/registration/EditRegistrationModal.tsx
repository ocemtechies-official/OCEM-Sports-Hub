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
  Edit3
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Registration Settings for {getSportName(editedSetting.sport_id)}
          </DialogTitle>
          <DialogDescription>
            Modify the registration settings for this sport
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Registration Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
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
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    End Date
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
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Registration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="registration-open" className="text-sm font-medium">
                    Registration Open
                  </Label>
                  <Switch
                    id="registration-open"
                    checked={editedSetting.registration_open}
                    onCheckedChange={(checked) => setEditedSetting({
                      ...editedSetting,
                      registration_open: checked
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {isTeamSport(editedSetting.sport_id) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Team Configuration</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-team-size" className="text-sm font-medium">
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
                  />
                </div>
                <div>
                  <Label htmlFor="max-team-size" className="text-sm font-medium">
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
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Registration Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mixed-gender" className="text-sm font-medium">
                  Allow Mixed Gender Teams
                </Label>
                <Switch
                  id="mixed-gender"
                  checked={editedSetting.allow_mixed_gender}
                  onCheckedChange={(checked) => setEditedSetting({
                    ...editedSetting,
                    allow_mixed_gender: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mixed-department" className="text-sm font-medium">
                  Allow Mixed Department Teams
                </Label>
                <Switch
                  id="mixed-department"
                  checked={editedSetting.allow_mixed_department}
                  onCheckedChange={(checked) => setEditedSetting({
                    ...editedSetting,
                    allow_mixed_department: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requires-approval" className="text-sm font-medium">
                  Requires Admin Approval
                </Label>
                <Switch
                  id="requires-approval"
                  checked={editedSetting.requires_approval}
                  onCheckedChange={(checked) => setEditedSetting({
                    ...editedSetting,
                    requires_approval: checked
                  })}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}