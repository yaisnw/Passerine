"use server"

import { signIn, signOut } from "@/lib/auth"
import { prisma } from "@/lib/db"
import * as argon2 from "argon2"

export async function signInWithGoogle() {
  await signIn("google")
}

export async function signInWithCredentials(email: string, password: string): Promise<string | null> {
  try {
    await signIn("credentials", { email, password })
    return null
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest?.includes("NEXT_REDIRECT")) throw err
    const code = (err as { code?: string })?.code
    return code ?? "Something went wrong. Please try again."
  }
}

export async function signOutUser() {
  await signOut()
}

export async function registerUser(data: {
  name: string
  email: string
  password: string
  avatar_url?: string
}): Promise<string | null> {
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return "Email already in use"

    const hashed = await argon2.hash(data.password)
    await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashed, avatar_url: data.avatar_url ?? "" },
    })
    return null
  } catch {
    return "Something went wrong. Please try again."
  }
}
