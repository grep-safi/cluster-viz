import { interpolate, scaleLinear, scaleOrdinal, scaleLog, format, schemeCategory10, rgb, select, treemap,
    hierarchy, mouse, event} from "d3/dist/d3";
import { equallySpacedTiling } from "./utils/tiling";

export default hData => {
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
        .text("super califragilistic expialodocious")
        .attr("style", "color: gold");

    const group = svg.append("g")
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
            .text(name(root))
            .on("click", () => name(root) !== 'Cori' ? zoomout(root) : null);

        node.append("rect")
            .attr("fill", d => {
                // This function will fill the rect based on the node value and the maximum node value possible
                // Uses logarithmic scaling

                // const maxValuesArray = [192, 64, 4, 1]
                const maxValuesArray = [hData.maxCabinet, hData.maxChassis, hData.maxBlade, 1];
                const depth = d.depth - 1;
                let maxVal = maxValuesArray[depth] === 0 ? 2 : maxValuesArray[depth] + 1;
                const colorScale = scaleLog()
                    .domain([1, maxVal])
                    .range(['white', 'lightseagreen']);

                const nodeValue = d.value === 0 ? 1 : d.value + 1;
                return d === root ? "#fff" : `${colorScale(nodeValue)}`;

                // Code for linear scaling

                // const maxValuesArray = [hData.maxCabinet, hData.maxChassis, hData.maxBlade, 1];
                // const depth = d.depth - 1;
                // let maxVal = maxValuesArray[depth] === 0 ? 1 : maxValuesArray[depth];
                // const colorScale = scaleLinear()
                //     .domain([0, maxVal])
                //     .range(['white', 'lightseagreen']);
                //
                // const nodeValue = d.value;
                // return d === root ? "#fff" : `${colorScale(nodeValue)}`;
            })
            .attr("stroke", "gold");

        const textPosition = (text, depth, xShift, y) => {
            const widths = [width / 24, width / 6, width / 8, width / 4];
            const textWidth = Number(text.split(' ')[1]) > 9 ? (xShift + 2) : xShift;
            const x = widths[depth - 1] - textWidth;

            return `translate(${x},${y})`;
        }

        node.append("text")
            .attr("font-weight", "bold")
            .attr("font-size", `13px`)
            .attr('transform', d => textPosition(d.data.name, d.depth, 25, 15))
            .selectAll("tspan")
            // .data(d => [d.data.name, `nodes: ${formatNum(d.value)}`])
            .data(d => [d.data.name, 'nodes:', formatNum(d.value)])
            .join("tspan")
            // .attr('x', '0')
            .attr('x', (d, i) => i === 0 ? 0 : 1)
            .attr('dy', '1.0em')
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .text(d => d);

        const displayFields = d => {
            if (d.depth !== 4 || !d.data.nodeData) return [''];
            return [d.data.nodeData['NodeName']];

            // let arr = d.data.nodeData.split('<br />');
            // if (arr.length > 25) return arr.splice(0, 26);
            // return '';
        }

        node.append("text")
            .attr("font-weight", "bold")
            .attr("font-size", `13px`)
            .attr('transform', 'translate(10, 50)')
            .selectAll("tspan")
            .data(d => displayFields(d))
            .join("tspan")
            .attr('x', '0')
            .attr('dy', '1.0em')
            .attr('fill', 'crimson')
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
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
}
