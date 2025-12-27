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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, Clock, CheckCircle2, XCircle, AlertCircle, Building2, Home, Plane } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { AttendanceLog } from "@shared/schema";

const attendanceFormSchema = z.object({
  date: z.string().min(1, "Please select a date"),
  timeIn: z.string().optional(),
  timeOut: z.string().optional(),
  workMode: z.string().min(1, "Please select work mode"),
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

export default function Attendance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: attendanceLogs, isLoading } = useQuery<AttendanceLog[]>({
    queryKey: ["/api/attendance"],
  });

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      timeIn: "",
      timeOut: "",
      workMode: "office",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AttendanceFormValues) => {
      return apiRequest("POST", "/api/attendance", {
        ...data,
        employeeId: user?.id || "unknown",
        timeIn: data.timeIn ? new Date(`${data.date}T${data.timeIn}`).toISOString() : null,
        timeOut: data.timeOut ? new Date(`${data.date}T${data.timeOut}`).toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Attendance recorded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      });
    },
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/attendance/clock-in", {
        employeeId: user?.id || "unknown",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Clocked In",
        description: `You clocked in at ${format(new Date(), "h:mm a")}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clock in",
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/attendance/clock-out", {
        employeeId: user?.id || "unknown",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Clocked Out",
        description: `You clocked out at ${format(new Date(), "h:mm a")}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clock out",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
      approved: { color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300", icon: CheckCircle2 },
      pending: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300", icon: AlertCircle },
      rejected: { color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300", icon: XCircle },
    };
    const { color, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getWorkModeIcon = (mode: string) => {
    switch (mode) {
      case "office":
        return <Building2 className="h-4 w-4" />;
      case "wfh":
        return <Home className="h-4 w-4" />;
      case "travel":
        return <Plane className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const todayLog = attendanceLogs?.find(
    (log) => log.date === format(new Date(), "yyyy-MM-dd") && log.employeeId === user?.id
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Attendance</h1>
          <p className="text-muted-foreground mt-1">Track your work hours</p>
        </div>
        <div className="flex items-center gap-3">
          {!todayLog?.timeIn ? (
            <Button
              onClick={() => clockInMutation.mutate()}
              disabled={clockInMutation.isPending}
              data-testid="button-clock-in"
            >
              <Clock className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          ) : !todayLog?.timeOut ? (
            <Button
              variant="outline"
              onClick={() => clockOutMutation.mutate()}
              disabled={clockOutMutation.isPending}
              data-testid="button-clock-out"
            >
              <Clock className="h-4 w-4 mr-2" />
              Clock Out
            </Button>
          ) : null}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-add-attendance">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Attendance Entry</DialogTitle>
                <DialogDescription>Record attendance for a specific date</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-attendance-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time In</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-attendance-time-in" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Out</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-attendance-time-out" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Mode</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-attendance-mode">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="wfh">Work From Home</SelectItem>
                            <SelectItem value="client">Client Site</SelectItem>
                            <SelectItem value="field">Field Work</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-attendance">
                      {createMutation.isPending ? "Adding..." : "Add Entry"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {todayLog && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Time In</p>
                <p className="text-lg font-semibold" data-testid="text-today-time-in">
                  {todayLog.timeIn ? format(new Date(todayLog.timeIn), "h:mm a") : "--:--"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Out</p>
                <p className="text-lg font-semibold" data-testid="text-today-time-out">
                  {todayLog.timeOut ? format(new Date(todayLog.timeOut), "h:mm a") : "--:--"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-lg font-semibold" data-testid="text-today-hours">
                  {todayLog.totalHours?.toFixed(1) || "--"} hrs
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Work Mode</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {getWorkModeIcon(todayLog.workMode || "office")}
                  <span className="font-medium capitalize">{todayLog.workMode || "Office"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !attendanceLogs?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No attendance records</p>
              <p className="text-sm">Start by clocking in</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead>Time Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`row-attendance-${log.id}`}>
                      <TableCell className="font-medium">
                        {format(new Date(log.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {log.timeIn ? format(new Date(log.timeIn), "h:mm a") : "--:--"}
                      </TableCell>
                      <TableCell>
                        {log.timeOut ? format(new Date(log.timeOut), "h:mm a") : "--:--"}
                      </TableCell>
                      <TableCell>{log.totalHours?.toFixed(1) || "--"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getWorkModeIcon(log.workMode || "office")}
                          <span className="capitalize">{log.workMode || "office"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
