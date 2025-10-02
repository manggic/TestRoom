import { useState } from 'react';
import Navbar from './Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabaseClient } from '@/supabase/config';
import { toast } from 'sonner';
import { isEmailValid } from '@/lib/utils';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!isEmailValid(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) toast.error(error.message);
    else toast.success('📩 Check your email for a password reset link!');
  };
  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background px-4 py-8">
        <Card className="w-full max-w-lg shadow-lg border border-muted backdrop-blur-md bg-white/5 rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl sm:text-3xl font-bold">🏢 Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            <>
              <Label htmlFor="email" className="pb-3">
                Enter Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@org.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button className="w-full mt-4" onClick={handleReset}>
                Send Reset Link
              </Button>
              {/* {message && <p className="text-sm text-center">{message}</p>} */}
            </>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
