import { Elysia, t } from "elysia";
import { callGeminiAPI } from "../utils/geminiClient";
import { normalize } from "../utils/normalize";

const GREETINGS = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"];
const ALLOWED_TOPICS = [
  // Emoções e transtornos
  "ansiedade",
  "ansioso",
  "ansiosa",
  "crise de ansiedade",
  "depressão",
  "depressivo",
  "depressiva",
  "triste",
  "tristeza",
  "desânimo",
  "angústia",
  "medo",
  "pânico",
  "culpa",
  "raiva",
  "insegurança",
  "autoestima",
  "autoconfiança",
  "autoimagem",
  "cansado",
  "cansada",
  "estresse",
  "estressado",
  "estressada",
  "burnout",
  "esgotamento",
  "fobia",
  "fobias",
  "transtorno",
  "transtornos",
  "chateado",
  "chateada",
  "preocupado",
  "preocupada",
  "preocupação",
  "preocupações",
  "desesperança",
  "desespero",
  "mindfulness",
  "meditação",
  "autoconsciência",
  "compaixão",

  // Questões existenciais
  "sentido da vida",
  "propósito",
  "vazio existencial",
  "existência",
  "autoconhecimento",
  "sofrimento",
  "solidão",
  "dor emocional",
  "impermanência",
  "desapego",
  "iluminação",
  "nirvana",
  "reencarnação",

  // Filosofia e espiritualidade
  "espiritualidade",
  "cristianismo",
  "fé",
  "oração",
  "deus",
  "esperança",
  "redenção",
  "pecado",
  "salvação",
  "evangelho",
  "reflexão",
  "ética",
  "virtude",
  "alma",
  "vida após a morte",
  "budismo",
  "zen",
  "karma",
  "silêncio interior",

  // Neurodivergências e transtornos do neurodesenvolvimento
  "tdah",
  "tea",
  "autismo",
  "autista",
  "bipolaridade",
  "transtorno bipolar",
  "transtorno de personalidade",
  "transtorno obsessivo-compulsivo",
  "toc",
  "espectro autista",
  "déficit de atenção",
  "hiperatividade",
  "neurodivergente",
  "neurodivergência",
];

export const psychologistRoute = new Elysia().post(
  "/gemini/chat/psychologist",
  async ({ body }) => {
    // const input = normalize(body.contents[0]?.parts[0]?.text || "");

    const lastUserMessage = [...body.contents]
      .reverse()
      .find((msg) => msg.role === "user");
    const input = normalize(lastUserMessage?.parts[0]?.text || "");

    const isGreeting = GREETINGS.some((g) => input.includes(normalize(g)));
    const isCurrentAllowed = ALLOWED_TOPICS.some((t) =>
      input.includes(normalize(t))
    );

    // Verifica se alguma mensagem anterior (usuário ou IA) contém um tópico permitido
    const allMessages = body.contents.map((msg) => msg.parts[0]?.text || "");

    const hasAllowedTopic = allMessages.some((msg) =>
      ALLOWED_TOPICS.some((t) => normalize(msg).includes(normalize(t)))
    );

    if (!isGreeting && !hasAllowedTopic) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: "Desculpe, só posso responder perguntas relacionadas à saúde mental, psicologia, filosofia e espiritualidade cristã.",
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };
    }

    // const systemPrompt = {
    //   role: "user",
    //   parts: [
    //     {
    //       text: "Você é uma psicóloga acolhedora. Responda sempre em português, com empatia, de forma clara e breve. Utilize conhecimentos de psicologia, filosofia e religião cristã para ajudar pessoas com ansiedade, depressão, baixa autoestima e problemas existenciais.",
    //     },
    //   ],
    // };

    const greetingPrompt = {
      role: "user",
      parts: [
        {
          text: "Você é uma psicóloga acolhedora. Responda sempre em português, com empatia. Se a mensagem for apenas uma saudação, responda de forma simples e breve, com no máximo uma ou duas frases, e convide a pessoa a compartilhar como está se sentindo ou o que a trouxe para a conversa.",
        },
      ],
    };

    const defaultPrompt = {
      role: "user",
      parts: [
        {
          text: "Você é uma psicóloga acolhedora. Responda sempre em português, com empatia e de forma clara. Use no máximo 3 parágrafos curtos. Seja concisa e acolhedora. Baseie-se na psicologia, filosofia e fé cristã para apoiar pessoas com ansiedade, depressão e questões existenciais.",
        },
      ],
    };

    const systemPrompt =
      isGreeting && !isCurrentAllowed ? greetingPrompt : defaultPrompt;

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
