import path from 'path';

import dotenv from 'dotenv';
import { getEnvVar } from '../app/helpers/getEnvVar';


dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
    app: {
        env: getEnvVar('NODE_ENV'),
        port: getEnvVar('PORT'),
        cors_origins: getEnvVar('CORS_ORIGINS').split(','),
    },
    admin: {
        email: getEnvVar('ADMIN_EMAIL'),
        password: getEnvVar('ADMIN_PASSWORD'),
    },
    jwt: {
        access_secret: getEnvVar('JWT_ACCESS_SECRET'),
        access_expires_in: getEnvVar('JWT_ACCESS_EXPIRES_IN'),
        refresh_secret: getEnvVar('JWT_REFRESH_SECRET'),
        refresh_expires_in: getEnvVar('JWT_REFRESH_EXPIRES_IN'),
        reset_pass_secret: getEnvVar('JWT_RESET_PASS_SECRET'),
        reset_pass_expires_in: getEnvVar('JWT_RESET_PASS_EXPIRES_IN'),
        bcrypt_salt_rounds: Number(getEnvVar('BCRYPT_SALT_ROUNDS')),
    },
    smtp: {
        host: getEnvVar('SMTP_HOST'),
        port: Number(getEnvVar('SMTP_PORT', '465')),
        secure: getEnvVar('SMTP_SECURE') === 'true',
        user: getEnvVar('SMTP_USER'),
        pass: getEnvVar('SMTP_PASS'),
        from: getEnvVar('SMTP_FROM'),
    },
};

export default config;


