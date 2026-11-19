# RTC · Gestão de cargas

## Rodar localmente

```bash
npm install
npm run dev
```

O front-end usa React, Vite e Tailwind CSS. Os perfis fictícios podem ser trocados no login e no seletor da barra superior. Nenhum dado de autenticação é armazenado no `localStorage`.

## Mock e API

`src/services/api.js` exporta `USE_MOCK = true`. Nesse modo, os services leem e alteram `src/data/data.js` com uma latência simulada. Para integrar o Node/Express, altere a constante para `false`, configure `VITE_API_URL` (padrão `http://localhost:3000/api`) e implemente os endpoints abaixo. As chamadas reais já passam pelo wrapper `apiRequest`.

### Contratos REST esperados

| Service | Método e rota | Corpo | Resposta esperada |
| --- | --- | --- | --- |
| Auth | `GET /me` | — | Usuário atual com `id`, `nome`, `email` e `modulos[]` |
| Auth | `GET /usuarios` | — | Lista de usuários para o seletor de demonstração |
| Auth | `POST /auth/google` | — | `204`; cria sessão HTTP-only, consumida por `GET /me` |
| Cargas | `GET /cargas[?incluir_arquivadas=true]` | — | Lista de cargas |
| Cargas | `GET /cargas/:id` | — | Carga |
| Cargas | `POST /cargas` | Campos comerciais da carga | Carga criada |
| Cargas | `PATCH /cargas/:id` | Campos do módulo editados | Carga atualizada |
| Cargas | `POST /cargas/:id/avancar` | — | Carga atualizada |
| Cargas | `POST /cargas/:id/devolver` | `{ "modulo_destino": "comercial" }` | Carga atualizada |
| Cargas | `POST /cargas/:id/cancelar` | `{ "motivo": "..." }` | Carga cancelada |
| Cargas | `POST /cargas/:id/abandonar` | `{ "motivo": "..." }` | Carga devolvida à Contratação |
| Cargas | `POST /cargas/:id/finalizar` | `{ "cte_emitido": true, "carga_entregue": true }` | Carga finalizada |
| Clientes | `GET /clientes` | — | Clientes com `locais[]` |
| Clientes | `POST /clientes` | Cliente e `locais[]` | Cliente criado |
| Clientes | `PUT /clientes/:id` | Cliente e `locais[]` | Cliente atualizado |
| Clientes | `DELETE /clientes/:id` | — | `204` |
| Motoristas | `GET /motoristas` | — | Lista de motoristas |
| Motoristas | `POST /motoristas` | Motorista | Motorista criado |
| Motoristas | `PUT /motoristas/:id` | Motorista | Motorista atualizado |
| Veículos | `GET /veiculos` | — | Lista de veículos |
| Veículos | `POST /veiculos` | Veículo | Veículo criado |
| Veículos | `PUT /veiculos/:id` | Veículo | Veículo atualizado |

O backend deve aplicar novamente as permissões e regras de negócio; as validações do front-end servem para orientar o usuário, não para substituir autorização no servidor.
