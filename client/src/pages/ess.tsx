import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { format } from "date-fns";
import { Plus, MessageSquare, FileText, Calendar, Clock, Inbox } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { EssRequest } from "@shared/schema";

const requestFormSchema = z.object({
  type: z.string().min(1, "Please select a request type"),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

const requestTypes = [
  { value: "leave", label: "Leave Request", icon: Calendar },
  { value: "expense", label: "Expense Claim", icon: FileText },
  { value: "overtime", label: "Overtime Request", icon: Clock },
  { value: "wfh", label: "Work From Home", icon: Inbox },
  { value: "feedback", label: "Feedback/Complaint", icon: MessageSquare },
  { value: "other", label: "Other", icon: FileText },
];

export default function ESS() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: requests, isLoading } = useQuery<EssRequest[]>({
    queryKey: ["/api/ess"],
  });

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      type: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RequestFormValues) => {
      return apiRequest("POST", "/api/ess", {
        ...data,
        employeeId: user?.id || "unknown",
        payload: { description: data.description },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ess"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Request submitted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      approved: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
      completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
    return colors[status] || colors.open;
  };

  const getTypeInfo = (type: string) => {
    return requestTypes.find((t) => t.value === type) || requestTypes[requestTypes.length - 1];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Self-Service</h1>
          <p className="text-muted-foreground mt-1">Submit and track your HR requests</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-request">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit Request</DialogTitle>
              <DialogDescription>Fill in the details for your HR request</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-request-type">
                            <SelectValue placeholder="Select request type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {requestTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details about your request..."
                          rows={4}
                          {...field}
                          data-testid="input-request-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-request">
                    {createMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requestTypes.slice(0, 6).map((type) => {
          const count = requests?.filter((r) => r.type === type.value && r.status === "open").length || 0;
          return (
            <Card
              key={type.value}
              className="cursor-pointer hover-elevate"
              onClick={() => {
                form.setValue("type", type.value);
                setIsDialogOpen(true);
              }}
              data-testid={`card-quick-${type.value}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <type.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{type.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {count > 0 ? `${count} open` : "Submit new"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>Track the status of your submitted requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !requests?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No requests yet</p>
              <p className="text-sm">Submit your first request above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const typeInfo = getTypeInfo(request.type);
                return (
                  <div
                    key={request.id}
                    className="flex items-start gap-4 p-4 rounded-md border bg-card"
                    data-testid={`request-${request.id}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <typeInfo.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{typeInfo.label}</p>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </div>
                      {request.payload && typeof request.payload === "object" && "description" in request.payload && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {String(request.payload.description)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Submitted {request.createdAt && format(new Date(request.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
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
