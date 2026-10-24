export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
export const RWANDAN_PHONE_PATTERN = /^(?:\+?250|0)7[2-9]\d{7}$/;
export const PLATE_NUMBER_PATTERN = /^[A-Z]{2,3}\s?\d{3}\s?[A-Z]$/i;
export const NATIONAL_ID_PATTERN = /^\d{16}$/;

export const LETTERS_ONLY_PATTERN = /^[A-Za-z\s]+$/;
export const LETTERS_ONLY_NO_SPACES_PATTERN = /^[A-Za-z]+$/;
export const LETTERS_AND_SPACES_ONLY = /^[A-Za-z\s]+$/;
export const DIGITS_ONLY_PATTERN = /^[0-9]+$/;
export const PHONE_10_DIGITS_PATTERN = /^[0-9]{10}$/;
export const BARCODE_NUMBERS_ONLY_PATTERN = /^[0-9]+$/;
export const RFID_PATTERN = /^[A-Za-z0-9-]+$/;
export const REFERENCE_CODE_PATTERN = /^[A-Za-z0-9-]+$/;
export const SKU_PATTERN = /^[A-Za-z0-9-]+$/;
export const MATERIAL_NAME_LETTERS_PATTERN = /^[A-Za-z\s]+$/;
export const LOCATION_LETTERS_PATTERN = /^[A-Za-z\s]+$/;
export const UNIT_LETTERS_PATTERN = /^[A-Za-z\s]+$/;

const asText = (value) => String(value ?? "").trim();

export function validateText(
  value,
  label,
  { min = 0, max = 0, required = false } = {},
) {
  const text = asText(value);

  if (!text) {
    return required ? `${label} is required.` : "";
  }

  if (min > 0 && text.length < min) {
    return `${label} must be at least ${min} characters.`;
  }

  if (max > 0 && text.length > max) {
    return `${label} cannot exceed ${max} characters.`;
  }

  return "";
}

export function validateLettersOnly(value, label, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? `${label} is required.` : "";
  }

  return LETTERS_ONLY_PATTERN.test(text)
    ? ""
    : `${label} must contain only letters.`;
}

export function validateEmail(value, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? "Email is required." : "";
  }

  return EMAIL_PATTERN.test(text) ? "" : "Enter a valid email address.";
}

export function validatePassword(value, { required = false } = {}) {
  const text = String(value ?? "");

  if (!text) {
    return required ? "Password is required." : "";
  }

  return text.length >= 6 ? "" : "Password must be at least 6 characters.";
}

export function validateStrongPassword(value, { required = false } = {}) {
  const text = String(value ?? "");

  if (!text) {
    return required ? "Password is required." : "";
  }

  if (text.length < 8) {
    return "Password must be at least 8 characters.";
  }

  const hasLetter = /[A-Za-z]/.test(text);
  const hasNumber = /[0-9]/.test(text);
  const hasSymbol = /[^A-Za-z0-9]/.test(text);

  if (!hasLetter || !hasNumber || !hasSymbol) {
    return "Password must include letters, numbers, and symbols.";
  }

  return "";
}

export function validatePhone(value, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? "Phone number is required." : "";
  }

  return PHONE_10_DIGITS_PATTERN.test(text)
    ? ""
    : "Phone number must be exactly 10 digits.";
}

export function validateDigitsOnly(value, label, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? `${label} is required.` : "";
  }

  return DIGITS_ONLY_PATTERN.test(text)
    ? ""
    : `${label} must contain only digits.`;
}

export function validateNumber(
  value,
  label,
  { min = 0, exclusiveMin = false, required = false, positiveOnly = false } = {},
) {
  const text = asText(value);

  if (!text) {
    return required ? `${label} is required.` : "";
  }

  const parsed = Number(text);

  if (!Number.isFinite(parsed)) {
    return `${label} must be a valid number.`;
  }

  if (positiveOnly || exclusiveMin) {
    if (parsed <= 0) {
      return `${label} must be a positive number.`;
    }
    return "";
  }

  if (parsed < min) {
    return `${label} cannot be negative.`;
  }

  return "";
}

export function validateYear(value, label = "Year", { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? `${label} is required.` : "";
  }

  const parsed = Number(text);
  const currentYear = new Date().getFullYear();

  if (!Number.isFinite(parsed)) {
    return `${label} must be a valid year.`;
  }

  if (parsed < 1900) {
    return `${label} must be after 1900.`;
  }

  if (parsed > currentYear) {
    return `${label} cannot be in the future.`;
  }

  return "";
}

export function validateNationalId(value, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? "National ID is required." : "";
  }

  return NATIONAL_ID_PATTERN.test(text)
    ? ""
    : "National ID must be exactly 16 digits.";
}

export function validatePlateNumber(value, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? "Plate number is required." : "";
  }

  return PLATE_NUMBER_PATTERN.test(text)
    ? ""
    : "Enter a valid plate number (e.g. RAB 123 A).";
}

export function validateBarcode(value, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? "Barcode is required." : "";
  }

  return BARCODE_NUMBERS_ONLY_PATTERN.test(text)
    ? ""
    : "Barcode must contain only numbers.";
}

export function validateRFID(value, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? "RFID tag is required." : "";
  }

  return RFID_PATTERN.test(text)
    ? ""
    : "RFID tag must contain only letters, numbers, and dashes.";
}

export function validateReferenceCode(value, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? "Reference code is required." : "";
  }

  return REFERENCE_CODE_PATTERN.test(text)
    ? ""
    : "Reference code must contain only letters, numbers, and dashes.";
}

export function validateSKU(value, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? "SKU is required." : "";
  }

  return SKU_PATTERN.test(text)
    ? ""
    : "SKU must contain only letters, numbers, and dashes.";
}

export function validateTodayDate(value, { required = false } = {}) {
  const text = asText(value);

  if (!text) {
    return required ? "Date is required." : "";
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  return text === todayStr ? "" : "Date must be today only.";
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
