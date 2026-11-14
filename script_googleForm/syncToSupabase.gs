/**
 * Google Form -> Supabase (ผูกกับฟอร์มเดิมที่มี QR แล้ว ไม่สร้างฟอร์มใหม่)
 * วิธีติดตั้ง:
 *  1) เปิดฟอร์ม > ⋮ > Script editor > วางไฟล์นี้
 *  2) Project Settings > Script properties: SUPABASE_URL, SUPABASE_SERVICE_KEY
 *  3) รัน installTrigger() 1 ครั้ง (อนุญาตสิทธิ์)  -> คำตอบใหม่ส่งเข้า Supabase อัตโนมัติ
 *  4) รัน backfillAll() 1 ครั้ง -> ส่งคำตอบเก่าทั้งหมด (ซ้ำได้ ไม่เกิดข้อมูลซ้ำ เพราะ dedupe_key)
 */
function installTrigger() {
  var form = FormApp.getActiveForm();
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('onFormSubmitSync').forForm(form).onFormSubmit().create();
}

function onFormSubmitSync(e) {
  postRows_([toRow_(e.response)]);
}

function backfillAll() {
  var rows = FormApp.getActiveForm().getResponses().map(toRow_);
  for (var i = 0; i < rows.length; i += 200) postRows_(rows.slice(i, i + 200));
  Logger.log('ส่งแล้ว ' + rows.length + ' แถว');
}

// map item title -> column (ตรงกับ snippet.js / docs/DATA_CONTRACT.md)
function codeOf_(title) {
  if (title.indexOf('คัดกรองข้อที่ 1') === 0) return 'scr01';
  if (title.indexOf('คัดกรองข้อที่ 2') === 0) return 'scr02';
  if (title.indexOf('ท่านได้รับทราบคำชี้แจง') === 0) return 'con01';
  var m = title.match(/^(\d{1,2})\.\s/);
  if (m) { var n = ('0' + m[1]).slice(-2); return 'sur' + n; }
  return null;
}

function toRow_(resp) {
  var ts = resp.getTimestamp();
  ts.setMilliseconds(0);
  var row = { source: 'google_form', form_response_id: resp.getId(), submitted_at: ts.toISOString() };
  resp.getItemResponses().forEach(function (ir) {
    var code = codeOf_(ir.getItem().getTitle());
    if (!code) return;
    var v = ir.getResponse();
    if (Array.isArray(v)) v = v.join(', ');
    v = (v === null || v === undefined) ? '' : String(v).trim();
    row[code] = v === '' ? null : v;
  });
  return row;
}

function postRows_(rows) {
  var p = PropertiesService.getScriptProperties();
  var url = p.getProperty('SUPABASE_URL') + '/rest/v1/survey_responses';
  var key = p.getProperty('SUPABASE_SERVICE_KEY');
  var cols = ['source','form_response_id','submitted_at','scr01','scr02','con01','sur01','sur02','sur03','sur04','sur05','sur06','sur07','sur08','sur09','sur10','sur11'];
  rows = rows.map(function (r) { var o = {}; cols.forEach(function (c) { o[c] = r[c] === undefined ? null : r[c]; }); return o; });
  var res = UrlFetchApp.fetch(url + '?on_conflict=dedupe_key', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'resolution=ignore-duplicates,return=minimal' },
    payload: JSON.stringify(rows)
  });
  if (res.getResponseCode() >= 300) throw new Error('Supabase ' + res.getResponseCode() + ': ' + res.getContentText());
}
