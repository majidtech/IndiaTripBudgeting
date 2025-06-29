export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.659 3.447c.535-.276 1.15-.119 1.54.368l.12.155a3.176 3.176 0 0 1 .533 3.328l-1.32 2.64a2.25 2.25 0 0 0 1.986 3.328h.091c.96 0 1.833.518 2.29 1.332l.14.245a2.5 2.5 0 0 1-4.223 2.553l-1.428-2.142a2.25 2.25 0 0 0-2.812-.83l-.18.06a2.25 2.25 0 0 0-1.574 2.11v.175a2.5 2.5 0 0 1-2.5 2.5h-1a2.5 2.5 0 0 1-2.5-2.5v-7.5a2.5 2.5 0 0 1 2.5-2.5h1a2.25 2.25 0 0 0 2.25-2.25v-1.25a2.5 2.5 0 0 1 .4-1.325l.132-.219a2.5 2.5 0 0 1 2.1-.98z" />
    <path d="M8.5 10.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
  </svg>
);

export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.04-5.07 2.04-3.92 0-7.1-3.22-7.1-7.1s3.18-7.1 7.1-7.1c2.23 0 3.64.88 4.5 1.72l2.78-2.78C19.05 1.96 16.25 0 12.48 0 5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.28 0 12.1-5.14 12.1-12.32 0-.76-.06-1.52-.18-2.24h-11.8v.02z" />
  </svg>
);
