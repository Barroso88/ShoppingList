import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google" && profile?.picture && user?.email) {
        try {
          const email = user.email.trim().toLowerCase();
          const dbUser = await prisma.user.findUnique({
            where: { email }
          });
          if (dbUser && dbUser.image !== profile.picture) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { image: profile.picture }
            });
          }
        } catch (e) {
          console.error("Error updating user image on sign in:", e);
        }
      }
      return true;
    },
    session({ session, user }: any) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
        (session.user as any).familyId = (user as any).familyId;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
