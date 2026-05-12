"use server"

import { signIn, signOut } from "@/lib/auth"
import { prisma } from "@/lib/db"
import * as argon2 from "argon2"

export async function signInWithGoogle() {
  await signIn("google")
}

export async function signInWithCredentials(email: string, password: string) {
  await signIn("credentials", { email, password })
}

export async function signOutUser() {
  await signOut()
}

export async function registerUser(data: {
  name: string
  email: string
  password: string
  avatar_url?: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error("Email already in use")

  const hashed = await argon2.hash(data.password)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      avatar_url: data.avatar_url ?? "",
    },
  })

  return user
}
