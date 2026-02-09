
create table if not exists public.store_payment_configs (
    id uuid default gen_random_uuid() primary key,
    store_id uuid references public.stores(id) on delete cascade not null,
    provider text not null, -- 'mercadopago'
    access_token text not null,
    public_key text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_store_provider unique(store_id, provider)
);

alter table public.store_payment_configs enable row level security;

-- Policy: Store owners can manage their payment config
create policy "Store owners can manage their payment config"
    on public.store_payment_configs
    for all
    using (auth.uid() in (
        select owner_id from public.stores where id = store_payment_configs.store_id
    ))
    with check (auth.uid() in (
        select owner_id from public.stores where id = store_payment_configs.store_id
    ));
