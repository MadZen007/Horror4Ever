# Horror4Ever.com - Hub and Spoke Architecture

## Overview

This project uses a "Hub and Spoke" architecture to organize the codebase for scalability, modularity, and clear separation of concerns. The homepage acts as the central hub, while each major feature is developed as a separate spoke (module/directory). This structure allows for independent development and deployment of features, making it easy to expand or refactor as the project grows.

## Directory Structure

- `homepage/` - The main landing page (hub) for Horror4Ever, containing the entry point, styles, and images.
- `feature-reviews/` - Placeholder for the movie reviews feature (spoke).
- `feature-forum/` - Placeholder for the community forum feature (spoke).
- `feature-watchlist/` - Placeholder for the user watchlist feature (spoke).
- `fonts/` - Custom fonts for branding (pre-existing).

## How It Works

- The **homepage** introduces the brand and links to each feature.
- Each **feature** directory is self-contained, allowing teams to work in parallel.
- Shared assets (like fonts) are kept at the root or in dedicated shared directories.

This approach ensures a maintainable, scalable, and brand-consistent codebase for Horror4Ever.com. 