import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListInsumos, useCreateInsumo, useDeleteInsumo, getListInsumosQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Package, AlertTriangle } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Form = { fincaId: string; nombre: string; tipo: string; cantidad: string; unidad: string; costoUnitario: string; proveedor: string; fechaCompra: string; stockMinimo: string };
const defaultForm: Form = { fincaId: "", nombre: "", tipo: "", cantidad: "", unidad: "", costoUnitario: "", proveedor: "", fechaCompra: "", stockMinimo: "" };

export default function Insumos() {
  const { data: insumos, isLoading } = useListInsumos();
  const createInsumo = useCreateInsumo();
  const deleteInsumo = useDeleteInsumo();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(defaultForm);

  const lowStock = (insumos || []).filter(i => i.stockMinimo != null && i.cantidad <= i.stockMinimo);
  const totalValor = (insumos || []).reduce((s, i) => s + i.cantidad * i.costoUnitario, 0);

  function handleSubmit() {
    createInsumo.mutate({ data: { fincaId: form.fincaId ? parseInt(form.fincaId) : undefined, nombre: form.nombre, tipo: form.tipo, cantidad: parseFloat(form.cantidad), unidad: form.unidad, costoUnitario: parseFloat(form.costoUnitario), proveedor: form.proveedor || undefined, fechaCompra: form.fechaCompra || undefined, stockMinimo: form.stockMinimo ? parseFloat(form.stockMinimo) : undefined } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListInsumosQueryKey() }); toast({ title: "Insumo creado" }); setOpen(false); setForm(defaultForm); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  function handleDelete(id: number) {
    deleteInsumo.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListInsumosQueryKey() }); toast({ title: "Insumo eliminado" }); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insumos</h1>
          <p className="text-muted-foreground mt-1">Control de inventario de insumos agricolas.</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setOpen(true); }} data-testid="button-create-insumo"><Plus className="h-4 w-4 mr-2" />Nuevo Insumo</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><Package className="h-4 w-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Total insumos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{insumos?.length ?? 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><AlertTriangle className={`h-4 w-4 ${lowStock.length > 0 ? "text-amber-500" : "text-muted-foreground"}`} /><CardTitle className="text-sm font-medium text-muted-foreground">Stock bajo</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${lowStock.length > 0 ? "text-amber-600" : ""}`}>{lowStock.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Valor inventario</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalValor)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Inventario de Insumos</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-48" /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nombre</TableHead><TableHead>Tipo</TableHead><TableHead>Cantidad</TableHead><TableHead>Unidad</TableHead><TableHead>Costo unit.</TableHead><TableHead>Proveedor</TableHead><TableHead>Stock</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(insumos || []).map(r => {
                  const isLow = r.stockMinimo != null && r.cantidad <= r.stockMinimo;
                  return (
                    <TableRow key={r.id} data-testid={`row-insumo-${r.id}`} className={isLow ? "bg-amber-50 dark:bg-amber-900/10" : ""}>
                      <TableCell className="font-medium">{r.nombre}</TableCell>
                      <TableCell><Badge variant="outline">{r.tipo}</Badge></TableCell>
                      <TableCell>{formatNumber(r.cantidad)}</TableCell>
                      <TableCell>{r.unidad}</TableCell>
                      <TableCell>{formatCurrency(r.costoUnitario)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.proveedor ?? "-"}</TableCell>
                      <TableCell>{isLow ? <Badge variant="destructive">Bajo stock</Badge> : <Badge variant="secondary">OK</Badge>}</TableCell>
                      <TableCell><Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(r.id)} data-testid={`button-delete-insumo-${r.id}`}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                    </TableRow>
                  );
                })}
                {insumos?.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Sin registros.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Insumo</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2"><Label>Nombre</Label><Input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Tipo</Label><Input value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} placeholder="Fertilizante, Fungicida..." /></div>
              <div className="space-y-1"><Label>Cantidad</Label><Input type="number" value={form.cantidad} onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Unidad</Label><Input value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))} placeholder="kilos, litros, bultos..." /></div>
              <div className="space-y-1"><Label>Costo unitario (COP)</Label><Input type="number" value={form.costoUnitario} onChange={e => setForm(p => ({ ...p, costoUnitario: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Stock minimo</Label><Input type="number" value={form.stockMinimo} onChange={e => setForm(p => ({ ...p, stockMinimo: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Proveedor</Label><Input value={form.proveedor} onChange={e => setForm(p => ({ ...p, proveedor: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Fecha compra</Label><Input type="date" value={form.fechaCompra} onChange={e => setForm(p => ({ ...p, fechaCompra: e.target.value }))} /></div>
              <div className="space-y-1"><Label>ID Finca (opcional)</Label><Input type="number" value={form.fincaId} onChange={e => setForm(p => ({ ...p, fincaId: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-insumo" onClick={handleSubmit} disabled={createInsumo.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
