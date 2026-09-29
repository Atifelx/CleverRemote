type MindNetworkLogoProps = {
  className?: string
}

export default function MindNetworkLogo({ className }: MindNetworkLogoProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.2 5.2C12.3 5.2 7.3 10 7.3 16.5c0 3.6 1.4 6.5 4.1 8.8v8h10.2v-5c4.2-.7 7.3-3.2 8.6-6.8l2.8-1.1-2.5-4.2v-1.1c0-5.8-4.5-9.9-11.3-9.9Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="m13.1 14.2 5.8-3.3 5.8 3.9-1.2 6.4-6.5 2.2-4.5-4.2m6.4-8.3L17 23.4m7.7-8.6-11.6-.6m10.4 7-11-2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.45"
      />
      <circle cx="18.9" cy="10.9" fill="currentColor" r="2" />
      <circle cx="24.7" cy="14.8" fill="currentColor" r="2" />
      <circle cx="23.5" cy="21.2" fill="#d9f56f" r="2.3" />
      <circle cx="17" cy="23.4" fill="currentColor" r="2" />
      <circle cx="12.5" cy="19.2" fill="currentColor" r="2" />
      <circle cx="13.1" cy="14.2" fill="currentColor" r="2" />
    </svg>
  )
}