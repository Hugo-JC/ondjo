import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { properties } from "../data/properties";
import type { Property } from "../types";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "system";
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  visitProposal?: {
    date: string;
    time: string;
    location: string;
    confirmed: boolean;
  };
}

export interface Conversation {
  id: string;
  contactName: string;
  role: "Corretor verificado" | "Proprietário particular" | "Assistente Virtual ONDJO";
  avatarUrl?: string;
  isOnline: boolean;
  verified: boolean;
  propertyId?: string;
  unreadCount: number;
  lastActive: string;
  category: "agent" | "owner" | "assistant";
  messages: ChatMessage[];
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    contactName: "Mauro dos Santos",
    role: "Corretor verificado",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    isOnline: true,
    verified: true,
    propertyId: "apartamento-t2-talatona",
    unreadCount: 1,
    lastActive: "Agora",
    category: "agent",
    messages: [
      {
        id: "m-101",
        sender: "agent",
        text: "Olá! Vi o seu interesse no Apartamento T2 em Talatona. O imóvel está disponível para arrendamento imediato com contrato anual.",
        timestamp: "10:14",
        status: "read",
      },
      {
        id: "m-102",
        sender: "user",
        text: "Bom dia, Mauro. O edifício dispõe de gerador de suporte e água da rede com reservatório próprio?",
        timestamp: "10:18",
        status: "read",
      },
      {
        id: "m-103",
        sender: "agent",
        text: "Sim, perfeitamente! Tem gerador automático de 250 kVA para todas as frações e tanque subterrâneo de 15.000 litros com eletrobomba nova.",
        timestamp: "10:20",
        status: "read",
      },
      {
        id: "m-104",
        sender: "agent",
        text: "Podemos agendar uma visita presencial para conhecer o apartamento e as áreas comuns? Sugiro este horário:",
        timestamp: "10:22",
        status: "read",
        visitProposal: {
          date: "Sábado, 11 de Outubro",
          time: "10:30",
          location: "Talatona, Luanda (junto ao Belas Shopping)",
          confirmed: false,
        },
      },
    ],
  },
  {
    id: "conv-2",
    contactName: "Assistente ONDJO",
    role: "Assistente Virtual ONDJO",
    avatarUrl: "",
    isOnline: true,
    verified: true,
    unreadCount: 0,
    lastActive: "Sempre ativo",
    category: "assistant",
    messages: [
      {
        id: "m-201",
        sender: "agent",
        text: "Olá! Sou o assistente oficial do ONDJO. Posso ajudar a calcular estimativas de renda, explicar documentos prediais em Angola (IPU, Certidão de Registo Predial) ou sugerir as melhores zonas de Luanda de acordo com o seu orçamento.",
        timestamp: "Ontem",
        status: "read",
      },
      {
        id: "m-202",
        sender: "user",
        text: "Quais documentos devo solicitar antes de fechar um contrato de arrendamento em Luanda?",
        timestamp: "Ontem",
        status: "read",
      },
      {
        id: "m-203",
        sender: "agent",
        text: "Recomendamos conferir sempre: 1) Cópia do BI dos outorgantes, 2) Certidão do Registo Predial atualizada para confirmar titularidade, 3) Comprovativo de liquidação do IPU (Imposto Predial Urbano) e 4) O termo de vistoria anexo ao contrato com relação detalhada do estado do imóvel.",
        timestamp: "Ontem",
        status: "read",
      },
    ],
  },
  {
    id: "conv-3",
    contactName: "Dona Kátia Silveira",
    role: "Proprietário particular",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    isOnline: false,
    verified: true,
    propertyId: "moradia-t4-benfica",
    unreadCount: 0,
    lastActive: "Há 45 min",
    category: "owner",
    messages: [
      {
        id: "m-301",
        sender: "user",
        text: "Boa tarde, Dona Kátia. A moradia em Benfica ainda aceita animais de pequeno porte no quintal?",
        timestamp: "09:05",
        status: "read",
      },
      {
        id: "m-302",
        sender: "agent",
        text: "Boa tarde! Sim, sem qualquer problema, o quintal é espaçoso e murado. A caução são 2 meses de renda adiantada com contrato mínimo de 1 ano registado.",
        timestamp: "09:40",
        status: "read",
      },
    ],
  },
  {
    id: "conv-4",
    contactName: "Paulo de Carvalho",
    role: "Corretor verificado",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
    isOnline: false,
    verified: false,
    propertyId: "casa-t3-maianga",
    unreadCount: 0,
    lastActive: "Há 3 horas",
    category: "agent",
    messages: [
      {
        id: "m-401",
        sender: "agent",
        text: "Boa tarde! Consegui a confirmação do proprietário para visita na casa da Maianga na próxima terça-feira às 15h. Confirma o seu interesse?",
        timestamp: "Terça",
        status: "read",
      },
    ],
  },
];

