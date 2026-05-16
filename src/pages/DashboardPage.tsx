import React, { useEffect, useState } from "react";
import { Card, Badge } from "../components/UI.tsx";
import api from "../api/client.ts";
import { 
  Briefcase as Project, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { motion } from "motion/react";

const StatCard = ({ label, value, icon: Icon, color, trend }: { label: string, value: number | string, icon: any, color: "indigo" | "blue" | "emerald" | "red", trend?: string }) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <Card className={trend === "danger" ? "border-red-100" : "hover:border-indigo-200 transition-colors"}>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <h3 className={`text-3xl font-extrabold ${trend === "danger" ? "text-red-500" : "text-slate-800"}`}>{value}</h3>
          {trend && (
            <p className={`text-[11px] font-bold mt-1 ${trend === "danger" ? "text-red-500" : "text-emerald-500"} flex items-center gap-1`}>
              {trend === "danger" ? <AlertCircle size={12} /> : <TrendingUp size={12} />}
              {trend === "danger" ? "Action required" : "+4.2% increase"}
            </p>
          )}
          {!trend && <p className="text-[11px] font-medium text-slate-500 mt-1">Updated just now</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
    </Card>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-20 w-64 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-slate-200 rounded-xl" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Hello, {user?.name}! 👋</h1>
        <p className="text-slate-500 font-medium">Your workspace overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Projects" value={stats.projectCount} icon={Project} color="indigo" />
        <StatCard label="Active Tasks" value={stats.taskCount} icon={CheckSquare} color="blue" />
        <StatCard label="Completed" value={`${stats.completionPercentage}%`} icon={TrendingUp} color="emerald" trend="success" />
        <StatCard label="Overdue Tasks" value={stats.overdueTasks || "03"} icon={AlertCircle} color="red" trend={stats.overdueTasks > 0 ? "danger" : "danger"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Tasks */}
        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Priority Work</h2>
            <Link to="/tasks" className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
              Launch Task Board <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-50">
            {stats.recentTasks.map((task: any) => (
              <div key={task.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'} transition-colors`}>
                    <CheckSquare size={18} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{task.project.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge color={task.priority === "HIGH" ? "red" : task.priority === "MEDIUM" ? "yellow" : "gray"}>
                    {task.priority}
                  </Badge>
                  <div className="hidden sm:flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">
                      {user?.name?.charAt(0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {stats.recentTasks.length === 0 && (
              <div className="p-12 text-center text-slate-400 italic">
                No active tasks found.
              </div>
            )}
          </div>
        </Card>

        {/* Global Progress */}
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Pulse</h2>
          </div>
          <div className="p-8 text-center space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle 
                  className="text-slate-100" 
                  strokeWidth="10" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="64" cx="72" cy="72" 
                />
                <motion.circle 
                  initial={{ strokeDashoffset: 402 }}
                  animate={{ strokeDashoffset: 402 - (402 * stats.completionPercentage) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-indigo-600" 
                  strokeWidth="10" 
                  strokeDasharray={402} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="64" cx="72" cy="72" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-slate-800">{stats.completionPercentage}%</span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">Project Load</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-500 px-4 leading-relaxed">
                You've achieved <span className="font-bold text-indigo-600">{stats.completedTasks}</span> milestones across <span className="font-bold text-slate-800">{stats.projectCount}</span> active initiatives.
              </p>
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-extrabold text-slate-800">{stats.taskCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Tasks</p>
                </div>
                <div className="text-center">
                   <p className="text-lg font-extrabold text-emerald-500">{stats.completedTasks}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
