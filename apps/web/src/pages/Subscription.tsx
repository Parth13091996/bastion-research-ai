import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₹999',
    period: 'month',
    description: 'Perfect for small businesses',
    features: [
      'Up to 10 users',
      'Basic analytics',
      'Email support',
      '5GB storage',
      'Standard templates'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '₹2999',
    period: 'month',
    description: 'Best for growing businesses',
    features: [
      'Up to 50 users',
      'Advanced analytics',
      'Priority support',
      '50GB storage',
      'Custom templates',
      'API access',
      'Advanced reporting'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₹9999',
    period: 'month',
    description: 'For large organizations',
    features: [
      'Unlimited users',
      'Enterprise analytics',
      '24/7 phone support',
      'Unlimited storage',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced security',
      'SLA guarantee'
    ],
    popular: false
  }
]

const Subscription = () => {
  const [currentPlan] = useState('basic') // This would come from your database

  const handleSubscribe = (planId: string) => {
    // Handle subscription logic here
    console.log('Subscribing to plan:', planId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Subscription Plans</h1>
            <p className="text-muted-foreground mt-2">Choose the plan that fits your needs</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Current Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold capitalize">{currentPlan} Plan</h3>
                <p className="text-muted-foreground">
                  {subscriptionPlans.find(p => p.id === currentPlan)?.description}
                </p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.id === currentPlan ? "outline" : plan.popular ? "default" : "outline"}
                  disabled={plan.id === currentPlan}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {plan.id === currentPlan ? 'Current Plan' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Billing Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Manage your billing details and payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Next Billing Date</h4>
                  <p className="text-muted-foreground">January 15, 2024</p>
                </div>
                <div>
                  <h4 className="font-semibold">Payment Method</h4>
                  <p className="text-muted-foreground">•••• •••• •••• 1234</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline">Update Payment Method</Button>
                <Button variant="outline">Download Invoice</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Subscription