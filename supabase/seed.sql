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

-- SEED DATA
INSERT INTO subjects (id, slug, name) VALUES 
('00000000-0000-0000-0000-000000000001', 'physics', 'Physics'),
('00000000-0000-0000-0000-000000000002', 'chemistry', 'Chemistry'),
('00000000-0000-0000-0000-000000000003', 'mathematics', 'Mathematics')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chapters (id, subject_id, slug, title, description, difficulty, estimated_study_time, order_index) VALUES 
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'kinematics', 'Kinematics', 'The study of motion without considering its causes. Fundamental for all of mechanics.', 'Easy', '12h', 1),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'newtons-laws-of-motion', 'Newton''s Laws of Motion', 'The foundation of classical mechanics describing the relationship between a body and the forces acting upon it.', 'Medium', '18h', 2),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'rotational-motion', 'Rotational Motion', 'Complex mechanics involving rigid bodies rotating about a fixed or moving axis.', 'Hard', '25h', 3),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'thermodynamics', 'Thermodynamics', 'The study of heat, work, and temperature, and their relation to energy and radiation.', 'Medium', '20h', 4),
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000002', 'atomic-structure', 'Atomic Structure', 'The fundamental building blocks of matter and quantum mechanical model.', 'Medium', '15h', 1),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002', 'chemical-bonding', 'Chemical Bonding', 'How atoms combine to form molecules and the structures they create.', 'Hard', '22h', 2),
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000003', 'calculus-integration', 'Integral Calculus', 'The study of accumulation of quantities and the areas under and between curves.', 'Hard', '30h', 1),
('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000003', 'matrices', 'Matrices & Determinants', 'Rectangular arrays of numbers and their operations, heavily used in linear algebra.', 'Easy', '14h', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, chapter_id, title, order_index) VALUES 
('00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0001-000000000001', 'Rectilinear Motion', 1),
('00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0001-000000000001', 'Projectile Motion', 2),
('00000000-0000-0000-0010-000000000003', '00000000-0000-0000-0001-000000000001', 'Relative Velocity in 1D and 2D', 3),
('00000000-0000-0000-0010-000000000004', '00000000-0000-0000-0001-000000000002', 'First, Second and Third Laws', 1),
('00000000-0000-0000-0010-000000000005', '00000000-0000-0000-0001-000000000002', 'Friction', 2),
('00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0001-000000000002', 'Circular Motion Dynamics', 3),
('00000000-0000-0000-0010-000000000007', '00000000-0000-0000-0001-000000000003', 'Center of Mass', 1),
('00000000-0000-0000-0010-000000000008', '00000000-0000-0000-0001-000000000003', 'Moment of Inertia', 2),
('00000000-0000-0000-0010-000000000009', '00000000-0000-0000-0001-000000000003', 'Torque and Angular Momentum', 3),
('00000000-0000-0000-0010-000000000010', '00000000-0000-0000-0001-000000000003', 'Rolling Motion', 4),
('00000000-0000-0000-0010-000000000011', '00000000-0000-0000-0001-000000000004', 'Zeroth and First Law', 1),
('00000000-0000-0000-0010-000000000012', '00000000-0000-0000-0001-000000000004', 'Specific Heat Capacity', 2),
('00000000-0000-0000-0010-000000000013', '00000000-0000-0000-0001-000000000004', 'Carnot Engine', 3),
('00000000-0000-0000-0010-000000000014', '00000000-0000-0000-0002-000000000001', 'Bohr Model', 1),
('00000000-0000-0000-0010-000000000015', '00000000-0000-0000-0002-000000000001', 'Quantum Numbers', 2),
('00000000-0000-0000-0010-000000000016', '00000000-0000-0000-0002-000000000001', 'Electronic Configuration', 3),
('00000000-0000-0000-0010-000000000017', '00000000-0000-0000-0002-000000000002', 'VSEPR Theory', 1),
('00000000-0000-0000-0010-000000000018', '00000000-0000-0000-0002-000000000002', 'Valence Bond Theory', 2),
('00000000-0000-0000-0010-000000000019', '00000000-0000-0000-0002-000000000002', 'Molecular Orbital Theory', 3),
('00000000-0000-0000-0010-000000000020', '00000000-0000-0000-0003-000000000001', 'Indefinite Integrals', 1),
('00000000-0000-0000-0010-000000000021', '00000000-0000-0000-0003-000000000001', 'Definite Integrals', 2),
('00000000-0000-0000-0010-000000000022', '00000000-0000-0000-0003-000000000001', 'Area under curves', 3),
('00000000-0000-0000-0010-000000000023', '00000000-0000-0000-0003-000000000002', 'Matrix Operations', 1),
('00000000-0000-0000-0010-000000000024', '00000000-0000-0000-0003-000000000002', 'Inverse of Matrix', 2),
('00000000-0000-0000-0010-000000000025', '00000000-0000-0000-0003-000000000002', 'System of Linear Equations', 3)
ON CONFLICT (id) DO NOTHING;
