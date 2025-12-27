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
import { Plus, FolderOpen, Download, Search, FileIcon, FileSpreadsheet, FileText as FileTextIcon } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@shared/schema";

const templateFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  fileUrl: z.string().url("Please enter a valid URL").min(1, "File URL is required"),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

const templateCategories = [
  "Employment",
  "Onboarding",
  "Performance",
  "Leave",
  "Finance",
  "Legal",
  "General",
];

export default function Templates() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      fileUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      return apiRequest("POST", "/api/templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Template added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add template",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = templates?.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const getFileIcon = (url: string | null) => {
    if (!url) return FileIcon;
    if (url.includes(".xlsx") || url.includes(".xls") || url.includes("spreadsheet")) {
      return FileSpreadsheet;
    }
    if (url.includes(".doc") || url.includes(".pdf")) {
      return FileTextIcon;
    }
    return FileIcon;
  };

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      Employment: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      Onboarding: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      Performance: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      Leave: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
      Finance: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
      Legal: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
      General: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
    return colors[category || "General"] || colors.General;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Templates</h1>
          <p className="text-muted-foreground mt-1">Download HR document templates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-template">
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Template</DialogTitle>
              <DialogDescription>Add a new document template</DialogDescription>
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
                        <Input placeholder="Template name" {...field} data-testid="input-template-title" />
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
                          <SelectTrigger data-testid="select-template-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templateCategories.map((cat) => (
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
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description..." rows={2} {...field} data-testid="input-template-description" />
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
                      <FormLabel>File URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} data-testid="input-template-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-template">
                    {createMutation.isPending ? "Adding..." : "Add Template"}
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
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-templates"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-template-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {templateCategories.map((cat) => (
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No templates found</p>
              <p className="text-sm">Add your first template to get started</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template) => {
                const FileIconComponent = getFileIcon(template.fileUrl);
                return (
                  <Card
                    key={template.id}
                    className="group flex flex-col hover-elevate"
                    data-testid={`card-template-${template.id}`}
                  >
                    <CardContent className="flex-1 flex flex-col pt-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <FileIconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold line-clamp-2">{template.title}</p>
                          {template.category && (
                            <Badge className={`mt-1.5 ${getCategoryColor(template.category)}`}>
                              {template.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2 mt-auto">
                        <span className="text-xs text-muted-foreground">
                          {template.updatedAt && format(new Date(template.updatedAt), "MMM d, yyyy")}
                        </span>
                        {template.fileUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={template.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              data-testid={`button-download-template-${template.id}`}
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
