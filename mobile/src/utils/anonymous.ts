export const getAnonymizedName = (name: string): string => {
  // first name + last initial
  return name.split(' ')[0] + name.charAt(name.length - 1);
};
