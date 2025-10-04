import { Role, TokenType } from "@/constants";

export type TokenTypeValue = (typeof TokenType)[keyof typeof TokenType];
export type RoleType = (typeof Role)[keyof typeof Role];

export interface TokenPayload {
  userId: number;
  roleName: RoleType;
  tokenType: TokenTypeValue;
  exp: number;
  iat: number;
}
