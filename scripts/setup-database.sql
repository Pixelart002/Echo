-- 📁 USERS TABLE
create table if not exists users (
  id bigint primary key,        -- Telegram user ID
  name text,
  role text default 'user',     -- 'user', 'admin', 'owner', 'banned'
  referred_by bigint references users(id)
);

-- 📁 DEALS TABLE
create table if not exists deals (
  id bigint generated always as identity primary key,
  user_id bigint references users(id),
  type text,                     -- 'buy' or 'sell'
  crypto text,
  amount numeric,
  rate numeric,
  payment_method text,
  fee numeric,
  status text,                   -- 'pending', 'approved', etc.
  created_at timestamp default now()
);

-- 📁 PROOFS TABLE
create table if not exists proofs (
  id bigint generated always as identity primary key,
  deal_id bigint references deals(id),
  user_id bigint references users(id),
  file_url text,
  caption text,
  created_at timestamp default now()
);

-- 📁 CONFIG TABLE
create table if not exists config (
  key text primary key,
  value text
);

-- ✅ DEFAULT CONFIG VALUES
insert into config (key, value) values
('fee_type', 'percentage'),
('fee_value', '1.5'),
('fee_payer', 'seller'),
('min_fee', '50'),
('max_fee', '500')
on conflict (key) do nothing;

-- 📁 DEAL LOGS TABLE
create table if not exists deal_logs (
  id bigint generated always as identity primary key,
  deal_id bigint references deals(id),
  actor_id bigint,
  actor_role text,
  action text,
  timestamp timestamp default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table deals enable row level security;
alter table proofs enable row level security;
alter table deal_logs enable row level security;

-- Create policies for public access (since we're using anon key)
create policy "Public access to users" on users for all using (true);
create policy "Public access to deals" on deals for all using (true);
create policy "Public access to proofs" on proofs for all using (true);
create policy "Public access to config" on config for all using (true);
create policy "Public access to deal_logs" on deal_logs for all using (true);

-- Create indexes for better performance
create index if not exists idx_deals_user_id on deals(user_id);
create index if not exists idx_deals_status on deals(status);
create index if not exists idx_deals_created_at on deals(created_at);
create index if not exists idx_proofs_deal_id on proofs(deal_id);
create index if not exists idx_deal_logs_deal_id on deal_logs(deal_id);
