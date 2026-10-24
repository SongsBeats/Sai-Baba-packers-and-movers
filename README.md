# Sai Baba Packers and Movers

A responsive business website built with HTML, CSS and JavaScript. It uses the supplied business photographs, a custom business logo and a “Managed by Vgrow” footer. There are no frameworks, external packages or build dependencies.

## Preview locally

The page can be opened directly from `index.html`. For the best preview, install Node.js 20 or later and run:

```powershell
npm run dev
```

Open <http://127.0.0.1:5173>. Stop the server with Ctrl+C. `npm start` runs the same server. No `npm install` step is needed. To choose another port in PowerShell:

```powershell
$env:PORT = "5174"
npm run dev
```

## Create the publishable website

```powershell
npm run build
```

The build recreates `dist` with only the public website and web assets. It excludes the original Vgrow source image at the project root, working artifacts, scripts, source prompts and documentation. Publish the contents of `dist` to a static website host using HTTPS.

Once you have the actual public website address, set `SITE_URL` to that address before building again. For example, replace `YOUR-PUBLISHED-DOMAIN` below with your own published domain:

```powershell
$env:SITE_URL = "https://YOUR-PUBLISHED-DOMAIN/"
npm run build
```

Use the full address if the website is published inside a subfolder. The URL must use HTTPS and contain no credentials, query string or fragment. This production build adds a canonical address, absolute social image and business logo URLs, a business website URL in the structured data, and `sitemap.xml`. Without `SITE_URL`, the build omits the canonical address and sitemap instead of assuming a domain. `SITE_URL` is read from the shell environment; this project does not load `.env` files automatically.

After publishing, check the live website on a phone and test the call, WhatsApp, email and directions links. Sign in to the business owner's Google Business Profile, edit the contact information, add the published HTTPS website address to the Website field, and save. This website does not create or verify a Google Business Profile automatically.

## Deploy to Vercel

1. Push the contents of `E:\Vattikota\Vweb` to a Git repository, including `scripts`, `assets`, `package.json` and `vercel.json`.
2. In Vercel, select **Add New → Project** and import that repository. Set **Root Directory** to the folder containing this project's `package.json`: use the repository root if you uploaded this folder's contents, or `Vweb` if the repository contains the parent folder.
3. Check these settings, already provided by `vercel.json`, then deploy:

   | Setting          | Value                                               |
   | ---------------- | --------------------------------------------------- |
   | Framework Preset | Other                                               |
   | Build Command    | `npm run build`                                     |
   | Output Directory | `dist`                                              |
   | Install Command  | Leave the default; this project has no dependencies |

4. Copy your stable production HTTPS address from Vercel. Under **Settings → Environment Variables**, add `SITE_URL` with that exact address for the **Production** environment. Use your custom domain if you have connected one; otherwise use the assigned production Vercel domain. Redeploy so the build includes the canonical URL and sitemap. If you already know your final domain, set `SITE_URL` before the first deployment.
5. Test the public site and its Call and WhatsApp buttons on a phone. Add that same production URL to the Google Business Profile's **Website** field. Use the production address, not a temporary preview deployment URL.

Only `dist` is published. The `.vercelignore` file also excludes local artifacts, documentation, source prompts and the original Vgrow source image when uploading through Vercel. Keep the scripts and website assets available to the build. Future pushes to the production branch trigger new deployments.

Official Vercel references: [Git deployments](https://vercel.com/docs/git), [build and root directory settings](https://vercel.com/docs/builds/configure-a-build), [vercel.json](https://vercel.com/docs/project-configuration/vercel-json), [environment variables](https://vercel.com/docs/environment-variables), and [.vercelignore](https://vercel.com/docs/deployments/vercel-ignore).

## Business information

- Business: Sai Baba Packers and Movers
- Phone: +91 77994 51430
- Email: vattikotilingaswamy444@gmail.com
- Address: Plot No. 40, Omkar Nagar, Hyderabad, Telangana 500074, India

Moving dates, coverage, packing requirements, pricing and bookings must be confirmed directly with the business. Enquiry links open the customer's calling, WhatsApp or email app; there is no server that stores enquiries or confirms bookings.

## Editing

- `index.html`: page content, contact information and search metadata
- `styles.css`: visual design and responsive layouts
- `app.js`: page interactions
- `assets/images`: optimized business photographs and Vgrow logo
- `assets/brand`: business logo, favicon and touch icons
- `scripts/dev.mjs`: local preview server
- `scripts/build.mjs`: static publishing build

Keep the phone, address and business name consistent with the Google Business Profile. Update visible content and structured data together whenever business details change.

## Google Business Profile

See [GOOGLE-BUSINESS-PROFILE.md](GOOGLE-BUSINESS-PROFILE.md) for copy-ready details, a description, photo paths and current official setup instructions. Visits are by appointment and the location has no permanent business signage, so use a service-area profile with the street address hidden publicly. The confirmed service area is Hyderabad, including all areas within the city. Proposed enquiry hours are 9:00 am–7:00 pm daily, including Sunday, only if the team can reliably respond during those hours.
"# Sai-Baba-packers-and-movers" 
