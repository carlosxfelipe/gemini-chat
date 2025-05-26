# Gemini Chat API

API com assistentes especializados que respondem em português. Você pode interagir com personas como:

- 🧘‍♂️ **Instrutor de Academia** – Responde sobre musculação, treinos e nutrição.
- 🧠 **Psicóloga Acolhedora** – Responde com empatia sobre saúde mental, filosofia, espiritualidade e questões existenciais.

---

## 🚀 Como iniciar

### 1. Clone o repositório

```bash
git clone https://github.com/carlosxfelipe/gemini-chat.git
cd gemini-chat
```

### 2. Instale as dependências

```bash
bun install
```

### 3. Configure o ambiente

Copie o arquivo `.env.template` para `.env` e adicione sua chave da API Gemini:

```bash
cp .env.template .env
```

Obtenha uma chave da API em: [Google AI Studio](https://aistudio.google.com/apikey)

### 4. Execute o servidor

```bash
bun start
```

A API estará disponível em: [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentação (Swagger)

Acesse a documentação interativa:

```
http://localhost:3000/docs
```

---

## 📦 Exemplo de chamada

### Instrutor de Academia

```bash
echo '{"contents":[{"role":"user","parts":[{"text":"Oi, tudo bem?"}]}]}' | \
curl -X POST http://localhost:3000/gemini/chat/fitness-instructor \
  -H "Content-Type: application/json" \
  -d @-
```

### Psicóloga

```bash
echo '{"contents":[{"role":"user","parts":[{"text":"Tenho me sentido muito ansioso ultimamente"}]}]}' | \
curl -X POST http://localhost:3000/gemini/chat/psychologist \
  -H "Content-Type: application/json" \
  -d @-
```

---

## 🧠 Sobre

- Criado com [Elysia](https://elysiajs.com/) (web framework rápido para Bun).
- Suporte a CORS e documentação via Swagger.
- Utiliza a API Gemini (Google) com controle de tópicos por persona.
- Todas as respostas são em **português**.

---

## 📁 Estrutura do Projeto

```
gemini-chat/
├── .env.template
├── src/
│   ├── index.ts               # Inicialização do servidor
│   ├── routes/
│   │   ├── fitnessInstructor.ts
│   │   └── psychologist.ts
│   └── utils/
│       ├── geminiClient.ts    # Comunicação com a API Gemini
│       └── normalize.ts       # Função de normalização de texto
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🛠️ Tecnologias

- **[Bun](https://bun.sh/)** – Runtime moderno e rápido
- **Elysia** – Web framework
- **TypeScript** – Tipagem estática
- **Google Gemini API** – IA generativa
- **Swagger** – Documentação automática

---

## 📄 Licença

MIT © [Carlos Felipe](https://github.com/carlosxfelipe)
