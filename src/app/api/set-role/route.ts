import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: "Ye must be logged in to board this ship, sailor!" }, { status: 401 });
  if (!session.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only the Grand Captain can promote crew members, ye scallywag!" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !role) return NextResponse.json({ error: "Ahoy! We need both the crew member and their new rank, Captain!" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({ user });
}
