export function truncateString(str, maxLength) {
  if (str.length <= maxLength) {
      return str;
  } else {
      return str.substring(0, maxLength) + "...";
  }
}

export function filterObjectsByPropertyValue<T>(
  items: T[],
  propertyName: keyof T,
  value: unknown
): T[] {
  return items.filter((item) => item[propertyName] === value);
}

export function findObjectByProperty<T, K extends keyof T>(
  items: T[],
  propertyName: K,
  propertyValue: T[K]
): T | undefined {
  return items.find((item) => item[propertyName] === propertyValue);
}

export function filterObjectsByTwoProperties<T>(
  items: T[],
  propertyName1: keyof T,
  value1: any,
  propertyName2: keyof T,
  value2: any
): T[] {
  return items.filter(
    (item) => item[propertyName1] === value1 && item[propertyName2] === value2
  );
}

export const generateRandomAvatar = (name: string) => {
  const randomBackground = [
    "bg-gray-200",
    "bg-indigo-200",
    "bg-purple-200",
    "bg-pink-200",
  ];
  const random =
    randomBackground[Math.floor(Math.random() * randomBackground.length)];
  return (
    <div
      className={`flex items-center justify-center h-8 w-8 ${random} rounded-full`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};
