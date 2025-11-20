// src/config/__mocks__/api.ts

// This file is only used by Jest during tests
// For production build, this file won't be imported

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiRequest = (_opts?: any) => {
  // default mock: return empty data
  return Promise.resolve({ message: '', data: [] });
};
