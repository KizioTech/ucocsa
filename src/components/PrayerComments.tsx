import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  parentId: string;
  type: "prayer" | "praise";
}

const PrayerComments = ({ parentId, type }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const qk = [type + "_comments", parentId];

  const { data: comments = [] } = useQuery({
    queryKey: qk,
    queryFn: async () => {
      if (type === "prayer") {
        const { data } = await supabase
          .from("prayer_comments")
          .select("*, profiles(full_name, avatar_url)")
          .eq("prayer_id", parentId)
          .order("created_at", { ascending: true });
        return data || [];
      } else {
        const { data } = await supabase
          .from("praise_comments")
          .select("*, profiles(full_name, avatar_url)")
          .eq("praise_id", parentId)
          .order("created_at", { ascending: true });
        return data || [];
      }
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!user) { toast.error("Sign in to comment"); return; }
      if (type === "prayer") {
        const { error } = await supabase.from("prayer_comments").insert({
          prayer_id: parentId, user_id: user.id, content: text.trim(),
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("praise_comments").insert({
          praise_id: parentId, user_id: user.id, content: text.trim(),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: qk });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      if (type === "prayer") {
        await supabase.from("prayer_comments").delete().eq("id", id);
      } else {
        await supabase.from("praise_comments").delete().eq("id", id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk }),
  });

  return (
    <div className="mt-3 space-y-2">
      {comments.map((c: any) => (
        <div key={c.id} className="flex gap-2 items-start">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={c.profiles?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
              {(c.profiles?.full_name || "U")[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">{c.profiles?.full_name || "Anonymous"}</span>
              <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
              {c.user_id === user?.id && (
                <button onClick={() => deleteComment.mutate(c.id)} className="text-muted-foreground hover:text-destructive ml-auto">
                  <Trash2 size={10} />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{c.content}</p>
          </div>
        </div>
      ))}
      {user && (
        <div className="flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            rows={1}
            className="text-xs min-h-[32px] flex-1"
          />
          <Button size="sm" variant="ghost" disabled={!text.trim()} onClick={() => addComment.mutate()}>
            <Send size={12} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PrayerComments;
