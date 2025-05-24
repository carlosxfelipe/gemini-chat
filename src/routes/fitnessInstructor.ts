import { Elysia, t } from "elysia";
import { callGeminiAPI } from "../utils/geminiClient";
import { normalize } from "../utils/normalize";

const GREETINGS = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"];
const ALLOWED_TOPICS = [
  "musculação",
  "treino",
  "bodybuilding",
  "alimentação",
  "nutrição",
  "exercício",
  "academia",
];

export const fitnessInstructorRoute = new Elysia().post(
  "/gemini/chat/fitness-instructor",
  async ({ body }) => {
    const input = normalize(body.contents[0]?.parts[0]?.text || "");
    const isGreeting = GREETINGS.some((g) => input.includes(normalize(g)));
    const isAllowed = ALLOWED_TOPICS.some((t) => input.includes(normalize(t)));

    if (!isGreeting && !isAllowed) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: "Desculpe, só posso responder perguntas relacionadas a musculação, treinos, alimentação e nutrição.",
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };
    }

    const systemPrompt = {
      role: "user",
      parts: [
        {
          text: "Você é um instrutor de academia. Responda sempre em português, de forma objetiva e curta, apenas sobre musculação, treino, alimentação e nutrição.",
        },
      ],
    };

    const payload = {
      contents: [systemPrompt, ...body.contents],
    };

    return await callGeminiAPI(payload);
  },
  {
    body: t.Object({
      contents: t.Array(
        t.Object({
          role: t.String(),
          parts: t.Array(t.Object({ text: t.String() })),
        })
      ),
    }),
  }
);
