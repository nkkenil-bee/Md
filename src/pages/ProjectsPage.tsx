import React, { useEffect, useState } from "react";
import { Card, Button, Badge } from "../components/UI.tsx";
import api from "../api/client.ts";
import { Plus, Users, Folder, ChevronRight, Search } from "lucide-react";
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

  if (loading) return <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage and track your team's initiatives.</p>
        </div>
        {user?.role === "ADMIN" && (
          <Link to="/projects/new">
            <Button>
              <Plus size={20} />
              Create Project
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search projects..." 
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`}>
            <Card className="h-full hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Folder size={24} />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                  <Users size={14} />
                  {p.members.length} members
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{p.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">{p.description}</p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span>Progress</span>
                  <span className="font-bold text-gray-900">{p.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-500" 
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                <span className="text-xs text-gray-400">
                  {p._count.tasks} tasks total
                </span>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <Folder size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
            <p className="text-gray-500">Get started by creating your first project.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
