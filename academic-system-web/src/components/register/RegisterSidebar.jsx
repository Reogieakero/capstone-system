export default function RegisterSidebar({ styles }) {
  return (
    <section className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <div className={styles.mainIcon}>*</div>
        <div className={styles.welcomeText}>
          <h1>For Educators.</h1>
          <p>Join the OmniStudy faculty network. Manage classrooms and track student integrity in one unified platform.</p>
        </div>
      </div>
      <footer className={styles.sidebarFooter}>
        <p>© 2026 OmniStudy. All rights reserved.</p>
      </footer>
    </section>
  );
}
