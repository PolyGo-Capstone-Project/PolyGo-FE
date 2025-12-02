import { Role, TokenType } from "@/constants";

export type TokenTypeValue = (typeof TokenType)[keyof typeof TokenType];
export type RoleType = (typeof Role)[keyof typeof Role];

export interface TokenPayload {
  Id: string;
  Role: RoleType;
  Mail: string;
  IsNew: boolean;
  Merit: string;
  NextUnbannedAt: string;
  exp: number;
}
