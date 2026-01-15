import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TaskCompletionFacade } from "@/app/lib/task-completion-facade";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Ye must be logged in to board this ship, sailor!" },
        { status: 401 }
      );
    }

    const { taskId } = await req.json();

    // Use Facade to handle all business logic
    const result = await TaskCompletionFacade.completeTask({
      taskId,
      userId: session.user.id,
      userRole: session.user.role || "USER",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }

    return NextResponse.json({ task: result.task });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong on the ship, sailor! Check the logs!" },
      { status: 500 }
    );
  }
}

