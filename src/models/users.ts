export interface User {
    id: number;
    name: string;
    walletAddress: string;
    coins: number;
    role: number;
    email: string;
}

export enum UserRole {
    User,
    Label,
    SuperAdmin,
    Moderator,
    Blacklist,
}
