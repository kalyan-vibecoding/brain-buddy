import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListChildren, useGetChildStats, useGetChildProgress, useListCompletions } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Clock, Trophy, Target, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ParentDashboard() {
  const { data: children, isLoading: childrenLoading } = useListChildren();
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id.toString());
    }
  }, [children, selectedChildId]);

  const childId = parseInt(selectedChildId, 10);
  
  const { data: stats, isLoading: statsLoading } = useGetChildStats(childId, {
    query: { enabled: !!childId }
  });
  
  const { data: progress, isLoading: progressLoading } = useGetChildProgress(childId, {
    query: { enabled: !!childId }
  });

  const { data: completions, isLoading: completionsLoading } = useListCompletions(childId, {
    query: { enabled: !!childId }
  });

  const isLoading = childrenLoading || statsLoading || progressLoading || completionsLoading;

  if (childrenLoading) {
    return <div className="p-8"><Skeleton className="h-8 w-48 mb-8" /></div>;
  }

  if (!children || children.length === 0) {
    return (
      <div className="min-h-[100dvh] p-8 flex flex-col items-center justify-center bg-muted/20">
        <h2 className="text-2xl font-bold mb-4">No children found</h2>
        <Link href="/create-child" className="text-primary hover:underline">Add a child to get started</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4 sticky top-0 z-10 flex items-center gap-4">
        <Link href="/select-child" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">Parent Dashboard</h1>
        
        <Select value={selectedChildId} onValueChange={setSelectedChildId}>
          <SelectTrigger className="w-[200px] h-12 rounded-xl bg-muted border-none font-bold">
            <SelectValue placeholder="Select child" />
          </SelectTrigger>
          <SelectContent>
            {children.map(child => (
              <SelectItem key={child.id} value={child.id.toString()} className="font-semibold">
                {child.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-3xl border-none shadow-sm bg-accent/10">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Stars</p>
              <h3 className="text-4xl font-black text-foreground">{stats?.totalStars || 0}</h3>
            </CardContent>
          </Card>
          
          <Card className="rounded-3xl border-none shadow-sm bg-primary/10">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Activities Today</p>
              <h3 className="text-4xl font-black text-foreground">{stats?.activitiesToday || 0}</h3>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-secondary/10">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Mins Today</p>
              <h3 className="text-4xl font-black text-foreground">{Math.round((stats?.timeSpentTodaySeconds || 0) / 60)}</h3>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-destructive/10">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-destructive" />
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Badges</p>
              <h3 className="text-4xl font-black text-foreground">{stats?.totalBadges || 0}</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Charts area */}
          <Card className="md:col-span-2 rounded-3xl shadow-sm border-card-border">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Weekly Stars</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {progressLoading ? (
                <Skeleton className="w-full h-full" />
              ) : progress?.weeklyStars && progress.weeklyStars.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progress.weeklyStars}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                      tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                    />
                    <YAxis 
                      hide
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="stars" fill="#F9A825" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold">
                  No data yet this week
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Breakdown */}
          <Card className="rounded-3xl shadow-sm border-card-border">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              {progressLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : progress?.activityBreakdown && progress.activityBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {progress.activityBreakdown.slice(0, 4).map((item) => (
                    <div key={item.activityType} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground capitalize">{item.activityType.replace('_', ' ')}</span>
                        <span className="text-sm text-muted-foreground">{item.count} plays</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-accent">
                        {item.totalStars} <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground font-semibold text-center py-8">
                  No activities played yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent History */}
        <Card className="rounded-3xl shadow-sm border-card-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            {completionsLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : completions && completions.length > 0 ? (
              <div className="space-y-4">
                {completions.slice(0, 5).map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-muted">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground capitalize">{comp.activityType.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{format(parseISO(comp.completedAt), 'MMM d, h:mm a')} • {comp.difficulty}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < comp.stars ? 'fill-accent text-accent' : 'fill-muted text-muted'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground font-semibold py-12">
                Your child hasn't completed any activities yet.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
