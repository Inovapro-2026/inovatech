
# INOVAPRO — Plano de Implementação Completo

## Visão Geral

Este plano cobre a construção do SaaS INOVAPRO do zero, utilizando a base já existente (React + Vite + Tailwind + Supabase conectado). O projeto já possui as tabelas `profiles`, `contracts`, `messages`, `wallets`, `freelancers`, `portfolios`, `reviews` e outras no banco de dados. Vamos aproveitá-las e criar o que estiver faltando.

A implementação será feita em fases ordenadas para garantir que as dependências sejam respeitadas.

---

## Fase 1 — Design System e Configuração Base

### 1.1 Atualizar `src/index.css`
Redefinir as variáveis CSS para a paleta INOVAPRO (Teal como primária), adicionar a fonte Inter via import do Google Fonts, e configurar as variáveis de glassmorphism e animações base.

### 1.2 Atualizar `tailwind.config.ts`
Adicionar as cores customizadas (`teal`, `emerald`, `slate`) como aliases, extender as animações (fade-in, slide-up, float) e configurar o `fontFamily` para Inter.

### 1.3 Adicionar fontes e animações globais
Configurar keyframes CSS para: `fadeIn`, `slideUp`, `floatAnimation`, `parallax-move`, e o efeito de reveal ao scrollar.

---

## Fase 2 — Banco de Dados (Migrações SQL)

### 2.1 Tabela `projects` (nova)
A tabela `portfolios` existente cobre parte do uso, mas precisamos de uma tabela `projects` dedicada ao marketplace com os campos corretos. Vamos criar via migration:

```sql
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  price numeric NOT NULL DEFAULT 0,
  cover_image_url text,
  image_urls text[] DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

Com RLS:
- SELECT aberto para status = 'published'
- INSERT/UPDATE/DELETE apenas pelo freelancer_id = auth.uid()

### 2.2 Adicionar `pending_balance` à tabela `wallets`
A tabela wallets existente não tem `pending_balance`. Migration para adicionar a coluna.

### 2.3 Verificar e complementar RLS nas tabelas existentes
Revisar `messages`, `contracts`, `deliveries`, `freelancers`, `portfolios` para garantir que todas as políticas necessárias existam.

---

## Fase 3 — Sistema de Autenticação

### 3.1 Contexto de Autenticação (`src/contexts/AuthContext.tsx`)
Hook centralizado que expõe:
- `user` (Supabase auth user)
- `profile` (dados da tabela `profiles`)
- `userRole` (consultado via `has_role()` function ou `user_roles` table)
- `isAdmin`, `isFreelancer`, `isClient` (booleans derivados)
- Funções: `signIn`, `signUp`, `signOut`

O `onAuthStateChange` é configurado ANTES do `getSession()`.

### 3.2 Guards de Rota (`src/components/auth/`)
- `ProtectedRoute.tsx` — Redireciona para login se não autenticado
- `RoleRoute.tsx` — Verifica papel (client/freelancer/admin) e redireciona se não autorizado
- `AdminRoute.tsx` — Específico para rota /admin, valida role 'admin' via server-side

### 3.3 Páginas de Auth (`src/pages/auth/`)
- `Login.tsx` — Formulário email/senha + link para cadastro
- `Register.tsx` — Cadastro com seleção de papel (Cliente ou Freelancer) + onboarding mínimo
- `ForgotPassword.tsx` — Envio de email de recuperação
- `ResetPassword.tsx` — Formulário de nova senha (rota `/reset-password`)

---

## Fase 4 — Landing Page (`src/pages/Index.tsx`)

A landing page será completamente reescrita com as seguintes seções, todas com animações CSS (sem dependências externas pesadas):

### 4.1 `Header` fixo com transparência → opaco no scroll
- Logo: ícone `Zap` (lucide) + "INOVAPRO" em teal
- Menu de navegação com scroll suave para âncoras
- Botões "Entrar" e "Contratar Agora"

### 4.2 `HeroSection`
- Título animado com fade-in + slide-up escalonado
- Subtítulo com delay
- Dois CTAs
- Mockup do dashboard flutuando com CSS 3D transform e `perspective`
- Efeito parallax no scroll via `useEffect` + `window.scrollY`

### 4.3 `FeaturesSection` — 6 Cards Animados
- Ícones lucide-react estilizados
- Cards com `IntersectionObserver` para reveal no scroll com stagger
- Hover: lift + sombra aumentada

### 4.4 `HowItWorksSection` — Timeline Interativa
- Toggle "Sou Cliente" / "Sou Freelancer" com estado React
- 3 passos com linha animada via CSS (width transition no scroll)
- Ícones conectados

### 4.5 `PricingSection` — Cards Comparativos
- Toggle Mensal/Anual com desconto de 20%
- 3 planos: Free, Pro (glow + badge "Mais Popular"), Premium
- Card Pro com `ring-2 ring-teal-500` e sombra colorida

### 4.6 `TestimonialsSection` — Carrossel
- Auto-play a cada 4s com transição suave
- 5 depoimentos mockados
- Números de prova social acima

### 4.7 `CTASection` + `Footer`
- Gradiente teal
- Footer com 4 colunas, redes sociais, newsletter e status do servidor

---

## Fase 5 — Rota `/marketplace` (Cliente)

### 5.1 Estrutura de Arquivos
```
src/pages/marketplace/
  index.tsx           — Vitrine de projetos
  painel/
    index.tsx         — Painel do cliente (redireciona para aba ativa)
    Overview.tsx      — Visão geral
    ActiveContracts.tsx
    CompletedContracts.tsx
    Messages.tsx
    Files.tsx
    Settings.tsx
