import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { detectTaskPriority } from "../../../lib/ai-priority";

export async function POST(req: Request) {
  try {
    const { title, description, priority } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Auto-detect priority from description using AI when description is provided
    // Priority from form is used only if description is empty
    let finalPriority = priority;
    if (description && description.trim().length > 0) {
      // Always use AI when description exists, ignore manual priority selection
      console.log("🔍 Detecting priority from description using AI...");
      const aiPriority = await detectTaskPriority(description);
      finalPriority = aiPriority;
      console.log(`✅ AI detected priority: ${aiPriority} for description: "${description.substring(0, 50)}..."`);
    } else if (!finalPriority) {
      finalPriority = "MEDIUM";
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: finalPriority,
      },
    });

    return NextResponse.json({ task });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
