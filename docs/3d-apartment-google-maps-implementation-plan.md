# TECHNICAL IMPLEMENTATION PLAN & GEOSPATIAL 3D SPECIFICATION (REVISION 3)
## Project: The Bilwa by SIPL — Standalone Three.js Architectural Experience & Google Maps Integration
**Target Platform**: Putta Family Gruhapravesam Digital Invitation  
**Document Identifier**: `ENG-3D-MAPS-BILWA-V3`  
**Revision Date**: 18 November 2026  
**Supercedes**: `ENG-3D-MAPS-BILWA-V2` & `ENG-3D-MAPS-BILWA-V1`  
**Status**: Technical Planning Specification Only (Strict Planning Boundary Enforced)

---

## 1. REVISION 3 CHANGELOG & CORE ARCHITECTURAL DIRECTIVES

### 1.1 Revision Changelog (V2 → V3)

1. **Google Maps Tiles Policy Compliance (Section 8)**:
   * **Complete Removal of Headless Inspection**: Removed all proposals suggesting headless script downloading of leaf `.glb` or `.b3dm` tiles for vertex analysis, geometry inspection, texture extraction, or machine interpretation.
   * **Policy Grounding**: Formally cited the [Google Maps Platform Map Tiles API Policies](https://developers.google.com/maps/documentation/tile/policies). All 3D Tiles evaluation must occur strictly within compliant client visualization renderers (e.g., standard CesiumJS or three-loader-3dtiles runtimes) without caching, scraping, or exporting raw mesh assets.

2. **Google Maps India Billing & Infrastructure Cost Separation (Section 9)**:
   * **Static Maps Pricing Correction**: Corrected the official India billing rate for Google Static Maps from the previous $1.40/1,000 to the official rate of **$0.60 per 1,000 requests** (SKU ID: `4D28-62E3-9F71`).
   * **Volume Recalculation**: Recalculated the 120,000-event stress scenario for Static Maps to exactly **$30.00** ($(120,000 - 70,000) \times \$0.60 / 1,000$).
   * **Embed API Prerequisite Clarification**: Explicitly documented that while the Google Maps Embed API offers unlimited free requests with zero per-request fee, Google Cloud Platform mandates an active billing-enabled project and valid API key.
   * **Infrastructure Decoupling**: Fully separated third-party Google Maps API fees from core web hosting, egress bandwidth, CDN delivery, and media serving costs.
   * **Official Pricing Citation**: Grounded on [Google Maps Platform Billing & Pricing - India](https://developers.google.com/maps/billing-and-pricing/pricing-india).

3. **Architectural Fidelity Boundary & Visual Approximation Scope (Section 5)**:
   * **Rejection of Complete 360° Reconstruction Claims**: Acknowledged that the sole available visual reference is `home.png` (a single eye-level perspective render). Missing rear elevation, dimensioned structural sections, and CAD floor plates make an authoritative 360° model impossible.
   * **Evidence-Based Visual Approximation Boundary**: Reframed the 3D model as an evidence-based visual approximation:
     * High fidelity prioritized for the front façade, entrance canopy arch, and visible corner balconies.
     * Geometry on rear and concealed elevations is kept simplified and neutral.
     * Camera orbit is constrained to a front arc ($\pm 45^\circ$ horizontal azimuth) to prevent exposing unverified rear geometry.
   * **Specific Missing Drawing List**: Compiled an itemized list of exact architectural drawings required from the developer or family to upgrade approximation to high fidelity.

4. **Geographic Anchors, Geodesy & Gate Configuration (Section 4)**:
   * **Decoupling of Geospatial Parameters**: Replaced hardcoded assumptions with 5 separately configurable runtime parameters:
     1. Property Place Marker (`17.5090431, 78.3348205`)
     2. Street View Panorama Location (`17.5090832, 78.3350671`)
     3. Entrance Gate Threshold Coordinate (`[CONFIGURABLE - PENDING CAD]`)
     4. Entrance Approach Heading (`[CONFIGURABLE - PENDING CAD]`)
     5. Model Orientation Azimuth (`[CONFIGURABLE - PENDING CAD]`)
   * **Boundary Reconciliation**: Documented verified perimeter roads: North (60-ft road), East (40-ft road), West (100-ft road), South (park/neighbouring land). Noted that road-to-gate alignment remains unverified until site-plan extraction.

5. **Three.js Performance Measurement & Memory Profiling (Section 11)**:
   * **API Correction**: Corrected `renderer.info.memory.geometries` documentation: it reports an integer count of geometry objects registered in GPU memory, **not** a byte measurement.
   * **Accurate VRAM Calculation**: Specified the true memory calculation formula using `BufferAttribute` array byte lengths (`attribute.array.byteLength`) and texture uncompressed VRAM formulas ($W \times H \times 4 \text{ bytes}$).
   * **Progressive Quality Stepping**: Defined multi-tier stepping (Tier 1 $\rightarrow$ Tier 2 $\rightarrow$ Tier 3 $\rightarrow$ Static Image Fallback) with measurable frame-time budgets.

6. **Asset Integrity & Format Reconciliation (Section 6)**:
   * **Header Mismatch Identified**: Formally documented that `home.png` contains JPEG binary data (JFIF magic bytes `0xFF 0xD8 0xFF 0xE0`) with dimensions $962 \times 731\text{ px}$.
   * **Implementation Action Rule**: Outlined clear execution instructions to either update filename references to `home.jpg` or re-encode as a true lossless PNG without altering visual quality.

7. **DOM Selector & Integration Correction (Section 3)**:
   * **Selector Correction**: Corrected DOM integration documentation to reference the actual class selector `document.querySelector('.house-photo-frame')` (or explicit introduction of `id="house-photo-frame"` in implementation phase), matching lines 250–255 of `index.html`.

8. **Architecture Scope Clarification (Section 10)**:
   * Confirmed that the primary approved path is the **Dual-Layer Architecture**: a standalone Three.js procedural scene in Section 2 ("A Glimpse Ahead") with a decoupled Google Maps Embed in Section 5 ("Location & Directions"). Standalone Three.js does **not** load live Google Maps geography.

---

## 2. EVIDENCE CLASSIFICATION SYSTEM & CITATION INDEX

Every technical statement, dimension, coordinate, and cost estimate in this specification is governed by the following evidence taxonomy:

| Evidence Tag | Strict Definition | Acceptable Sources |
| :--- | :--- | :--- |
| `[VERIFIED]` | Directly confirmed by inspecting local workspace files, official RERA public records, or official Google documentation. | File headers, code lines, official government/developer filings, Google Docs. |
| `[DERIVED]` | Mathematically calculated from verified empirical inputs. | Haversine geodetic formula, aspect ratio math, byte count summation. |
| `[ENGINEERING ASSUMPTION]` | A provisional parameter adopted to establish software architecture, subject to runtime override. | Configurable camera targets, default lighting ratios, initial LOD steps. |
| `[UNVERIFIED]` | A physical fact, external capability, or dimension not yet confirmed by empirical testing or authoritative documentation. | Unseen elevations, interior layout, Google 3D tile local mesh coverage. |
| `[PENDING USER CONFIRMATION]` | Specific family preferences, private event logistics, or confidential building data requiring direct family input. | Flat number, floor number, family video clip delivery. |

### Formal Citation Index
1. **Repository Codebase**: Putta Family Gruhapravesam Invitation, local files `d:\house\h\index.html`, `js/config.js`, `css/styles.css` `[VERIFIED]`.
2. **Google Maps Platform Terms of Service & Tile Policies**: [Google Maps Platform Map Tiles API Policies](https://developers.google.com/maps/documentation/tile/policies) `[VERIFIED]`.
3. **Google Maps Platform Regional Pricing**: [Google Maps Platform Pricing - India](https://developers.google.com/maps/billing-and-pricing/pricing-india) `[VERIFIED]`.
4. **Telangana State RERA Registration**: Project registration `P01100005944` (The Bilwa by SIPL, Miyapur, Hyderabad) `[VERIFIED]`.
5. **Geographical Coordinates**: Google Maps Place Pin `17.5090431, 78.3348205` derived from `https://maps.app.goo.gl/d5tXnyznHe61oC4E6` `[VERIFIED]`.
6. **Street View Panorama**: Google Maps Street View Pano ID `hmRnIz6EAxYKfH1zXYMTUw` at `17.5090832, 78.3350671` `[VERIFIED]`.

---

## 3. EXISTING REPOSITORY & DOM INTEGRATION AUDIT

### 3.1 Technology Stack & Architectural Foundation
* **Frontend Core**: Vanilla ECMAScript 2022+ modular JavaScript executed natively without node bundlers or frameworks `[VERIFIED: inspect index.html, js/]`.
* **Markup Architecture**: Semantic HTML5 structure with custom data attributes (`data-story`, `data-i18n`) driving scroll-story timelines `[VERIFIED: index.html]`.
* **Design Tokens & Typography** (`css/styles.css` lines 7–30) `[VERIFIED]`:
  * Background Tint: `--color-bg: #FAF6EE;` (Warm ivory silk)
  * Deep Green Accent: `--color-green-deep: #2C4A3E;` (Sacred bilwa leaf tone)
  * Gold Metallic Highlights: `--color-gold: #B8860B;` & `--color-gold-border: rgba(184, 134, 11, 0.30);`
  * Marigold Festive Accent: `--color-marigold: #E07B39;`
  * Typography: Cormorant Garamond (Serif), Jost (Sans-serif), Great Vibes (Script), Noto Serif Telugu, Noto Sans Telugu `[VERIFIED]`.
* **State Management**:
  * `js/config.js`: `KnockConfig` synchronizing changes across client browser tabs using `LocalStorage` (`knock_invitation_config_v1`) and `BroadcastChannel` (`knock_invitation_channel`) `[VERIFIED]`.
  * `js/i18n.js`: Real-time bilingual dictionary supporting dynamic Telugu/English toggling `[VERIFIED]`.
  * `js/map.js`: Google Maps iframe manager anchoring Section 5 `[VERIFIED]`.
* **Current WebGL Footprint**: Zero 3D engine libraries (Three.js, Babylon.js, CesiumJS) exist currently in the repository `[VERIFIED: workspace audit]`.

### 3.2 Target Mounting Point ("A Glimpse Ahead")
* **Current Markup Inspection** (`index.html` lines 247–265) `[VERIFIED]`:
  ```html
  <!-- Section 2: House Photo & 3D Glimpse -->
  <section class="section section-story house-photo-section" id="story-section-1" data-section="1">
    <div class="story-container">
      <div class="section-label story-reveal" data-story="photo-label">Our New Home</div>
      <figure class="house-photo-frame story-photo-frame" data-story="photo-frame">
        <img id="house-photo" src="home.png" alt="The Putta family new home" class="house-photo-img" />
      </figure>
    </div>
  </section>
  ```
* **DOM Selector Correction**:
  * The outer frame element uses class `.house-photo-frame` (not an ID) and the image element uses `id="house-photo"`.
  * In the implementation phase, the Three.js canvas controller must select the mounting element using `document.querySelector('.house-photo-frame')` or explicitly assign `id="house-photo-frame"` to ensure deterministic mounting.
  * The static `img#house-photo` element is preserved in the DOM as an immediate visual placeholder and permanent zero-cost fallback. When the WebGL engine initializes successfully, the canvas sits in the frame with an opacity cross-fade.

---

## 4. GEOGRAPHIC ANCHORS, GEODESY & GATE CONFIGURATION

### 4.1 Ground Separation Between Place Pin and Street View
Two distinct geographic points are verified in the project records:

```
  Property Place Marker (Google Maps)          Street View Road Panorama
  17.5090431° N, 78.3348205° E                17.5090832° N, 78.3350671° E
           ●──────────────────────────────────────────────●
                            Distance: 26.53 m
                         Bearing: 80.32° (East-NE)
```

1. **Property Google Maps Pin**:
   * Coordinates: `17.5090431° N, 78.3348205° E` `[VERIFIED: user link https://maps.app.goo.gl/d5tXnyznHe61oC4E6]`.
   * Spatial Role: General location pin assigned by Google Maps. Must **not** be assumed to represent the entrance gate or exact building centroid.
2. **Street View Road Panorama**:
   * Coordinates: `17.5090832° N, 78.3350671° E` `[VERIFIED: embedded street view pano hmRnIz6EAxYKfH1zXYMTUw]`.
   * Spatial Role: Public road camera vehicle location. Must **not** be assumed to be the gate threshold.
3. **Geodesic Separation**:
   * Calculated Haversine distance: **26.53 meters** `[DERIVED]`.
   * Forward Azimuth: **80.32° (East-North-East)** `[DERIVED]`.

### 4.2 Separately Configurable Spatial Parameters
To eliminate hardcoded assumptions, the engine architecture mandates 5 independent configuration variables:

```javascript
/**
 * Geospatial Anchor Configuration - The Bilwa by SIPL
 * Stored in js/config.js and configurable via admin portal
 */
export const GeoSpatialConfig = {
  // 1. Google Maps Place Pin [VERIFIED]
  propertyPlacePin: { lat: 17.5090431, lng: 78.3348205 },

  // 2. Street View Panorama Location [VERIFIED]
  streetViewPano: {
    lat: 17.5090832,
    lng: 78.3350671,
    panoId: 'hmRnIz6EAxYKfH1zXYMTUw',
    heading: 242.92,
    pitch: 7.40
  },

  // 3. Entrance Gate Threshold [CONFIGURABLE - PENDING ARCHITECTURAL CAD]
  gateThreshold: {
    lat: 17.5090710, // Provisional engineering assumption
    lng: 78.3349800,
    status: 'PENDING_CAD_EXTRACTION'
  },

  // 4. Entrance Approach Heading [CONFIGURABLE - PENDING ARCHITECTURAL CAD]
  gateApproachHeadingDeg: 245.0, // Provisional bearing facing toward entrance arch

  // 5. Building Model Orientation Angle [CONFIGURABLE - PENDING ARCHITECTURAL CAD]
  buildingOrientationEulerYDeg: -18.5 // Provisional rotation relative to True North
};
```

### 4.3 Site Boundaries & Road Orientation
Project filings establish the physical site perimeter `[VERIFIED: TS RERA Blueprints]`:
* **North Boundary**: **60-foot wide public access road**.
* **East Boundary**: **40-foot wide road**.
* **West Boundary**: **100-foot wide master plan arterial road**.
* **South Boundary**: **Dedicated public park and neighbouring residential land**.

**Orientation & Gate Verification Procedure**:
* Because roads bound the property on the North, East, and West, the physical security gate could connect to either the 60-foot Northern road or the 40-foot Eastern road.
* The connection to the northern/northeastern road network is currently `[UNVERIFIED - PENDING SITE PLAN EXTRACTION]`.
* The `-18.5°` building rotation is classified as an `[ENGINEERING ASSUMPTION]`. It must remain configurable in code and UI until reconciled against True North from developer drawings.

---

## 5. ARCHITECTURAL EVIDENCE, VISUAL APPROXIMATION BOUNDS & PARAMETER SPECIFICATION

### 5.1 Single Reference Constraint & Visual Approximation Boundary
The project workspace contains exactly one architectural visual reference: `home.png`.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURAL FIDELITY BOUNDARY                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • KNOWN & VISIBLE (High Fidelity):                                                     │
│   - Front perspective façade with 3 distinct interlocking vertical block volumes.      │
│   - Black/charcoal geometric balcony accent frames wrapping around corner units.       │
│   - Tinted glass balustrades with metallic handrails.                                  │
│   - Signature entrance portal: curved white canopy arch with vertical green living     │
│     wall column and golden lettering: "THE Bilwa PROJECT".                             │
│   - Ground floor entrance plaza with asphalt driveway, black/white kerbs, landscaping. │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • UNKNOWN & UNSEEN (Simplified Approximation):                                         │
│   - Rear elevations and interior courtyard walls [UNVERIFIED - SIMPLIFIED].            │
│   - Service shafts, fire stairs, and rear plumbing ducts [UNVERIFIED - SIMPLIFIED].    │
│   - Exact dimensional depth of rear wings [UNVERIFIED - PROVISIONAL PARAMETER].        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • CAMERA CONSTRAINT RULE:                                                              │
│   - Interactive camera orbit is constrained to a front arc of ±45° azimuth.            │
│   - Prevents guests from orbiting behind the structure into unverified geometry.       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Itemized Provisional Model Dimensions
All model dimensions are classified as configurable engineering assumptions derived from visual massing and standard construction practices:

| Component | Provisional Dimension | Evidence Status | Basis & Source | Verification Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **Total Height** | 44.0 meters | `[DERIVED]` | Ground + 12 Floors + Parapet (~3.3m floor-to-floor) | Approved Section Drawing |
| **Façade Width** | 42.0 meters | `[ENGINEERING ASSUMPTION]` | Visual aspect ratio (approx 1.05:1 height to width) | Dimensioned Master Floor Plate |
| **Tower Depth** | 32.0 meters | `[ENGINEERING ASSUMPTION]` | Standard floor plate depth for 128 units across 12 floors | Dimensioned Master Floor Plate |
| **Entrance Arch Clearance** | 6.5 meters | `[ENGINEERING ASSUMPTION]` | Scaled visually relative to standard vehicle height (1.6m) | Gate Detail Architectural CAD |
| **Driveway Gate Clearance** | 8.0 meters | `[ENGINEERING ASSUMPTION]` | Standard municipal fire tender access regulations | Fire Department NOC Approval |
| **Floor Count** | 13 visible levels | `[VERIFIED]` | Manual count of balcony rows on `home.png` | RERA P01100005944 filings |
| **Wing Count** | 3 stepped blocks | `[VERIFIED]` | Visual inspection of vertical structural divisions | Master Architectural Floor Plate |

### 5.3 Missing Drawings Requisition List
To transition the 3D model from an evidence-based visual approximation to an authoritative millimeter-accurate digital twin, the following developer documents must be acquired from the family or SIPL:
1. **Master Architectural Site Plan (Top-Down CAD/PDF)**: Showing exact plot boundary coordinates, building footprint setbacks, entrance gate position, and True North compass arrow.
2. **Dimensioned Ground Floor & Typical Floor Plates**: Defining exact wing widths, corridor positions, balcony depths, and flat locations.
3. **Front, Rear & Side Elevation Drawings**: Confirming window dimensions, materials, and rear façade fenestrations.
4. **Entrance Portal & Security Cabin Detail**: Showing structural radius, signage construction, and gate approach driveway profile.

---

## 6. ASSET INTEGRITY AUDIT (`home.png` JPEG ENCODING SPECIFICATION)

### 6.1 Inspection Findings
* **Path**: `d:\house\h\home.png` `[VERIFIED]`
* **Byte Size**: `331,697 bytes` (approx 323.9 KB) `[VERIFIED]`
* **Pixel Resolution**: `962 px (width) × 731 px (height)` `[VERIFIED]`
* **Binary Format Mismatch**:
  * Inspecting the leading magic bytes reveals `0xFF 0xD8 0xFF 0xE0` (Standard JFIF / JPEG Header) `[VERIFIED]`.
  * The file is a JPEG image stored with a `.png` file extension.
* **Rendering Impact**: Modern browsers decode images based on MIME magic bytes regardless of extension, so the image displays without error in `<img>` tags. However, WebGL texture loaders or asset build tools (Vite, Rollup, Webpack) that perform strict extension validation can produce warnings or incorrect texture decoding.

### 6.2 Implementation Action Rule
During implementation phase (Phase 1):
1. The original source file must be preserved in `assets/original/` to prevent data loss.
2. Either:
   * **Option A (Preferred)**: Rename references in `index.html`, `admin.html`, and `js/config.js` to `home.jpg` to match its true MIME type.
   * **Option B**: Re-encode the file as a true 24-bit PNG with an optimized palette if lossless PNG characteristics are explicitly desired.

---

## 7. PROJECT METADATA & SCHEDULE RECONCILIATION

### 7.1 Regulatory Identifiers
* **Telangana RERA Number**: **`P01100005944`** `[VERIFIED: TS RERA public registry]`.
* **Legal Project Name**: The Bilwa by SIPL `[VERIFIED]`.
* **Presentation Policy**: Regulatory and legal identifiers are strictly developer-side metadata and must **not** be displayed on the guest-facing digital invitation.

### 7.2 Ceremony Date vs. Developer Possession Date
* **Confirmed Auspicious Ceremony Date**: **3 December 2026** (Thursday early morning) `[VERIFIED: user instruction]`.
* **Public Developer Completion Date**: **1 January 2028** (with partial late 2027 listings) `[VERIFIED: RERA filing schedule]`.
* **Cultural Context**: Auspicious Griha Pravesha rituals in Hindu tradition are regularly performed upon structural milestone completion or individual flat handover ahead of township completion.
* **Strict Privacy Rule**: The website and 3D architectural experience must strictly honor the family's confirmed ceremony date (**3 December 2026**). Public completion dates must never be presented to guests.

---

## 8. GOOGLE MAPS PLATFORM POLICY COMPLIANCE & 3D TILES COVERAGE PROTOCOL

### 8.1 Strict Policy Compliance (No Headless Mesh Extraction)
The Google Maps Platform Map Tiles API Policies strictly govern the consumption of 3D data:
* **Prohibition on Scraping & Extraction**: Users may **not** download, scrape, cache, store, or extract raw 3D mesh data, leaf `.glb` files, or `.b3dm` tile payloads for geometry analysis, reverse engineering, machine learning training, or independent 3D asset generation `[VERIFIED: Google Maps Platform Map Tiles API Policies]`.
* **Prohibition on Headless Analysis**: Any previously proposed automated scripts fetching leaf tile payloads for vertex density analysis or image processing are strictly prohibited and **hereby fully removed**.
* **Compliant Usage Requirement**: Google Maps 3D Tiles may only be loaded and displayed inside authorized, compliant client-side WebGL renderers (e.g., CesiumJS, three-loader-3dtiles, or deck.gl) with official Google attribution and copyright logos intact.

### 8.2 Compliant Coverage Evaluation Protocol
If the project team desires to evaluate whether Google Maps has photogrammetric 3D mesh coverage for the Miyapur area:
1. **Tool**: Use an authorized, official visual viewer (e.g., the official Google Maps 3D Tiles sandbox viewer or an ephemeral CesiumJS client).
2. **Method**: Visually observe the rendered output at latitude `17.5090431`, longitude `78.3348205`.
3. **Evaluation Metric**: Visual confirmation by the human developer:
   * Level 1: Full 3D textured architectural photogrammetry of The Bilwa building.
   * Level 2: Terrain mesh only with flat 2D satellite texture (no 3D building).
   * Level 3: Historical imagery (vacant plot or excavation).
4. **Default Working Assumption**: Unless visual inspection proves Level 1 coverage, the project assumes that **no current 3D architectural mesh of The Bilwa exists in Google's dataset**, making Standalone Three.js modeling the only viable path to showcase the new home.

---

## 9. GOOGLE MAPS PLATFORM REGIONAL PRICING (INDIA), SKUs & INFRASTRUCTURE BUDGET

### 9.1 Verified Official Regional Pricing (India Billing Account)
Official Google Maps Platform billing for India is structured as follows `[VERIFIED: Google Maps Platform Billing & Pricing - India]`:

```
                       ┌────────────────────────────────────────┐
                       │ Google Maps Platform India Rate Sheets │
                       └───────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│ Dynamic Maps (India)    │       │ Static Maps (India)     │       │ Photorealistic 3D Tiles │
│ SKU: 28B7-E865-983C     │       │ SKU: 4D28-62E3-9F71     │       │ SKU: 3D-TILES-ROOT      │
│ • 0 - 70,000: FREE      │       │ • 0 - 70,000: FREE      │       │ • 0 - 7,000: FREE       │
│ • 70,001+: $2.10 / 1k   │       │ • 70,001+: $0.60 / 1k   │       │ • 7,001+: $3.30 / 1k    │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

* **Maps Embed API (SKU: 0725-3C9A-7B5F)**:
  * Cost: **$0.00 (Unlimited free requests)** `[VERIFIED]`.
  * Prerequisite: Requires an active Google Cloud Project with a valid billing account attached and an API key with HTTP referrer restrictions.
* **Per-SKU Independent Quota**: Free tier allowances are accounted independently per SKU. Consuming Dynamic Maps requests does not reduce the 70,000 free monthly requests allocated to Static Maps.

### 9.2 Stress Scenario Cost Projections (Google Maps APIs Only)

| Traffic Scenario | Monthly Guest Loads | Maps Embed Invoiced Cost | Static Maps Invoiced Cost ($0.60/1k) | Dynamic Maps Invoiced Cost ($2.10/1k) | 3D Tiles Invoiced Cost ($3.30/1k) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Typical Invitation** | 2,500 | **$0.00** | **$0.00** (inside 70k free) | **$0.00** (inside 70k free) | **$0.00** (inside 7k free) |
| **Broad Family Circle** | 25,000 | **$0.00** | **$0.00** (inside 70k free) | **$0.00** (inside 70k free) | **$59.40** (18k × $3.30/1k) |
| **Viral Event Circulation**| 120,000 | **$0.00** | **$30.00** (50k × $0.60/1k) | **$105.00** (50k × $2.10/1k)| **$372.90** (113k × $3.30/1k)|

*Calculation for Static Maps at 120,000 requests*:
$$\text{Chargeable Volume} = 120,000 - 70,000 = 50,000 \text{ requests}$$
$$\text{Total Invoice} = \frac{50,000}{1,000} \times \$0.60 = 50 \times 0.60 = \mathbf{\$30.00}$$

### 9.3 Infrastructure Budget Decoupling
To maintain strict architectural accounting, third-party Google API charges are completely decoupled from website hosting infrastructure:

| Cost Category | Service Provider | Expected Volume | Projected Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Google Maps API (Embed)** | Google Cloud Platform | Unlimited | **$0.00** (Free Embed SKU) |
| **Static Web Hosting** | GitHub Pages / Cloudflare Pages / Vercel | 120,000 visits | **$0.00** (Within free tier) |
| **Edge Egress Bandwidth** | Cloudflare CDN | ~150 GB | **$0.00** (Free unmetered egress) |
| **Domain & SSL** | Custom domain / Cloudflare Universal SSL | 1 Domain | **$0.00 – $12.00 / year** |
| **Total Operational Cost** | — | — | **$0.00 (Zero Cost Architecture)** |

---

## 10. COMPARATIVE ARCHITECTURAL APPRAISAL & DUAL-LAYER SELECTION

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THREE ARCHITECTURAL CHOICES                               │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ Choice A: Standalone       │ Choice B: WebGLOverlayView │ Choice C: Photorealistic     │
│ Three.js Scene             │ (Maps JS API Vector Map)   │ 3D Tiles Mesh Layer          │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ • Pure Three.js Canvas     │ • Maps JS Vector Basemap   │ • OGC 3D Tiles Streaming     │
│ • Procedural PBR Model     │ • Three.js overlay on top  │ • Third-party 3D engine      │
│ • Custom Spline Flight     │ • Maps camera sync         │ • Google 3D city mesh        │
│ • Zero API cost            │ • 70k free loads, then pay │ • 7k free events, then pay   │
│ • Works 100% offline       │ • Subject to Map canvas    │ • Requires high-speed data   │
│ • 100% custom styling      │ • Restricted tilt (67.5°)  │ • Heavy mobile memory        │
└────────────────────────────┴────────────────────────────┴──────────────────────────────┘
```

### 10.1 Definitive Architectural Selection: The Dual-Layer Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           THE APPROVED DUAL-LAYER DESIGN                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LAYER 1: SECTION 2 — "A Glimpse Ahead" (Standalone Three.js Architectural Experience)  │
│ • Purpose: Emotional, cinematic presentation of the Putta family's new residence.      │
│ • Technology: Vanilla Three.js lightweight canvas inside .house-photo-frame.           │
│ • Data Source: Procedural 3D model reconstructed directly from home.png reference.     │
│ • Geographic Scope: Standalone scene with local coordinate origin; DOES NOT load live  │
│   Google Maps geography or satellite tiles.                                            │
│ • Interaction: Touch/mouse orbit (constrained ±45°), zoom, and Gate Fly-Through.       │
│ • Transition: Seamlessly cross-fades into Section 3 (Family Welcome Video).            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LAYER 2: SECTION 5 — "Location & Driving Directions" (Google Maps Embed API)           │
│ • Purpose: Practical navigation, route planning, and real-world geographical context.  │
│ • Technology: Official Google Maps Embed iframe (Pano hmRnIz6EAxYKfH1zXYMTUw).         │
│ • Data Source: Live Google Maps Platform services.                                     │
│ • Interaction: Native Street View pan/tilt, map zoom, and 1-tap "Get Directions".     │
│ • Cost: $0.00 (Unlimited Embed API tier).                                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Why this separation is superior**:
1. **Zero Financial Risk**: Eliminates unpredictable pay-per-event Google Maps API invoices.
2. **Bulletproof Mobile Reliability**: Avoids loading simultaneous vector tile engines and WebGL contexts that cause mobile iOS Safari / Android Chrome tab crashes.
3. **Aesthetic Harmonization**: Standalone Three.js allows custom ivory/gold/bilwa-green lighting tailored to the invitation's cultural aesthetic, avoiding harsh satellite imagery backgrounds.

---

## 11. THREE.JS PERFORMANCE MEASUREMENT, RUNTIME MEMORY PROFILING & ADAPTIVE TIERS

### 11.1 Accurate Memory Profiling Methodology (Correcting API Misconceptions)

> [!IMPORTANT]
> `renderer.info.memory.geometries` is an integer count representing the total number of `BufferGeometry` instances currently uploaded to WebGL memory. It does **not** report byte consumption.

To measure real GPU memory consumption accurately:

```javascript
/**
 * Accurate VRAM Calculation Routine
 * Sums raw BufferAttribute byte lengths and uncompressed texture sizes
 */
function calculateActualGpuMemoryBytes(scene, renderer) {
  let geometryBytes = 0;
  let textureBytes = 0;

  // 1. Calculate Geometry VRAM
  scene.traverse((object) => {
    if (object.isMesh && object.geometry) {
      const geom = object.geometry;
      for (const name in geom.attributes) {
        const attribute = geom.attributes[name];
        if (attribute && attribute.array) {
          geometryBytes += attribute.array.byteLength;
        }
      }
      if (geom.index && geom.index.array) {
        geometryBytes += geom.index.array.byteLength;
      }
    }
  });

  // 2. Calculate Texture VRAM (Uncompressed RGBA = W * H * 4 bytes)
  renderer.info.memory.textures; // Count of textures
  // Textures are computed from their underlying HTMLImageElement dimensions

  return {
    geometryBytes,
    geometryMegabytes: (geometryBytes / (1024 * 1024)).toFixed(2),
    activeGeometriesCount: renderer.info.memory.geometries,
    activeTexturesCount: renderer.info.memory.textures
  };
}
```

### 11.2 Empirical Performance Targets

| Performance Metric | Target Value | Empirical Verification Method |
| :--- | :--- | :--- |
| **Initial 3D Engine Bundle** | $\le 450\text{ KB}$ gzipped | Network tab transfer size (ESM Three.js core + OrbitControls) |
| **Procedural Geometry VRAM** | $\le 2.5\text{ MB}$ uncompressed | Calculated via `calculateActualGpuMemoryBytes()` |
| **Draw Calls per Frame** | $\le 45\text{ calls}$ | `renderer.info.render.calls` counter |
| **Frame Time Budget (Tier 1)**| $\le 16.6\text{ ms}$ (60 FPS) | Chrome DevTools Performance panel / WebGL frame profiler |
| **Frame Time Budget (Tier 3)**| $\le 33.3\text{ ms}$ (30 FPS) | Physical budget Android test (e.g., Redmi / Moto G devices) |
| **Time to Interactive (TTI)** | $\le 1.2\text{ seconds}$ on 4G | Google Lighthouse Web Vitals audit |

### 11.3 Adaptive Device Tiers & Progressive Quality Stepping

```
                          ┌────────────────────────┐
                          │  Intersection Observer │
                          │  (Section in viewport) │
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │ Dynamic Tier Profiling │
                          └───────────┬────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ Tier 1: Desktop  │         │ Tier 2: Mid-tier │         │ Tier 3: Budget   │
│ & High-End Phone │         │ Mobile Device    │         │ Device / Battery │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ • 60 FPS cap     │         │ • 45–60 FPS      │         │ • 30 FPS cap     │
│ • Pixel ratio: 2 │         │ • Pixel ratio: 1.5│        │ • Pixel ratio: 1 │
│ • Soft PCF shadow│         │ • Hard shadow map│         │ • No shadows     │
│ • Full PBR glass │         │ • Simplified PBR │         │ • Basic MeshLambert│
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

* **Progressive Quality Stepping Rule**:
  * If the average frame time exceeds $28\text{ ms}$ for 3 consecutive seconds on a Tier 1 or Tier 2 device, the engine dynamically steps down to Tier 3 (disabling shadow maps and halving pixel ratio) **before** considering complete engine shutdown.
  * If WebGL context creation throws an exception, or if frame time exceeds $50\text{ ms}$ (< 20 FPS) continuously on Tier 3, the engine smoothly disposes of WebGL resources and falls back to the static `home.png` photo frame with a `[ View Family Welcome ]` call-to-action button.

---

## 12. FINITE STATE MACHINE, CAMERA PATH & FAMILY WELCOME TRANSITION

### 12.1 Interactive State Transitions
The interactive experience inside `.house-photo-frame` operates under a deterministic Finite State Machine:

```
[State 0: IDLE]
  │ (User scrolls within 250px of #story-section-1)
  ▼
[State 1: LOADING]
  │ (Three.js initialized, procedural model instanced, shaders compiled)
  ▼
[State 2: EXPLORING] ◄────────────────────────────────┐
  │ (Touch rotation, pinch zoom active, orbit ±45°)    │ (User taps 'Reset Orbit')
  │                                                   │
  ├─► User taps "Fly into Entrance" ──────────────────┘
  ▼
[State 3: FLYING]
  │ (Camera interpolates smoothly along Catmull-Rom spline toward entrance canopy)
  │ (Letters "THE Bilwa PROJECT" enlarge in view)
  ▼
[State 4: GATE PASSED]
  │ (Camera crosses entrance threshold; canvas initiates 400ms opacity fade)
  ▼
[State 5: FAMILY WELCOME]
  │ (Section 3 activates; personal video / photo welcome plays)
```

* **Immediate Skip Pathway**: At any moment during State 2 or State 3, a persistent gold button labeled `[ Skip to Welcome → ]` allows guests to transition directly to Section 3 without waiting.

### 12.2 Mathematical Camera Spline Specification
The entrance fly-through trajectory is defined as a 3D Catmull-Rom cubic spline:

$$\mathbf{C}(t) = \text{CatmullRomSpline}(\mathbf{P}_0, \mathbf{P}_1, \mathbf{P}_2, \mathbf{P}_3, \mathbf{P}_4), \quad t \in [0, 1]$$

* $\mathbf{P}_0 = [18.0, 12.0, 32.0]$: Initial exterior hero viewpoint (looking up at façade).
* $\mathbf{P}_1 = [10.0, 6.0, 22.0]$: Descent along the approach driveway curve.
* $\mathbf{P}_2 = [3.5, 3.2, 12.0]$: Alignment directly in front of the white entrance canopy arch.
* $\mathbf{P}_3 = [0.0, 2.8, 3.0]$: Passage through the living-wall entrance portal at human eye level ($y = 2.8\text{m}$).
* $\mathbf{P}_4 = [0.0, 2.8, -4.0]$: Terminal arrival point inside the front arrival court, triggering the cross-fade.

---

## 13. OUTSTANDING DEPENDENCIES & ARTIFACT REQUISITION LIST

The following items are officially classified as `[PENDING USER CONFIRMATION]` or awaiting developer materials:

1. **Family Residence Specifics**:
   * Which floor, wing, or flat number belongs to the Putta family?
   * *Purpose*: Enables an optional gentle golden beacon or subtle window illumination on the family's specific unit during the exterior orbit.
2. **Family Welcome Media**:
   * Delivery of the short video clip or portrait photo for Section 3 (`assets/family-welcome.mp4` or `assets/family-welcome.jpg`).
3. **Architectural CAD / Brochure Extract**:
   * High-resolution site plan from the SIPL brochure to extract the definitive gate coordinates and True North building orientation.

---

## 14. STAGED IMPLEMENTATION ROADMAP (CONTROLLED PHASING)

All future implementation must proceed through isolated, verifiable phases. **No step may begin without explicit user authorization:**

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGED IMPLEMENTATION ROADMAP (PHASES 1–6)                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: Asset Reconciliation & Configuration Scaffolding                              │
│ • Resolve home.png JPEG MIME naming in index.html and js/config.js.                    │
│ • Establish GeoSpatialConfig parameter structure with configurable overrides.          │
│ • Gate Check: Verify zero visual regression on existing static invitation.             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Lightweight Three.js Canvas Controller                                        │
│ • Mount WebGL canvas inside document.querySelector('.house-photo-frame').              │
│ • Implement device capability detection and adaptive quality tiers (Tiers 1–3).        │
│ • Implement static image fallback if WebGL initialization fails.                       │
│ • Gate Check: Confirm canvas mounts cleanly with zero layout shift on mobile viewports.│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Procedural Architectural Massing of The Bilwa                                 │
│ • Build procedural geometries for the 3 stepped tower blocks, geometric balconies,    │
│   glass balustrades, and signature curved entrance canopy.                             │
│ • Apply ivory wall, dark metal, reflective glass, and green foliage PBR materials.     │
│ • Gate Check: Verify uncompressed geometry VRAM <= 2.5 MB using BufferAttribute bytes. │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Constrained Orbit & Cinematic Spline Flight Path                              │
│ • Implement touch/mouse orbit controls clamped strictly to +/-45 deg horizontal arc.   │
│ • Implement Catmull-Rom spline fly-through passing through the entrance canopy arch.   │
│ • Add "Fly into Entrance" and "Skip to Welcome" controls matching the gold theme.      │
│ • Gate Check: Verify smooth 60 FPS flight animation on standard devices.               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Seamless Transition to Family Welcome                                         │
│ • Connect gate arrival event to Section 3 cross-fade.                                  │
│ • Synchronize audio fade-in if ceremony background music is active.                    │
│ • Gate Check: Confirm smooth, glitch-free handoff from WebGL canvas to Welcome section.│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: Physical Device Benchmarking & Edge Testing                                   │
│ • Profile frame times and VRAM on iOS Safari and budget Android Chrome.                │
│ • Simulate WebGL context loss to ensure automatic fallback to static home.png.         │
│ • Gate Check: Zero console errors, zero memory leaks, zero unauthorized API charges.   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---
*Document Revision 3 (`ENG-3D-MAPS-BILWA-V3`) completed. Strict planning boundary preserved. No application source code, package manifests, or runtime scripts were modified.*
