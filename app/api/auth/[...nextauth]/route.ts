import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const users = [
          { id: "1", name: "Ahmed Al-Rashid", email: "admin@taskflow.com", password: "admin123", role: "Admin" },
          { id: "2", name: "Sara Hassan", email: "sara@taskflow.com", password: "sara123", role: "Manager" },
        ]
        const user = users.find(
          (u) => u.email === credentials?.email && u.password === credentials?.password
        )
        if (user) return { id: user.id, name: user.name, email: user.email, role: user.role }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }) {
      if (token) session.user.role = token.role
      return session
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }