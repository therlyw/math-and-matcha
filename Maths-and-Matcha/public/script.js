
const lessons = {
  algebra: {
    title: "Algebra 🌷",
    explanation:
      "Algebra is maths where letters represent unknown numbers. Think of x as a mystery number we want to discover.",
    formula: "If x + a = b, then x = b - a",
    example: "Solve: x + 5 = 12",
    solution:
      "Step 1: We want x on its own.\n" +
      "Step 2: Subtract 5 from both sides.\n" +
      "x + 5 - 5 = 12 - 5\n" +
      "Step 3: x = 7\n\nAnswer: x = 7 ♡",
    question: "Solve: x + 4 = 10",
    answer: "6"
  },

  calculus: {
    title: "Calculus 🦢",
    explanation:
      "Calculus helps us understand how things change. Derivatives measure how quickly something changes at a particular point.",
    formula: "Power rule: d/dx (xⁿ) = nxⁿ⁻¹",
    example: "Differentiate: f(x) = x³",
    solution:
      "Step 1: Identify the power. It is 3.\n" +
      "Step 2: Bring the power to the front.\n" +
      "Step 3: Reduce the power by 1.\n" +
      "f'(x) = 3x²\n\nAnswer: 3x² ♡",
    question: "Differentiate x². What is the answer?",
    answer: "2x"
  },

  geometry: {
    title: "Geometry 🩰",
    explanation:
      "Geometry is the study of shapes, sizes, angles and space.",
    formula: "Area of a rectangle = length × width",
    example: "A rectangle has length 8 cm and width 3 cm.",
    solution:
      "Step 1: Write the formula.\n" +
      "Area = length × width\n" +
      "Step 2: Substitute the values.\n" +
      "Area = 8 × 3\n" +
      "Step 3: Calculate.\n" +
      "Answer = 24 cm² ♡",
    question: "What is the area of a rectangle measuring 5 cm by 4 cm?",
    answer: "20"
  },

  trigonometry: {
    title: "Trigonometry 🧁",
    explanation:
      "Trigonometry studies relationships between angles and sides of triangles.",
    formula:
      "SOH CAH TOA\n" +
      "sin θ = opposite / hypotenuse\n" +
      "cos θ = adjacent / hypotenuse\n" +
      "tan θ = opposite / adjacent",
    example: "A right triangle has opposite side 3 and hypotenuse 5.",
    solution:
      "Use SOH:\n" +
      "sin θ = opposite / hypotenuse\n" +
      "sin θ = 3/5\n" +
      "Answer: sin θ = 0.6 ♡",
    question: "If opposite = 4 and hypotenuse = 5, what is sin θ?",
    answer: "0.8"
  },

  statistics: {
    title: "Statistics 🦋",
    explanation:
      "Statistics helps us collect, organise and understand data. Mean, median and mode are important ways to describe a data set.",
    formula: "Mean = Sum of values / Number of values",
    example: "Find the mean of 2, 4 and 6.",
    solution:
      "Step 1: Add the values.\n" +
      "2 + 4 + 6 = 12\n" +
      "Step 2: Count the values. There are 3.\n" +
      "Step 3: Divide.\n" +
      "12 / 3 = 4\n\nAnswer: 4 ♡",
    question: "Find the mean of 3, 6 and 9.",
    answer: "6"
  }
};

let currentLesson = null;

const $ = (selector) => document.querySelector(selector);

// Display a lesson
function showLesson(topic) {
  const lesson = lessons[topic];

  if (!lesson) return;

  currentLesson = lesson;

  $("#lesson-title").textContent = lesson.title;
  $("#explanation").textContent = lesson.explanation;
  $("#formula").textContent = lesson.formula;
  $("#example").textContent = lesson.example;
  $("#solution").textContent = lesson.solution;
  $("#question").textContent = lesson.question;

  $("#answer").value = "";
  $("#feedback").textContent = "";

  $("#lesson").classList.remove("hidden");
  $("#practice").classList.remove("hidden");

  $("#lesson").scrollIntoView({ behavior: "smooth" });
}

// Topic cards
document.querySelectorAll(".topic-card").forEach(card => {
  card.addEventListener("click", () => {
    const topic = card.dataset.topic;

    if (topic === "general") {
      $("#tutor").scrollIntoView({ behavior: "smooth" });
      $("#chat-input").focus();
      return;
    }

    showLesson(topic);
  });
});

// Topic search
$("#topic-search").addEventListener("submit", event => {
  event.preventDefault();

  const topic = $("#topic-input").value.trim();

  if (!topic) return;

  $("#topic-input").value = "";

  askTutor(
    "Teach me the maths topic: " + topic +
    ". Start from the absolute basics. Explain all relevant definitions, " +
    "rules, formulas, conditions and exceptions. Show several fully " +
    "worked examples, explain common mistakes and give me practice " +
    "questions one at a time. Use simple English and do not skip steps."
  );
});

// Practice answer checking
$("#check-answer").addEventListener("click", () => {
  if (!currentLesson) return;

  const answer = $("#answer").value
    .trim()
    .toLowerCase()
    .replace(/\s/g, "");

  const correct = currentLesson.answer
    .toLowerCase()
    .replace(/\s/g, "");

  if (!answer) {
    $("#feedback").textContent = "Enter your answer first, lovely! ♡";
    return;
  }

  if (answer === correct) {
    $("#feedback").textContent =
      "Correct!! You're a maths princess! 🎀";
    $("#feedback").style.color = "#39865b";
  } else {
    $("#feedback").textContent =
      "Not quite, lovely! Try again. You've got this ♡";
    $("#feedback").style.color = "#b85f85";
  }
});

// Ask AI to expand on the selected lesson
$("#ask-ai").addEventListener("click", () => {
  if (!currentLesson) return;

  askTutor(
    "Please explain " + currentLesson.title +
    " in more depth. Give me extra examples, rules and practice questions."
  );
});

// Chat message display
function addMessage(text, type) {
  const message = document.createElement("div");

  message.className =
    type === "user" ? "user-message" : "bot-message";

  // textContent prevents AI text being interpreted as HTML
  message.textContent = text;

  $("#chat-messages").appendChild(message);

  $("#chat-messages").scrollTop =
    $("#chat-messages").scrollHeight;

  return message;
}

// AI request
async function askTutor(question) {
  if (!question || !question.trim()) return;

  addMessage(question, "user");

  $("#tutor").scrollIntoView({ behavior: "smooth" });

  const loading = addMessage(
    "Thinking of the best explanation for you... 🌸",
    "bot"
  );

  const sendButton = $("#chat-form button");
  sendButton.disabled = true;

  try {
    const response = await fetch(
      "/.netlify/functions/tutor",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: question
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "The tutor is temporarily unavailable."
      );
    }

    loading.textContent = data.answer;

  } catch (error) {
    loading.textContent =
      "Oops! I couldn't connect to your AI tutor. 💗\n\n" +
      error.message +
      "\n\nPlease try again in a moment.";

  } finally {
    sendButton.disabled = false;
    $("#chat-input").focus();
  }
}

// Chat form
$("#chat-form").addEventListener("submit", event => {
  event.preventDefault();

  const question = $("#chat-input").value.trim();

  if (!question) return;

  $("#chat-input").value = "";

  askTutor(question);
});
