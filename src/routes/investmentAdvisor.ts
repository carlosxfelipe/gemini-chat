import { Elysia, t } from "elysia";
import { callGeminiAPI } from "../utils/geminiClient";
import { normalize } from "../utils/normalize";

const GREETINGS = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"];

const ALLOWED_TOPICS = [
  "fii",
  "fiis",
  "fundo imobiliário",
  "fundos imobiliários",
  "fiagro",
  "fiagros",
  "fundo do agronegócio",
  "fi-infra",
  "infraestrutura",
  "fundo de infraestrutura",
  "renda passiva",
  "dividendos",
  "distribuição de lucros",
  "rendimentos",
  "yields",
  "gestão ativa",
  "gestão passiva",
  "vacância",
  "p/vp",
  "liquidez",
  "dividend yield",
  "risco",
  "perfil de investidor",
  "estratégia",
  "análise de fundos",
  "propriedades",
  "imóveis",
  "aluguéis",
  "recebíveis imobiliários",
  "CRA",
  "CRI",
  "valorização",
  "carteira de investimentos",
  "ações",
  "stock",
  "stocks",
  "ações americanas",
  "ações brasileiras",
  "mercado de ações",
  "bolsa de valores",
  "reit",
  "reits",
  "fundos imobiliários americanos",
];

export const investmentAdvisorRoute = new Elysia().post(
  "/gemini/chat/investment-advisor",
  async ({ body }) => {
    const input = normalize(body.contents[0]?.parts[0]?.text || "");
    const isGreeting = GREETINGS.some((g) => input.includes(normalize(g)));
    const tickerRegex = /\b[A-Z]{4}[0-9]{1,2}\b/i;
    const containsTicker = tickerRegex.test(
      body.contents[0]?.parts[0]?.text || ""
    );

    const isAllowed =
      ALLOWED_TOPICS.some((t) => input.includes(normalize(t))) ||
      containsTicker;

    if (!isGreeting && !isAllowed) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: "Desculpe, só posso responder perguntas sobre FIIs, FIAGROs, FI-Infra e temas relacionados a investimentos nesses produtos.",
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
          text: `Você é um assessor de investimentos especializado em FIIs, FIAGROs, FI-Infra, ações e REITs. 
Responda sempre em português. Seja direto, breve e objetivo. Evite explicações longas, apresentações ou convites à conversa. 
Forneça respostas curtas e focadas, com no máximo 3 parágrafos pequenos.`,
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
