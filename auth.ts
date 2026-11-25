
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
})

export const { auth, signIn, signOut } = handler
export { handler as GET, handler as POST }