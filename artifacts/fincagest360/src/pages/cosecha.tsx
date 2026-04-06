import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListCosecha, useCreateCosecha, useDeleteCosecha, getListCosechaQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Wheat } from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Form = { fincaId: string; loteId: string; fecha: string; cultivo: string; cantidadKg: string; calidad: string; responsable: string; precioVenta: string; comprador: string; notas: string };
const defaultForm: Form = { fincaId: "", loteId: "", fecha: "", cultivo: "", cantidadKg: "", calidad: "Primera", responsable: "", precioVenta: "", comprador: "", notas: "" };

const qualityColors: Record<string, "default" | "secondary" | "destructive"> = {
  "Primera": "default",
  "Exportacion": "default",
  "Segunda": "secondary",
};

export default function Cosecha() {
  const { data: cosecha, isLoading } = useListCosecha();
  const createCosecha = useCreateCosecha();
  const deleteCosecha = useDeleteCosecha();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(defaultForm);

  const totalKg = (cosecha || []).reduce((s, r) => s + r.cantidadKg, 0);
  const totalValor = (cosecha || []).reduce((s, r) => s + (r.cantidadKg * (r.precioVenta ?? 0)), 0);

  function handleSubmit() {
    createCosecha.mutate({ data: { fincaId: parseInt(form.fincaId), loteId: form.loteId ? parseInt(form.loteId) : undefined, fecha: form.fecha, cultivo: form.cultivo, cantidadKg: parseFloat(form.cantidadKg), calidad: form.calidad, responsable: form.responsable || undefined, precioVenta: form.precioVenta ? parseFloat(form.precioVenta) : undefined, comprador: form.comprador || undefined, notas: form.notas || undefined } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCosechaQueryKey() }); toast({ title: "Cosecha registrada" }); setOpen(false); setForm(defaultForm); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  function handleDelete(id: number) {
    deleteCosecha.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCosechaQueryKey() }); toast({ title: "Registro eliminado" }); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cosecha</h1>
          <p className="text-muted-foreground mt-1">Registro de cosechas y ventas.</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setOpen(true); }} data-testid="button-create-cosecha"><Plus className="h-4 w-4 mr-2" />Nueva Cosecha</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><Wheat className="h-4 w-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Total cosechado</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(totalKg)} kg</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Valor total vendido</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalValor)}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Registros</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{cosecha?.length ?? 0}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Historial de Cosechas</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-48" /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Fecha</TableHead><TableHead>Cultivo</TableHead><TableHead>Cantidad</TableHead><TableHead>Calidad</TableHead><TableHead>Precio/Kg</TableHead><TableHead>Comprador</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(cosecha || []).map(r => (
                  <TableRow key={r.id} data-testid={`row-cosecha-${r.id}`}>
                    <TableCell>{formatDate(r.fecha)}</TableCell>
                    <TableCell className="font-medium">{r.cultivo}</TableCell>
                    <TableCell>{formatNumber(r.cantidadKg)} kg</TableCell>
                    <TableCell><Badge variant={qualityColors[r.calidad] ?? "secondary"}>{r.calidad}</Badge></TableCell>
                    <TableCell>{r.precioVenta ? formatCurrency(r.precioVenta) : "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.comprador ?? "-"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(r.id)} data-testid={`button-delete-cosecha-${r.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {cosecha?.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No hay cosechas registradas.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Cosecha</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>ID Finca</Label><Input type="number" value={form.fincaId} onChange={e => setForm(p => ({ ...p, fincaId: e.target.value }))} /></div>
              <div className="space-y-1"><Label>ID Lote (opcional)</Label><Input type="number" value={form.loteId} onChange={e => setForm(p => ({ ...p, loteId: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Cultivo</Label><Input value={form.cultivo} onChange={e => setForm(p => ({ ...p, cultivo: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Cantidad (Kg)</Label><Input type="number" value={form.cantidadKg} onChange={e => setForm(p => ({ ...p, cantidadKg: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Calidad</Label><Input value={form.calidad} onChange={e => setForm(p => ({ ...p, calidad: e.target.value }))} placeholder="Primera, Exportacion..." /></div>
              <div className="space-y-1"><Label>Precio/Kg (COP)</Label><Input type="number" value={form.precioVenta} onChange={e => setForm(p => ({ ...p, precioVenta: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Comprador</Label><Input value={form.comprador} onChange={e => setForm(p => ({ ...p, comprador: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Responsable</Label><Input value={form.responsable} onChange={e => setForm(p => ({ ...p, responsable: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-cosecha" onClick={handleSubmit} disabled={createCosecha.isPending}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
