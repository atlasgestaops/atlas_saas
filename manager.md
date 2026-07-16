# AtlasOps — Manager (Central de Acessos)
> URLs do projeto, chaves de API, credenciais de serviços terceiros.
> ⚠️ NUNCA commitar este arquivo em repositório público.

---

## Projeto

| Item | Valor | Status |
|------|-------|--------|
| **Repositório** | — | 🔴 A criar |
| **Domínio** | — | 🔴 A definir |
| **Deploy (Coolify)** | — | 🔴 A configurar |

---

## Supabase

| Item | Valor | Status |
|------|-------|--------|
| **Projeto** | Supabase MCP | 🟢 Conectado |
| **URL** | https://grfirxtbxkocjqvfkubk.supabase.co | 🟢 Configurado |
| **Anon Key** | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | 🟢 Configurado |
| **Service Role Key** | — | — |
| **DB Connection String** | — | — |

---

## n8n

| Item | Valor | Status |
|------|-------|--------|
| **URL** | — | 🟡 Já rodando (preencher URL) |
| **Workflows AtlasOps** | — | 🔴 A criar |

---

## Integrações

| Serviço | Credencial | Status |
|---------|-----------|--------|
| **WhatsApp API** | — | 🔴 A configurar |
| **GitHub API** | Personal Access Token | 🔴 A criar |

---

## Variáveis de Ambiente (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://grfirxtbxkocjqvfkubk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZmlyeHRieGtvY2pxdmZrdWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDU3MzAsImV4cCI6MjA5NTk3ODc5NH0.D7IoDm09-s7aSIWIz254pwVp9SrK_WG9dDu4BfW1KS8
SUPABASE_SERVICE_ROLE_KEY=

# n8n
N8N_WEBHOOK_URL=

# GitHub
GITHUB_TOKEN=
```

---

## Usuários de Teste

| Nome | Email | Senha | Papel |
|------|-------|-------|-------|
| Detlef (Admin) | — | — | admin |
| Sócia (Comercial) | — | — | comercial |
