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
  "trauma",
  "traumático",
  "traumática",

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

  // Saúde e enfrentamento de doenças
  "tratamento",
  "cura",
  "câncer",
  "luto",
  "enfermidade",
  "doença",
  "terminal",
  "morte",
  "perda",
  "perca",
  "diagnóstico",
  "recuperação",

  // Problemas amorosos e relacionamentos
  "relacionamento",
  "problema amoroso",
  "problemas amorosos",
  "traição",
  "chifre",
  "amante",
  "ciúmes",
  "término",
  "separação",
  "divórcio",
  "desilusão amorosa",
  "relacionamento tóxico",
  "amor não correspondido",
  "namorado",
  "namorada",
  "casamento",
  "infidelidade",
];

const DIVERSITY_TOPICS = [
  // Identidade, diversidade e preconceito
  "lgbt",
  "lgbtqia+",
  "gay",
  "lésbica",
  "bissexual",
  "transexual",
  "transgênero",
  "não-binário",
  "homossexual",
  "identidade de gênero",
  "orientação sexual",
  "preconceito",
  "discriminação",
  "homofobia",
  "transfobia",
  "autoaceitação",
  "sair do armário",
  "rejeição familiar",
  "aceitação",
];

export const psychologistRoute = new Elysia().post(
  "/gemini/chat/psychologist",
  async ({ body }) => {
    const lastUserMessage = [...body.contents]
      .reverse()
      .find((msg) => msg.role === "user");

    const input = normalize(lastUserMessage?.parts[0]?.text || "");

    const isCurrentAllowed = ALLOWED_TOPICS.some((t) =>
      input.includes(normalize(t))
    );

    const lastAllowedTopic = [...body.contents]
      .map((msg) => msg.parts[0]?.text || "")
      .reverse()
      .find((msg) =>
        ALLOWED_TOPICS.some((t) => normalize(msg).includes(normalize(t)))
      );

    const enrichedInput =
      !isCurrentAllowed && lastAllowedTopic
        ? `${input} ${lastAllowedTopic}`
        : input;

    const isGreeting = GREETINGS.some((g) =>
      enrichedInput.includes(normalize(g))
    );

    const isAllowed = ALLOWED_TOPICS.some((t) =>
      enrichedInput.includes(normalize(t))
    );

    if (!isGreeting && !isAllowed) {
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
