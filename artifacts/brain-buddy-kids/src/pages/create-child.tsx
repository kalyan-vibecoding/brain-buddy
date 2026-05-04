import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useCreateChild, getListChildrenQueryKey } from "@workspace/api-client-react";
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

const COLORS = [
  "#005FCC", // Primary
  "#2E7D32", // Secondary
  "#F9A825", // Accent
  "#C62828", // Red
  "#00796B", // Teal
  "#8E24AA", // Purple
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.coerce.number().min(4, "Age must be at least 4").max(8, "Age must be at most 8"),
  avatarColor: z.string(),
});

export default function CreateChild() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateChild();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: 4,
      avatarColor: COLORS[0],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey() });
          toast({
            title: "Child profile created!",
            description: `${values.name} is ready to play.`,
          });
          setLocation("/select-child");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to create profile",
            description: error.error || "Please try again.",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6">
      <motion.div 
        className="w-full max-w-[400px] bg-card rounded-3xl p-8 shadow-xl border border-card-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/select-child" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Add a Child</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Alex" 
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
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Age (4-8)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={4} max={8}
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
              name="avatarColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Pick a Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-3 flex-wrap justify-between">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-12 h-12 rounded-full border-4 transition-transform ${field.value === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-14 text-xl rounded-full font-bold shadow-md mt-4"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Let's Go!"}
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
