# Contributing to App Wrapper Store

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome all contributors
- Focus on constructive feedback
- Report issues responsibly

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- Basic knowledge of React, React Native, and Express.js

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/leoninnovaid/app-wrapper-store.git
cd app-wrapper-store

# Install dependencies
npm install

# Start development servers
npm run dev
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Follow the existing code style
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
npm test

# Build for production
npm run build

# Test in development
npm run dev
```

### 4. Commit and Push

```bash
git add .
git commit -m "feat: add new feature" # or "fix: resolve bug"
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Provide clear description of changes
- Reference related issues
- Include screenshots/videos if applicable
- Ensure CI/CD passes

## Code Style

### TypeScript

```typescript
// Use strict typing
interface AppConfig {
  id: string;
  name: string;
  url: string;
}

// Use descriptive names
const fetchAppConfiguration = async (appId: string): Promise<AppConfig> => {
  // Implementation
};

// Add JSDoc comments
/**
 * Fetches app configuration by ID
 * @param appId - The app identifier
 * @returns Promise resolving to app configuration
 */
```

### React/React Native

```typescript
// Use functional components
export function MyComponent() {
  const [state, setState] = useState<string>("");

  return (
    <View>
      <Text>{state}</Text>
    </View>
  );
}

// Use descriptive prop names
interface MyComponentProps {
  title: string;
  onPress: () => void;
}
```

## Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/dependency changes

Example:

```
feat(backend): add app deletion endpoint

- Implement DELETE /api/apps/:id endpoint
- Add validation for app existence
- Add tests for deletion

Fixes #123
```

## Testing

### Writing Tests

```typescript
import { describe, it, expect } from "vitest";

describe("calculateCost", () => {
  it("should calculate cost correctly", () => {
    const result = calculateCost(100, 7, 1.5);
    expect(result).toBe(10.5);
  });

  it("should throw error for invalid input", () => {
    expect(() => calculateCost(0, 7, 1.5)).toThrow();
  });
});
```

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

## Documentation

### Update README

If adding new features, update the README.md with:
- Feature description
- Usage examples
- Configuration options

### Add API Documentation

For new endpoints, document in:
- Code comments (JSDoc)
- API documentation file
- ARCHITECTURE.md if architectural change

## Reporting Issues

### Bug Reports

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, etc.)
- Error messages/logs

### Feature Requests

Include:
- Clear description
- Use case/motivation
- Proposed implementation (optional)
- Examples/mockups (if applicable)

## Review Process

1. **Automated Checks:** CI/CD pipeline runs tests
2. **Code Review:** Maintainers review code
3. **Feedback:** Address review comments
4. **Approval:** Maintainer approves changes
5. **Merge:** Changes merged to main

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to repository
5. Create GitHub release

## Questions?

- Open an issue for questions
- Check existing issues/discussions
- Join community discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to App Wrapper Store!** 🎉