src/components/marketplace/
  ProjectCard.tsx     — Card estilo e-commerce
  FreelancerModal.tsx — Modal perfil completo
  CheckoutModal.tsx   — Confirmação antes do MP
  FilterSidebar.tsx   — Filtros laterais
  MarketplaceHeader.tsx
  ClientSidebar.tsx
```

### 5.2 Vitrine de Projetos
- Busca projetos da tabela `projects` com status = 'published'
- Filtros em tempo real: categoria, nível, preço min/máx, disponibilidade
- Grid responsivo: 1 col (mobile), 2 col (tablet), 3 col (desktop)
- Skeleton loading enquanto carrega

### 5.3 Modal de Perfil Completo
- Dados do freelancer de `profiles` + `freelancers`
- Grid de projetos do freelancer
- Botões de ação

### 5.4 Fluxo de Checkout (Mercado Pago)
- `CheckoutModal` mostra resumo do projeto
- Chama edge function `create-mp-preference`
- Edge function usa `MP_ACCESS_TOKEN` para criar preferência
- Redireciona para `init_point` do Mercado Pago

### 5.5 Painel do Cliente
- Layout com `ClientSidebar` + área de conteúdo
- Aba "Serviços Fechados": contratos com status `in_progress`
- Aba "Serviços Concluídos": contratos com status `delivered` — botões Aprovar/Reprovar
- Aba "Mensagens": chat em tempo real (ver Fase 7)
- Aba "Arquivos": lista de entregáveis de `deliveries`

---

## Fase 6 — Rota `/freelas` (Freelancer)

### 6.1 Estrutura de Arquivos
```
src/pages/freelas/
  index.tsx           — Dashboard principal
  dashboard/
    Overview.tsx      — KPIs e recomendações
    MyJobs.tsx        — Meus jobs (abas)
    Portfolio.tsx     — Gestão de portfólio
    Messages.tsx      — Chat
    Financial.tsx     — Financeiro + saque
    Settings.tsx      — Configurações + perfil
