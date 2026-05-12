import NextAuth, { CredentialsSignin } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import * as argon2 from "argon2"
import { prisma } from "@/lib/db"

class InvalidCredentialsError extends CredentialsSignin {
  code = "Invalid email or password"
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) throw new InvalidCredentialsError()

        const valid = await argon2.verify(user.password, password)
        if (!valid) throw new InvalidCredentialsError()

        return { id: String(user.user_id), name: user.name, email: user.email }
      },
    }),
  ],
})
