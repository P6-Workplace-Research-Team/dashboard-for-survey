-- ============================================================
-- 설문 대시보드 Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 실행하세요.
-- ============================================================

-- surveys 테이블
create table public.surveys (
  id           text primary key,
  user_id      uuid references auth.users not null,
  title        text not null,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,
  share_token  uuid default gen_random_uuid() unique not null
);

-- survey_files 테이블
create table public.survey_files (
  id            uuid primary key default gen_random_uuid(),
  survey_id     text references public.surveys(id) on delete cascade not null,
  file_role     text not null check (file_role in ('codebook', 'value', 'label')),
  storage_path  text not null,
  original_name text not null,
  file_size     bigint default 0,
  unique (survey_id, file_role)
);

-- RLS 활성화
alter table public.surveys enable row level security;
alter table public.survey_files enable row level security;

-- surveys RLS
create policy "surveys_insert" on public.surveys
  for insert with check (auth.uid() = user_id);

create policy "surveys_select" on public.surveys
  for select using (auth.role() = 'authenticated');

create policy "surveys_update" on public.surveys
  for update using (auth.uid() = user_id);

create policy "surveys_delete" on public.surveys
  for delete using (auth.uid() = user_id);

-- survey_files RLS
create policy "files_insert" on public.survey_files
  for insert with check (
    exists (select 1 from public.surveys where id = survey_id and user_id = auth.uid())
  );

create policy "files_select" on public.survey_files
  for select using (auth.role() = 'authenticated');

create policy "files_update" on public.survey_files
  for update using (
    exists (select 1 from public.surveys where id = survey_id and user_id = auth.uid())
  );

create policy "files_delete" on public.survey_files
  for delete using (
    exists (select 1 from public.surveys where id = survey_id and user_id = auth.uid())
  );

-- Storage 버킷 생성 (비공개)
insert into storage.buckets (id, name, public) values ('survey-files', 'survey-files', false)
  on conflict (id) do nothing;

-- Storage RLS: 업로드는 자기 폴더(userId/...)에만
create policy "storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'survey-files'
    and auth.role() = 'authenticated'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

-- Storage RLS: 읽기는 로그인한 사용자 모두 가능 (공유 링크 지원)
create policy "storage_select" on storage.objects
  for select using (
    bucket_id = 'survey-files'
    and auth.role() = 'authenticated'
  );

-- Storage RLS: 삭제는 자기 파일만
create policy "storage_delete" on storage.objects
  for delete using (
    bucket_id = 'survey-files'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );
