/**
 * AI Priority Detection Service
 * Uses Hugging Face Inference API (free) to analyze task description
 * and determine if it's important (HIGH priority) or not
 */

interface HuggingFaceResponse {
  label: string;
  score: number;
}

export async function detectTaskPriority(description: string): Promise<"LOW" | "MEDIUM" | "HIGH"> {
  if (!description || description.trim().length === 0) {
    return "MEDIUM";
  }

  try {
    // Use Hugging Face Inference API with a sentiment analysis model
    // This is free and doesn't require an API key for basic usage
    // Using a timeout to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: description,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Fallback to keyword-based detection if API fails
      return detectPriorityByKeywords(description);
    }

    const data = await response.json();
    
    // Handle different response formats
    let results: HuggingFaceResponse[] = [];
    if (Array.isArray(data)) {
      results = Array.isArray(data[0]) ? data[0] : data;
    } else if (data && Array.isArray(data)) {
      results = data;
    } else if (data && typeof data === 'object') {
      // Single result object
      results = [data];
    }
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      return detectPriorityByKeywords(description);
    }

    // Find the highest confidence label
    const highestScore = results.reduce((max, item) => 
      item.score > max.score ? item : max
    );

    // Check for important keywords in addition to sentiment
    const hasImportantKeywords = checkImportantKeywords(description);
    
    // If sentiment is positive (LABEL_2) or has important keywords, it's likely HIGH priority
    // LABEL_0 = negative, LABEL_1 = neutral, LABEL_2 = positive
    if (highestScore.label === "LABEL_2" || hasImportantKeywords) {
      return "HIGH";
    }
    
    // If neutral, check length and keywords
    if (highestScore.label === "LABEL_1") {
      return hasImportantKeywords ? "HIGH" : "MEDIUM";
    }
    
    // Negative sentiment usually means lower priority
    return "LOW";
  } catch (error) {
    // If it's an abort error (timeout), use keyword detection
    if (error instanceof Error && error.name === 'AbortError') {
      return detectPriorityByKeywords(description);
    }
    console.error("AI priority detection error:", error);
    // Fallback to keyword-based detection
    return detectPriorityByKeywords(description);
  }
}

/**
 * Fallback: Detect priority based on keywords
 */
function detectPriorityByKeywords(description: string): "LOW" | "MEDIUM" | "HIGH" {
  const lowerDescription = description.toLowerCase();
  
  // Important/urgent keywords
  const highPriorityKeywords = [
    "urgent", "important", "critical", "asap", "as soon as possible",
    "deadline", "due", "must", "need", "required", "essential",
    "priority", "immediate", "emergency", "fix", "bug", "error",
    "broken", "issue", "problem", "blocking", "blocker"
  ];
  
  // Low priority keywords
  const lowPriorityKeywords = [
    "nice to have", "optional", "later", "someday", "maybe",
    "if possible", "when time", "low priority", "minor"
  ];
  
  // Check for high priority keywords
  const hasHighPriority = highPriorityKeywords.some(keyword => 
    lowerDescription.includes(keyword)
  );
  
  // Check for low priority keywords
  const hasLowPriority = lowPriorityKeywords.some(keyword => 
    lowerDescription.includes(keyword)
  );
  
  if (hasHighPriority) return "HIGH";
  if (hasLowPriority) return "LOW";
  
  // Check description length - longer descriptions might indicate more important tasks
  if (description.length > 100) return "MEDIUM";
  
  return "MEDIUM";
}

/**
 * Check if description contains important keywords
 */
function checkImportantKeywords(description: string): boolean {
  const lowerDescription = description.toLowerCase();
  const importantKeywords = [
    "urgent", "important", "critical", "asap", "deadline",
    "must", "need", "required", "essential", "priority",
    "immediate", "emergency", "fix", "bug", "error", "blocking"
  ];
  
  return importantKeywords.some(keyword => lowerDescription.includes(keyword));
}

