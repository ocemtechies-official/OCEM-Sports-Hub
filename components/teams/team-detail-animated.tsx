"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedDivProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

export function AnimatedDiv({ children, className, ...props }: AnimatedDivProps) {
  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  )
}

export function AnimatedHeroSection({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedTabsSection({ children }: { children: ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ delay: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedAvatar({ children }: { children: ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      {children}
    </motion.div>
  )
}