import { info } from "./data";
import { create, interpolate, scaleLinear, scaleOrdinal, format, schemeCategory10, rgb, select, treemap, treemapResquarify, hierarchy } from "d3/dist/d3";
import './flare-2.json';

//https://bl.ocks.org/JacquesJahnichen/42afd0cde7cbf72ecb81
//https://bl.ocks.org/ganeshv/6a8e9ada3ab7f2d88022
//https://gist.github.com/tkafka/6d00c44d5ae52182f548a18e8db44811

const width = 954;
const height = 924;

const x = scaleLinear().rangeRound([0, width]);
const y = scaleLinear().rangeRound([0, height]);
// const data = JSON.stringify(info);
const data = info;
console.log(`datazzzzzzz: ${data.children.concat(data)}`);

const divContainer = document.getElementById('domainDrillDown');

const svg = create("svg")
    .attr("viewBox", [0.5, -30.5, width, height + 30])
    .style("font", "10px sans-serif");

divContainer.append(svg);

let group = svg.append("g")
    .call(render, treemap(data));

function render(group, root) {
    // console.log(`root: ${root.children}`);
    const node = group
        .selectAll("g")
        .data(data.children.concat(data))
        .join("g");

    node.filter(d => d === root ? d.parent : d.children)
        .attr("cursor", "pointer")
        .on("click", d => d === root ? zoomout(root) : zoomin(d));

    // node.append("title")
    //     .text(d => `${d}\n${format(d.value)}`);

    node.append("rect")
        // .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
        .attr("fill", d => d === root ? "#fff" : d.children ? "#ccc" : "#ddd")
        .attr("stroke", "#fff");

    node.append("clipPath")
        // .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
        .append("use")
        // .attr("xlink:href", d => d.leafUid.href);

    node.append("text")
        // .attr("clip-path", d => d.clipUid)
        .attr("font-weight", d => d === root ? "bold" : null)
        .selectAll("tspan")
        // .data(d => (d === root ? d : d.data.name).split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
        .join("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
        .text(d => d);

    group.call(position, root);
}

function position(group, root) {
    group.selectAll("g")
        .attr("transform", d => {
            console.log(`this is ddd: ${JSON.stringify(d)}`);
            d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`
        })
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
        .duration(750)
        .call(t => group0.transition(t).remove()
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
        .duration(750)
        .call(t => group0.transition(t).remove()
            .attrTween("opacity", () => interpolate(1, 0))
            .call(position, d))
        .call(t => group1.transition(t)
            .call(position, d.parent));
}

// return svg.node();
