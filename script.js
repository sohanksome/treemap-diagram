const kickstarterUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';
const movieSalesUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';
const videoGameSalesUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';

Promise.all([
    d3.json(kickstarterUrl),
    d3.json(movieSalesUrl),
    d3.json(videoGameSalesUrl)
]).then(data => {
    const kickstarterData = data[0];
    const movieSalesData = data[1];
    const videoGameSalesData = data[2];

    const width = 900;
    const height = 600;

    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip");

    // Function to create a treemap for a given dataset and a container
    function createTreemap(data, containerId) {
        const treemapLayout = d3.treemap()
            .size([width, height])
            .padding(1);

        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        treemapLayout(root);

        const svg = d3.select(containerId)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const nodes = svg.selectAll('g')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

        // Define a color scale
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Append rectangles with data attributes
        nodes.append('rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('class', 'tile')
            .attr('data-name', d => d.data.name)
            .attr('data-category', d => d.data.category)
            .attr('data-value', d => d.data.value)
            .style('fill', d => colorScale(d.data.category))
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Name: ${d.data.name}<br>Value: ${d.data.value}`)
                .attr('data-value', d.data.value)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Append text
        nodes.append('text')
            .attr('x', d => (d.x1 - d.x0) / 2)
            .attr('y', d => (d.y1 - d.y0) / 2)
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .text(d => d.data.name.length > 15 ? d.data.name.slice(0, 15) + '...' : d.data.name)
            .attr('fill', '#fff')
            .style('font-size', '12px')
            .style('pointer-events', 'none');

        return root; // Return the root for legend creation
    }

    // Create separate treemaps for each dataset and keep a reference to the roots
    const kickstarterRoot = createTreemap(kickstarterData, '#kickstarterTreemap');
    const movieSalesRoot = createTreemap(movieSalesData, '#movieSalesTreemap');
    const videoGameSalesRoot = createTreemap(videoGameSalesData, '#videoGameSalesTreemap');

    // Function to create a legend based on the current dataset
    function createLegend(data) {
        const legendData = Array.from(new Set(data.leaves().map(d => d.data.category)));
        const legend = d3.select("#legend");
    
        // Clear any existing legend items
        legend.selectAll('*').remove();
    
        // Define a color scale for the legend
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
        // Append legend items
        legendData.forEach((category) => {
            const legendItem = legend.append('g')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('margin-bottom', '5px');
    
            legendItem.append('rect')
                .attr('class', 'legend-item')
                .style('width', '18px')
                .style('height', '18px')
                .style('fill', colorScale(category))
                .style('margin-right', '10px');
    
            legendItem.append('text')
                .text(category)
                .style('font-size', '12px'); // Set font size for clarity
        });
    }
    

    // Set the default display to Kickstarter and create its legend
    d3.select("#kickstarterTreemap").style("display", "block");
    d3.select("#movieSalesTreemap").style("display", "none");
    d3.select("#videoGameSalesTreemap").style("display", "none");
    createLegend(kickstarterRoot); // Create legend for default dataset

    // Button click handlers to display the appropriate treemap
    d3.select("#kickstarterBtn").on("click", function() {
        d3.select("#kickstarterTreemap").style("display", "block");
        d3.select("#movieSalesTreemap").style("display", "none");
        d3.select("#videoGameSalesTreemap").style("display", "none");
        createLegend(kickstarterRoot); // Update legend for Kickstarter
    });

    d3.select("#movieSalesBtn").on("click", function() {
        d3.select("#kickstarterTreemap").style("display", "none");
        d3.select("#movieSalesTreemap").style("display", "block");
        d3.select("#videoGameSalesTreemap").style("display", "none");
        createLegend(movieSalesRoot); // Update legend for Movie Sales
    });

    d3.select("#videoGameSalesBtn").on("click", function() {
        d3.select("#kickstarterTreemap").style("display", "none");
        d3.select("#movieSalesTreemap").style("display", "none");
        d3.select("#videoGameSalesTreemap").style("display", "block");
        createLegend(videoGameSalesRoot); // Update legend for Video Game Sales
    });

}).catch(error => {
    console.error('Error loading the data:', error);
});
