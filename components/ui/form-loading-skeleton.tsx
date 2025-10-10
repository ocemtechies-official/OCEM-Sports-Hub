import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface FormLoadingSkeletonProps {
  formType?: 'individual' | 'team';
}

export const FormLoadingSkeleton = ({ formType = 'individual' }: FormLoadingSkeletonProps) => {
  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Personal Details Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        
        <div className="grid gap-6">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-44 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="grid gap-6">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Skill Level / Team Members Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        
        {formType === 'individual' ? (
          // Skill Level Radio Options
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 mb-3" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-xl">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-5 w-5 rounded-full mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Team Members Section
          <div className="space-y-4">
            <Skeleton className="h-4 w-32 mb-4" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="flex-1 h-12 rounded-xl" />
      </div>
    </div>
  );
};