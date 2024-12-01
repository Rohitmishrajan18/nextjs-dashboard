import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '/Users/rohit.mishra/Downloads/nextjs-dashboard/auth.config.js'; // Adjust path if necessary
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Test database connection
async function testConnection() {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("Missing POSTGRES_URL environment variable");
      }
  
      const result = await sql`SELECT 1 + 1 AS result`;
      console.log('Database connected successfully:', result.rows[0]);
    } catch (error) {
      console.error('Database connection failed:', error.message);
      throw new Error('Database connection failed');
    }
  }
  

testConnection();

// Function to get a user from the database
async function getUser(email) {
    try {
      if (!process.env.POSTGRES_URL) {
        console.error('POSTGRES_URL is not set');
        throw new Error('Database not configured properly');
      }
  
      const user = await sql`SELECT * FROM users WHERE email=${email}`;
      if (!user.rows.length) {
        console.error(`User with email ${email} not found.`);
        return null;
      }
  
      console.log(`User with email ${email} retrieved successfully.`);
      return user.rows[0];
    } catch (error) {
      console.error(`Failed to fetch user with email ${email}:`, error.message);
      throw new Error('Failed to fetch user.');
    }
  }
  

// Function to handle authentication
export async function authenticate({ email, password }) {
  const parsedCredentials = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
    })
    .safeParse({ email, password });

  if (!parsedCredentials.success) {
    console.error('Invalid input format');
    throw new Error('Invalid email or password');
  }

  const user = await getUser(email);

  if (!user) {
    console.error('User not found');
    throw new Error('Invalid email or password');
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (!passwordsMatch) {
    console.error('Invalid credentials');
    throw new Error('Invalid email or password');
  }

  console.log('Login successful');
  return user; // Return the authenticated user
}

// NextAuth configuration
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        return await authenticate(credentials);
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      session.user = token.user;
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
});

console.log('NODE_ENV:', process.env.NODE_ENV); // Should output 'development' or 'production'
