/* ============================================================
   NAILS BY LISA - COMPLETE script.js
   ============================================================ */


/* ============================================================
   1. FIREBASE IMPORTS
   ============================================================ */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
    getFirestore,
    doc,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    writeBatch,
    runTransaction
} from
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";


/* ============================================================
   2. FIREBASE CONFIGURATION
   ============================================================ */

// Your Nails by Lisa Firebase web app configuration.

const firebaseConfig = {
    apiKey: "AIzaSyAVblyPBli9FP3ZBdqNQFQ70wIrxD9LKVE",
    authDomain: "nails-by-lisa.firebaseapp.com",
    projectId: "nails-by-lisa",
    storageBucket: "nails-by-lisa.firebasestorage.app",
    messagingSenderId: "742286503880",
    appId: "1:742286503880:web:90035b2923b580d4b6dafd",
    measurementId: "G-CTBXEK3HEX"
};


// Lisa's authorised Google account.
const OWNER_EMAIL = "ayabukwabuli4@gmail.com".toLowerCase();

const INSTAGRAM_URL =
    "https://www.instagram.com/nailsbylisam_/";

const MAX_REFERENCE_IMAGE_SIZE = 5 * 1024 * 1024;

const MAX_GALLERY_IMAGE_SIZE = 5 * 1024 * 1024;

const MAX_PER_DAY_LIMIT = 50;

const MAX_DAYS_AHEAD_LIMIT = 180;

const MAX_COLOURS_PER_BOOKING = 10;

const DEFAULT_SETTINGS = {
    maxPerDay: 3,
    daysAhead: 30,
    closedWeekdays: [0]
};


/* ============================================================
   3. COLOUR OPTIONS
   ============================================================ */

const STARTER_COLOURS = [
    ["Classic Red", "#d32f2f"],
    ["Baby Pink", "#f8bbd0"],
    ["Hot Pink", "#e91e8c"],
    ["Nude", "#e0b9a0"],
    ["Burgundy", "#800020"],
    ["Black", "#111111"],
    ["White", "#ffffff"],
    ["Lilac", "#c8a2e0"],
    ["Royal Blue", "#1e4fd8"],
    ["Baby Blue", "#a8d8f0"],
    ["Mint", "#a8e6cf"],
    ["Emerald", "#046307"],
    ["Gold", "#d4af37"],
    ["Silver", "#c0c0c0"],
    ["Coral", "#ff7f50"],
    ["Peach", "#ffcba4"],
    ["Orange", "#ff8c00"],
    ["Yellow", "#ffd700"],
    ["Champagne", "#f7e7ce"],
    ["Rose Gold", "#b76e79"],
    ["Chocolate Brown", "#6f4e37"],
    ["Mocha", "#967969"],
    ["Taupe", "#b38b6b"],
    ["Lavender", "#e6e6fa"],
    ["Plum", "#673147"],
    ["Teal", "#008080"],
    ["Turquoise", "#40e0d0"],
    ["Navy Blue", "#000080"],
    ["Sage Green", "#9caf88"],
    ["Olive Green", "#808000"],
    ["Neon Green", "#39ff14"],
    ["Neon Orange", "#ff5f1f"],
    ["Neon Yellow", "#dfff00"],
    ["Clear", "#f5f5f5"],
    ["French White", "#fffafa"]
];


/* ============================================================
   4. SERVICES
   ============================================================ */

const STARTER_STYLES = [
    "Acrylic Overlay",
    "Full Set with Tips",
    "Pedicure (Plain Overlay)",
    "Pedicure (Toe Reconstruction)",
    "French Tips",
    "Rhinestones & Gems",
    "Glitter Polish & Encapsulation"
];


/* ============================================================
   5. NAIL SHAPE PHOTOS
   ============================================================ */

// These images must be saved inside Lisa-main/assets/.

const NAIL_STYLES = [
    {
        name: "Almond",
        src: new URL("../assets/almond.jpeg", import.meta.url).href,
        alt: "Almond-shaped nail style"
    },
    {
        name: "Stiletto",
        src: new URL("../assets/stiletto.jpeg", import.meta.url).href,
        alt: "Stiletto-shaped nail style"
    },
    {
        name: "Duck",
        src: new URL("../assets/duck.jpeg", import.meta.url).href,
        alt: "Duck-shaped nail style"
    },
    {
        name: "Coffin",
        src: new URL("../assets/coffin.jpeg", import.meta.url).href,
        alt: "Coffin-shaped nail style"
    }
];


/* ============================================================
   6. LOCAL GALLERY PHOTOS
   ============================================================ */

const LOCAL_GALLERY = [
    {
        file: "gallery nails",
        name: "Gallery Nails 1",
        alt: "Nail design by Nails by Lisa"
    },
    {
        file: "gallery nails2",
        name: "Gallery Nails 2",
        alt: "Nail design by Nails by Lisa"
    },
    {
        file: "gallery nails3",
        name: "Gallery Nails 3",
        alt: "Nail design by Nails by Lisa"
    },
    {
        file: "gallery nails4",
        name: "Gallery Nails 4",
        alt: "Nail design by Nails by Lisa"
    },
    {
        file: "gallery nails5",
        name: "Gallery Nails 5",
        alt: "Nail design by Nails by Lisa"
    },
    {
        file: "gallery nails6",
        name: "Gallery Nails 6",
        alt: "Nail design by Nails by Lisa"
    },
    {
        file: "gallery nails7",
        name: "Gallery Nails 7",
        alt: "Nail design by Nails by Lisa"
    }
];

const IMAGE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".JPG",
    ".JPEG",
    ".PNG",
    ".WEBP"
];


/* ============================================================
   7. SHARED APPLICATION DATA
   ============================================================ */

let app = null;
let db = null;
let auth = null;
let storage = null;

let ownerUser = null;

let unsubscribeBookings = null;
let unsubscribeGallery = null;

let galleryListening = false;

let submitting = false;

let loadError = null;

let overlay = null;
let bodyBox = null;
let tabsBox = null;

let lightbox = null;
let lightboxImage = null;
let lightboxCaption = null;

let currentTab = "book";

let message = null;

const data = {
    settings: { ...DEFAULT_SETTINGS },
    colours: [],
    styles: [],
    gallery: [],
    dayCounts: {},
    bookings: []
};


let choice = {
    date: null,
    shape: null,
    colours: [],
    style: null,
    name: "",
    phone: "",
    referenceFile: null
};


/* ============================================================
   8. CREATE HTML ELEMENTS
   ============================================================ */

function el(tag, props, ...kids) {
    const element = document.createElement(tag);

    Object.keys(props || {}).forEach(key => {
        const value = props[key];

        if (key === "class") {
            element.className = value;

        } else if (key === "style") {
            element.style.cssText = value;

        } else if (
            key.startsWith("on") &&
            typeof value === "function"
        ) {
            element.addEventListener(
                key.slice(2),
                value
            );

        } else if (key in element) {
            element[key] = value;

        } else if (
            value !== null &&
            value !== undefined
        ) {
            element.setAttribute(
                key,
                String(value)
            );
        }
    });

    kids.flat().forEach(kid => {
        if (
            kid !== null &&
            kid !== undefined &&
            kid !== false
        ) {
            element.append(
                kid instanceof Node
                    ? kid
                    : document.createTextNode(String(kid))
            );
        }
    });

    return element;
}


/* ============================================================
   9. DATE FUNCTIONS
   ============================================================ */

function toISO(date) {
    return (
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0")
    );
}


function prettyDate(iso) {
    const [year, month, day] =
        iso.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        day
    ).toLocaleDateString("en-ZA", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}


/* ============================================================
   10. FIREBASE INITIALISATION
   ============================================================ */

