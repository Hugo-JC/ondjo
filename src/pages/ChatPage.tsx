import { useState, useEffect, useRef, useMemo, useCallback, useId } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
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
  ChevronDown,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  MessageSquare,
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
import { formatKz } from "../utils/format";
import { properties } from "../data/properties";
import type { Property } from "../types";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../components/ui";

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
  "Ainda está disponível?",
  "Qual é a caução?",
  "Agendar visita",
  "Tem gerador e água?",
  "Documentação necessária?",
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

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [notifBannerDismissed, setNotifBannerDismissed] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true,
  );
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const clearScheduledTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearScheduledTimeouts();
    };
  }, [clearScheduledTimeouts]);

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

  // Ligar conversa ao imóvel passado pela rota (ex: #/mensagens?property=...) sem efeitos colaterais no updater
  useEffect(() => {
    const hash = window.location.hash;
    const queryPart = hash.includes("?") ? hash.split("?")[1] : "";
    const params = new URLSearchParams(queryPart);
    const propId = params.get("property");
    if (!propId) return;

    const existing = conversations.find((c) => c.propertyId === propId);
    if (existing) {
      setActiveChatId(existing.id);
      setMobileView("chat");
      return;
    }

    const prop = properties.find((p) => p.id === propId);
    if (!prop) return;

    const newConv: Conversation = {
      id: `conv-prop-${prop.id}`,
      contactName: prop.advertiser?.name || "Consultor ONDJO",
      role:
        prop.advertiser?.type === "particular"
          ? "Proprietário particular"
          : "Corretor verificado",
      presence: "online",
      verified: Boolean(prop.advertiser?.verified ?? prop.verified),
      propertyId: prop.id,
      unreadCount: 0,
      lastActive: "Agora",
      category: prop.advertiser?.type === "particular" ? "owner" : "agent",
      avatarUrl: prop.images[0],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "agent",
          text: `Olá! Obrigado pelo interesse no imóvel "${prop.title}". Estou disponível para agendar visita e tirar dúvidas.`,
          timestamp: "Agora",
          status: "delivered",
        },
      ],
    };

    setConversations((prev) =>
      prev.some((c) => c.propertyId === propId) ? prev : [newConv, ...prev],
    );
    setActiveChatId(newConv.id);
    setMobileView("chat");
    // Apenas na montagem inicial quando abre conversa via link direto do imóvel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Estado da permissão nativa do navegador
  const isNotificationSupported = typeof window !== "undefined" && "Notification" in window;
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const scrollSnapshotRef = useRef({
    chatId: activeChatId,
    messageCount: 0,
    isTyping: false,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const activeChatIdRef = useRef<string>(activeChatId);
  const reduceMotion = useReducedMotion();
  const conversationSearchId = useId();
  const conversationListRef = useRef<HTMLDivElement>(null);

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

  const scrollMessagesToBottom = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const container = messagesScrollRef.current;
      if (!container) return;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: reduceMotion ? "auto" : behavior,
      });
    },
    [reduceMotion],
  );

  // Manter o histórico visível no contentor — sem scrollIntoView (evita saltos na página)
  useEffect(() => {
    const messageCount = activeChat?.messages.length ?? 0;
    const isTyping = Boolean(activeChat?.isTyping);
    const prev = scrollSnapshotRef.current;
    const chatChanged = prev.chatId !== activeChatId;
    const newBubble =
      messageCount > prev.messageCount || isTyping !== prev.isTyping;

    scrollSnapshotRef.current = {
      chatId: activeChatId,
      messageCount,
      isTyping,
    };

    if (!chatChanged && !newBubble) return;

    const behavior: ScrollBehavior =
      chatChanged || messageCount > prev.messageCount ? "smooth" : "auto";

    requestAnimationFrame(() => {
      scrollMessagesToBottom(behavior);
    });
  }, [
    activeChat?.messages.length,
    activeChat?.isTyping,
    activeChatId,
    scrollMessagesToBottom,
  ]);

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
          icon: "/icon.png",
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

  // Solicitar permissão de notificações do navegador (sem window.alert)
  async function requestNotificationPermission() {
    if (!isNotificationSupported) {
      setStatusFeedback("O seu navegador não suporta notificações de área de trabalho.");
      scheduleTimeout(() => setStatusFeedback(null), 4000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        const welcome = new Notification("Notificações ONDJO Ativadas!", {
          body: "Receberá alertas em tempo real sempre que corretores responderem ou enviarem propostas.",
          icon: "/icon.png",
        });
        welcome.onclick = () => {
          window.focus();
          welcome.close();
        };
      } else if (permission === "denied") {
        setStatusFeedback(
          "Notificações bloqueadas no navegador. Ative-as nas definições do site junto à barra de endereço.",
        );
        scheduleTimeout(() => setStatusFeedback(null), 5000);
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
  // Atalhos de teclado globais (/ ou Ctrl+K para pesquisar, Esc para fechar gaveta do imóvel)
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if ((e.key === "/" && !isInput) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        const searchInput = document.getElementById(conversationSearchId) as HTMLInputElement | null;
        searchInput?.focus();
        searchInput?.select();
        return;
      }

      if (e.key === "Escape") {
        if (propertyDrawerOpen) {
          setPropertyDrawerOpen(false);
        } else if (isInput) {
          target.blur();
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [propertyDrawerOpen, conversationSearchId]);

  // Navegação por teclado na lista de conversas (Setas, Home, End)
  const handleConversationKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (!filteredConversations.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (index + 1) % filteredConversations.length;
        const nextConv = filteredConversations[nextIndex];
        selectConversation(nextConv.id);
        const buttons = conversationListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="option"]');
        buttons?.[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (index - 1 + filteredConversations.length) % filteredConversations.length;
        const prevConv = filteredConversations[prevIndex];
        selectConversation(prevConv.id);
        const buttons = conversationListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="option"]');
        buttons?.[prevIndex]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        const firstConv = filteredConversations[0];
        selectConversation(firstConv.id);
        const buttons = conversationListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="option"]');
        buttons?.[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        const lastIndex = filteredConversations.length - 1;
        const lastConv = filteredConversations[lastIndex];
        selectConversation(lastConv.id);
        const buttons = conversationListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="option"]');
        buttons?.[lastIndex]?.focus();
      }
    },
    [filteredConversations, selectConversation]
  );


  // Enviar mensagem pelo usuário com simulação de leitura em tempo real
  function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text || !activeChat) return;

    const messageId = `m-${Date.now()}`;
    const currentTime = formatTimestamp();
    const currentConvId = activeChat.id;
    const currentSenderName = activeChat.contactName;
    const currentCategory = activeChat.category;

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
    requestAnimationFrame(() => scrollMessagesToBottom("smooth"));

    // 2. Transição para "sent"
    scheduleTimeout(() => {
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
    }, 350);

    // 3. Transição para "delivered"
    scheduleTimeout(() => {
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
    }, 850);

    // 4. Corretor abre a mensagem ("read") e inicia digitação
    scheduleTimeout(() => {
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
    }, 1500);

    // 5. Resposta do corretor/assistente
    scheduleTimeout(() => {
      let replyText = "";
      if (currentCategory === "assistant") {
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
    }, 2800);
  }

  // Simular recebimento de mensagem em tempo real de outro corretor (demonstração interativa)
  function handleTriggerIncomingSimulation() {
    const candidateConvs = conversations.filter((c) => c.id !== activeChatId);
    const target = candidateConvs[Math.floor(Math.random() * candidateConvs.length)] || conversations[0];
    if (!target) return;

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
      scheduleTimeout(() => {
        setNotification((curr) => (curr?.conversationId === target.id ? null : curr));
      }, 5000);
    }
  }

  // Confirmar proposta de visita
  function handleConfirmVisit(messageId: string) {
    if (!activeChat) return;
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

  // Restaurar dados originais de simulação (com modal in-app sem window.confirm)
  function handleResetConversations() {
    setConfirmResetOpen(true);
  }

  function confirmResetConversations() {
    clearScheduledTimeouts();

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    setConversations(DEFAULT_CONVERSATIONS);
    setActiveChatId(DEFAULT_CONVERSATIONS[0]?.id ?? "");
    setMobileView("list");
    setNotification(null);
    setConfirmResetOpen(false);
  }

  // Renderizar ícone de status de leitura da mensagem
  function renderMessageStatusIcon(status?: MessageStatus) {
    if (!status) return null;
    switch (status) {
      case "pending":
        return (
          <span title="A enviar...">
            <Clock size={12} className="opacity-70" />
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

  // Renderizar indicador de presença no avatar
  function renderPresenceBadge(presence: PresenceState) {
    switch (presence) {
      case "online":
        return (
          <span
            title="Online agora"
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-ondjo-green"
          />
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
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-slate-400"
          />
        );
    }
  }

  if (!activeChat) return null;

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-ondjo-bg p-0 sm:p-4 lg:p-6">
      {statusFeedback && (
        <div
          role="status"
          className="mx-3 mt-2 sm:mx-auto sm:mt-0 mb-2 sm:mb-3 flex w-auto sm:w-full max-w-7xl items-center justify-between gap-3 rounded-xl border border-ondjo-warning-border bg-ondjo-warning-soft px-4 py-2 text-xs font-semibold text-ondjo-warning shadow-2xs"
        >
          <span>{statusFeedback}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setStatusFeedback(null)}
            aria-label="Fechar aviso"
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* Banner compacto de notificações do navegador */}
      {isNotificationSupported &&
        notificationPermission === "default" &&
        !notifBannerDismissed && (
          <div className="mx-3 mt-2 sm:mx-auto sm:mt-0 mb-2 sm:mb-3 w-auto sm:w-full max-w-7xl shrink-0">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-ondjo-border-accent bg-ondjo-blue-50 px-3.5 py-2.5 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-ondjo-blue text-white">
                  <Bell size={15} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ondjo-navy truncate">
                    Ativar notificações de mensagens
                  </p>
                  <p className="hidden sm:block text-ondjo-muted truncate">
                    Receba alertas quando os corretores responderem ou propuserem visitas.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  onClick={requestNotificationPermission}
                  className="rounded-lg px-3"
                >
                  Ativar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setNotifBannerDismissed(true)}
                  aria-label="Dispensar aviso de notificações"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}

      {/* Notificação In-App de Nova Mensagem em Tempo Real */}
      <AnimatePresence>
        {notification && (
          <m.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="fixed top-18 right-4 z-50 max-w-sm w-[calc(100%-2rem)] rounded-2xl border border-ondjo-blue/30 bg-white p-3.5 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-ondjo-blue text-white shadow-xs">
                <BellRing size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-ondjo-navy truncate">
                    {notification.senderName}
                  </p>
                  <Badge variant="info" size="xs">
                    Agora
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-ondjo-ink line-clamp-2">
                  {notification.text}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      selectConversation(notification.conversationId);
                      setNotification(null);
                    }}
                  >
                    Abrir conversa
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setNotification(null)}
                  >
                    Ignorar
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setNotification(null)}
                aria-label="Fechar notificação"
              >
                <X size={14} />
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Janela principal de chat */}
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-ondjo-border sm:shadow-xs">
        <header className="shrink-0 border-b border-ondjo-border bg-white px-3.5 py-2.5 sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-ondjo-blue-50 text-ondjo-blue">
                <MessageSquare size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <h1 className="truncate text-base font-black tracking-tight text-ondjo-navy sm:text-lg">
                    Mensagens
                  </h1>
                  {totalUnreadCount > 0 && (
                    <Badge
                      variant="info"
                      size="xs"
                      className="shrink-0 border-transparent bg-ondjo-blue text-white"
                      aria-label={`${totalUnreadCount} não lida${totalUnreadCount > 1 ? "s" : ""}`}
                    >
                      <span>{totalUnreadCount}</span>
                      <span className="hidden sm:inline">
                        não lida{totalUnreadCount > 1 ? "s" : ""}
                      </span>
                    </Badge>
                  )}
                </div>
                <p className="hidden sm:block text-xs text-ondjo-muted truncate">
                  Corretores verificados, proprietários e assistente ONDJO
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-1.5 shrink-0"
              role="toolbar"
              aria-label="Preferências do chat"
            >
              {isNotificationSupported && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={requestNotificationPermission}
                  aria-label={
                    notificationPermission === "granted"
                      ? "Notificações do navegador ativas"
                      : notificationPermission === "denied"
                        ? "Notificações bloqueadas no navegador"
                        : "Ativar notificações no navegador"
                  }
                  className={cn(
                    "h-9 rounded-xl px-2.5",
                    notificationPermission === "granted"
                      ? "border-ondjo-success-border bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : notificationPermission === "denied"
                        ? "border-ondjo-danger-border bg-rose-50 text-rose-700 hover:bg-rose-100"
                        : "border-ondjo-border bg-white text-ondjo-muted hover:text-ondjo-blue",
                  )}
                >
                  {notificationPermission === "granted" ? (
                    <BellRing size={15} aria-hidden="true" />
                  ) : notificationPermission === "denied" ? (
                    <BellOff size={15} aria-hidden="true" />
                  ) : (
                    <Bell size={15} aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">
                    {notificationPermission === "denied" ? "Bloqueadas" : "Alertas"}
                  </span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-pressed={soundEnabled}
                aria-label={
                  soundEnabled
                    ? "Desativar som de novas mensagens"
                    : "Ativar som de novas mensagens"
                }
                className="h-9 rounded-xl border-ondjo-border bg-white px-2.5 text-ondjo-muted hover:text-ondjo-ink"
              >
                {soundEnabled ? (
                  <Volume2 size={15} className="text-ondjo-blue" aria-hidden="true" />
                ) : (
                  <VolumeX size={15} aria-hidden="true" />
                )}
                <span className="hidden md:inline">{soundEnabled ? "Som" : "Mudo"}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl border-ondjo-border bg-slate-50 px-2.5 text-xs font-semibold text-ondjo-ink"
                    />
                  }
                >
                  <Sparkles size={14} className="text-ondjo-blue" aria-hidden="true" />
                  <span>Demo</span>
                  <ChevronDown size={14} className="opacity-60" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6} className="w-56">
                  <DropdownMenuItem onClick={handleTriggerIncomingSimulation}>
                    <Zap size={14} className="text-ondjo-blue" aria-hidden="true" />
                    <span>Simular mensagem recebida</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleResetConversations}>
                    <RotateCcw size={14} className="text-ondjo-muted" aria-hidden="true" />
                    <span>Restaurar conversas demo</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
          {/* ========================================================= */}
          {/* COLUNA 1: Lista de Chats (Master)                         */}
          {/* ========================================================= */}
          <aside
            aria-label="Lista de conversas"
            className={cn(
              "flex min-h-0 flex-col border-r border-ondjo-border bg-white lg:col-span-4 xl:col-span-4",
              mobileView === "chat" ? "hidden lg:flex" : "flex",
            )}
          >
            <div className="shrink-0 border-b border-ondjo-border/80 p-3 space-y-2.5">
              <label htmlFor={conversationSearchId} className="sr-only">
                Pesquisar conversas por nome ou imóvel
              </label>
              <div className="relative flex items-center">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 text-ondjo-muted"
                  aria-hidden="true"
                />
                <Input
                  id={conversationSearchId}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar conversas..."
                  className="h-10 rounded-xl border-ondjo-border bg-slate-50 pl-9 pr-8 text-sm"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpar pesquisa"
                    className="absolute right-1.5 rounded-full text-ondjo-muted"
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>

              <Tabs
                value={activeTab}
                onValueChange={(val) =>
                  setActiveTab(
                    String(val) as "all" | "agent" | "owner" | "assistant" | "unread",
                  )
                }
              >
                <TabsList
                  variant="pill"
                  aria-label="Filtrar conversas"
                  className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-ondjo-border bg-slate-100 p-1"
                >
                  {(
                    [
                      { id: "all", label: "Todas" },
                      { id: "agent", label: "Corretores" },
                      { id: "owner", label: "Proprietários" },
                      { id: "assistant", label: "Assistente" },
                      { id: "unread", label: "Não lidas" },
                    ] as const
                  ).map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="min-h-7.5 flex-none rounded-full px-2.5 text-[11px] font-bold data-active:bg-ondjo-navy data-active:text-white"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Lista com scroll das conversas */}
            <div
              ref={conversationListRef}
              role="listbox"
              aria-label="Conversas disponíveis"
              className="min-h-0 flex-1 overflow-y-auto p-2 space-y-1 scrollbar-subtle"
            >
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
                filteredConversations.map((conv, index) => {
                  const isCurrent = conv.id === activeChat.id;
                  const lastMessage = conv.messages[conv.messages.length - 1];
                  const linkedProp = conv.propertyId
                    ? properties.find((p) => p.id === conv.propertyId)
                    : undefined;

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      role="option"
                      aria-selected={isCurrent}
                      tabIndex={isCurrent ? 0 : -1}
                      onKeyDown={(e) => handleConversationKeyDown(e, index)}
                      onClick={() => selectConversation(conv.id)}
                      className={cn(
                        "focus-ring w-full text-left rounded-xl p-3 transition-colors flex items-start gap-3 relative cursor-pointer",
                        isCurrent
                          ? "bg-ondjo-blue-50 ring-1 ring-inset ring-ondjo-blue/25"
                          : "hover:bg-slate-50",
                      )}
                    >
                      {/* Avatar shadcn e Indicador de Presença */}
                      <div className="relative shrink-0">
                        {conv.category === "assistant" ? (
                          <div className="grid size-11 place-items-center rounded-full bg-linear-to-br from-ondjo-navy to-ondjo-blue text-white shadow-2xs">
                            <Sparkles size={18} />
                          </div>
                        ) : (
                          <Avatar className="size-11 ring-1 ring-ondjo-border">
                            {conv.avatarUrl && (
                              <AvatarImage src={conv.avatarUrl} alt={conv.contactName} />
                            )}
                            <AvatarFallback className="bg-ondjo-blue-soft text-ondjo-blue font-bold text-sm">
                              {conv.contactName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {renderPresenceBadge(conv.presence)}
                      </div>

                      {/* Informações da conversa */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate text-xs sm:text-sm font-bold text-ondjo-navy">
                              {conv.contactName}
                            </span>
                            {conv.verified && (
                              <span title="Corretor verificado com licença ONDJO">
                                <ShieldCheck size={14} className="shrink-0 text-ondjo-green" />
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 text-[11px] font-medium text-ondjo-muted tabular-nums">
                            {lastMessage ? lastMessage.timestamp : conv.lastActive}
                          </span>
                        </div>

                        {linkedProp && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-ondjo-blue truncate">
                            <Building2 size={11} className="shrink-0" />
                            <span className="truncate">{linkedProp.title}</span>
                          </div>
                        )}

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 min-w-0 truncate text-xs text-ondjo-muted">
                            {conv.isTyping ? (
                              <span className="text-ondjo-blue font-semibold">
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
                            <Badge
                              variant="info"
                              size="xs"
                              className="h-5 min-w-5 justify-center bg-ondjo-blue text-white border-transparent px-1.5"
                            >
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Rodapé da lista */}
            <div className="hidden sm:block shrink-0 border-t border-ondjo-border/80 p-3 bg-slate-50/70">
              <div className="flex items-center gap-2 rounded-xl border border-ondjo-border bg-white p-2.5 text-[11px] text-ondjo-muted">
                <ShieldCheck size={15} className="shrink-0 text-ondjo-green" />
                <span>
                  <strong className="text-ondjo-navy">Garantia ONDJO:</strong> Histórico e propostas protegidos na plataforma.
                </span>
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* COLUNA 2: Diálogo Ativo (Detail)                          */}
          {/* ========================================================= */}
          <main
            aria-label="Diálogo ativo"
            className={cn(
              "flex min-h-0 flex-col bg-white overflow-hidden",
              propertyDrawerOpen
                ? "lg:col-span-5 xl:col-span-5"
                : "lg:col-span-8 xl:col-span-8",
              mobileView === "list" ? "hidden lg:flex" : "flex",
            )}
          >
            {/* Topbar da Janela Ativa */}
            <div className="shrink-0 flex items-center justify-between gap-2 sm:gap-3 border-b border-ondjo-border px-3.5 py-2.5 sm:px-5 sm:py-3 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMobileView("list")}
                  className="h-9 rounded-xl border-ondjo-border bg-slate-50 px-2.5 text-xs font-bold text-ondjo-navy lg:hidden"
                  aria-label="Voltar para a lista de conversas"
                >
                  <ArrowLeft size={15} />
                  <span>Chats</span>
                  {otherUnreadCount > 0 && (
                    <Badge variant="info" size="xs" className="bg-ondjo-blue text-white border-transparent px-1.5">
                      {otherUnreadCount}
                    </Badge>
                  )}
                </Button>

                <div className="relative shrink-0">
                  {activeChat.category === "assistant" ? (
                    <div className="grid size-9 sm:size-10 place-items-center rounded-full bg-linear-to-br from-ondjo-navy to-ondjo-blue text-white shadow-2xs">
                      <Bot size={18} />
                    </div>
                  ) : (
                    <Avatar className="size-9 sm:size-10 ring-1 ring-ondjo-border">
                      {activeChat.avatarUrl && (
                        <AvatarImage src={activeChat.avatarUrl} alt={activeChat.contactName} />
                      )}
                      <AvatarFallback className="bg-ondjo-blue-soft text-ondjo-blue font-bold">
                        {activeChat.contactName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {renderPresenceBadge(activeChat.presence)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-xs sm:text-sm font-bold text-ondjo-navy">
                      {activeChat.contactName}
                    </h2>
                    {activeChat.verified && (
                      <Badge variant="verified" size="xs" className="hidden sm:inline-flex">
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-[11px] text-ondjo-muted truncate">
                    <span className="truncate">{activeChat.role}</span>
                    <span className="text-ondjo-border">•</span>
                    {activeChat.isTyping ? (
                      <span className="text-ondjo-blue font-bold">A escrever...</span>
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

              <div className="flex items-center gap-1.5 shrink-0">
                {activeProperty && (
                  <Button
                    type="button"
                    variant={propertyDrawerOpen ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setPropertyDrawerOpen(!propertyDrawerOpen)}
                    className="h-9 rounded-xl px-2.5 text-xs font-semibold"
                    title="Detalhes do imóvel associado"
                  >
                    <Info size={15} />
                    <span className="hidden sm:inline">Imóvel</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Faixa de Contexto do Imóvel */}
            {activeProperty && (
              <div className="shrink-0 flex items-center justify-between gap-3 border-b border-ondjo-border/80 bg-slate-50 px-3.5 py-2 sm:px-5">
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
                    <p className="text-[11px] font-semibold text-ondjo-ink truncate">
                      {formatKz(activeProperty.price, {
                        perMonth: activeProperty.purpose === "arrendamento",
                      })}
                      <span className="font-normal text-ondjo-muted">
                        {" "}
                        • {activeProperty.neighborhood}, {activeProperty.city}
                      </span>
                    </p>
                  </div>
                </div>

                <a
                  href={`#/imovel/${activeProperty.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "xs" }),
                    "shrink-0 rounded-lg border-ondjo-border bg-white font-bold text-ondjo-blue",
                  )}
                >
                  <span>Anúncio</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Histórico de Mensagens com scroll */}
            <div
              ref={messagesScrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3.5 sm:p-5 lg:p-6 space-y-3 bg-slate-50/50 scrollbar-subtle"
            >
              <div className="relative my-1.5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ondjo-border/70" />
                </div>
                <Badge
                  variant="neutral"
                  size="xs"
                  className="relative border-ondjo-border bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ondjo-muted"
                >
                  Canal seguro ONDJO Angola
                </Badge>
              </div>

              {activeChat.messages.map((message) => {
                const isUser = message.sender === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] sm:max-w-[78%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-2xs",
                        isUser
                          ? "bg-ondjo-blue text-white rounded-br-xs"
                          : "bg-white border border-ondjo-border text-ondjo-ink rounded-bl-xs",
                      )}
                    >
                      <p className="whitespace-pre-line">{message.text}</p>

                      {message.visitProposal && (
                        <div className="mt-3 rounded-xl border border-ondjo-border-accent bg-ondjo-blue-50 p-3 text-ondjo-navy">
                          <div className="flex items-center gap-2 text-xs font-bold text-ondjo-blue">
                            <CalendarDays size={16} />
                            <span>Proposta de Visita ao Imóvel</span>
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-ondjo-ink">
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-ondjo-muted shrink-0" />
                              <span>
                                {message.visitProposal.date} às {message.visitProposal.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-ondjo-muted shrink-0" />
                              <span className="truncate">{message.visitProposal.location}</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-ondjo-border/70 flex flex-wrap items-center gap-2">
                            {message.visitProposal.confirmed ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-ondjo-green">
                                <CalendarCheck size={15} />
                                <span>Visita Confirmada na sua Agenda!</span>
                              </div>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="xs"
                                  onClick={() => handleConfirmVisit(message.id)}
                                  leftIcon={<Check size={13} />}
                                  className="h-8 rounded-lg px-3 font-bold"
                                >
                                  Confirmar visita
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  onClick={() =>
                                    handleSendMessage(
                                      "Gostaria de propor um horário alternativo para a visita. Seria possível no período da tarde?",
                                    )
                                  }
                                  className="h-8 rounded-lg border-ondjo-border bg-white px-2.5 font-semibold text-ondjo-ink"
                                >
                                  Propor outro horário
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div
                        className={cn(
                          "mt-1.5 flex items-center justify-end gap-1 text-[10px]",
                          isUser ? "text-white/80" : "text-ondjo-muted",
                        )}
                      >
                        <span>{message.timestamp}</span>
                        {isUser && renderMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                );
              })}

              <AnimatePresence>
                {activeChat.isTyping && (
                  <m.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-2 rounded-2xl border border-ondjo-border bg-white px-3.5 py-2 shadow-2xs w-fit"
                  >
                    <span className="text-xs font-semibold text-ondjo-muted">
                      {activeChat.contactName} está a escrever...
                    </span>
                  </m.div>
                )}
              </AnimatePresence>

              <div className="h-px shrink-0" aria-hidden="true" />
            </div>

            {/* Cápsulas de Perguntas Rápidas */}
            <div className="shrink-0 border-t border-ondjo-border/80 bg-slate-50 px-3 py-2 sm:px-4">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <span className="shrink-0 text-[11px] font-bold text-ondjo-muted flex items-center gap-1 mr-1">
                  <Sparkles size={12} className="text-ondjo-blue" />
                  Sugestões:
                </span>
                {QUICK_QUESTIONS.map((question, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => handleSendMessage(question)}
                    className="shrink-0 h-8 rounded-full border-ondjo-border bg-white px-3 text-xs font-semibold text-ondjo-ink hover:border-ondjo-blue hover:text-ondjo-blue hover:bg-ondjo-blue-50"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>

            {/* Barra de Composição e Envio */}
            <div className="shrink-0 border-t border-ondjo-border p-2.5 sm:p-3.5 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Escreva uma mensagem para ${activeChat.contactName}...`}
                  className="h-11 flex-1 rounded-xl border-ondjo-border bg-slate-50 px-3.5 text-xs sm:text-sm"
                />

                <Button
                  type="submit"
                  variant="primary"
                  disabled={!inputText.trim()}
                  className="h-11 min-w-11 rounded-xl px-4 text-xs sm:text-sm font-bold"
                  aria-label="Enviar mensagem"
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">Enviar</span>
                </Button>
              </form>
            </div>
          </main>

          {/* ========================================================= */}
          {/* COLUNA 3: Ficha do Imóvel Associado (Desktop Lateral)     */}
          {/* ========================================================= */}
          {activeProperty && propertyDrawerOpen && (
            <aside
              aria-label="Ficha do imóvel em negociação"
              className="hidden lg:block border-l border-ondjo-border bg-slate-50/70 p-4 lg:col-span-3 xl:col-span-3 overflow-y-auto scrollbar-subtle"
            >
              <div className="rounded-2xl border border-ondjo-border bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-ondjo-border/70">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ondjo-navy">
                    Imóvel em negociação
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setPropertyDrawerOpen(false)}
                    aria-label="Fechar painel do imóvel"
                  >
                    <X size={15} />
                  </Button>
                </div>

                <div className="mt-3 overflow-hidden rounded-xl border border-ondjo-border/80">
                  <img
                    src={activeProperty.images[0]}
                    alt={activeProperty.title}
                    className="aspect-4/3 w-full object-cover"
                  />
                </div>

                <div className="mt-3">
                  <p className="text-lg font-black text-ondjo-navy">
                    {formatKz(activeProperty.price, {
                      perMonth: activeProperty.purpose === "arrendamento",
                    })}
                  </p>
                  <h4 className="mt-1 text-sm font-bold text-ondjo-ink line-clamp-2">
                    {activeProperty.title}
                  </h4>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ondjo-muted">
                    <MapPin size={13} className="shrink-0 text-ondjo-blue" />
                    <span>
                      {activeProperty.neighborhood}, {activeProperty.city}
                    </span>
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-ondjo-border/80 bg-slate-50 p-3 text-xs">
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

                <div className="mt-4">
                  <p className="text-xs font-bold text-ondjo-navy mb-2">
                    Comodidades do condomínio
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProperty.features.map((feat) => (
                      <Badge key={feat} variant="neutral" size="xs">
                        {feat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-ondjo-border/70">
                  <a
                    href={`#/imovel/${activeProperty.id}`}
                    className={cn(
                      buttonVariants({ variant: "primary", size: "default" }),
                      "w-full rounded-xl text-xs font-bold",
                    )}
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

      {/* Bottom Sheet do Imóvel para Telemóveis (shadcn Sheet) */}
      <Sheet
        open={Boolean(activeProperty && propertyDrawerOpen && !isDesktop)}
        onOpenChange={setPropertyDrawerOpen}
      >
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] rounded-t-3xl p-0 pb-safe overflow-hidden lg:hidden"
        >
          {activeProperty && (
            <>
              <SheetHeader className="px-5 pt-5 pb-3 pr-14">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-ondjo-blue" />
                  <SheetTitle className="text-sm font-bold text-ondjo-navy">
                    Imóvel em negociação
                  </SheetTitle>
                </div>
              </SheetHeader>

              <Separator className="bg-ondjo-border" />

              <div className="overflow-y-auto p-5">
                <img
                  src={activeProperty.images[0]}
                  alt={activeProperty.title}
                  className="aspect-video w-full rounded-2xl border border-ondjo-border object-cover"
                />

                <div className="mt-3">
                  <p className="text-lg font-black text-ondjo-navy">
                    {formatKz(activeProperty.price, {
                      perMonth: activeProperty.purpose === "arrendamento",
                    })}
                  </p>
                  <h4 className="text-sm font-bold text-ondjo-ink">{activeProperty.title}</h4>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ondjo-muted">
                    <MapPin size={13} className="text-ondjo-blue shrink-0" />
                    <span>
                      {activeProperty.neighborhood}, {activeProperty.city}
                    </span>
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-ondjo-border bg-slate-50 p-3 text-xs">
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
                    className={cn(
                      buttonVariants({ variant: "primary", size: "md" }),
                      "w-full rounded-xl text-sm font-bold",
                    )}
                  >
                    <span>Ver anúncio completo</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Diálogo de confirmação para restaurar conversas demo (shadcn AlertDialog) */}
      <AlertDialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-ondjo-navy">
              <RotateCcw size={18} className="text-ondjo-blue" aria-hidden="true" />
              <AlertDialogTitle className="text-base font-black text-ondjo-navy">
                Restaurar conversas demo?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs leading-5 text-ondjo-muted">
              As mensagens enviadas nesta sessão serão substituídas pelas conversas de demonstração padrão do ONDJO.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mx-0 mb-0 rounded-none border-t border-ondjo-border-hairline bg-transparent px-0 pt-4 pb-0">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="primary" onClick={confirmResetConversations}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChatPage;
