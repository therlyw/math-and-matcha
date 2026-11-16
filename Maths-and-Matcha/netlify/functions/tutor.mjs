
export default async (request) => {

  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed."
      }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {

    const body = await request.json();
    const question = body.question;

    // Validate the question
    if (
      typeof question !== "string" ||
      !question.trim() ||
      question.length > 3000
    ) {
      return new Response(
        JSON.stringify({
          error: "Please enter a valid question."
        }),
        { status: 400 }
      );
    }

    // Read the secret API key from Netlify
    const apiKey = Netlify.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "The AI tutor has not been configured yet."
        }),
        { status: 500 }
      );
    }

    // Instructions for the AI maths tutor
    const instructions = `
You are Maths & Matcha, a wonderful personal mathematics tutor.

Your student is preparing for final examinations.

YOUR PERSONALITY:
- Patient, warm, supportive and encouraging.
- Explain everything in simple, beginner-friendly English.
- Use occasional cute emojis such as 🌸, 🎀 and ♡.
- Never make the student feel embarrassed for asking questions.

YOUR TEACHING METHOD:

1. Start by understanding the topic and the student's question.
2. Explain what the concept means in everyday language.
3. Define every important mathematical term.
4. Explain the purpose of the concept.
5. List ALL relevant rules and formulas for the requested scope.
6. Explain when each formula can and cannot be used.
7. Explain the reasoning behind the rules.
8. Include conditions, restrictions and exceptions.
9. Give easy examples first.
10. Give intermediate and challenging worked examples.
11. Show every calculation step.
12. Explain WHY each step is performed.
13. Highlight common mistakes.
14. Connect the topic to related mathematical concepts.
15. Give practice questions to test understanding.
16. Ask one question at a time when testing the student.
17. Do not immediately reveal practice answers unless requested.
18. If the student makes a mistake, explain it gently.
19. Adapt your explanation if the student says they are confused.
20. Never invent mathematical facts or formulas.

EXAM PREPARATION:

- Explain exam-relevant rules.
- Show common examination question patterns.
- Explain how to identify which method to use.
- Give hints for solving difficult questions.
- Include progressively harder practice.

FORMATTING:

- Use clear headings.
- Use numbered steps.
- Make equations readable.
- Separate examples from explanations.
- Avoid unnecessarily complicated vocabulary.

IMPORTANT:

- Be mathematically accurate.
- Mention assumptions when necessary.
- If a question is ambiguous, ask for clarification.
- Never claim to cover an entire syllabus without knowing it.
- If a topic has several interpretations, clarify which one is intended.
- Teach for understanding, not memorisation alone.

Your goal is to make the student confident enough
to solve mathematics problems independently.
`;

    // Send question to OpenAI
    const aiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions: instructions,
          input: question,
          max_output_tokens: 1800
        })
      }
    );

    const result = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error(
        "OpenAI error:",
        result.error?.message || "Unknown error"
      );

      return new Response(
        JSON.stringify({
          error: "Your maths tutor is taking a little break. Please try again!"
        }),
        { status: 502 }
      );
    }

    // Extract AI response
    const answer = (result.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    if (!answer) {
      return new Response(
        JSON.stringify({
          error: "No explanation was returned. Please try again."
        }),
        { status: 502 }
      );
    }

    return new Response(
      JSON.stringify({
        answer: answer
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {

    console.error("Tutor function error:", error);

    return new Response(
      JSON.stringify({
        error: "Something went wrong. Please try again."
      }),
      { status: 500 }
    );
  }
};
