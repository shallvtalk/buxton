import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Bell,
  Brain,
  CalendarClock,
  CheckSquare,
  Command,
  LogOut,
  type LucideIcon,
  MessageSquare,
  NotebookPen,
  Search,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { Logo } from "./Logo";
import { ConversationList } from "./ConversationList";
import { NotificationCenter } from "./NotificationCenter";
import { Dialog, Input } from "./ui";
import { useKeyboardOpenFlag } from "../hooks/keyboard";
import { useSession } from "../hooks/session";
import { useConversations, useNotifications, useSettings } from "../hooks/queries";
import { cn } from "../lib/utils";
import { type MessageKey, useI18n } from "../lib/i18n";

type NavKey = Extract<MessageKey, `nav.${string}`>;
const NAV: readonly { to: string; label: NavKey; mobileLabel?: NavKey; icon: LucideIcon }[] = [
  { to: "/chat", label: "nav.chat", icon: MessageSquare },
  { to: "/tasks", label: "nav.tasks", icon: CheckSquare },
  { to: "/notes", label: "nav.notes", icon: NotebookPen },
  { to: "/memory", label: "nav.memory", icon: Brain },
  { to: "/automations", label: "nav.automations", mobileLabel: "nav.automationsShort", icon: CalendarClock },
];

export function AppShell() {
  const { t } = useI18n();
  const { logout } = useSession();
  const settings = useSettings();
  const notifications = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useKeyboardOpenFlag();
  const location = useLocation();
  const unread = notifications.data?.unread ?? 0;
  const agentName = settings.data?.agentName ?? "Buxton";
  const isChat = location.pathname.startsWith("/chat");
  const conversationId = isChat ? location.pathname.split("/")[2] : undefined;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const bell = (
    <button
      type="button"
      onClick={() => setNotifOpen(true)}
      className="relative rounded-lg p-2 text-fg-muted transition-colors hover:bg-muted hover:text-fg"
      aria-label={unread ? t("notifications.titleUnread", { count: unread }) : t("notifications.title")}
    >
      <Bell className="h-[18px] w-[18px]" />
      {unread > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-fg">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );

  return (
    <div className="buxton-shell flex h-full">
      <a href="#workspace" className="skip-link">
        Skip to workspace
      </a>
      <aside className="workspace-sidebar hidden w-[264px] shrink-0 flex-col border-r border-border bg-subtle md:flex">
        <NavLink to="/chat" aria-label="Buxton home" className="flex items-center gap-3 px-6 pb-7 pt-8">
          <Logo className="h-9 w-9" />
          <div>
            <span className="brand-wordmark block text-[22px] leading-6">
              Buxton<span className="text-accent">.</span>
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-fg-muted">Personal workspace</span>
          </div>
        </NavLink>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="mx-4 mb-6 flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2.5 text-xs text-fg-muted hover:border-border-strong"
          aria-label="Search workspace"
        >
          <Search className="h-3.5 w-3.5" /> Find your way{" "}
          <kbd className="ml-auto flex items-center gap-0.5 text-[10px]">
            <Command className="h-3 w-3" /> K
          </kbd>
        </button>
        <div className="px-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">Workspace</div>
        <nav className="space-y-1 px-3" aria-label={t("nav.main")}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "workspace-nav flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                  isActive ? "is-active bg-accent-soft text-accent" : "text-fg-muted hover:bg-muted hover:text-fg",
                )
              }
            >
              <Icon className="h-[17px] w-[17px]" />
              {t(label)}
            </NavLink>
          ))}
        </nav>
        <div className="mt-7 flex min-h-0 flex-1 flex-col">
          <div className="px-6 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">Conversations</div>
          <ConversationList activeId={conversationId} onNavigate={() => {}} />
        </div>
        <div className="sidebar-account mx-3 mb-3 mt-2 rounded-xl border border-border bg-surface/70 p-2">
          <div className="flex items-center gap-2.5 px-1 pb-2 pt-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
              {agentName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{agentName}</p>
              <p className="mt-0.5 text-[10px] text-fg-muted">Your personal agent</p>
            </div>
            {bell}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-1">
            <NavLink to="/settings" className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-fg-muted hover:bg-muted">
              <Settings className="h-3.5 w-3.5" />
              {t("nav.settings")}
            </NavLink>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-md p-2 text-fg-muted hover:bg-muted"
              aria-label={t("nav.lock")}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg px-4 md:hidden">
          <NavLink to="/chat" className="flex items-center gap-2" aria-label="Buxton home">
            <Logo className="h-7 w-7" />
            <span className="brand-wordmark text-xl">Buxton.</span>
          </NavLink>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-fg-muted"
              aria-label="Search workspace"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            {bell}
            <NavLink to="/settings" className="rounded-lg p-2 text-fg-muted" aria-label={t("nav.settings")}>
              <Settings className="h-[18px] w-[18px]" />
            </NavLink>
          </div>
        </header>
        <main
          id="workspace"
          tabIndex={-1}
          className={cn("workspace-main min-h-0 flex-1", isChat ? "overflow-hidden" : "overflow-y-auto pb-20 md:pb-0")}
        >
          <Outlet />
        </main>
        <nav
          aria-label={t("nav.main")}
          className="mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          {NAV.map(({ to, label, mobileLabel, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium",
                  isActive ? "text-accent" : "text-fg-muted",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {t(mobileLabel ?? label)}
            </NavLink>
          ))}
        </nav>
      </div>
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
      <WorkspaceSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function WorkspaceSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  // This palette searches already-loaded conversation titles; the full history search remains in the sidebar.
  const conversations = useConversations();
  const items = [
    ...NAV.map((item) => ({ title: t(item.label), to: item.to, icon: item.icon, type: "Workspace" })),
    { title: t("nav.settings"), to: "/settings", icon: Settings, type: "Workspace" },
    ...(conversations.data ?? []).map((item) => ({ title: item.title, to: `/chat/${item.id}`, icon: MessageSquare, type: "Conversation" })),
  ]
    .filter((item) => item.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
    .slice(0, 12);
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Find your way">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Pages and conversations…"
        aria-label="Search pages and conversations"
        autoFocus
      />
      <div className="mt-3 space-y-1">
        {items.map(({ title, to, icon: Icon, type }) => (
          <button
            type="button"
            key={to}
            onClick={() => {
              navigate(to);
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-muted"
          >
            <Icon className="h-4 w-4 shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{title}</span>
              <span className="text-[10px] text-fg-muted">{type}</span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-fg-subtle" />
          </button>
        ))}
        {!items.length && (
          <p role="status" className="px-3 py-6 text-sm text-fg-muted">
            No matching pages or conversations.
          </p>
        )}
      </div>
    </Dialog>
  );
}
