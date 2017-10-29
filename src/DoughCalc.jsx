import React from 'react';
import { Formula, Ingredient, TYPE_FLOUR, TYPE_WATER } from './lib/ovenspring';
import { TextInput } from './FormElement';


class Subscribable {

    constructor() {
        this._subscriptions = new Set();
    }

    subscribe(f) {
        const subscription = {
            callback: f,
            unsubscribe: () => this._subscriptions.delete(subscription)
        };
        this._subscriptions.add(subscription);
        return subscription;
    }

    notify(value) {
        for (let subscription of this._subscriptions) {
            subscription.callback(value);
        }
    }

}

class Model extends Subscribable {

    constructor(initialState) {
        super();
        this.setState(initialState);
    }

    getState() {
        return Object.assign({}, this._state);
    }

    setState(newState) {
        this._state = Object.assign({}, newState);
        this.notify(this.getState());
    }

}

function randomUniqueID(prefix, div) {
    const ts = Date.now();
    const rand = ['m', 's', 'r', 'g'].map(c => `${c}${Math.round(Math.random() * 1e4)}`);
    return [prefix || '', `t${ts}`, rand.join('')].join(div || '-');
}

class DoughModel extends Model {

    constructor(initialState) {
        initialState.ingredients = initialState.ingredients.map(ing =>{
            const fullIngredient = new Ingredient(ing);
            return Object.assign({}, ing, {
                name: fullIngredient.name,
                type: fullIngredient.type,
                percentage: fullIngredient.percentage,
                hydration: fullIngredient.hydration,
            });
        });
        super(initialState);
    }

    addIngredient(name, type, percentage, hydration) {
        const newState = this.getState();
        const ingredients = newState.ingredients.slice();
        const ingredient = new Ingredient({
            name,
            type,
            percentage,
            hydration,
        });
        ingredients.push({
            id: randomUniqueID('addedIngredient'),
            name: ingredient.name,
            type: ingredient.type,
            percentage: ingredient.percentage,
            hydration: ingredient.hydration,
        });
        newState.ingredients = ingredients;
        this.setState(newState)
    }

    updateIngredient(id, percentage, hydration) {
        const newState = this.getState();
        const index = newState.ingredients.findIndex(x => x.id === id);
        if (index === -1) {
            throw new Error(`No such ingredient: ${id}`);
        }
        const ingredient = newState.ingredients[index];
        ingredient.percentage = percentage;
        if (hydration !== undefined) {
            ingredient.hydration = hydration;
        }
        this.setState(newState);
    }

    deleteIngredient(id) {
        const newState = this.getState();
        const ingredients = newState.ingredients.filter(x => x.id !== id);
        newState.ingredients = ingredients;
        this.setState(newState);
    }

    updateValue(param, newValue) {
        const newState = this.getState();
        newState[param] = newValue;
        this.setState(newState);
    }

}


const doughModel = new DoughModel({
    targetWeight: 1200.0,
    hydration: 0.7,
    starterRatio: 0.25,
    ingredients: [
        { id: 'salt', name: 'salt', percentage: 0.02 },
        { id: 'flour', name: 'flour', percentage: 1.0 },
        { id: 'water', name: 'water', percentage: 0.7 },
        { id: 'starter', name: 'starter', percentage: 0.25, hydration: 1.0 },
    ],
});

global.doughModel = doughModel;


class FormulaVizIngredient extends React.Component {

    render() {
        const p = this.props;
        const textSize = 16;
        const markerHeight = p.height - textSize;
        const markerWidth = `${p.percentage * 100}%`;
        const outerContainerStyle = {
            width: '100%',
            padding: 10,
        };
        const innerContainerStyle = {
            width: '100%',
            height: p.height,
            position: 'relative',
            display: 'flex',
        };
        const markerContainerStyle = {
            display: 'flex',
            flexBasis: '66%',
            position: 'relative',
        };
        const markerStyle = {
            width: markerWidth,
            backgroundColor: '#900',
            height: markerHeight,
        };
        const textContainerStyle = {
            lineHeight: `${textSize}px`,
            fontSize: `${textSize}px`,
            display: 'flex',
            flexBasis: '33%',
            position: 'relative',
        };
        const percentageStyle = {
            position: 'absolute',
            right: 10,
        };
        const hydrationStyle = {
            display: 'block',
        };
        const handleStyle = {
            backgroundColor: '#eee',
            width: markerHeight,
            height: markerHeight,
            borderRadius: 100,
            position: 'absolute',
            top: 0,
            left: `calc(${markerWidth} - ${markerHeight / 2}px)`,
            cursor: 'pointer',
        };
        return (
            <div style={outerContainerStyle} className="FormulaVizIngredient">
                <div style={innerContainerStyle}>
                    <div className="FormulaVizIngredient-text" style={textContainerStyle}>
                        <div>{ p.name }</div>
                        <div style={percentageStyle}>{ Math.round(p.percentage * 100) }%</div>
                    </div>
                    <div className="FormulaVizIngredient-amount" style={markerContainerStyle}>
                        <div className="FormulaVizIngredient-amount" style={markerStyle}></div>
                        { p.editable ? <div className="FormulaVizIngredient-amount-handle" style={handleStyle} onMouseDown={e => this.startDrag(e)} /> : null}
                    </div>
                </div>
            </div>
        );
    }

