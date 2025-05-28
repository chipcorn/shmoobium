const navbar = React.createElement(Shmoobium.Navbar, {
    position: 'top', // 'top', 'bottom', 'left', 'right'
    style: 'default', // 'default', 'floating'
    slideover: 'bubble', // 'default', 'bubble'
    alignment: 'right', // 'top', 'bottom', 'left', 'right'
    logoText: 'Shmoobium', // Text next to icon, optional
    logoHref: 'index.html', // Link from clicking on the logo
    fontColor: '#ffffff', // Font color of the navbar
    backgroundColor: '#141414', // Background color of the navbar
    displayShmoobiumVersion: false, // true, false
    icon: {
        src: 'https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp', // Replace this with a URL or path to your own image!
        alt: 'Logo' // Alt text for the icon
    },
    items: [
        { 
            label: 'Home', // Label of the button
            href: 'index.html', // Link for the button
            icon: Shmoobium.createIcon('https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp', 'Home') // Icon for the button + Alt text for the icon
        },
        { 
            label: 'About', 
            href: 'about.html', 
            icon: Shmoobium.createIcon('https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp', 'About')
        },
        { 
            label: 'Dropdown', 
            icon: Shmoobium.createIcon('https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp', 'Dropdown'),
            dropdown: [
                { 
                    label: 'Shmooblesworld', 
                    href: 'https://shmooblesworld.com', 
                    icon: Shmoobium.createIcon('https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp', 'Shmooblesworld.com')
                },
                { 
                    label: 'Shmoob.net', 
                    href: 'https://shmoob.net', 
                    icon: Shmoobium.createIcon('https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp', 'Shmoob.net')
                },
                { 
                    label: 'Shmoobles.world', 
                    href: 'https://shmoobles.world', 
                    icon: Shmoobium.createIcon('https://unpkg.com/shmoobium@latest/dist/assets/shmoobium.webp', 'Shmoobles.world')
                }
            ]
        }
    ],
    className: 'navbar',
    itemClassName: 'navbar-item',
    iconClassName: 'navbar-icon',
    onItemClick: (item) => {
        console.log('Navbar item clicked:', item.label);
    }
});

ReactDOM.render(navbar, document.getElementById('navbar')); // ID of the navbar div