const QUICK_QUESTIONS = [
  "O imóvel ainda se encontra disponível?",
  "Qual é a caução e adiantamento exigidos?",
  "Gostaria de agendar uma visita presencial.",
  "O condomínio inclui segurança 24h e gerador?",
  "Qual a documentação necessária para fechar negócio?",
];

const LOCAL_STORAGE_KEY = "ondjo-chat-conversations-v2";

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Falha ao ler conversas salvas:", e);
    }
    return DEFAULT_CONVERSATIONS;
  });

  const [activeChatId, setActiveChatId] = useState<string>(DEFAULT_CONVERSATIONS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "agent" | "owner" | "assistant" | "unread">("all");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [propertyDrawerOpen, setPropertyDrawerOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sincronizar com localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error("Falha ao salvar conversas:", e);
    }
  }, [conversations]);

  // Conversa ativa
  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || conversations[0];
  }, [conversations, activeChatId]);

  // Imóvel associado à conversa ativa
  const activeProperty = useMemo<Property | undefined>(() => {
    if (!activeChat || !activeChat.propertyId) return undefined;
    return properties.find((p) => p.id === activeChat.propertyId);
  }, [activeChat]);

  // Rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isTyping]);

  // Marcar como lido ao abrir conversa
  function selectConversation(id: string) {
    setActiveChatId(id);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  }

  // Filtragem de conversas
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch =
        conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      if (activeTab === "unread") return conv.unreadCount > 0;
      return conv.category === activeTab;
    });
  }, [conversations, searchQuery, activeTab]);

  // Enviar mensagem
  function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text || !activeChat) return;

    const userMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Intl.DateTimeFormat("pt-AO", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
      status: "sent",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? { ...c, messages: [...c.messages, userMessage], lastActive: "Agora" }
          : c
      )
    );
    setInputText("");

    // Simulação de resposta inteligente e realista
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      let replyText = "";
      if (activeChat.category === "assistant") {
        if (text.toLowerCase().includes("ipu") || text.toLowerCase().includes("imposto")) {
          replyText = "O IPU (Imposto Predial Urbano) é obrigatório e incide sobre o rendimento das rendas ou o valor patrimonial. Exija sempre o DAR (Documento de Arrecadação de Receitas) pago pelo senhorio.";
        } else if (text.toLowerCase().includes("visita") || text.toLowerCase().includes("agendar")) {
          replyText = "Para agendar visitas, pode falar diretamente com o corretor ou proprietário na conversa específica do imóvel. O ONDJO não cobra nenhuma taxa pelo agendamento!";
        } else if (text.toLowerCase().includes("talatona") || text.toLowerCase().includes("zona")) {
          replyText = "Talatona é uma das zonas nobres com maior procura em Luanda, com excelente oferta de condomínios fechados, segurança privada e geradores. As rendas médias para T2 variam entre 120.000 e 200.000 Kz/mês.";
        } else {
          replyText = "Excelente questão! A nossa equipa de apoio ONDJO e corretores associados estão à disposição para garantir que o seu processo imobiliário seja seguro, transparente e sem burocracias desnecessárias.";
        }
      } else {
        if (text.toLowerCase().includes("disponível") || text.toLowerCase().includes("disponivel")) {
          replyText = "Sim, confirmo que o imóvel ainda se encontra vago e pronto para ocupação! Quando teria disponibilidade para dar uma vista de olhos?";
        } else if (text.toLowerCase().includes("caução") || text.toLowerCase().includes("valor") || text.toLowerCase().includes("preço")) {
          replyText = "O valor é negociável consoante os meses adiantados. Com pagamento semestral ou anual conseguimos uma redução de até 10% no valor mensal.";
        } else if (text.toLowerCase().includes("visita") || text.toLowerCase().includes("sábado")) {
          replyText = "Combinado! Fica registado na minha agenda. Vou enviar-lhe a localização exata por WhatsApp ou via ONDJO 1 hora antes para facilitar o acesso pela portaria.";
        } else {
          replyText = "Recebido com sucesso! Estou a analisar os detalhes com o proprietário e dou-lhe retorno completo dentro de instantes.";
        }
      }

      const agentReply: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "agent",
        text: replyText,
        timestamp: new Intl.DateTimeFormat("pt-AO", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        status: "read",
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? { ...c, messages: [...c.messages, agentReply], lastActive: "Agora" }
            : c
        )
      );
    }, 1200);
  }

  // Confirmar proposta de visita
  function handleConfirmVisit(messageId: string) {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeChat.id) return c;
        const updated = c.messages.map((m) => {
          if (m.id === messageId && m.visitProposal) {
            return {
              ...m,
              visitProposal: { ...m.visitProposal, confirmed: true },
            };
          }
          return m;
        });
        return {
          ...c,
          messages: [
            ...updated,
            {
              id: `m-${Date.now()}`,
              sender: "user",
              text: "Confirmo a presença na visita agendada! Estarei no local no horário combinado.",
              timestamp: new Intl.DateTimeFormat("pt-AO", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date()),
              status: "sent",
            },
          ],
        };
      })
    );
  }

  function handleResetConversations() {
    if (window.confirm("Deseja restaurar as conversas e mensagens de demonstração padrão do ONDJO?")) {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      setConversations(DEFAULT_CONVERSATIONS);
      setActiveChatId(DEFAULT_CONVERSATIONS[0].id);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-ondjo-bg p-3 sm:p-6 lg:p-8">
      {/* Container Principal do Chat */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-ondjo-border bg-ondjo-surface shadow-xs">
        {/* Cabeçalho da Página / Breadcrumb & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ondjo-border/80 px-4 py-3.5 sm:px-6 bg-ondjo-surface">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-ondjo-blue-soft text-ondjo-blue">
              <MessageSquare size={19} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-bold text-ondjo-navy sm:text-lg">
                Centro de Mensagens ONDJO
              </h1>
              <p className="text-xs text-ondjo-muted">
                Comunicação segura e direta com corretores, proprietários e suporte em Angola.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetConversations}
              title="Repor conversas padrão"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-ondjo-border px-2.5 py-1.5 text-xs font-semibold text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink transition-colors"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Restaurar conversas</span>
            </button>

            {activeProperty && (
              <button
                type="button"
                onClick={() => setPropertyDrawerOpen(!propertyDrawerOpen)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-ondjo-border bg-ondjo-bg px-2.5 py-1.5 text-xs font-semibold text-ondjo-navy hover:bg-ondjo-blue-soft/50 hover:text-ondjo-blue transition-colors"
              >
                {propertyDrawerOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                <span className="hidden sm:inline">Ficha do imóvel</span>
              </button>
            )}
          </div>
        </div>

        {/* Layout Split: Sidebar de Conversas + Janela Ativa + Painel do Imóvel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] max-h-[750px]">
          {/* ========================================================= */}
          {/* COLUNA 1: Lista de Conversas (Master)                     */}
          {/* ========================================================= */}
          <aside
            aria-label="Lista de conversas"
            className={[
              "flex flex-col border-r border-ondjo-border/80 bg-ondjo-surface lg:col-span-4 xl:col-span-3.5",
              mobileView === "chat" ? "hidden lg:flex" : "flex",
            ].join(" ")}
          >
            {/* Campo de Pesquisa de Conversas */}
            <div className="p-3.5 border-b border-ondjo-border/60">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ondjo-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Procurar por nome, imóvel ou mensagem..."
                  className="focus-ring w-full rounded-xl border border-ondjo-border bg-ondjo-bg py-2 pl-9 pr-3 text-xs font-medium text-ondjo-ink placeholder:text-ondjo-muted"
                />
              </div>

              {/* Filtros rápidos / Categorias */}
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-subtle">
                {(
                  [
                    { id: "all", label: "Todas" },
                    { id: "agent", label: "Corretores" },
                    { id: "owner", label: "Proprietários" },
                    { id: "assistant", label: "Assistente" },
                    { id: "unread", label: "Não lidas" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "focus-ring whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      activeTab === tab.id
                        ? "bg-ondjo-blue text-white shadow-xs"
                        : "bg-ondjo-bg text-ondjo-muted hover:bg-ondjo-blue-soft/40 hover:text-ondjo-ink",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista com scroll das conversas */}
            <div className="flex-1 overflow-y-auto divide-y divide-ondjo-border/40 scrollbar-subtle">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare size={32} className="mx-auto text-ondjo-muted/60" />
                  <p className="mt-2 text-sm font-semibold text-ondjo-navy">
                    Nenhuma conversa encontrada
                  </p>
                  <p className="mt-1 text-xs text-ondjo-muted">
                    Tente outro termo de pesquisa ou limpe os filtros.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isCurrent = conv.id === activeChat.id;
                  const lastMessage = conv.messages[conv.messages.length - 1];
                  const linkedProp = conv.propertyId
                    ? properties.find((p) => p.id === conv.propertyId)
                    : undefined;

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => selectConversation(conv.id)}
                      className={[
                        "w-full text-left p-3.5 transition-colors focus-ring flex items-start gap-3 relative",
                        isCurrent
                          ? "bg-ondjo-blue-soft/40 border-l-4 border-l-ondjo-blue"
                          : "hover:bg-ondjo-bg/80 border-l-4 border-l-transparent",
                      ].join(" ")}
                    >
                      {/* Avatar com status de online */}
                      <div className="relative shrink-0">
                        {conv.category === "assistant" ? (
                          <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-ondjo-navy to-ondjo-blue text-white shadow-xs">
                            <Sparkles size={20} />
                          </div>
                        ) : conv.avatarUrl ? (
                          <img
                            src={conv.avatarUrl}
                            alt={conv.contactName}
                            className="size-11 rounded-xl object-cover ring-1 ring-ondjo-border/80"
                          />
                        ) : (
                          <div className="grid size-11 place-items-center rounded-xl bg-ondjo-blue-soft text-ondjo-blue font-bold text-sm">
                            {conv.contactName.charAt(0)}
                          </div>
                        )}

                        {conv.isOnline && (
                          <span
                            title="Online agora"
                            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-ondjo-green"
                          />
                        )}
                      </div>

                      {/* Conteúdo textual da conversa */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate text-xs font-bold text-ondjo-navy">
                              {conv.contactName}
                            </span>
                            {conv.verified && (
                              <span title="Identidade e credenciais verificadas pelo ONDJO"><ShieldCheck size={14} className="shrink-0 text-ondjo-green" /></span>
                            )}
                          </div>
                          <span className="shrink-0 text-[10px] font-medium text-ondjo-muted">
                            {lastMessage ? lastMessage.timestamp : conv.lastActive}
                          </span>
                        </div>

                        {/* Imóvel de referência se houver */}
                        {linkedProp && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-ondjo-blue truncate">
                            <Building2 size={11} className="shrink-0" />
                            <span className="truncate">{linkedProp.title}</span>
                          </div>
                        )}

                        {/* Última mensagem */}
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-ondjo-muted">
                            {lastMessage?.sender === "user" && (
                              <span className="text-ondjo-ink font-semibold">Você: </span>
                            )}
                            {lastMessage?.text || "Nenhuma mensagem ainda."}
                          </p>

                          {conv.unreadCount > 0 && (
                            <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-ondjo-blue px-1.5 text-[10px] font-bold text-white shadow-xs">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Dica de segurança no rodapé da lista */}
            <div className="border-t border-ondjo-border/60 p-3 bg-ondjo-bg/50">
              <div className="flex items-start gap-2 rounded-xl border border-ondjo-border/80 bg-ondjo-surface p-2.5 text-[11px] leading-relaxed text-ondjo-muted">
                <ShieldCheck size={16} className="shrink-0 text-ondjo-green mt-0.5" />
                <span>
                  <strong>Dica ONDJO:</strong> Mensagens dentro da plataforma protegem o seu histórico de negociação.
                </span>
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* COLUNA 2: Janela da Conversa Ativa (Detail)               */}
          {/* ========================================================= */}
          <main
            aria-label="Conversa ativa"
            className={[
              "flex flex-col bg-ondjo-surface overflow-hidden",
              propertyDrawerOpen
                ? "lg:col-span-5 xl:col-span-5.5"
                : "lg:col-span-8 xl:col-span-8.5",
              mobileView === "list" ? "hidden lg:flex" : "flex",
            ].join(" ")}
          >
            {/* Topbar da Conversa Ativa */}
            <div className="flex items-center justify-between gap-3 border-b border-ondjo-border/80 px-4 py-3 bg-ondjo-surface shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Botão de voltar no mobile */}
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="focus-ring grid size-9 shrink-0 place-items-center rounded-xl border border-ondjo-border text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink lg:hidden"
                  aria-label="Voltar para lista de conversas"
                >
                  <ArrowLeft size={18} />
                </button>

                {/* Avatar */}
                <div className="relative shrink-0">
                  {activeChat.category === "assistant" ? (
                    <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-ondjo-navy to-ondjo-blue text-white shadow-xs">
                      <Bot size={20} />
                    </div>
                  ) : activeChat.avatarUrl ? (
                    <img
                      src={activeChat.avatarUrl}
                      alt={activeChat.contactName}
                      className="size-10 rounded-xl object-cover ring-1 ring-ondjo-border"
                    />
                  ) : (
                    <div className="grid size-10 place-items-center rounded-xl bg-ondjo-blue-soft text-ondjo-blue font-bold">
                      {activeChat.contactName.charAt(0)}
                    </div>
                  )}

                  {activeChat.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-ondjo-green" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-sm font-bold text-ondjo-navy">
                      {activeChat.contactName}
                    </h2>
                    {activeChat.verified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-ondjo-success-border bg-ondjo-green-soft px-1.5 py-0.2 text-[10px] font-bold text-ondjo-green">
                        <ShieldCheck size={11} />
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-2 text-[11px] text-ondjo-muted">
                    <span>{activeChat.role}</span>
                    <span className="text-ondjo-border">•</span>
                    <span className={activeChat.isOnline ? "text-ondjo-green font-medium" : ""}>
                      {activeChat.isOnline ? "Online agora" : activeChat.lastActive}
                    </span>
                  </p>
                </div>
              </div>

              {/* Ações rápidas no cabeçalho */}
              <div className="flex items-center gap-1.5 shrink-0">
                {activeProperty && (
                  <a
                    href={`#/imovel/${activeProperty.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-ondjo-border px-2.5 py-1.5 text-xs font-semibold text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                  >
                    <span>Ver anúncio</span>
                    <ExternalLink size={13} className="text-ondjo-muted" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setPropertyDrawerOpen(!propertyDrawerOpen)}
                  className="focus-ring grid size-9 place-items-center rounded-xl border border-ondjo-border text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink"
                  title="Ver detalhes do imóvel associado"
                  aria-label="Ver detalhes do imóvel associado"
                >
                  <Info size={17} />
                </button>
              </div>
            </div>

            {/* Faixa / Card de Contexto do Imóvel no topo da conversa */}
            {activeProperty && (
              <div className="flex items-center justify-between gap-3 border-b border-ondjo-border/60 bg-ondjo-bg/70 px-4 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={activeProperty.images[0]}
                    alt={activeProperty.title}
                    className="size-10 rounded-lg object-cover ring-1 ring-ondjo-border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ondjo-navy">
                      {activeProperty.title}
                    </p>
                    <p className="text-[11px] font-semibold text-ondjo-ink">
                      {new Intl.NumberFormat("pt-AO").format(activeProperty.price)} Kz
                      <span className="font-normal text-ondjo-muted"> / mês • {activeProperty.neighborhood}, {activeProperty.city}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={`#/imovel/${activeProperty.id}`}
                  className="focus-ring shrink-0 inline-flex items-center gap-1 text-xs font-bold text-ondjo-blue hover:text-ondjo-blue-dark"
                >
                  <span>Detalhes</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Histórico de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-ondjo-bg/30 to-ondjo-surface scrollbar-subtle">
              {/* Separador de Data */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ondjo-border/80" />
                </div>
                <span className="relative rounded-full border border-ondjo-border bg-ondjo-surface px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ondjo-muted shadow-xs">
                  Histórico oficial ONDJO
                </span>
              </div>

              {/* Mensagens */}
              {activeChat.messages.map((message) => {
                const isUser = message.sender === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={[
                        "max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-xs text-xs sm:text-sm leading-relaxed",
                        isUser
                          ? "bg-ondjo-blue text-white rounded-br-xs"
                          : "bg-ondjo-surface border border-ondjo-border text-ondjo-ink rounded-bl-xs",
                      ].join(" ")}
                    >
                      {/* Texto da mensagem */}
                      <p className="whitespace-pre-line">{message.text}</p>

                      {/* Card interativo de Proposta de Visita */}
                      {message.visitProposal && (
                        <div className="mt-3 rounded-xl border border-ondjo-blue/20 bg-ondjo-blue-soft/50 p-3 text-ondjo-navy">
                          <div className="flex items-center gap-2 text-xs font-bold text-ondjo-blue">
                            <CalendarDays size={16} />
                            <span>Proposta de Visita ao Imóvel</span>
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-ondjo-ink">
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-ondjo-muted shrink-0" />
                              <span>{message.visitProposal.date} às {message.visitProposal.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-ondjo-muted shrink-0" />
                              <span className="truncate">{message.visitProposal.location}</span>
                            </div>
                          </div>

                          {/* Ações da Proposta */}
                          <div className="mt-3 pt-2.5 border-t border-ondjo-border/60 flex items-center gap-2">
                            {message.visitProposal.confirmed ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-ondjo-green">
                                <CalendarCheck size={15} />
                                <span>Visita Confirmada na sua Agenda!</span>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmVisit(message.id)}
                                  className="focus-ring inline-flex items-center gap-1 rounded-lg bg-ondjo-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-ondjo-blue-dark transition-colors"
                                >
                                  <Check size={14} />
                                  Confirmar visita
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendMessage("Gostaria de propor um horário alternativo para a visita. Seria possível no período da tarde?")}
                                  className="focus-ring inline-flex items-center gap-1 rounded-lg border border-ondjo-border bg-ondjo-surface px-2.5 py-1.5 text-xs font-semibold text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                                >
                                  Outro horário
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Metadados e carimbo de hora */}
                      <div
                        className={[
                          "mt-1.5 flex items-center justify-end gap-1 text-[10px]",
                          isUser ? "text-white/80" : "text-ondjo-muted",
                        ].join(" ")}
                      >
                        <span>{message.timestamp}</span>
                        {isUser && (
                          <span title="Mensagem entregue e visualizada">
                            <CheckCheck size={13} className="text-white" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Animação de digitação em tempo real */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-center gap-2 rounded-2xl border border-ondjo-border bg-ondjo-surface px-4 py-2.5 shadow-xs w-fit"
                  >
                    <span className="text-xs font-semibold text-ondjo-muted">
                      {activeChat.contactName} está a escrever
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-ondjo-blue" style={{ animationDelay: "0ms" }} />
                      <span className="size-1.5 animate-bounce rounded-full bg-ondjo-blue" style={{ animationDelay: "150ms" }} />
                      <span className="size-1.5 animate-bounce rounded-full bg-ondjo-blue" style={{ animationDelay: "300ms" }} />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Chips de Sugestões de Perguntas Rápidas */}
            <div className="border-t border-ondjo-border/60 bg-ondjo-bg/40 px-4 py-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-subtle">
                <span className="shrink-0 text-[11px] font-bold text-ondjo-muted flex items-center gap-1 mr-1">
                  <Sparkles size={12} className="text-ondjo-blue" />
                  Perguntas rápidas:
                </span>
                {QUICK_QUESTIONS.map((question, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(question)}
                    className="focus-ring shrink-0 rounded-full border border-ondjo-border bg-ondjo-surface px-3 py-1 text-xs font-medium text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue hover:bg-ondjo-blue-soft/30 transition-colors shadow-2xs"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Área de Composição e Envio de Mensagem */}
            <div className="border-t border-ondjo-border/80 p-3 sm:p-4 bg-ondjo-surface">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Escreva uma mensagem para ${activeChat.contactName}...`}
                    className="focus-ring w-full rounded-xl border border-ondjo-border bg-ondjo-bg px-4 py-2.5 text-xs sm:text-sm text-ondjo-ink placeholder:text-ondjo-muted"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-ondjo-blue-dark active:bg-ondjo-navy disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Enviar mensagem"
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </div>
          </main>

          {/* ========================================================= */}
          {/* COLUNA 3: Ficha Rápida do Imóvel Associado (Lateral)      */}
          {/* ========================================================= */}
          {activeProperty && propertyDrawerOpen && (
            <aside
              aria-label="Ficha do imóvel em negociação"
              className="border-l border-ondjo-border/80 bg-ondjo-bg/40 p-4 lg:col-span-3 xl:col-span-3.5 overflow-y-auto scrollbar-subtle"
            >
              <div className="rounded-2xl border border-ondjo-border bg-ondjo-surface p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-ondjo-border/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ondjo-navy">
                    Imóvel em negociação
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPropertyDrawerOpen(false)}
                    className="focus-ring text-ondjo-muted hover:text-ondjo-ink p-1"
                    aria-label="Fechar painel do imóvel"
                  >
                    ×
                  </button>
                </div>

                {/* Foto principal */}
                <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-ondjo-border">
                  <img
                    src={activeProperty.images[0]}
                    alt={activeProperty.title}
                    className="aspect-4/3 w-full object-cover"
                  />
                </div>

                {/* Preço e Localização */}
                <div className="mt-3">
                  <p className="text-lg font-black text-ondjo-navy">
                    {new Intl.NumberFormat("pt-AO").format(activeProperty.price)} Kz
                    <span className="text-xs font-normal text-ondjo-muted"> / mês</span>
                  </p>
                  <h4 className="mt-1 text-sm font-bold text-ondjo-ink line-clamp-2">
                    {activeProperty.title}
                  </h4>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ondjo-muted">
                    <MapPin size={13} className="shrink-0 text-ondjo-blue" />
                    <span>{activeProperty.neighborhood}, {activeProperty.city}</span>
                  </p>
                </div>

                {/* Especificações rápidas */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-ondjo-bg p-3 text-xs">
                  <div>
                    <span className="text-ondjo-muted block text-[10px] uppercase font-bold">Tipo</span>
                    <span className="font-bold text-ondjo-navy">{activeProperty.type}</span>
                  </div>
                  <div>
                    <span className="text-ondjo-muted block text-[10px] uppercase font-bold">Área</span>
                    <span className="font-bold text-ondjo-navy">{activeProperty.area} m²</span>
                  </div>
                  <div>
                    <span className="text-ondjo-muted block text-[10px] uppercase font-bold">Quartos</span>
                    <span className="font-bold text-ondjo-navy">{activeProperty.bedrooms} Quartos</span>
                  </div>
                  <div>
                    <span className="text-ondjo-muted block text-[10px] uppercase font-bold">Estacionamento</span>
                    <span className="font-bold text-ondjo-navy">{activeProperty.parking} Vaga(s)</span>
                  </div>
                </div>

                {/* Comodidades destacadas */}
                <div className="mt-4">
                  <p className="text-xs font-bold text-ondjo-navy mb-2">
                    Comodidades do condomínio
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProperty.features.map((feat) => (
                      <span
                        key={feat}
                        className="rounded-md border border-ondjo-border/80 bg-ondjo-bg px-2 py-0.5 text-[11px] font-semibold text-ondjo-ink"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Botão de Ver Anúncio Completo */}
                <div className="mt-5 pt-3 border-t border-ondjo-border/60">
                  <a
                    href={`#/imovel/${activeProperty.id}`}
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-3 py-2.5 text-xs font-bold text-white hover:bg-ondjo-blue-dark transition-colors shadow-xs"
                  >
                    <span>Ver anúncio completo</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
export default ChatPage;
