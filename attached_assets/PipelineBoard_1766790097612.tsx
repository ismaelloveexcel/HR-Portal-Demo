import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { api } from "../api";

const STAGES = ["applied","screen","interview","offer","onboarding","hired","rejected"];

export const PipelineBoard: React.FC<{ rrId: string; token: string; canMove: boolean; }> = ({ rrId, token, canMove }) => {
  const [items, setItems] = useState<Record<string, any[]>>({});

  const load = () => api(`/candidates/by-rr/${rrId}`, token).then((cands) => {
    const grouped: Record<string, any[]> = {};
    STAGES.forEach(s => grouped[s] = []);
    cands.forEach((c: any) => grouped[c.current_stage]?.push(c));
    setItems(grouped);
  });

  useEffect(load, [rrId, token]);

  const onDragEnd = async (res: DropResult) => {
    if (!canMove) return;
    const { destination, source, draggableId } = res;
    if (!destination || destination.droppableId === source.droppableId) return;
    await api(`/candidates/${draggableId}/stage`, token, { method: "POST", body: JSON.stringify({ new_stage: destination.droppableId }) });
    load();
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
        {STAGES.map(stage => (
          <Droppable droppableId={stage} key={stage}>
            {(prov) => (
              <div ref={prov.innerRef} {...prov.droppableProps} style={{ minWidth: 220, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8 }}>
                <h4 style={{ color: "#0F3D91" }}>{stage.toUpperCase()}</h4>
                {items[stage]?.map((c, idx) => (
                  <Draggable key={c.id} draggableId={c.id} index={idx} isDragDisabled={!canMove}>
                    {(p) => (
                      <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                        style={{ background: "#fff", marginBottom: 8, padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", ...p.draggableProps.style }}>
                        <div style={{ fontWeight: 700, color: "#0F3D91" }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>{c.email}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {prov.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};