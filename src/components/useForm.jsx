import { useState } from "react";

export default initialValues => {
    const [values, setValue] = useState(initialValues);

    /**
     *
     * @param e            {string, Object} - If addSearch is true, this is a string specifying the option value.
     *                                        Otherwise it's an object passed from onChange
     * @param i            {Number}         - Index of the element in the array to be modified or deleted
     * @param addSearch    {boolean}        - Tells function to add a new object to the array
     * @param removeSearch {boolean}        - Tells function to remove a specified element in the array
     *
     */
    const handleChanges = (e, i, addSearch, removeSearch) => {
        // React's setValue will only trigger a re-render if it detects
        // a new object, that's why we're using the spread operator.
        // Don't remove it.

        if (addSearch) {
            setValue( [...values, {input: "", option: e}]);
        }
        else if (removeSearch) {
            values.splice(i, 1);
            setValue([...values]);
        }
        else {
            setValue(values.map((item, index) => {
                if (index === i) return { ...values[index], [e.target.name]: e.target.value };
                return item;
            }));
        }
    }

    return [
        values,
        handleChanges
    ];
}
