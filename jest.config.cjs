module.exports = {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'json'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/src/main/resources/static/js/test/mocks/styleMock.js',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/main/resources/static/js/test/mocks/fileMock.js'
    },
    setupFiles: ['<rootDir>/src/main/resources/static/js/test/setup.js'],
    testMatch: [
        '<rootDir>/src/main/resources/static/js/test/**/*.test.js',
        '<rootDir>/src/test/js/**/*.test.js'
    ],
    moduleDirectories: ['node_modules', 'src/main/resources/static/js'],
    transformIgnorePatterns: [
        '/node_modules/',
        '\\.pnp\\.[^\\/]+$'
    ],
    testEnvironmentOptions: {
        url: 'http://localhost'
    }
}; 