function startFirebase() {

    try {
        app = initializeApp(firebaseConfig);

        db = getFirestore(app);

        auth = getAuth(app);

        storage = getStorage(app);

    } catch (error) {
        console.error(
            "Firebase initialisation failed:",
            error
        );

        loadError =
            "Firebase could not initialise. Check your Firebase configuration.";

        refresh();
        return;
    }


    /* SETTINGS */

    onSnapshot(
        doc(db, "settings", "main"),

        snap => {

            data.settings = {
                ...DEFAULT_SETTINGS,
                ...(snap.exists() ? snap.data() : {})
            };

            data.settings.maxPerDay = Math.min(
                MAX_PER_DAY_LIMIT,
                Math.max(
                    1,
                    Number(data.settings.maxPerDay) ||
                    DEFAULT_SETTINGS.maxPerDay
                )
            );

            data.settings.daysAhead = Math.min(
                MAX_DAYS_AHEAD_LIMIT,
                Math.max(
                    0,
                    Number(data.settings.daysAhead) || 0
                )
            );

            if (
                !Array.isArray(
                    data.settings.closedWeekdays
                )
            ) {
                data.settings.closedWeekdays = [0];
            }

            refresh();
        },

        onLoadError
    );


    /* COLOURS */

    onSnapshot(
        collection(db, "colours"),

        snap => {
            data.colours = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            refresh();
        },

        onLoadError
    );


    /* SERVICES */

    onSnapshot(
        collection(db, "styles"),

        snap => {
            data.styles = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            refresh();
        },

        onLoadError
    );


    /* DAILY BOOKING COUNTS */

    onSnapshot(
        collection(db, "dayCounts"),

        snap => {
            data.dayCounts = {};

            snap.docs.forEach(d => {
                data.dayCounts[d.id] =
                    Number(d.data().count) || 0;
            });

            refresh();
        },

        onLoadError
    );


    /* OWNER AUTHENTICATION */

    onAuthStateChanged(
        auth,

        async user => {

            const isOwner = Boolean(
                user &&
                user.email &&
                user.email.toLowerCase() === OWNER_EMAIL &&
                user.emailVerified
            );

            if (user && !isOwner) {

                ownerUser = null;
                data.bookings = [];

                if (unsubscribeBookings) {
                    unsubscribeBookings();
                    unsubscribeBookings = null;
                }

                refresh(true);

                try {
                    await signOut(auth);
                } catch (error) {
                    console.error(
                        "Could not sign out unauthorised account:",
                        error
                    );
                }

                return;
            }

            ownerUser = isOwner ? user : null;

            if (unsubscribeBookings) {
                unsubscribeBookings();
                unsubscribeBookings = null;
            }

            if (ownerUser) {

                unsubscribeBookings = onSnapshot(
                    collection(db, "bookings"),

                    snap => {
                        data.bookings = snap.docs.map(d => ({
                            id: d.id,
                            ...d.data()
                        }));

                        refresh();
                    },

                    onLoadError
                );

            } else {
                data.bookings = [];
            }

            refresh(true);
        }
    );
}


/* ============================================================
   11. FIREBASE ERROR HANDLING
   ============================================================ */

function onLoadError(error) {
    console.error(
        "Firebase data error:",
        error
    );

    loadError =
        "Could not load online information. Check your internet connection and Firebase security rules.";

    refresh();
}


/* ============================================================
   12. FIREBASE GALLERY LISTENER
   ============================================================ */

function loadGalleryOnce() {
    if (galleryListening || !db) {
        return;
    }

    galleryListening = true;

    unsubscribeGallery = onSnapshot(
        collection(db, "gallery"),

        snap => {

            data.gallery = snap.docs
                .map(d => ({
                    id: d.id,
                    ...d.data()
                }))
                .sort((a, b) =>
                    (Number(b.added) || 0) -
                    (Number(a.added) || 0)
                );

            refresh();
        },

        onLoadError
    );
}


/* ============================================================
   13. COLOUR FUNCTIONS
   ============================================================ */

function allColoursForOwner() {

    const savedByName = new Map(
        data.colours
            .filter(colour => colour.name)
            .map(colour => [
                colour.name.toLowerCase(),
                colour
            ])
    );

    const standard = STARTER_COLOURS.map(
        ([name, hex]) => {

            const saved = savedByName.get(
                name.toLowerCase()
            );

            return {
                id: saved?.id || null,
                name,
                hex: saved?.hex || hex,
                available: saved
                    ? saved.available !== false
                    : true
            };
        }
    );

    const standardNames = new Set(
        STARTER_COLOURS.map(
            ([name]) => name.toLowerCase()
        )
    );

    const extras = data.colours.filter(colour =>
        colour.name &&
        !standardNames.has(
            colour.name.toLowerCase()
        )
    );

    return [...standard, ...extras];
}


function availableColours() {
    return allColoursForOwner().filter(
        colour => colour.available !== false
    );
}


/* ============================================================
   14. SERVICE FUNCTIONS
   ============================================================ */

function availableServices() {

    const savedByName = new Map(
        data.styles
            .filter(style => style.name)
            .map(style => [
                style.name.toLowerCase(),
                style
            ])
    );

    const standard = STARTER_STYLES.map(name => {

        const saved = savedByName.get(
            name.toLowerCase()
        );

        return {
            id: saved?.id || null,
            name,
            available: saved
                ? saved.available !== false
                : true
        };
    });

    const standardNames = new Set(
        STARTER_STYLES.map(
            name => name.toLowerCase()
        )
    );

    const extras = data.styles.filter(style =>
        style.name &&
        !standardNames.has(
            style.name.toLowerCase()
        ) &&
        style.available !== false
    );

    return [
        ...standard.filter(service => service.available),
        ...extras
    ];
}


/* ============================================================
   15. BOOKING DATES
   ============================================================ */

function getOpenDays() {

    const days = [];

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    for (
        let i = 0;
        i <= data.settings.daysAhead;
        i++
    ) {

        const date = new Date(today);

        date.setDate(
            today.getDate() + i
        );

        if (
            data.settings.closedWeekdays.includes(
                date.getDay()
            )
        ) {
            continue;
        }

        const iso = toISO(date);

        const booked =
            data.dayCounts[iso] || 0;

        days.push({
            iso,

            left: Math.max(
                0,
                data.settings.maxPerDay - booked
            ),

            full:
                booked >= data.settings.maxPerDay
        });
    }

    return days;
}


/* ============================================================
   16. MESSAGE FUNCTIONS
   ============================================================ */

function showMsg(type, text) {

    message = {
        type,
        text
    };

    render();

    if (bodyBox) {
        bodyBox.scrollTop = 0;
    }
}


function run(promise, successText) {

    return promise

        .then(() => {

            if (successText) {
                showMsg(
                    "ok",
                    successText
                );
            }
        })

        .catch(error => {

            console.error(
                "Operation failed:",
                error
            );

            showMsg(
                "err",
                "Could not complete the action. Check Firebase permissions and your connection."
            );
        });
}


/* ============================================================
   17. OWNER LOGIN - GOOGLE SIGN-IN
   ============================================================ */

async function ownerLogin(enteredEmail) {

    const requestedEmail = String(enteredEmail || "")
        .trim()
        .toLowerCase();

    if (!requestedEmail) {
        showMsg(
            "err",
            "Please enter Lisa's Google account email address."
        );
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestedEmail)) {
        showMsg(
            "err",
            "Please enter a valid email address."
        );
        return;
    }

    if (requestedEmail !== OWNER_EMAIL) {
        showMsg(
            "err",
            "This email address is not authorised to access the owner dashboard."
        );
        return;
    }

    if (!auth) {
        showMsg(
            "err",
            "Google sign-in is not connected. Check your Firebase configuration."
        );
        return;
    }

    try {

        const provider = new GoogleAuthProvider();

        provider.setCustomParameters({
            prompt: "select_account",
            login_hint: requestedEmail
        });

        const result = await signInWithPopup(
            auth,
            provider
        );

        const user = result.user;

        const isOwner = Boolean(
            user &&
            user.email &&
            user.email.toLowerCase() === OWNER_EMAIL &&
            user.email.toLowerCase() === requestedEmail &&
            user.emailVerified
        );

        if (!isOwner) {
            await signOut(auth);

            showMsg(
                "err",
                "The Google account you signed in with is not authorised to access the Nails by Lisa owner dashboard."
            );
            return;
        }

        showMsg(
            "ok",
            "Welcome, Lisa! You have successfully signed in."
        );

    } catch (error) {

        console.error(
            "Google owner login failed:",
            error
        );

        if (error.code === "auth/popup-closed-by-user") {

            showMsg(
                "err",
                "Google sign-in was cancelled."
            );

        } else if (error.code === "auth/unauthorized-domain") {

            showMsg(
                "err",
                "This website domain is not authorised in Firebase Authentication settings."
            );

        } else if (error.code === "auth/popup-blocked") {

            showMsg(
                "err",
                "Your browser blocked the Google sign-in popup. Allow popups for this website and try again."
            );

        } else if (error.code === "auth/operation-not-allowed") {

            showMsg(
                "err",
                "Google sign-in is not enabled in Firebase Authentication."
            );

        } else {

            showMsg(
                "err",
                "Google sign-in failed. Check your Firebase settings and internet connection, then try again."
            );
        }
    }
}


