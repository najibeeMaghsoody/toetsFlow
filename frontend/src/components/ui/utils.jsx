// Utility functions for UI components

/**
 * Classname utility - conditionally combine classnames
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Debounce function for optimizing performance
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Truncate text to specified length
 */
export const truncate = (text, length) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  return value === null || value === undefined || value === "";
};
