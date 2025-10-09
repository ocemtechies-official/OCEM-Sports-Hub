# CAPTCHA Implementation Plan

This document outlines how to implement CAPTCHA functionality in the authentication system for enhanced security.

## Overview

CAPTCHA (Completely Automated Public Turing test to tell Computers and Humans Apart) is a security mechanism designed to protect web applications from bots and automated attacks. This plan describes how to integrate Google reCAPTCHA v2 Invisible into the authentication forms.

## Prerequisites

1. Google reCAPTCHA account with site keys
2. `react-google-recaptcha` package installed
3. TypeScript definitions for reCAPTCHA

## Implementation Steps

### 1. Install Dependencies

```bash
npm install react-google-recaptcha
npm install --save-dev @types/react-google-recaptcha
```

### 2. Environment Configuration

Add the following to your `.env.local` file:

```env
# reCAPTCHA keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
```

### 3. Component Modifications

For each authentication form (Login, Signup, Forgot Password, Resend Verification), make the following changes:

#### a. Import reCAPTCHA

```typescript
import ReCAPTCHA from "react-google-recaptcha"
```

#### b. Add ref for reCAPTCHA component

```typescript
const recaptchaRef = useRef<ReCAPTCHA>(null)
```

#### c. Add reCAPTCHA component to form

```jsx
{/* reCAPTCHA */}
<div className="flex justify-center">
  <ReCAPTCHA
    ref={recaptchaRef}
    size="invisible"
    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
  />
</div>
```

#### d. Verify reCAPTCHA before form submission

```typescript
const onSubmit = async (data: FormData) => {
  // Verify reCAPTCHA
  const recaptchaValue = await recaptchaRef.current?.executeAsync()
  
  if (!recaptchaValue) {
    notifications.showError("Please complete the CAPTCHA verification")
    return
  }
  
  // Continue with form submission...
}
```

#### e. Reset reCAPTCHA on error

```typescript
// Reset reCAPTCHA on error
recaptchaRef.current?.reset()
```

### 4. Handling Hydration Issues

Since reCAPTCHA manipulates the DOM directly, it can cause hydration issues in Next.js. To prevent this, only render the reCAPTCHA component on the client side:

```typescript
import { useState, useRef, useEffect } from "react"

const [isClient, setIsClient] = useState(false)

useEffect(() => {
  setIsClient(true)
}, [])

// In your render method:
{isClient && (
  <div className="flex justify-center">
    <ReCAPTCHA
      ref={recaptchaRef}
      size="invisible"
      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
    />
  </div>
)}
```

## Security Considerations

1. **Rate Limiting**: Combine CAPTCHA with rate limiting for better protection
2. **Test Keys**: Use test keys during development (shows "This is a test site" badge)
3. **Production Keys**: Replace with actual keys in production environment
4. **Error Handling**: Properly handle CAPTCHA verification failures

## Testing

1. Verify CAPTCHA appears on all authentication forms
2. Test form submission with successful CAPTCHA verification
3. Test form submission with failed CAPTCHA verification
4. Ensure proper error messages are displayed
5. Test on both desktop and mobile devices

## Maintenance

1. Monitor reCAPTCHA usage in Google reCAPTCHA admin console
2. Update site keys if compromised
3. Review CAPTCHA effectiveness periodically
