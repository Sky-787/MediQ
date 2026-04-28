import '@testing-library/jest-dom';

// Prevent jsdom from performing real network XHR requests during tests
// which can cause unpredictable failures (preflight/403). We stub the
// XMLHttpRequest interface to be a no-op for the test environment.
global.XMLHttpRequest = class {
	open() {}
	send() {}
	setRequestHeader() {}
	abort() {}
};
