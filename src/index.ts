import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { config } from "dotenv";
import { fitnessInstructorRoute } from "./routes/fitnessInstructor";
import { psychologistRoute } from "./routes/psychologist";
import { moemaRoute } from "./routes/moema";
import { investmentAdvisorRoute } from "./routes/investmentAdvisor.ts";

config();

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "Gemini Chat API",
          description:
            "API que permite interações com assistentes especializados, como instrutores de academia, médicos e psicólogos. As respostas são sempre em português e focadas nos temas de cada especialidade.",
          version: "1.0.0",
        },
      },
    })
  )
  .use(fitnessInstructorRoute)
  .use(psychologistRoute)
  .use(moemaRoute)
  .use(investmentAdvisorRoute)
  .get("/", () => ({ status: "online" }))
  .listen(Number(process.env.PORT) || 3000);

console.log(`🚀 Servidor rodando em http://localhost:${app.server?.port}`);
console.log(
  `📚 Swagger disponível em http://localhost:${app.server?.port}/docs`
);
