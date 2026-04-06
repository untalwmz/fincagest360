import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListNomina, useCreateNomina, useDeleteNomina, useListEmpleados, getListNominaQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, WalletCards } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Form = { empleadoId: string; periodo: string; diasTrabajados: string; salarioBase: string; bonificaciones: string; deducciones: string; estado: string; fechaPago: string };
const defaultForm: Form = { empleadoId: "", periodo: "", diasTrabajados: "26", salarioBase: "", bonificaciones: "0", deducciones: "0", estado: "pendiente", fechaPago: "" };

export default function Nomina() {
  const { data: nomina, isLoading } = useListNomina();
  const { data: empleados } = useListEmpleados();
  const createNomina = useCreateNomina();
  const deleteNomina = useDeleteNomina();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(defaultForm);

  const totalPagado = (nomina || []).filter(r => r.estado === "pagado").reduce((s, r) => s + r.totalPagar, 0);
  const totalPendiente = (nomina || []).filter(r => r.estado === "pendiente").reduce((s, r) => s + r.totalPagar, 0);

  function handleEmpleadoChange(id: string) {
    const emp = (empleados || []).find(e => String(e.id) === id);
    setForm(p => ({ ...p, empleadoId: id, salarioBase: emp ? String(emp.salarioBase) : p.salarioBase }));
  }

  function handleSubmit() {
    createNomina.mutate({ data: { empleadoId: parseInt(form.empleadoId), periodo: form.periodo, diasTrabajados: parseInt(form.diasTrabajados), salarioBase: parseFloat(form.salarioBase), bonificaciones: parseFloat(form.bonificaciones) || 0, deducciones: parseFloat(form.deducciones) || 0, estado: form.estado, fechaPago: form.fechaPago || undefined } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNominaQueryKey() }); toast({ title: "Nomina creada" }); setOpen(false); setForm(defaultForm); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  function handleDelete(id: number) {
    deleteNomina.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNominaQueryKey() }); toast({ title: "Registro eliminado" }); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nomina</h1>
          <p className="text-muted-foreground mt-1">Liquidacion y control de pagos a empleados.</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setOpen(true); }} data-testid="button-create-nomina"><Plus className="h-4 w-4 mr-2" />Nueva Liquidacion</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><WalletCards className="h-4 w-4 text-emerald-500" /><CardTitle className="text-sm font-medium text-muted-foreground">Total pagado</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPagado)}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Total pendiente</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPendiente)}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Registros</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{nomina?.length ?? 0}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Liquidaciones</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-48" /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Empleado</TableHead><TableHead>Periodo</TableHead><TableHead>Dias</TableHead><TableHead>Salario base</TableHead><TableHead>Bonificaciones</TableHead><TableHead>Deducciones</TableHead><TableHead>Total a pagar</TableHead><TableHead>Estado</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(nomina || []).map(r => (
                  <TableRow key={r.id} data-testid={`row-nomina-${r.id}`}>
                    <TableCell className="font-medium">{r.empleadoNombre}</TableCell>
                    <TableCell>{r.periodo}</TableCell>
                    <TableCell>{r.diasTrabajados}</TableCell>
                    <TableCell>{formatCurrency(r.salarioBase)}</TableCell>
                    <TableCell className="text-emerald-600">+{formatCurrency(r.bonificaciones)}</TableCell>
                    <TableCell className="text-destructive">-{formatCurrency(r.deducciones)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(r.totalPagar)}</TableCell>
                    <TableCell><Badge variant={r.estado === "pagado" ? "default" : "secondary"}>{r.estado}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(r.id)} data-testid={`button-delete-nomina-${r.id}`}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
                {nomina?.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Sin registros.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Liquidacion de Nomina</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Empleado</Label>
              <Select value={form.empleadoId} onValueChange={handleEmpleadoChange}>
                <SelectTrigger><SelectValue placeholder="Selecciona empleado" /></SelectTrigger>
                <SelectContent>{(empleados || []).map(e => <SelectItem key={e.id} value={String(e.id)}>{e.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Periodo (YYYY-MM)</Label><Input value={form.periodo} onChange={e => setForm(p => ({ ...p, periodo: e.target.value }))} placeholder="2025-03" /></div>
              <div className="space-y-1"><Label>Dias trabajados</Label><Input type="number" value={form.diasTrabajados} onChange={e => setForm(p => ({ ...p, diasTrabajados: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Salario base (COP)</Label><Input type="number" value={form.salarioBase} onChange={e => setForm(p => ({ ...p, salarioBase: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Bonificaciones (COP)</Label><Input type="number" value={form.bonificaciones} onChange={e => setForm(p => ({ ...p, bonificaciones: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Deducciones (COP)</Label><Input type="number" value={form.deducciones} onChange={e => setForm(p => ({ ...p, deducciones: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Estado</Label>
                <Select value={form.estado} onValueChange={v => setForm(p => ({ ...p, estado: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pendiente">Pendiente</SelectItem><SelectItem value="pagado">Pagado</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1"><Label>Fecha de pago</Label><Input type="date" value={form.fechaPago} onChange={e => setForm(p => ({ ...p, fechaPago: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-nomina" onClick={handleSubmit} disabled={createNomina.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
