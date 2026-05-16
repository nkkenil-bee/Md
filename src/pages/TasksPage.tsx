import React, { useEffect, useState } from "react";
import { Card, Button, Badge, Select } from "../components/UI.tsx";
import api from "../api/client.ts";
import { CheckSquare, AlertCircle, Search, Filter, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { motion } from "motion/react";

const TasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "ALL", priority: "ALL", overdue: false });
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const statusMatch = filter.status === "ALL" || t.status === filter.status;
    const priorityMatch = filter.priority === "ALL" || t.priority === filter.priority;
    const overdueMatch = !filter.overdue || (t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < new Date());
    const searchMatch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      t.project.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && priorityMatch && overdueMatch && searchMatch;
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "HIGH": return "red";
      case "MEDIUM": return "yellow";
      case "LOW": return "blue";
      default: return "gray";
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "COMPLETED": return "green";
      case "IN_PROGRESS": return "blue";
      case "TODO": return "gray";
      default: return "gray";
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
      {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-200 animate-pulse rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Active Tasks</h1>
        <p className="text-slate-500 font-medium">Track and manage your team's mission-critical work.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by task title or project..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select 
            className="w-auto min-w-[140px] font-medium" 
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </Select>

          <Select 
            className="w-auto min-w-[140px] font-medium"
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </Select>

          <Button 
            variant={filter.overdue ? "danger" : "secondary"}
            onClick={() => setFilter({ ...filter, overdue: !filter.overdue })}
            className="whitespace-nowrap"
          >
            {filter.overdue ? "Show All Tasks" : "Filter Overdue"}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Task Description</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.map((t) => {
                const isOverdue = t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < new Date();
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'} transition-colors`}>
                          <CheckSquare size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className={`font-bold text-slate-800 tracking-tight ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>{t.title}</div>
                          {t.assignedTo && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Owner: {t.assignedTo.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Badge color="indigo">
                        {t.project.title}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <Badge color={getPriorityColor(t.priority)}>{t.priority}</Badge>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`text-sm font-medium flex items-center gap-1.5 ${isOverdue ? "text-red-500 font-extrabold" : "text-slate-500"}`}>
                        {isOverdue && <AlertCircle size={14} />}
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No Deadline'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge color={getStatusColor(t.status)}>{t.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status !== "COMPLETED" && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusUpdate(t.id, t.status === "TODO" ? "IN_PROGRESS" : "COMPLETED")}
                          >
                            {t.status === "TODO" ? "Accept" : "Complete"}
                          </Button>
                        )}
                        {t.status === "COMPLETED" && (
                          <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(t.id, "IN_PROGRESS")}>
                            Reopen
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="text-center py-24 text-slate-400 bg-slate-50/20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-300 mb-4">
                <CheckSquare size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Clear Canvas</h3>
              <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto mt-2">No tasks found matching your current filters. Try relaxing your constraints.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TasksPage;
