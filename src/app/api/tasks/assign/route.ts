import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, taskId } = await req.json();

    if (!userId || !taskId) {
      return NextResponse.json({ error: "userId and taskId required" }, { status: 400 });
    }

    const assignment = await prisma.usersOnTasks.create({
      data: { userId, taskId },
    });

    return NextResponse.json(assignment);

  } catch (error: unknown) {

    // Prisma duplicate entry (user deja asignat)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "User already assigned to this task" },
          { status: 409 }
        );
      }
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
