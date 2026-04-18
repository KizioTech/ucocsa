import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface MemberRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  faculty: string | null;
  year_of_study: number | null;
  interests: string[] | null;
  created_at: string;
}

const AdminMembers = () => {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setMembers(data);
    };
    fetchMembers();
  }, []);

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
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No members found.</td></tr>
                )}
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{m.full_name}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMembers;
