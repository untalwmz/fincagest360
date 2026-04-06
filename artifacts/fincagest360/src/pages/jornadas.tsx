import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListJornadas, useCreateJornada, useDeleteJornada, useListEmpleados, useListFincas, getListJornadasQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, CalendarClock, Clock } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Form = { empleadoId: string; fincaId: string; fecha: string; horasRegulares: string; horasExtra: string; actividad: string; notas: string };
const defaultForm: Form = { empleadoId: "", fincaId: "", fecha: "", horasRegulares: "8", horasExtra: "0", actividad: "", notas: "" };

export default function Jornadas() {
  const { data: jornadas, isLoading } = useListJornadas();
  const { data: empleados } = useListEmpleados();
  const { data: fincas } = useListFincas();
  const createJornada = useCreateJornada();
  const deleteJornada = useDeleteJornada();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(defaultForm);

  const totalHorasRegulares = (jornadas || []).reduce((s, j) => s + j.horasRegulares, 0);
  const totalHorasExtra = (jornadas || []).reduce((s, j) => s + j.horasExtra, 0);

  function handleSubmit() {
    createJornada.mutate({ data: { empleadoId: parseInt(form.empleadoId), fincaId: parseInt(form.fincaId), fecha: form.fecha, horasRegulares: parseFloat(form.horasRegulares), horasExtra: parseFloat(form.horasExtra) || 0, actividad: form.actividad, notas: form.notas || undefined } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListJornadasQueryKey() }); toast({ title: "Jornada registrada" }); setOpen(false); setForm(defaultForm); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  function handleDelete(id: number) {
    deleteJornada.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListJornadasQueryKey() }); toast({ title: "Registro eliminado" }); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  const fincaMap = Object.fromEntries((fincas || []).map(f => [f.id, f.nombre]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jornadas</h1>
          <p className="text-muted-foreground mt-1">Registro de jornadas laborales diarias.</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setOpen(true); }} data-testid="button-create-jornada"><Plus className="h-4 w-4 mr-2" />Nueva Jornada</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Total registros</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{jornadas?.length ?? 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-1 flex flex-row items-center gap-2"><Clock className="h-4 w-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Horas regulares</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatNumber(totalHorasRegulares)} h</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm font-medium text-muted-foreground">Horas extra</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{formatNumber(totalHorasExtra)} h</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Historial de Jornadas</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-48" /> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Fecha</TableHead><TableHead>Empleado</TableHead><TableHead>Finca</TableHead><TableHead>Actividad</TableHead><TableHead>Horas reg.</TableHead><TableHead>Horas extra</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(jornadas || []).map(r => (
                  <TableRow key={r.id} data-testid={`row-jornada-${r.id}`}>
                    <TableCell>{formatDate(r.fecha)}</TableCell>
                    <TableCell className="font-medium">{r.empleadoNombre ?? `#${r.empleadoId}`}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{fincaMap[r.fincaId] ?? `#${r.fincaId}`}</TableCell>
                    <TableCell>{r.actividad}</TableCell>
                    <TableCell>{formatNumber(r.horasRegulares)} h</TableCell>
                    <TableCell className={r.horasExtra > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>{r.horasExtra > 0 ? `+${formatNumber(r.horasExtra)} h` : "-"}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDelete(r.id)} data-testid={`button-delete-jornada-${r.id}`}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
                {jornadas?.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sin registros.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Jornada Laboral</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Empleado</Label>
              <Select value={form.empleadoId} onValueChange={v => setForm(p => ({ ...p, empleadoId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona empleado" /></SelectTrigger>
                <SelectContent>{(empleados || []).map(e => <SelectItem key={e.id} value={String(e.id)}>{e.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Finca</Label>
              <Select value={form.fincaId} onValueChange={v => setForm(p => ({ ...p, fincaId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona finca" /></SelectTrigger>
                <SelectContent>{(fincas || []).map(f => <SelectItem key={f.id} value={String(f.id)}>{f.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} /></div>
              <div className="space-y-1 col-span-2"><Label>Actividad</Label><Input value={form.actividad} onChange={e => setForm(p => ({ ...p, actividad: e.target.value }))} placeholder="Recoleccion, riego, poda..." /></div>
              <div className="space-y-1"><Label>Horas regulares</Label><Input type="number" value={form.horasRegulares} onChange={e => setForm(p => ({ ...p, horasRegulares: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Horas extra</Label><Input type="number" value={form.horasExtra} onChange={e => setForm(p => ({ ...p, horasExtra: e.target.value }))} /></div>
              <div className="space-y-1 col-span-2"><Label>Notas</Label><Input value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-jornada" onClick={handleSubmit} disabled={createJornada.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
