const NOTIFICATION_ICON = 'icons/notification.svg';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('verificarNovasVagas', { periodInMinutes: 60 });
});

function isNewJob(job, lastChecked) {
  if (!job.postedAt || !lastChecked) return true;
  return new Date(job.postedAt).getTime() > new Date(lastChecked).getTime();
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'verificarNovasVagas') return;
  const { workerUrl, savedSearches = [] } = await chrome.storage.local.get(['workerUrl', 'savedSearches']);
  if (!workerUrl || !savedSearches.length) return;

  for (const search of savedSearches) {
    const response = await fetch(`${workerUrl.replace(/\/+$/, '')}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: search.query, pageSize: 10 })
    });

    const data = await response.json();
    const newJobs = (data.results || []).filter((job) => isNewJob(job, search.lastChecked));
    if (newJobs.length > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: NOTIFICATION_ICON,
        title: `${newJobs.length} nova(s) vaga(s) encontrada(s)!`,
        message: `Para "${search.query}": ${newJobs[0].title} na ${newJobs[0].company}`
      });
    }
  }
});
