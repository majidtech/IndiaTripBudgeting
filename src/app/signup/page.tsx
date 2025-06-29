"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/grouplogin");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <p>Redirecting to login...</p>
    </div>
  );
}
