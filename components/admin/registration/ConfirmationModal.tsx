"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: "warning" | "success" | "info";
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />;
      case "info":
        return <Info className="h-12 w-12 text-blue-500 mx-auto" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case "success":
        return "default";
      case "info":
        return "default";
      default:
        return "destructive";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="mx-auto flex justify-center mb-4">
            {getIcon()}
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {title}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                onCancel?.();
              }}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={getConfirmButtonVariant()}
              className="flex-1"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}