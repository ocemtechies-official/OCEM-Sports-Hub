"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  User,
  Eye,
  MessageSquare,
  Loader2,
  AlertCircle,
  UserCheck,
  Calendar,
  Phone,
  Trophy,
  Target,
  Mail,
  Hash,
  Building,
  BookOpen,
  X,
  ChevronRight,
  Shield,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Clean status configuration
const statusConfig = {
  pending: { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: Clock,
    label: 'Pending',
    dot: 'bg-amber-500'
  },
  approved: { 
    color: 'bg-green-50 text-green-700 border-green-200', 
    icon: CheckCircle,
    label: 'Approved',
    dot: 'bg-green-500'
  },
  rejected: { 
    color: 'bg-red-50 text-red-700 border-red-200', 
    icon: XCircle,
    label: 'Rejected',
    dot: 'bg-red-500'
  },
  withdrawn: { 
    color: 'bg-gray-50 text-gray-700 border-gray-200', 
    icon: AlertCircle,
    label: 'Withdrawn',
    dot: 'bg-gray-500'
  },
};

interface RegistrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  onStatusUpdate: (registrationId: string, status: string, type: "individual" | "team") => Promise<void>;
  updatingStatus: boolean;
}

export default function RegistrationDetailModal({
  isOpen,
  onClose,
  registration,
  adminNotes,
  setAdminNotes,
  onStatusUpdate,
  updatingStatus
}: RegistrationDetailModalProps) {

  const [activeTab, setActiveTab] = useState<'details' | 'admin'>('details');

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", config.dot)} />
        <span className="text-sm font-medium text-gray-600">{config.label}</span>
      </div>
    );
  };

  if (!registration) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full max-h-[95vh] flex flex-col bg-white border-0 shadow-xl p-0">
        {/* Clean Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              {registration.type === 'individual' ? (
                <User className="h-6 w-6 text-blue-600" />
              ) : (
                <Users className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {registration.type === 'individual' 
                  ? registration.student_name 
                  : registration.team_name}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {registration.sports?.name || 'Unknown Sport'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(registration.registered_at).toLocaleDateString()}
                </span>
                {getStatusBadge(registration.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('details')}
            className={cn(
              "flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'details'
                ? "border-blue-500 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            Registration Details
          </button>
          {registration.status === 'pending' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={cn(
                "flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'admin'
                  ? "border-blue-500 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              Admin Review
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                {registration.type === 'individual' ? (
                  <IndividualDetails registration={registration} />
                ) : (
                  <TeamDetails registration={registration} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <AdminReview
                  registration={registration}
                  adminNotes={adminNotes}
                  setAdminNotes={setAdminNotes}
                  onStatusUpdate={onStatusUpdate}
                  updatingStatus={updatingStatus}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Individual Registration Details Component
function IndividualDetails({ registration }: { registration: any }) {
  const details = [
    { label: 'Roll Number', value: registration.roll_number, icon: Hash },
    { label: 'Email', value: registration.email, icon: Mail },
    { label: 'Phone', value: registration.contact_number, icon: Phone },
    { label: 'Gender', value: registration.gender, icon: User },
    { label: 'Department', value: registration.department, icon: Building },
    { label: 'Semester', value: `Semester ${registration.semester}`, icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map((detail, index) => {
          const IconComponent = detail.icon;
          return (
            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <IconComponent className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">{detail.label}</p>
                <p className="font-medium text-gray-900 truncate">{detail.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-md">
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-emerald-700 font-medium">Skill Level</p>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mt-1">
              {registration.skill_level?.charAt(0).toUpperCase() + registration.skill_level?.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// Team Registration Details Component
function TeamDetails({ registration }: { registration: any }) {
  const teamDetails = [
    { label: 'Captain', value: registration.captain_name, icon: UserCheck },
    { label: 'Captain Contact', value: registration.captain_contact, icon: Phone },
    { label: 'Captain Email', value: registration.captain_email, icon: Mail },
    { label: 'Gender Category', value: registration.gender, icon: Users },
    { label: 'Department', value: registration.department, icon: Building },
    { label: 'Semester', value: `Semester ${registration.semester}`, icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamDetails.map((detail, index) => {
          const IconComponent = detail.icon;
          return (
            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <IconComponent className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">{detail.label}</p>
                <p className="font-medium text-gray-900 truncate">{detail.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Team Members</h3>
            <Badge variant="outline" className="text-xs">
              {registration.team_registration_members?.length || 0} members
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {registration.team_registration_members?.map((member: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {member.member_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{member.member_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      #{member.member_order}
                    </Badge>
                    {member.is_captain && (
                      <Badge className="bg-amber-100 text-amber-800 text-xs px-1 py-0">
                        Captain
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(!registration.team_registration_members || registration.team_registration_members.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No team members found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Admin Review Component
function AdminReview({
  registration,
  adminNotes,
  setAdminNotes,
  onStatusUpdate,
  updatingStatus
}: {
  registration: any;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  onStatusUpdate: (registrationId: string, status: string, type: "individual" | "team") => Promise<void>;
  updatingStatus: boolean;
}) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const quickNotes = [
    "Registration approved. All details verified.",
    "Registration rejected. Please verify details and resubmit.",
    "Registration needs clarification. Contact admin.",
  ];

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onStatusUpdate(registration.id, 'approved', registration.type);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await onStatusUpdate(registration.id, 'rejected', registration.type);
    } finally {
      setRejecting(false);
    }
  };

  const isAnyLoading = approving || rejecting || updatingStatus;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">Admin Review Required</span>
        </div>
        <p className="text-sm text-amber-700">
          Review all registration details carefully before making your decision.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Admin Notes (Optional)
        </label>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Add notes, feedback, or reasons for your decision..."
          className="w-full min-h-[150px] resize-none"
          rows={6}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {quickNotes.map((note, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setAdminNotes(note)}
              className="text-xs h-7"
              disabled={isAnyLoading}
            >
              {note.split(' ')[0]}...
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAdminNotes("")}
            className="text-xs h-7"
            disabled={isAnyLoading}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={handleApprove}
          disabled={isAnyLoading}
          className="h-12 bg-green-600 hover:bg-green-700 text-white"
        >
          {approving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Approve Registration
        </Button>
        <Button
          onClick={handleReject}
          disabled={isAnyLoading}
          variant="destructive"
          className="h-12"
        >
          {rejecting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          Reject Registration
        </Button>
      </div>
    </div>
  );
}