import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, ExternalLink, GripVertical } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Candidate, RecruitmentRequest } from "@shared/schema";
import { PIPELINE_STAGES } from "@shared/schema";

const stageColors: Record<string, { bg: string; border: string; header: string }> = {
  applied: { bg: "bg-slate-50 dark:bg-slate-900/50", border: "border-slate-200 dark:border-slate-700", header: "bg-slate-100 dark:bg-slate-800" },
  screen: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", header: "bg-blue-100 dark:bg-blue-900/40" },
  interview: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", header: "bg-amber-100 dark:bg-amber-900/40" },
  offer: { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", header: "bg-green-100 dark:bg-green-900/40" },
  onboarding: { bg: "bg-teal-50 dark:bg-teal-900/20", border: "border-teal-200 dark:border-teal-800", header: "bg-teal-100 dark:bg-teal-900/40" },
  hired: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", header: "bg-emerald-100 dark:bg-emerald-900/40" },
  rejected: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", header: "bg-red-100 dark:bg-red-900/40" },
};

export default function Pipeline() {
  const [selectedRR, setSelectedRR] = useState<string>("all");
  const { toast } = useToast();

  const { data: recruitmentRequests, isLoading: rrLoading } = useQuery<RecruitmentRequest[]>({
    queryKey: ["/api/recruitment-requests"],
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      return apiRequest("PATCH", `/api/candidates/${id}/stage`, { stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update candidate stage",
        variant: "destructive",
      });
    },
  });

  const filteredCandidates = candidates?.filter(c => 
    selectedRR === "all" || c.rrId === selectedRR
  ) || [];

  const groupedCandidates = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = filteredCandidates.filter(c => c.currentStage === stage);
    return acc;
  }, {} as Record<string, Candidate[]>);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    updateStageMutation.mutate({
      id: draggableId,
      stage: destination.droppableId,
    });
  };

  const isLoading = rrLoading || candidatesLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Pipeline</h1>
          <p className="text-muted-foreground mt-1">Drag candidates between stages</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedRR} onValueChange={setSelectedRR}>
            <SelectTrigger className="w-[200px]" data-testid="select-filter-position">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {recruitmentRequests?.map(rr => (
                <SelectItem key={rr.id} value={rr.id}>{rr.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map(stage => (
            <div key={stage} className="min-w-[280px] max-w-[280px]">
              <Skeleton className="h-12 w-full mb-3" />
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map(stage => {
              const colors = stageColors[stage];
              const count = groupedCandidates[stage]?.length || 0;
              
              return (
                <div key={stage} className="min-w-[280px] max-w-[280px]">
                  <div className={`rounded-t-md px-3 py-2 ${colors.header}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm uppercase tracking-wide">
                        {stage}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  </div>
                  
                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[400px] rounded-b-md border p-2 ${colors.bg} ${colors.border} ${
                          snapshot.isDraggingOver ? "ring-2 ring-primary/30" : ""
                        }`}
                        data-testid={`pipeline-column-${stage}`}
                      >
                        <div className="space-y-2">
                          {groupedCandidates[stage]?.map((candidate, index) => (
                            <Draggable
                              key={candidate.id}
                              draggableId={candidate.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`cursor-grab ${
                                    snapshot.isDragging ? "shadow-lg ring-2 ring-primary/50" : ""
                                  }`}
                                  data-testid={`candidate-card-${candidate.id}`}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-2">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="mt-1 text-muted-foreground"
                                      >
                                        <GripVertical className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">
                                          {candidate.name}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                          <Mail className="h-3 w-3" />
                                          <span className="truncate">{candidate.email}</span>
                                        </div>
                                        {candidate.phone && (
                                          <div className="flex items-center gap-1 mt-0.5 text-sm text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{candidate.phone}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center justify-between gap-2 mt-2">
                                          {candidate.source && (
                                            <Badge variant="outline" className="text-xs">
                                              {candidate.source}
                                            </Badge>
                                          )}
                                          {candidate.resumeUrl && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              asChild
                                            >
                                              <a
                                                href={candidate.resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <ExternalLink className="h-3 w-3" />
                                              </a>
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
