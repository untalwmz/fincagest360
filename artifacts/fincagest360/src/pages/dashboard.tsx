import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useGetDashboardSummary, 
  useGetDashboardRecentActivity, 
  useGetDashboardMonthlyRevenue 
} from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Tractor, Users, Package, Wallet, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetDashboardRecentActivity();
  const { data: revenue, isLoading: isLoadingRevenue } = useGetDashboardMonthlyRevenue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general de operaciones y finanzas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard 
          title="Ingresos Totales" 
          value={isLoadingSummary ? null : formatCurrency(summary?.totalIngresos || 0)} 
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          loading={isLoadingSummary}
        />
        <SummaryCard 
          title="Gastos Totales" 
          value={isLoadingSummary ? null : formatCurrency(summary?.totalGastos || 0)} 
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          loading={isLoadingSummary}
        />
        <SummaryCard 
          title="Balance Neto" 
          value={isLoadingSummary ? null : formatCurrency(summary?.balanceNeto || 0)} 
          icon={<Wallet className="h-4 w-4 text-blue-500" />}
          loading={isLoadingSummary}
        />
        <SummaryCard 
          title="Rentabilidad" 
          value={isLoadingSummary ? null : `${(summary?.rentabilidad || 0).toFixed(1)}%`} 
          icon={<ArrowLeftRight className="h-4 w-4 text-primary" />}
          loading={isLoadingSummary}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard 
          title="Total Fincas" 
          value={isLoadingSummary ? null : summary?.totalFincas} 
          icon={<Tractor className="h-4 w-4 text-muted-foreground" />}
          loading={isLoadingSummary}
        />
        <SummaryCard 
          title="Total Empleados" 
          value={isLoadingSummary ? null : summary?.totalEmpleados} 
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={isLoadingSummary}
        />
        <SummaryCard 
          title="Producción del Mes (Kg)" 
          value={isLoadingSummary ? null : (summary?.produccionMesKg || 0).toLocaleString()} 
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          loading={isLoadingSummary}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Flujo de Caja Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRevenue ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                      tickFormatter={(value) => `$${value/1000000}M`}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{fill: 'hsl(var(--muted))'}}
                      contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}}/>
                    <Bar dataKey="ingresos" name="Ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gastos" name="Gastos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {(activity || []).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">{item.descripcion}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(item.fecha)}</span>
                        {item.monto && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-foreground">{formatCurrency(item.monto)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {activity?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, loading }: { title: string, value: React.ReactNode, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
