module.exports = function(config) {
    config.set({
        files: [
            'https://code.jquery.com/jquery-1.12.4.min.js',
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.6/angular.min.js',
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.6/angular-mocks.js',
            './bin/index.js',
            './test.js',
            {pattern: './templates/*.html', included: false, served: true }
        ],
        frameworks: ['mocha', 'chai'],
        browsers: ['PhantomJS'],
        hostname: process.env.IP,
        port: process.env.PORT,
        runnerPort: 0
    });
};