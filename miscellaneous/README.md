# Nails by Lisa

This website is built using HTML, CSS, and JavaScript. It demonstrates a small business site structure, styling, and interactivity for learning and practice purposes.

## Features

- Responsive layout for desktop and mobile
- Navigation menu with linked pages
- Home, About Us, Services, Enquiry, and Contact sections
- Font Awesome icons integration
- Basic CSS styling

## Sitemap

    index.html (Home)
    ├── about.html
    ├── services.html
    ├── enquiry.html
    └── contact.html

All five pages share the same navigation bar, so every page links back to every other page.

## File & Folder Structure

 nailsbylisa/
│
├── assets/
│   └── images/
│       ├── nail-set1.jpeg
│       ├── nail-set2.jpeg
│       ├── nail-set3.jpeg
│       ├── nail-set4.jpeg
│       └── nail-set5.jpeg
│
├── css/
│   └── style.css
│
├── js/
│
├── miscellaneous/
│
└── pages/
    ├── index.html
    ├── about.html
    ├── services.html
    ├── enquiry.html
    └── contact.html

## Installation / How to Run

1. Download or clone this repository.
2. Open the index.html file in any modern browser.
3. No server setup is required (static website).

## Dependencies

- Font Awesome — for icons
- Google Fonts — for typography (serif headings and clean body text)

## Usage Instructions

- Edit index.html to update homepage content and featured sets.
- Modify css/styles.css to change colors (Rose Gold, Emerald, Black), fonts, or layout.
- Add new pages and link them through the navigation bar.

## Sources

- Font Awesome icon library, https://fontawesome.com (Fonticons, Inc., 2025) — used for navigation and social icons.
- Google Fonts, https://fonts.google.com (Google, 2025) — used for heading and body typefaces.
- Google Maps Embed API, https://developers.google.com/maps/documentation/embed (Google, 2025) — used for the studio location map on contact.html.

## Author

Ayabukwa Buli

## Changelog

**v1.0.0 – Initial Release (2025-08-27)**
- Added homepage (index.html)
- Created About Us and Contact pages
- Added navigation bar and footer

**v1.1.0 (2025-09-26)**
- Added CSS for decoration, layout, and typography
- Improved mobile responsiveness for Instagram bio traffic
- Integrated Font Awesome icons
- Added responsive CSS styling and studio policy booking flow

**v1.2.0 – Part 2 Revision (current)**
- Added Sitemap section
- Rewrote folder tree with consistent symbols, lowercase folder names, index.html moved to top
- Removed references to policies.html and booking.html (pages that don't exist in the repo)
- Added Sources section with in-text-style citations for third-party assets
- Added footer, removed inline styles, fixed invalid HTML nesting across all pages

See responsive design snippets:
- ./assets/image320px
- ./assets/image678px

 
 ## Improvements from part 2 feedbaCK
 Add in-text citations 
Add a sitemap section with a simple tree or diagram 
Fix inconsistent symbols in the folder tree 
Make all folder names lowercase 
Move index.html to the top of the tree, not the bottom.
Add a space after # in comments
Replace generic <div>s with semantic tags like <header>, <nav>, <main>, <footer> in your HTML files.
Don't mix a <div class="footer"> with real <footer> tags — pick one.