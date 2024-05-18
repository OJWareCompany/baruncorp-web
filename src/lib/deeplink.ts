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
  parentlessFolder,
  sharedDriveVersion,
}: {
  organization: string;
  type: string;
  project: string;
  folderId: string | null;
  shareLink: string | null;
  parentlessFolder: boolean;
  sharedDriveVersion: string;
}) {
  checkBarunFinderApp();
  const payload = {
    organization,
    type,
    project,
    folderId,
    shareLink,
    parentlessFolder,
    sharedDriveVersion,
  };
  const url = `barun://open-project?payload=${encodeURIComponent(
    JSON.stringify(payload)
  )}`;
  console.log("### openProjectFolder ###");
  console.log(`url: ${url}`);
  console.log(`payload: ${JSON.stringify(payload)}`);
  window.location.href = url;
}

export function openJobFolder({
  organization,
  type,
  project,
  job,
  folderId,
  shareLink,
  parentlessFolder,
  sharedDriveVersion,
}: {
  organization: string;
  type: string;
  project: string;
  job: string;
  folderId: string | null;
  shareLink: string | null;
  parentlessFolder: boolean;
  sharedDriveVersion: string;
}) {
  checkBarunFinderApp();
  const payload = {
    organization,
    type,
    project,
    job,
    folderId,
    shareLink,
    parentlessFolder,
    sharedDriveVersion,
  };
  const url = `barun://open-job?payload=${encodeURIComponent(
    JSON.stringify(payload)
  )}`;
  console.log("### openJobFolder ###");
  console.log(`url: ${url}`);
  console.log(`payload: ${JSON.stringify(payload)}`);
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
  parentlessFolder = false,
  sharedDriveVersion = "001",
}: {
  organization: string;
  type: string;
  project: string;
  job: string;
  jobNote: string;
  shareLink: string | null;
  parentlessFolder: boolean;
  sharedDriveVersion: string;
}) {
  checkBarunFinderApp();
  const payload = {
    organization,
    type,
    project,
    job,
    jobNote,
    shareLink,
    parentlessFolder,
    sharedDriveVersion,
  };
  const url = `barun://open-job-note?payload=${encodeURIComponent(
    JSON.stringify(payload)
  )}`;
  console.log("### openJobNoteFolder ###");
  console.log(`url: ${url}`);
  console.log(`payload: ${JSON.stringify(payload)}`);
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
  const payload = { geoId, fullAhjName };
  const url = `barun://open-ahj?payload=${encodeURIComponent(
    JSON.stringify(payload)
  )}`;
  console.log("### openAhjFolder ###");
  console.log(url);
  console.log(`payload: ${JSON.stringify(payload)}`);
  window.location.href = url;
}
