import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Send, Plus, Users, ArrowLeft, Search,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface Conversation {
  id: string;
  type: string;
  title: string | null;
  created_at: string;
  last_message?: string;
  participant_names?: string[];
}

interface Message {
  id: string;
  content: string;
  sender_id: string | null;
  created_at: string;
  sender_name?: string;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchConversations();
  }, [user, authLoading]);

  useEffect(() => {
    if (!activeConvo) return;

    const channel = supabase
      .channel(`messages_convo_${activeConvo.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvo.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", activeConvo.id] });
          fetchMessages(activeConvo.id);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user!.id);

    if (!participations?.length) {
      setLoading(false);
      return;
    }

    const convoIds = participations.map((p) => p.conversation_id);
    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convoIds)
      .order("updated_at", { ascending: false });

    setConversations(convos || []);
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at");

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvo || !user) return;
    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: activeConvo.id,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  const startNewConversation = async () => {
    if (!searchEmail.trim() || !user) return;

    // Look up profile securely via RPC
    const { data: match, error: searchError } = await supabase
      .rpc('search_users', { search_term: searchEmail })
      .limit(1)
      .maybeSingle();

    if (!match || searchError) {
      toast({ title: "User not found", description: "Try searching by name.", variant: "destructive" });
      return;
    }

    // Create conversation
    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .insert({ type: "direct", title: null, created_by: user.id })
      .select()
      .single();

    if (convoError || !convo) {
      toast({ title: "Error creating conversation", variant: "destructive" });
      return;
    }

    // Add participants
    await supabase.from("conversation_participants").insert([
      { conversation_id: convo.id, user_id: user.id },
      { conversation_id: convo.id, user_id: match.id },
    ]);

    setDialogOpen(false);
    setSearchEmail("");
    await fetchConversations();
    setActiveConvo({ ...convo, participant_names: [match.full_name || "User"] });
  };

  const createPrayerGroup = async () => {
    if (!user) return;
    const { data: convo } = await supabase
      .from("conversations")
      .insert({ type: "prayer_group", title: "Prayer Group Chat", created_by: user.id })
      .select()
      .single();

    if (convo) {
      await supabase.from("conversation_participants").insert({
        conversation_id: convo.id,
        user_id: user.id,
      });
      await fetchConversations();
      setActiveConvo(convo);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4 min-h-[600px]">
            {/* Conversations list */}
            <Card className={`md:col-span-1 ${activeConvo ? "hidden md:block" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary" /> Chats
                  </CardTitle>
                  <div className="flex gap-1">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Plus size={18} /></Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>New Conversation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Search by name</label>
                            <div className="flex gap-2">
                              <Input
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                placeholder="Enter user's name"
                                onKeyDown={(e) => e.key === "Enter" && startNewConversation()}
                              />
                              <Button onClick={startNewConversation}>
                                <Search size={16} />
                              </Button>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <Button variant="outline" className="w-full" onClick={() => { createPrayerGroup(); setDialogOpen(false); }}>
                              <Users size={16} /> Create Prayer Group
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No conversations yet. Start one!
                  </p>
                ) : (
                  conversations.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => setActiveConvo(convo)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                        activeConvo?.id === convo.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                          {convo.type === "prayer_group" ? "P" : convo.type === "group" ? "G" : "D"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {convo.title || (convo.type === "direct" ? "Direct Message" : "Group Chat")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">{convo.type}</Badge>
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Chat area */}
            <Card className={`md:col-span-2 flex flex-col ${!activeConvo ? "hidden md:flex" : ""}`}>
              {activeConvo ? (
                <>
                  <CardHeader className="pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setActiveConvo(null)}
                      >
                        <ArrowLeft size={18} />
                      </Button>
                      <div>
                        <CardTitle className="text-lg">
                          {activeConvo.title || (activeConvo.type === "direct" ? "Direct Message" : "Group Chat")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground capitalize">{activeConvo.type.replace("_", " ")}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
                    {messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                                isMe
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {format(new Date(msg.created_at), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </CardContent>
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      />
                      <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Select a conversation or start a new one</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Messages;
