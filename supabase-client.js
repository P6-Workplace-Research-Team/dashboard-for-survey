// Supabase 클라이언트 및 공용 스토리지 레이어
// 의존성: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const _SUPABASE_URL = 'https://anryotqsnrhsonpsrdbw.supabase.co';
const _SUPABASE_KEY = 'sb_publishable_1hDV_KyYG9qYVR2J-_3iSA_7VTUf9wY';
const _BUCKET = 'survey-files';
const _TEAM_EMAIL = 'p6s.subs@gmail.com';

const _supabase = window.supabase.createClient(_SUPABASE_URL, _SUPABASE_KEY);

// ── 인증 ────────────────────────────────────────────────────

async function requireAuth(redirectTo) {
  redirectTo = redirectTo || 'login.html';
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) {
    const next = encodeURIComponent(location.href);
    window.location.replace(redirectTo + '?next=' + next);
    await new Promise(function() {}); // 실행 중단
  }
  return session;
}

async function _getUser() {
  const { data: { user } } = await _supabase.auth.getUser();
  return user;
}

// ── 인메모리 캐시 ─────────────────────────────────────────────

var _surveysCache = [];

function _toLocalSurveyFormat(row) {
  var files = {};
  (row.survey_files || []).forEach(function(f) {
    files[f.file_role] = {
      name: f.original_name,
      size: f.file_size || 0,
      contentType: 'csv-text',
      storagePath: f.storage_path
    };
  });
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shareToken: row.share_token,
    files: files
  };
}

// 서버에서 설문 목록을 불러와 캐시에 저장합니다.
// shareToken 이 있으면 해당 공유 설문도 포함합니다.
async function loadSurveysFromServer(shareToken) {
  var user = await _getUser();
  if (!user) { _surveysCache = []; return; }

  var owned = await _supabase
    .from('surveys')
    .select('*, survey_files(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  _surveysCache = (owned.data || []).map(_toLocalSurveyFormat);

  if (shareToken) {
    var shared = await _supabase
      .from('surveys')
      .select('*, survey_files(*)')
      .eq('share_token', shareToken)
      .maybeSingle();
    if (shared.data) {
      var s = _toLocalSurveyFormat(shared.data);
      if (!_surveysCache.find(function(x) { return x.id === s.id; })) {
        _surveysCache.unshift(s);
      }
      try {
        sessionStorage.setItem('survey.currentId', s.id);
        sessionStorage.setItem('survey.title', s.title);
      } catch (_) {}
    }
  }
}

// ── 설문 CRUD ─────────────────────────────────────────────────

function loadSurveys() {
  return _surveysCache;
}

async function saveSurveys(newList) {
  var oldCache = _surveysCache.slice();
  _surveysCache = Array.isArray(newList) ? newList : [];

  try {
    var user = await _getUser();
    if (!user) return false;

    var oldMap = new Map(oldCache.map(function(s) { return [s.id, s]; }));
    var newMap = new Map(_surveysCache.map(function(s) { return [s.id, s]; }));

    // 삭제된 설문
    for (var i = 0; i < oldCache.length; i++) {
      var old = oldCache[i];
      if (!newMap.has(old.id)) {
        await _supabase.from('surveys').delete().eq('id', old.id).eq('user_id', user.id);
        var delPaths = ['codebook', 'value', 'label'].map(function(k) {
          return user.id + '/' + old.id + '/' + k + '.csv';
        });
        await _supabase.storage.from(_BUCKET).remove(delPaths).catch(function() {});
      }
    }

    // 새로 추가된 설문
    for (var j = 0; j < _surveysCache.length; j++) {
      var s = _surveysCache[j];
      if (oldMap.has(s.id)) continue;
      var insRes = await _supabase.from('surveys').insert({
        id: s.id,
        user_id: user.id,
        title: s.title,
        created_at: s.createdAt || new Date().toISOString(),
        updated_at: s.updatedAt || s.createdAt || new Date().toISOString(),
        share_token: s.shareToken || crypto.randomUUID()
      });
      if (insRes.error) throw insRes.error;
      // survey_files 삽입
      var fileKeys = ['codebook', 'value', 'label'];
      for (var k = 0; k < fileKeys.length; k++) {
        var role = fileKeys[k];
        var f = s.files && s.files[role];
        if (!f || !f.storagePath) continue;
        await _supabase.from('survey_files').insert({
          survey_id: s.id,
          file_role: role,
          storage_path: f.storagePath,
          original_name: f.name || role + '.csv',
          file_size: f.size || 0
        });
      }
    }

    // 제목/날짜 변경된 설문
    for (var m = 0; m < _surveysCache.length; m++) {
      var cur = _surveysCache[m];
      if (!oldMap.has(cur.id)) continue;
      var prev = oldMap.get(cur.id);
      if (prev.title !== cur.title || (cur.updatedAt && prev.updatedAt !== cur.updatedAt)) {
        await _supabase.from('surveys').update({
          title: cur.title,
          updated_at: cur.updatedAt || new Date().toISOString()
        }).eq('id', cur.id).eq('user_id', user.id);
      }
    }

    return true;
  } catch (e) {
    console.error('saveSurveys:', e);
    return false;
  }
}

// ── 파일 스토리지 ─────────────────────────────────────────────

async function _uploadToStorage(userId, surveyId, key, content) {
  var path = userId + '/' + surveyId + '/' + key + '.csv';
  var blob = new Blob([content], { type: 'text/csv' });
  var res = await _supabase.storage.from(_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: 'text/csv'
  });
  if (res.error) throw res.error;
  return path;
}

