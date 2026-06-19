import { boolean } from "yup";

export interface SME {
    avatar_url: string | null;
    business_model: string | null;
    email: string;
    full_name: string | "";
    id: string;
    phone: string;
    sme_id: number;
    status: number;
    __typename: string;
}

export interface ContractType {
    id: number
    title: string
    description: string
    note?: string
    sme_id: number
    store_ids?: any
    status: number
    begin_at: string
    end_at: string
    created_at: string
    updated_at: string
}
export interface ShowDetailType {
    show: boolean,
    contract?: null | ContractType,
    isEditable?: boolean
}