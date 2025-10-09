import * as z from "zod"

export interface PasswordStrength {
  score: number // 0-4 (0: very weak, 4: very strong)
  feedback: string[]
  requirements: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    number: boolean
    symbol: boolean
  }
}

export const passwordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSymbol: true,
}

export function analyzePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= passwordRequirements.minLength,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }

  const feedback: string[] = []
  let score = 0

  // Basic requirements
  if (!requirements.length) {
    feedback.push(`Password must be at least ${passwordRequirements.minLength} characters long`)
  } else {
    score += 1
  }

  if (!requirements.lowercase) {
    feedback.push("Add lowercase letters (a-z)")
  } else {
    score += 0.5
  }

  if (!requirements.uppercase) {
    feedback.push("Add uppercase letters (A-Z)")
  } else {
    score += 0.5
  }

  if (!requirements.number) {
    feedback.push("Add numbers (0-9)")
  } else {
    score += 0.5
  }

  if (!requirements.symbol) {
    feedback.push("Add special characters (!@#$%^&*)")
  } else {
    score += 0.5
  }

  // Additional scoring for longer passwords
  if (password.length >= 12) {
    score += 0.5
  }
  if (password.length >= 16) {
    score += 0.5
  }

  // Check for common patterns and reduce score
  if (/(.)\1{2,}/.test(password)) {
    feedback.push("Avoid repeating characters")
    score -= 0.5
  }

  if (/123456|abcdef|qwerty|password/i.test(password)) {
    feedback.push("Avoid common patterns or words")
    score -= 1
  }

  // Normalize score to 0-4 range
  score = Math.max(0, Math.min(4, Math.floor(score)))

  if (score >= 4 && feedback.length === 0) {
    feedback.push("Excellent! Your password is very strong")
  } else if (score >= 3) {
    feedback.push("Good password strength")
  } else if (score >= 2) {
    feedback.push("Fair password strength - consider improving")
  } else if (score >= 1) {
    feedback.push("Weak password - please strengthen")
  } else {
    feedback.push("Very weak password - please improve significantly")
  }

  return {
    score,
    feedback,
    requirements,
  }
}

export function generateStrongPassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  // Ensure at least one character from each category
  const requiredChars = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]

  const allChars = lowercase + uppercase + numbers + symbols
  const remainingLength = length - requiredChars.length

  // Generate remaining characters
  const remainingChars = Array.from({ length: remainingLength }, () =>
    allChars[Math.floor(Math.random() * allChars.length)]
  )

  // Combine and shuffle
  const allPasswordChars = [...requiredChars, ...remainingChars]
  
  // Fisher-Yates shuffle
  for (let i = allPasswordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPasswordChars[i], allPasswordChars[j]] = [allPasswordChars[j], allPasswordChars[i]]
  }

  return allPasswordChars.join('')
}

export const createPasswordSchema = (requireConfirmation: boolean = false) => {
  const passwordSchema = z
    .string()
    .min(passwordRequirements.minLength, `Password must be at least ${passwordRequirements.minLength} characters`)
    .max(passwordRequirements.maxLength, `Password must not exceed ${passwordRequirements.maxLength} characters`)
    .refine((password) => /[a-z]/.test(password), "Password must contain at least one lowercase letter")
    .refine((password) => /[A-Z]/.test(password), "Password must contain at least one uppercase letter")
    .refine((password) => /\d/.test(password), "Password must contain at least one number")
    .refine((password) => /[^A-Za-z0-9]/.test(password), "Password must contain at least one special character")

  if (requireConfirmation) {
    return z
      .object({
        password: passwordSchema,
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      })
  }

  return passwordSchema
}

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(passwordRequirements.minLength, `Password must be at least ${passwordRequirements.minLength} characters`)
      .max(passwordRequirements.maxLength, `Password must not exceed ${passwordRequirements.maxLength} characters`)
      .refine((password) => /[a-z]/.test(password), "Password must contain at least one lowercase letter")
      .refine((password) => /[A-Z]/.test(password), "Password must contain at least one uppercase letter")
      .refine((password) => /\d/.test(password), "Password must contain at least one number")
      .refine((password) => /[^A-Za-z0-9]/.test(password), "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const resetPasswordSchema = z
  .object({
    password: createPasswordSchema(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>