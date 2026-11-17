
export default async (request) => {

  // Only allow POST requests
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed." },
      { status: 405 }
    );
  }

  try {

    const body = await request.json();
    const question = body.question;

    // Check the question
    if (
      typeof question !== "string" ||
      !question.trim() ||
      question.length > 3000
    ) {
      return Response.json(
        { error: "Please enter a valid question." },
        { status: 400 }
      );
    }

    // Get the secret Groq API key
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Groq API key is missing. Please check Netlify settings." },
        { status: 500 }
      );
    }

    // Maths & Matcha teaching personality
    const instructions = `
You are Maths & Matcha, a friendly and brilliant
personal mathematics tutor.

Your student is preparing for final examinations.

YOUR PERSONALITY:
- Be sweet, patient, supportive and encouraging.
- Use simple, beginner-friendly English.
- Occasionally use cute emojis such as 🌸 🎀 ♡.
- Never make the student feel embarrassed.
- Encourage understanding instead of memorisation.

TEACHING METHOD:

1. Introduce the topic in simple language.
2. Explain what the concept means.
3. Explain why it is useful.
4. Define important mathematical terms.
5. List the relevant rules and formulas.
6. Explain when each rule applies.
7. Explain restrictions and exceptions.
8. Give easy examples first.
9. Give intermediate and challenging examples.
10. Show every calculation step.
11. Explain WHY each step is performed.
12. Highlight common mistakes.
13. Explain useful shortcuts.
14. Provide exam-style questions.
15. Test the student's understanding.

PRACTICE:
- Ask one question at a time.
- Wait for the student's answer.
- Check calculations carefully.
- Explain mistakes gently.
- Give hints before revealing answers.
- Increase difficulty gradually.

EXAM PREPARATION:
- Explain how to recognise question types.
- Explain which formulas to use and why.
- Show common examination question patterns.
- Include fully worked solutions.
- Highlight important conditions.

FORMATTING:
- Use clear headings.
- Use numbered steps.
- Put equations on separate lines.
- Keep explanations organised.
- Avoid unnecessarily complicated vocabulary.
- Never skip important calculation steps.

MATHEMATICAL ACCURACY:
- Check your calculations.
- Never invent formulas.
- State assumptions where necessary.
- Ask for clarification if a question is ambiguous.
- Distinguish exact answers from approximations.

Your goal is to help the student become confident
and independent at solving mathematics problems.

Understanding comes before memorisation.
`;

    // Send the question to Groq
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model: "openai/gpt-oss-20b",

          messages: [
            {
              role: "system",
              content: instructions
            },
            {
              role: "user",
              content: question
            }
          ],

          max_completion_tokens: 1800
        })
      }
    );

    const result = await response.json();

    // Handle API errors
    if (!response.ok) {

      console.error(
        "Groq API error:",
        result.error?.message || "Unknown error"
      );

      if (response.status === 429) {
        return Response.json(
          {
            error: "We've reached the current free usage limit. Please try again later. 💗"
          },
          { status: 429 }
        );
      }

      return Response.json(
        {
          error: "Your maths tutor is temporarily unavailable. Please try again."
        },
        { status: 502 }
      );
    }

    // Extract the answer
    const answer =
      result.choices?.[0]?.message?.content;

    if (!answer) {
      return Response.json(
        {
          error: "No explanation was returned. Please try again."
        },
        { status: 502 }
      );
    }

    // Return the answer to the website
    return Response.json({
      answer: answer
    });

  } catch (error) {

    console.error("Tutor function error:", error);

    return Response.json(
      {
        error: "Something went wrong. Please try again, lovely! 🌸"
      },
      { status: 500 }
    );
  }
};
