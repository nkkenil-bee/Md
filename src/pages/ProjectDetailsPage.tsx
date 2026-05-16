import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Button, Badge, Input, Select } from "../components/UI.tsx";
import api from "../api/client.ts";
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Trash2, 
  Settings, 
  CheckCircle2, 
  Circle,
  TrendingUp,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [selectedUser, setSelectedUser] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" });

  useEffect(() => {
    fetchProject();
    if (user?.role === "ADMIN") fetchAllUsers();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error("Error fetching project:", err);
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await api.get("/users");
      setAllUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    try {
      await api.post(`/projects/${id}/members`, { userId: selectedUser });
      fetchProject();
      setShowMemberModal(false);
      setSelectedUser("");
    } catch (err) {
      alert("Error adding member");
    }
  };

  const handleCreateTask = async () => {
    try {
      await api.post("/tasks", { ...newTask, projectId: id });
      fetchProject();
      setShowTaskModal(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" });
    } catch (err) {
      alert("Error creating task");
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate("/projects");
    } catch (err) {
      alert("Error deleting project");
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchProject();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="h-8 w-48 bg-gray-200 rounded" />
    <div className="h-64 bg-gray-200 rounded-xl" />
  </div>;

  return (
    <div className="space-y-8">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <Badge color="indigo">Active</Badge>
          </div>
          <p className="text-gray-500 text-lg max-w-2xl">{project.description}</p>
        </div>
        
        {user?.role === "ADMIN" && (
          <div className="flex gap-3">
            <Button variant="secondary" size="md">
              <Settings size={18} /> Edit
            </Button>
            <Button variant="danger" size="md" onClick={handleDeleteProject}>
              <Trash2 size={18} /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Project Tasks</h2>
                <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {project.tasks.length}
                </span>
              </div>
              {user?.role === "ADMIN" && (
                <Button size="sm" onClick={() => setShowTaskModal(true)}>
                  <Plus size={16} /> Add Task
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {project.tasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-200 bg-gray-50/50 transition-all group">
                  <button 
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className={`shrink-0 transition-colors ${task.status === "COMPLETED" ? "text-green-500" : "text-gray-400 hover:text-purple-500"}`}
                  >
                    {task.status === "COMPLETED" ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-gray-900 truncate ${task.status === "COMPLETED" ? "line-through opacity-50" : ""}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users size={12} /> {task.assignedTo?.name || 'Unassigned'}
                      </span>
                      {task.dueDate && (
                        <span className={`text-xs flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? "text-red-500 font-bold" : "text-gray-400"}`}>
                          <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge color={task.priority === "HIGH" ? "red" : task.priority === "MEDIUM" ? "yellow" : "gray"}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
              {project.tasks.length === 0 && (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p>No tasks created yet.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-purple-600" size={18} /> Progress
            </h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-gray-900">{project.progress}%</span>
              <span className="text-sm text-gray-500">
                {project.tasks.filter((t: any) => t.status === 'COMPLETED').length} / {project.tasks.length} tasks
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-700" 
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-purple-600" size={18} /> Team Members
              </h3>
              {user?.role === "ADMIN" && (
                <button 
                  onClick={() => setShowMemberModal(true)}
                  className="p-1 hover:bg-purple-50 text-purple-600 rounded transition-colors"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {project.members.map((m: any) => (
                <div key={m.userId} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {m.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.user.name}</p>
                      <p className="text-[10px] text-gray-500 tracking-tighter uppercase">{m.user.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Add Team Member</h3>
            <Select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              className="mb-6"
            >
              <option value="">Select a user...</option>
              {allUsers.filter(u => !project.members.some((pm: any) => pm.userId === u.id)).map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </Select>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowMemberModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddMember} disabled={!selectedUser}>Add</Button>
            </div>
          </Card>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">Create New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <Input 
                  placeholder="e.g. Design homepage" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <Select 
                  value={newTask.assignedToId} 
                  onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {project.members.map((m: any) => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <Select 
                    value={newTask.priority} 
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <Input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} 
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleCreateTask} disabled={!newTask.title}>Create Task</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Simple Project Creation Page
export const CreateProjectPage = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/projects", formData);
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      alert("Error creating project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors">
        <ArrowLeft size={16} /> Back to Projects
      </Link>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Project</h1>
        <p className="text-gray-500">Kick off a new initiative with your team.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Title</label>
            <Input 
              placeholder="e.g. Q3 Marketing Campaign"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea 
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-sans min-h-[120px]"
              placeholder="Describe the goals and scope of this project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-50">
            <Button variant="secondary" className="flex-1" type="button" onClick={() => navigate("/projects")}>Cancel</Button>
            <Button className="flex-1" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProjectDetailsPage;
