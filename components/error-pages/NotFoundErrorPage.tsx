"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, Undo2, Trophy, Dumbbell } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <GradientGrid />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col-reverse items-center gap-12 md:flex-row"
      >
        <div className="text-center md:text-left">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Game Over!
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-7xl font-black tracking-tight text-transparent sm:text-8xl md:text-9xl"
          >
            404
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 max-w-xl text-balance text-muted-foreground"
          >
            Looks like you've gone offside! The page you're looking for doesn't exist in our sports hub. 
            Let's get you back in the game.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 grid grid-cols-2 items-center justify-center gap-3 md:justify-start"
          >
            <Button asChild size="lg" className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="group"
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button asChild variant="ghost" size="lg" className="group col-span-2">
              <Link href="/tournaments">
                <Trophy className="mr-2 h-4 w-4" />
                View Tournaments
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="relative -mt-20 ml-14 h-[26rem] w-[26rem] sm:-mt-24 sm:ml-20 sm:h-[30rem] sm:w-[30rem] md:-mt-28 md:ml-28 md:h-[34rem] md:w-[34rem]">
          <SportsIllustration />
        </div>
      </motion.div>
      <FloatingOrbs />
      <Glow />
    </div>
  )
}

function GradientGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_110%,hsl(var(--primary)/0.15),transparent),linear-gradient(to_bottom,transparent,hsl(var(--foreground)/0.03))]" />
      <div className="absolute inset-0 [background:linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
    </div>
  )
}

function Glow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center">
      <div className="h-56 w-[40rem] rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl" />
    </div>
  )
}

function SportsIllustration() {
  return (
    <div className="relative h-full w-full">
      {/* Basketball */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
      >
        <div className="absolute w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/30"></div>
        </div>
      </motion.div>

      {/* Football */}
      <motion.div
        className="absolute top-1/3 right-1/3 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      >
        <div className="absolute w-10 h-10 rounded-full border-2 border-white/30"></div>
        <div className="absolute w-16 h-1 rotate-45 bg-white/30"></div>
        <div className="absolute w-16 h-1 -rotate-45 bg-white/30"></div>
      </motion.div>

      {/* Tennis Ball */}
      <motion.div
        className="absolute bottom-1/3 left-1/3 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
      >
        <div className="absolute w-8 h-8 rounded-full border-2 border-white/30"></div>
        <div className="absolute w-12 h-1 bg-white/30"></div>
        <div className="absolute w-12 h-1 rotate-90 bg-white/30"></div>
      </motion.div>

      {/* Trophy */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-16 h-20 flex items-center justify-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-12 h-16 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-lg flex flex-col items-center pt-2">
          <div className="w-8 h-2 bg-yellow-300 rounded-full mb-1"></div>
          <div className="w-6 h-2 bg-yellow-300 rounded-full"></div>
        </div>
        <div className="absolute -bottom-2 w-16 h-4 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-b-lg"></div>
      </motion.div>

      {/* Main Trophy (Center) */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-24 flex items-center justify-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-16 h-20 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-lg flex flex-col items-center pt-3 shadow-2xl">
          <div className="w-10 h-2 bg-yellow-200 rounded-full mb-2"></div>
          <div className="w-8 h-2 bg-yellow-200 rounded-full"></div>
          <Dumbbell className="h-6 w-6 text-yellow-700 mt-2" />
        </div>
        <div className="absolute -bottom-3 w-20 h-5 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-b-lg"></div>
        <div className="absolute -top-4 w-8 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">404</span>
        </div>
      </motion.div>
    </div>
  )
}

function FloatingOrbs() {
  const orbs = [
    { size: 220, x: -280, y: -80, c: "from-blue-500/20 to-purple-500/20" },
    { size: 140, x: 280, y: 40, c: "from-purple-500/20 to-indigo-500/20" },
    { size: 90, x: -40, y: 160, c: "from-indigo-500/20 to-blue-500/20" },
  ] as const

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-2xl bg-gradient-to-r ${o.c}`}
          style={{
            width: o.size,
            height: o.size,
            left: `calc(50% + ${o.x}px)`,
            top: `calc(50% + ${o.y}px)`,
          }}
          initial={{ y: 0 }}
          animate={{ y: [ -8, 8, -8 ] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}