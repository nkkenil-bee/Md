import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import api from "../api/client.ts";
import { Button, Card, Input, Select } from "../components/UI.tsx";
import { FolderKanban, AlertCircle } from "lucide-react";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/signup", formData);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-6 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
            <FolderKanban size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-slate-500 font-medium mt-1">Join SyncTeam workspace today</p>
        </div>

        <Card className="shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 font-bold flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
              <Input 
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Work Email Address</label>
              <Input 
                type="email" 
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
              <Input 
                type="password" 
                placeholder="Secure password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Role</label>
              <Select 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="MEMBER">Team Member</option>
                <option value="ADMIN">Project Admin</option>
              </Select>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Initializing..." : "Create Workspace"}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
