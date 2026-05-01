import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface PasswordRequirements {
  uppercase: boolean;
  lowercase: boolean;
  numeric: boolean;
  special: boolean;
  minLength: boolean;
}

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  const minLength = value.length >= 8;

  const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && minLength;

  if (!valid) {
    return {
      weakPassword: true,
      requirements: {
        uppercase: hasUpperCase,
        lowercase: hasLowerCase,
        numeric: hasNumeric,
        special: hasSpecialChar,
        minLength: minLength
      } as PasswordRequirements
    };
  }
  return null;
}

export const PASSWORD_REQUIREMENTS_TEXT = 'Password must have: 8+ characters, uppercase, lowercase, number, and special character';

export const PASSWORD_REQUIREMENTS_SHORT = 'Password must have: 8+ characters';
