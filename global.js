const BASE_PATH = (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
)
    ? "/"
    : "/portfolio/";

console.log("IT'S ALIVE!");

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Define navigation pages
let pages = [
    { url: "", title: "Home" },
    { url: "projects/", title: "Projects" },
    { url: "contact/", title: "Contact" },
    { url: "cv/", title: "CV" },
    { url: "https://github.com/he-cath", title: "GitHub" }
];

// Create navigation
let nav = document.createElement("nav");

for (let page of pages) {
    let url = page.url;

    // Adjust relative URLs for local or GitHub Pages
    url = !url.startsWith("http") ? BASE_PATH + url : url;

    // Create link element
    let a = document.createElement("a");
    a.href = url;
    a.textContent = page.title;

    // Highlight current page
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add("current");
    }

    // Open external links in new tab
    if (a.host !== location.host) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
    }

    nav.append(a);
}

// Add navigation to the page
document.body.prepend(nav);

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
        Theme:
        <select>
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>
    `
);

let select = document.querySelector('.color-scheme select');

// Function to apply the selected color scheme
function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty(
        'color-scheme',
        colorScheme
    );
}

// Restore saved preference when the page loads
if ("colorScheme" in localStorage) {
    let savedScheme = localStorage.colorScheme;

    setColorScheme(savedScheme);
    select.value = savedScheme;
}

// Save preference when user changes the dropdown
select.addEventListener('input', function (event) {
    let colorScheme = event.target.value;

    setColorScheme(colorScheme);
    localStorage.colorScheme = colorScheme;

    console.log('color scheme changed to', colorScheme);
});


// Contact form
let form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
    // Prevent default form submission
    event.preventDefault();

    // Get submitted form data
    let data = new FormData(form);

    // Start with the email address
    let url = form.action + '?';

    // Build URL parameters
    let params = [];

    for (let [name, value] of data) {
        params.push(
            `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
        );
    }

    // Combine parameters using &
    url += params.join('&');

    // Open email client
    location.href = url;
});


export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    console.log(response);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';

    for (const project of projects) {
        const article = document.createElement('article');

        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${project.image}" alt="${project.title}">
            <p>${project.description}</p>
        `;

        containerElement.appendChild(article);
    }
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}