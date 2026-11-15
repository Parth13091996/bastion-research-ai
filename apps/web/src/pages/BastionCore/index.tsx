import { fetchPlans } from '@/api/onboarding-apis';
import { useAuth } from '@/contexts/AuthContext';
import SignUpForm from '@/pages/Register/SignupForm';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import CoreTestimonials from './CoreTestimonials';
import { useNavigate } from 'react-router-dom';
import content from './core-content.html?raw';
import './core-styles.css';

const money = (amount: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(amount);

export default function BastionCoreProductPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [testimonialSlot, setTestimonialSlot] = useState<HTMLElement | null>(null);
  const [preferredPlan, setPreferredPlan] = useState<string>();
  const { data: plans = [], isError } = useQuery({
    queryKey: ['core-landing-plans'], queryFn: fetchPlans, staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const initialPlanCode = plans.find((plan) => plan.plan_code === preferredPlan)?.code;

  useEffect(() => {
    setTestimonialSlot(container.current?.querySelector<HTMLElement>('[data-core-testimonials]') || null);
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Bastion CORE — Independent Equity Research';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    for (const plan of plans) {
      const card = container.current?.querySelector(`[data-plan-card="${plan.plan_code}"]`);
      const price = card?.querySelector('.price');
      if (price && Number.isFinite(Number(plan.amount))) price.textContent = `${money(Number(plan.amount))}/-`;
      if (plan.plan_code === 'core') container.current?.querySelectorAll('[data-start-price]').forEach((element) => {
        element.textContent = `Subscribe starting at ${money(Number(plan.amount))}`;
      });
    }
  }, [plans]);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as Element).closest<HTMLAnchorElement>('a');
    if (!target || !container.current?.contains(target)) return;
    const requested = target.dataset.plan;
    const sample = target.dataset.sample === 'true';
    if (requested || sample) {
      event.preventDefault();
      if (isAuthenticated) {
        navigate(sample ? '/user/app/recommendation' : '/user/app/account/subscription');
        return;
      }
      setPreferredPlan(sample ? 'freemium' : requested);
      setIsSignUpOpen(true);
      return;
    }
    if (target.hash && target.getAttribute('href')?.startsWith('#')) {
      const destination = container.current.querySelector<HTMLElement>(target.hash);
      if (destination) {
        event.preventDefault();
        destination.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        window.history.replaceState(window.history.state, '', target.hash);
      }
    }
  };

  return <>
    {isError && <p className="mx-auto max-w-7xl px-6 pt-4 text-sm text-slate-600" role="status">
      Current pricing could not be refreshed. Your plan and price will be confirmed during sign-up.
    </p>}
    <div ref={container} onClick={handleClick} dangerouslySetInnerHTML={{ __html: content }} />
    {testimonialSlot && createPortal(<CoreTestimonials />, testimonialSlot)}
    <SignUpForm isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} initialPlanCode={initialPlanCode} />
  </>;
}
