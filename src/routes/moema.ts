import { Elysia, t } from "elysia";
import { callGeminiAPI } from "../utils/geminiClient";
import { normalize } from "../utils/normalize";

const GREETINGS = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"];
const ALLOWED_TOPICS = [
  // Instituição
  "unifor",
  "universidade de fortaleza",
  "faculdade",

  // Plataformas e ensino
  "ava",
  "online",
  "ensino a distância",
  "ead",
  "ensino",

  // Processos seletivos e matrícula
  "vestibular",
  "processo seletivo",
  "inscrição",
  "inscrições",
  "matrícula",
  "matrículas",

  // Cursos e modalidades
  "curso",
  "cursos",
  "graduação",
  "graduações",
  "pós-graduação",
  "mestrado",
  "doutorado",
  "especialização",
  "especializações",

  // Infraestrutura
  "estrutura",
  "campus",
  "biblioteca",
  "restaurante",
  "restaurantes",
  "laboratório",
  "laboratórios",
  "academia",

  // Eventos e serviços
  "evento",
  "eventos",
  "serviço",
  "serviços",

  // Apoio estudantil e financeiro
  "fies",
  "sisu",
  "proUni",
  "bolsa",
  "bolsas",
  "financiamento",
  "financiamentos",
  "mensalidade",
  "mensalidades",
  "pagamento",
  "pagamentos",
  "desconto",
  "descontos",

  // Corpo docente e aulas
  "professor",
  "professores",
  "aula",
  "aulas",
  "horário",
  "horários",
  "calendário",

  // Secretaria e documentação
  "secretaria",
  "documento",
  "documentos",
  "documentação",
  "documentações",
  "certificado",
  "certificados",
  "diploma",
  "diplomas",

  // Atendimento e suporte
  "atendimento",
  "suporte",
  "contato",

  // Dúvidas e comunicação
  "informação",
  "informações",
  "ajuda",
  "dúvida",
  "dúvidas",
  "pergunta",
  "perguntas",
  "resposta",
  "respostas",

  // Estágio
  "estágio",
];

export const moemaRoute = new Elysia().post(
  "/gemini/chat/moema",
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

    // Resposta especial para Estrutura de Dados com Paulo Cirillo
    const mentionsStructureWithCirillo =
      normalize(input).includes("estrutura de dados") &&
      (normalize(input).includes("paulo cirillo") ||
        normalize(input).includes("paulo cirilo"));

    if (mentionsStructureWithCirillo) {
      return {
        candidates: [
          {
            content: {
              role: "model",
              parts: [
                {
                  text: "Boa sorte na disciplina de Estrutura de Dados com o professor Paulo Cirillo! Se precisar de alguma informação sobre a Unifor, estou por aqui para ajudar 😊",
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
                  text: "Desculpe, só posso responder perguntas relacionadas à Unifor, como cursos, matrícula, estrutura, serviços e eventos da universidade. Como posso ajudar você com isso?",
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
          text: "Você é Moema, a assistente virtual da Unifor, que é a Universidade de Fortaleza. Responda sempre em português, de forma simpática, clara e breve. Se a mensagem for apenas uma saudação, responda com uma ou duas frases acolhedoras e convide a pessoa a dizer como posso ajudá-la com informações sobre a universidade.",
        },
      ],
    };

    const defaultPrompt = {
      role: "user",
      parts: [
        {
          text: "Você é Moema, a assistente virtual da Unifor, que é a Universidade de Fortaleza. Responda sempre em português, de forma clara, acolhedora e objetiva. Use no máximo 3 parágrafos curtos. Seu papel é ajudar com informações sobre cursos, matrícula, estrutura da universidade, eventos, e demais serviços oferecidos pela Unifor.",
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
