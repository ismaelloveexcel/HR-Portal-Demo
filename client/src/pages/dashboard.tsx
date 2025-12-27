import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ClipboardList, Clock, FileText, TrendingUp, Calendar } from "lucide-react";
import type { Candidate, RecruitmentRequest, AttendanceLog, Policy } from "@shared/schema";

export default function Dashboard() {
  const { data: candidates, isLoading: candidatesLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: recruitmentRequests, isLoading: rrLoading } = useQuery<RecruitmentRequest[]>({
    queryKey: ["/api/recruitment-requests"],
  });

  const { data: attendanceLogs, isLoading: attendanceLoading } = useQuery<AttendanceLog[]>({
    queryKey: ["/api/attendance"],
  });

  const { data: policies, isLoading: policiesLoading } = useQuery<Policy[]>({
    queryKey: ["/api/policies"],
  });

  const isLoading = candidatesLoading || rrLoading || attendanceLoading || policiesLoading;

  const stats = [
    {
      title: "Active Candidates",
      value: candidates?.filter(c => c.currentStage !== "hired" && c.currentStage !== "rejected").length || 0,
      icon: Users,
      description: "In pipeline",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Open Positions",
      value: recruitmentRequests?.filter(r => r.status === "open").length || 0,
      icon: ClipboardList,
      description: "Hiring now",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Today's Attendance",
      value: attendanceLogs?.filter(a => {
        const today = new Date().toISOString().split("T")[0];
        return a.date === today;
      }).length || 0,
      icon: Clock,
      description: "Checked in",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Active Policies",
      value: policies?.filter(p => p.status === "published").length || 0,
      icon: FileText,
      description: "Published",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  const recentCandidates = candidates?.slice(0, 5) || [];
  const openPositions = recruitmentRequests?.filter(r => r.status === "open").slice(0, 5) || [];

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      applied: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      screen: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      interview: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      offer: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      onboarding: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
      hired: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    };
    return colors[stage] || colors.applied;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your HR command center</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-md p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-3xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Candidates
                </CardTitle>
                <CardDescription>Latest applicants in your pipeline</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {candidatesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentCandidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No candidates yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCandidates.map(candidate => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                    data-testid={`candidate-row-${candidate.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                    </div>
                    <Badge className={`shrink-0 ${getStageColor(candidate.currentStage)}`}>
                      {candidate.currentStage}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Open Positions
                </CardTitle>
                <CardDescription>Active recruitment requests</CardDescription>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {rrLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : openPositions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No open positions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openPositions.map(rr => (
                  <div
                    key={rr.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                    data-testid={`position-row-${rr.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rr.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {rr.department} {rr.location && `· ${rr.location}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{rr.level || "N/A"}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
