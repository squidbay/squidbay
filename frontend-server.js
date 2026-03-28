/**
 * SquidBay Frontend Server
 * Serves static files with real server-side routing for vanity URLs
 * 
 * Security headers via helmet (addresses infra scan findings):
 *   Content-Security-Policy, Strict-Transport-Security, X-Frame-Options,
 *   X-Content-Type-Options, Referrer-Policy, Permissions-Policy
 */

const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers — addresses all frontend header findings from infra scan
// CSP allows *.squidbay.io cross-loading (agent.squidbay.io loads scripts from squidbay.io)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "https://squidbay.io", "https://*.squidbay.io"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://squidbay.io", "https://*.squidbay.io", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://squidbay.io", "https://*.squidbay.io", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://squidbay.io"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.squidbay.io", "https://squidbay-api-production.up.railway.app", "https://*.squidbay.io"],
            frameSrc: ["'none'"],
            frameAncestors: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            scriptSrcAttr: ["'unsafe-inline'"]
        }
    },
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permissionsPolicy: {
        features: {
            camera: [],
            microphone: [],
            geolocation: [],
            payment: ["self"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Static files — serve CSS, JS, images, components with cache headers
// M-05 FIX: Cache-Control headers for static assets
const staticOptions = {
    maxAge: '1d',           // 1 day for CSS/JS
    etag: true,
    lastModified: true
};
const imageOptions = {
    maxAge: '7d',           // 1 week for images
    etag: true,
    lastModified: true
};

// CORS for *.squidbay.io subdomains — allows component fetches from agent.squidbay.io etc.
app.use('/components', (req, res, next) => {
    const origin = req.get('Origin');
    if (origin && origin.endsWith('.squidbay.io')) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
    }
    next();
});

app.use('/css', express.static(path.join(__dirname, 'css'), staticOptions));
app.use('/js', express.static(path.join(__dirname, 'js'), staticOptions));
app.use('/images', express.static(path.join(__dirname, 'images'), imageOptions));
app.use('/components', express.static(path.join(__dirname, 'components'), staticOptions));

// SEO & AI Discovery files — serve with correct content types
app.get('/robots.txt', (req, res) => {
    res.type('text/plain').sendFile(path.join(__dirname, 'robots.txt'));
});
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml').sendFile(path.join(__dirname, 'sitemap.xml'));
});
app.get('/llms.txt', (req, res) => {
    res.type('text/plain').sendFile(path.join(__dirname, 'llms.txt'));
});
app.get('/favicon.svg', (req, res) => {
    res.type('image/svg+xml').sendFile(path.join(__dirname, 'favicon.svg'));
});

// Squid Agent subdomain — serve from /agent/ folder
const squidAgentStatic = express.static(path.join(__dirname, 'agent'), staticOptions);
app.use((req, res, next) => {
    if (req.hostname === 'agent.squidbay.io') {
        return squidAgentStatic(req, res, () => {
            // If static file not found, serve index.html (SPA fallback)
            res.sendFile(path.join(__dirname, 'agent', 'index.html'));
        });
    }
    next();
});

// Vanity URL routes — serve the HTML file, JS reads the URL path directly
// Security report must come BEFORE skill detail (Express matches top-down)
app.get('/skill/:agentName/:slug/security', (req, res) => {
    res.sendFile(path.join(__dirname, 'security.html'));
});

app.get('/skill/:agentName/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'skill.html'));
});

app.get('/agent/:name', (req, res) => {
    res.sendFile(path.join(__dirname, 'agent.html'));
});

// Clean page URLs (no .html needed)
const pages = ['marketplace', 'register', 'about', 'faq', 'help', 'privacy', 'terms', 'thanks', 'api', 'refund'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, `${page}.html`));
    });
});

// Legacy redirect — /agents moved to /register
app.get('/agents', (req, res) => {
    res.redirect(301, '/register');
});

// Static HTML files (direct access still works)
app.use(express.static(__dirname, {
    extensions: ['html']
}));

// Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 fallback
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🦑 SquidBay frontend running on port ${PORT}`);
});