src/components/freelas/
  FreelancerSidebar.tsx
  FreelancerHeader.tsx
  KPICard.tsx
  DeliveryModal.tsx
  AddProjectModal.tsx
  WithdrawModal.tsx
```

### 6.2 Dashboard Overview
- Consulta `wallets` para saldo
- Consulta `contracts` para jobs ativos e concluídos
- Seção de recomendações (jobs com skills matching — simplificado)
- Timeline de atividade recente

### 6.3 Portfólio
- Lista projetos da tabela `projects` do freelancer
- Modal de criação/edição com upload para bucket `portfolios` (já existe)
- Publicar imediatamente altera status para 'published'

### 6.4 Meus Jobs
- Sub-abas: Em Andamento (`in_progress`), Entregues (`delivered`), Concluídos (`completed`)
- Modal de Entrega: input de mensagem + upload de arquivos para bucket `deliveries` (criar se não existir)
- Insere em `deliveries` e atualiza `contracts.status = 'delivered'`

### 6.5 Financeiro
- Saldo da `wallets`
- Extrato de `payments`
- Modal de saque → insere em `withdrawals`
- Dados bancários de `bank_accounts`

### 6.6 Configurações
- Formulário de perfil público → atualiza `profiles` + `freelancers`
- Upload de avatar para bucket `avatars`
- Dados pessoais (CPF, phone, birth_date → `profiles`)
- Dados bancários → `bank_accounts`

---

## Fase 7 — Chat em Tempo Real (Supabase Realtime)

### `src/components/chat/`
- `ChatList.tsx` — Lista de conversas (usa `conversations`)
- `ChatWindow.tsx` — Janela de mensagens
- `MessageBubble.tsx` — Bolha de mensagem individual
- `ChatInput.tsx` — Input + envio + anexo

### Implementação Realtime
```typescript
const channel = supabase
  .channel('messages-realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()
```

- Scroll automático para última mensagem
- Badge de mensagens não lidas no sidebar
- Marcar como lido ao abrir conversa

---

## Fase 8 — Rota `/admin`

### 8.1 Estrutura de Arquivos
```
src/pages/admin/
  Login.tsx           — Login específico admin
  index.tsx           — Dashboard admin
  components/
    AdminSidebar.tsx
    AdminHeader.tsx
    UsersTable.tsx
    ContractsTable.tsx
    DisputesPanel.tsx
    FinancialOverview.tsx
```

### 8.2 Proteção da Rota Admin
- `AdminRoute.tsx` verifica `has_role(user.id, 'admin')` via consulta ao banco
- NUNCA usa localStorage para verificar admin
- Redireciona para `/admin/login` se não autorizado

### 8.3 Dashboard Métricas
- GMV: soma de `contracts.amount` no mês
- Receita: GMV * taxa da plataforma (de `platform_settings`)
- Usuários: count de `profiles` agrupado por role
- Projetos: count de `projects` por status

### 8.4 Tabela de Usuários
- Lista com busca por nome/email
- Paginação (50 por página)
- Ações via service role (edge function `admin-actions`)

### 8.5 Gestão de Disputas
- Contratos com status `dispute`
- Chat dos participantes visível para admin
- Ações: liberar para freelancer (atualiza wallet) ou estornar para cliente

---

## Fase 9 — Integração Mercado Pago (Edge Functions)

### 9.1 `supabase/functions/create-mp-preference/index.ts`
- Recebe: `project_id`, `client_id`
- Usa `MP_ACCESS_TOKEN` (já configurado como secret)
- Cria preferência via API do Mercado Pago
- Retorna `preference_id` e `init_point`
- Salva `mercadopago_preference_id` no contrato pendente

### 9.2 `supabase/functions/mp-webhook/index.ts`
- Escuta notificações do Mercado Pago
- Valida o evento
- Se `status === 'approved'`:
  - Cria contrato em `contracts` com status `pending_acceptance`
  - Notifica freelancer via `messages` ou notificação
- Se `status === 'rejected'`: atualiza status do contrato

### 9.3 `supabase/functions/admin-actions/index.ts`
- Protegido por verificação de role admin
- Ações: banir usuário, verificar usuário, liberar disputa, estornar pagamento

---

## Fase 10 — App.tsx e Rotas

### Estrutura Final das Rotas
```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/auth/login" element={<Login />} />
  <Route path="/auth/register" element={<Register />} />
  <Route path="/auth/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  
  {/* Marketplace - requer auth + role client */}
  <Route path="/marketplace" element={<RoleRoute role="client"><MarketplaceLayout /></RoleRoute>}>
    <Route index element={<MarketplaceHome />} />
    <Route path="painel" element={<ClientPanel />} />
    <Route path="painel/mensagens" element={<ClientMessages />} />
  </Route>
  
  {/* Freelas - requer auth + role freelancer */}
  <Route path="/freelas" element={<RoleRoute role="freelancer"><FreelasLayout /></RoleRoute>}>
    <Route index element={<FreelancerDashboard />} />
    <Route path="jobs" element={<MyJobs />} />
    <Route path="portfolio" element={<Portfolio />} />
    <Route path="mensagens" element={<FreelancerMessages />} />
    <Route path="financeiro" element={<Financial />} />
    <Route path="configuracoes" element={<FreelancerSettings />} />
  </Route>
  
  {/* Admin - requer auth + role admin */}
  <Route path="/admin/login" element={<AdminLogin />} />
  <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
    <Route index element={<AdminDashboard />} />
    <Route path="usuarios" element={<AdminUsers />} />
    <Route path="projetos" element={<AdminProjects />} />
    <Route path="contratos" element={<AdminContracts />} />
    <Route path="financeiro" element={<AdminFinancial />} />
    <Route path="disputas" element={<AdminDisputes />} />
  </Route>
  
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## Detalhe Técnico: Tabelas Existentes vs. Necessárias

| Tabela | Situação | Ação |
|--------|----------|------|
| `profiles` | Existe | Usar como está, adicionar `updated_at` trigger se não houver |
| `freelancers` | Existe | Usar para dados extras de freelancer |
| `contracts` | Existe | Usar (já tem campos MP) |
| `messages` | Existe | Usar + habilitar Realtime |
| `conversations` | Existe | Usar para lista de chats |
| `deliveries` | Existe | Usar para entregas |
| `wallets` | Existe | Adicionar `pending_balance` |
| `bank_accounts` | Existe | Usar para dados bancários |
| `withdrawals` | Existe | Usar para saques |
| `reviews` | Existe | Usar para avaliações |
| `portfolios` | Existe | Usar como base de portfólio |
| `user_roles` | Existe | Usar (tem `has_role` function) |
| `projects` | **Não existe** | **Criar via migration** |
| `platform_settings` | Existe | Usar para configurações admin |

---

## Ordem de Execução

1. Design system (CSS + Tailwind) — sem dependências
2. Migration da tabela `projects` + wallets.pending_balance
3. AuthContext + guards de rota
4. Páginas de auth (login, register, reset-password)
5. Landing page completa
6. Marketplace (vitrine + painel cliente)
7. Freelas (dashboard + todas as abas)
8. Chat em tempo real
9. Admin (dashboard + tabelas + disputas)
10. Edge functions Mercado Pago (create-preference + webhook)
11. App.tsx com todas as rotas configuradas

---

## Notas de Segurança

- Roles NUNCA armazenadas em localStorage — sempre consultadas do banco via `user_roles`
- Admin verificado server-side via `has_role()` com SECURITY DEFINER
- RLS ativa em todas as tabelas
- Edge functions validam JWT antes de executar ações sensíveis
- Webhook do Mercado Pago valida assinatura antes de processar

Este plano cobre 100% do escopo solicitado e será implementado seguindo a arquitetura existente do projeto.
