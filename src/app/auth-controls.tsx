'use client'

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

import styles from './experience.module.css'

export default function AuthControls() {
  return (
    <div className={styles.authControls}>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className={styles.signInButton} type="button">Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className={styles.signUpButton} type="button">Create account</button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <span className={styles.accountLabel}>Your progress</span>
        <UserButton />
      </Show>
    </div>
  )
}