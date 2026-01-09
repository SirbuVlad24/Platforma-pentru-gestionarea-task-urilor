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

    // Only global admins can create projects
    if (!session.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the Grand Captain can commission new ships, ye scallywag!" }, { status: 403 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Every ship needs a name, Captain! What shall we call it?" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
      },
      include: {
        members: {
          include: { user: true },
        },
        admins: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json({ project });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong on the ship, Captain! Check the logs!" },
      { status: 500 }
    );
  }
}

