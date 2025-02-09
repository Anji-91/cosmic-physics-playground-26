
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Subscribe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .single();

    if (subscription?.status === 'active') {
      navigate('/');
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in first');
        navigate('/auth');
        return;
      }

      const response = await supabase.functions.invoke('stripe', {
        body: {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { sessionUrl } = response.data;
      window.location.href = sessionUrl;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Subscribe to Continue</CardTitle>
          <CardDescription>
            Get full access to all features for just ₹5/month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Access to all features
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Priority support
            </li>
          </ul>
          <Button
            className="w-full"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Subscribe Now - ₹5/month'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscribe;
