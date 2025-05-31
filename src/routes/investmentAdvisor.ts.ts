import { Elysia, t } from "elysia";
import { callGeminiAPI } from "../utils/geminiClient";
import { normalize } from "../utils/normalize";

const GREETINGS = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"];

const ALLOWED_TOPICS = [
  // 📈 Ações e Bolsa
  "ação",
  "ações",
  "bolsa de valores",
  "b3",
  "day trade",
  "swing trade",
  "buy and hold",
  "análise técnica",
  "análise fundamentalista",
  "dividendo",
  "dividendos",
  "lucro",
  "lucros",
  "valuation",
  "blue chip",
  "blue chips",
  "small cap",
  "small caps",
  "corretora",
  "home broker",
  "follow-on",
  "IPO",
  "subscrição",
  "bonificação",
  "desdobramento",
  "grupamento",
  "free float",
  "tag along",
  "governança corporativa",
  "bookbuilding",

  // 🏢 Fundos Imobiliários (FIIs)
  "fundo imobiliário",
  "fundos imobiliários",
  "fii",
  "fiis",
  "fof",
  "fofs",
  "renda passiva",
  "vacância",
  "cap rate",
  "rmg",
  "alavancagem",
  "default",
  "rendimento",
  "rendimentos",
  "provento",
  "proventos",
  "patrimônio líquido",
  "PL",
  "yield",
  "valor patrimonial",
  "VPA",
  "galpão logístico",
  "galpões logísticos",
  "shopping",
  "shoppings",
  "laje corporativa",
  "lajes corporativas",
  "crédito imobiliário",
  "tijolo",
  "papel",
  "gestão ativa",
  "gestão passiva",
  "dividend yield",
  "dy",
  "taxa de ocupação",
  "FII de papel",
  "FII de tijolo",
  "gestor",
  "administrador",
  "vacância física",
  "vacância financeira",
  "crédito pulverizado",

  // 🌾 Fiagro e Infraestrutura
  "fiagro",
  "agro",
  "fi-infra",
  "infra",
  "fundo de infraestrutura",
  "fundos de infraestrutura",
  "debênture incentivada",
  "debêntures incentivadas",
  "CRA",
  "CRI",
  "título incentivado",
  "IPCA+",

  // 🌍 BDRs e Ações Internacionais
  "bdr",
  "bdrs",
  "ADR",
  "10-K",
  "earnings call",
  "market cap",

  // 🌎 Ações Internacionais (Stocks)
  "stock",
  "stocks",
  "ação internacional",
  "ações internacionais",
  "investimento no exterior",
  "investir no exterior",
  "mercado americano",
  "s&p500",
  "dow jones",
  "google",
  "apple",
  "amazon",
  "tesla",
  "microsoft",
  "nvidia",
  "dividend stock",
  "dividend stocks",
  "growth stock",
  "growth stocks",
  "value stock",
  "value stocks",
  "blue chip americana",
  "blue chips americanas",
  "etf americano",
  "etfs americanos",
  "etf internacional",
  "etfs internacionais",
  "nasdaq",
  "nyse",

  // 🏢 REITs
  "reit",
  "reits",
  "real estate investment trust",

  // 🪙 Criptomoedas
  "bitcoin",
  "ethereum",
  "cripto",
  "criptos",
  "criptomoeda",
  "criptomoedas",
  "blockchain",
  "defi",
  "web3",
  "token",
  "tokens",
  "wallet",
  "carteira",
  "metamask",
  "halving",
  "staking",
  "proof of stake",
  "proof of work",
  "gas fee",
  "DEX",
  "exchange",
  "custódia",
  "NFT",
  "airdrops",

  // 📚 Geral / Educação Financeira
  "investimento",
  "investimentos",
  "renda variável",
  "risco",
  "riscos",
  "diversificação",
  "liquidez",
  "volatilidade",
  "inflação",
  "juros",
  "selic",
  "reserva de emergência",
  "perfil de investidor",
  "suitability",
  "planejamento financeiro",
  "educação financeira",
  "curva de juros",
  "duration",
  "marcação a mercado",
  "come-cotas",
  "isenção de IR",
  "IRRF",
  "tributação",

  // 📊 Precificação e Negociação
  "cotação",
  "cotações",
  "preço da cota",
  "preço das cotas",
  "preço atual",
  "valor de mercado",
  "valorização",
  "desvalorização",
  "mercado secundário",
  "book de ofertas",
  "spread",
  "preço justo",
  "preço médio",
  "entrada",
  "saída",
  "compra",
  "compras",
  "venda",
  "vendas",
  "ordem limitada",
  "ordens limitadas",
  "ordem a mercado",
  "ordens a mercado",

  // 💰 Renda Fixa
  "renda fixa",
  "tesouro direto",
  "tesouro selic",
  "tesouro prefixado",
  "tesouro IPCA",
  "LTN",
  "NTN-B",
  "NTN-F",
  "LCI",
  "LCA",
  "CDB",
  "CDI",
  "taxa DI",
  "prefixado",
  "pós-fixado",
  "indexado à inflação",
  "IPCA",
  "IGP-M",
  "carência",
  "liquidez diária",
  "resgate antecipado",
  "rentabilidade bruta",
  "rentabilidade líquida",
  "IOF",
  "tributação regressiva",
  "risco de crédito",
  "nota de crédito",
  "rating",
  "emissor",
  "garantia do FGC",
  "FGC",
  "debênture",
  "título público",
  "título privado",
  "allocação em renda fixa",
  "diversificação em renda fixa",
];

const TICKER_REGEX = /^[A-Z]{4}[0-9]{1,2}$/;

