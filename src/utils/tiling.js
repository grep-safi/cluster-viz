/**
 * This tiling function divides up the members of the tree into equally spaced tiles
 * @param parent
 * @param width
 * @param height
 */
export function equallySpacedTiling(parent, width, height) {
    let rows;
    let columns;

    // Cabinet view
    if (parent.children.length === 68) {
        rows = 6;
        columns = 12;
    }
    // Chassis view
    else if (parent.children.length === 3) {
        rows = 1;
        columns = 3;
    } else if (parent.children.length === 16) {
        rows = 4;
        columns = 4;
    } else if (parent.children.length === 4) {
        rows = 2;
        columns = 2;
    }

    let rowWidth = height / rows;
    let columnWidth = width / columns;

    let rowIndex = 0;
    let columnIndex = 0;

    for (const child of parent.children) {

        child.x0 = columnIndex * columnWidth;
        child.x1 = (columnIndex + 1) * columnWidth;

        child.y0 = (rows - rowIndex - 1) * rowWidth;
        child.y1 = (rows - rowIndex) * rowWidth;

        columnIndex += 1;
        if (columnIndex >= columns) {
            columnIndex = 0;
            rowIndex += 1;
        }
    }
}
