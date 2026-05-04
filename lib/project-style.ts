const PROJECT_COLORS = [
  "#3F52C9",
  "#5E3AAE",
  "#1F6E7A",
  "#1F7A4D",
  "#95590C",
  "#B0352B",
  "#9B2B6E",
];

export function projectColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

export function projectKey(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const key =
    words.length > 1
      ? words.map((word) => word[0]).join("")
      : name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3);

  return (key || "PRJ").toUpperCase().slice(0, 4);
}
