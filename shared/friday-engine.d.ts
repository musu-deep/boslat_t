export interface Draft { title:string; report:string; expansion:string; duality:string; movement:string; impact:string }
export function inspect(title:string,content:string,axis:string):string[];
export function validate(d:unknown):string[];
export function render(d:Draft,axis:string):string;
