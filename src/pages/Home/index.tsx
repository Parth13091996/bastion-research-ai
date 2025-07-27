import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MyApp
        </h1>
        <nav className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link to="/contact">Contact</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/privacy-policy">Privacy</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/refund-policy">Refund</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/auth?mode=sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/auth?mode=sign-up">Sign Up</Link>
          </Button>
        </nav>
      </header>
      
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-4xl px-4">
          <h2 className="text-6xl font-bold text-foreground mb-6">
            Welcome to MyApp
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Your comprehensive platform for managing your business needs with advanced features and secure authentication
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Advanced user management with comprehensive profile data
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Complete user profiles with business information and preferences
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>
                  Flexible subscription options to meet your business needs
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/auth?mode=sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;