-- Step 1: Create the user_role ENUM type
CREATE TYPE public.user_role AS ENUM (
    'Admin',
    'Employee',
    'Core Subscriber',
    'IPO Subscriber',
    'Research Ally Subscriber'
);

-- Step 2.1: Refine 'users' table
ALTER TABLE public.users
  DROP COLUMN otp,
  DROP COLUMN otp_expires_at;

-- Step 2.2: Refine 'subscriptions' table
ALTER TABLE public.subscriptions
  DROP COLUMN username,
  ADD COLUMN user_id UUID,
  ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Step 2.3: Refine 'payment_history' table
-- Note: In a real migration with data, changing user_id type would require a data migration strategy.
-- For this schema setup, we are dropping the old column and adding a new one.
ALTER TABLE public.payment_history
  DROP COLUMN user_id,
  ADD COLUMN user_id UUID,
  ADD CONSTRAINT payment_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.payment_history
  DROP COLUMN user_email;

ALTER TABLE public.payment_history
  DROP COLUMN membership,
  ADD COLUMN plan_id INTEGER,
  ADD CONSTRAINT payment_history_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.membership_plans(plan_id);

-- Step 2.4: Refine 'otps' table
ALTER TABLE public.otps
  ADD COLUMN user_id UUID,
  ADD CONSTRAINT otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Step 2.5: Refine 'digio_documents' table
ALTER TABLE public.digio_documents
  RENAME COLUMN identifier TO user_id;

ALTER TABLE public.digio_documents
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT digio_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Step 3: Example SELECT query to list users and their subscription plan
/*
SELECT
    u.id AS user_id,
    u.first_name,
    u.last_name,
    u.email,
    mp.plan_name,
    s.status AS subscription_status
FROM
    public.users u
LEFT JOIN
    public.subscriptions s ON u.id = s.user_id
LEFT JOIN
    public.membership_plans mp ON s.membership_id = mp.plan_id;
*/
