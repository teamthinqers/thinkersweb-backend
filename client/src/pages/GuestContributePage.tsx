import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, CheckCircle2, Lightbulb } from "lucide-react";

// Guest contribution form schema
const guestContributionSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  guestLinkedInUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal('')),
  heading: z.string().min(1, "Heading is required").max(200, "Heading too long"),
  summary: z.string().min(1, "Your thought cannot be empty").max(5000, "Thought is too long (max 5000 characters)"),
});

type GuestContributionForm = z.infer<typeof guestContributionSchema>;

export default function GuestContributePage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Extract URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledName = urlParams.get('name') || '';
  const prefilledLinkedIn = urlParams.get('linkedin') || '';
  const isPreFilled = prefilledName !== '';

  const form = useForm<GuestContributionForm>({
    resolver: zodResolver(guestContributionSchema),
    defaultValues: {
      guestName: prefilledName,
      guestLinkedInUrl: prefilledLinkedIn,
      heading: "",
      summary: "",
    },
  });

  const contributeMutation = useMutation({
    mutationFn: async (data: GuestContributionForm) => {
      return apiRequest("POST", "/api/thoughts/guest", {
        ...data,
        contributorType: "guest",
        visibility: "social",
        channel: "guest",
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Thought Shared Successfully! 🎉",
        description: "Your contribution is now live on DotSpark Social.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GuestContributionForm) => {
    contributeMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2 border-green-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600 animate-bounce" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Thank You! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              Your thought has been shared with the DotSpark community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Your contribution is now visible on <strong>DotSpark Social</strong> and will inspire fellow thinkers.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button 
                onClick={() => window.location.href = 'https://www.dotspark.in/social'}
                className="bg-gradient-to-r from-amber-600 to-orange-600"
              >
                View on Social Feed
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsSubmitted(false)}
              >
                Share Another Thought
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 py-12">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lightbulb className="h-10 w-10 text-amber-600 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Share Your Thought
            </h1>
            <Sparkles className="h-10 w-10 text-orange-600 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Contribute to DotSpark Social - A collective intelligence network where thoughts spark insights
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Your Contribution</CardTitle>
            <CardDescription>
              Share your insights with thought leaders and learners on DotSpark
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        1. Your Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Dr. Jane Smith"
                          {...field}
                          className="text-base"
                          readOnly={isPreFilled}
                          disabled={isPreFilled}
                        />
                      </FormControl>
                      {isPreFilled && (
                        <FormDescription className="text-green-600">
                          ✓ Pre-filled for you
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* LinkedIn URL Field */}
                <FormField
                  control={form.control}
                  name="guestLinkedInUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        2. LinkedIn Profile URL <span className="text-gray-400">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.linkedin.com/in/yourprofile"
                          {...field}
                          className="text-base"
                          readOnly={isPreFilled}
                          disabled={isPreFilled}
                        />
                      </FormControl>
                      <FormDescription>
                        {isPreFilled 
                          ? "✓ Pre-filled - Your LinkedIn will be linked to your contribution" 
                          : "If provided, clicking your avatar will open your LinkedIn profile"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Heading Field */}
                <FormField
                  control={form.control}
                  name="heading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        3. Heading <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., The Power of Continuous Learning"
                          {...field}
                          className="text-base"
                        />
                      </FormControl>
                      <FormDescription>
                        A concise title for your thought (max 200 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Thought/Dot Field */}
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        4. Your Thought / Dot <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your insight, learning, or perspective..."
                          rows={6}
                          {...field}
                          className="text-base resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value.length} / 5000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={contributeMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-6 text-lg"
                >
                  {contributeMutation.isPending ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Share My Thought
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By sharing, you agree to make your contribution publicly visible on DotSpark Social.
          </p>
          <p className="mt-2">
            Want to explore more? Visit{" "}
            <a href="https://www.dotspark.in" className="text-amber-600 hover:underline font-semibold">
              www.dotspark.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
