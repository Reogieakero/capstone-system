import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

export default function PasswordInputField({
  name,
  placeholder,
  showPassword,
  value,
  onChange,
  onToggle,
  styles,
}) {
  return (
    <div className={styles.fieldGroup}>
      <div className={styles.inputWrapper}>
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <button type="button" className={styles.iconButton} onClick={onToggle}>
          {showPassword ? <IoEyeOffOutline size={22} /> : <IoEyeOutline size={22} />}
        </button>
        <span className={styles.morphLine}></span>
      </div>
    </div>
  );
}
