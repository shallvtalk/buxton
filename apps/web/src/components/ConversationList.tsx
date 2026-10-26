import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Conversation } from "@talorys/shared";
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button, ConfirmDialog, Dialog, ErrorNotice, Input, Spinner } from "./ui";
import { useApiMutation, useConversations } from "../hooks/queries";
import { api } from "../lib/api";
import { cn, relativeTime } from "../lib/utils";
import { useI18n } from "../lib/i18n";

export function ConversationList({ activeId, onNavigate }: { activeId?: string; onNavigate: () => void }) {
  const i18n = useI18n();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const list = useConversations(debounced || undefined);
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState<Conversation | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const rename = useApiMutation(
    (v: { id: string; title: string }) => api(`/conversations/${v.id}`, { method: "PATCH", body: { title: v.title } }),
    { invalidate: [["conversations"], ["conversation"]], onSuccess: () => setRenaming(null) },
  );
  const remove = useApiMutation((id: string) => api(`/conversations/${id}`, { method: "DELETE" }), {
    invalidate: [["conversations"]],
    success: "Conversation deleted",
    onSuccess: (_r, id) => {
      setDeleting(null);
      if (id === activeId) navigate("/chat");
    },
  });

  return (
    <div className="conversation-list flex h-full min-h-0 flex-col">
      <div className="space-y-3 px-3 pb-3">
        <Button
          variant="primary"
          className="new-conversation w-full justify-start"
          onClick={() => {
            navigate("/chat");
            onNavigate();
          }}
        >
          <Plus className="h-4 w-4" /> New conversation
        </Button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search history"
            className="h-9 pl-9 text-sm"
            aria-label="Search conversations"
          />
        </div>
      </div>
      <nav className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2 pb-3" aria-label="Conversations">
        {list.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : list.isError ? (
          <ErrorNotice error={list.error} onRetry={() => void list.refetch()} />
        ) : !list.data?.length ? (
          <p className="px-3 py-6 text-center text-sm text-fg-subtle">{debounced ? "No matches." : "No conversations yet."}</p>
        ) : (
          <ul className="space-y-0.5">
            {list.data.map((c) => (
              <li key={c.id} className="group relative">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/chat/${c.id}`);
                    onNavigate();
                  }}
                  className={cn(
                    "flex w-full flex-col rounded-lg px-3 py-2 pr-9 text-left transition-colors",
                    c.id === activeId ? "bg-muted text-fg" : "text-fg-muted hover:bg-muted/60 hover:text-fg",
                  )}
                >
                  <span className="truncate text-sm">{c.title}</span>
                  <span className="text-xs text-fg-subtle">{relativeTime(c.updated_at, i18n)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenu(menu === c.id ? null : c.id)}
                  className="absolute right-1.5 top-2 rounded-md p-1 text-fg-subtle opacity-100 hover:bg-border hover:text-fg md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                  aria-label={`Options for ${c.title}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menu === c.id && (
                  <div
                    className="absolute right-1 top-9 z-10 w-36 rounded-lg border border-border bg-surface py-1 shadow-lg animate-fade-in"
                    onMouseLeave={() => setMenu(null)}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                      onClick={() => {
                        setTitle(c.title);
                        setRenaming(c);
                        setMenu(null);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Rename
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-danger hover:bg-danger-soft"
                      onClick={() => {
                        setDeleting(c);
                        setMenu(null);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>

      <Dialog
        open={!!renaming}
        onClose={() => setRenaming(null)}
        title="Rename conversation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => renaming && title.trim() && rename.mutate({ id: renaming.id, title: title.trim() })}
              loading={rename.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (renaming && title.trim()) rename.mutate({ id: renaming.id, title: title.trim() });
          }}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus aria-label="Title" />
        </form>
      </Dialog>
      <ConfirmDialog
        open={!!deleting}
        title="Delete conversation?"
        message={`“${deleting?.title}” and all its messages will be permanently deleted.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        loading={remove.isPending}
      />
    </div>
  );
}
