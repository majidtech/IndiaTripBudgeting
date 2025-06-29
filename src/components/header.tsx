import Link from "next/link";
import { Logo } from "@/components/icons";

export function AppHeader() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
      <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl">India Trip Budget Buddy</span>
        </Link>
      </nav>
    </header>
  );
}
