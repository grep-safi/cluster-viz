import { treemapBinary, interpolate, scaleLinear, scaleOrdinal, format, schemeCategory10, rgb, select, treemap,
    treemapResquarify, hierarchy, treemapDice, treemapSliceDice, treemapSlice, treemapSquarify } from "d3/dist/d3";
import { info } from './data';
import { equallySpacedTiling } from "./tiling";

const width = 800;
const height = 800;

const transitionSpeed = 400;

const x = scaleLinear().rangeRound([0, width]);
const y = scaleLinear().rangeRound([0, height]);

const svg = select("#data-viz")
    .append("svg")
    .attr("width", width)
    .attr("height", height + 20);


function tile(node, x0, y0, x1, y1) {
    equallySpacedTiling(node);
    for (const child of node.children) {
        child.x0 = x0 + child.x0 / width * (x1 - x0);
        child.x1 = x0 + child.x1 / width * (x1 - x0);
        child.y0 = y0 + child.y0 / height * (y1 - y0);
        child.y1 = y0 + child.y1 / height * (y1 - y0);

    }
}

const tree = data => treemap()
    .tile(tile)
    (hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height)
    );

const name = d => d.ancestors().reverse().map(d => d.data.name).join("/");

const formatNum = format(",d")



let currentPosition = svg.append("text")
    .text("super califragilistic expialodocious")
    .attr("fill", "gold")
    .attr("x", 0)
    .attr("y", height + 15);

let group = svg.append("g")
    .call(render, tree(info));
/**
 *
 * @param {Object} group The <g> (group) tag SVG elements
 * @param {Object} root  The d3.treemap object
 */
function render(group, root) {
    // Select all the <g> tags and bind the root's
    // children as the data and join all the <g> paths
    const node = group
        .selectAll("g")
        // .data(root.children.concat(root))
        .data(root.children)
        .join("g");

    // This returns the root nodes and child nodes and adds
    // a click event so that the user can zoom in and zoom out
    node.filter(d => d === root ? d.parent : d.children)
        .attr("cursor", "pointer")
        .on("click", d => d === root ? zoomout(root) : zoomin(d));

    currentPosition
        .text("")
        .attr("cursor", "pointer")
        .on("click", function() { zoomout(root) });

    // node.append("title")
    //     .text(d => `${name(d)}\n${formatNum(d.value)}`);

    node.append("rect")
        .attr("fill", d => {
            let arr = [13056, 192, 48, 4, 1];
            let maxVal = arr[d.depth];
            const colorScale = scaleLinear()
                .domain([0, maxVal])
                .range(['white', 'hotpink']);

            // return d === root ? "#fff" : d.children ? `${colorScale(d.value)}` : "#ddd"
            return d === root ? "#fff" : `${colorScale(d.value)}`;
        })
        .attr("stroke", "rgb(0,0,0)");


    node.append("text")
        .attr("font-weight", "bold")
        .attr("font-size", `13px`)
        .selectAll("tspan")
        // .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g).concat(``).concat(`Active`).concat(`Nodes: `).concat(`Nodes: ${formatNum(d.value)}`))
        // .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g).concat(``).concat(`Active`).concat(`Nodes: ${formatNum(d.value)}`))
        .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g))
        .join("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.9 + 1.1 + i * 0.9}em`)
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
        .text(d => d);

    node.append("text")
        .attr("font-size", `13px`)
        .selectAll("tspan")
        .data(d => (`nodes: ${formatNum(d.value)}`).split(/(?=[A-Z][^A-Z])/g))
        .join("tspan")
        .attr("x", 3)
        // .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.9 + 8.5 + i * 0.9}em`)
        .attr("y", (d, i, nodes) => `5em`)
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
        .text(d => d);

    group.call(position, root);
}

function position(group, root) {
    group.selectAll("g")
        .attr("transform", d => d === root ? `translate(0,0)` : `translate(${x(d.x0)},${y(d.y0)})`)
        .select("rect")
        .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
        .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
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
        .call(t => group0.transition(t).remove()
            .attrTween("opacity", () => interpolate(1, 0))
            .call(position, d))
        .call(t => group1.transition(t)
            .call(position, d.parent));
}