/* ============================================================
   18. POPUP CSS
   ============================================================ */

function injectStyles() {

    document.head.appendChild(
        el("style", null, `

        .nbl-floating {
            position: fixed;
            right: 18px;
            bottom: 18px;
            z-index: 9998;
            background: var(--rose-gold, #B76E79);
            color: white;
            border: none;
            border-radius: 30px;
            padding: 14px 22px;
            cursor: pointer;
            box-shadow: 0 3px 12px rgba(0,0,0,.2);
            transition: .3s ease;
        }

        .nbl-floating:hover {
            transform: translateY(-3px);
            background: #96515d;
        }

        .nbl-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.65);
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }

        .nbl-overlay.open {
            display: flex;
        }

        .nbl-panel {
            width: 100%;
            max-width: 900px;
            max-height: 94vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: white;
            border-radius: 14px;
            color: #222;
        }

        .nbl-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 18px;
            background: var(--emerald, #0B3B24);
            border-bottom: 3px solid var(--rose-gold, #B76E79);
        }

        .nbl-head h2 {
            margin: 0;
            color: var(--rose-gold-light, #E8C5C8);
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 1.4rem;
        }

        .nbl-overlay .nbl-close {
            width: auto;
            background: none;
            border: none;
            color: white;
            font-size: 25px;
            cursor: pointer;
        }

        .nbl-tabs {
            display: flex;
            background: #f6e9eb;
        }

        .nbl-overlay .nbl-tab {
            flex: 1;
            width: auto;
            background: none;
            color: var(--emerald, #0B3B24);
            border: none;
            border-radius: 0;
            padding: 12px 5px;
            cursor: pointer;
        }

        .nbl-overlay .nbl-tab.active {
            background: white;
            color: var(--rose-gold, #B76E79);
            border-bottom: 3px solid var(--rose-gold, #B76E79);
        }

        .nbl-body {
            padding: 18px;
            overflow-y: auto;
            background: white;
        }

        .nbl-body h3 {
            margin: 18px 0 8px;
            font-family: 'Playfair Display', Georgia, serif;
            color: var(--rose-gold, #B76E79);
            font-size: 1.15rem;
        }

        .nbl-body h3:first-child {
            margin-top: 0;
        }

        .nbl-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .nbl-overlay .nbl-chip {
            width: auto;
            padding: 8px 12px;
            border: 2px solid #e5c2d6;
            border-radius: 10px;
            background: white;
            color: #222;
            cursor: pointer;
            transition: .2s ease;
        }

        .nbl-overlay .nbl-chip:hover {
            transform: translateY(-2px);
        }

        .nbl-overlay .nbl-chip.selected {
            border-color: var(--rose-gold, #B76E79);
            background: #f6e9eb;
            font-weight: bold;
        }

        .nbl-chip small {
            display: block;
            font-size: 11px;
        }

        .nbl-swatch {
            display: inline-block;
            width: 18px;
            height: 18px;
            margin-right: 6px;
            border: 1px solid #888;
            border-radius: 50%;
            vertical-align: middle;
        }

        .nbl-selected-colours {
            margin-top: 10px;
            padding: 10px;
            background: #f6e9eb;
            border-radius: 8px;
            color: #0B3B24;
            font-size: 14px;
        }

        .nbl-input {
            box-sizing: border-box;
            width: 100%;
            max-width: 100%;
            padding: 10px;
            margin: 5px 5px 5px 0;
            border: 1px solid #ccc;
            border-radius: 7px;
            background: white;
            color: #222;
        }

        .nbl-input:focus {
            outline: 2px solid var(--rose-gold-light, #E8C5C8);
        }

        .nbl-overlay .nbl-btn {
            width: auto;
            padding: 10px 18px;
            margin: 5px 5px 5px 0;
            border: none;
            border-radius: 8px;
            background: var(--rose-gold, #B76E79);
            color: white;
            cursor: pointer;
            transition: .2s ease;
        }

        .nbl-overlay .nbl-btn:hover {
            opacity: .88;
            transform: translateY(-2px);
        }

        .nbl-overlay .nbl-btn.grey {
            background: #777;
        }

        .nbl-overlay .nbl-btn.red {
            background: #c62828;
        }

        .nbl-msg {
            padding: 10px;
            margin: 10px 0;
            border-radius: 8px;
            font-size: 14px;
        }

        .nbl-msg.ok {
            background: #e0f7e4;
            color: #1b5e20;
        }

        .nbl-msg.err {
            background: #fde0e0;
            color: #b71c1c;
        }

        .nbl-msg.info {
            background: #fff4d6;
            color: #6d4c00;
        }

        .nbl-shapes-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
        }

        .nbl-overlay .nbl-shape-card {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 8px;
            border: 2px solid #E8C5C8;
            border-radius: 10px;
            background: white;
            color: #0B3B24;
            cursor: pointer;
        }

        .nbl-overlay .nbl-shape-card.selected {
            border: 3px solid #B76E79;
            background: #f6e9eb;
        }

        .nbl-shape-card img {
            width: 100%;
            height: 145px;
            object-fit: cover;
            border-radius: 8px;
        }

        .nbl-shape-name {
            font-weight: 600;
            text-align: center;
        }

        .nbl-media {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
        }

        .nbl-photo {
            padding: 7px;
            background: white;
            border: 1px solid #ead7d9;
            border-radius: 10px;
        }

        .nbl-photo img {
            display: block;
            width: 100%;
            height: 220px;
            object-fit: cover;
            border-radius: 8px;
            cursor: zoom-in;
        }

        .nbl-photo-name {
            text-align: center;
            padding: 7px 0;
            font-weight: 600;
            color: var(--emerald, #0B3B24);
        }

        .nbl-image-error {
            font-size: 12px;
            padding: 12px;
            background: #fff4d6;
            color: #6d4c00;
        }

        .nbl-instagram {
            display: inline-block;
            margin: 10px 0;
            padding: 10px 16px;
            border-radius: 8px;
            background: var(--emerald, #0B3B24);
            color: white;
            text-decoration: none;
            font-weight: 600;
        }

        .nbl-reference-preview {
            width: 100%;
            max-width: 250px;
            margin-top: 8px;
            border: 1px solid #E8C5C8;
            border-radius: 8px;
            cursor: zoom-in;
        }

        .nbl-stats-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
            margin: 12px 0;
        }

        .nbl-stat {
            padding: 12px;
            border: 1px solid #ead7d9;
            border-radius: 10px;
            background: #fffafa;
        }

        .nbl-stat strong {
            display: block;
            font-size: 1.5rem;
            color: var(--emerald, #0B3B24);
        }

        .nbl-stat span {
            font-size: 12px;
            color: #555;
        }

        .nbl-summary-list {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            margin: 8px 0 16px;
        }

        .nbl-summary-item {
            border: 1px solid #e5c2d6;
            border-radius: 8px;
            padding: 7px 10px;
            font-size: 13px;
        }

        .nbl-booking-card {
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ead7d9;
            border-radius: 10px;
            background: white;
        }

        .nbl-booking-card p {
            margin: 5px 0;
            font-size: 13px;
            overflow-wrap: anywhere;
        }

        .nbl-booking-card strong {
            color: var(--emerald, #0B3B24);
        }

        .nbl-colour-admin {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            padding: 9px 4px;
            border-bottom: 1px solid #eee;
        }

        .nbl-colour-admin label {
            display: flex;
            align-items: center;
            gap: 7px;
            font-size: 13px;
        }

        .nbl-colour-admin input {
            width: auto;
        }

        .nbl-lightbox {
            position: fixed;
            inset: 0;
            z-index: 10010;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(0,0,0,.9);
        }

        .nbl-lightbox.open {
            display: flex;
        }

        .nbl-lightbox-content {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            max-width: 95vw;
            max-height: 95vh;
        }

        .nbl-lightbox-content img {
            max-width: 90vw;
            max-height: 82vh;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 10px;
            cursor: zoom-out;
        }

        .nbl-lightbox-caption {
            color: white;
            font-size: 15px;
            text-align: center;
        }

        .nbl-lightbox-close {
            position: absolute;
            top: -42px;
            right: 0;
            width: 38px;
            height: 38px;
            border: none;
            border-radius: 50%;
            background: #B76E79;
            color: white;
            font-size: 22px;
            cursor: pointer;
        }

        @media (max-width: 520px) {

            .nbl-shapes-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .nbl-shape-card img {
                height: 130px;
            }

            .nbl-panel {
                max-height: 95vh;
            }

            .nbl-body {
                padding: 12px;
            }

            .nbl-media {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .nbl-photo img {
                height: 160px;
            }

            .nbl-stats-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

    `));
}


