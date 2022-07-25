import type { User } from "~/models/user.server";
import { getAWSSecretsConfig } from '../app/utils'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import jwt from 'jsonwebtoken'
import invariant from "tiny-invariant";


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

export function ValidateJWT(token: string): Boolean {
    const publicKey = process.env.JWT_SECRET
    invariant(publicKey, "JWT Secret not set.");

    jwt.verify(token, publicKey, (err, payload) => {
        if (err) {
            console.log('ERROR: ', err);
            return false
        }
        
    console.log('JWT is valid and payload is\n', payload);
    });

    return true
}