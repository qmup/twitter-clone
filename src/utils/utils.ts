export const generateProjection = <T>(keys: Array<keyof T>) => {
  const result: { [key in keyof T]: number } = {} as {
    [key in keyof T]: number;
  };
  keys.forEach((item) => {
    result[item] = 0;
  });
  return result;
};
