import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

// Stubs for now, will create next
import Dashboard from "@/pages/dashboard";
import Fincas from "@/pages/fincas";
import Lotes from "@/pages/lotes";
import Produccion from "@/pages/produccion";
import Cosecha from "@/pages/cosecha";
import Finanzas from "@/pages/finanzas";
import Nomina from "@/pages/nomina";
import Empleados from "@/pages/empleados";
import Insumos from "@/pages/insumos";
import Jornadas from "@/pages/jornadas";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/fincas" component={Fincas} />
        <Route path="/lotes" component={Lotes} />
        <Route path="/produccion" component={Produccion} />
        <Route path="/cosecha" component={Cosecha} />
        <Route path="/finanzas" component={Finanzas} />
        <Route path="/nomina" component={Nomina} />
        <Route path="/empleados" component={Empleados} />
        <Route path="/insumos" component={Insumos} />
        <Route path="/jornadas" component={Jornadas} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
