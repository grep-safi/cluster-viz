import {extent, line, axisBottom, axisLeft, scaleTime, format, hierarchy, interpolate, scaleLinear, scaleLog, select, treemap, max} from "d3/dist/d3";
import {equallySpacedTiling} from "./utils/tiling";
import data from "./data";
const nid_data = require('../data/nid01180_ldms.json');
const nid_data2 = require('../data/nid01180_ldms.json');
const nid_data3 = require('../data/nid01180_ldms.json');
const nid_data4 = require('../data/nid01180_ldms.json');

let largest = nid_data[0]['Memory'];

for (let i = 0; i < nid_data.length; i += 1) {
    nid_data[i]['Time'] = new Date(nid_data[i]['Time']);
    nid_data2[i]['Time'] = new Date(nid_data2[i]['Time']);
    nid_data3[i]['Time'] = new Date(nid_data3[i]['Time']);
    nid_data4[i]['Time'] = new Date(nid_data4[i]['Time']);

    largest = Math.max(...[nid_data[i]['Memory'], nid_data2[i]['Memory'], nid_data3[i]['Memory'], nid_data4[i]['Memory'], largest]);
}

const dataset = [nid_data, nid_data2, nid_data3, nid_data4];

export default (hData, nodeFieldList) => {
    const width = 800;
    const height = 800;

    const transitionSpeed = 500;

    const x = scaleLinear().rangeRound([0, width]);
    const y = scaleLinear().rangeRound([0, height]);

    const showGraph = nodeFieldList["Display Graph"];

    // Remove all the preexisting nodes so we can redraw the page with new data
    select('#data-viz').selectAll('*').remove();

    const svg = select("#data-viz")
        .append("svg")
        .attr("id", 'root')
        .attr("viewBox", `0 0 ${width} ${height}`);

    // This function sets the pixel positions of each child in the parent node for display
    function tile(parentNode, x0, y0, x1, y1) {
        equallySpacedTiling(parentNode, width, height);
        for (const child of parentNode.children) {
            child.x0 = x0 + child.x0 / width * (x1 - x0);
            child.x1 = x0 + child.x1 / width * (x1 - x0);
            child.y0 = y0 + child.y0 / height * (y1 - y0);
            child.y1 = y0 + child.y1 / height * (y1 - y0);
        }
    }

    // This function creates a treemap object with the given data
    const tree = data => treemap()
        .tile(tile)
        (hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.height - a.height)
        );

    // This function returns the name of where
    // we are the treemap.
    const name = d => d.ancestors().reverse().map(d => d.data.name).join("/");

    const formatNum = format(",d");

    // This is the title which allows users to zoom out and tells them
    // Of their position in the system at a given moment.
    const currentPosition = select("#currentPosition")
        .attr("style", "color: gold");

    // Append the group tag and call the render function for the first time
    // which draws the system level view of the Cori supercomputer
    let group = svg.append("g")
        .call(render, tree(hData));

    /**
     * Renders the screen with the tiles of the level that we are currently on
     * @param {Object} group The <g> (group) tag SVG elements
     * @param {Object} root  The d3.treemap object
     */
    function render(group, root) {
        // Select all the <g> tags and bind the root's
        // children as the data and join all the <g> paths
        const node = group
            .selectAll("g")
            .data(root.children)
            .join("g");

        // This returns the root nodes and child nodes and adds
        // a click event so that the user can zoom in and zoom out
        node.filter(d => d === root ? d.parent : d.children)
            .attr("cursor", "pointer")
            .on("click", d => d === root ? zoomout(root) : zoomin(d));

        // Clicking on the currentPosition text will zoom
        // out of the current level (unless it is the first level)
        currentPosition
            .text(name(root))
            .on("click", () => name(root) !== 'Cori' ? zoomout(root) : null);

        /**
         * These rects are shaded according to the number of matching nodes that are
         * children of the object to which they correspond.
         * Shading goes from white to dark orange
         */
        node
            .append("rect")
            .classed('rectGroup', true)
            .attr("fill", d => {
                // This function will fill the rect based on the node value and the maximum node value possible
                // Uses logarithmic scaling
                const maxValuesArray = [hData.maxCabinet, hData.maxChassis, hData.maxBlade, 1];
                const depth = d.depth - 1;
                let maxVal = maxValuesArray[depth] === 0 ? 2 : maxValuesArray[depth] + 1;
                const colorScale = scaleLog()
                    .domain([1, maxVal])
                    .range(['white', 'darkorange']);

                const nodeValue = d.value === 0 ? 1 : d.value + 1;
                return d === root ? "#fff" : `${colorScale(nodeValue)}`;
            })
            .attr("stroke", "gold");

        /**
         * This function returns an array of all the attributes that must be displayed
         * On the node rectangle view itself
         * @param d The object which contains the data of the node
         * @returns {string[]|[]} A string of all the attributes that the user desires to be on the display
         */
        const displayFields = d => {
            // If the depth isn't 4, then we aren't at the node level, so simply return empty string
            // If there is no nodeData, then we're probably at a service node which has no fields so return empty string
            if (d.depth !== 4 || !d.data.nodeData || showGraph) return [''];

            const jobAttributes = [
                'JOBID',
                'ACCOUNT',
                'USER'
            ];

            // This for loop iterates through node attributes that are checked by the user
            // And pushes those to an array
            // If the number of checked boxes is greater than 25, then there's no space for more,
            // so simply exit the for loop
            const displayAttributes = [];
            let count = 0;
            for (const property in nodeFieldList) {
                if (nodeFieldList.hasOwnProperty(property) && nodeFieldList[property]) {
                    if (d.data.nodeData.hasOwnProperty(property)) {
                        displayAttributes.push(`${property}: ${d.data.nodeData[property]}`);
                    } else {
                        const formattedProp = property.toUpperCase().replace(/\s+/g, '');
                        const queueData = d.data.nodeData['queueData'];
                        if (queueData && jobAttributes.includes(formattedProp)) {
                            let str = `${property}: `;
                            for (let i = 0; i < queueData.length; i++) {
                                const comma = i === queueData.length - 1 ? '' : ', ';
                                str = str.concat(queueData[i][formattedProp] + comma);
                            }
                            displayAttributes.push(str);
                        }
                    }
                    count += 1;
                }
                if (count > 25) break;
            }

            return displayAttributes;
        }

        // This is the current depth in tree
        const viewDepth = root.children[0].depth;

        // This gives the starting position for a string of text
        // based on its length so that it is centered in the rect
        const textPosition = (text) => {
            const widths = [width / 24, width / 6, width / 8, width / 4];
            const characterSize = 3.2;
            return widths[viewDepth - 1] - text.length * characterSize;
        }

        // This adds text to the node based on the depth level
        // and the checkboxes the user checks off.
        node.append("text")
            .classed('rectGroup', true)
            .attr('transform', 'translate(0, 5)')
            .selectAll("tspan")
            .data(d => {
                const additions = viewDepth < 4 ? ['Matching', 'Nodes:', formatNum(d.value)] : [];
                return [d.data.name, ...additions, ...displayFields(d)]; // Uncomment to add the fields back in
                // return [d.data.name, ...additions];
            })
            .join("tspan")
            .attr('x', (d, i) => {
                const numHeaders = viewDepth < 4 ? 3 : 0;
                return i <= numHeaders ? textPosition(d) : 0;
            })
            .attr('dy', (d, i) => i === 0 || i >= 2 ? '1.0em' : '3.0em')
            .attr("font-size", `13px`)
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "bold")
            .attr('fill', (d, i) => {
                const numHeaders = viewDepth < 4 ? 2 : 0;
                return i === 0 ? 'black' : i <= numHeaders ? 'midnightblue' : 'forestgreen'
            })
            .text(d => d);

        // If the depth is 4, draw the graph with the random data
        if (viewDepth === 4 && showGraph) {
            const divisor = 2.5;
            const offsetX = 60;
            const offsetY = 350;

            const xAxis = [
                scaleTime()
                    .domain([new Date(dataset[0][0]['Time']), new Date(dataset[0][dataset[0].length - 1]['Time'])])
                    .range([0, width / divisor]),
                scaleTime()
                    .domain([new Date(dataset[0][0]['Time']), new Date(dataset[0][dataset[0].length - 1]['Time'])])
                    .range([0, width / divisor]),
                scaleTime()
                    .domain([new Date(dataset[0][0]['Time']), new Date(dataset[0][dataset[0].length - 1]['Time'])])
                    .range([0, width / divisor]),
                scaleTime()
                    .domain([new Date(dataset[0][0]['Time']), new Date(dataset[0][dataset[0].length - 1]['Time'])])
                    .range([0, width / divisor])
            ];

            const yAxis = scaleLinear()
                .domain([0, largest]) // input
                .range([height / divisor, 0]); // output

            node
                .append('g')
                .classed('rectGroup', false)
                .attr('transform', d => {

                    x.domain([d.parent.x0, d.parent.x1]);
                    y.domain([d.parent.y0, d.parent.y1]);

                    let xVal = x(d.x0) + offsetX;
                    let yVal = y(d.y0) + offsetY;

                    return `translate(${xVal},${yVal})`;
                })
                .call(axisBottom(xAxis[0]));

            const nodeLine = node
                .append('g')
                .classed('rectGroup', false)
                .attr('transform', d => {
                    x.domain([d.parent.x0, d.parent.x1]);
                    y.domain([d.parent.y0, d.parent.y1]);

                    let xVal = x(d.x0) + offsetX;
                    let yVal = y(d.y0) + offsetY - 330;

                    return `translate(${xVal},${yVal})`;
                })
                .append('path')
                .datum((d, i) => {
                    return dataset[i];
                })
                .attr("d", line()
                    .x(d => xAxis[0](d['Time']))
                    .y(d => yAxis(d['Memory'])))
                .attr("stroke", (d, i) => {
                    if (i === 0) return 'cyan';
                    if (i === 1) return 'crimson';
                    if (i === 2) return 'purple';
                    if (i === 3) return 'green';
                })
                .style("stroke-width", 2)
                .style("fill", "none");

            node
                .append('g')
                .classed('rectGroup', false)
                .attr('transform', d => {
                    x.domain([d.parent.x0, d.parent.x1]);
                    y.domain([d.parent.y0, d.parent.y1]);

                    // let xVal = x(d.x0) + width / divisor - offset;
                    // let yVal = y(d.y0) + height / 4 - divisor / 6;

                    let xVal = x(d.x0) + offsetX;
                    let yVal = y(d.y0) + offsetY - 320;

                    return `translate(${xVal},${yVal})`;
                })
                .call(axisLeft(yAxis));

            const optionsGroup = ["CPU Usage", "Memory Usage"];

            select("#div-graph")
                .append("select")
                .attr('id', 'select-btn')
                .selectAll('myOptions')
                .data(optionsGroup)
                .enter()
                .append("option")
                .text(d => d)
                .attr('value', d => d);

            select('#select-btn')
                .on("change", () => update());

            // A function that update the chart
            function update() {
                // Give these new data to update line
                const multiArray = [];
                for (let j = 0; j < 4; j++) {
                    const arr = [];
                    multiArray.push(arr);
                    for (let i = 0; i < 10; i++) {
                        arr.push(Math.round(Math.random() * 17) + 1);
                    }
                }

                nodeLine
                    .datum((d, i) => multiArray[i])
                    .transition()
                    .duration(1000)
                    .attr("d", line()
                        .x(d => xAxis[0](d.x))
                        .y(d => yAxis(d.y))
                    )
                    .attr("stroke", "crimson")
                    .style("stroke-width", 2)
                    .style("fill", "none");
            }
        }

        // ----------
        group.call(position, root);
    }

    // Draw the correct positions of the tiles on the svg.
    function position(group, root) {
        group
            .selectAll("g")
            .selectAll('.rectGroup')
            .attr("transform", d => {
                let xCoord = x(d.x0);
                let yCoord = y(d.y0);

                return d === root ? `translate(0,0)` : `translate(${xCoord},${yCoord})`;
            });

        group.selectAll('g')
            .select("rect")
            .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
            .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0))
    }

    // When zooming in, draw the new nodes on top, and fade them in.
    function zoomin(d) {
        const group0 = group.attr("pointer-events", "none");
        const group1 = group = svg.append("g").call(render, d);

        x.domain([d.x0, d.x1]);
        y.domain([d.y0, d.y1]);

        svg.transition()
            .duration(transitionSpeed)
            .call(t => group0.transition(t)
                .remove()
                .call(position, d.parent))
            .call(t => group1.transition(t)
                .attrTween("opacity", () => interpolate(0, 1))
                .call(position, d));
    }

    // When zooming out, draw the old nodes on top, and fade them out.
    function zoomout(d) {
        const group0 = group.attr("pointer-events", "none");
        const group1 = group = svg.insert("g", "*").call(render, d.parent);

        x.domain([d.parent.x0, d.parent.x1]);
        y.domain([d.parent.y0, d.parent.y1]);

        svg.transition()
            .duration(transitionSpeed)
            .call(t => group0.transition(t)
                .remove()
                .attrTween("opacity", () => interpolate(1, 0))
                .call(position, d))
            .call(t => group1.transition(t)
                .call(position, d.parent));
    }
}
