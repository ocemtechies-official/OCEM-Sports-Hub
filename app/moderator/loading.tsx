import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ModeratorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Updated container with proper padding */}
      <div className="relative z-10 px-4 md:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-48 rounded-full mx-auto mb-6" />
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md rounded-xl p-5">
              <CardContent className="p-0">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>

        {/* Live Matches Section */}
        <div className="mb-12">
          <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="border-0 shadow-md rounded-xl">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div>
                              <Skeleton className="h-5 w-24 mb-1" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-lg" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                          
                          <div className="flex items-center justify-center my-1">
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <Skeleton className="h-6 w-8 rounded-full mx-1" />
                            <div className="flex-1 h-px bg-slate-200"></div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-lg" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-8 w-24 rounded-md" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Matches Section */}
        <div className="mb-12">
          <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-6 w-40 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-0 shadow-md rounded-xl">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div>
                              <Skeleton className="h-5 w-24 mb-1" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-lg" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                          
                          <div className="flex items-center justify-center my-1">
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <Skeleton className="h-6 w-8 rounded-full mx-1" />
                            <div className="flex-1 h-px bg-slate-200"></div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-lg" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-8 w-24 rounded-md" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Info */}
        <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-40 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="flex flex-wrap gap-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-20 rounded-full" />
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="flex flex-wrap gap-3">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-24 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}