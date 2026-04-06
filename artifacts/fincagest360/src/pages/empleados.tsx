import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListEmpleados,
  useCreateEmpleado,
  useUpdateEmpleado,
  useDeleteEmpleado,
  getListEmpleadosQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, User, Phone, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

type Form = { nombre: string; cargo: string; fincaId: string; telefono: string; salarioBase: string; estado: string; fechaIngreso: string };
const defaultForm: Form = { nombre: "", cargo: "", fincaId: "", telefono: "", salarioBase: "", estado: "activo", fechaIngreso: "" };

export default function Empleados() {
  const { data: empleados, isLoading } = useListEmpleados();
  const createEmpleado = useCreateEmpleado();
  const updateEmpleado = useUpdateEmpleado();
  const deleteEmpleado = useDeleteEmpleado();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(defaultForm);

  function openCreate() { setEditId(null); setForm(defaultForm); setOpen(true); }
  function openEdit(e: NonNullable<typeof empleados>[0]) {
    setEditId(e.id);
    setForm({ nombre: e.nombre, cargo: e.cargo, fincaId: e.fincaId ? String(e.fincaId) : "", telefono: e.telefono ?? "", salarioBase: String(e.salarioBase), estado: e.estado, fechaIngreso: e.fechaIngreso ?? "" });
    setOpen(true);
  }

  function handleSubmit() {
    const data = { nombre: form.nombre, cargo: form.cargo, fincaId: form.fincaId ? parseInt(form.fincaId) : undefined, telefono: form.telefono || undefined, salarioBase: parseFloat(form.salarioBase), estado: form.estado, fechaIngreso: form.fechaIngreso || undefined };
    if (editId !== null) {
      updateEmpleado.mutate({ id: editId, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListEmpleadosQueryKey() }); toast({ title: "Empleado actualizado" }); setOpen(false); },
        onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
      });
    } else {
      createEmpleado.mutate({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListEmpleadosQueryKey() }); toast({ title: "Empleado creado" }); setOpen(false); },
        onError: () => toast({ title: "Error al crear", variant: "destructive" }),
      });
    }
  }

  function handleDelete(id: number) {
    deleteEmpleado.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListEmpleadosQueryKey() }); toast({ title: "Empleado eliminado" }); },
      onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
          <p className="text-muted-foreground mt-1">Gestiona el equipo de trabajo de tus fincas.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-empleado"><Plus className="h-4 w-4 mr-2" />Nuevo Empleado</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-48" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(empleados || []).map(e => (
            <Card key={e.id} data-testid={`card-empleado-${e.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{e.nombre}</CardTitle>
                      <p className="text-sm text-muted-foreground">{e.cargo}</p>
                    </div>
                  </div>
                  <Badge variant={e.estado === "activo" ? "default" : "secondary"}>{e.estado}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {e.telefono && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" />{e.telefono}</div>}
                {e.fechaIngreso && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-3.5 w-3.5" />Ingreso: {formatDate(e.fechaIngreso)}</div>}
                <div className="text-sm font-semibold text-foreground">{formatCurrency(e.salarioBase)}/mes</div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(e)} data-testid={`button-edit-empleado-${e.id}`}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(e.id)} data-testid={`button-delete-empleado-${e.id}`}><Trash2 className="h-3.5 w-3.5 mr-1" />Eliminar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {empleados?.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">No hay empleados registrados.</div>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId !== null ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2"><Label>Nombre completo</Label><Input data-testid="input-nombre-empleado" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Cargo</Label><Input value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Salario base (COP)</Label><Input type="number" value={form.salarioBase} onChange={e => setForm(p => ({ ...p, salarioBase: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Telefono</Label><Input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Estado</Label><Input value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Fecha de ingreso</Label><Input type="date" value={form.fechaIngreso} onChange={e => setForm(p => ({ ...p, fechaIngreso: e.target.value }))} /></div>
              <div className="space-y-1"><Label>ID Finca</Label><Input type="number" value={form.fincaId} onChange={e => setForm(p => ({ ...p, fincaId: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-empleado" onClick={handleSubmit} disabled={createEmpleado.isPending || updateEmpleado.isPending}>{editId !== null ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
