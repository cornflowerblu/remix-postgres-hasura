import type { User } from "~/models/user.server";
import { getAWSSecretsConfig } from '../app/utils'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import jwt from 'jsonwebtoken'


export async function SignJWT({ userId, role }: { userId: User["id"]; role: User["role"]; }): Promise<String> {

    const config = getAWSSecretsConfig();  

    const client = new SecretsManagerClient(config);
    const command = new GetSecretValueCommand({SecretId: 'jwt_private_key'});
    const response = await client.send(command);
    
    const token = jwt.sign({
        "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": [ "user", "admin"],
        "x-hasura-default-role": role,
        "x-hasura-user-id": userId }
    }, response.SecretString as string, { algorithm: 'RS256', expiresIn: "1d" });
    
    return token;
}