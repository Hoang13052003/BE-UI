import { useState, useEffect } from "react";

// Generic type T allows the hook to work with any data type
function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state with a function to avoid unnecessary localStorage access on rerenders
  const [value, setValue] = useState<T>(() => {
    try {
      // Get stored value from localStorage
      const storedValue = localStorage.getItem(key);
      
      // If there's a stored value, parse it; otherwise use the default value
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
    }
  });

  // Update localStorage when the state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
