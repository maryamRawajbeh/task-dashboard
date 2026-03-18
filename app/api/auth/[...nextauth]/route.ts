import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { UserRole } from "@/types"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Test users with different roles
        const users = [
          // Admin user - Has full access
          { 
            id: "1", 
            name: "Admin", 
            email: "admin@example.com", 
            password: "admin123", 
            role: "Admin" as UserRole 
          },
          // Regular users - Can view only assigned tasks
          { 
            id: "2", 
            name: "Ahmed", 
            email: "ahmed@example.com", 
            password: "ahmed123", 
            role: "User" as UserRole 
          },
          { 
            id: "3", 
            name: "Sara", 
            email: "sara@example.com", 
            password: "sara123", 
            role: "User" as UserRole 
          },
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