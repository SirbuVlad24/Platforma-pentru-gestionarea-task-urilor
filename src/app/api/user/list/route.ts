import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!session.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }


  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });



  return NextResponse.json({ users: users || [] });
}
