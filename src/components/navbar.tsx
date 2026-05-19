import Link from "next/link"
import Image from "next/image"
import { Film, LogOut, LogIn, UserPlus, UserCircle2 } from "lucide-react"
import { auth, signOut } from "@/lib/auth"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function Navbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <Film className="size-5 text-primary" strokeWidth={2} />
          <p className="text-2xl align-center font-semibold tracking-tight leading-none">Passerine</p>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
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
                  <UserCircle2 className="size-7 text-muted-foreground" strokeWidth={1.5} />
                )}
                <span className="hidden leading-none text-muted-foreground sm:block">
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
                <Button variant="ghost" size="default" type="submit" className="gap-1.5">
                  <LogOut className="size-3.5" />
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}>
                <LogIn className="size-3.5" />
                Sign in
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
                <UserPlus className="size-3.5" />
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
