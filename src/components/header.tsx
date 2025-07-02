"use client";

import Link from "next/link";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { user, logout } = useAuth();

  const getDisplayName = () => {
    return user?.name || user?.username || "";
  };

  const getInitials = () => {
    const name = user?.name;
    if (name) {
      const nameParts = name.trim().split(" ");
      if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return name[0]?.toUpperCase() || "U";
    }
    // Fallback for username if name isn't set yet.
    if(user?.username) {
        return user.username[0].toUpperCase();
    }
    return "U";
  };
  
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
      <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 flex-1">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl">India Trip Budgeting</span>
        </Link>
      </nav>
      {user && (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={undefined} alt={getDisplayName()} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                         {user.name && <p className="text-xs text-muted-foreground">{user.username}</p>}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      )}
    </header>
  );
}
