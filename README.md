# ভ্রাম্যমাণ চা ওয়ালা — Vrammoman Cha Wala
### Interactive Mobile Web Prototype

A complete, high-fidelity interactive prototype of the **Vrammoman Cha Wala** (Roving Tea Vendor) mobile app — built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step. Just open and run.

---

## 🚀 Quick Start

```bash
# Any local server works:
python3 -m http.server 8000
# Then open: http://localhost:8000
```

Or open `index.html` directly in a browser.

---

## ✨ Features

### 8 Fully Interactive Screens
1. **Splash** — Animated logo, looping CSS loader, auto-transitions to login after exactly **2.5 s**
2. **Login / Sign-Up** — Tabbed form, animated focus states, social buttons
3. **Home** — Location selector, search, scrollable Bangla categories, promo banner, product grid with quick-add
4. **Product Details** — Bangla customization checkboxes, qty selector, live total math
5. **Cart & Checkout** — Live cart, subtotal/delivery/service math, address input with chips
6. **Payment** — bKash / Nagad / Rocket / COD selector with spinning lock loader
7. **Live Tracking** — Animated moving rider 🛵 on map, ticking ETA, distance in Bangla, progress timeline
8. **Success** — Drawn-in CSS checkmark, confetti, receipt breakdown, 5-star rating

### Smooth Transitions & Micro-interactions
- Spring-easing screen transitions (`cubic-bezier(.34,1.56,.64,1)`)
- Ripple effects on primary buttons
- Cart badge pop animation when adding items
- Pulsing destination pin on map
- Bouncing rider emoji
- Confetti + drawn-circle checkmark on success
- Bangla & English typography (Hind Siliguri + Poppins)

### Real Logic, No Fakes
- Cart math computes correctly (base + addons × qty + delivery + service)
- Live tracking moves rider through 6 waypoints, decrementing distance from **450 m → 0 m** and ETA from **5 → 0 mins**
- Payment loader cycles through *Verifying → Encrypting → Confirming* steps
- Order ID generated randomly per checkout
- "Order More" fully resets app state

---

## 🎨 Design System

| Token | Value |
|---|---|
| Brand Red | `#D6292D` |
| Red Dark | `#B61E22` |
| Red Soft | `#FBE7E8` |
| Background | `#F7F8F8` |
| Bangla Font | `Hind Siliguri` |
| English Font | `Poppins` |
| Radius | 10 / 14 / 20 / 28 / pill |

---

## 📂 File Structure

```
vrammoman_app/
├── index.html        # All 8 screens (single page)
├── styles.css        # Design system + animations
├── app.js            # State, navigation, cart logic, tracking
└── images/
    ├── image1.png   ← Logo (kettle + jar)
    ├── image2.png   ← রং চা (Raw Tea)
    ├── image3.png   ← দুধ চা (Milk Tea)
    ├── image4.png   ← মসলা চা (Masala Tea)
    ├── image5.png   ← কফি (Coffee)
    ├── image6.png   ← Delivery boy avatar (rider profile)
    ├── image7.png   ← Map (live tracking background)
    ├── image8.png   ← সিঙ্গারা (Singara)
    ├── image9.png   ← সমুচা (Samucha)
    ├── image10.png  ← বিস্কুট (Biscuit)
    └── image11.png  ← রসগোল্লা (Rosogolla)
```

---

## 🔁 User Journey Demo

```
Splash (2.5s auto) → Login (click button) → Home
   → Tap product card → Product Details (select addons, qty)
   → "Add to Cart" → toast → Home → Cart icon
→ Cart (review items) → "Proceed to Payment"
→ Payment (pick gateway) → "Confirm Payment" (lock spinner ~2.4s)
→ Live Tracking (rider moves over ~9s)
→ Success (checkmark animation + receipt) → "Order More" → resets to Home
```

---

## ⚙ Technical Notes

- **No build tools.** Plain HTML/CSS/JS — works in any modern browser.
- **No external dependencies** other than Google Fonts (Hind Siliguri + Poppins).
- **All images local** at `images/imageN.png`.
- **Responsive** — full-bleed on mobile (`≤480px`), centered phone frame on desktop.
- **Accessible focus states**, semantic HTML, keyboard navigation works.
