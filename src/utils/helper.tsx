export function truncateString(str, maxLength) {
  if (str.length <= maxLength) {
      return str;
  } else {
      return str.substring(0, maxLength) + "...";
  }
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
