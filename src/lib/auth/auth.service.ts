import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "./auth.utils";

export async function loginUser(email: string, password: string) {
  // FIND USER
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // CHECK PASSWORD
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // CREATE TOKEN (ONLY userId)
  const token = signToken({
    userId: user.id,
  });

  return {
    token,
    role: user.role,
  };
}