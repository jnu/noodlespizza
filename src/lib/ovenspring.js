
const TYPE_FLOUR = 'flour';
const TYPE_STARTER = 'starter';
const TYPE_OTHER = 'other'
const TYPE_WATER = 'water';

const KNOWN_TYPES = new Set([
    TYPE_FLOUR,
    TYPE_STARTER,
    TYPE_WATER,
]);


export class Ingredient {

    constructor({ name, type, percentage, hydration }) {
        this.name = name;
        this.type = this._inferType(type, name);
        this.percentage = percentage || 0.0;
        this.waterContent = this._inferWaterContent(hydration, this.type);
        this.flourContent = this._inferFlourContent(this.waterContent, this.type);
    }

    _inferType(type, name) {
        if (!type) {
            if (KNOWN_TYPES.has(name)) {
                return name;
            } else {
                return TYPE_OTHER;
            }
        } else {
            return type;
        }
    }

    _inferFlourContent(waterContent, type) {
        switch (type) {
            case TYPE_FLOUR:
                return 1.0;
            case TYPE_STARTER:
                return 1.0 - waterContent;
            default:
                return 0.0;
        }
    }

    _inferWaterContent(hydration, type) {
        if (hydration !== null && hydration !== undefined) {
            return hydration / (1.0 + hydration);
        }

        switch (type) {
            case TYPE_WATER:
                return 1.0;
            case TYPE_STARTER:
                console.warn('Inferring Starter hydration as 100%.');
                return 0.5;
            case TYPE_FLOUR:
                return 0.0;
            case TYPE_OTHER:
                return 0.0;
            default:
                return 0.0;
        }
    }

}


export class Formula {

    constructor(ingredients, strict, quiet) {
        strict = !!strict;
        quiet = !!quiet;

        const flours = [];
        const waters = [];

        this.ingredients = ingredients.map(ingredient => {
            const realIngredient = (ingredient instanceof Ingredient) ?
                ingredient :
                new Ingredient(ingredient);

            // Track certain ingredients by type for validation.
            if (realIngredient.type === TYPE_FLOUR) {
                flours.push(ingredient);
            }

            if (realIngredient.type === TYPE_WATER) {
                waters.push(ingredient);
            }

            return realIngredient;
        });

        // Sanity checks
        if (!quiet) {
            // Check that there is flour at all.
            if (!flours.length) {
                if (strict) {
                    throw new Error('Formula contains no flour.');
                } else {
                    console.warn(`\
Formula contains no flour. Baker's math specifies ingredients \
relative to the amount of flour used.`);
                }
            }

            // Check that flour weight makes sense.
            const totalFlourPct = flours.reduce((sum, flour) => {
                return sum + flour.percentage;
            }, 0);

            if (Math.round(totalFlourPct) !== 1) {
                if (strict) {
                    throw new Error('Flour weight(s) do not add up to 100%.');
                } else {
                    console.warn(`\
Flour weights in this formula add up to ${Math.round(totalFlourPct * 100)}%, \
not 100%. The flour weight in a formula should always be 100%.`);
                }
            }

            if (waters.length !== 1) {
                if (strict) {
                    throw new Error('Expected exactly one water.');
                } else {
                    console.warn(`\
Formula contains ${waters.length} water(s). We expect formulas to contain \
exactly one water ingredient. The hydration computations may not work for \
this formula.`);
                }
            }
        }

        this._updateDenominator();
    }

    _updateDenominator() {
        // Compute denominator. This is the sum of the baker's percentages,
        // which can be used to convert to real math.
        this.denominator = this.ingredients.reduce((sum, ingredient) => {
            return sum + ingredient.percentage;
        }, 0);
    }

    hydration() {
        const { denominator, ingredients } = this;
        let waterAmount = 0.0;
        let flourAmount = 0.0;

        // Total hydration is the baker's percentage of water content to dry
        // ingredients. Water content comes not only from water, but other
        // liquid ingredients (like milk).
        ingredients.forEach(({ name, percentage, waterContent, flourContent }) => {
            const unitAmount = percentage / denominator;
            waterAmount += unitAmount * waterContent;
            flourAmount += unitAmount * flourContent;
        });

        return waterAmount / flourAmount;
    }

    /**
     * Adjust relative flour and water amounts so that final formula has the
     * target hydration. This will adjust all of the percentages in the formula
     * (since the flour weight is changing).
     * @param {Number} h - target hydration, as a baker's percentage (decimal)
     */
    setHydration(h) {
        const { ingredients, denominator } = this;

        // Compute weights of formula without considering water.
        let fixedWaterWeight = 0.0;
        let fixedFlourWeight = 0.0;
        let waterIndex = -1;

        ingredients.forEach((ingredient, i) => {
            // Skip adding water
            if (ingredient.type === TYPE_WATER) {
                waterIndex = i;
                return;
            }
            const unitWeight = ingredient.percentage
            const unitWetWeight = ingredient.waterContent * unitWeight;
            const unitDryWeight = ingredient.flourContent * unitWeight;

            fixedWaterWeight += unitWetWeight;
            fixedFlourWeight += unitDryWeight;
        });

        // Compute the missing water weight to achieve desired hydration.
        // Cannot be negative. (Or can it ... ? Put the dough in the microwave!)
        const missingWaterWeight = Math.max(0, h * fixedFlourWeight - fixedWaterWeight);

        // Update the water ingredient with this weight.
        let waterIngredient = ingredients[waterIndex];

        // Add water ingredient if it was missing (though validation should
        // have caught this).
        if (!waterIngredient) {
            waterIngredient = ingredients.push(new Ingredient({
                name: 'water',
                type: TYPE_WATER
            }));
        }

        waterIngredient.percentage = missingWaterWeight;

        // Update total weight.
        this._updateDenominator();
    }

    /**
     * Get the real weights of ingredients needed to make the dough.
     * @param  {Number} total - Final weight of dough to produce
     * @return {{ name: string, weight: number }[]}
     */
    weights(total) {
        const { denominator } = this;
        if (!total) {
            total = 1;
        }

        return this.ingredients.map(ingredient => ({
            name: ingredient.name,
            weight: ingredient.percentage / denominator * total
        }));
    }

}