// 파일 내용을 가져옵니다. storagePath 가 있으면 Storage 에서 다운로드합니다.
async function getStoredFilePayload(fileRec) {
  if (!fileRec) return null;
  if (fileRec.content) return fileRec;
  if (!fileRec.storagePath) return null;
  try {
    var res = await _supabase.storage.from(_BUCKET).download(fileRec.storagePath);
    if (res.error || !res.data) return null;
    var content = await res.data.text();
    return { name: fileRec.name, size: fileRec.size || 0, contentType: 'csv-text', content: content };
  } catch (_) {
    return null;
  }
}

// 파일 1개를 Storage 에 업로드하고 survey_files 를 upsert 합니다 (업데이트 용).
async function persistStoredFile(surveyId, key, fileRec) {
  if (!fileRec) return null;
  var user = await _getUser();
  if (!user) return null;
  var content = fileRec.content || '';
  var path = await _uploadToStorage(user.id, surveyId, key, content);
  await _supabase.from('survey_files').upsert({
    survey_id: surveyId,
    file_role: key,
    storage_path: path,
    original_name: fileRec.name || key + '.csv',
    file_size: fileRec.size || 0
  }, { onConflict: 'survey_id,file_role' });
  return { name: fileRec.name, size: fileRec.size || 0, contentType: 'csv-text', storagePath: path };
}

// 파일 3개를 Storage 에 업로드합니다 (새 설문 생성 용, DB 는 saveSurveys 에서 처리).
async function persistSurveyFiles(surveyId, files) {
  var user = await _getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  var stored = {};
  var keys = ['codebook', 'value', 'label'];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var f = files && files[key];
    if (!f) continue;
    var path = await _uploadToStorage(user.id, surveyId, key, f.content || '');
    stored[key] = { name: f.name, size: f.size || 0, contentType: 'csv-text', storagePath: path };
  }
  return stored;
}

// saveSurveys 에서 Storage 삭제를 처리하므로 여기서는 no-op
async function deleteSurveyFiles(surveyId, files, surveys) {}

// 레거시 마이그레이션 불필요 (Supabase 신규)
async function migrateLegacySurveyStorage() {}

// ── 날짜 포맷 유틸 ────────────────────────────────────────────

function formatDate(iso) {
  try {
    var d = new Date(iso);
    var pad = function(n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
      + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  } catch (_) { return iso; }
}
