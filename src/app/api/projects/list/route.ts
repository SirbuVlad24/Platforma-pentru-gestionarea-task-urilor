import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const isGlobalAdmin = session.user.role === "ADMIN";

    // Get all projects where user is a member or admin, or all projects if global admin
    const projects = await prisma.project.findMany({
      where: isGlobalAdmin
        ? {} // Global admins see all projects
        : {
            OR: [
              { members: { some: { userId } } },
              { admins: { some: { userId } } },
            ],
          },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
        admins: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
        tasks: {
          include: {
            assignedUsers: {
              include: { user: { select: { id: true, email: true } } },
            },
          },
        },
        _count: {
          select: { tasks: true, members: true, admins: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

