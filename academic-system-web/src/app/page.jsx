import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Academic System</h1>
          <p>
            Welcome to the City High School digital gateway. Manage grades, 
            attendance, and schedules in one centralized platform.
          </p>
          
          <div className={styles.ctas}>
            <Link href="/login" className={styles.primary}>
              Sign In to Portal
            </Link>
            <Link href="https://cityhigh.edu/about" className={styles.secondary} target="_blank">
              Learn More
            </Link>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 City High School Academic System</p>
      </footer>
    </div>
  );
}