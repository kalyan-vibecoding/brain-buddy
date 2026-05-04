import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChildProvider } from "@/lib/child-context";
import { ParentAuthWrapper, ChildAuthWrapper } from "@/components/auth-wrapper";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import SelectChild from "@/pages/select-child";
import CreateChild from "@/pages/create-child";
import ParentDashboard from "@/pages/parent-dashboard";
import Progress from "@/pages/progress";
import ChildProfile from "@/pages/child-profile";

import ActivitiesList from "@/pages/activities/index";
import MatchShape from "@/pages/activities/match-shape";
import OddOneOut from "@/pages/activities/odd-one-out";
import MemoryCards from "@/pages/activities/memory-cards";
import CountObjects from "@/pages/activities/count-objects";
import PatternBuilder from "@/pages/activities/pattern-builder";
import LetterSound from "@/pages/activities/letter-sound";
import BrainTeaser from "@/pages/activities/brain-teaser";
import ReadingWords from "@/pages/activities/reading-words";

import Celebration from "@/pages/celebration";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function wrap(component: React.ReactNode) {
  return () => (
    <ParentAuthWrapper>
      <ChildAuthWrapper>{component}</ChildAuthWrapper>
    </ParentAuthWrapper>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected Parent Routes */}
      <Route path="/select-child">
        {() => <ParentAuthWrapper><SelectChild /></ParentAuthWrapper>}
      </Route>
      <Route path="/create-child">
        {() => <ParentAuthWrapper><CreateChild /></ParentAuthWrapper>}
      </Route>
      <Route path="/parent-dashboard">
        {() => <ParentAuthWrapper><ParentDashboard /></ParentAuthWrapper>}
      </Route>

      {/* Protected Child Routes */}
      <Route path="/activities"        component={wrap(<ActivitiesList />)} />
      <Route path="/activities/match-shape"     component={wrap(<MatchShape />)} />
      <Route path="/activities/odd-one-out"     component={wrap(<OddOneOut />)} />
      <Route path="/activities/memory-cards"    component={wrap(<MemoryCards />)} />
      <Route path="/activities/count-objects"   component={wrap(<CountObjects />)} />
      <Route path="/activities/pattern-builder" component={wrap(<PatternBuilder />)} />
      <Route path="/activities/letter-sound"    component={wrap(<LetterSound />)} />
      <Route path="/activities/brain-teaser"    component={wrap(<BrainTeaser />)} />
      <Route path="/activities/reading-words"   component={wrap(<ReadingWords />)} />
      <Route path="/progress"      component={wrap(<Progress />)} />
      <Route path="/child-profile" component={wrap(<ChildProfile />)} />
      <Route path="/celebration"   component={wrap(<Celebration />)} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChildProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ChildProvider>
    </QueryClientProvider>
  );
}

export default App;
