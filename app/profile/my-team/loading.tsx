export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-slate-200" />

        <div className="rounded-2xl border bg-white p-6 space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-64 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-3">
            <div className="h-9 w-24 rounded-lg bg-slate-100" />
            <div className="h-9 w-28 rounded-lg bg-slate-100" />
          </div>

          {/* General form skeleton */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded" />
            </div>
          </div>

          {/* Members list skeleton */}
          <div className="space-y-4">
            {[0,1,2].map((i) => (
              <div key={i} className="rounded-xl border p-4 bg-slate-50">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="h-10 bg-slate-100 rounded" />
                  <div className="h-10 bg-slate-100 rounded" />
                  <div className="h-10 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


