import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database/index'

let connection: Connection
describe('Authenticate User', () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
        
        const id = uuid();
        const password = await hash('senha', 8);
    
        await connection.query(
              `INSERT INTO USERS(id, name, email, password, created_at, updated_at) 
              VALUES('${id}','teste','teste@teste.com', '${password}', 'now()', 'now()')`
        );
    })

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    })

    it('should be able to authenticate a user',async () => {
        const response = await request(app).post('/api/v1/sessions').send({
            email: 'teste@teste.com',
            password: 'senha'
        });

        expect(response.body).toHaveProperty('token');
    });

    it('should not be able to authenticate a user with incorrect credentials',async () => {
        const response = await request(app).post('/api/v1/sessions').send({
            email: 'teste@teste.com',
            password: 'senhaIncorreta'
        });

        expect(response.status).toBe(401);  
    })

    it('should not be able to authenticate a not signed user',async () => {
        const response = await request(app).post('/api/v1/sessions').send({
            email: 'naoé@user.com',
            password: 'senha'
        });

        expect(response.status).toBe(401);  
    })
})