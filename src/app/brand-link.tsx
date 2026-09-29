import Link from 'next/link'

import styles from './experience.module.css'
import MindNetworkLogo from './mind-network-logo'

export default function BrandLink() {
  return (
    <Link href="/" className={styles.brand} aria-label="CleverCrack home">
      <span className={styles.brandMark}>
        <MindNetworkLogo className={styles.brandLogo} />
      </span>
      <span>
        <strong>CleverCrack</strong>
        <small>Interview readiness</small>
      </span>
    </Link>
  )
}