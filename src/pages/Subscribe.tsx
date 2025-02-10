
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Subscribe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in first');
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      await checkSubscription(user.id);
    } catch (error: any) {
      console.error('Error checking user:', error);
      toast.error('Authentication error. Please sign in again.');
      navigate('/auth');
    }
  };

  const checkSubscription = async (uid: string) => {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      // Only redirect if there's an active subscription
      if (subscription?.status === 'active') {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
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
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { sessionUrl } = response.data;
      if (!sessionUrl) {
        throw new Error('No checkout session URL received');
      }

      window.location.href = sessionUrl;
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return null; // Wait for auth check
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>One-Time Payment Required</CardTitle>
          <CardDescription>
            Get full access to all features for just ₹5
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
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Lifetime access
            </li>
          </ul>
          <Button
            className="w-full"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Pay ₹5 Now'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscribe;
