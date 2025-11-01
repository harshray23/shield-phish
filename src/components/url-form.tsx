
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { AnalysisState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { analyzeUrl } from '@/app/actions';

const FormSchema = z.object({
  url: z.string().url({
    message: 'Please enter a valid URL, including http:// or https://',
  }),
});

interface UrlFormProps {
  setAnalysis: (state: AnalysisState) => void;
}

export function UrlForm({ setAnalysis }: UrlFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      url: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setAnalysis({ status: 'loading', data: null, error: null });
    
    try {
      const result = await analyzeUrl(data.url);
      
      if (result.success) {
        setAnalysis({ status: 'success', data: result.data, error: null });
      } else {
        const errorMessage = result.error || 'An unknown error occurred.';
        setAnalysis({ status: 'error', data: null, error: errorMessage });
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = 'Failed to connect to the analysis service.';
      setAnalysis({ status: 'error', data: null, error: errorMessage });
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: errorMessage,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="https://your-site.com"
                    {...field}
                    className={cn(
                      "h-14 pl-12 pr-28 text-base rounded-full bg-card/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/60 focus:border-primary/80 transition-all",
                      "focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:ring-offset-background"
                    )}
                  />
                  <Button type="submit" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-6 btn-glow" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <span>Analyze</span>
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="pl-4"/>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
