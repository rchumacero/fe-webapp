import { Option } from "./types";

export const getParamLabel = (options: Option[], code: string): string => {
    const item = options.find(i => i.code === code);
    return item ? item.label : code;
};

export const getParamCode = (options: Option[], label: string): string => {
    const item = options.find(i => i.label === label);
    return item ? item.code : label;
};