/* ============================================================
   19. IMAGE PREVIEW / LIGHTBOX
   ============================================================ */

function openImagePreview(src, title) {

    if (!src) return;

    if (!lightbox) {

        lightboxImage = el("img", {
            alt: "Nail design by Lisa"
        });

        lightboxCaption = el(
            "p",
            { class: "nbl-lightbox-caption" }
        );

        lightbox = el(
            "div",
            {
                class: "nbl-lightbox",

                onclick: event => {
                    if (event.target === lightbox) {
                        closeImagePreview();
                    }
                }
            },

            el(
                "div",
                { class: "nbl-lightbox-content" },

                el(
                    "button",
                    {
                        class: "nbl-lightbox-close",
                        onclick: closeImagePreview,
                        "aria-label": "Close image"
                    },
                    "×"
                ),

                lightboxImage,
                lightboxCaption
            )
        );

        lightboxImage.addEventListener(
            "click",
            closeImagePreview
        );

        document.body.appendChild(lightbox);
    }

    lightboxImage.src = src;

    lightboxImage.alt =
        title || "Nail design by Lisa";

    lightboxCaption.textContent =
        title || "Nail design by Lisa";

    lightbox.classList.add("open");
}


function closeImagePreview() {

    if (lightbox) {
        lightbox.classList.remove("open");
    }
}


/* ============================================================
   20. LOCAL GALLERY PHOTO CARD
   ============================================================ */

function createLocalGalleryCard(photo) {

    const card = el("div", {
        class: "nbl-photo"
    });

    const image = el("img", {
        alt: photo.alt,
        loading: "lazy",
        title: "Click to enlarge"
    });

    const caption = el(
        "p",
        { class: "nbl-photo-name" },
        photo.name
    );

    let extensionIndex = 0;


    function tryNextExtension() {

        if (
            extensionIndex >= IMAGE_EXTENSIONS.length
        ) {

            image.hidden = true;

            card.appendChild(
                el(
                    "p",
                    { class: "nbl-image-error" },
                    "Image not found. Check filename: " + photo.file
                )
            );

            return;
        }

        const extension =
            IMAGE_EXTENSIONS[extensionIndex++];

        image.src = new URL(
            "../assets/" +
            photo.file +
            extension,
            import.meta.url
        ).href;
    }


    image.addEventListener(
        "error",
        tryNextExtension
    );

    image.addEventListener("click", () => {

        openImagePreview(
            image.currentSrc || image.src,
            photo.name
        );

    });

    card.append(
        image,
        caption
    );

    tryNextExtension();

    return card;
}


/* ============================================================
   21. BUILD BOOKING POPUP
   ============================================================ */

function buildPopup() {

    bodyBox = el("div", {
        class: "nbl-body"
    });

    tabsBox = el("div", {
        class: "nbl-tabs"
    });

    overlay = el(
        "div",
        {
            class: "nbl-overlay",

            onclick: event => {

                if (event.target === overlay) {
                    closePopup();
                }
            }
        },

        el(
            "div",
            {
                class: "nbl-panel",
                role: "dialog",
                "aria-modal": "true"
            },

            el(
                "div",
                { class: "nbl-head" },

                el(
                    "h2",
                    null,
                    "Nails by Lisa"
                ),

                el(
                    "button",
                    {
                        class: "nbl-close",
                        onclick: closePopup,
                        "aria-label": "Close"
                    },
                    "✕"
                )
            ),

            tabsBox,
            bodyBox
        )
    );

    document.body.appendChild(overlay);

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeImagePreview();
                closePopup();
            }
        }
    );
}


function openPopup(tab) {

    currentTab = tab;

    message = null;

    overlay.classList.add("open");

    document.body.style.overflow = "hidden";

    render();
}


function closePopup() {

    if (!overlay) return;

    overlay.classList.remove("open");

    document.body.style.overflow = "";
}


function refresh(force = false) {

    if (
        !overlay ||
        !overlay.classList.contains("open")
    ) {
        return;
    }

    const active = document.activeElement;

    if (
        !force &&
        active &&
        active.tagName === "INPUT" &&
        bodyBox.contains(active)
    ) {
        return;
    }

    render();
}


/* ============================================================
   22. MAIN RENDER FUNCTION
   ============================================================ */

function render() {

    if (!bodyBox || !tabsBox) return;

    const scrollPosition = bodyBox.scrollTop;

    tabsBox.innerHTML = "";

    [
        ["book", "📅 Book"],
        ["gallery", "📸 Gallery"],
        ["owner", "🔐 Owner"]
    ].forEach(([id, label]) => {

        tabsBox.appendChild(
            el(
                "button",
                {
                    class:
                        "nbl-tab" +
                        (
                            currentTab === id
                                ? " active"
                                : ""
                        ),

                    onclick: () => {

                        currentTab = id;

                        message = null;

                        render();
                    }
                },

                label
            )
        );
    });


    bodyBox.innerHTML = "";


    if (message) {

        bodyBox.appendChild(
            el(
                "div",
                {
                    class: "nbl-msg " + message.type
                },
                message.text
            )
        );
    }


    if (
        loadError &&
        (
            currentTab === "book" ||
            currentTab === "owner"
        )
    ) {

        bodyBox.appendChild(
            el(
                "div",
                { class: "nbl-msg info" },
                loadError
            )
        );
    }


    if (currentTab === "book") {

        renderBook();

    } else if (currentTab === "gallery") {

        renderGallery();

    } else {

        renderOwner();
    }


    bodyBox.scrollTop = scrollPosition;
}


/* ============================================================
   23. CUSTOMER BOOKING FORM
   ============================================================ */

