import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListIngresos, useCreateIngreso, useDeleteIngreso, getListIngresosQueryKey,
  useListGastos, useCreateGasto, useDeleteGasto, getListGastosQueryKey,
  useListInversiones, useCreateInversion, getListInversionesQueryKey,
  useGetFinanzasResumen, getGetFinanzasResumenQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, BarChart2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type IngresoForm = { fincaId: string; concepto: string; monto: string; fecha: string; categoria: string; notas: string };
const defaultIngresoForm: IngresoForm = { fincaId: "", concepto: "", monto: "", fecha: "", categoria: "Produccion", notas: "" };

type GastoForm = { fincaId: string; concepto: string; monto: string; fecha: string; categoria: string; notas: string };
const defaultGastoForm: GastoForm = { fincaId: "", concepto: "", monto: "", fecha: "", categoria: "Insumos", notas: "" };

type InversionForm = { fincaId: string; descripcion: string; monto: string; fecha: string; tipo: string; retornoEsperado: string };
const defaultInversionForm: InversionForm = { fincaId: "", descripcion: "", monto: "", fecha: "", tipo: "Infraestructura", retornoEsperado: "" };

export default function Finanzas() {
  const { data: ingresos, isLoading: isLoadingIngresos } = useListIngresos();
  const { data: gastos, isLoading: isLoadingGastos } = useListGastos();
  const { data: inversiones, isLoading: isLoadingInversiones } = useListInversiones();
  const { data: resumen, isLoading: isLoadingResumen } = useGetFinanzasResumen();
  const createIngreso = useCreateIngreso();
  const deleteIngreso = useDeleteIngreso();
  const createGasto = useCreateGasto();
  const deleteGasto = useDeleteGasto();
  const createInversion = useCreateInversion();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [ingresoOpen, setIngresoOpen] = useState(false);
  const [gastoOpen, setGastoOpen] = useState(false);
  const [inversionOpen, setInversionOpen] = useState(false);
  const [ingresoForm, setIngresoForm] = useState<IngresoForm>(defaultIngresoForm);
  const [gastoForm, setGastoForm] = useState<GastoForm>(defaultGastoForm);
  const [inversionForm, setInversionForm] = useState<InversionForm>(defaultInversionForm);

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: getListIngresosQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListGastosQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFinanzasResumenQueryKey() });
  }

  function handleCreateIngreso() {
    createIngreso.mutate({ data: { fincaId: ingresoForm.fincaId ? parseInt(ingresoForm.fincaId) : undefined, concepto: ingresoForm.concepto, monto: parseFloat(ingresoForm.monto), fecha: ingresoForm.fecha, categoria: ingresoForm.categoria, notas: ingresoForm.notas || undefined } }, {
      onSuccess: () => { invalidateAll(); toast({ title: "Ingreso creado" }); setIngresoOpen(false); setIngresoForm(defaultIngresoForm); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  function handleCreateGasto() {
    createGasto.mutate({ data: { fincaId: gastoForm.fincaId ? parseInt(gastoForm.fincaId) : undefined, concepto: gastoForm.concepto, monto: parseFloat(gastoForm.monto), fecha: gastoForm.fecha, categoria: gastoForm.categoria, notas: gastoForm.notas || undefined } }, {
      onSuccess: () => { invalidateAll(); toast({ title: "Gasto registrado" }); setGastoOpen(false); setGastoForm(defaultGastoForm); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  function handleCreateInversion() {
    createInversion.mutate({ data: { fincaId: inversionForm.fincaId ? parseInt(inversionForm.fincaId) : undefined, descripcion: inversionForm.descripcion, monto: parseFloat(inversionForm.monto), fecha: inversionForm.fecha, tipo: inversionForm.tipo, retornoEsperado: inversionForm.retornoEsperado ? parseFloat(inversionForm.retornoEsperado) : undefined } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListInversionesQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetFinanzasResumenQueryKey() }); toast({ title: "Inversion registrada" }); setInversionOpen(false); setInversionForm(defaultInversionForm); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
        <p className="text-muted-foreground mt-1">Control financiero integral de tus fincas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingResumen ? [1,2,3,4].map(i => <Skeleton key={i} className="h-24" />) : (
          <>
            <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Total Ingresos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(resumen?.totalIngresos ?? 0)}</div></CardContent></Card>
            <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><TrendingDown className="h-4 w-4 text-destructive" /><CardTitle className="text-sm font-medium text-muted-foreground">Total Gastos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(resumen?.totalGastos ?? 0)}</div></CardContent></Card>
            <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><Wallet className="h-4 w-4 text-blue-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Balance Neto</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${(resumen?.balanceNeto ?? 0) >= 0 ? "text-emerald-600" : "text-destructive"}`}>{formatCurrency(resumen?.balanceNeto ?? 0)}</div></CardContent></Card>
            <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><BarChart2 className="h-4 w-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Rentabilidad</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{(resumen?.rentabilidad ?? 0).toFixed(1)}%</div></CardContent></Card>
          </>
        )}
      </div>

      {!isLoadingResumen && resumen?.flujoMensual && (
        <Card>
          <CardHeader><CardTitle>Flujo Mensual</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={resumen.flujoMensual}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={v => `$${(v/1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="ingresos" name="Ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ingresos">
        <TabsList><TabsTrigger value="ingresos">Ingresos</TabsTrigger><TabsTrigger value="gastos">Gastos</TabsTrigger><TabsTrigger value="inversiones">Inversiones</TabsTrigger></TabsList>

        <TabsContent value="ingresos" className="space-y-3 mt-4">
          <div className="flex justify-end"><Button size="sm" onClick={() => { setIngresoForm(defaultIngresoForm); setIngresoOpen(true); }} data-testid="button-create-ingreso"><Plus className="h-3.5 w-3.5 mr-1" />Nuevo Ingreso</Button></div>
          {isLoadingIngresos ? <Skeleton className="h-48" /> : (
            <Card><CardContent className="pt-4">
              <Table>
                <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Concepto</TableHead><TableHead>Categoria</TableHead><TableHead>Monto</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {(ingresos || []).map(r => (
                    <TableRow key={r.id} data-testid={`row-ingreso-${r.id}`}>
                      <TableCell>{formatDate(r.fecha)}</TableCell><TableCell className="font-medium">{r.concepto}</TableCell>
                      <TableCell><Badge variant="secondary">{r.categoria}</Badge></TableCell>
                      <TableCell className="font-semibold text-emerald-600">{formatCurrency(r.monto)}</TableCell>
                      <TableCell><Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => { deleteIngreso.mutate({ id: r.id }, { onSuccess: () => invalidateAll() }); }} data-testid={`button-delete-ingreso-${r.id}`}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {ingresos?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sin registros.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="gastos" className="space-y-3 mt-4">
          <div className="flex justify-end"><Button size="sm" onClick={() => { setGastoForm(defaultGastoForm); setGastoOpen(true); }} data-testid="button-create-gasto"><Plus className="h-3.5 w-3.5 mr-1" />Nuevo Gasto</Button></div>
          {isLoadingGastos ? <Skeleton className="h-48" /> : (
            <Card><CardContent className="pt-4">
              <Table>
                <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Concepto</TableHead><TableHead>Categoria</TableHead><TableHead>Monto</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {(gastos || []).map(r => (
                    <TableRow key={r.id} data-testid={`row-gasto-${r.id}`}>
                      <TableCell>{formatDate(r.fecha)}</TableCell><TableCell className="font-medium">{r.concepto}</TableCell>
                      <TableCell><Badge variant="secondary">{r.categoria}</Badge></TableCell>
                      <TableCell className="font-semibold text-destructive">{formatCurrency(r.monto)}</TableCell>
                      <TableCell><Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => { deleteGasto.mutate({ id: r.id }, { onSuccess: () => invalidateAll() }); }} data-testid={`button-delete-gasto-${r.id}`}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {gastos?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sin registros.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="inversiones" className="space-y-3 mt-4">
          <div className="flex justify-end"><Button size="sm" onClick={() => { setInversionForm(defaultInversionForm); setInversionOpen(true); }} data-testid="button-create-inversion"><Plus className="h-3.5 w-3.5 mr-1" />Nueva Inversion</Button></div>
          {isLoadingInversiones ? <Skeleton className="h-48" /> : (
            <Card><CardContent className="pt-4">
              <Table>
                <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Descripcion</TableHead><TableHead>Tipo</TableHead><TableHead>Monto</TableHead><TableHead>Retorno esperado</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(inversiones || []).map(r => (
                    <TableRow key={r.id} data-testid={`row-inversion-${r.id}`}>
                      <TableCell>{formatDate(r.fecha)}</TableCell><TableCell className="font-medium">{r.descripcion}</TableCell>
                      <TableCell><Badge variant="outline">{r.tipo}</Badge></TableCell>
                      <TableCell className="font-semibold">{formatCurrency(r.monto)}</TableCell>
                      <TableCell className="text-muted-foreground">{r.retornoEsperado ? formatCurrency(r.retornoEsperado) : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {inversiones?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sin registros.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={ingresoOpen} onOpenChange={setIngresoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Ingreso</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2"><Label>Concepto</Label><Input value={ingresoForm.concepto} onChange={e => setIngresoForm(p => ({ ...p, concepto: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Monto (COP)</Label><Input type="number" value={ingresoForm.monto} onChange={e => setIngresoForm(p => ({ ...p, monto: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Fecha</Label><Input type="date" value={ingresoForm.fecha} onChange={e => setIngresoForm(p => ({ ...p, fecha: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Categoria</Label><Input value={ingresoForm.categoria} onChange={e => setIngresoForm(p => ({ ...p, categoria: e.target.value }))} /></div>
              <div className="space-y-1"><Label>ID Finca (opcional)</Label><Input type="number" value={ingresoForm.fincaId} onChange={e => setIngresoForm(p => ({ ...p, fincaId: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIngresoOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-ingreso" onClick={handleCreateIngreso} disabled={createIngreso.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={gastoOpen} onOpenChange={setGastoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Gasto</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2"><Label>Concepto</Label><Input value={gastoForm.concepto} onChange={e => setGastoForm(p => ({ ...p, concepto: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Monto (COP)</Label><Input type="number" value={gastoForm.monto} onChange={e => setGastoForm(p => ({ ...p, monto: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Fecha</Label><Input type="date" value={gastoForm.fecha} onChange={e => setGastoForm(p => ({ ...p, fecha: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Categoria</Label><Input value={gastoForm.categoria} onChange={e => setGastoForm(p => ({ ...p, categoria: e.target.value }))} /></div>
              <div className="space-y-1"><Label>ID Finca (opcional)</Label><Input type="number" value={gastoForm.fincaId} onChange={e => setGastoForm(p => ({ ...p, fincaId: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGastoOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-gasto" onClick={handleCreateGasto} disabled={createGasto.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inversionOpen} onOpenChange={setInversionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Inversion</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2"><Label>Descripcion</Label><Input value={inversionForm.descripcion} onChange={e => setInversionForm(p => ({ ...p, descripcion: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Monto (COP)</Label><Input type="number" value={inversionForm.monto} onChange={e => setInversionForm(p => ({ ...p, monto: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Fecha</Label><Input type="date" value={inversionForm.fecha} onChange={e => setInversionForm(p => ({ ...p, fecha: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Tipo</Label><Input value={inversionForm.tipo} onChange={e => setInversionForm(p => ({ ...p, tipo: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Retorno esperado (COP)</Label><Input type="number" value={inversionForm.retornoEsperado} onChange={e => setInversionForm(p => ({ ...p, retornoEsperado: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInversionOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-inversion" onClick={handleCreateInversion} disabled={createInversion.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
