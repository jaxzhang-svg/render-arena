import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Fake Header */}
      <header className="sticky top-0 z-50 border-b border-[#e7e6e2] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-[6px]">
            <Skeleton className="h-[15px] w-[24px] rounded-sm" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-8">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section Skeleton */}
        <section className="relative w-full px-6 py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
            {/* Live Badge */}
            <Skeleton className="h-[26px] w-[200px] rounded-full" />

            {/* Heading */}
            <div className="flex w-full max-w-[820px] flex-col items-center gap-2">
              <Skeleton className="h-[60px] w-3/4 rounded-lg" />
              <Skeleton className="h-[60px] w-1/2 rounded-lg" />
            </div>

            {/* Featured Case / Content Placeholder */}
            <Skeleton className="h-[200px] w-full rounded-xl" />

            {/* Textarea Input Section */}
            <div className="flex w-full max-w-[787px] flex-col items-center gap-8">
              <Skeleton className="h-[50px] w-full rounded-full" />

              {/* Category Buttons */}
              <div className="flex w-full flex-wrap items-center justify-center gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
