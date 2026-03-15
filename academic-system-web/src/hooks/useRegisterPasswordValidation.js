import { useEffect, useMemo } from 'react';
import {
  dismissPasswordToast,
  showPasswordRequirementsToast,
  showPasswordSuccessToast,
} from '../utils/sileoNotify';
import { PASSWORD_RULES } from '../../constants/register.constants';

export default function useRegisterPasswordValidation({ formData, styles }) {
  const passValidation = useMemo(() => {
    return {
      length: formData.password.length >= 8,
      upper: /[A-Z]/.test(formData.password),
      number: /[0-9]/.test(formData.password),
      special: /[^A-Za-z0-9]/.test(formData.password),
      match: formData.password === formData.confirmPassword && formData.confirmPassword !== '',
    };
  }, [formData.password, formData.confirmPassword]);

  const isPassValid = useMemo(() => Object.values(passValidation).every(Boolean), [passValidation]);

  const validationRules = useMemo(() => {
    return [
      ...PASSWORD_RULES.map((rule) => ({
        key: rule.key,
        label: rule.label,
        met: passValidation[rule.key],
      })),
      {
        key: 'match',
        label: 'Passwords must match',
        met: passValidation.match,
      },
    ];
  }, [passValidation]);

  const requirementList = useMemo(() => {
    return (
      <ul className={styles.toastList}>
        {validationRules.map((rule) => {
          const isMismatch = rule.key === 'match' && Boolean(formData.confirmPassword) && !rule.met;
          return (
            <li
              key={rule.key}
              className={
                rule.met
                  ? styles.toastRuleMet
                  : isMismatch
                    ? styles.toastRuleMismatch
                    : styles.toastRulePending
              }
            >
              {rule.label}
            </li>
          );
        })}
      </ul>
    );
  }, [validationRules, formData.confirmPassword, styles]);

  useEffect(() => {
    if (!formData.password) {
      dismissPasswordToast();
      return;
    }

    const unmetRules = validationRules.filter((rule) => !rule.met);

    if (unmetRules.length > 0) {
      const hasMismatch = Boolean(formData.confirmPassword) && unmetRules.some((rule) => rule.key === 'match');
      showPasswordRequirementsToast({
        hasMismatch,
        requirementList,
      });
      return;
    }

    showPasswordSuccessToast();
  }, [formData.password, formData.confirmPassword, validationRules, requirementList]);

  return {
    isPassValid,
  };
}
