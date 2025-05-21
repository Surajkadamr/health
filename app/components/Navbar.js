import Link from 'next/link';
import styles from './Navbar.module.css'; // Import CSS module

export default function Navbar() {
  return (
    // <nav className="bg-background border-b shadow-sm">
    <nav className={styles.navbar}>
      {/* <div className="container mx-auto max-w-6xl px-4"> */}
      <div className={styles.container}>
        {/* <div className="flex justify-between items-center py-4"> */}
        <div className={styles.navContent}>
          {/* <Link href="/" className="text-2xl font-bold text-primary"> */}
          <Link href="/" className={styles.brandLink}>
            Bodyclone HealthAI
          </Link>
          {/* <ul className="flex items-center space-x-6"> */}
          <ul className={styles.navList}>
            <li>
              {/* <Link href="/" className="text-muted-foreground hover:text-primary transition-colors"> */}
              <Link href="/" className={styles.navLink}>
                Upload
              </Link>
            </li>
            <li>
              {/* This link should ideally be dynamic based on current page */}
              {/* For now, assuming dashboard is the active context here if this navbar is specific to it */}
              {/* <Link href="/dashboard" className="text-primary font-semibold hover:text-primary/80 transition-colors"> */}
              <Link href="/dashboard" className={`${styles.navLink} ${styles.activeLink}`}> {/* Example active style */}
                Dashboard
              </Link>
            </li>
            {/* Add more links as needed */}
            {/* Example:
            <li>
              <Link href="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                Settings
              </Link>
            </li>
            */}
          </ul>
        </div>
      </div>
    </nav>
  );
}
