// ─────────────────────────────────────────────────────────────────────────────
// Google Sheets Live Sync via Apps Script Web App
//
// SETUP (one-time, 10 minutes):
// 1. Open Google Sheets → Extensions → Apps Script
// 2. Delete existing code, paste the script below, save
// 3. Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the Web App URL → paste in Tracker → ⚙️ Sheets Config
//
// ── APPS SCRIPT TO PASTE ─────────────────────────────────────────────────────
// function doPost(e) {
//   try {
//     var data = JSON.parse(e.postData.contents);
//     var ss   = SpreadsheetApp.getActiveSpreadsheet();
//     var sheet = ss.getSheets()[0];
//     sheet.clearContents();
//     var headers = ["Company","Role","Location","Status","Date","URL","Notes","Last Synced"];
//     sheet.appendRow(headers);
//     data.forEach(function(job) {
//       sheet.appendRow([
//         job.company||"", job.role||"", job.location||"",
//         job.status||"",  job.date||"", job.url||"",
//         job.notes||"",   new Date().toLocaleString("en-IN")
//       ]);
//     });
//     sheet.getRange(1,1,1,8).setFontWeight("bold")
//       .setBackground("#00D4AA").setFontColor("#000000");
//     return ContentService
//       .createTextOutput(JSON.stringify({success:true}))
//       .setMimeType(ContentService.MimeType.JSON);
//   } catch(err) {
//     return ContentService
//       .createTextOutput(JSON.stringify({success:false,error:err.toString()}))
//       .setMimeType(ContentService.MimeType.JSON);
//   }
// }
// ─────────────────────────────────────────────────────────────────────────────

export async function syncToGoogleSheets(webAppUrl, jobs) {
  if (!webAppUrl) throw new Error('No Google Sheets Web App URL configured.')
  const payload = jobs.map(j => ({
    company:  j.company  || '',
    role:     j.role     || '',
    location: j.location || '',
    status:   j.status   || '',
    date:     j.date     || '',
    url:      j.url      || '',
    notes:    j.notes    || '',
  }))
  // no-cors because Apps Script doesn't return CORS headers
  await fetch(webAppUrl, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  return true
}

export function exportToExcel(jobs, filename = 'EmbedJobs_Tracker.xlsx') {
  import('xlsx').then(XLSX => {
    const rows = [
      ['Company','Role','Location','Status','Date Applied','Job URL','Notes'],
      ...jobs.map(j => [j.company,j.role,j.location,j.status,j.date,j.url,j.notes]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [24,30,18,12,14,40,40].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Applications')
    XLSX.writeFile(wb, filename)
  })
}
