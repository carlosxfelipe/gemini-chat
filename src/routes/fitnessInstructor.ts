import { Elysia, t } from "elysia";
import { callGeminiAPI } from "../utils/geminiClient";
import { normalize } from "../utils/normalize";

const GREETINGS = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"];
const ALLOWED_TOPICS = [
  // 🏋️‍♂️ Musculação e Treinamento de Força
  "musculação",
  "treinamento de força",
  "bodybuilding",
  "hipertrofia",
  "powerlifting",
  "supino",
  "agachamento",
  "levantamento terra",
  "periodização",
  "carga progressiva",
  "falha muscular",
  "treino ABC",
  "fullbody",
  "split de treino",
  "volume de treino",
  "intensidade",
  "descanso entre séries",

  // 🧘‍♀️ Condicionamento Físico e Funcional
  "treinamento funcional",
  "aeróbico",
  "HIIT",
  "cardio",
  "alongamento",
  "mobilidade",
  "core",
  "resistência física",

  // 🍎 Nutrição e Alimentação
  "nutrição",
  "alimentação",
  "macronutrientes",
  "proteína",
  "carboidratos",
  "gorduras",
  "suplementação",
  "whey protein",
  "creatina",
  "BCAA",
  "pré-treino",
  "dieta cutting",
  "dieta bulking",
  "dieta low carb",
  "jejum intermitente",
  "reeducação alimentar",

  // 🧠 Saúde e Bem-estar
  "sono",
  "recuperação muscular",
  "hormônios",
  "testosterona",
  "cortisol",
  "saúde mental",
  "motivação",
  "disciplina",

  // 🏃‍♂️ Esportes e Modalidades Atléticas
  "corrida",
  "ciclismo",
  "natação",
  "calistenia",
  "escalada",
  "triatlo",
  "maratona",
  "skate",
  "patinação",

  // 🏀 Esportes com Bola – Fundamentos e Regras
  "futebol",
  "regras do futebol",
  "tática de futebol",
  "basquete",
  "regras do basquete",
  "vôlei",
  "regras do vôlei",
  "futsal",
  "handebol",
  "beisebol",
  "rugby",
  "tênis",
  "tênis de mesa",
  "badminton",
  "golfe",

  // 🥋 Esportes de Combate
  "luta",
  "jiu-jitsu",
  "muay thai",
  "boxe",
  "karatê",
  "judô",
  "taekwondo",
  "tkd",
  "capoeira",
  "kung fu",
  "kickboxing",
  "MMA",

  // 🏋️ Equipamentos e Ambiente de Treino
  "academia",
  "halteres",
  "barra",
  "máquinas de musculação",
  "equipamentos de academia",
  "personal trainer",
  "plano de treino",
  "biotipo",

  // 📊 Medidas e Avaliação Física
  "avaliação física",
  "IMC",
  "porcentagem de gordura",
  "massa magra",
  "progresso corporal",
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
          text: "Você é um profissional de educação física. Responda sempre em português, de forma objetiva e curta. Você pode falar sobre musculação, treinos, nutrição, esportes, regras de modalidades esportivas e condicionamento físico.",
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
