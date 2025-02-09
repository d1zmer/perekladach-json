const { greet } = require('../index'); // Adjust path if needed

test('greets a person', () => {
    expect(greet('Alice')).toBe('Hello, Alice! Welcome to my awesome package!');
});

test('greets another person', () => {
    expect(greet('Bob')).toBe('Hello, Bob! Welcome to my awesome package!');
});