function renderBook() {

    bodyBox.appendChild(
        el(
            "p",
            { class: "nbl-msg info" },
            "A R50 deposit is required to secure your slot. Strict 15-minute grace period."
        )
    );


    /* DATE */

    bodyBox.appendChild(
        el(
            "h3",
            null,
            "1. Choose a date"
        )
    );

    bodyBox.appendChild(
        el(
            "div",
            { class: "nbl-grid" },

            getOpenDays().map(day =>

                el(
                    "button",
                    {
                        type: "button",

                        class:
                            "nbl-chip" +
                            (
                                choice.date === day.iso
                                    ? " selected"
                                    : ""
                            ),

                        disabled: day.full,

                        onclick: () => {

                            choice.date = day.iso;

                            render();
                        }
                    },

                    prettyDate(day.iso),

                    el(
                        "small",
                        null,

                        day.full
                            ? "FULL"
                            : day.left + " spots left"
                    )
                )
            )
        )
    );


    /* MULTIPLE COLOURS */

    bodyBox.appendChild(
        el(
            "h3",
            null,
            "2. Choose your colours"
        )
    );

    bodyBox.appendChild(
        el(
            "p",
            null,
            "You can select more than one colour for your nail design. Select up to 10 colours."
        )
    );

    bodyBox.appendChild(
        el(
            "div",
            { class: "nbl-grid" },

            availableColours().map(colour => {

                const selected =
                    choice.colours.includes(colour.name);

                return el(
                    "button",
                    {
                        type: "button",

                        class:
                            "nbl-chip" +
                            (
                                selected
                                    ? " selected"
                                    : ""
                            ),

                        "aria-pressed": String(selected),

                        onclick: () => {

                            if (selected) {

                                choice.colours =
                                    choice.colours.filter(
                                        name =>
                                            name !== colour.name
                                    );

                            } else {

                                if (
                                    choice.colours.length >=
                                    MAX_COLOURS_PER_BOOKING
                                ) {

                                    showMsg(
                                        "err",
                                        "You can select a maximum of 10 colours."
                                    );

                                    return;
                                }

                                choice.colours.push(
                                    colour.name
                                );
                            }

                            render();
                        }
                    },

                    el("span", {
                        class: "nbl-swatch",
                        style: "background:" + colour.hex
                    }),

                    colour.name,

                    selected ? " ✓" : ""
                );
            })
        )
    );


    bodyBox.appendChild(
        el(
            "p",
            {
                class: "nbl-selected-colours"
            },

            choice.colours.length > 0

                ? "Selected colours: " +
                  choice.colours.join(", ")

                : "No colours selected yet."
        )
    );


    /* NAIL SHAPE */

    bodyBox.appendChild(
        el(
            "h3",
            null,
            "3. Choose a nail shape"
        )
    );

    bodyBox.appendChild(
        el(
            "div",
            { class: "nbl-shapes-grid" },

            NAIL_STYLES.map(style =>

                el(
                    "button",
                    {
                        type: "button",

                        class:
                            "nbl-shape-card" +
                            (
                                choice.shape === style.name
                                    ? " selected"
                                    : ""
                            ),

                        onclick: () => {

                            choice.shape = style.name;

                            render();
                        }
                    },

                    el("img", {
                        src: style.src,
                        alt: style.alt,
                        loading: "lazy",

                        onclick: event => {

                            event.stopPropagation();

                            openImagePreview(
                                style.src,
                                style.name
                            );
                        }
                    }),

                    el(
                        "span",
                        { class: "nbl-shape-name" },
                        style.name
                    )
                )
            )
        )
    );


    /* SERVICE */

    bodyBox.appendChild(
        el(
            "h3",
            null,
            "4. Choose a service"
        )
    );

    bodyBox.appendChild(
        el(
            "div",
            { class: "nbl-grid" },

            availableServices().map(service =>

                el(
                    "button",
                    {
                        type: "button",

                        class:
                            "nbl-chip" +
                            (
                                choice.style === service.name
                                    ? " selected"
                                    : ""
                            ),

                        onclick: () => {

                            choice.style = service.name;

                            render();
                        }
                    },

                    service.name
                )
            )
        )
    );


    /* CUSTOMER DETAILS */

    bodyBox.appendChild(
        el(
            "h3",
            null,
            "5. Your details"
        )
    );

    bodyBox.appendChild(
        el("input", {
            class: "nbl-input",
            placeholder: "Your name",
            value: choice.name,
            maxLength: 60,
            autocomplete: "name",

            oninput: event => {
                choice.name = event.target.value;
            }
        })
    );

    bodyBox.appendChild(
        el("input", {
            class: "nbl-input",
            placeholder: "Phone number",
            type: "tel",
            value: choice.phone,
            maxLength: 25,
            autocomplete: "tel",

            oninput: event => {
                choice.phone = event.target.value;
            }
        })
    );


    /* CUSTOMER INSPIRATION PHOTO */

    bodyBox.appendChild(
        el(
            "h3",
            null,
            "6. Upload your nail inspiration photo"
        )
    );

    bodyBox.appendChild(
        el(
            "p",
            null,
            "Upload a picture of the nail design you would like Lisa to create. This is optional."
        )
    );

    const referenceStatus = el(
        "p",
        null,

        choice.referenceFile
            ? "Selected: " + choice.referenceFile.name
            : "No inspiration photo selected."
    );

    bodyBox.appendChild(
        el("input", {
            class: "nbl-input",
            type: "file",
            accept: "image/jpeg,image/png,image/webp",

            onchange: event => {

                const file = event.target.files[0];

                if (!file) return;

                if (!file.type.startsWith("image/")) {

                    choice.referenceFile = null;

                    referenceStatus.textContent =
                        "Please select an image.";

                    showMsg(
                        "err",
                        "Please select a valid image."
                    );

                    return;
                }

                if (
                    file.size > MAX_REFERENCE_IMAGE_SIZE
                ) {

                    choice.referenceFile = null;

                    referenceStatus.textContent =
                        "Image is too large.";

                    showMsg(
                        "err",
                        "Your reference image must be 5 MB or smaller."
                    );

                    return;
                }

                choice.referenceFile = file;

                referenceStatus.textContent =
                    "Selected: " + file.name;
            }
        })
    );

    bodyBox.appendChild(referenceStatus);


    /* SUBMIT BOOKING */

    bodyBox.appendChild(
        el(
            "button",
            {
                class: "nbl-btn",
                onclick: submitBooking
            },
            "Request Appointment"
        )
    );
}


/* ============================================================
   24. SUBMIT CUSTOMER BOOKING
   ============================================================ */

async function submitBooking() {

    if (submitting) return;


    if (!db || !storage) {

        showMsg(
            "err",
            "Online booking has not been connected to Firebase yet."
        );

        return;
    }


    const name = choice.name.trim();

    const phone = choice.phone.trim();


    if (!choice.date) {

        return showMsg(
            "err",
            "Please choose a date."
        );
    }

    const validDay = getOpenDays().find(
        day => day.iso === choice.date
    );

    if (!validDay || validDay.full) {

        return showMsg(
            "err",
            "That date is no longer available. Please choose another."
        );
    }


    if (
        !Array.isArray(choice.colours) ||
        choice.colours.length === 0
    ) {

        return showMsg(
            "err",
            "Please select at least one colour."
        );
    }

    if (
        choice.colours.length >
        MAX_COLOURS_PER_BOOKING
    ) {

        return showMsg(
            "err",
            "You can select a maximum of 10 colours."
        );
    }

    const availableColourNames =
        availableColours().map(
            colour => colour.name
        );

    if (
        !choice.colours.every(colour =>
            availableColourNames.includes(colour)
        )
    ) {

        return showMsg(
            "err",
            "One or more selected colours are no longer available. Please select again."
        );
    }


    if (!choice.shape) {

        return showMsg(
            "err",
            "Please choose a nail shape."
        );
    }

    if (!NAIL_STYLES.some(
        style => style.name === choice.shape
    )) {

        return showMsg(
            "err",
            "Please choose a valid nail shape."
        );
    }


    if (!choice.style) {

        return showMsg(
            "err",
            "Please choose a service."
        );
    }

    if (!availableServices().some(
        service => service.name === choice.style
    )) {

        return showMsg(
            "err",
            "That service is no longer available."
        );
    }


    if (name.length < 2) {

        return showMsg(
            "err",
            "Please enter your name."
        );
    }


    if (phone.replace(/\D/g, "").length < 7) {

        return showMsg(
            "err",
            "Please enter a valid phone number."
        );
    }


    submitting = true;


    const bookingRef = doc(
        collection(db, "bookings")
    );

    const dayRef = doc(
        db,
        "dayCounts",
        choice.date
    );

    let referenceImagePath = null;


    try {

        /* UPLOAD CUSTOMER INSPIRATION PHOTO */

        if (choice.referenceFile) {

            const file = choice.referenceFile;

            if (
                file.size > MAX_REFERENCE_IMAGE_SIZE
            ) {
                throw new Error("IMAGE_TOO_LARGE");
            }

            const safeName = file.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );

            referenceImagePath =
                "booking-references/" +
                bookingRef.id +
                "/reference-" +
                Date.now() +
                "-" +
                safeName;

            const uploadReference = storageRef(
                storage,
                referenceImagePath
            );

            await uploadBytes(
                uploadReference,
                file,
                {
                    contentType: file.type,

                    customMetadata: {
                        bookingId: bookingRef.id
                    }
                }
            );
        }


        /* BOOKING DOCUMENT */

        const booking = {

            date: choice.date,

            name: name,

            phone: phone,

            shape: choice.shape,

            colours: [...choice.colours],

            style: choice.style,

            created: Date.now(),

            ...(referenceImagePath
                ? { referenceImagePath }
                : {})
        };


        /* SAVE BOOKING AND UPDATE DAILY COUNT */

        await runTransaction(
            db,

            async transaction => {

                const daySnap =
                    await transaction.get(dayRef);

                const current = daySnap.exists()

                    ? Number(daySnap.data().count) || 0

                    : 0;

                if (
                    current >=
                    data.settings.maxPerDay
                ) {
                    throw new Error("FULL");
                }


                transaction.set(
                    dayRef,
                    {
                        count: current + 1,
                        lastBookingId: bookingRef.id
                    }
                );


                transaction.set(
                    bookingRef,
                    booking
                );
            }
        );


        choice = {
            date: null,
            shape: null,
            colours: [],
            style: null,
            name: "",
            phone: "",
            referenceFile: null
        };


        showMsg(
            "ok",

            "Thank you " +
            name +
            "! Your appointment request has been saved. Lisa will review your selected colours, nail shape, service and inspiration photo and confirm your booking."
        );

    } catch (error) {

        console.error(
            "Booking error:",
            error
        );

        if (error.message === "FULL") {

            showMsg(
                "err",
                "Sorry, that date just became full. Please choose another."
            );

        } else if (
            error.message === "IMAGE_TOO_LARGE"
        ) {

            showMsg(
                "err",
                "Please upload an image smaller than 5 MB."
            );

        } else {

            showMsg(
                "err",
                "Could not submit your booking. Please try again."
            );
        }

    } finally {

        submitting = false;
    }
}


