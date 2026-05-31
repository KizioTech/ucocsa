import { useState, memo, Fragment, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Music, ChevronDown, ChevronUp, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ConfirmAction";

interface Hymn {
  id: number;
  title: string;
  author: string | null;
  category: string | null;
  verses: string[];
  youtube_id: string | null;
  first_line: string | null;
  bio: string | null;
}

const EMPTY_HYMN: Omit<Hymn, "id"> = {
  title: "",
  author: "",
  category: "",
  verses: [""],
  youtube_id: "",
  first_line: "",
  bio: "",
};

// ── Top-level form (memoized) — keeps inputs from losing focus on every keystroke ──
interface HymnFormProps {
  isNew: boolean;
  editHymn: Partial<Hymn>;
  setEditHymn: React.Dispatch<React.SetStateAction<Partial<Hymn> | null>>;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

const HymnForm = memo(({ isNew, editHymn, setEditHymn, onClose, onSave, saving }: HymnFormProps) => {
  const verseRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  const updateVerse = (idx: number, val: string) => {
    setEditHymn(prev => {
      if (!prev) return prev;
      const verses = [...(prev.verses || [])];
      verses[idx] = val;
      return { ...prev, verses };
    });
  };

  const insertChorusBreak = (idx: number) => {
    const el = verseRefs.current[idx];
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const separator = "\n \n";
    const newVal = before + separator + after;
    updateVerse(idx, newVal);
    // Restore cursor after separator
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + separator.length, start + separator.length);
    }, 0);
  };

  const addVerse = () => setEditHymn(prev => prev ? { ...prev, verses: [...(prev.verses || []), ""] } : prev);
  const removeVerse = (idx: number) => setEditHymn(prev =>
    prev ? { ...prev, verses: (prev.verses || []).filter((_, i) => i !== idx) } : prev
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl my-6 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-heading">{isNew ? "Add New Hymn" : `Edit Hymn #${editHymn.id}`}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Title *</label>
              <input
                value={editHymn.title || ""}
                onChange={e => setEditHymn(p => p ? { ...p, title: e.target.value } : p)}
                placeholder="Hymn title"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Author</label>
              <input
                value={editHymn.author || ""}
                onChange={e => setEditHymn(p => p ? { ...p, author: e.target.value } : p)}
                placeholder="Author name"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Category</label>
              <input
                value={editHymn.category || ""}
                onChange={e => setEditHymn(p => p ? { ...p, category: e.target.value } : p)}
                placeholder="e.g. Worship, Traditional, Praise"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">YouTube ID</label>
              <input
                value={editHymn.youtube_id || ""}
                onChange={e => setEditHymn(p => p ? { ...p, youtube_id: e.target.value } : p)}
                placeholder="e.g. YRPh9fymWu8 (the part after v=)"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">First Line</label>
            <input
              value={editHymn.first_line || ""}
              onChange={e => setEditHymn(p => p ? { ...p, first_line: e.target.value } : p)}
              placeholder="Opening line of the hymn"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Verses</label>
              <Button size="sm" variant="outline" onClick={addVerse} className="h-7 text-xs gap-1">
                <Plus size={12} /> Add Verse
              </Button>
            </div>
            <div className="space-y-3">
              {(editHymn.verses || []).map((verse, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-muted-foreground pt-2.5 w-14 shrink-0">Verse {idx + 1}</span>
                    <div className="flex-1 space-y-1">
                      <textarea
                        ref={el => { verseRefs.current[idx] = el; }}
                        value={verse}
                        onChange={e => updateVerse(idx, e.target.value)}
                        rows={4}
                        placeholder={`Type verse ${idx + 1} lyrics here. Use "Insert Chorus Break" to separate the chorus.`}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none font-mono leading-relaxed"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => insertChorusBreak(idx)}
                          className="text-[11px] px-2 py-0.5 rounded border border-primary/40 text-primary hover:bg-primary/10 transition-colors font-medium"
                        >
                          ↵ Insert Chorus Break
                        </button>
                        {verse.length > 400 && (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            ⚠ Long verse ({verse.length} chars) — consider splitting
                          </span>
                        )}
                      </div>
                    </div>
                    {(editHymn.verses || []).length > 1 && (
                      <button onClick={() => removeVerse(idx)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors mt-1">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tip: Place the cursor in a verse and click <strong>Insert Chorus Break</strong> to split verse / chorus. Each verse becomes its own card on the public page.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Composer Bio / Background</label>
            <textarea
              value={editHymn.bio || ""}
              onChange={e => setEditHymn(p => p ? { ...p, bio: e.target.value } : p)}
              rows={3}
              placeholder="Brief biography of the hymn composer or the story behind the hymn…"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onSave} disabled={saving || !editHymn.title}>
              {saving ? "Saving…" : isNew ? "Add Hymn" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
HymnForm.displayName = "HymnForm";

const AdminHymns = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editHymn, setEditHymn] = useState<Partial<Hymn> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tab, setTab] = useState<"all" | "pending">("all");

  const { data: hymns = [], isLoading } = useQuery({
    queryKey: ["admin-hymns"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("hymns").select("*").order("id");
      if (error) throw error;
      return data as Hymn[];
    },
  });

  const saveMut = useMutation({
    mutationFn: async (h: Partial<Hymn>) => {
      let nextId = h.id;
      if (isNew) {
        const { data: maxIdData } = await (supabase as any)
          .from("hymns")
          .select("id")
          .order("id", { ascending: false })
          .limit(1);
        nextId = maxIdData?.[0]?.id ? maxIdData[0].id + 1 : 1;
      }

      const payload = {
        ...(isNew ? { id: nextId } : {}),
        title: h.title || "",
        author: h.author || null,
        category: h.category || null,
        verses: h.verses?.filter(v => v.trim()) || [],
        youtube_id: h.youtube_id || null,
        first_line: h.first_line || null,
        bio: h.bio || null,
        is_approved: true,
      };
      if (isNew) {
        const { error } = await (supabase as any).from("hymns").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("hymns").update(payload).eq("id", h.id!);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hymns"] });
      qc.invalidateQueries({ queryKey: ["hymns"] });
      toast.success(isNew ? "Hymn added!" : "Hymn updated!");
      setEditHymn(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const approveMut = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await (supabase as any).from("hymns").update({ is_approved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hymns"] });
      qc.invalidateQueries({ queryKey: ["hymns"] });
      toast.success("Hymn approved and published.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await (supabase as any).from("hymns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hymns"] }); toast.success("Hymn deleted."); },
    onError: (e: any) => toast.error(e.message),
  });

  const openNew = () => { setIsNew(true); setEditHymn({ ...EMPTY_HYMN }); };
  const openEdit = (h: Hymn) => { setIsNew(false); setEditHymn({ ...h }); };
  const closeForm = () => setEditHymn(null);

  const visibleHymns = hymns.filter((h: any) => tab === "pending" ? !h.is_approved : true);
  const pendingCount = hymns.filter((h: any) => !h.is_approved).length;

  const filtered = visibleHymns.filter(h =>
    !search ||
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    (h.author || "").toLowerCase().includes(search.toLowerCase()) ||
    h.id.toString() === search
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
              <Music className="text-primary" size={22} /> Hymn Library
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {hymns.length} hymns in database{pendingCount > 0 && ` · ${pendingCount} pending approval`}
            </p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus size={16} /> Add Hymn
          </Button>
        </div>

        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All Hymns
          </button>
          <button
            onClick={() => setTab("pending")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
              tab === "pending" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock size={14} /> Pending Approval
            {pendingCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, author, or hymn number…"
          className="w-full max-w-sm px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-12">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">Author</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Verses</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 bg-muted/60 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      {tab === "pending" ? "No pending submissions." : "No hymns match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map(hymn => (
                    <Fragment key={hymn.id}>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-primary font-semibold">{hymn.id}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedId(expandedId === hymn.id ? null : hymn.id)}
                            className="font-medium text-left hover:text-primary transition-colors flex items-center gap-1"
                          >
                            {hymn.title}
                            {!(hymn as any).is_approved && (
                              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Pending</span>
                            )}
                            {expandedId === hymn.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <p className="text-xs text-muted-foreground italic truncate max-w-xs">{hymn.first_line}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{hymn.author || "—"}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {hymn.category && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">{hymn.category}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{hymn.verses.length}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!(hymn as any).is_approved && (
                              <button
                                onClick={() => approveMut.mutate(hymn.id)}
                                title="Approve and publish"
                                className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button onClick={() => openEdit(hymn)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <Pencil size={14} />
                            </button>
                            <ConfirmAction onConfirm={() => deleteMut.mutate(hymn.id)} description={`Delete "${hymn.title}"?`}>
                              <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </ConfirmAction>
                          </div>
                        </td>
                      </tr>
                      {expandedId === hymn.id && (
                        <tr className="bg-muted/20">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="space-y-3 max-w-2xl">
                              {hymn.verses.map((v, i) => {
                                const parts = v.split(/\n \n/);
                                return (
                                  <div key={i}>
                                    <div className="text-xs font-semibold text-primary mb-1">Verse {i + 1}</div>
                                    <div className="text-sm text-muted-foreground">
                                      <p className="whitespace-pre-line">{parts[0]}</p>
                                      {parts.length > 1 && (
                                        <p className="mt-2 pl-3 border-l-2 border-primary italic text-primary/80 whitespace-pre-line text-xs">
                                          {parts.slice(1).join("\n \n")}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              {hymn.bio && <p className="text-xs text-muted-foreground border-t border-border pt-3 mt-3 italic">{hymn.bio}</p>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editHymn && (
        <HymnForm
          isNew={isNew}
          editHymn={editHymn}
          setEditHymn={setEditHymn}
          onClose={closeForm}
          onSave={() => saveMut.mutate(editHymn)}
          saving={saveMut.isPending}
        />
      )}
    </AdminLayout>
  );
};

export default AdminHymns;
