import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, Clock, FileText, Shield, Zap } from "lucide-react";

export function LandingPage() {
  const features = [
    {
      icon: ClipboardList,
      title: "Recruitment Pipeline",
      description: "Track candidates through every stage with our intuitive Kanban board",
    },
    {
      icon: Users,
      title: "Candidate Management",
      description: "Organize profiles, resumes, and interview schedules in one place",
    },
    {
      icon: Clock,
      title: "Attendance Tracking",
      description: "Monitor time entries, WFH approvals, and work modes easily",
    },
    {
      icon: FileText,
      title: "Policy Management",
      description: "Publish, version, and track acknowledgments for company policies",
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Role-based permissions with audit logging for compliance",
    },
    {
      icon: Zap,
      title: "Self-Service Portal",
      description: "Empower employees to submit requests and access documents",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <span className="text-lg font-bold text-primary-foreground">B</span>
            </div>
            <span className="text-xl font-semibold">Baynunah HR</span>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </header>

      <main>
        <section className="py-20 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Modern HR Management
              <span className="block text-primary">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your hiring, attendance, and employee management with our comprehensive
              HR portal built for growing teams.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login">Get Started</a>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Everything You Need</h2>
              <p className="mt-3 text-muted-foreground">
                A complete suite of HR tools designed for efficiency
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="border-0 shadow-none bg-card">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Ready to Transform Your HR?</h2>
            <p className="mt-4 text-muted-foreground">
              Join teams who trust Baynunah HR to manage their workforce efficiently.
            </p>
            <Button size="lg" className="mt-8" asChild data-testid="button-cta-signin">
              <a href="/api/login">Sign In to Get Started</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">Concept by HR</span>
            <span className="text-muted-foreground">|</span>
            <span className="font-semibold text-accent">IS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Baynunah HR Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
