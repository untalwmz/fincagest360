import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListLotes, useListFincas, useCreateLote, useUpdateLote, useDeleteLote, getListLotesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Map } from "lucide-react";
import { formatNumber } from "@/lib/format";

type Form = { fincaId: string; nombre: string; hectareas: string; cultivo: string; estado: string };
const defaultForm: Form = { fincaId: "", nombre: "", hectareas: "", cultivo: "", estado: "activo" };

export default function Lotes() {
  const { data: lotes, isLoading } = useListLotes();
  const { data: fincas } = useListFincas();
  const createLote = useCreateLote();
  const updateLote = useUpdateLote();
  const deleteLote = useDeleteLote();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(defaultForm);
  const [fincaFilter, setFincaFilter] = useState<string>("all");

  const fincaMap = Object.fromEntries((fincas || []).map(f => [f.id, f.nombre]));
  const filtered = (lotes || []).filter(l => fincaFilter === "all" || String(l.fincaId) === fincaFilter);

  function openCreate() { setEditId(null); setForm(defaultForm); setOpen(true); }
  function openEdit(l: NonNullable<typeof lotes>[0]) {
    setEditId(l.id);
    setForm({ fincaId: String(l.fincaId), nombre: l.nombre, hectareas: String(l.hectareas), cultivo: l.cultivo, estado: l.estado });
    setOpen(true);
  }

  function handleSubmit() {
    const data = { fincaId: parseInt(form.fincaId), nombre: form.nombre, hectareas: parseFloat(form.hectareas), cultivo: form.cultivo, estado: form.estado };
    if (editId !== null) {
      updateLote.mutate({ id: editId, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListLotesQueryKey() }); toast({ title: "Lote actualizado" }); setOpen(false); },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      });
    } else {
      createLote.mutate({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListLotesQueryKey() }); toast({ title: "Lote creado" }); setOpen(false); },
        onError: () => toast({ title: "Error", variant: "destructive" }),
      });
    }
  }

  function handleDelete(id: number) {
    deleteLote.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListLotesQueryKey() }); toast({ title: "Lote eliminado" }); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lotes</h1>
          <p className="text-muted-foreground mt-1">Gestiona las parcelas de tus fincas.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-lote"><Plus className="h-4 w-4 mr-2" />Nuevo Lote</Button>
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-sm">Filtrar por finca:</Label>
        <Select value={fincaFilter} onValueChange={setFincaFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fincas</SelectItem>
            {(fincas || []).map(f => <SelectItem key={f.id} value={String(f.id)}>{f.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(l => (
            <Card key={l.id} data-testid={`card-lote-${l.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Map className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{l.nombre}</CardTitle>
                      <p className="text-xs text-muted-foreground">{fincaMap[l.fincaId] ?? `Finca #${l.fincaId}`}</p>
                    </div>
                  </div>
                  <Badge variant={l.estado === "activo" ? "default" : "secondary"}>{l.estado}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">Cultivo: <span className="text-foreground font-medium">{l.cultivo}</span></div>
                <div className="text-sm font-semibold">{formatNumber(l.hectareas)} ha</div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(l)} data-testid={`button-edit-lote-${l.id}`}><Pencil className="h-3.5 w-3.5 mr-1" />Editar</Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(l.id)} data-testid={`button-delete-lote-${l.id}`}><Trash2 className="h-3.5 w-3.5 mr-1" />Eliminar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">No hay lotes registrados.</div>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId !== null ? "Editar Lote" : "Nuevo Lote"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Finca</Label>
              <Select value={form.fincaId} onValueChange={v => setForm(p => ({ ...p, fincaId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona finca" /></SelectTrigger>
                <SelectContent>{(fincas || []).map(f => <SelectItem key={f.id} value={String(f.id)}>{f.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Nombre del lote</Label><Input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Hectareas</Label><Input type="number" value={form.hectareas} onChange={e => setForm(p => ({ ...p, hectareas: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Cultivo</Label><Input value={form.cultivo} onChange={e => setForm(p => ({ ...p, cultivo: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Estado</Label><Input value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button data-testid="button-submit-lote" onClick={handleSubmit} disabled={createLote.isPending || updateLote.isPending}>{editId !== null ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
