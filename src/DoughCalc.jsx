import React from 'react';
import { Formula } from './lib/ovenspring';


export default class DoughCalc extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            targetWeight: 1200.0,
            hydration: 0.7,
            starterRatio: 0.25,
            ingredients: [
                { name: 'salt', percentage: 0.02 },
                { name: 'flour', percentage: 1.0 },
                { name: 'water', percentage: 0.7 },
                { name: 'starter', percentage: 0.25, hydration: 1.0 },
            ],
        };
    }

    handleNumberStateChange(param, e) {
        const newVal = parseFloat(e.target.value || 0);
        this.setState({ [param]: isNaN(newVal) ? 0 : newVal });
    }

    render() {
        const s = this.state;
        const formula = new Formula(s.ingredients);
        formula.setHydration(s.hydration);
        const amounts = formula.weights(s.targetWeight);

        return (
            <div>
                <h1>Rough Formula</h1>
                {s.ingredients.map(ingredient =>
                    <div key={ingredient.name}>
                        <span>{ingredient.name}</span>:
                        <span><input type="text"
                                     value={ingredient.percentage}
                                     onChange={v => this.handleNumberStateChange(ingredient.name, v)} />
                        </span>
                    </div>
                )}
                <h1>Bake params</h1>
                <div>
                    <span>Target Weight</span>:
                    <span><input type="text"
                                 value={s.targetWeight}
                                 onChange={v => this.handleNumberStateChange('targetWeight', v)} />
                    </span>
                </div>
                <div>
                    <span>Target Hydration</span>:
                    <span><input type="text"
                                 value={s.hydration}
                                 onChange={v => this.handleNumberStateChange('hydration', v)} />
                    </span>
                </div>
                <h1>Weights</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Ingredient</th>
                            <th>Weight (g)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {amounts.map(amount =>
                            <tr key={amount.name}>
                                <td>{amount.name}</td>
                                <td>{Math.round(amount.weight)}</td>
                            </tr>)}
                    </tbody>
                </table>
                <div>
                    <span>Hydration</span>:
                    <span>{Math.round(100 * formula.hydration())}%</span>
                </div>
            </div>
        );
    }

}
