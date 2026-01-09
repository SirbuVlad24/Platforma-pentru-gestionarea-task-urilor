import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Ye must be logged in to board this ship, sailor!" }, { status: 401 });
    }

    const { userId, projectId } = await req.json();

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: "Ahoy! We need both the crew member and ship details, Captain!" },
        { status: 400 }
      );
    }

    // Only global admins can add project admins
    if (!session.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the Grand Captain can promote crew to Captain, ye scallywag!" }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "This ship doesn't exist in the fleet, Captain!" }, { status: 404 });
    }

    // Check if user is already an admin
    const existingAdmin = await prisma.projectsAdmins.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: "This crew member is already a Captain of this ship!" }, { status: 400 });
    }

    // Make sure user is a member first
    const isMember = await prisma.usersOnProjects.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!isMember) {
      // Add as member first
      await prisma.usersOnProjects.create({
        data: {
          userId,
          projectId,
        },
      });
    }

    const admin = await prisma.projectsAdmins.create({
      data: {
        userId,
        projectId,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return NextResponse.json({ admin });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong on the ship, Captain! Check the logs!" },
      { status: 500 }
    );
  }
}

