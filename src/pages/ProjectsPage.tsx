import React, { useEffect, useState } from "react";
import { Card, Button, Badge } from "../components/UI.tsx";
import api from "../api/client.ts";
import { Plus, Users, Folder, ChevronRight, Search, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 bg-slate-200 rounded" />
        <div className="h-10 w-32 bg-slate-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-slate-200 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Project Portfolio</h1>
          <p className="text-slate-500 font-medium">Strategic overview of all team initiatives.</p>
        </div>
        {user?.role === "ADMIN" && (
          <Link to="/projects/new">
            <Button size="lg" className="shadow-lg shadow-indigo-100">
              <Plus size={20} strokeWidth={2.5} />
              Launch Project
            </Button>
          </Link>
        )}
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Filter initiatives by keyword..." 
          className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} className="block h-full">
            <Card className="h-full hover:border-indigo-500 transition-all cursor-pointer group relative overflow-hidden flex flex-col p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Briefcase size={24} strokeWidth={2.5} />
                </div>
                <Badge color="indigo" className="bg-slate-50 text-slate-400 border border-slate-100 font-bold">
                  {p.members.length} MEMBERS
                </Badge>
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors tracking-tight">{p.title}</h3>
              <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-8 h-10 leading-relaxed">{p.description}</p>
              
              <div className="mt-auto pt-6 border-t border-slate-50">
                <div className="flex justify-between items-end mb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Momentum</p>
                  <p className="text-sm font-extrabold text-slate-800">{p.progress}%</p>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-700 ease-out" 
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {p._count.tasks} Total Tasks
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                    <ChevronRight size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-24 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <Folder size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No active portfolios</h3>
            <p className="text-sm font-medium text-slate-500 mt-2">Scale your team by initiating your first project.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
