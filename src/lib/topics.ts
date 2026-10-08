export const topicOptions = [
  "Education",
  "Campus",
  "Health",
  "Finance",
  "Climate",
  "Food",
  "Mobility",
  "Housing",
  "Work",
  "Civic",
  "Commerce",
  "Community",
  "Media",
  "Gaming",
  "Security",
  "Accessibility",
  "Productivity",
  "Hardware",
  "Data",
  "Events",
] as const;

export const customTopic = "__custom";

export function resolvedTopic(value: string, custom: string) {
  if (value === customTopic) return custom.trim();
  return value.trim();
}
