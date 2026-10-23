![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)

---
<img width="1550" height="1006" alt="image" src="https://github.com/user-attachments/assets/39475f45-2366-428a-ac84-9a78a32b57e2" />

# WhatsChart

WhatsChart is a modern, privacy-first, 100% client-side WhatsApp chat analyzer and data visualization dashboard.

## Project Overview

WhatsChart processes exported WhatsApp chat files (`_chat.txt`) entirely in browser memory using HTML5. All parsing, data aggregation, and chart rendering happen locally on your device.

## Prerequisites

Before getting started, ensure you have the following installed:

*   **Node.js**: v18.0.0 or higher
*   **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`

## Installation & Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/nicolocarcagni/whatschart.git
    cd whatschart
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Run the Local Development Server**

    ```bash
    npm run dev
    ```

4.  **Open in Browser**

    Navigate to `http://localhost:5173` to launch the application.

## Usage

1.  **Export Chat from WhatsApp**:
    *   Open any chat or group in WhatsApp on your mobile device.
    *   Tap **Chat Settings** -> **Export Chat**.
    *   Select **Without Media** to generate the standard `_chat.txt` file.
2.  **Analyze in WhatsChart**:
    *   Drag and drop the exported `_chat.txt` file into WhatsChart.

> **Note on AI Assistance:** Portions of this codebase were developed using AI-assisted generation ("vibecoded") under strict human architectural direction, line-by-line code review, and manual verification.
