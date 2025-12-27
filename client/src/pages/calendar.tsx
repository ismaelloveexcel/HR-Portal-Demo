import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";
import { Plus, Clock, Video, MapPin, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Interview, Candidate, AvailabilitySlot } from "@shared/schema";

const interviewFormSchema = z.object({
  candidateId: z.string().min(1, "Please select a candidate"),
  slotTime: z.string().min(1, "Please select a time"),
  durationMinutes: z.coerce.number().min(15).max(180),
  mode: z.string().min(1, "Please select a mode"),
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

export default function CalendarPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ["/api/interviews"],
  });

  const { data: candidates } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      candidateId: "",
      slotTime: "",
      durationMinutes: 30,
      mode: "video",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InterviewFormValues) => {
      return apiRequest("POST", "/api/interviews", {
        ...data,
        slotTime: new Date(data.slotTime).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Interview scheduled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule interview",
        variant: "destructive",
      });
    },
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getInterviewsForDay = (date: Date) => {
    return interviews?.filter((interview) => {
      if (!interview.slotTime) return false;
      return isSameDay(new Date(interview.slotTime), date);
    }) || [];
  };

  const getCandidateName = (candidateId: string | null) => {
    if (!candidateId) return "Unknown";
    const candidate = candidates?.find((c) => c.id === candidateId);
    return candidate?.name || "Unknown";
  };

  const getModeIcon = (mode: string | null) => {
    switch (mode) {
      case "video":
        return <Video className="h-3.5 w-3.5" />;
      case "in-person":
        return <MapPin className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      completed: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    };
    return colors[status] || colors.scheduled;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage interviews and availability</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-schedule-interview">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>Set up a new interview session</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="candidateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Candidate</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-interview-candidate">
                            <SelectValue placeholder="Select a candidate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {candidates?.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slotTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} data-testid="input-interview-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <Select onValueChange={field.onChange} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger data-testid="select-interview-duration">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-interview-mode">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">Video Call</SelectItem>
                          <SelectItem value="in-person">In Person</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-interview">
                    {createMutation.isPending ? "Scheduling..." : "Schedule"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                data-testid="button-prev-week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                data-testid="button-next-week"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              data-testid="button-today"
            >
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayInterviews = getInterviewsForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[180px] rounded-md border p-2 ${
                      isToday ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {format(day, "EEE")}
                      </span>
                      <span className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {dayInterviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="rounded-md bg-muted/80 p-2 text-xs"
                          data-testid={`interview-${interview.id}`}
                        >
                          <div className="flex items-center gap-1 font-medium truncate">
                            {getModeIcon(interview.mode)}
                            <span className="truncate">{getCandidateName(interview.candidateId)}</span>
                          </div>
                          <div className="text-muted-foreground mt-0.5">
                            {interview.slotTime && format(new Date(interview.slotTime), "h:mm a")}
                            <span className="mx-1">·</span>
                            {interview.durationMinutes}m
                          </div>
                          <Badge className={`mt-1 text-[10px] ${getStatusColor(interview.status)}`}>
                            {interview.status}
                          </Badge>
                        </div>
                      ))}
                      {dayInterviews.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No interviews
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
