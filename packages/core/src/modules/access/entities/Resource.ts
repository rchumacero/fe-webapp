export interface Resource {
    readonly id: string;
    readonly code: string;
    readonly description: string;
    readonly type: string;
    readonly name: string;
    readonly restricted: boolean;
    readonly endpoint: string;
    readonly resourceId: string;
    readonly moduleCode: string;
    readonly menuName: string;
    readonly menu: Menu;
    readonly menuId: string;
    readonly status: string;

}

export interface Menu {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly description: string;
    readonly app: App;
}

export interface App {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly description: string;
}

export interface ResourceDto {
    code: string;
    description: string;
    type: string;
    name: string;
    moduleCode: string;
    restricted: boolean;
    endpoint: string;
    resourceId: string;
    menuId: string;
}

export interface UpdateResourceDto extends ResourceDto { }
export interface CreateResourceDto extends ResourceDto { }