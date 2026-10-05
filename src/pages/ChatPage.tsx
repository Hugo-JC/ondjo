import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
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
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { properties } from "../data/properties";
import type { Property } from "../types";

export type MessageStatus = "pending" | "sent" | "delivered" | "read";
export type PresenceState = "online" | "away" | "offline";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "system";
  text: string;
  timestamp: string;
  status?: MessageStatus;
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
  presence: PresenceState;
  isTyping?: boolean;
  verified: boolean;
  propertyId?: string;
  unreadCount: number;
  lastActive: string;
  category: "agent" | "owner" | "assistant";
  messages: ChatMessage[];
}

export interface InAppNotification {
  id: string;
  conversationId: string;
  senderName: string;
  text: string;
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    contactName: "Mauro dos Santos",
    role: "Corretor verificado",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    presence: "online",
    verified: true,
    propertyId: "apartamento-t2-talatona",
    unreadCount: 1,
    lastActive: "Agora",
    category: "agent",
    messages: [
      {
        id: "m-101",
        sender: "agent",
        text: "Olá! Vi o seu interesse no Apartamento T2 em Talatona. O imóvel está disponível para arrendamento imediato com contrato anual registado.",
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
        status: "delivered",
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
    presence: "online",
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
    presence: "away",
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
    presence: "offline",
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
  "O edifício tem gerador autónomo e água da rede?",
  "Qual a documentação necessária para fechar negócio?",
];

const LOCAL_STORAGE_KEY = "ondjo-chat-conversations-v3";
const SOUND_STORAGE_KEY = "ondjo-chat-sound-enabled";

function formatTimestamp(): string {
  return new Intl.DateTimeFormat("pt-AO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

// Síntese sutil de som de notificação (sem depender de assets externos)
function playNotificationChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Acorde duplo suave tipo mensagem
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (e) {
    // Silencioso se navegador bloquear autoplay de áudio
  }
}

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CONVERSATIONS;

    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return DEFAULT_CONVERSATIONS;

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CONVERSATIONS;
    } catch (e) {
      console.error("Falha ao ler conversas salvas:", e);
      return DEFAULT_CONVERSATIONS;
    }
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => DEFAULT_CONVERSATIONS[0]?.id ?? "");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "agent" | "owner" | "assistant" | "unread">("all");
  const [inputText, setInputText] = useState("");
  const [propertyDrawerOpen, setPropertyDrawerOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [notification, setNotification] = useState<InAppNotification | null>(null);

  // Som de novas mensagens
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;

    try {
      const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  // Estado da permissão nativa do navegador
  const isNotificationSupported = typeof window !== "undefined" && "Notification" in window;
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeChatIdRef = useRef<string>(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Guardar preferências de som
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(soundEnabled));
    } catch {
      // Ignorar
    }
  }, [soundEnabled]);

  // Sincronizar conversas com localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error("Falha ao guardar conversas:", e);
    }
  }, [conversations]);

  // Conversa ativa selecionada
  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || conversations[0];
  }, [conversations, activeChatId]);

  // Imóvel associado à conversa ativa
  const activeProperty = useMemo<Property | undefined>(() => {
    if (!activeChat || !activeChat.propertyId) return undefined;
    return properties.find((p) => p.id === activeChat.propertyId);
  }, [activeChat]);

  // Total de mensagens não lidas globais
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  // Total de não lidas fora da conversa ativa (para badge no botão de voltar mobile)
  const otherUnreadCount = useMemo(() => {
    return conversations
      .filter((c) => c.id !== activeChatId)
      .reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations, activeChatId]);

  // Rolar para a última mensagem com suavidade
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, activeChat?.isTyping]);

  // Selecionar conversa e marcar como lida
  const selectConversation = useCallback((id: string) => {
    setActiveChatId(id);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updatedMsgs = c.messages.map((m) =>
          m.sender !== "user" ? { ...m, status: "read" as MessageStatus } : m
        );
        return { ...c, unreadCount: 0, messages: updatedMsgs };
      })
    );
  }, []);

  // Disparo de notificação nativa no navegador com clique direto para a conversa
  const triggerBrowserNotification = useCallback(
    (convId: string, senderName: string, text: string) => {
      // Som suave se ativado
      if (soundEnabled) {
        playNotificationChime();
      }

      if (!isNotificationSupported || Notification.permission !== "granted") {
        return;
      }

      // Disparar se a janela estiver minimizada/em segundo plano ou se for outra conversa
      const shouldNotify =
        (typeof document !== "undefined" && document.hidden) || activeChatIdRef.current !== convId;
      if (!shouldNotify) return;

      try {
        const notif = new Notification(`ONDJO: Mensagem de ${senderName}`, {
          body: text,
          icon: "/favicon.ico",
          tag: `ondjo-conv-${convId}`, // evita acumular duplicadas da mesma conversa
        });

        notif.onclick = () => {
          window.focus();
          selectConversation(convId);
          notif.close();
        };
      } catch (err) {
        console.warn("Falha ao criar notificação do navegador:", err);
      }
    },
    [isNotificationSupported, selectConversation, soundEnabled]
  );

  // Solicitar permissão de notificações do navegador
  async function requestNotificationPermission() {
    if (!isNotificationSupported) {
      alert("O seu navegador não possui suporte para notificações de área de trabalho.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        const welcome = new Notification("Notificações ONDJO Ativadas!", {
          body: "Receberá alertas em tempo real sempre que corretores responderem ou enviarem propostas.",
          icon: "/favicon.ico",
        });
        welcome.onclick = () => {
          window.focus();
          welcome.close();
        };
      } else if (permission === "denied") {
        alert(
          "As notificações estão bloqueadas no seu navegador. Para ativá-las, clique no ícone de cadeado/definições ao lado da barra de endereço e autorize as notificações para o ONDJO."
        );
      }
    } catch (err) {
      console.error("Erro ao solicitar permissão de notificações:", err);
    }
  }

  // Filtragem e pesquisa de conversas
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        conv.contactName.toLowerCase().includes(q) ||
        conv.role.toLowerCase().includes(q) ||
        conv.messages.some((m) => m.text.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      if (activeTab === "unread") return conv.unreadCount > 0;
      return conv.category === activeTab;
    });
  }, [conversations, searchQuery, activeTab]);

  // Enviar mensagem pelo usuário com simulação de leitura em tempo real
  function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text || !activeChat) return;

    const messageId = `m-${Date.now()}`;
    const currentTime = formatTimestamp();
    const currentConvId = activeChat.id;
    const currentSenderName = activeChat.contactName;

    // 1. Mensagem começa com estado "pending"
    const userMessage: ChatMessage = {
      id: messageId,
      sender: "user",
      text,
      timestamp: currentTime,
      status: "pending",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConvId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              lastActive: "Agora",
              presence: "online",
            }
          : c
      )
    );
    setInputText("");

    // 2. Transição para "sent" (enviado ao servidor após 400ms)
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, status: "sent" } : m
            ),
          };
        })
      );
    }, 450);

    // 3. Transição para "delivered" (entregue no telemóvel do corretor após 1.1s)
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, status: "delivered" } : m
            ),
          };
        })
      );
    }, 1100);

    // 4. Corretor abre a mensagem (passa a "read" após 2.2s) e inicia digitação ("isTyping")
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c;
          return {
            ...c,
            presence: "online",
            isTyping: true,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, status: "read" } : m
            ),
          };
        })
      );
    }, 2200);

    // 5. Corretor conclui a resposta inteligente e envia após 4.2s
    setTimeout(() => {
      let replyText = "";
      if (activeChat.category === "assistant") {
        if (text.toLowerCase().includes("ipu") || text.toLowerCase().includes("imposto")) {
          replyText =
            "O IPU (Imposto Predial Urbano) é anual e incide sobre o rendimento das rendas (habitualmente taxa efetiva entre 10% a 15%) ou sobre o valor patrimonial. Exija sempre o DAR liquidado pelo senhorio na AGT.";
        } else if (text.toLowerCase().includes("visita") || text.toLowerCase().includes("agendar")) {
          replyText =
            "Pode solicitar visitas diretamente nesta janela a qualquer corretor verificado do ONDJO. Não há cobrança de taxas de agendamento na nossa plataforma.";
        } else if (text.toLowerCase().includes("talatona") || text.toLowerCase().includes("zona")) {
          replyText =
            "Talatona e Benfica concentram grande procura residencial em Luanda, com forte segurança e autonomia de água e luz. Para T2, os valores situam-se em média entre 120.000 e 220.000 Kz/mês.";
        } else {
          replyText =
            "Informação registada! O assistente ONDJO recomenda sempre formalizar contratos por escrito e verificar a Certidão do Registo Predial antes de adiantar qualquer montante de caução.";
        }
      } else {
        if (text.toLowerCase().includes("disponível") || text.toLowerCase().includes("disponivel")) {
          replyText =
            "Olá! Sim, confirmo que o imóvel continua totalmente disponível e vago para ocupação imediata. Tem disponibilidade para uma visita presencial nos próximos dias?";
        } else if (
          text.toLowerCase().includes("caução") ||
          text.toLowerCase().includes("valor") ||
          text.toLowerCase().includes("preço") ||
          text.toLowerCase().includes("renda")
        ) {
          replyText =
            "A caução base corresponde a 2 meses de renda com adiantamento semestral ou anual. Com adiantamento anual podemos negociar um desconto de até 10% com o senhorio.";
        } else if (
          text.toLowerCase().includes("gerador") ||
          text.toLowerCase().includes("água") ||
          text.toLowerCase().includes("agua") ||
          text.toLowerCase().includes("luz")
        ) {
          replyText =
            "O imóvel tem total autonomia: gerador automático para as áreas privativas e tanque de água subterrâneo de alta capacidade com bomba automática.";
        } else if (text.toLowerCase().includes("visita") || text.toLowerCase().includes("sábado") || text.toLowerCase().includes("agenda")) {
          replyText =
            "Excelente! Fica pré-agendado. Envio-lhe a localização em tempo real e a confirmação para a portaria 1 hora antes da visita.";
        } else {
          replyText =
            "Mensagem recebida com sucesso! Estou a verificar os apontamentos com os proprietários e dou-lhe retorno completo dentro de breves minutos.";
        }
      }

      const agentReply: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "agent",
        text: replyText,
        timestamp: formatTimestamp(),
        status: "delivered",
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConvId
            ? {
                ...c,
                isTyping: false,
                presence: "online",
                lastActive: "Agora",
                messages: [...c.messages, agentReply],
              }
            : c
        )
      );

      // Disparar Notificação Nativa do Navegador se a página estiver em segundo plano
      triggerBrowserNotification(currentConvId, currentSenderName, replyText);
    }, 4400);
  }

  // Simular recebimento de mensagem em tempo real de outro corretor (demonstração interativa)
  function handleTriggerIncomingSimulation() {
    const candidateConvs = conversations.filter((c) => c.id !== activeChatId);
    const target = candidateConvs[Math.floor(Math.random() * candidateConvs.length)] || conversations[0];

    const sampleIncomingMessages = [
      "Boa tarde! Temos uma atualização sobre o imóvel que consultou. O proprietário aceita adiantamento de 3 meses.",
      "Olá! Acabou de entrar um novo apartamento T2 com gerador e piscina na mesma zona por um valor muito atrativo.",
      "Confirmamos a documentação predial aprovada para visita amanhã à tarde. Gostaria de confirmar presença?",
      "Olá! Um senhorio acabou de baixar a renda mensal em 15.000 Kz. Tem interesse em ver os detalhes?",
    ];
    const chosenText = sampleIncomingMessages[Math.floor(Math.random() * sampleIncomingMessages.length)];

    const newMsg: ChatMessage = {
      id: `m-sim-${Date.now()}`,
      sender: "agent",
      text: chosenText,
      timestamp: formatTimestamp(),
      status: "delivered",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== target.id) return c;
        return {
          ...c,
          unreadCount: c.id === activeChatId ? 0 : (c.unreadCount || 0) + 1,
          lastActive: "Agora",
          presence: "online",
          messages: [...c.messages, newMsg],
        };
      })
    );

    // Disparar Notificação Nativa no Navegador
    triggerBrowserNotification(target.id, target.contactName, chosenText);

    // Notificação in-app se for outra conversa
    if (target.id !== activeChatId) {
      setNotification({
        id: `notif-${Date.now()}`,
        conversationId: target.id,
        senderName: target.contactName,
        text: chosenText,
      });

      // Auto-fechar toast após 5s
      setTimeout(() => {
        setNotification((curr) => (curr?.conversationId === target.id ? null : curr));
      }, 5000);
    }
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
              text: "Visita presencial confirmada! Estarei no imóvel no horário e dia indicados.",
              timestamp: formatTimestamp(),
              status: "sent",
            },
          ],
        };
      })
    );
  }

  // Restaurar dados originais de simulação
  function handleResetConversations() {
    const canReset = typeof window !== "undefined" && window.confirm("Deseja restaurar as conversas e mensagens de demonstração padrão do ONDJO?");
    if (!canReset) return;

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    setConversations(DEFAULT_CONVERSATIONS);
    setActiveChatId(DEFAULT_CONVERSATIONS[0]?.id ?? "");
    setMobileView("list");
    setNotification(null);
  }

  // Renderizar ícone de status de leitura da mensagem
  function renderMessageStatusIcon(status?: MessageStatus) {
    if (!status) return null;
    switch (status) {
      case "pending":
        return (
          <span title="A enviar...">
            <Clock size={12} className="opacity-70 animate-pulse" />
          </span>
        );
      case "sent":
        return (
          <span title="Enviada ao servidor">
            <Check size={13} className="text-white/80" />
          </span>
        );
      case "delivered":
        return (
          <span title="Entregue no destinatário">
            <CheckCheck size={13} className="text-white/80" />
          </span>
        );
      case "read":
        return (
          <span title="Lida pelo destinatário">
            <CheckCheck size={13} className="text-ondjo-blue-soft" />
          </span>
        );
    }
  }

  // Renderizar indicador de presença no avatar ou badge
  function renderPresenceBadge(presence: PresenceState) {
    switch (presence) {
      case "online":
        return (
          <span
            title="Online agora"
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-ondjo-green"
          >
            <span className="absolute inset-0 size-full animate-ping rounded-full bg-ondjo-green opacity-40" />
          </span>
        );
      case "away":
        return (
          <span
            title="Ausente temporariamente"
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-amber-400"
          />
        );
      case "offline":
      default:
        return (
          <span
            title="Offline"
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-ondjo-muted/50"
          />
        );
    }
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-ondjo-bg p-2 sm:p-5 lg:p-7">
      {/* Banner de Ativação de Notificações do Navegador */}
      {isNotificationSupported && notificationPermission === "default" && (
        <div className="mx-auto mb-3 max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ondjo-blue/20 bg-ondjo-blue-soft/50 px-4 py-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-ondjo-blue text-white">
                <Bell size={16} />
              </div>
              <div>
                <p className="font-bold text-ondjo-navy">
                  Ativar notificações no navegador
                </p>
                <p className="text-ondjo-muted">
                  Receba alertas em tempo real quando os corretores responderem ou propuserem visitas, mesmo noutra aba.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="focus-ring rounded-xl bg-ondjo-blue px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-ondjo-blue-dark transition-colors"
              >
                Permitir notificações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificação In-App de Nova Mensagem em Tempo Real */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] rounded-2xl border border-ondjo-blue/30 bg-ondjo-surface p-3.5 shadow-lg ring-1 ring-ondjo-navy/5"
          >
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-ondjo-blue text-white shadow-xs">
                <BellRing size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-ondjo-navy truncate">
                    {notification.senderName}
                  </p>
                  <span className="text-[10px] font-semibold text-ondjo-blue uppercase">Agora</span>
                </div>
                <p className="mt-0.5 text-xs text-ondjo-ink line-clamp-2">
                  {notification.text}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      selectConversation(notification.conversationId);
                      setNotification(null);
                    }}
                    className="focus-ring rounded-lg bg-ondjo-blue px-2.5 py-1 text-xs font-bold text-white hover:bg-ondjo-blue-dark transition-colors"
                  >
                    Abrir conversa
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotification(null)}
                    className="focus-ring text-xs text-ondjo-muted hover:text-ondjo-ink px-1.5 py-1"
                  >
                    Ignorar
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-ondjo-muted hover:text-ondjo-ink p-1"
                aria-label="Fechar notificação"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caixa Central da Aplicação de Chat */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-ondjo-border bg-ondjo-surface shadow-xs">
        {/* Barra Superior / Breadcrumb & Controlos de Simulação e Notificações */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ondjo-border/80 px-4 py-3 sm:px-6 bg-ondjo-surface">
          <div className="flex items-center gap-3">
            <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-ondjo-blue-soft text-ondjo-blue">
              <MessageSquare size={20} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-ondjo-navy sm:text-base">
                  Conversas e Corretores
                </h1>
                {totalUnreadCount > 0 && (
                  <span className="rounded-full bg-ondjo-blue px-2 py-0.5 text-[11px] font-bold text-white">
                    {totalUnreadCount} nova{totalUnreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-xs text-ondjo-muted hidden sm:block">
                Simulação em tempo real de mensagens com corretores, proprietários e suporte em Luanda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Controlo de Notificações do Navegador */}
            {isNotificationSupported && (
              <button
                type="button"
                onClick={requestNotificationPermission}
                title={
                  notificationPermission === "granted"
                    ? "Notificações do navegador ativas (clique para testar)"
                    : notificationPermission === "denied"
                    ? "Notificações bloqueadas no navegador (clique para ver instruções)"
                    : "Ativar notificações no navegador"
                }
                className={[
                  "focus-ring inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  notificationPermission === "granted"
                    ? "border-ondjo-success-border bg-ondjo-green-soft text-ondjo-green"
                    : notificationPermission === "denied"
                    ? "border-ondjo-danger-border bg-ondjo-danger-soft text-ondjo-danger"
                    : "border-ondjo-border bg-ondjo-bg text-ondjo-muted hover:border-ondjo-blue hover:text-ondjo-blue",
                ].join(" ")}
              >
                {notificationPermission === "granted" ? (
                  <>
                    <BellRing size={13} className="shrink-0 text-ondjo-green" />
                    <span className="hidden sm:inline">Alertas ativos</span>
                  </>
                ) : notificationPermission === "denied" ? (
                  <>
                    <BellOff size={13} className="shrink-0 text-ondjo-danger" />
                    <span className="hidden sm:inline">Bloqueadas</span>
                  </>
                ) : (
                  <>
                    <Bell size={13} className="shrink-0 text-ondjo-muted" />
                    <span className="hidden sm:inline">Ativar alertas</span>
                  </>
                )}
              </button>
            )}

            {/* Alternar som de alerta */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Desativar avisos sonoros" : "Ativar avisos sonoros"}
              className="focus-ring inline-flex items-center gap-1 rounded-xl border border-ondjo-border px-2.5 py-1.5 text-xs font-semibold text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink transition-colors"
            >
              {soundEnabled ? <Volume2 size={13} className="text-ondjo-blue" /> : <VolumeX size={13} />}
              <span className="hidden md:inline">{soundEnabled ? "Som ativo" : "Sem som"}</span>
            </button>

            {/* Botão de teste: simular nova mensagem recebida */}
            <button
              type="button"
              onClick={handleTriggerIncomingSimulation}
              title="Testar atualização em tempo real recebendo mensagem de um corretor"
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-ondjo-blue/30 bg-ondjo-blue-soft/40 px-2.5 py-1.5 text-xs font-semibold text-ondjo-blue hover:bg-ondjo-blue hover:text-white transition-colors"
            >
              <Zap size={13} className="shrink-0" />
              <span className="hidden sm:inline">Simular mensagem</span>
              <span className="sm:hidden">Simular</span>
            </button>

            {/* Botão de repor conversas */}
            <button
              type="button"
              onClick={handleResetConversations}
              title="Restaurar conversas de demonstração"
              className="focus-ring inline-flex items-center gap-1 rounded-xl border border-ondjo-border px-2.5 py-1.5 text-xs font-semibold text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink transition-colors"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span className="hidden md:inline">Restaurar</span>
            </button>

            {/* Alternar Ficha do Imóvel no Desktop */}
            {activeProperty && (
              <button
                type="button"
                onClick={() => setPropertyDrawerOpen(!propertyDrawerOpen)}
                className="focus-ring hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-ondjo-border bg-ondjo-bg px-2.5 py-1.5 text-xs font-semibold text-ondjo-navy hover:bg-ondjo-blue-soft/50 hover:text-ondjo-blue transition-colors"
              >
                {propertyDrawerOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                <span>Ficha do imóvel</span>
              </button>
            )}
          </div>
        </header>

        {/* Layout Split: Navegação Adaptável Desktop e Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-160 max-h-195">
          {/* ========================================================= */}
          {/* COLUNA 1: Lista de Chats (Master)                         */}
          {/* ========================================================= */}
          <aside
            aria-label="Lista de conversas"
            className={[
              "flex flex-col border-r border-ondjo-border/80 bg-ondjo-surface lg:col-span-4 xl:col-span-3.5",
              mobileView === "chat" ? "hidden lg:flex" : "flex",
            ].join(" ")}
          >
            {/* Barra de Pesquisa */}
            <div className="p-3 border-b border-ondjo-border/60">
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ondjo-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar corretor, imóvel..."
                  className="focus-ring w-full rounded-xl border border-ondjo-border bg-ondjo-bg py-2 pl-9 pr-3 text-xs font-medium text-ondjo-ink placeholder:text-ondjo-muted"
                />
              </div>

              {/* Filtros em Abas de Categoria */}
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
                    Experimente limpar o filtro ou a barra de pesquisa.
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
                          : "hover:bg-ondjo-bg/70 border-l-4 border-l-transparent",
                      ].join(" ")}
                    >
                      {/* Avatar e Indicador de Presença */}
                      <div className="relative shrink-0">
                        {conv.category === "assistant" ? (
                          <div className="grid size-11 place-items-center rounded-xl bg-linear-to-br from-ondjo-navy to-ondjo-blue text-white shadow-xs">
                            <Sparkles size={19} />
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

                        {renderPresenceBadge(conv.presence)}
                      </div>

                      {/* Informações da conversa */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate text-xs font-bold text-ondjo-navy">
                              {conv.contactName}
                            </span>
                            {conv.verified && (
                              <span title="Corretor verificado com licença ONDJO">
                                <ShieldCheck size={14} className="shrink-0 text-ondjo-green" />
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 text-[10px] font-medium text-ondjo-muted">
                            {lastMessage ? lastMessage.timestamp : conv.lastActive}
                          </span>
                        </div>

                        {/* Imóvel de referência */}
                        {linkedProp && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-ondjo-blue truncate">
                            <Building2 size={11} className="shrink-0" />
                            <span className="truncate">{linkedProp.title}</span>
                          </div>
                        )}

                        {/* Última Mensagem com indicador de leitura */}
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 min-w-0 truncate text-xs text-ondjo-muted">
                            {conv.isTyping ? (
                              <span className="text-ondjo-blue font-semibold animate-pulse">
                                A escrever...
                              </span>
                            ) : (
                              <>
                                {lastMessage?.sender === "user" && (
                                  <span className="shrink-0 text-ondjo-muted">
                                    {lastMessage.status === "read" ? (
                                      <CheckCheck size={13} className="text-ondjo-blue inline" />
                                    ) : lastMessage.status === "delivered" ? (
                                      <CheckCheck size={13} className="text-ondjo-muted inline" />
                                    ) : lastMessage.status === "sent" ? (
                                      <Check size={13} className="text-ondjo-muted inline" />
                                    ) : (
                                      <Clock size={11} className="text-ondjo-muted inline" />
                                    )}
                                  </span>
                                )}
                                <span className="truncate">
                                  {lastMessage?.text || "Sem mensagens anteriores."}
                                </span>
                              </>
                            )}
                          </div>

                          {conv.unreadCount > 0 && (
                            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ondjo-blue px-1.5 text-[10px] font-bold text-white shadow-xs">
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

            {/* Rodapé da lista com dica ONDJO */}
            <div className="border-t border-ondjo-border/60 p-3 bg-ondjo-bg/40">
              <div className="flex items-center gap-2 rounded-xl border border-ondjo-border/80 bg-ondjo-surface p-2.5 text-[11px] text-ondjo-muted">
                <ShieldCheck size={15} className="shrink-0 text-ondjo-green" />
                <span>
                  <strong>Garantia ONDJO:</strong> Histórico e propostas protegidos na plataforma.
                </span>
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* COLUNA 2: Diálogo Ativo (Detail)                          */}
          {/* ========================================================= */}
          <main
            aria-label="Diálogo ativo"
            className={[
              "flex flex-col bg-ondjo-surface overflow-hidden",
              propertyDrawerOpen
                ? "lg:col-span-5 xl:col-span-5.5"
                : "lg:col-span-8 xl:col-span-8.5",
              mobileView === "list" ? "hidden lg:flex" : "flex",
            ].join(" ")}
          >
            {/* Topbar da Janela Ativa */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 border-b border-ondjo-border/80 px-3.5 py-2.5 sm:px-5 sm:py-3 bg-ondjo-surface shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Botão de Voltar Mobile: com badge de outras não lidas se houver */}
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="focus-ring flex items-center gap-1.5 rounded-xl border border-ondjo-border bg-ondjo-bg px-2.5 py-1.5 text-xs font-bold text-ondjo-navy hover:bg-ondjo-blue-soft/40 lg:hidden"
                  aria-label="Voltar para a lista de conversas"
                >
                  <ArrowLeft size={16} />
                  <span>Chats</span>
                  {otherUnreadCount > 0 && (
                    <span className="grid size-4 place-items-center rounded-full bg-ondjo-blue text-[9px] font-black text-white">
                      {otherUnreadCount}
                    </span>
                  )}
                </button>

                {/* Avatar do Interlocutor */}
                <div className="relative shrink-0">
                  {activeChat.category === "assistant" ? (
                    <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-linear-to-br from-ondjo-navy to-ondjo-blue text-white shadow-xs">
                      <Bot size={18} />
                    </div>
                  ) : activeChat.avatarUrl ? (
                    <img
                      src={activeChat.avatarUrl}
                      alt={activeChat.contactName}
                      className="size-9 sm:size-10 rounded-xl object-cover ring-1 ring-ondjo-border"
                    />
                  ) : (
                    <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-ondjo-blue-soft text-ondjo-blue font-bold">
                      {activeChat.contactName.charAt(0)}
                    </div>
                  )}

                  {renderPresenceBadge(activeChat.presence)}
                </div>

                {/* Nome, Cargo e Indicador de Presença em tempo real */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-xs sm:text-sm font-bold text-ondjo-navy">
                      {activeChat.contactName}
                    </h2>
                    {activeChat.verified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-ondjo-success-border bg-ondjo-green-soft px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-ondjo-green">
                        <ShieldCheck size={11} />
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-ondjo-muted truncate">
                    <span className="truncate">{activeChat.role}</span>
                    <span className="text-ondjo-border">•</span>
                    {activeChat.isTyping ? (
                      <span className="text-ondjo-blue font-bold animate-pulse">
                        A escrever...
                      </span>
                    ) : activeChat.presence === "online" ? (
                      <span className="text-ondjo-green font-medium">Online agora</span>
                    ) : activeChat.presence === "away" ? (
                      <span className="text-amber-600 font-medium">Ausente</span>
                    ) : (
                      <span>{activeChat.lastActive}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Botões de Ação na Topbar */}
              <div className="flex items-center gap-1.5 shrink-0">
                {activeProperty && (
                  <button
                    type="button"
                    onClick={() => setPropertyDrawerOpen(!propertyDrawerOpen)}
                    className="focus-ring inline-flex items-center gap-1 rounded-xl border border-ondjo-border bg-ondjo-bg px-2.5 py-1.5 text-xs font-semibold text-ondjo-navy hover:bg-ondjo-blue-soft/50 hover:text-ondjo-blue transition-colors"
                    title="Detalhes do imóvel associado"
                  >
                    <Info size={15} />
                    <span className="hidden sm:inline">Imóvel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Faixa / Card de Contexto do Imóvel no topo da conversa ativa */}
            {activeProperty && (
              <div className="flex items-center justify-between gap-3 border-b border-ondjo-border/60 bg-ondjo-bg/60 px-3.5 py-2 sm:px-5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={activeProperty.images[0]}
                    alt={activeProperty.title}
                    className="size-9 sm:size-10 rounded-lg object-cover ring-1 ring-ondjo-border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ondjo-navy">
                      {activeProperty.title}
                    </p>
                    <p className="text-[11px] font-semibold text-ondjo-ink">
                      {new Intl.NumberFormat("pt-AO").format(activeProperty.price)} Kz
                      <span className="font-normal text-ondjo-muted">
                        {" "}
                        / mês • {activeProperty.neighborhood}, {activeProperty.city}
                      </span>
                    </p>
                  </div>
                </div>

                <a
                  href={`#/imovel/${activeProperty.id}`}
                  className="focus-ring shrink-0 inline-flex items-center gap-1 text-xs font-bold text-ondjo-blue hover:text-ondjo-blue-dark"
                >
                  <span>Anúncio</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Histórico de Mensagens com scroll */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-3.5 bg-linear-to-b from-ondjo-bg/25 to-ondjo-surface scrollbar-subtle">
              {/* Divisor do Histórico Seguro */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ondjo-border/70" />
                </div>
                <span className="relative rounded-full border border-ondjo-border bg-ondjo-surface px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ondjo-muted shadow-2xs">
                  Canal seguro ONDJO Angola
                </span>
              </div>

              {/* Bolhas de Mensagem */}
              {activeChat.messages.map((message) => {
                const isUser = message.sender === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={[
                        "max-w-[88%] sm:max-w-[78%] rounded-2xl p-3 sm:p-3.5 shadow-2xs text-xs sm:text-sm leading-relaxed transition-all",
                        isUser
                          ? "bg-ondjo-blue text-white rounded-br-xs"
                          : "bg-ondjo-surface border border-ondjo-border text-ondjo-ink rounded-bl-xs",
                      ].join(" ")}
                    >
                      {/* Texto */}
                      <p className="whitespace-pre-line">{message.text}</p>

                      {/* Card interativo de Proposta de Visita ao Imóvel */}
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
                          <div className="mt-3 pt-2.5 border-t border-ondjo-border/60 flex flex-wrap items-center gap-2">
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
                                  onClick={() =>
                                    handleSendMessage(
                                      "Gostaria de propor um horário alternativo para a visita. Seria possível no período da tarde?"
                                    )
                                  }
                                  className="focus-ring inline-flex items-center gap-1 rounded-lg border border-ondjo-border bg-ondjo-surface px-2.5 py-1.5 text-xs font-semibold text-ondjo-ink hover:bg-ondjo-bg transition-colors"
                                >
                                  Propor outro horário
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Metadados: Hora e Estado de Leitura */}
                      <div
                        className={[
                          "mt-1.5 flex items-center justify-end gap-1 text-[10px]",
                          isUser ? "text-white/80" : "text-ondjo-muted",
                        ].join(" ")}
                      >
                        <span>{message.timestamp}</span>
                        {isUser && renderMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Indicador de Digitação do Corretor */}
              <AnimatePresence>
                {activeChat.isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-center gap-2 rounded-2xl border border-ondjo-border bg-ondjo-surface px-3.5 py-2 shadow-2xs w-fit"
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

            {/* Chips de Perguntas Rápidas */}
            <div className="border-t border-ondjo-border/60 bg-ondjo-bg/30 px-3 py-2 sm:px-4">
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

            {/* Barra de Composição e Envio */}
            <div className="border-t border-ondjo-border/80 p-2.5 sm:p-4 bg-ondjo-surface">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Escreva uma mensagem para ${activeChat.contactName}...`}
                    className="focus-ring w-full rounded-xl border border-ondjo-border bg-ondjo-bg px-3.5 py-2.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-ondjo-ink placeholder:text-ondjo-muted"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-ondjo-blue px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors hover:bg-ondjo-blue-dark active:bg-ondjo-navy disabled:opacity-40 disabled:pointer-events-none"
                  aria-label="Enviar mensagem"
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </div>
          </main>

          {/* ========================================================= */}
          {/* COLUNA 3: Ficha do Imóvel Associado (Desktop Lateral)     */}
          {/* ========================================================= */}
          {activeProperty && propertyDrawerOpen && (
            <aside
              aria-label="Ficha do imóvel em negociação"
              className="hidden lg:block border-l border-ondjo-border/80 bg-ondjo-bg/40 p-4 lg:col-span-3 xl:col-span-3.5 overflow-y-auto scrollbar-subtle"
            >
              <div className="rounded-2xl border border-ondjo-border bg-ondjo-surface p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-ondjo-border/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ondjo-navy">
                    Imóvel em negociação
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPropertyDrawerOpen(false)}
                    className="focus-ring text-ondjo-muted hover:text-ondjo-ink p-1 rounded-lg"
                    aria-label="Fechar painel do imóvel"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Imagem */}
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

                {/* Especificações */}
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

                {/* Comodidades */}
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

                {/* Link Externo */}
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

      {/* Modal / Bottom Sheet do Imóvel para Telemóveis (Mobile) */}
      <AnimatePresence>
        {activeProperty && propertyDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 lg:hidden">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-ondjo-surface p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-ondjo-border">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-ondjo-blue" />
                  <h3 className="text-sm font-bold text-ondjo-navy">
                    Imóvel em negociação
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPropertyDrawerOpen(false)}
                  className="focus-ring rounded-xl border border-ondjo-border p-2 text-ondjo-muted hover:bg-ondjo-bg hover:text-ondjo-ink"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4">
                <img
                  src={activeProperty.images[0]}
                  alt={activeProperty.title}
                  className="aspect-video w-full rounded-2xl object-cover ring-1 ring-ondjo-border"
                />

                <div className="mt-3">
                  <p className="text-lg font-black text-ondjo-navy">
                    {new Intl.NumberFormat("pt-AO").format(activeProperty.price)} Kz
                    <span className="text-xs font-normal text-ondjo-muted"> / mês</span>
                  </p>
                  <h4 className="text-sm font-bold text-ondjo-ink">{activeProperty.title}</h4>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ondjo-muted">
                    <MapPin size={13} className="text-ondjo-blue shrink-0" />
                    <span>{activeProperty.neighborhood}, {activeProperty.city}</span>
                  </p>
                </div>

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
                    <span className="text-ondjo-muted block text-[10px] uppercase font-bold">Vagas</span>
                    <span className="font-bold text-ondjo-navy">{activeProperty.parking} Vagas</span>
                  </div>
                </div>

                <div className="mt-5">
                  <a
                    href={`#/imovel/${activeProperty.id}`}
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-ondjo-blue py-3 text-sm font-bold text-white shadow-xs hover:bg-ondjo-blue-dark"
                  >
                    <span>Ver anúncio completo</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatPage;
