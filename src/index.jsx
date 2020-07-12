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

    let shiftX = document.getElementById('data-viz').getBoundingClientRect().x;
    let shiftY = document.getElementById('data-viz').getBoundingClientRect().y;

    select('#data-viz').selectAll('*').remove();
    select('#div_template').selectAll('*').remove();
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

    let currentPosition = select("#currentPosition")
        .text("super califragilistic expialodocious")
        .attr("style", "color: gold");


    let group = svg.append("g")
        .call(render, tree(hData));

// console.log(`hdata maxcabinet: ${hData.maxCabinet}`);

    window.addEventListener('resize', reportWindowSize);

    function reportWindowSize() {
        console.log(`resizing`);

        shiftX = document.getElementById('data-viz').getBoundingClientRect().x;
        shiftY = document.getElementById('data-viz').getBoundingClientRect().y;
    }

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

        // create a tooltip
        let Tooltip = select("#div_template")
            .append("div")
            // .style("position", "absolute")
            .style("opacity", 0)
            .style("pointer-events", "none")
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        // Three functions that change the tooltip when user hover / move / leave a cell
        let mouseover = function(d) {
            const depth = d.depth - 1;
            let arr = ["cabinet", "chassis", "blade"];
            let txt = `# of active nodes in this ${arr[depth]} is: ${d.value}`;
            if (depth === 3) {
                txt = d.data.nodeData;
                txt = `Node Details <br> ${d.data.nodeData}`;
                if (!d.data.nodeData) txt = `This is a service node`;
            }

            x.domain([d.parent.x0, d.parent.x1]);
            y.domain([d.parent.y0, d.parent.y1]);

            let xPos = (mouse(this)[0]) + x(d.x0) + 10;
            let yPos = (mouse(this)[1]) + y(d.y0) + 10;

            Tooltip
                .style("opacity", 1)
                .html(txt)
                .style("left", xPos + "px")
                .style("top", yPos + "px");

        }
        let mousemove = function(d) {
            x.domain([d.parent.x0, d.parent.x1]);
            y.domain([d.parent.y0, d.parent.y1]);

            let xPos = (mouse(this)[0]) + x(d.x0) + 10;
            let yPos = (mouse(this)[1]) + y(d.y0) + 10;

            Tooltip
                .style("left", xPos + "px")
                .style("top", yPos + "px");
        }

        let mouseleave = function(d) {
            Tooltip
                .style("opacity", 0)
        }

        node
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // This returns the root nodes and child nodes and adds
        // a click event so that the user can zoom in and zoom out
        node.filter(d => d === root ? d.parent : d.children)
            .attr("cursor", "pointer")
            .on("click", d => {
                Tooltip.remove();
                return d === root ? zoomout(root) : zoomin(d);
            });

        currentPosition
            .text(name(root))
            .on("click", function() {
                Tooltip.remove();
                return name(root) !== 'Cori' ? zoomout(root) : null;
            });

        node.append("rect")
            .attr("fill", d => {
                // let arr = [13056, 192, 48, 4, 1];
                let arr = [13056, hData.maxCabinet, hData.maxChassis, hData.maxBlade, 1];
                let maxVal = arr[d.depth] + 2;
                const colorScale = scaleLog()
                    .domain([1, maxVal])
                    .range(['white', 'green']);

                return d === root ? "#fff" : `${colorScale(d.value + 1)}`;
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
            .data(d => [d.data.name])
            .join("tspan")
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .text(d => d);

        node.append("text")
            .attr("font-size", `13px`)
            .attr('transform', d => textPosition(d.data.name, d.depth, 25, 50))
            .selectAll("tspan")
            .data(d => [`nodes: \n ${formatNum(d.value)}`])
            .join("tspan")
            .attr("fill-opacity", 0.7)
            .attr("font-weight", "normal")
            .text(d => d);




        // node.append("text")
        //     .attr("font-weight", "bold")
        //     .attr("font-size", `13px`)
        //     .selectAll("tspan")
        //     .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g))
        //     .join("tspan")
        //     .attr("x", 3)
        //     .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.9 + 1.1 + i * 0.9}em`)
        //     .attr("fill-opacity", 0.7)
        //     .attr("font-weight", "normal")
        //     .text(d => d);
        //
        // node.append("text")
        //     .attr("font-size", `13px`)
        //     .selectAll("tspan")
        //     .data(d => (`nodes: ${formatNum(d.value)}`).split(/(?=[A-Z][^A-Z])/g))
        //     .join("tspan")
        //     .attr("x", 3)
        //     .attr("y", `4em`)
        //     .attr("fill-opacity", 0.7)
        //     .attr("font-weight", "normal")
        //     .text(d => d);

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
