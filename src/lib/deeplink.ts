function checkBarunFinderApp() {
  let openDesktopApp = false;

  window.onblur = () => {
    openDesktopApp = true;
  };

  setTimeout(() => {
    if (!openDesktopApp) {
      window.alert(
        `Couldn't find the app.
      Please go to the app installation page.
      If it doesn't move, please check the pop-up.`
      );
      const newWindow = window.open(
        process.env.NEXT_PUBLIC_INSTALLER_URL,
        "_blank"
      );
      if (newWindow) {
        newWindow.focus();
      }
    }
  }, 2000);
}

export function openProjectFolder({
  organization,
  type,
  project,
  folderId,
  shareLink,
}: {
  organization: string;
  type: string;
  project: string;
  folderId: string | null;
  shareLink: string | null;
}) {
  checkBarunFinderApp();

  const url = `barun://open-project?payload=${encodeURIComponent(
    JSON.stringify({ organization, type, project, folderId, shareLink })
  )}`;
  console.log(url);
  window.location.href = url;
}

export function openJobFolder({
  organization,
  type,
  project,
  job,
  folderId,
  shareLink,
}: {
  organization: string;
  type: string;
  project: string;
  job: string;
  folderId: string | null;
  shareLink: string | null;
}) {
  checkBarunFinderApp();

  const url = `barun://open-job?payload=${encodeURIComponent(
    JSON.stringify({ organization, type, project, job, folderId, shareLink })
  )}`;
  console.log(url);
  window.location.href = url;
}

/**
 * @example
 * openJobNoteFolder({
 *   organization: "hello world",
 *   type: "Residential",
 *   project: "Warren City Ctr, Warrenton, Missouri 63383, United States",
 *   job: `Job 5`,
 *   jobNote: `#3232 message`,
 *   shareLink: `https://googleDrive/...`
 * });
 */
export function openJobNoteFolder({
  organization,
  type,
  project,
  job,
  jobNote,
  shareLink,
}: {
  organization: string;
  type: string;
  project: string;
  job: string;
  jobNote: string;
  shareLink: string | null;
}) {
  checkBarunFinderApp();

  const url = `barun://open-job-note?payload=${encodeURIComponent(
    JSON.stringify({ organization, type, project, job, jobNote, shareLink })
  )}`;
  console.log(url);
  window.location.href = url;
}

export function openAhjFolder({
  geoId,
  fullAhjName,
}: {
  geoId: string;
  fullAhjName: string;
}) {
  checkBarunFinderApp();

  const url = `barun://open-ahj?payload=${encodeURIComponent(
    JSON.stringify({ geoId, fullAhjName })
  )}`;
  console.log(url);
  window.location.href = url;
}
