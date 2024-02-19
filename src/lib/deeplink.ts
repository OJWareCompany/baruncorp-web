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
}: {
  organization: string;
  type: string;
  project: string;
}) {
  checkBarunFinderApp();

  const url = `barun://open-project?payload=${encodeURIComponent(
    JSON.stringify({ organization, type, project })
  )}`;
  window.location.href = url;
}

export function openJobFolder({
  organization,
  type,
  project,
  job,
}: {
  organization: string;
  type: string;
  project: string;
  job: string;
}) {
  checkBarunFinderApp();

  const url = `barun://open-job?payload=${encodeURIComponent(
    JSON.stringify({ organization, type, project, job })
  )}`;
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
 * });
 */
export function openJobNoteFolder({
  organization,
  type,
  project,
  job,
  jobNote,
}: {
  organization: string;
  type: string;
  project: string;
  job: string;
  jobNote: string;
}) {
  checkBarunFinderApp();

  const url = `barun://open-job-note?payload=${encodeURIComponent(
    JSON.stringify({ organization, type, project, job, jobNote })
  )}`;
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
  window.location.href = url;
}
