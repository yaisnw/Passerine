import Image from "next/image"
import { redirect } from "next/navigation"
import { UserCircle2, Bookmark, Star } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Navbar from "@/components/navbar"
import WatchlistGrid from "@/components/watchlist-grid"
import { WatchStatus } from "@/generated/prisma/enums"


export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      watchlist: {
        orderBy: { added_at: "desc" },
      },
    },
  })

  if (!user) redirect("/login")

  const watchlist = user.watchlist

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        {/* Profile header */}
        <div className="mb-10 flex items-center gap-5">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={user.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <UserCircle2 className="size-16 text-muted-foreground" strokeWidth={1.25} />
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:w-fit md:flex md:gap-6">
          <Stat label="Watchlist" value={watchlist.length} icon={Bookmark} />
          <Stat label="Completed" value={watchlist.filter((e) => e.status === WatchStatus.COMPLETED).length} icon={Star} />
        </div>

        {/* Watchlist */}
        <section>
          <h2 className="mb-5 text-base font-semibold text-foreground">Watchlist</h2>
          <WatchlistGrid entries={watchlist} />
        </section>
      </main>
    </>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xl font-semibold leading-none text-foreground">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
