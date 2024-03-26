import reactSecureStorage from "react-secure-storage";

export const secureStorage = localStorage

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

export function getBackgroundColor(initialLetter) {
  // Convert the initial letter to lowercase for consistency
  initialLetter = initialLetter.toLowerCase();

  // Define the color ranges for each letter
  const colorMap = {
      'a': 'bg-red-500',
      'b': 'bg-blue-500',
      'c': 'bg-green-500',
      'd': 'bg-yellow-500',
      'e': 'bg-purple-500',
      'f': 'bg-indigo-500',
      // Define more mappings as needed...
      'g': 'bg-pink-500',
      'h': 'bg-gray-500',
      'i': 'bg-teal-500',
      'j': 'bg-orange-500',
      // Extend as needed...
      'k': 'bg-red',
      'l': 'bg-blue-500',
      'm': 'bg-green-500',
      // And so on...
      'n': 'bg-yellow-500',
      'o': 'bg-purple-500',
      'p': 'bg-indigo-500',
      'q': 'bg-pink-500',
      'r': 'bg-gray-500',
      's': 'bg-teal-500',
      't': 'bg-orange-500',
      'u': 'bg-red',
      'v': 'bg-blue-500',
      'w': 'bg-green-500',
      'x': 'bg-yellow-500',
      'y': 'bg-purple-500',
      'z': 'bg-indigo-500',
  };

  // Get the corresponding color for the initial letter
  const color = colorMap[initialLetter] || 'bg-gray'; // Default to gray if letter not found

  return color;
}
