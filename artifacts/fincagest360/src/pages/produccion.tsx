import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListProduccion, useCreateProduccion, useDeleteProduccion, useGetProduccionSummary, getListProduccionQueryKey, getGetProduccionSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, TrendingUp, Package, BarChart2 } from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Form = { fincaId: string; loteId: string; fecha: string; cultivo: string; cantidadKg: string; valorUnitario: string; notas: string };
const defaultForm: Form = { fincaId: "", loteId: "", fecha: "", cultivo: "", cantidadKg: "", valorUnitario: "", notas: "" };

export default function Produccion() {
  const { data: produccion, isLoading } = useListProduccion();
  const { data: summary, isLoading: isLoadingSummary } = useGetProduccionSummary();
  const createProduccion = useCreateProduccion();
  const deleteProduccion = useDeleteProduccion();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(defaultForm);

  function handleSubmit() {
    createProduccion.mutate({ data: { fincaId: parseInt(form.fincaId), loteId: form.loteId ? parseInt(form.loteId) : undefined, fecha: form.fecha, cultivo: form.cultivo, cantidadKg: parseFloat(form.cantidadKg), valorUnitario: parseFloat(form.valorUnitario), notas: form.notas || undefined } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProduccionQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetProduccionSummaryQueryKey() }); toast({ title: "Registro creado" }); setOpen(false); setForm(defaultForm); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  function handleDelete(id: number) {
    deleteProduccion.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProduccionQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetProduccionSummaryQueryKey() }); toast({ title: "Registro eliminado" }); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produccion</h1>
          <p className="text-muted-foreground mt-1">Seguimiento de produccion agricola.</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setOpen(true); }} data-testid="button-create-produccion"><Plus className="h-4 w-4 mr-2" />Nuevo Registro</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isLoadingSummary ? [1,2,3].map(i => <Skeleton key={i} className="h-24" />) : (
          <>
            <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Total Kg este mes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(summary?.totalKgMes ?? 0)} kg</div></CardContent></Card>
            <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><Package className="h-4 w-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Total Kg este ano</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(summary?.totalKgAnio ?? 0)} kg</div></CardContent></Card>
            <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><BarChart2 className="h-4 w-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Valor producido (mes)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary?.valorTotalMes ?? 0)}</div></CardContent></Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Registros de Produccion</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-48" /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Fecha</TableHead><TableHead>Cultivo</TableHead><TableHead>Cantidad (Kg)</TableHead><TableHead>Valor Unit.</TableHead><TableHead>Total</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(produccion || []).map(r => (
                  <TableRow key={r.id} data-testid={`row-produccion-${r.id}`}>
                    <TableCell>{formatDate(r.fecha)}</TableCell>
                    <TableCell className="font-medium">{r.cultivo}</TableCell>
                    <TableCell>{formatNumber(r.cantidadKg)} kg</TableCell>
                    <TableCell>{formatCurrency(r.valorUnitario)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(r.total)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(r.id)} data-testid={`button-delete-produccion-${r.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {produccion?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay registros.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Registro de Produccion</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>ID Finca</Label><Input type="number" value={form.fincaId} onChange={e => setForm(p => ({ ...p, fincaId: e.target.value }))} /></div>
              <div className="space-y-1"><Label>ID Lote (opcional)</Label><Input type="number" value={form.loteId} onChange={e => setForm(p => ({ ...p, loteId: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Cultivo</Label><Input value={form.cultivo} onChange={e => setForm(p => ({ ...p, cultivo: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Cantidad (Kg)</Label><Input type="number" value={form.cantidadKg} onChange={e => setForm(p => ({ ...p, cantidadKg: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Valor unitario (COP/Kg)</Label><Input type="number" value={form.valorUnitario} onChange={e => setForm(p => ({ ...p, valorUnitario: e.target.value }))} /></div>
              <div className="space-y-1 col-span-2"><Label>Notas</Label><Input value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-produccion" onClick={handleSubmit} disabled={createProduccion.isPending}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