/* ============================================================
   25. GALLERY TAB
   ============================================================ */

function renderGallery() {

    loadGalleryOnce();

    bodyBox.appendChild(
        el(
            "h3",
            null,
            "Lisa's Gallery"
        )
    );

    bodyBox.appendChild(
        el(
            "p",
            null,
            "Browse the nail designs and sets created by Nails by Lisa. Click a photo to view it larger."
        )
    );


    bodyBox.appendChild(
        el(
            "div",
            { class: "nbl-media" },

            LOCAL_GALLERY.map(
                createLocalGalleryCard
            )
        )
    );


    bodyBox.appendChild(
        el(
            "h3",
            null,
            "Follow Nails by Lisa"
        )
    );

    bodyBox.appendChild(
        el(
            "a",
            {
                class: "nbl-instagram",
                href: INSTAGRAM_URL,
                target: "_blank",
                rel: "noopener noreferrer"
            },

            "◎ Visit @nailsbylisam_ on Instagram ↗"
        )
    );


    if (data.gallery.length > 0) {

        bodyBox.appendChild(
            el(
                "h3",
                null,
                "More Nail Designs"
            )
        );

        bodyBox.appendChild(
            el(
                "div",
                { class: "nbl-media" },

                data.gallery.map(item => {

                    const card = el(
                        "div",
                        { class: "nbl-photo" }
                    );

                    const image = el(
                        "img",
                        {
                            src: item.url,

                            alt:
                                item.name ||
                                "Nail design by Lisa",

                            loading: "lazy"
                        }
                    );

                    image.addEventListener(
                        "click",
                        () => {

                            openImagePreview(
                                image.currentSrc || image.src,
                                item.name || "Nail design by Lisa"
                            );
                        }
                    );

                    card.appendChild(image);

                    card.appendChild(
                        el(
                            "p",
                            { class: "nbl-photo-name" },

                            item.name ||
                            "Nail design by Lisa"
                        )
                    );


                    if (ownerUser) {

                        card.appendChild(
                            el(
                                "button",
                                {
                                    class: "nbl-btn red",

                                    onclick: () => {

                                        if (
                                            confirm(
                                                "Delete this gallery photo?"
                                            )
                                        ) {

                                            run(
                                                deleteDoc(
                                                    doc(
                                                        db,
                                                        "gallery",
                                                        item.id
                                                    )
                                                ),

                                                "Photo deleted."
                                            );
                                        }
                                    }
                                },

                                "Delete"
                            )
                        );
                    }

                    return card;
                })
            )
        );
    }


    if (ownerUser) {

        bodyBox.appendChild(
            el(
                "h3",
                null,
                "Owner: Upload Gallery Photos"
            )
        );

        bodyBox.appendChild(
            el("input", {
                type: "file",
                accept: "image/*",
                multiple: true,
                class: "nbl-input",
                onchange: handleUpload
            })
        );
    }
}


/* ============================================================
   26. IMAGE COMPRESSION
   ============================================================ */

function imageToDataUrl(file, maxSize, quality) {

    return new Promise((resolve, reject) => {

        const objectUrl =
            URL.createObjectURL(file);

        const image = new Image();

        image.onload = () => {

            const scale = Math.min(
                1,
                maxSize / Math.max(
                    image.width,
                    image.height
                )
            );

            const canvas =
                document.createElement("canvas");

            canvas.width =
                Math.round(image.width * scale);

            canvas.height =
                Math.round(image.height * scale);

            const context =
                canvas.getContext("2d");

            if (!context) {

                URL.revokeObjectURL(objectUrl);

                reject(
                    new Error("Could not process image.")
                );

                return;
            }

            context.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
            );

            URL.revokeObjectURL(objectUrl);

            resolve(
                canvas.toDataURL(
                    "image/jpeg",
                    quality
                )
            );
        };

        image.onerror = () => {

            URL.revokeObjectURL(objectUrl);

            reject(
                new Error("Invalid image.")
            );
        };

        image.src = objectUrl;
    });
}


/* ============================================================
   27. OWNER GALLERY UPLOAD
   ============================================================ */

async function handleUpload(event) {

    if (!ownerUser || !db) {

        showMsg(
            "err",
            "Only Lisa can upload gallery photos."
        );

        return;
    }

    const files = [
        ...event.target.files
    ];

    let added = 0;

    const skipped = [];


    for (const file of files) {

        try {

            if (!file.type.startsWith("image/")) {

                skipped.push(file.name);

                continue;
            }

            if (
                file.size > MAX_GALLERY_IMAGE_SIZE
            ) {

                skipped.push(
                    file.name + " (larger than 5 MB)"
                );

                continue;
            }


            let url = await imageToDataUrl(
                file,
                1000,
                0.75
            );


            if (url.length > 900000) {

                url = await imageToDataUrl(
                    file,
                    800,
                    0.5
                );
            }


            if (url.length > 900000) {

                skipped.push(file.name);

                continue;
            }


            await addDoc(
                collection(db, "gallery"),
                {
                    url,
                    name: file.name,
                    added: Date.now()
                }
            );

            added++;

        } catch (error) {

            console.error(
                "Gallery upload failed:",
                error
            );

            skipped.push(file.name);
        }
    }


    let resultText =
        added + " photo(s) added.";

    if (skipped.length > 0) {

        resultText +=
            " Skipped: " + skipped.join(", ");
    }


    showMsg(
        skipped.length === 0
            ? "ok"
            : added > 0
                ? "info"
                : "err",

        resultText
    );

    event.target.value = "";
}


/* ============================================================
   28. CUSTOMER INSPIRATION PHOTO FOR OWNER
   ============================================================ */

async function appendCustomerReference(card, booking) {

    if (
        !booking.referenceImagePath ||
        !storage
    ) {
        return;
    }

    const status = el(
        "p",
        null,
        "Loading customer's inspiration photo..."
    );

    card.appendChild(status);

    try {

        const imageRef = storageRef(
            storage,
            booking.referenceImagePath
        );

        const imageURL =
            await getDownloadURL(imageRef);

        const image = el(
            "img",
            {
                class: "nbl-reference-preview",
                src: imageURL,

                alt:
                    "Customer's nail inspiration photo",

                loading: "lazy"
            }
        );

        image.addEventListener(
            "click",
            () => {

                openImagePreview(
                    imageURL,
                    "Customer's nail inspiration"
                );
            }
        );

        status.remove();

        card.appendChild(
            el(
                "p",
                null,
                "Customer's inspiration photo:"
            )
        );

        card.appendChild(image);

    } catch (error) {

        console.error(
            "Reference image could not be loaded:",
            error
        );

        status.textContent =
            "Customer uploaded a reference photo, but it could not be displayed. Check Firebase Storage permissions.";
    }
}


