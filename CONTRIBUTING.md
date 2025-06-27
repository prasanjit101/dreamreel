# Contributing to Dreamreel

We welcome contributions to Dreamreel! By contributing, you help us make this video editor even better for everyone.

Please take a moment to review this document to ensure a smooth contribution process.

## How Can I Contribute?

There are several ways you can contribute to the Dreamreel project:

- **Report Bugs:** If you find a bug, please open an issue on our GitHub repository. Provide a clear and concise description of the bug, steps to reproduce it, and any relevant screenshots or error messages.
- **Suggest Enhancements:** Have an idea for a new feature or an improvement to an existing one? Open an issue to discuss your suggestion.
- **Write Code:** Contribute directly to the codebase by fixing bugs, implementing new features, or improving existing ones.
- **Improve Documentation:** Help us keep our documentation clear, accurate, and up-to-date. This includes READMEs, wiki pages, and inline code comments.

## Code Contribution Guidelines

If you plan to contribute code, please follow these guidelines:

1.  **Fork the Repository:** Start by forking the Dreamreel repository to your GitHub account.
2.  **Clone Your Fork:** Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/dreamreel.git
    ```
3.  **Create a New Branch:** Create a new branch for your changes. Use a descriptive name that reflects the nature of your contribution (e.g., `feature/add-timeline-zoom`, `bugfix/export-error`).
    ```bash
    git checkout -b feature/your-feature-name
    ```
4.  **Install Dependencies:** Make sure you have all the necessary dependencies installed.
    ```bash
    npm install
    ```
5.  **Make Your Changes:** Implement your changes, ensuring they adhere to our coding standards (see below).
6.  **Test Your Changes:** Before submitting a pull request, thoroughly test your changes to ensure they work as expected and don't introduce new issues.
7.  **Commit Your Changes:** Write clear and concise commit messages. Each commit message should describe the purpose of the commit.
    ```bash
    git commit -m "feat: Add new timeline zoom functionality"
    ```
8.  **Push to Your Fork:** Push your new branch to your forked repository on GitHub.
    ```bash
    git push origin feature/your-feature-name
    ```
9.  **Create a Pull Request:** Open a pull request from your branch to the `main` branch of the original Dreamreel repository.
    -   Provide a clear and detailed description of your changes.
    -   Reference any related issues (e.g., `Closes #123`).
    -   Ensure your pull request passes all automated checks (CI/CD).

### Coding Standards

-   **Code Style:** We use Prettier for code formatting. Please ensure your code is formatted correctly before committing.
-   **TypeScript:** All new code should be written in TypeScript, adhering to strict typing where possible.
-   **React Components:** Follow React best practices, including using functional components, hooks, and proper prop-drilling or context API usage.
-   **Modularity:** Break down large components or functions into smaller, reusable modules.
-   **Comments:** Add explanatory comments where the code's intent is not immediately obvious.
-   **Naming Conventions:** Use meaningful and consistent naming conventions for variables, functions, and components (e.g., `camelCase` for variables/functions, `PascalCase` for components).

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project, you agree to abide by its terms.

Thank you for contributing to Dreamreel!