export const investmentAdvisorRoute = new Elysia().post(
  "/gemini/chat/investment-advisor",
  async ({ body }) => {
    const lastUserMessage = [...body.contents]
      .reverse()
      .find((msg) => msg.role === "user");

    const input = normalize(lastUserMessage?.parts[0]?.text || "");

    const isCurrentAllowed =
      ALLOWED_TOPICS.some((t) => input.includes(normalize(t))) ||
      input.split(/\s+/).some((word) => TICKER_REGEX.test(word.toUpperCase()));

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

    const isAllowed =
      ALLOWED_TOPICS.some((t) => enrichedInput.includes(normalize(t))) ||
      enrichedInput
        .split(/\s+/)
        .some((word) => TICKER_REGEX.test(word.toUpperCase()));

    // Resposta especial para perguntas relacionadas ao filme "O Lobo de Wall Street"
    const mentionsMovie =
      normalize(input).includes("filme") &&
      ((normalize(input).includes("lobo") &&
        normalize(input).includes("wall street")) ||
        (normalize(input).includes("wolf") &&
          normalize(input).includes("wall street")));

    if (mentionsMovie) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: `Ah, o filme? Aquilo foi só o aquecimento, campeão. O verdadeiro jogo é aqui, nos investimentos reais. Se você quer ganhar como um lobo, precisa pensar como um. Agora me diz: tá pronto pra aprender a dominar esse mercado ou vai só ficar assistindo da plateia? 🐺📈`,
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };
    }

    // Resposta especial para FIIs problemáticos
    const problematicFIIs = ["tord11", "vslh11", "dev11", "hctr11"];
    const mentionsProblematicFII = problematicFIIs.some((ticker) =>
      normalize(input).includes(ticker)
    );

    if (mentionsProblematicFII) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: `Esses fundos aí? TORD11, VSLH11, DEV11, HCTR11... Campeão, esquece que eles existem. É dor de cabeça garantida. Isso aí é tipo entrar num cassino com o bolso furado. Se você quer consistência, segurança e bons rendimentos, passa longe. Aqui a gente investe com estratégia, não com esperança. 🚫📉`,
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };
    }

    // Resposta especial para menções ao Marcelo Fayh
    const mentionsMarceloFayh =
      normalize(input).includes("marcelo fayh") ||
      normalize(input).includes("marcelo fay");

    if (mentionsMarceloFayh) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: `Ah, Marcelo Fayh? Claro que eu conheço, campeão. Esse cara é referência quando o assunto é Fundo Imobiliário. Um verdadeiro tubarão dos FIIs! Ele começou lá embaixo, como operador júnior na XP, e hoje é especialista na L&S, com o CNPI no peito e o faro apurado pra renda passiva. O homem escreveu o Método Fayh, um best-seller que já fez mais gente viver de FII do que muito gestor por aí. Se você quer entender como escolher os melhores fundos, esse é um nome pra prestar atenção. Dá uma olhada no site dele: https://marcelofayh.com.br . Mas agora me diz: vai só admirar os grandes ou vai querer entrar pro jogo com eles? 🏢📈🐺`,
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };
    }

    // Resposta especial para menções ao Lucas Fii
    const mentionsLucasFii =
      normalize(input).includes("lucas fii") ||
      normalize(input).includes("lucas fiis");

    if (mentionsLucasFii) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: `Lucas Fii? ✈️ Claro que eu conheço esse cara, campeão! Polêmico? Sempre. Mas não dá pra negar que ele movimenta o mercado com opiniões afiadas e análises que cutucam muita gestora por aí. Eu mesmo, de vez em quando, dou uma passada no canal dele pra ver o que tá pegando: https://www.youtube.com/@lucasfiis . Informação nunca é demais — desde que você saiba filtrar com inteligência de investidor. 🧠📊`,
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };
    }

    // Resposta especial para menções ao Vasco
    const mentionsVasco =
      normalize(input).includes("vasco") ||
      normalize(input).includes("vascaíno");

    if (mentionsVasco) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: `Vasco? Campeão... se investimento fosse igual à fase do Vasco, ninguém ganhava um centavo! Isso aqui é mercado financeiro, não é segunda divisão! 😂⚽📉 Agora, deixa esse papo de bola pra depois e vem aprender a fazer seu dinheiro jogar na elite, igual blue chip em dia de alta!`,
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };
    }

    if (!isGreeting && !isAllowed) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: `Olha só, campeão... eu sou o cara que transforma perguntas em lucro. Mas se você vier com papo que não é sobre ações, FIIs, cripto ou investimentos sérios... tá no lugar errado. Volta quando quiser falar de grana de verdade. 🐺💼`,
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      };
    }

    const greetingPrompt = {
      role: "user",
      parts: [
        {
          text: `Você é Jordan Belfort, o lendário assessor de investimentos, conhecido como "O Lobo de Wall Street". Você fala com carisma, confiança, energia e uma pitada de provocação. Está sempre vendendo uma ideia com entusiasmo. Responda sempre em português. Se a mensagem for uma saudação, cumprimente a pessoa como Jordan Belfort faria, e convide-a a perguntar sobre ações, FIIs, criptomoedas ou outro tipo de investimento.`,
        },
      ],
    };

    const defaultPrompt = {
      role: "user",
      parts: [
        {
          text: `Você é Jordan Belfort, o lendário assessor de investimentos, conhecido como "O Lobo de Wall Street". Você fala com confiança extrema, entusiasmo contagiante e usa frases impactantes para convencer e ensinar. Responda sempre em português, de forma clara, provocadora e objetiva. Use no máximo 3 parágrafos curtos. Você pode falar sobre ações da bolsa, FIIs, BDRs, Fiagros, FI-Infra e criptomoedas. Sempre destaque os riscos, oportunidades e como extrair o máximo do mercado.`,
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
