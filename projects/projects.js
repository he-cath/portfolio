
import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Load project data
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

const svg = d3.select('#projects-pie-plot');
const legend = d3.select('.legend');
const searchInput = document.querySelector('.searchBar');

// State for filters
let query = '';
let selectedYear = null;

// Chart setup
const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

const sliceGenerator = d3.pie()
    .value(d => d.value)
    .sort(null);

const colors = d3.scaleOrdinal(d3.schemeTableau10);

// Return projects matching the search text
function getSearchedProjects() {
    return projects.filter(project => {
        const values = Object.values(project)
            .join('\n')
            .toLowerCase();

        return values.includes(query.toLowerCase());
    });
}

// Render pie chart and legend
function renderPieChart(projectsGiven) {

    // Count projects in each year
    const rolledData = d3.rollups(
        projectsGiven,
        v => v.length,
        d => String(d.year)
    );

    // Convert to chart data
    const data = rolledData.map(([year, count]) => {
        return {
            value: count,
            label: year
        };
    });

    // Create arcs
    const arcData = sliceGenerator(data);

    // Clear previous chart and legend
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    // Draw the pie slices
    arcData.forEach(d => {
        const year = d.data.label;

        svg.append('path')
            .attr('d', arcGenerator(d))
            .attr('fill', colors(year))
            .classed('selected', selectedYear === year)
            .attr('tabindex', 0)
            .attr('role', 'button')
            .attr('aria-label', `Filter projects from ${year}`)
            .on('click', () => selectYear(year))
            .on('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectYear(year);
                }
            });
    });

    // Create the legend
    data.forEach(d => {
        const year = d.label;

        legend.append('li')
            .attr('class', 'legend-item')
            .style('--color', colors(year))
            .classed('selected', selectedYear === year)
            .attr('tabindex', 0)
            .attr('role', 'button')
            .attr('aria-label', `Filter projects from ${year}`)
            .html(
                `<span class="swatch"></span>
                 ${year} <em>(${d.value})</em>`
            )
            .on('click', () => selectYear(year))
            .on('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectYear(year);
                }
            });
    });
}

// Handle selecting and deselecting a year
function selectYear(year) {

    // Clicking the selected year again deselects it
    selectedYear = selectedYear === year ? null : year;

    updateDisplay();
}

// Update projects and chart using both filters
function updateDisplay() {

    const searchedProjects = getSearchedProjects();

    // Apply year filtering in addition to search
    const filteredProjects = selectedYear === null
        ? searchedProjects
        : searchedProjects.filter(
            project => String(project.year) === selectedYear
        );

    // Render the filtered project list
    renderProjects(filteredProjects, projectsContainer, 'h2');

    // Chart represents search results, with year selection highlighted
    renderPieChart(searchedProjects);
}

// Real-time search
searchInput.addEventListener('input', event => {
    query = event.target.value;
    updateDisplay();
});

// Initial render
updateDisplay();
