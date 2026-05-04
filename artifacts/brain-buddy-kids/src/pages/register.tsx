import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useRegisterParent, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { saveToken } from "@/lib/auth-token";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const registerMutation = useRegisterParent();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    registerMutation.mutate(
      { data: values },
      {
        onSuccess: (parent) => {
          if (parent.token) {
            saveToken(parent.token);
          }
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "Account created!", description: "Welcome to BrainBuddy Kids." });
          setLocation("/select-child");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "An error occurred. Please try again.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6">
      <motion.div
        className="w-full max-w-[400px] bg-card rounded-3xl p-8 shadow-xl border border-card-border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </Link>

        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Create Account</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Your Name</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-name"
                      placeholder="Jane Doe"
                      className="h-14 rounded-2xl text-lg px-4 bg-muted border-transparent focus:bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Email</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-email"
                      placeholder="parent@example.com"
                      className="h-14 rounded-2xl text-lg px-4 bg-muted border-transparent focus:bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Password</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 rounded-2xl text-lg px-4 bg-muted border-transparent focus:bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              data-testid="button-register"
              type="submit"
              className="w-full h-14 text-xl rounded-full font-bold shadow-md"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Register"}
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
