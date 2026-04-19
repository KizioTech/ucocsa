import { useEffect, useState } from "react";
import { Download, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MemberRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  faculty: string | null;
  year_of_study: number | null;
  interests: string[] | null;
  created_at: string;
  user_roles?: { role: string }[];
}

const AdminMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [search, setSearch] = useState("");

  const fetchMembers = async () => {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load members: " + error.message);
      return;
    }
    
    if (profiles) {
      const { data: roles } = await supabase.from("user_roles").select("*");
      const mapped = profiles.map((p: any) => ({
        ...p,
        user_roles: roles?.filter((r) => r.user_id === p.id) || [],
      }));
      setMembers(mapped);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const toggleAdminRole = async (memberId: string, currentIsAdmin: boolean) => {
    if (memberId === user?.id) {
      toast.error("You cannot change your own role!");
      return;
    }

    try {
      if (currentIsAdmin) {
        // Revoke admin
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", memberId)
          .eq("role", "admin");
        if (error) throw error;
        toast.success("Admin privileges revoked");
      } else {
        // Grant admin
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: memberId, role: "admin" });
        if (error) throw error;
        toast.success("Admin privileges granted");
      }
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const filtered = members.filter(
    (m) =>
      (m.full_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (m.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (m.faculty?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Faculty", "Year", "Interests", "Registered"];
    const rows = members.map((m) => [
      m.full_name || "", m.email || "", m.phone || "", m.faculty || "",
      String(m.year_of_study || ""), (m.interests || []).join("; "), new Date(m.created_at).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ucocsa-members.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-heading text-foreground">Members ({members.length})</h1>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-gold-dark transition-colors">
            <Download size={16} /> Export CSV
          </button>
        </div>

        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm mb-6 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Faculty</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Year</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Interests</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Registered</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No members found.</td></tr>
                )}
                {filtered.map((m) => {
                  const isAdmin = m.user_roles?.some(r => r.role === 'admin') || false;
                  const isSelf = m.id === user?.id;

                  return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {m.full_name}
                        {isAdmin && <ShieldCheck size={14} className="text-primary" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.faculty || "Not set"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.year_of_study || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(m.interests || []).map((i) => (
                          <span key={i} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{i}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Admin</span>
                      ) : (
                        <button
                          onClick={() => toggleAdminRole(m.id, isAdmin)}
                          className={`flex items-center gap-1 ml-auto text-xs px-2 py-1 rounded transition-colors ${
                            isAdmin 
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20" 
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                        >
                          {isAdmin ? <ShieldAlert size={14} /> : <Shield size={14} />}
                          {isAdmin ? "Revoke Admin" : "Make Admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMembers;
