export type GameStatus = "ACTIVE" | "HIDDEN" | "MAINTENANCE";

export interface GameAttributeSchema {
    key: string;
    label: string;
    type: "text" | "number" | "select";
    options?: string[]; // for select type
}

export interface Game {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    banner?: string;
    thumbnail?: string;
    description?: string;
    theme_color?: string;
    sort_order: number;
    is_hot: boolean;
    status: GameStatus;
    attributes_schema?: GameAttributeSchema[];
    created_at: string;
    updated_at: string;
}

export interface GameCreateInput {
    name: string;
    slug: string;
    icon?: string;
    banner?: string;
    thumbnail?: string;
    description?: string;
    theme_color?: string;
    sort_order?: number;
    is_hot?: boolean;
    status?: GameStatus;
}

export interface GameUpdateInput extends Partial<GameCreateInput> {}
