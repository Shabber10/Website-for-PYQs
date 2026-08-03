# PYQ Portal - Website for ALL-PYQ-Papers 🚀

This repository contains the source code for the **PYQ Portal Web Application**, a search and filter dashboard built to access over 2,800+ Previous Year Question Papers (PYQs). 

The website queries metadata from the main papers repository: [Shabber10/ALL-PYQ-Papers](https://github.com/Shabber10/ALL-PYQ-Papers) and serves PDFs dynamically using JSDelivr CDN.

## ✨ Features

- 🔍 **Instant Search:** Full-text search across categories, subcategories, years, and file names.
- 📂 **Multi-Level Filters:** Narrow down by exam categories (Boards, JEE, NEET, UPSC), subcategories (e.g. state boards, NDA, Civil Services), and years.
- ⚡ **JSDelivr CDN Integration:** Bypasses GitHub raw file limits and opens PDFs directly inline in your browser's PDF viewer.
- 🌓 **Dark Mode:** Seamless light/dark theme toggling for convenient late-night reading.
- 📱 **Fully Responsive:** Sleek and modern design optimized for mobile, tablet, and desktop screens.

## 🛠️ Technology Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Icons:** Lucide React
- **Styling:** Vanilla CSS (curated HSL palettes, smooth animations, and glassmorphic elements)

## 🚀 Local Development

Follow these steps to run the portal on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shabber10/Website-for-PYQs.git
   cd Website-for-PYQs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🌐 Hosting & Deployment

The website is ready to be hosted on static hosting providers like **Netlify**, **Vercel**, or **GitHub Pages**.

### Deploying to Netlify / Vercel:
1. Connect this GitHub repository (`Shabber10/Website-for-PYQs`) to your Netlify or Vercel account.
2. Set the following build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. Deploy! Netlify/Vercel will automatically rebuild and deploy the site whenever you push changes to the `main` branch.
