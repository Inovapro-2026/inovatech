import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleRoute, AdminRoute } from "@/components/auth/RoleRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import MarketplaceIndex from "./pages/marketplace/Index";
import MarketplaceSuccess from "./pages/marketplace/Success";
import FreelasIndex from "./pages/freelas/Index";
import AdminIndex from "./pages/admin/Index";
import AdminLogin from "./pages/admin/Login";
import AdminUsers from "./pages/admin/Users";
import AdminProjects from "./pages/admin/Projects";
import AdminContracts from "./pages/admin/Contracts";
import AdminFinance from "./pages/admin/Finance";
import AdminDisputes from "./pages/admin/Disputes";
import AdminConfig from "./pages/admin/Config";
import ClienteLogin from "./pages/cliente/Login";
import ClienteRegister from "./pages/cliente/Register";
import ClientePainel from "./pages/cliente/painel/Index";
import ClienteServicos from "./pages/cliente/painel/Servicos";
import ClienteConcluidos from "./pages/cliente/painel/Concluidos";
import ClienteMensagens from "./pages/cliente/painel/Mensagens";
import ClienteConfig from "./pages/cliente/painel/Config";

// Freelancer Pages
import FreelasLogin from "./pages/freelas/auth/Login";
import FreelasCadastro from "./pages/freelas/auth/Cadastro";
import FreelasDashboard from "./pages/freelas/painel/Dashboard";
import FreelasJobs from "./pages/freelas/painel/Jobs";
import FreelasMensagens from "./pages/freelas/painel/Mensagens";
import FreelasPortfolio from "./pages/freelas/painel/Portfolio";
import FreelasFinanceiro from "./pages/freelas/painel/Financeiro";
import FreelasConfig from "./pages/freelas/painel/Config";

// Institutional Public Pages
import Sobre from "./pages/public/Sobre";
import Termos from "./pages/public/Termos";
import Privacidade from "./pages/public/Privacidade";
import Lgpd from "./pages/public/Lgpd";
import Licencas from "./pages/public/Licencas";
import Cookies from "./pages/public/Cookies";
import Imprensa from "./pages/public/Imprensa";
import ParaEmpresas from "./pages/public/ParaEmpresas";
import ParaFreelancers from "./pages/public/ParaFreelancers";
import TrabalheConosco from "./pages/public/TrabalheConosco";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/marketplace/login" element={<ClienteLogin />} />
            <Route path="/marketplace/cadastro" element={<ClienteRegister />} />
            <Route path="/cliente/login" element={<ClienteLogin />} />
            <Route path="/cliente/cadastro" element={<ClienteRegister />} />
            <Route path="/freelas/login" element={<FreelasLogin />} />
            <Route path="/freelas/cadastro" element={<FreelasCadastro />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Institutional */}
            <Route path="/sobre-nos" element={<Sobre />} />
            <Route path="/termos-de-uso" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/lgpd" element={<Lgpd />} />
            <Route path="/licencas" element={<Licencas />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/imprensa" element={<Imprensa />} />
            <Route path="/trabalhe-conosco" element={<TrabalheConosco />} />
            <Route path="/para-empresas" element={<ParaEmpresas />} />
            <Route path="/para-freelancers" element={<ParaFreelancers />} />

            {/* Public marketplace */}
            <Route path="/marketplace" element={<MarketplaceIndex />} />
            <Route path="/marketplace/success" element={<MarketplaceSuccess />} />

            {/* Protected Routes */}
            <Route
              path="/marketplace/painel/*"
              element={
                <RoleRoute role="client">
                  <Routes>
                    <Route path="/" element={<ClientePainel />} />
                    <Route path="/servicos" element={<ClienteServicos />} />
                    <Route path="/concluidos" element={<ClienteConcluidos />} />
                    <Route path="/mensagens" element={<ClienteMensagens />} />
                    <Route path="/config" element={<ClienteConfig />} />
                  </Routes>
                </RoleRoute>
              }
            />

            <Route
              path="/freelas/*"
              element={
                <RoleRoute role="freelancer">
                  <Routes>
                    <Route path="/dashboard" element={<FreelasDashboard />} />
                    <Route path="/jobs" element={<FreelasJobs />} />
                    <Route path="/mensagens" element={<FreelasMensagens />} />
                    <Route path="/portfolio" element={<FreelasPortfolio />} />
                    <Route path="/financeiro" element={<FreelasFinanceiro />} />
                    <Route path="/config" element={<FreelasConfig />} />
                    <Route path="*" element={<Navigate to="/freelas/dashboard" replace />} />
                  </Routes>
                </RoleRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <Routes>
                    <Route path="/" element={<AdminIndex />} />
                    <Route path="/usuarios" element={<AdminUsers />} />
                    <Route path="/projetos" element={<AdminProjects />} />
                    <Route path="/contratos" element={<AdminContracts />} />
                    <Route path="/financeiro" element={<AdminFinance />} />
                    <Route path="/disputas" element={<AdminDisputes />} />
                    <Route path="/config" element={<AdminConfig />} />
                  </Routes>
                </AdminRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
