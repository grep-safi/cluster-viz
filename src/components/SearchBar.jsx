import React, {useEffect} from "react";

export default (props) => {
    useEffect(() => {
        // Get options element
        const optionsElement = document.getElementById(props.optionsID);
        // Get the names of options
        const options = props.options;

        // Clear options array so it has no values
        optionsElement.length = 0;

        // Add each option to the options element
        for (let i = 0; i < options.length; i++) {
            optionsElement.options[optionsElement.length] = new Option(options[i], options[i]);
        }
    }, []);

    return (
        <>
            <select
                className="sel-light"
                id={props.optionsID}
                name="option"
                onChange={e => props.handleChange(e, props.index)}
                value={props.searchField.option}
            />

            <input
                id={props.searchID}
                name="input"
                value={props.searchField.input}
                onChange={e => props.handleChange(e, props.index)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        props.handleEnter(c => c + 1);
                    }
                }}
            />
        </>
    );
}
