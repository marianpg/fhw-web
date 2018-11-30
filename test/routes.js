const evaluate = require('./testsuite').evaluate;

const resolveStatic = require('../lib/ressource-utils').resolveStatic;
const prepareRoutes = require('../lib/routes').default;


const runTest = (name, urlCalled, routes, expected) => {
    return prepareRoutes(routes).then(routes => {
        const determined = resolveStatic(urlCalled, routes[0], true);
        evaluate(name, determined, expected);
    });
};


const oneDirectory = () => {
    const urlCalled = '/assets/main.css';
    const routes = [{ 'url': '/assets/*', 'static': 'assets/*' }];
    const expected = '/assets/main.css';
    return runTest('One Directory', urlCalled, routes, expected);
};

const subdirectory = () => {
    const urlCalled = '/assets/subdir/style.css';
    const routes = [{ 'url': '/assets/*', 'static': 'assets/*' }];
    const expected = '/assets/subdir/style.css';
    return runTest('Subdirectory', urlCalled, routes, expected);
};

const otherDirectory = () => {
    const urlCalled = '/assets/main.js';
    const routes = [{ 'url': '/assets/*', 'static': 'public/*' }];
    const expected = '/public/main.js';
    return runTest('Other Directory', urlCalled, routes, expected);
};

const otherSubdirectory = () => {
    const urlCalled = '/assets/subdir/run.js';
    const routes = [{ 'url': '/assets/*', 'static': 'public/*' }];
    const expected = '/public/subdir/run.js';
    return runTest('Other Subdirectory', urlCalled, routes, expected);
};

const shorterPath = () => {
    const urlCalled = '/assets/subdir/main.css';
    const routes = [{ 'url': '/assets/subdir/*', 'static': 'assets/*' }];
    const expected = '/assets/main.css';
    return runTest('Shorter Path', urlCalled, routes, expected);
};

const longerPath = () => {
    const urlCalled = '/assets/style.css';
    const routes = [{ 'url': '/assets/*', 'static': 'assets/subdir/*' }];
    const expected = '/assets/subdir/style.css';
    return runTest('Longer Path', urlCalled, routes, expected);
};

const shorterOtherPath = () => {
    const urlCalled = '/assets/subdir/main.css';
    const routes = [{ 'url': '/assets/subdir/*', 'static': 'public/*' }];
    const expected = '/public/main.css';
    return runTest('Shorter Other Path', urlCalled, routes, expected);
};

const longerOtherPath = () => {
    const urlCalled = '/assets/style.css';
    const routes = [{ 'url': '/assets/*', 'static': 'public/subdir/*' }];
    const expected = '/public/subdir/style.css';
    return runTest('Longer Other Path', urlCalled, routes, expected);
};

const specificFile = () => {
    const urlCalled = '/assets/subdir/style.css';
    const routes = [{ 'url': '/assets/*', 'static': 'assets/main.css' }];
    const expected = '/assets/main.css';
    return runTest('Specific File', urlCalled, routes, expected);
};


module.exports = () => {
    oneDirectory()
        .then(subdirectory)
        .then(otherDirectory)
        .then(otherSubdirectory)
        .then(shorterPath)
        .then(longerPath)
        .then(shorterOtherPath)
        .then(longerOtherPath)
        .then(specificFile);
};