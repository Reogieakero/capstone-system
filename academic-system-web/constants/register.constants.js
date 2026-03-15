export const INITIAL_REGISTER_FORM_DATA = {
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export const SUFFIX_OPTIONS = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'upper', label: 'At least 1 uppercase letter' },
  { key: 'number', label: 'At least 1 number' },
  { key: 'special', label: 'At least 1 symbol (@, #, $, etc.)' },
];