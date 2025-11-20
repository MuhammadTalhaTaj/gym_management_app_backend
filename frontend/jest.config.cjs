module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"   // <--- FIXES ESM EXPORT ERROR
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.history/"    // Ignore VSCode History
  ],
  moduleNameMapper: {
    "\\.(css|scss|less)$": "identity-obj-proxy"
  }
};
