import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

console.log(projects); // Debugging

const projectsContainer = document.querySelector('.projects');

renderProjects(projects ?? [], projectsContainer, 'h2');