/* ============================================================
   29. OWNER DASHBOARD SUMMARY
   ============================================================ */

function countBy(items, property) {

    const counts = new Map();

    items.forEach(item => {

        let values = item[property];

        if (
            property === "colours" &&
            !Array.isArray(values)
        ) {

            values = item.colour
                ? [item.colour]
                : [];
        }


        if (!Array.isArray(values)) {

            values = [
                values || "Not recorded"
            ];
        }


        if (values.length === 0) {

            values = ["Not recorded"];
        }


        values.forEach(value => {

            counts.set(
                value,
                (counts.get(value) || 0) + 1
            );
        });
    });


    return [...counts.entries()].sort(
        (a, b) => b[1] - a[1]
    );
}


function getBookingColours(booking) {

    if (
        Array.isArray(booking.colours)
    ) {
        return booking.colours;
    }

    if (booking.colour) {
        return [booking.colour];
    }

    return [];
}


function appendSummaryList(title, counts) {

    bodyBox.appendChild(
        el("h3", null, title)
    );

    if (counts.length === 0) {

        bodyBox.appendChild(
            el("p", null, "No bookings yet.")
        );

        return;
    }


    bodyBox.appendChild(
        el(
            "div",
            { class: "nbl-summary-list" },

            counts.map(([name, count]) =>

                el(
                    "span",
                    { class: "nbl-summary-item" },

                    name + " · " + count
                )
            )
        )
    );
}


function renderOwnerDashboardSummary() {

    const bookings = data.bookings;

    bodyBox.appendChild(
        el(
            "h3",
            null,
            "Booking Overview"
        )
    );


    bodyBox.appendChild(
        el(
            "div",
            { class: "nbl-stats-grid" },

            el(
                "div",
                { class: "nbl-stat" },

                el(
                    "strong",
                    null,
                    String(bookings.length)
                ),

                el(
                    "span",
                    null,
                    "Total bookings"
                )
            ),


            el(
                "div",
                { class: "nbl-stat" },

                el(
                    "strong",
                    null,

                    String(
                        new Set(
                            bookings
                                .map(b => b.date)
                                .filter(Boolean)
                        ).size
                    )
                ),

                el(
                    "span",
                    null,
                    "Different booking dates"
                )
            ),


            el(
                "div",
                { class: "nbl-stat" },

                el(
                    "strong",
                    null,

                    String(
                        bookings.filter(
                            b => b.referenceImagePath
                        ).length
                    )
                ),

                el(
                    "span",
                    null,
                    "Customer reference photos"
                )
            )
        )
    );


    appendSummaryList(
        "Nail shapes selected",
        countBy(bookings, "shape")
    );


    appendSummaryList(
        "Colours selected",
        countBy(bookings, "colours")
    );


    appendSummaryList(
        "Services selected",
        countBy(bookings, "style")
    );
}


/* ============================================================
   30. OWNER COLOUR MANAGEMENT
   ============================================================ */

async function setColourAvailability(
    colour,
    available
) {

    if (!ownerUser || !db) {

        showMsg(
            "err",
            "Only Lisa can manage colours."
        );

        return;
    }

    try {

        const existing = data.colours.find(
            item =>
                item.name.toLowerCase() ===
                colour.name.toLowerCase()
        );


        if (existing) {

            await updateDoc(
                doc(
                    db,
                    "colours",
                    existing.id
                ),

                {
                    available
                }
            );

        } else {

            await addDoc(
                collection(db, "colours"),

                {
                    name: colour.name,
                    hex: colour.hex,
                    available
                }
            );
        }


        showMsg(
            "ok",

            colour.name +
            (
                available
                    ? " is available to customers."
                    : " has been hidden from customers."
            )
        );

    } catch (error) {

        console.error(
            "Colour update failed:",
            error
        );

        showMsg(
            "err",
            "Could not update colour availability. Check Firestore rules."
        );
    }
}


/* ============================================================
   31. OWNER DASHBOARD
   ============================================================ */

