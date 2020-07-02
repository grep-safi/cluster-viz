export function equallySpacedTiling(parent, width, height, paddingTop) {
    let rows = 6;
    let columns = 12;

    if (parent.children.length === 3) {
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

        child.y0 = (rows - rowIndex - 1) * rowWidth - paddingTop;
        child.y1 = (rows - rowIndex) * rowWidth - paddingTop;

        columnIndex += 1;
        if (columnIndex >= columns) {
            columnIndex = 0;
            rowIndex += 1;
        }
    }
}
