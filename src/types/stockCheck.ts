
export type SortField =
    | "code"
    | "date"
    | "staff"
    | "totalItems"
    | "matched"
    | "diffItems"
    | "status"
    | "note";

export type SortOrder = "asc" | "desc" | "none";

export interface StockItem {
    code: string;
    name: string;
    category: string;
    unit: string;
    systemQty: number;
    realQty: number;
    note?: string;
}

export interface StockSession {
    id: string;
    code: string;
    date: string;
    staff: string;
    status: "draft" | "completed";
    note: string;
}

export interface NewCheckRow {
    id: number;
    code: string;
    name: string;
    lot: string;
    unit: string;
    systemQty: number;
    realQty: number;
    note: string;
}