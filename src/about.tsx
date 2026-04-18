const About = () => {
  const rawBuildTime = (import.meta as any).env?.VITE_BUILD_TIME as string | undefined;
  const isBuilt = Boolean(rawBuildTime);
  const buildDate = isBuilt ? new Date(rawBuildTime as string) : new Date();

  const formatDate = (d: Date, opts?: { timeZone?: string }) => {
    const datePart = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: opts?.timeZone,
    }).format(d);

    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: opts?.timeZone,
    }).format(d);

    return `${datePart} - ${timePart}`;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">About Tracker</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          A minimal, clean status page for the Tracker UI.
        </p>

        <section className="mt-6 text-sm text-gray-700 dark:text-gray-200 space-y-2">
          {isBuilt ? (
            <div>
              <span className="font-medium">Built at:</span> {formatDate(buildDate)}
            </div>
          ) : (
            <div>
              <span className="font-medium">Dev time:</span> {formatDate(buildDate)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default About;
