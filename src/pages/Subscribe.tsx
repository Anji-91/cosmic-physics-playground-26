
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Subscribe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Please sign in first');
        navigate('/auth');
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User error:', userError);
        toast.error('Authentication error. Please sign in again.');
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }

      setUserId(user.id);
      await checkSubscription(user.id);
    } catch (error: any) {
      console.error('Error checking user:', error);
      toast.error('Authentication error. Please sign in again.');
      navigate('/auth');
    } finally {
      setPageLoading(false);
    }
  };

  const checkSubscription = async (uid: string) => {
    try {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', uid);

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      // Check if there's an active subscription in the results
      const activeSubscription = subscriptions?.find(sub => sub.status === 'active');
      if (activeSubscription) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Please sign in first');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('Stripe function response:', { data, error }); // Debug log

      if (error) {
        console.error('Stripe function error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.sessionUrl) {
        throw new Error('No checkout session URL received');
      }

      // Redirect to Stripe checkout
      window.location.href = data.sessionUrl;
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        Loading...
      </div>
    );
  }

  if (!userId) {
    return null;
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
