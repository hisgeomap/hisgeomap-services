export default class ConditionFormulaService {
    translate(conditions: string[]) {
        // const operators = [">", "<", ">=", "<=", "="];
        const regex = />=|<=|>|<|=/g;
        if (!conditions) {
            return conditions;
        }
        const results = conditions
            .map(condition => {
                let operator;
                const str = condition
                    .replace(regex, e => {
                        operator = e;
                        return "&";
                    })
                    .split("&");

                if (str.length !== 2) {
                    return;
                }

                const attr = str[0].trim();
                const cond = str[1].trim();

                switch (operator) {
                    case ">=":
                        return {
                            range: {
                                [attr]: {
                                    gte: cond
                                }
                            }
                        };
                    case "<=":
                        return {
                            range: {
                                [attr]: {
                                    lte: cond
                                }
                            }
                        };
                    case ">":
                        return {
                            range: {
                                [attr]: {
                                    ge: cond
                                }
                            }
                        };

                    case "<":
                        return {
                            range: {
                                [attr]: {
                                    le: cond
                                }
                            }
                        };
                    case "=":
                        return {
                            match_phrase: {
                                [attr]: cond
                            }
                        };
                }
            })
            .filter(Boolean);
        return results;
    }
}
