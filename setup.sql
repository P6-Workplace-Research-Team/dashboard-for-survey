-- ============================================================
-- 설문 대시보드 Supabase 스키마 (인증 없는 공개 접근 버전)
-- Supabase 대시보드 > SQL Editor 에서 실행하세요.
-- 이미 이전 버전을 실행했다면 이 파일로 다시 실행하세요.
-- ============================================================

-- 기존 테이블 제거 (재실행 안전)
drop table if exists public.survey_files;
drop table if exists public.surveys;

-- surveys 테이블 (user_id 없음)
create table public.surveys (
  id           text primary key,
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

-- 누구나 읽기/쓰기 가능 (인증 불필요)
alter table public.surveys enable row level security;
alter table public.survey_files enable row level security;

create policy "public_all" on public.surveys for all using (true) with check (true);
create policy "public_all" on public.survey_files for all using (true) with check (true);

-- Storage 버킷 공개로 설정
insert into storage.buckets (id, name, public)
  values ('survey-files', 'survey-files', true)
  on conflict (id) do update set public = true;

-- 기존 Storage 정책 제거
drop policy if exists "storage_insert" on storage.objects;
drop policy if exists "storage_select" on storage.objects;
drop policy if exists "storage_delete" on storage.objects;

-- 누구나 접근 가능
create policy "public_all" on storage.objects
  for all using (bucket_id = 'survey-files') with check (bucket_id = 'survey-files');
