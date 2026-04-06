import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListFincas,
  useCreateFinca,
  useUpdateFinca,
  useDeleteFinca,
  getListFincasQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Tractor, MapPin, Sprout } from "lucide-react";
import { formatNumber } from "@/lib/format";

type FincaForm = { nombre: string; ubicacion: string; hectareas: string; cultivo: string; estado: string; propietario: string };

const defaultForm: FincaForm = { nombre: "", ubicacion: "", hectareas: "", cultivo: "", estado: "activa", propietario: "" };

export default function Fincas() {
  const { data: fincas, isLoading } = useListFincas();
  const createFinca = useCreateFinca();
  const updateFinca = useUpdateFinca();
  const deleteFinca = useDeleteFinca();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FincaForm>(defaultForm);

  function openCreate() {
    setEditId(null);
    setForm(defaultForm);
    setOpen(true);
  }

  function openEdit(f: NonNullable<typeof fincas>[0]) {
    setEditId(f.id);
    setForm({
      nombre: f.nombre,
      ubicacion: f.ubicacion,
      hectareas: String(f.hectareas),
      cultivo: f.cultivo,
      estado: f.estado,
      propietario: f.propietario ?? "",
    });
    setOpen(true);
  }

  function handleSubmit() {
    const data = {
      nombre: form.nombre,
      ubicacion: form.ubicacion,
      hectareas: parseFloat(form.hectareas),
      cultivo: form.cultivo,
      estado: form.estado,
      propietario: form.propietario || undefined,
    };
    if (editId !== null) {
      updateFinca.mutate({ id: editId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFincasQueryKey() });
          toast({ title: "Finca actualizada" });
          setOpen(false);
        },
        onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
      });
    } else {
      createFinca.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFincasQueryKey() });
          toast({ title: "Finca creada" });
          setOpen(false);
        },
        onError: () => toast({ title: "Error al crear", variant: "destructive" }),
      });
    }
  }

  function handleDelete(id: number) {
    deleteFinca.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFincasQueryKey() });
        toast({ title: "Finca eliminada" });
      },
      onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fincas</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus propiedades agricolas.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-finca">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Finca
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(fincas || []).map(f => (
            <Card key={f.id} data-testid={`card-finca-${f.id}`} className="group relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tractor className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{f.nombre}</CardTitle>
                      {f.propietario && <p className="text-xs text-muted-foreground">{f.propietario}</p>}
                    </div>
                  </div>
                  <Badge variant={f.estado === "activa" ? "default" : "secondary"}>{f.estado}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{f.ubicacion}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sprout className="h-3.5 w-3.5" />
                  <span>{f.cultivo}</span>
                </div>
                <div className="text-sm font-medium">{formatNumber(f.hectareas)} ha</div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(f)} data-testid={`button-edit-finca-${f.id}`}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(f.id)} data-testid={`button-delete-finca-${f.id}`}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {fincas?.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">No hay fincas registradas.</div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId !== null ? "Editar Finca" : "Nueva Finca"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input data-testid="input-nombre-finca" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre de la finca" />
            </div>
            <div className="space-y-1">
              <Label>Ubicacion</Label>
              <Input value={form.ubicacion} onChange={e => setForm(p => ({ ...p, ubicacion: e.target.value }))} placeholder="Departamento, municipio" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Hectareas</Label>
                <Input type="number" value={form.hectareas} onChange={e => setForm(p => ({ ...p, hectareas: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label>Cultivo principal</Label>
                <Input value={form.cultivo} onChange={e => setForm(p => ({ ...p, cultivo: e.target.value }))} placeholder="Cafe, Platano..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Estado</Label>
                <Input value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))} placeholder="activa" />
              </div>
              <div className="space-y-1">
                <Label>Propietario</Label>
                <Input value={form.propietario} onChange={e => setForm(p => ({ ...p, propietario: e.target.value }))} placeholder="Nombre del propietario" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-finca" onClick={handleSubmit} disabled={createFinca.isPending || updateFinca.isPending}>
              {editId !== null ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
