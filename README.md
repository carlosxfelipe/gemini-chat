### Exemplo de chamada à API

```bash
echo '{"contents":[{"role":"user","parts":[{"text":"Oi, tudo bem?"}]}]}' | \
curl -X POST http://localhost:3000/gemini/chat/fitness-instructor \
  -H "Content-Type: application/json" \
  -d @-
```
