import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number | string) {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price || 0)
}

/**
 * Validates Pakistani phone numbers
 * Accepts formats:
 * - +92 3XX XXXXXXX (international format with space)
 * - +923XXXXXXXXX (international format without space)
 * - 03XX XXXXXXX (local format with space)
 * - 03XXXXXXXXX (local format without space)
 * - 3XXXXXXXXX (without country code or leading zero)
 * 
 * @param phone - Phone number string to validate
 * @returns Object with isValid boolean and formatted phone number
 */
export function validatePakistaniPhone(phone: string): { isValid: boolean; formatted: string; error?: string } {
  if (!phone || phone.trim() === '') {
    return { isValid: false, formatted: '', error: 'Phone number is required' }
  }

  // Remove all spaces, dashes, and parentheses for validation
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')

  // Pakistani mobile number patterns
  // Format: +92 3XX XXXXXXX or 03XX XXXXXXX
  // Mobile numbers start with 3 (after country code or 0)
  // Valid prefixes: 300-399 (mobile operators)
  
  // Pattern 1: +923XXXXXXXXX (11 digits after +92)
  const pattern1 = /^\+923\d{9}$/
  
  // Pattern 2: 03XXXXXXXXX (11 digits starting with 03)
  const pattern2 = /^03\d{9}$/
  
  // Pattern 3: 3XXXXXXXXX (10 digits starting with 3, without country code)
  const pattern3 = /^3\d{9}$/

  let isValid = false
  let formatted = phone

  if (pattern1.test(cleaned)) {
    // International format: +923XXXXXXXXX
    isValid = true
    formatted = cleaned // Keep as +923XXXXXXXXX
  } else if (pattern2.test(cleaned)) {
    // Local format: 03XXXXXXXXX
    isValid = true
    formatted = cleaned // Keep as 03XXXXXXXXX
  } else if (pattern3.test(cleaned)) {
    // Without leading zero: 3XXXXXXXXX
    isValid = true
    formatted = `0${cleaned}` // Add leading zero for local format
  } else {
    // Try to fix common issues
    // If it starts with 92 but missing +, add it
    if (cleaned.startsWith('92') && cleaned.length === 12) {
      const fixed = `+${cleaned}`
      if (pattern1.test(fixed)) {
        isValid = true
        formatted = fixed
      }
    }
    // If it's 11 digits but doesn't start with 0 or +92, try adding 0
    else if (/^\d{11}$/.test(cleaned) && !cleaned.startsWith('0') && !cleaned.startsWith('92')) {
      const fixed = `0${cleaned}`
      if (pattern2.test(fixed)) {
        isValid = true
        formatted = fixed
      }
    }
  }

  if (!isValid) {
    return {
      isValid: false,
      formatted: phone,
      error: 'Invalid Pakistani phone number. Use format: +923XXXXXXXXX or 03XXXXXXXXX'
    }
  }

  return { isValid: true, formatted }
}
