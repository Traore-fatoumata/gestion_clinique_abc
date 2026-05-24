/**
 * Validation utilities for form inputs
 * Professional-grade validators with clear error messages
 */

// ─── Email Validation ───────────────────────────────────────
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, error: "L'email est requis" }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: "Format d'email invalide" }
  }
  return { valid: true, error: null }
}

// ─── Phone Validation (Guinea format) ───────────────────────
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { valid: false, error: "Le téléphone est requis" }
  }
  const cleaned = phone.replace(/\s/g, '')
  // Guinea: +224 followed by 9 digits, or local format starting with 6
  const phoneRegex = /^(\+224|224)?[36]\d{8}$/
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: "Numéro invalide (format: 6XX XXX XXX)" }
  }
  return { valid: true, error: null }
}

// ─── Required Field ─────────────────────────────────────────
export const validateRequired = (value, fieldName = "Ce champ") => {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    return { valid: false, error: `${fieldName} est requis` }
  }
  return { valid: true, error: null }
}

// ─── Min Length ─────────────────────────────────────────────
export const validateMinLength = (value, min, fieldName = "Ce champ") => {
  if (!value || value.length < min) {
    return { valid: false, error: `${fieldName} doit contenir au moins ${min} caractères` }
  }
  return { valid: true, error: null }
}

// ─── Max Length ─────────────────────────────────────────────
export const validateMaxLength = (value, max, fieldName = "Ce champ") => {
  if (value && value.length > max) {
    return { valid: false, error: `${fieldName} ne peut pas dépasser ${max} caractères` }
  }
  return { valid: true, error: null }
}

// ─── Numeric Validation ─────────────────────────────────────
export const validateNumber = (value, fieldName = "Ce champ") => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} est requis` }
  }
  if (isNaN(Number(value))) {
    return { valid: false, error: `${fieldName} doit être un nombre` }
  }
  return { valid: true, error: null }
}

// ─── Positive Number ────────────────────────────────────────
export const validatePositiveNumber = (value, fieldName = "Ce champ") => {
  const numValidation = validateNumber(value, fieldName)
  if (!numValidation.valid) return numValidation
  
  if (Number(value) <= 0) {
    return { valid: false, error: `${fieldName} doit être supérieur à 0` }
  }
  return { valid: true, error: null }
}

// ─── Date Validation ────────────────────────────────────────
export const validateDate = (dateStr, fieldName = "La date") => {
  if (!dateStr) {
    return { valid: false, error: `${fieldName} est requise` }
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} n'est pas valide` }
  }
  return { valid: true, error: null }
}

// ─── Past Date Validation (for birth dates) ─────────────────
export const validatePastDate = (dateStr, fieldName = "La date") => {
  const dateValidation = validateDate(dateStr, fieldName)
  if (!dateValidation.valid) return dateValidation
  
  const date = new Date(dateStr)
  if (date > new Date()) {
    return { valid: false, error: `${fieldName} ne peut pas être dans le futur` }
  }
  return { valid: true, error: null }
}

// ─── Birth Date Validation (reasonable age range) ───────────
export const validateBirthDate = (dateStr) => {
  const pastValidation = validatePastDate(dateStr, "La date de naissance")
  if (!pastValidation.valid) return pastValidation
  
  const date = new Date(dateStr)
  const today = new Date()
  const maxAge = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate())
  
  if (date < maxAge) {
    return { valid: false, error: "Âge non valide (maximum 120 ans)" }
  }
  return { valid: true, error: null }
}

// ─── Password Validation ────────────────────────────────────
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: "Le mot de passe est requis" }
  }
  if (password.length < 6) {
    return { valid: false, error: "Le mot de passe doit contenir au moins 6 caractères" }
  }
  if (password.length > 128) {
    return { valid: false, error: "Le mot de passe est trop long" }
  }
  return { valid: true, error: null }
}

// ─── Confirm Password Validation ────────────────────────────
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, error: "Veuillez confirmer le mot de passe" }
  }
  if (password !== confirmPassword) {
    return { valid: false, error: "Les mots de passe ne correspondent pas" }
  }
  return { valid: true, error: null }
}

// ─── Name Validation ────────────────────────────────────────
export const validateName = (name, fieldName = "Le nom") => {
  const required = validateRequired(name, fieldName)
  if (!required.valid) return required
  
  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} doit contenir au moins 2 caractères` }
  }
  if (!/^[\p{L}\s'-]+$/u.test(name.trim())) {
    return { valid: false, error: `${fieldName} contient des caractères non valides` }
  }
  return { valid: true, error: null }
}

// ─── Amount Validation (for payments) ───────────────────────
export const validateAmount = (amount, fieldName = "Le montant") => {
  const numValidation = validatePositiveNumber(amount, fieldName)
  if (!numValidation.valid) return numValidation
  
  const num = Number(amount)
  if (num < 100) {
    return { valid: false, error: `${fieldName} doit être au moins 100 GNF` }
  }
  if (num > 100000000) {
    return { valid: false, error: `${fieldName} est trop élevé` }
  }
  return { valid: true, error: null }
}

// ─── File Validation ────────────────────────────────────────
export const validateFile = (file, options = {}) => {
  const { maxSize = 10, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options
  
  if (!file) {
    return { valid: false, error: "Le fichier est requis" }
  }
  
  const maxSizeBytes = maxSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Le fichier ne doit pas dépasser ${maxSize} Mo` }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Type de fichier non autorisé (${allowedTypes.join(', ')})` }
  }
  
  return { valid: true, error: null }
}

// ─── Form Validation Helper ─────────────────────────────────
export const validateForm = (validators) => {
  const errors = {}
  let isValid = true
  
  for (const [field, validationFn] of Object.entries(validators)) {
    const result = validationFn()
    if (!result.valid) {
      errors[field] = result.error
      isValid = false
    }
  }
  
  return { isValid, errors }
}

// ─── Age Calculation ────────────────────────────────────────
export const calcAge = (dateNaissance) => {
  if (!dateNaissance) return 0
  const today = new Date()
  const birth = new Date(dateNaissance)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return Math.max(0, age)
}

// ─── Format Date for Display ────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

// ─── Format DateTime for Display ────────────────────────────
export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

export default {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validatePositiveNumber,
  validateDate,
  validatePastDate,
  validateBirthDate,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateAmount,
  validateFile,
  validateForm,
  calcAge,
  formatDate,
  formatDateTime,
}