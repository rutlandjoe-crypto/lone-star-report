const pausedNewspapers = [
  "Austin American-Statesman",
  "Beaumont Enterprise",
  "Dallas Morning News",
  "El Paso Times",
  "Fort Worth Star-Telegram",
  "Houston Chronicle",
  "San Antonio Express-News",
];

function isPausedNewspaper(source) {
  const name = (source || "").replace(/^the\s+/i, "").toLowerCase();
  return pausedNewspapers.some((publisher) => {
    const prefix = publisher.toLowerCase();
    return name === prefix || name.startsWith(prefix + " ");
  });
}

module.exports = { isPausedNewspaper };
