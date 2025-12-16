import { NextResponse } from "next/server";
import { detectTaskPriority } from "../../../lib/ai-priority";

/**
 * Test endpoint for AI priority detection
 * GET /api/ai/test-priority?description=your+description+here
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const description = searchParams.get("description");

    if (!description) {
      return NextResponse.json(
        { error: "Please provide a description parameter" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const detectedPriority = await detectTaskPriority(description);
    const endTime = Date.now();

    return NextResponse.json({
      description,
      detectedPriority,
      processingTime: `${endTime - startTime}ms`,
      message: `AI detected priority: ${detectedPriority} for description: "${description}"`,
    });
  } catch (error) {
    console.error("AI test error:", error);
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for testing AI priority detection
 * POST /api/ai/test-priority
 * Body: { description: "your description here" }
 */
export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: "Please provide a description in the request body" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const detectedPriority = await detectTaskPriority(description);
    const endTime = Date.now();

    return NextResponse.json({
      description,
      detectedPriority,
      processingTime: `${endTime - startTime}ms`,
      message: `AI detected priority: ${detectedPriority} for description: "${description}"`,
    });
  } catch (error) {
    console.error("AI test error:", error);
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

