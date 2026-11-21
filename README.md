# ASA — “Asa ta padulong?”

ASA is a Cebu-inspired trip planning and navigation demo where the app intentionally makes journeys more complicated. It combines map planning, simulated travel, changing traffic conditions, route redirection, humorous Bisaya-English messages, and interactive CAPTCHA challenges.

The project runs as a front-end web application using React and Vite. Live map search and routing require internet access, while fallback behavior allows limited use when a connection is unavailable.

## Requirements

Before starting, install:

- [Git](https://git-scm.com/) — to clone the repository
- [Node.js](https://nodejs.org/) version 18 or newer — includes npm
- A modern web browser such as Chrome, Edge, Firefox, or Safari
- Internet access for live map search and routing

Verify the required tools in a terminal:

```bash
git --version
node --version
npm --version
```

Each command should display a version number. If `git`, `node`, or `npm` is not recognized, install or configure that tool first and reopen the terminal.

## 1. Clone the Repository

Open a terminal and move to the folder where you want to keep the project.

```bash
cd /path/to/your/projects
```

Clone the repository:

```bash
git clone https://github.com/Kummorrii/asa-g.git
```

Enter the project folder:

```bash
cd asa-g
```

Confirm that you are in the correct project directory:

```bash
ls
```

You should see files and folders including `package.json`, `src`, `index.html`, and `README.md`.

## 2. Install Dependencies

Install all packages required by the application:

```bash
npm install
```

Wait until npm finishes successfully. Do not close the terminal while installation is running.

## 3. Start the Development Server

Run:

```bash
npm run dev
```

After Vite starts, the terminal will show a local address such as:

```text
Local: http://localhost:5173/
```

Open that address in a web browser.

To stop the development server, press:

```text
Ctrl+C
```

## 4. Use the Application

1. Open the app in the browser.
2. Select **Drive** or **Walk**.
3. Enter a starting point or choose it on the map.
4. Enter a destination or choose it on the map.
5. Select **Get route**.
6. Follow the on-screen controls to start or reset the trip.

## 5. Create a Production Build

To check or prepare the app for deployment:

```bash
npm run build
```

The completed production files are written to the `dist` folder.

## 6. Preview the Production Build

Build the application first, if you have not already:

```bash
npm run build
```

Then start the local preview server:

```bash
npm run preview
```

Open the address displayed by Vite, normally:

```text
http://localhost:4173
```

## Optional: Update an Existing Clone

From inside the project directory, download the latest changes:

```bash
git pull origin main
```

Then reinstall dependencies in case packages changed:

```bash
npm install
```

## Troubleshooting

### `npm install` fails

- Confirm Node.js and npm are installed with `node --version` and `npm --version`.
- Delete the `node_modules` folder and `package-lock.json`, then run `npm install` again.

```bash
rm -rf node_modules package-lock.json
npm install
```

On Windows PowerShell, use:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### Port 5173 is already in use

Stop the process using the port or let Vite choose another available port:

```bash
npm run dev -- --host
```

### Live search or routing is unavailable

Check the internet connection and browser network access. The app may still demonstrate its offline fallback routes and simulation features.
