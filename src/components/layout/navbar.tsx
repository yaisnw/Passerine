import Link from "next/link"
import Image from "next/image"
import { Film, LogOut, LogIn, UserPlus, UserCircle2 } from "lucide-react"
import { auth, signOut } from "@/lib/auth"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import SearchBar from "@/components/layout/search-bar"

export default async function Navbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center leading-none gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <Film className="size-7 sm:size-6 text-primary" strokeWidth={1.75} />
          <p className="hidden text-2xl align-center font-semibold tracking-tight leading-none sm:block">Passerine</p>
        </Link>

        {/* Search */}
        <div className="min-w-0 flex-1">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {session ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "avatar"}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <UserCircle2 className="size-7 md:size-6 text-accent" strokeWidth={1.75} />
                )}
                <span className="hidden leading-none text-accent sm:block">
                  {session.user?.name}
                </span>
              </Link>
              <form
                className="flex items-center"
                action={async () => {
                  "use server"
                  await signOut()
                }}
              >
                <Button variant="ghost" size="icon" type="submit" className="size-9 sm:w-auto sm:px-3 sm:gap-1.5">
                  <LogOut className="size-7 md:size-5" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-9 sm:w-auto sm:px-3 sm:gap-1.5")}>
                <LogIn className="size-7 md:size-5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "icon" }), "size-9 sm:w-auto sm:px-3 sm:gap-1.5")}>
                <UserPlus className="size-7 md:size-5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Get started</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
