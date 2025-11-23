# Testing Strategy

## Backend
- **Unit tests**: Validation, eligibility, and contribution calculators covered via Vitest (`apps/api/test`).
- **Integration**: API endpoints can be tested with Supertest to verify auth + upload parsing.
- **Security**: Linting ensures no unsafe imports; manual review for secrets handling.

## Frontend
- **Component smoke tests**: Use Vitest + React Testing Library for key components (can be extended).
- **Accessibility**: Spot-check with eslint-plugin-jsx-a11y (future addition) and manual keyboard navigation.

## E2E
- **Playwright**: Recommended to script login (dev magic code), upload sample payroll, and view results.

## CI
- GitHub Actions workflow runs lint, test, and build on pull requests.
