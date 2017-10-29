import React from 'react';


const formElementStyle = {
    border: 'thin solid #999',
    padding: '0.1rem 0.5rem',
};

const labelStyle = {
    display: 'block',
    padding: 0,
    margin: 0,
    fontSize: '0.8rem',
};

export const formElementInputStyle = {
    display: 'block',
    width: '100%',
    border: 0,
    lineHeight: '2rem',
    fontSize: '1.5rem',
};


export class FormElement extends React.Component {

    render() {
        const p = this.props;
        return (
            <div className="FormElement" style={formElementStyle}>
                <label htmlFor={p.name} style={labelStyle}>
                    {p.label}
                </label>
                <div className="FormElementInput" style={formElementInputStyle}>
                    {p.children}
                </div>
            </div>
        );
    }

}


export class TextInput extends React.Component {
    render() {
        const p = this.props;
        const inputProps = Object.assign({}, p);
        delete inputProps.label;
        delete inputProps.key;
        return (
            <FormElement name={p.name} label={p.label} key={p.key}>
                <input {...inputProps}
                       type="text"
                       name={p.name}
                       style={formElementInputStyle} />
            </FormElement>
        )
    }
}
