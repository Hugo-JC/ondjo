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
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  MessageSquare,
  MoreHorizontal,
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
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
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
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

const LOCAL_STORAGE_KEY = "ondjo-chat-conversations-v3";
const SOUND_STORAGE_KEY = "ondjo-chat-sound-enabled";

function formatTimestamp(): string {
  return new Intl.DateTimeFormat("pt-AO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function playNotificationChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
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
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : DEFAULT_CONVERSATIONS;
    } catch (e) {
      console.error("Falha ao ler conversas salvas:", e);
      return DEFAULT_CONVERSATIONS;
    }
  });

  const [activeChatId, setActiveChatId] = useState<string>(
    () => DEFAULT_CONVERSATIONS[0]?.id ?? "",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "agent" | "owner" | "assistant" | "unread"
  >("all");
  const [inputText, setInputText] = useState("");
  const [propertySheetOpen, setPropertySheetOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [notification, setNotification] = useState<InAppNotification | null>(
    null,
  );

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [notifBannerDismissed, setNotifBannerDismissed] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : true,
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

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;

    try {
      const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  // Ligar conversa ao imóvel passado pela rota (ex: #/chat?property=...)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNotificationSupported =
    typeof window !== "undefined" && "Notification" in window;
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => {
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        SOUND_STORAGE_KEY,
        JSON.stringify(soundEnabled),
      );
    } catch {
      // Ignorar
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(conversations),
      );
    } catch (e) {
      console.error("Falha ao guardar conversas:", e);
    }
  }, [conversations]);

  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || conversations[0];
  }, [conversations, activeChatId]);

  const activeProperty = useMemo<Property | undefined>(() => {
    if (!activeChat || !activeChat.propertyId) return undefined;
    return properties.find((p) => p.id === activeChat.propertyId);
  }, [activeChat]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

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

  const selectConversation = useCallback((id: string) => {
    setActiveChatId(id);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updatedMsgs = c.messages.map((m) =>
          m.sender !== "user" ? { ...m, status: "read" as MessageStatus } : m,
        );
        return { ...c, unreadCount: 0, messages: updatedMsgs };
      }),
    );
  }, []);

  const triggerBrowserNotification = useCallback(
    (convId: string, senderName: string, text: string) => {
      if (soundEnabled) {
        playNotificationChime();
      }

      if (!isNotificationSupported || Notification.permission !== "granted") {
        return;
      }

      const shouldNotify =
        (typeof document !== "undefined" && document.hidden) ||
        activeChatIdRef.current !== convId;
      if (!shouldNotify) return;

      try {
        const notif = new Notification(`ONDJO: Mensagem de ${senderName}`, {
          body: text,
          icon: "/icon.png",
          tag: `ondjo-conv-${convId}`,
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
    [isNotificationSupported, selectConversation, soundEnabled],
  );

  async function requestNotificationPermission() {
    if (!isNotificationSupported) {
      setStatusFeedback(
        "O seu navegador não suporta notificações de área de trabalho.",
      );
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

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (
        (e.key === "/" && !isInput) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        const searchInput = document.getElementById(
          conversationSearchId,
        ) as HTMLInputElement | null;
        searchInput?.focus();
        searchInput?.select();
        return;
      }

      if (e.key === "Escape") {
        if (propertySheetOpen) {
          setPropertySheetOpen(false);
        } else if (isInput) {
          target.blur();
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [propertySheetOpen, conversationSearchId]);

  const handleConversationKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (!filteredConversations.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (index + 1) % filteredConversations.length;
        const nextConv = filteredConversations[nextIndex];
        selectConversation(nextConv.id);
        const buttons =
          conversationListRef.current?.querySelectorAll<HTMLButtonElement>(
            'button[role="option"]',
          );
        buttons?.[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          (index - 1 + filteredConversations.length) %
          filteredConversations.length;
        const prevConv = filteredConversations[prevIndex];
        selectConversation(prevConv.id);
        const buttons =
          conversationListRef.current?.querySelectorAll<HTMLButtonElement>(
            'button[role="option"]',
          );
        buttons?.[prevIndex]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        const firstConv = filteredConversations[0];
        selectConversation(firstConv.id);
        const buttons =
          conversationListRef.current?.querySelectorAll<HTMLButtonElement>(
            'button[role="option"]',
          );
        buttons?.[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        const lastIndex = filteredConversations.length - 1;
        const lastConv = filteredConversations[lastIndex];
        selectConversation(lastConv.id);
        const buttons =
          conversationListRef.current?.querySelectorAll<HTMLButtonElement>(
            'button[role="option"]',
          );
        buttons?.[lastIndex]?.focus();
      }
    },
    [filteredConversations, selectConversation],
  );

  function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text || !activeChat) return;

    const messageId = `m-${Date.now()}`;
    const currentTime = formatTimestamp();
    const currentConvId = activeChat.id;
    const currentSenderName = activeChat.contactName;
    const currentCategory = activeChat.category;

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
          : c,
      ),
    );
    setInputText("");
    requestAnimationFrame(() => scrollMessagesToBottom("smooth"));

    scheduleTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, status: "sent" } : m,
            ),
          };
        }),
      );
    }, 350);

    scheduleTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, status: "delivered" } : m,
            ),
          };
        }),
      );
    }, 850);

    scheduleTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c;
          return {
            ...c,
            presence: "online",
            isTyping: true,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, status: "read" } : m,
            ),
          };
        }),
      );
    }, 1500);

    scheduleTimeout(() => {
      let replyText = "";
      if (currentCategory === "assistant") {
        if (
          text.toLowerCase().includes("ipu") ||
          text.toLowerCase().includes("imposto")
        ) {
          replyText =
            "O IPU (Imposto Predial Urbano) é anual e incide sobre o rendimento das rendas (habitualmente taxa efetiva entre 10% a 15%) ou sobre o valor patrimonial. Exija sempre o DAR liquidado pelo senhorio na AGT.";
        } else if (
          text.toLowerCase().includes("visita") ||
          text.toLowerCase().includes("agendar")
        ) {
          replyText =
            "Pode solicitar visitas diretamente nesta janela a qualquer corretor verificado do ONDJO. Não há cobrança de taxas de agendamento na nossa plataforma.";
        } else if (
          text.toLowerCase().includes("talatona") ||
          text.toLowerCase().includes("zona")
        ) {
          replyText =
            "Talatona e Benfica concentram grande procura residencial em Luanda, com forte segurança e autonomia de água e luz. Para T2, os valores situam-se em média entre 120.000 e 220.000 Kz/mês.";
        } else {
          replyText =
            "Informação registada! O assistente ONDJO recomenda sempre formalizar contratos por escrito e verificar a Certidão do Registo Predial antes de adiantar qualquer montante de caução.";
        }
      } else {
        if (
          text.toLowerCase().includes("disponível") ||
          text.toLowerCase().includes("disponivel")
        ) {
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
        } else if (
          text.toLowerCase().includes("visita") ||
          text.toLowerCase().includes("sábado") ||
          text.toLowerCase().includes("agenda")
        ) {
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
            : c,
        ),
      );

      triggerBrowserNotification(currentConvId, currentSenderName, replyText);
    }, 2800);
  }

  function handleTriggerIncomingSimulation() {
    const candidateConvs = conversations.filter((c) => c.id !== activeChatId);
    const target =
      candidateConvs[Math.floor(Math.random() * candidateConvs.length)] ||
      conversations[0];
    if (!target) return;

    const sampleIncomingMessages = [
      "Boa tarde! Temos uma atualização sobre o imóvel que consultou. O proprietário aceita adiantamento de 3 meses.",
      "Olá! Acabou de entrar um novo apartamento T2 com gerador e piscina na mesma zona por um valor muito atrativo.",
      "Confirmamos a documentação predial aprovada para visita amanhã à tarde. Gostaria de confirmar presença?",
      "Olá! Um senhorio acabou de baixar a renda mensal em 15.000 Kz. Tem interesse em ver os detalhes?",
    ];
    const chosenText =
      sampleIncomingMessages[
        Math.floor(Math.random() * sampleIncomingMessages.length)
      ];

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
      }),
    );

    triggerBrowserNotification(target.id, target.contactName, chosenText);

    if (target.id !== activeChatId) {
      setNotification({
        id: `notif-${Date.now()}`,
        conversationId: target.id,
        senderName: target.contactName,
        text: chosenText,
      });

      scheduleTimeout(() => {
        setNotification((curr) =>
          curr?.conversationId === target.id ? null : curr,
        );
      }, 5000);
    }
  }

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
      }),
    );
  }

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
            <CheckCheck size={13} className="text-sky-200" />
          </span>
        );
    }
  }

  function renderPresenceBadge(presence: PresenceState) {
    const colorClass =
      presence === "online"
        ? "bg-emerald-500"
        : presence === "away"
          ? "bg-amber-400"
          : "bg-slate-400";
    const label =
      presence === "online"
        ? "Online agora"
        : presence === "away"
          ? "Ausente"
          : "Offline";

    return (
      <span
        title={label}
        aria-label={label}
        className={cn(
          "absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white",
          colorClass,
        )}
      />
    );
  }

  function renderAvatar(conv: Conversation, sizeClass = "size-11") {
    if (conv.category === "assistant") {
      return (
        <div
          className={cn(
            "grid place-items-center rounded-full bg-ondjo-navy text-white",
            sizeClass,
          )}
        >
          <Bot size={sizeClass.includes("10") ? 18 : 20} aria-hidden="true" />
        </div>
      );
    }

    return (
      <Avatar className={sizeClass}>
        {conv.avatarUrl && (
          <AvatarImage src={conv.avatarUrl} alt={conv.contactName} />
        )}
        <AvatarFallback className="bg-ondjo-blue-soft text-ondjo-blue font-bold text-sm">
          {conv.contactName.charAt(0)}
        </AvatarFallback>
      </Avatar>
    );
  }

  if (!activeChat) return null;

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col overflow-hidden bg-ondjo-bg">
      {/* Feedback de estado discreto */}
      {statusFeedback && (
        <div
          role="status"
          className="flex shrink-0 items-center justify-between gap-3 bg-ondjo-warning-soft px-4 py-2 text-xs font-semibold text-ondjo-warning"
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

      {/* Notificação In-App de Nova Mensagem em Tempo Real */}
      <AnimatePresence>
        {notification && (
          <m.div
            initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="fixed top-18 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-4 shadow-ondjo-popover ring-1 ring-ondjo-navy/10"
          >
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ondjo-blue text-white">
                <BellRing size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-ondjo-navy">
                    {notification.senderName}
                  </p>
                  <Badge variant="info" size="xs">
                    Agora
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ondjo-muted">
                  {notification.text}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      selectConversation(notification.conversationId);
                      setNotification(null);
                    }}
                    className="h-8 rounded-lg px-3"
                  >
                    Abrir conversa
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setNotification(null)}
                    className="h-8 rounded-lg px-2.5"
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

      {/* Workspace Full-Bleed respeitando Sidebar & Header */}
      <div className="flex min-h-0 flex-1 w-full overflow-hidden">
        {/* =========================================================
            PAINEL ESQUERDO: Lista de Conversas
            ========================================================= */}
        <aside
          aria-label="Lista de conversas"
          className={cn(
            "flex min-h-0 w-full flex-col bg-white lg:w-[340px] xl:w-[376px] lg:shrink-0 lg:border-r lg:border-ondjo-border/60",
            mobileView === "chat" ? "hidden lg:flex" : "flex",
          )}
        >
          {/* Cabeçalho Limpo da Lista */}
          <div className="shrink-0 px-4 pt-4 pb-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-ondjo-navy">
                  Mensagens
                </h1>
                {totalUnreadCount > 0 && (
                  <Badge
                    variant="default"
                    size="xs"
                    className="h-5 min-w-5 px-1.5 tabular-nums"
                  >
                    {totalUnreadCount}
                  </Badge>
                )}
              </div>

              {/* Menu Unificado de Preferências & Demo */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Opções de mensagens e notificações"
                      className="size-10 rounded-xl bg-ondjo-bg text-ondjo-navy hover:bg-ondjo-blue-50 hover:text-ondjo-blue"
                    />
                  }
                >
                  <MoreHorizontal size={18} aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6} className="w-60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-ondjo-muted">
                      Preferências
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSoundEnabled(!soundEnabled)}>
                      {soundEnabled ? (
                        <Volume2 size={15} className="text-ondjo-blue" />
                      ) : (
                        <VolumeX size={15} className="text-ondjo-muted" />
                      )}
                      <span>
                        {soundEnabled ? "Desativar som" : "Ativar som"}
                      </span>
                    </DropdownMenuItem>
                    {isNotificationSupported && (
                      <DropdownMenuItem onClick={requestNotificationPermission}>
                        {notificationPermission === "granted" ? (
                          <BellRing size={15} className="text-ondjo-green" />
                        ) : notificationPermission === "denied" ? (
                          <BellOff size={15} className="text-ondjo-danger" />
                        ) : (
                          <Bell size={15} className="text-ondjo-blue" />
                        )}
                        <span>
                          {notificationPermission === "granted"
                            ? "Alertas ativos"
                            : notificationPermission === "denied"
                              ? "Alertas bloqueados"
                              : "Ativar alertas"}
                        </span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-ondjo-muted">
                      Demonstração
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleTriggerIncomingSimulation}>
                      <Zap size={15} className="text-ondjo-blue" />
                      <span>Simular nova mensagem</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleResetConversations}>
                      <RotateCcw size={15} className="text-ondjo-muted" />
                      <span>Restaurar conversas</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Banner compacto opcional de alertas se ainda não decidido */}
            {isNotificationSupported &&
              notificationPermission === "default" &&
              !notifBannerDismissed && (
                <div className="flex items-center justify-between gap-2.5 rounded-xl bg-ondjo-blue-50 px-3 py-2.5 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Bell size={15} className="shrink-0 text-ondjo-blue" />
                    <span className="truncate font-semibold text-ondjo-navy">
                      Ativar alertas de respostas
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="primary"
                      size="xs"
                      onClick={requestNotificationPermission}
                      className="h-7 rounded-lg px-2.5"
                    >
                      Ativar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setNotifBannerDismissed(true)}
                      aria-label="Dispensar aviso"
                      className="size-7 text-ondjo-muted"
                    >
                      <X size={13} />
                    </Button>
                  </div>
                </div>
              )}

            {/* Pesquisa Tonal (sem bordas pesadas) */}
            <div className="relative flex items-center">
              <label htmlFor={conversationSearchId} className="sr-only">
                Pesquisar conversas por nome ou mensagem
              </label>
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 text-ondjo-muted"
                aria-hidden="true"
              />
              <Input
                id={conversationSearchId}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar contacto ou assunto..."
                className="h-10.5 rounded-xl border-transparent bg-ondjo-bg pl-10 pr-9 text-sm text-ondjo-ink placeholder:text-ondjo-muted focus-visible:border-ondjo-blue focus-visible:bg-white"
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

            {/* Filtro de Conversas em linha única fluida (shadcn Tabs) */}
            <Tabs
              value={activeTab}
              onValueChange={(val) =>
                setActiveTab(
                  String(val) as
                    | "all"
                    | "agent"
                    | "owner"
                    | "assistant"
                    | "unread",
                )
              }
            >
              <TabsList
                aria-label="Filtrar conversas"
                className="flex w-full justify-start gap-1 overflow-x-auto no-scrollbar rounded-xl border-0 bg-ondjo-bg p-1"
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
                    className="h-8.5 flex-none rounded-lg px-3 text-xs font-semibold data-active:bg-ondjo-navy data-active:text-white data-active:shadow-xs"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Lista com Scroll Respirável */}
          <div
            ref={conversationListRef}
            role="listbox"
            aria-label="Conversas disponíveis"
            className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4 space-y-1 scrollbar-subtle"
          >
            {filteredConversations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-ondjo-bg text-ondjo-muted">
                  <MessageSquare size={22} />
                </div>
                <p className="mt-3 text-sm font-bold text-ondjo-navy">
                  Nenhuma conversa encontrada
                </p>
                <p className="mt-1 text-xs text-ondjo-muted">
                  Limpe o filtro ou tente outro termo de pesquisa.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv, index) => {
                const isCurrent = conv.id === activeChat.id;
                const lastMessage = conv.messages[conv.messages.length - 1];

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
                      "focus-ring flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-colors duration-150 cursor-pointer",
                      isCurrent
                        ? "bg-ondjo-blue-50"
                        : "hover:bg-slate-50 active:bg-slate-100/80",
                    )}
                  >
                    <div className="relative shrink-0">
                      {renderAvatar(conv, "size-12")}
                      {renderPresenceBadge(conv.presence)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={cn(
                              "truncate text-sm font-bold",
                              isCurrent ? "text-ondjo-blue" : "text-ondjo-navy",
                            )}
                          >
                            {conv.contactName}
                          </span>
                          {conv.verified && (
                            <ShieldCheck
                              size={14}
                              className="shrink-0 text-ondjo-green"
                              aria-label="Verificado"
                            />
                          )}
                        </div>
                        <span className="shrink-0 text-[11px] font-medium text-ondjo-muted tabular-nums">
                          {lastMessage ? lastMessage.timestamp : conv.lastActive}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-1 truncate text-xs text-ondjo-muted">
                          {conv.isTyping ? (
                            <span className="font-semibold text-ondjo-blue">
                              A escrever...
                            </span>
                          ) : (
                            <>
                              {lastMessage?.sender === "user" && (
                                <span className="shrink-0">
                                  {lastMessage.status === "read" ? (
                                    <CheckCheck
                                      size={13}
                                      className="inline text-ondjo-blue"
                                    />
                                  ) : lastMessage.status === "delivered" ? (
                                    <CheckCheck
                                      size={13}
                                      className="inline text-ondjo-muted"
                                    />
                                  ) : lastMessage.status === "sent" ? (
                                    <Check
                                      size={13}
                                      className="inline text-ondjo-muted"
                                    />
                                  ) : (
                                    <Clock
                                      size={11}
                                      className="inline text-ondjo-muted"
                                    />
                                  )}
                                </span>
                              )}
                              <span
                                className={cn(
                                  "truncate",
                                  conv.unreadCount > 0 &&
                                    "font-semibold text-ondjo-navy",
                                )}
                              >
                                {lastMessage?.text || "Sem mensagens."}
                              </span>
                            </>
                          )}
                        </div>

                        {conv.unreadCount > 0 && (
                          <Badge
                            variant="default"
                            size="xs"
                            className="h-5 min-w-5 shrink-0 justify-center px-1.5 tabular-nums"
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
        </aside>

        {/* =========================================================
            PAINEL DIREITO: Conversa Ativa (Full-Height)
            ========================================================= */}
        <main
          aria-label="Diálogo ativo"
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden bg-ondjo-bg",
            mobileView === "list" ? "hidden lg:flex" : "flex",
          )}
        >
          {/* Cabeçalho do Interlocutor — Limpo, Visível e Sem Poluição */}
          <header className="shrink-0 flex items-center justify-between gap-3 bg-white px-3.5 py-3 sm:px-6 border-b border-ondjo-border/50">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMobileView("list")}
                className="h-10 rounded-xl bg-ondjo-bg px-2.5 text-xs font-bold text-ondjo-navy hover:bg-ondjo-blue-soft lg:hidden"
                aria-label="Voltar para a lista de conversas"
              >
                <ArrowLeft size={16} />
                {otherUnreadCount > 0 && (
                  <Badge variant="default" size="xs" className="h-4.5 min-w-4.5 px-1">
                    {otherUnreadCount}
                  </Badge>
                )}
              </Button>

              <div className="relative shrink-0">
                {renderAvatar(activeChat, "size-10 sm:size-11")}
                {renderPresenceBadge(activeChat.presence)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="truncate text-sm sm:text-base font-bold text-ondjo-navy">
                    {activeChat.contactName}
                  </h2>
                  {activeChat.verified && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex shrink-0 items-center text-ondjo-green" />
                        }
                      >
                        <ShieldCheck size={16} aria-hidden="true" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Identidade verificada ONDJO
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                <p className="flex items-center gap-1.5 truncate text-xs text-ondjo-muted">
                  <span className="truncate">{activeChat.role}</span>
                  <span aria-hidden="true">·</span>
                  {activeChat.isTyping ? (
                    <span className="font-semibold text-ondjo-blue">
                      A escrever...
                    </span>
                  ) : activeChat.presence === "online" ? (
                    <span className="font-semibold text-ondjo-green">
                      Online agora
                    </span>
                  ) : activeChat.presence === "away" ? (
                    <span className="font-medium text-amber-600">Ausente</span>
                  ) : (
                    <span>{activeChat.lastActive}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Ação Discreta de Imóvel Associado (ou Badge Assistente) */}
            <div className="flex items-center gap-2 shrink-0">
              {activeProperty ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPropertySheetOpen(true)}
                  className="h-10 gap-2 rounded-xl border-0 bg-ondjo-blue-50 px-2.5 sm:px-3.5 text-ondjo-navy hover:bg-ondjo-blue-soft"
                  aria-label={`Ver detalhes do imóvel: ${activeProperty.title}`}
                >
                  <img
                    src={activeProperty.images[0]}
                    alt=""
                    aria-hidden="true"
                    className="size-6.5 rounded-lg object-cover shrink-0"
                  />
                  <div className="hidden sm:flex flex-col items-start text-left leading-tight">
                    <span className="max-w-36 truncate text-xs font-bold text-ondjo-navy">
                      {activeProperty.neighborhood} · {activeProperty.type}
                    </span>
                    <span className="text-[11px] font-semibold text-ondjo-blue tabular-nums">
                      {formatKz(activeProperty.price, {
                        perMonth: activeProperty.purpose === "arrendamento",
                      })}
                    </span>
                  </div>
                  <span className="sm:hidden text-xs font-bold text-ondjo-blue">
                    Imóvel
                  </span>
                  <ChevronRight
                    size={15}
                    className="text-ondjo-blue shrink-0"
                    aria-hidden="true"
                  />
                </Button>
              ) : (
                <Badge
                  variant="info"
                  icon={<Sparkles size={12} aria-hidden="true" />}
                  className="h-8 rounded-xl border-0 px-3 text-xs font-bold"
                >
                  <span className="hidden sm:inline">Apoio oficial</span>
                  <span className="sm:hidden">Oficial</span>
                </Badge>
              )}
            </div>
          </header>

          {/* Área de Mensagens com Scroll e Espaço para Respirar */}
          <div
            ref={messagesScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3.5 py-5 sm:px-6 lg:px-10 scrollbar-subtle"
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col">
              {activeChat.messages.map((message, idx) => {
                const isUser = message.sender === "user";
                const prevMessage = activeChat.messages[idx - 1];
                const nextMessage = activeChat.messages[idx + 1];
                const isFirstInGroup =
                  !prevMessage || prevMessage.sender !== message.sender;
                const isLastInGroup =
                  !nextMessage || nextMessage.sender !== message.sender;

                return (
                  <m.div
                    key={message.id}
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, y: 10, scale: 0.98 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={cn(
                      "flex items-end gap-2.5",
                      isUser ? "justify-end" : "justify-start",
                      isFirstInGroup && idx > 0 ? "mt-4" : idx > 0 ? "mt-1.5" : "",
                    )}
                  >
                    {/* Avatar do interlocutor apenas na última mensagem do grupo */}
                    {!isUser && (
                      <div className="w-7 shrink-0">
                        {isLastInGroup ? renderAvatar(activeChat, "size-7") : null}
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[84%] sm:max-w-[74%] px-4 py-2.5 text-sm leading-relaxed",
                        isUser
                          ? cn(
                              "bg-linear-to-br from-ondjo-blue to-ondjo-blue-dark text-white shadow-xs",
                              "rounded-2xl",
                              isLastInGroup ? "rounded-br-sm" : "",
                            )
                          : cn(
                              "bg-white text-ondjo-ink shadow-[0_1px_3px_rgba(16,42,67,0.06)]",
                              "rounded-2xl",
                              isLastInGroup ? "rounded-bl-sm" : "",
                            ),
                      )}
                    >
                      <p className="whitespace-pre-line">{message.text}</p>

                      {message.visitProposal && (
                        <div className="mt-3 rounded-xl bg-ondjo-blue-50 p-3.5 text-ondjo-navy">
                          <div className="flex items-center gap-2 text-xs font-bold text-ondjo-blue">
                            <CalendarDays size={16} />
                            <span>Proposta de Visita ao Imóvel</span>
                          </div>

                          <div className="mt-2.5 space-y-1.5 text-xs text-ondjo-ink">
                            <div className="flex items-center gap-2">
                              <Clock
                                size={14}
                                className="shrink-0 text-ondjo-blue"
                              />
                              <span className="font-medium">
                                {message.visitProposal.date} às{" "}
                                {message.visitProposal.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin
                                size={14}
                                className="shrink-0 text-ondjo-blue"
                              />
                              <span className="truncate">
                                {message.visitProposal.location}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2">
                            {message.visitProposal.confirmed ? (
                              <Badge
                                variant="verified"
                                icon={<CalendarCheck size={14} />}
                                className="h-8 rounded-lg px-3 text-xs font-bold"
                              >
                                Visita confirmada na agenda
                              </Badge>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleConfirmVisit(message.id)}
                                  leftIcon={<Check size={14} />}
                                  className="h-9 rounded-xl px-3.5 font-bold"
                                >
                                  Confirmar visita
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleSendMessage(
                                      "Gostaria de propor um horário alternativo para a visita. Seria possível no período da tarde?",
                                    )
                                  }
                                  className="h-9 rounded-xl bg-white px-3 text-xs font-semibold text-ondjo-ink hover:bg-slate-100"
                                >
                                  Outro horário
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div
                        className={cn(
                          "mt-1 flex items-center justify-end gap-1 text-[11px] tabular-nums",
                          isUser ? "text-white/80" : "text-ondjo-muted",
                        )}
                      >
                        <span>{message.timestamp}</span>
                        {isUser && renderMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </m.div>
                );
              })}

              {/* Indicador Animado de Digitação */}
              <AnimatePresence>
                {activeChat.isTyping && (
                  <m.div
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.14 }}
                    className="mt-3 flex items-end gap-2.5"
                    aria-live="polite"
                  >
                    <div className="w-7 shrink-0">
                      {renderAvatar(activeChat, "size-7")}
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-[0_1px_3px_rgba(16,42,67,0.06)]">
                      {[0, 1, 2].map((dot) => (
                        <m.span
                          key={dot}
                          aria-hidden="true"
                          animate={
                            reduceMotion
                              ? undefined
                              : { y: [0, -3, 0], opacity: [0.45, 1, 0.45] }
                          }
                          transition={
                            reduceMotion
                              ? undefined
                              : {
                                  duration: 0.9,
                                  repeat: Infinity,
                                  delay: dot * 0.16,
                                  ease: "easeInOut",
                                }
                          }
                          className="size-1.5 rounded-full bg-ondjo-blue"
                        />
                      ))}
                      <span className="sr-only">
                        {activeChat.contactName} está a escrever...
                      </span>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Barra de Composição Limpa e Moderna (Sem Sugestões nem Bordas Excessivas) */}
          <div className="shrink-0 bg-white px-3.5 py-3 sm:px-6 sm:py-3.5 border-t border-ondjo-border/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl bg-ondjo-bg p-1.5 pl-4 transition-shadow duration-150 focus-within:bg-white focus-within:ring-2 focus-within:ring-ondjo-blue/25 focus-within:shadow-xs"
            >
              <Input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Escreva uma mensagem para ${activeChat.contactName}...`}
                className="h-10 flex-1 border-0 bg-transparent px-0 text-sm text-ondjo-ink shadow-none placeholder:text-ondjo-muted focus-visible:ring-0"
              />

              <Button
                type="submit"
                variant="primary"
                disabled={!inputText.trim()}
                className="h-10 min-w-10 shrink-0 rounded-xl px-4 text-sm font-bold"
                aria-label="Enviar mensagem"
              >
                <Send size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </form>
          </div>
        </main>
      </div>

      {/* Sheet Unificado de Detalhes do Imóvel (Desktop Direita / Mobile Bottom) */}
      <Sheet open={Boolean(activeProperty && propertySheetOpen)} onOpenChange={setPropertySheetOpen}>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className={cn(
            "p-0 overflow-hidden",
            isDesktop
              ? "w-full sm:max-w-md"
              : "max-h-[85dvh] rounded-t-3xl pb-safe",
          )}
        >
          {activeProperty && (
            <>
              <SheetHeader className="px-5 pt-5 pb-3 pr-14">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-ondjo-blue" />
                  <SheetTitle className="text-base font-bold text-ondjo-navy">
                    Imóvel em negociação
                  </SheetTitle>
                </div>
                <SheetDescription className="text-xs text-ondjo-muted">
                  Resumo rápido do anúncio associado a esta conversa
                </SheetDescription>
              </SheetHeader>

              <Separator className="bg-ondjo-border/60" />

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <img
                  src={activeProperty.images[0]}
                  alt={activeProperty.title}
                  className="aspect-video w-full rounded-2xl object-cover"
                />

                <div>
                  <p className="text-xl font-black text-ondjo-navy tabular-nums">
                    {formatKz(activeProperty.price, {
                      perMonth: activeProperty.purpose === "arrendamento",
                    })}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-ondjo-ink">
                    {activeProperty.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ondjo-muted">
                    <MapPin size={14} className="shrink-0 text-ondjo-blue" />
                    <span>
                      {activeProperty.neighborhood}, {activeProperty.city}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-ondjo-bg p-3.5 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-ondjo-muted">
                      Tipo
                    </span>
                    <span className="font-bold text-ondjo-navy">
                      {activeProperty.type}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-ondjo-muted">
                      Área
                    </span>
                    <span className="font-bold text-ondjo-navy tabular-nums">
                      {activeProperty.area} m²
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-ondjo-muted">
                      Quartos
                    </span>
                    <span className="font-bold text-ondjo-navy tabular-nums">
                      T{activeProperty.bedrooms}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-ondjo-muted">
                      Estacionamento
                    </span>
                    <span className="font-bold text-ondjo-navy tabular-nums">
                      {activeProperty.parking} vaga(s)
                    </span>
                  </div>
                </div>

                {activeProperty.features.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold text-ondjo-navy">
                      Comodidades
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProperty.features.map((feat) => (
                        <Badge key={feat} variant="secondary" size="xs">
                          {feat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={`#/imovel/${activeProperty.id}`}
                  className={cn(
                    buttonVariants({ variant: "primary", size: "md" }),
                    "w-full rounded-xl text-sm font-bold",
                  )}
                >
                  <span>Ver anúncio completo</span>
                  <ExternalLink size={15} />
                </a>
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
              <RotateCcw
                size={18}
                className="text-ondjo-blue"
                aria-hidden="true"
              />
              <AlertDialogTitle className="text-base font-black text-ondjo-navy">
                Restaurar conversas demo?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs leading-5 text-ondjo-muted">
              As mensagens enviadas nesta sessão serão substituídas pelas
              conversas de demonstração padrão do ONDJO.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mx-0 mb-0 rounded-none border-t border-ondjo-border-hairline bg-transparent px-0 pt-4 pb-0">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="primary"
              onClick={confirmResetConversations}
            >
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChatPage;
