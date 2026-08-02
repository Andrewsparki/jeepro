-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  target_exam text default 'JEE Advanced',
  target_year integer,
  theme text default 'dark',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can delete own profile"
  on profiles for delete
  using ( auth.uid() = id );

-- Set up a trigger to automatically create a profile for new users
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Subjects Table
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chapters Table
create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  estimated_study_time text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (subject_id, slug)
);

-- Topics Table
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  title text not null,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Topic Progress Table
create table if not exists user_topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  status text not null check (status in ('Not Started', 'In Progress', 'Mastered', 'Needs Revision')) default 'Not Started',
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, topic_id)
);

-- Study Sessions Table
create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete set null,
  topic_id uuid references topics(id) on delete set null,
  duration_seconds integer not null,
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone not null
);

-- RLS Policies
alter table subjects enable row level security;
alter table chapters enable row level security;
alter table topics enable row level security;
alter table user_topic_progress enable row level security;
alter table study_sessions enable row level security;

-- Syllabus is read-only for public/authenticated users
create policy "Syllabus tables are viewable by everyone" on subjects for select using (true);
create policy "Syllabus tables are viewable by everyone" on chapters for select using (true);
create policy "Syllabus tables are viewable by everyone" on topics for select using (true);

-- User Topic Progress
create policy "Users can view their own progress" on user_topic_progress for select using (auth.uid() = user_id);
create policy "Users can insert their own progress" on user_topic_progress for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress" on user_topic_progress for update using (auth.uid() = user_id);
create policy "Users can delete their own progress" on user_topic_progress for delete using (auth.uid() = user_id);

-- Study Sessions
create policy "Users can view their own study sessions" on study_sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own study sessions" on study_sessions for insert with check (auth.uid() = user_id);

-- Function to handle updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_user_topic_progress_modtime on user_topic_progress;
create trigger update_user_topic_progress_modtime
before update on user_topic_progress
for each row execute procedure update_updated_at_column();
