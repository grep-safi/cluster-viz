import {axisBottom, format, hierarchy, interpolate, scaleLinear, scaleLog, select, treemap} from "d3/dist/d3";
import {equallySpacedTiling} from "./utils/tiling";

let dt = {
    time: [1,2,3,4,5,6,7,8,9,10],
    valueA: [2,3,1,7,8,8,5,4,9,11],
    valueB: [5,4,4,4,8,13,15,17,18],
    valueC: [13,14,16,12,7,9,3,2,1,1],
};

export default (hData, nodeFieldList) => {
    const width = 800;
    const height = 800;
    const paddingTop = 0;

    const transitionSpeed = 500;

    const x = scaleLinear().rangeRound([0, width]);
    const y = scaleLinear().rangeRound([0, height]);

    select('#data-viz').selectAll('*').remove();
    const svg = select("#data-viz")
        .append("svg")
        .attr("id", 'root')
        .attr("viewBox", `0 0 ${width} ${height + paddingTop}`);

    function tile(node, x0, y0, x1, y1) {
        equallySpacedTiling(node, width, height, paddingTop);
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

    const currentPosition = select("#currentPosition")
        .attr("style", "color: gold");

    let group = svg.append("g")
        .call(render, tree(hData));

    /**
     *
     * @param {Object} group The <g> (group) tag SVG elements
     * @param {Object} root  The d3.treemap object
     */
    function render(group, root) {
        // Select all the <g> tags and bind the root's
        // children as the data and join all the <g> paths
        const node = group
            // .select('.rectGroup')
            .selectAll("g")
            .data(root.children)
            .join("g");

        // This returns the root nodes and child nodes and adds
        // a click event so that the user can zoom in and zoom out
        node.filter(d => d === root ? d.parent : d.children)
            .attr("cursor", "pointer")
            .on("click", d => d === root ? zoomout(root) : zoomin(d));

        currentPosition
            .text(name(root))
            .on("click", () => name(root) !== 'Cori' ? zoomout(root) : null);

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
                    .range(['white', 'lightseagreen']);

                const nodeValue = d.value === 0 ? 1 : d.value + 1;
                return d === root ? "#fff" : `${colorScale(nodeValue)}`;
            })
            .attr("stroke", "gold");

        const displayFields = d => {
            // If the depth isn't 4, then we aren't at the node level, so simply return empty string
            // If there is no nodeData, then we're probably at a service node which has no fields so return empty string
            if (d.depth !== 4 || !d.data.nodeData) return [''];

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

        node.append("text")
            .classed('rectGroup', true)
            .attr('transform', 'translate(0, 5)')
            .selectAll("tspan")
            .data(d => [d.data.name, 'nodes:', formatNum(d.value), ...displayFields(d)])
            .join("tspan")
            .attr('x', (d, i) => i > 2 ? 0 : 0)
            .attr('dy', '1.0em')
            .attr("font-size", `13px`)
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .attr('fill', (d, i) => i > 2 ? 'crimson' : 'black')
            .text(d => d);

        const xax = scaleLinear()
            .domain([0, 10])
            .range([0, 50]);

        let d = root.children[0].depth;
        if (d === 4) {
            console.log(`printing`);

            node
                // .selectAll('g')
                // .insert('g', '*')
                .append('g')
                .classed('rectGroup', false)
                // .classed('axis', true)
                .attr('transform', d => {

                    x.domain([d.parent.x0, d.parent.x1]);
                    y.domain([d.parent.y0, d.parent.y1]);

                    // let xVal = x(d.parent.x1) - x(d.parent.x0);
                    // let yVal = y(d.parent.y1) - y(d.parent.y0);

                    // let xVal = x(d.x1) - x(d.x0);
                    // let yVal = y(d.y1) - y(d.y0);

                    let xVal = x(d.x0);
                    let yVal = y(d.y0);

                    // let xVal = d.x0 * 2 * width;
                    // let yVal = d.y0 * 2 * width;

                    console.log(`first: ${d.x0} ${d.y0} this sithe d:: parent: ${d.parent.x0} ${xVal} and ${yVal}`);
                    return `translate(${xVal},${yVal})`;
                    // return 'translate(50,50)';
                })
                .call(axisBottom(xax));
        }

        // ----------
        group.call(position, root, true);
    }

    function isFunction(functionToCheck) {
        return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }

    function position(group, root, drawAxis) {
        group
            .selectAll("g")
            .selectAll('.rectGroup')
            .attr("transform", d => {
                let xCoord = x(d.x0);
                let yCoord = y(d.y0);

                if (isNaN(xCoord) && isNaN(yCoord) && d !== root) {
                    console.log(`d ::: ${d}`);
                    // return `translate(${d * 10},100)`;
                }
                return d === root ? `translate(0,0)` : `translate(${xCoord},${yCoord})`;
            });

        // let d = root.children[0].depth;
        // if (d === 1 && drawAxis) {
        //     console.log(`printing`);
        //
        //     group.selectAll('g')
        //         // .insert('g', '*')
        //         .append('g')
        //         .classed('axis', true)
        //         .attr('transform', 'translate(20,120)')
        //         .call(axisBottom(xax));
        // }

        group.selectAll('g')
            // .selectAll('.rectGroup')
            .select("rect")
            .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
            .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0))

        // console.log(`running`);
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
