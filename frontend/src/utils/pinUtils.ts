
/**
 * Generate a random PIN of specified length
 * @param length The length of the PIN to generate
 * @returns A random PIN string
 */
export const generatePin = (length = 4): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Validate if a PIN matches the expected value
 * @param pin The PIN entered by the user
 * @param expectedPin The expected PIN to match
 * @returns Boolean indicating if the PIN is valid
 */
export const validatePin = (pin: string, expectedPin: string): boolean => {
  return pin === expectedPin;
};