    startDrag(e) {
        const parent = e.target.parentElement;
        const parentRect = parent.getBoundingClientRect();
        const origin = {
            x: e.clientX,
            y: e.clientY,
        };
        const bounds = [parentRect.left, parentRect.right];
        const width = parentRect.width;
        const moveHandler = e => {
            // Constrain to bar container bounds
            const xPos = Math.max(bounds[0], Math.min(e.clientX, bounds[1]));
            // Compute new percentage
            const newPct = (xPos - bounds[0]) / width;
            if (this.props.onChange) {
                // Round to two places
                this.props.onChange(Math.round(newPct * 100) / 100);
            }
        };
        const dragEndHandler = e => {
            // Clean up event handlers
            document.body.removeEventListener('mousemove', moveHandler);
            document.body.removeEventListener('mouseup', dragEndHandler);
        };
        document.body.addEventListener('mousemove', moveHandler);
        document.body.addEventListener('mouseup', dragEndHandler)
    }
}


class FormulaViz extends React.Component {

    render() {
        const {
            ingredients,
        } = this.props;
        const flours = [];
        const water = [];
        const nonFlours = [];

        ingredients.forEach(ingredient => {
            console.log(ingredient.type, TYPE_FLOUR)
            const array = (ingredient.type === TYPE_FLOUR) ?
                flours :
                (ingredient.type === TYPE_WATER) ?
                    water :
                    nonFlours;
            array.push(ingredient);
        });

        let flourStart = 0;
        return (
            <div className="Formula" style={{ userSelect: 'none' }}>
                {flours.map(ingredient => {
                    const el = <FormulaVizIngredient {...ingredient}
                                                     startAt={flourStart}
                                                     height={30}
                                                     key={ingredient.id} />
                    flourStart += ingredient.percentage;
                    return el;
                })}
                {nonFlours.map(ingredient =>
                    <FormulaVizIngredient {...ingredient}
                                          height={30}
                                          key={ingredient.id}
                                          editable={true}
                                          onChange={pct => this.props.onChange(ingredient.id, pct)} />
                )}
                {water.map(ingredient =>
                    <FormulaVizIngredient {...ingredient}
                                          height={30}
                                          key={ingredient.id}
                                          editable={true}
                                          onChange={pct => this.props.onChange(ingredient.id, pct)} />)}
            </div>
        );
    }
};


const Title = ({ children }) => <h1 style={{ textAlign: 'center' }}>{children}</h1>;


export default class DoughCalc extends React.Component {

    constructor(props) {
        super(props);
        this.state = doughModel.getState();
        this.subscription = doughModel.subscribe(newState => this.setState(newState));
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    handleNumberStateChange(param, e) {
        const newVal = e.target.value ? parseFloat(e.target.value) : '';
        doughModel.updateValue(param, newVal);
    }

    render() {
        const s = this.state;
        const formula = new Formula(s.ingredients);
        const amounts = formula.weights(s.targetWeight || 0);

        const flours = formula.ingredients.filter(x => x.type === TYPE_FLOUR);

        return (
            <div>
                <Title>Formula</Title>
                    <div className="FormulaBuilder">
                        <div>
                            <FormulaViz ingredients={s.ingredients}
                                        onChange={(id, pct, hyd) => doughModel.updateIngredient(id, pct, hyd)} />
                            <div>
                                <span>Total Hydration</span>:
                                <span>{Math.round(100 * formula.hydration())}%</span>
                            </div>
                        </div>
                    </div>
                <Title>Recipe</Title>
                <div>
                    <label htmlFor="targetWeight">How much dough are you making? (g)</label>
                    <input type="number"
                           name="targetWeight"
                           value={s.targetWeight}
                           onChange={v => this.handleNumberStateChange('targetWeight', v)} />
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Ingredient</th>
                            <th>Weight (g)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {amounts.map((amount, i) =>
                            <tr key={`${i}-${amount.name}`}>
                                <td>{amount.name}</td>
                                <td>{Math.round(amount.weight)}</td>
                            </tr>)}
                    </tbody>
                </table>
            </div>
        );
    }

}
