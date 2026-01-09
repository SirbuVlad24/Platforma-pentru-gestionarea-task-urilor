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

    // Check if user is project admin or global admin
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { admins: true },
    });

    if (!project) {
      return NextResponse.json({ error: "This ship doesn't exist in the fleet, Captain!" }, { status: 404 });
    }

    const isProjectAdmin = project.admins.some((admin) => admin.userId === session.user.id);
    const isGlobalAdmin = session.user.role === "ADMIN";

    if (!isProjectAdmin && !isGlobalAdmin) {
      return NextResponse.json({ error: "Only the Captain can maroon crew members, ye scallywag!" }, { status: 403 });
    }

    // Remove from admins if exists
    await prisma.projectsAdmins.deleteMany({
      where: {
        userId,
        projectId,
      },
    });

    // Remove from members
    await prisma.usersOnProjects.deleteMany({
      where: {
        userId,
        projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong on the ship, Captain! Check the logs!" },
      { status: 500 }
    );
  }
}