function renderOwner() {

    if (!ownerUser) {

        bodyBox.appendChild(
            el(
                "h3",
                null,
                "Lisa's Owner Dashboard"
            )
        );

        bodyBox.appendChild(
            el(
                "p",
                null,
                "Sign in with Lisa's authorised Google account to manage bookings, customer details, gallery photos and nail colours."
            )
        );

        const ownerEmailInput = el(
            "input",
            {
                class: "nbl-input",
                type: "email",
                placeholder: "Enter Lisa's Google email address",
                autocomplete: "username",
                inputMode: "email",
                maxLength: 254,
                required: true
            }
        );

        bodyBox.appendChild(ownerEmailInput);

        const googleLoginButton = el(
            "button",
            {
                class: "nbl-btn",
                type: "button",
                onclick: () => {
                    ownerLogin(ownerEmailInput.value);
                }
            },
            "Continue with Google"
        );

        bodyBox.appendChild(googleLoginButton);

        bodyBox.appendChild(
            el(
                "p",
                null,
                "Only Lisa's authorised Google account can access owner information. Google sign-in is required; entering an email address alone will not unlock the dashboard."
            )
        );

        return;
    }


    bodyBox.appendChild(
        el(
            "p",
            { class: "nbl-msg ok" },
            "Welcome, Lisa. You are signed in."
        )
    );


    bodyBox.appendChild(
        el(
            "button",
            {
                class: "nbl-btn grey",

                onclick: () => {
                    signOut(auth);
                }
            },

            "Log out"
        )
    );


    renderOwnerDashboardSummary();


    bodyBox.appendChild(
        el(
            "h3",
            null,
            "Manage Available Colours"
        )
    );

    bodyBox.appendChild(
        el(
            "p",
            null,

            "Untick a colour to hide it from customers when you no longer have that polish. Tick it again when it is available."
        )
    );


    allColoursForOwner().forEach(colour => {

        const checkbox = el(
            "input",
            {
                type: "checkbox",

                checked:
                    colour.available !== false,

                onchange: event => {

                    setColourAvailability(
                        colour,
                        event.target.checked
                    );
                }
            }
        );


        bodyBox.appendChild(
            el(
                "div",
                { class: "nbl-colour-admin" },

                el(
                    "label",
                    null,

                    checkbox,

                    el("span", {
                        class: "nbl-swatch",
                        style: "background:" + colour.hex
                    }),

                    colour.name
                ),

                el(
                    "span",
                    null,

                    colour.available !== false
                        ? "Available"
                        : "Hidden"
                )
            )
        );
    });


    bodyBox.appendChild(
        el(
            "h3",
            null,
            "Add a New Colour"
        )
    );


    const newColourName = el(
        "input",
        {
            class: "nbl-input",
            placeholder: "Colour name",
            maxLength: 40
        }
    );


    const newColourHex = el(
        "input",
        {
            class: "nbl-input",
            type: "color",
            value: "#e91e8c"
        }
    );


    bodyBox.appendChild(
        el(
            "div",
            null,

            newColourName,

            newColourHex,

            el(
                "button",
                {
                    class: "nbl-btn",

                    onclick: () => {

                        const name =
                            newColourName.value.trim();


                        if (!name) {

                            return showMsg(
                                "err",
                                "Enter a colour name."
                            );
                        }


                        const exists =
                            allColoursForOwner().some(
                                colour =>
                                    colour.name.toLowerCase() ===
                                    name.toLowerCase()
                            );


                        if (exists) {

                            return showMsg(
                                "err",
                                "That colour already exists."
                            );
                        }


                        run(
                            addDoc(
                                collection(db, "colours"),

                                {
                                    name,
                                    hex: newColourHex.value,
                                    available: true
                                }
                            ),

                            "New colour added."
                        );
                    }
                },

                "Add Colour"
            )
        )
    );


    bodyBox.appendChild(
        el(
            "h3",
            null,
            "Services"
        )
    );


    data.styles.forEach(service => {

        bodyBox.appendChild(
            el(
                "div",
                { class: "nbl-colour-admin" },

                service.name,

                el(
                    "button",
                    {
                        class: "nbl-btn red",

                        onclick: () => {

                            if (
                                confirm(
                                    "Remove " + service.name + "?"
                                )
                            ) {

                                run(
                                    deleteDoc(
                                        doc(
                                            db,
                                            "styles",
                                            service.id
                                        )
                                    ),

                                    "Service removed."
                                );
                            }
                        }
                    },

                    "Remove"
                )
            )
        );
    });


    const newServiceName = el(
        "input",
        {
            class: "nbl-input",
            placeholder: "New service name",
            maxLength: 60
        }
    );


    bodyBox.appendChild(
        el(
            "div",
            null,

            newServiceName,

            el(
                "button",
                {
                    class: "nbl-btn",

                    onclick: () => {

                        const name =
                            newServiceName.value.trim();


                        if (!name) {

                            return showMsg(
                                "err",
                                "Enter a service name."
                            );
                        }


                        const exists = data.styles.some(
                            service =>
                                service.name.toLowerCase() ===
                                name.toLowerCase()
                        );

                        if (exists) {
                            return showMsg(
                                "err",
                                "That service already exists."
                            );
                        }


                        run(
                            addDoc(
                                collection(db, "styles"),

                                {
                                    name,
                                    available: true
                                }
                            ),

                            "Service added."
                        );
                    }
                },

                "Add Service"
            )
        )
    );


    bodyBox.appendChild(
        el(
            "h3",
            null,

            "Customer Appointments (" +
            data.bookings.length +
            ")"
        )
    );


    if (data.bookings.length === 0) {

        bodyBox.appendChild(
            el(
                "p",
                null,
                "No appointments yet."
            )
        );
    }


    [...data.bookings]

        .sort((a, b) =>
            (a.date || "").localeCompare(b.date || "") ||
            (a.created || 0) - (b.created || 0)
        )

        .forEach(booking => {

            const bookingColours =
                getBookingColours(booking);


            const card = el(
                "div",
                { class: "nbl-booking-card" },


                el(
                    "p",
                    null,

                    el(
                        "strong",
                        null,
                        "Date: "
                    ),

                    booking.date
                        ? prettyDate(booking.date)
                        : "Not recorded"
                ),


                el(
                    "p",
                    null,

                    el(
                        "strong",
                        null,
                        "Customer: "
                    ),

                    booking.name || "Not recorded"
                ),


                el(
                    "p",
                    null,

                    el(
                        "strong",
                        null,
                        "Phone: "
                    ),

                    booking.phone || "Not recorded"
                ),


                el(
                    "p",
                    null,

                    el(
                        "strong",
                        null,
                        "Nail shape: "
                    ),

                    booking.shape || "Not recorded"
                ),


                el(
                    "p",
                    null,

                    el(
                        "strong",
                        null,
                        "Colours: "
                    ),

                    bookingColours.length > 0
                        ? bookingColours.join(", ")
                        : "Not recorded"
                ),


                el(
                    "p",
                    null,

                    el(
                        "strong",
                        null,
                        "Service: "
                    ),

                    booking.style || "Not recorded"
                )
            );


            bodyBox.appendChild(card);


            appendCustomerReference(
                card,
                booking
            );


            card.appendChild(
                el(
                    "button",
                    {
                        class: "nbl-btn red",

                        onclick: () => {
                            cancelBooking(booking);
                        }
                    },

                    "Cancel Appointment"
                )
            );
        });


    const missingColours =
        STARTER_COLOURS.some(
            ([name]) =>

                !data.colours.some(
                    colour =>
                        colour.name.toLowerCase() ===
                        name.toLowerCase()
                )
        );


    const missingStyles =
        STARTER_STYLES.some(
            name =>

                !data.styles.some(
                    style =>
                        style.name.toLowerCase() ===
                        name.toLowerCase()
                )
        );


    if (
        missingColours ||
        missingStyles
    ) {

        bodyBox.appendChild(
            el(
                "button",
                {
                    class: "nbl-btn",
                    onclick: seedStarterData
                },

                "Add Missing Starter Colours and Services"
            )
        );
    }
}


/* ============================================================
   32. CANCEL APPOINTMENT
   ============================================================ */

async function cancelBooking(booking) {

    if (!confirm("Cancel this appointment?")) {
        return;
    }

    try {

        await runTransaction(
            db,

            async transaction => {

                const bookingRef = doc(
                    db,
                    "bookings",
                    booking.id
                );

                const dayRef = doc(
                    db,
                    "dayCounts",
                    booking.date
                );


                const bookingSnap =
                    await transaction.get(bookingRef);

                const daySnap =
                    await transaction.get(dayRef);


                if (!bookingSnap.exists()) {

                    throw new Error(
                        "Booking already cancelled."
                    );
                }


                const currentCount =
                    daySnap.exists()

                        ? Math.max(
                            0,
                            Number(daySnap.data().count) || 0
                        )

                        : 0;


                transaction.delete(bookingRef);


                transaction.set(
                    dayRef,

                    {
                        count: Math.max(
                            0,
                            currentCount - 1
                        )
                    },

                    {
                        merge: true
                    }
                );
            }
        );


        showMsg(
            "ok",
            "Appointment cancelled."
        );

    } catch (error) {

        console.error(
            "Cancellation failed:",
            error
        );

        showMsg(
            "err",
            "Could not cancel this appointment. Check your Firestore rules."
        );
    }
}


/* ============================================================
   33. ADD MISSING STARTER COLOURS AND SERVICES
   ============================================================ */

function seedStarterData() {

    if (!ownerUser) {

        return showMsg(
            "err",
            "Owner access required."
        );
    }


    const batch = writeBatch(db);


    const savedColourNames = new Set(
        data.colours.map(
            colour => colour.name.toLowerCase()
        )
    );


    const savedStyleNames = new Set(
        data.styles.map(
            style => style.name.toLowerCase()
        )
    );


    STARTER_COLOURS.forEach(([name, hex]) => {

        if (
            !savedColourNames.has(
                name.toLowerCase()
            )
        ) {

            batch.set(
                doc(collection(db, "colours")),

                {
                    name,
                    hex,
                    available: true
                }
            );
        }
    });


    STARTER_STYLES.forEach(name => {

        if (
            !savedStyleNames.has(
                name.toLowerCase()
            )
        ) {

            batch.set(
                doc(collection(db, "styles")),

                {
                    name,
                    available: true
                }
            );
        }
    });


    batch.set(
        doc(db, "settings", "main"),

        DEFAULT_SETTINGS,

        {
            merge: true
        }
    );


    run(
        batch.commit(),
        "Missing starter data added."
    );
}


/* ============================================================
   34. WEBSITE NAVIGATION AND STARTUP
   ============================================================ */

function start() {

    console.info(
        "Nails by Lisa JavaScript is running."
    );


    injectStyles();


    buildPopup();


    const navTarget =
        document.querySelector("nav .nav-links") ||
        document.querySelector("nav");


    if (navTarget) {

        [
            ["BOOK", "book"],
            ["GALLERY", "gallery"]
        ].forEach(([label, tab]) => {

            const exists = [
                ...navTarget.querySelectorAll("a")
            ].some(link =>

                link.textContent
                    .trim()
                    .toUpperCase() === label
            );


            if (exists) return;


            const link = el(
                "a",
                {
                    href: "#",

                    onclick: event => {

                        event.preventDefault();

                        openPopup(tab);
                    }
                },

                label
            );


            if (
                navTarget.tagName.toUpperCase() === "UL"
            ) {

                navTarget.appendChild(
                    el("li", null, link)
                );

            } else {

                navTarget.appendChild(link);
            }
        });
    }


    document
        .querySelectorAll('a.btn[href*="contact"]')

        .forEach(link => {

            link.addEventListener(
                "click",

                event => {

                    event.preventDefault();

                    openPopup("book");
                }
            );
        });


    document.body.appendChild(
        el(
            "button",
            {
                class: "nbl-floating",

                onclick: () => {
                    openPopup("book");
                }
            },

            "💅 Menu / Book"
        )
    );


    startFirebase();
}


/* ============================================================
   35. INITIALISE WEBSITE
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        start
    );

} else {

    start();
}