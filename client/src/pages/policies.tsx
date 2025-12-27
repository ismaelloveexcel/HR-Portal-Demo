import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Plus, FileText, CheckCircle, Search, ExternalLink, Tag } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Policy, PolicyAck } from "@shared/schema";

const policyFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  version: z.string().optional(),
  summary: z.string().optional(),
  fileUrl: z.string().url().optional().or(z.literal("")),
  effectiveDate: z.string().optional(),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

const categories = [
  "HR Policies",
  "IT Security",
  "Code of Conduct",
  "Benefits",
  "Compliance",
  "Operations",
];

export default function Policies() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: policies, isLoading } = useQuery<Policy[]>({
    queryKey: ["/api/policies"],
  });

  const { data: myAcks } = useQuery<PolicyAck[]>({
    queryKey: ["/api/policy-acks"],
  });

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      title: "",
      category: "",
      version: "1.0",
      summary: "",
      fileUrl: "",
      effectiveDate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PolicyFormValues) => {
      return apiRequest("POST", "/api/policies", {
        ...data,
        status: "published",
        owner: user?.id,
        fileUrl: data.fileUrl || null,
        effectiveDate: data.effectiveDate || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Policy created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create policy",
        variant: "destructive",
      });
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (policyId: string) => {
      const policy = policies?.find((p) => p.id === policyId);
      return apiRequest("POST", "/api/policy-acks", {
        policyId,
        employeeId: user?.id || "unknown",
        version: policy?.version || "1.0",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policy-acks"] });
      toast({
        title: "Acknowledged",
        description: "Policy acknowledged successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to acknowledge policy",
        variant: "destructive",
      });
    },
  });

  const filteredPolicies = policies?.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const isAcknowledged = (policyId: string) => {
    return myAcks?.some((ack) => ack.policyId === policyId);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      review: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      published: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Policies</h1>
          <p className="text-muted-foreground mt-1">Company policies and guidelines</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-policy">
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Policy</DialogTitle>
              <DialogDescription>Add a new company policy</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Policy title" {...field} data-testid="input-policy-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-policy-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0" {...field} data-testid="input-policy-version" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="effectiveDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effective Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-policy-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description..." rows={3} {...field} data-testid="input-policy-summary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} data-testid="input-policy-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-policy">
                    {createMutation.isPending ? "Creating..." : "Create Policy"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-policies"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No policies found</p>
              <p className="text-sm">Add your first policy to get started</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPolicies.map((policy) => (
                <Card key={policy.id} className="flex flex-col" data-testid={`card-policy-${policy.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
                    </div>
                    <CardTitle className="text-base mt-3 line-clamp-2">{policy.title}</CardTitle>
                    {policy.summary && (
                      <CardDescription className="line-clamp-2">{policy.summary}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end pt-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                      {policy.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {policy.category}
                        </div>
                      )}
                      {policy.version && <span>v{policy.version}</span>}
                      {policy.effectiveDate && (
                        <span>Effective {format(new Date(policy.effectiveDate), "MMM d, yyyy")}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {policy.fileUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={policy.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`button-view-policy-${policy.id}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </a>
                        </Button>
                      )}
                      {isAcknowledged(policy.id) ? (
                        <Badge variant="outline" className="gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          Acknowledged
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => acknowledgeMutation.mutate(policy.id)}
                          disabled={acknowledgeMutation.isPending}
                          data-testid={`button-ack-policy-${policy.id}`}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
