'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import Button from '../../../components/ui/Button';
import { SileoNotification } from '../../../components/ui/SileoNotification';
import useLoginAuth from '../../../hooks/useLoginAuth';
import { showLoginPromiseToast } from '../../../utils/sileoNotify';
import styles from './login.module.css';


export default function LoginPage() {
  const { loginWithEmail } = useLoginAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const loginPromise = loginWithEmail(formData);

    showLoginPromiseToast(loginPromise).catch(() => {});
  };

  return (
    <main className={styles.wrapper}>
        <SileoNotification />
      <section className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.mainIcon}>*</div>
          <div className={styles.welcomeText}>
            <h1>OmniStudy !</h1>
            <p>
              Your secure gateway to academic integrity and student success. 
              Stay connected, access your records, and move forward with confidence 
              in one unified platform.
            </p>
          </div>
        </div>
        <footer className={styles.sidebarFooter}>
          <p>© 2026 OmniStudy. All rights reserved.</p>
        </footer>
      </section>

      <section className={styles.formContainer}>
        <div className={styles.formContent}>
          <header className={styles.formHeader}>
            <h2 className={styles.brandName}>OmniStudy</h2>
          </header>

          <div className={styles.formTitles}>
            <h3>Welcome Back!</h3>
            <p>
              New here? <Link href="/register">Create a new account now.</Link>
            </p>
          </div>
          
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <div className={styles.fieldGroup}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <span className={styles.morphLine}></span>
            </div>
            
            <div className={styles.fieldGroup}>
              <div className={styles.inputWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
                <button 
                  type="button" 
                  className={styles.iconButton} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoEyeOffOutline size={22} /> : <IoEyeOutline size={22} />}
                </button>
                <span className={styles.morphLine}></span>
              </div>
            </div>

            <Button type="submit" variant="primary">
              Login Now
            </Button>
          </form>

          <footer className={styles.formFooter}>
            <p>Forget password?<Link href="/forgot-password">Click here</Link></p>
          </footer>
        </div>
      </section>
    </main>
  );
}