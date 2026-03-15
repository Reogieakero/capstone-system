import Link from 'next/link';
import Button from '../ui/Button';
import SelectField from '../ui/SelectField';
import PasswordInputField from './PasswordInputField';

export default function RegisterForm({
  formData,
  handleChange,
  handleRegister,
  isAgreed,
  isPassValid,
  setIsAgreed,
  setModalType,
  showPassword,
  setShowPassword,
  styles,
  suffixOptions,
}) {
  return (
    <div className={styles.formContent}>
      <header className={styles.formHeader}>
        <h2 className={styles.brandName}>OmniStudy</h2>
      </header>

      <div className={styles.formTitles}>
        <h3>Registration</h3>
        <p>Already have an account? <Link href="/login">Login here.</Link></p>
      </div>

      <form className={styles.registerForm} onSubmit={handleRegister}>
        <div className={styles.nameGrid}>
          <div className={styles.fieldGroup}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <span className={styles.morphLine}></span>
          </div>
          <div className={styles.fieldGroup}>
            <input
              type="text"
              name="middleName"
              placeholder="Middle Name"
              value={formData.middleName}
              onChange={handleChange}
            />
            <span className={styles.morphLine}></span>
          </div>
        </div>

        <div className={styles.nameGrid}>
          <div className={styles.fieldGroup}>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <span className={styles.morphLine}></span>
          </div>
          <SelectField
            name="suffix"
            value={formData.suffix}
            onChange={handleChange}
            options={suffixOptions}
            placeholder="Suffix (None)"
            className={styles.selectGridItem}
            allowEmptySelection
          />
        </div>

        <div className={styles.fieldGroup}>
          <input
            type="email"
            name="email"
            placeholder="Institutional Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <span className={styles.morphLine}></span>
        </div>

        <PasswordInputField
          name="password"
          placeholder="Create Password"
          showPassword={showPassword}
          value={formData.password}
          onChange={handleChange}
          onToggle={() => setShowPassword(!showPassword)}
          styles={styles}
        />

        <PasswordInputField
          name="confirmPassword"
          placeholder="Confirm Password"
          showPassword={showPassword}
          value={formData.confirmPassword}
          onChange={handleChange}
          onToggle={() => setShowPassword(!showPassword)}
          styles={styles}
        />

        <div className={styles.agreementWrapper}>
          <label className={styles.checkboxContainer}>
            <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
            <span className={styles.checkmark}></span>
            <p>
              I agree to the <span className={styles.link} onClick={() => setModalType('guidelines')}>Guidelines</span> and <span className={styles.link} onClick={() => setModalType('privacy')}>Privacy Policy</span>.
            </p>
          </label>
        </div>

        <Button type="submit" variant="primary" disabled={!isPassValid || !isAgreed}>
          Register Now
        </Button>
      </form>
    </div>
  );
}