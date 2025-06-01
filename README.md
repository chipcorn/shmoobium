# Shmoobium v2.0.0

A React component library for Shmooblesworld.com 3.0

## Installation

1. Include Shmoobium in your HTML:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Shmoobium Website</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/shmoobium@1/dist/index.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/shmoobium@1/dist/index.css">
</head>
```

2. Use HTML data attributes to add components:

### Navbar Template

```html
<nav data-shmoobium="navbar"
     data-position="top"
     data-style="default"
     data-slideover="default"
     data-alignment="right"
     data-logo-text="My Website"
     data-logo-href="index.html"
     data-font-color="#ffffff"
     data-background-color="#141414"
     data-display-shmoobium-version="false"
     data-icon-src="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp"
     data-icon-alt="Logo">
  <a href="index.html" data-nav-item data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">Home</a>
  <a href="about.html" data-nav-item data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">About</a>
  <a href="#" data-nav-item data-dropdown="true" data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">
    Dropdown
    <a href="https://example.com" data-dropdown-item data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">Link 1</a>
    <a href="https://example2.com" data-dropdown-item data-icon="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp">Link 2</a>
  </a>
</nav>
```

**All Navbar Options:**
- `data-position="top"` - Where to place the navbar (top, bottom, left, right)
- `data-style="default"` - Style variant (default, floating)
- `data-slideover="default"` - Mobile menu style (default, bubble)
- `data-alignment="right"` - Where to align nav items (top, bottom, left, right)
- `data-logo-text="My Website"` - Text next to logo
- `data-logo-href="index.html"` - Link when clicking logo
- `data-font-color="#ffffff"` - Text color
- `data-background-color="#141414"` - Background color
- `data-display-shmoobium-version="false"` - Show Shmoobium version
- `data-icon-src="url"` - Logo image URL
- `data-icon-alt="Logo"` - Logo alt text

**Nav Item Options:**
- `data-nav-item` - Makes a link a navigation item
- `data-icon="url"` - Add icon to nav item
- `data-dropdown="true"` - Makes item a dropdown
- `data-dropdown-item` - Items inside dropdown

### Sticker Container Template

```html
<div data-shmoobium="sticker-container"
     data-max-stickers="15"
     data-enable-sounds="true"
     data-spawn-radius="150"
     data-sticker-box-on-mobile="true">
  <img data-sticker data-enabled="false" src="https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp" alt="Shmoobium">
</div>

<!-- Add this button somewhere to open the sticker box -->
<button onclick="openStickerBox()">Open Stickers</button>
```

**All Sticker Options:**
- `data-max-stickers="15"` - Maximum number of stickers on screen
- `data-enable-sounds="true"` - Play sounds on interaction
- `data-spawn-radius="150"` - Pixels around spawn point
- `data-sticker-box-on-mobile="false"` - Show stickers on mobile devices

**Sticker Item Options:**
- `data-sticker` - Makes an image a draggable sticker
- `data-enabled="false"` - Whether sticker starts enabled (true/false)

### Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Shmoobium Website</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/shmoobium@1/dist/index.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/shmoobium@1/dist/index.css">
</head>
<body>
    <!-- Navbar with minimal customization -->
    <nav data-shmoobium="navbar" 
         data-logo-text="My Site"
         data-style="floating">
      <a href="/" data-nav-item>Home</a>
      <a href="/about" data-nav-item>About</a>
      <a href="/blog" data-nav-item>Blog</a>
    </nav>
    
    <main style="margin-top: 80px; padding: 2rem;">
        <h1>Welcome to My Website!</h1>
        <p>Drag the stickers around! Shift + right-click to resize them.</p>
        <button onclick="openStickerBox()">Open Stickers</button>
    </main>
    
    <!-- Stickers with default settings -->
    <div data-shmoobium="sticker-container">
      <img data-sticker src="https://unpkg.com/shmoobium@1/dist/assets/shmoobium.webp" alt="Shmoobium">
    </div>
</body>
</html>
```