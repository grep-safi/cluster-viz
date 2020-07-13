import { useState } from "react";

export default initialValues => {
    const [values, setValue] = useState(initialValues);

    return [
        values,
        // (e, i) => { setValue({ ...values, [e.target.name]: e.target.value }) }
        (e, i) => {
            setValue(values.map((item, index) => {
                    if (index === i) return { ...values[index], [e.target.name]: e.target.value };
                    return item[index];
                })
            );
        }
    ];
}
