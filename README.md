# Dreamreel

Dreamreel is a web-based video editor app that allows users to create, edit videos, and export them in MP4 format. It leverages Remotion for its video capabilities and Remotion Lambda for scalable rendering. This platform is designed for creators, marketers, and social media teams who want to create engaging videos quickly with minimal tools.

## Features

*   **Project Management:** Create and open video editing projects.
*   **Media Import:** Import various media types including video clips, audio tracks (music, voiceovers), image files (PNGs, JPEGs), and text overlays.
*   **Aspect Ratio Definition:** Define the aspect ratio for your video projects.
*   **Layer-Based Editing:** Add and manage multiple layers for video, audio, images, and text.
*   **Timeline Operations:**
    *   Adjust duration of clips.
    *   Trim media.
    *   Reorder layers.
    *   Split video clips at specific points.
*   **Real-time Preview:** See your edits reflected instantly in a real-time preview panel.
*   **Export:** Export the final result as an `.mp4` file using Remotion Lambda for high-performance rendering.

## Tech Stack

*   **Frontend:** Next.js (App Router 15.3.3), React, Shadcn UI, Tailwind CSS
*   **Video Processing:** Remotion, Remotion Lambda
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript
*   **Database:** SQLite (LibSQL)
*   **ORM:** Drizzle
*   **Authentication:** Better Auth
*   **Email:** Resend (for email sending), React Email (for email templates)
*   **File Storage:** Backblaze S3 compatible API

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed:

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/dreamreel.git
    cd dreamreel
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your environment variables. Refer to `.env.example` (if available, otherwise set up as per your Remotion Lambda and S3 configurations).

    ```
    # Example .env.local (adjust as per your actual needs)
    NEXT_PUBLIC_REMOTION_AWS_REGION=your-aws-region
    NEXT_PUBLIC_REMOTION_AWS_ACCESS_KEY_ID=your-access-key-id
    NEXT_PUBLIC_REMOTION_AWS_SECRET_ACCESS_KEY=your-secret-access-key

    # Database
    DATABASE_URL="file:./db.sqlite"

    # Backblaze S3 (or compatible)
    S3_ENDPOINT=your-s3-endpoint
    S3_ACCESS_KEY_ID=your-s3-access-key-id
    S3_SECRET_ACCESS_KEY=your-s3-secret-access-key
    S3_BUCKET_NAME=your-s3-bucket-name

    # Resend (for emails)
    RESEND_API_KEY=your-resend-api-key

    # Better Auth (refer to Better Auth documentation for required variables)
    AUTH_SECRET=your-auth-secret
    AUTH_GOOGLE_ID=your-google-client-id
    AUTH_GOOGLE_SECRET=your-google-client-secret
    # ... other auth providers
    ```

4.  **Database Migrations:**
    ```bash
    npm run db:migrate
    # or
    yarn db:migrate
    ```
    This will apply any pending database migrations.

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for more details on how to get started, report bugs, suggest enhancements, and contribute code.

## Code of Conduct

Please review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) to understand the standards of behavior we expect in our community.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or inquiries, please open an issue on GitHub.
